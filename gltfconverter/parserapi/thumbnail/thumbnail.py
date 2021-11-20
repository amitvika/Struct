import os, sys, re, copy, abc, six

import trimesh

from OpenGL.GL import *
from OpenGL.GL import shaders

import PIL as Image
import numpy as np
import networkx as nx
import pyglet

@six.add_metaclass(abc.ABCMeta)
class Platform(object):
    """Base class for all OpenGL platforms.

    Parameters
    ----------
    viewport_width : int
        The width of the main viewport, in pixels.
    viewport_height : int
        The height of the main viewport, in pixels
    """

    def __init__(self, viewport_width, viewport_height):
        self.viewport_width = viewport_width
        self.viewport_height = viewport_height

    @property
    def viewport_width(self):
        """int : The width of the main viewport, in pixels.
        """
        return self._viewport_width

    @viewport_width.setter
    def viewport_width(self, value):
        self._viewport_width = value

    @property
    def viewport_height(self):
        """int : The height of the main viewport, in pixels.
        """
        return self._viewport_height

    @viewport_height.setter
    def viewport_height(self, value):
        self._viewport_height = value

    @abc.abstractmethod
    def init_context(self):
        """Create an OpenGL context.
        """
        pass

    @abc.abstractmethod
    def make_current(self):
        """Make the OpenGL context current.
        """
        pass

    @abc.abstractmethod
    def make_uncurrent(self):
        """Make the OpenGL context uncurrent.
        """
        pass

    @abc.abstractmethod
    def delete_context(self):
        """Delete the OpenGL context.
        """
        pass

    @abc.abstractmethod
    def supports_framebuffers(self):
        """Returns True if the method supports framebuffer rendering.
        """
        pass

    def __del__(self):
        try:
            self.delete_context()
        except Exception:
            pass
        
DEFAULT_Z_NEAR = 0.05     # Near clipping plane, in meters
DEFAULT_Z_FAR = 100.0     # Far clipping plane, in meters
DEFAULT_SCENE_SCALE = 2.0 # Default scene scale
MAX_N_LIGHTS = 4          # Maximum number of lights of each type allowed
TARGET_OPEN_GL_MAJOR = 4  # Target OpenGL Major Version
TARGET_OPEN_GL_MINOR = 1  # Target OpenGL Minor Version
MIN_OPEN_GL_MAJOR = 3     # Minimum OpenGL Major Version
MIN_OPEN_GL_MINOR = 3     # Minimum OpenGL Minor Version
FLOAT_SZ = 4              # Byte size of GL float32
UINT_SZ = 4               # Byte size of GL uint32
SHADOW_TEX_SZ = 2048      # Width and Height of Shadow Textures
TEXT_PADDING = 20         # Width of padding for rendering text (px)

# Flags for render type
class RenderFlags(object):
    """Flags for rendering in the scene.

    Combine them with the bitwise or. For example,

    >>> flags = OFFSCREEN | SHADOWS_DIRECTIONAL | VERTEX_NORMALS

    would result in an offscreen render with directional shadows and
    vertex normals enabled.
    """
    NONE = 0
    """Normal PBR Render."""
    DEPTH_ONLY = 1
    """Only render the depth buffer."""
    OFFSCREEN = 2
    """Render offscreen and return the depth and (optionally) color buffers."""
    FLIP_WIREFRAME = 4
    """Invert the status of wireframe rendering for each mesh."""
    ALL_WIREFRAME = 8
    """Render all meshes as wireframes."""
    ALL_SOLID = 16
    """Render all meshes as solids."""
    SHADOWS_DIRECTIONAL = 32
    """Render shadows for directional lights."""
    SHADOWS_POINT = 64
    """Render shadows for point lights."""
    SHADOWS_SPOT = 128
    """Render shadows for spot lights."""
    SHADOWS_ALL = 32 | 64 | 128
    """Render shadows for all lights."""
    VERTEX_NORMALS = 256
    """Render vertex normals."""
    FACE_NORMALS = 512
    """Render face normals."""
    SKIP_CULL_FACES = 1024
    """Do not cull back faces."""
    RGBA = 2048
    """Render the color buffer with the alpha channel enabled."""
    FLAT = 4096
    """Render the color buffer flat, with no lighting computations."""
    SEG = 8192


class TextAlign:
    """Text alignment options for captions.

    Only use one at a time.
    """
    CENTER = 0
    """Center the text by width and height."""
    CENTER_LEFT = 1
    """Center the text by height and left-align it."""
    CENTER_RIGHT = 2
    """Center the text by height and right-align it."""
    BOTTOM_LEFT = 3
    """Put the text in the bottom-left corner."""
    BOTTOM_RIGHT = 4
    """Put the text in the bottom-right corner."""
    BOTTOM_CENTER = 5
    """Center the text by width and fix it to the bottom."""
    TOP_LEFT = 6
    """Put the text in the top-left corner."""
    TOP_RIGHT = 7
    """Put the text in the top-right corner."""
    TOP_CENTER = 8
    """Center the text by width and fix it to the top."""


class GLTF(object):
    """Options for GL objects."""
    NEAREST = 9728
    """Nearest neighbor interpolation."""
    LINEAR = 9729
    """Linear interpolation."""
    NEAREST_MIPMAP_NEAREST = 9984
    """Nearest mipmapping."""
    LINEAR_MIPMAP_NEAREST = 9985
    """Linear mipmapping."""
    NEAREST_MIPMAP_LINEAR = 9986
    """Nearest mipmapping."""
    LINEAR_MIPMAP_LINEAR = 9987
    """Linear mipmapping."""
    CLAMP_TO_EDGE = 33071
    """Clamp to the edge of the texture."""
    MIRRORED_REPEAT = 33648
    """Mirror the texture."""
    REPEAT = 10497
    """Repeat the texture."""
    POINTS = 0
    """Render as points."""
    LINES = 1
    """Render as lines."""
    LINE_LOOP = 2
    """Render as a line loop."""
    LINE_STRIP = 3
    """Render as a line strip."""
    TRIANGLES = 4
    """Render as triangles."""
    TRIANGLE_STRIP = 5
    """Render as a triangle strip."""
    TRIANGLE_FAN = 6
    """Render as a triangle fan."""


class BufFlags(object):
    POSITION = 0
    NORMAL = 1
    TANGENT = 2
    TEXCOORD_0 = 4
    TEXCOORD_1 = 8
    COLOR_0 = 16
    JOINTS_0 = 32
    WEIGHTS_0 = 64


class TexFlags(object):
    NONE = 0
    NORMAL = 1
    OCCLUSION = 2
    EMISSIVE = 4
    BASE_COLOR = 8
    METALLIC_ROUGHNESS = 16
    DIFFUSE = 32
    SPECULAR_GLOSSINESS = 64


class ProgramFlags:
    NONE = 0
    USE_MATERIAL = 1
    VERTEX_NORMALS = 2
    FACE_NORMALS = 4


def format_color_vector(value, length):
    """Format a color vector.
    """
    if isinstance(value, int):
        value = value / 255.0
    if isinstance(value, float):
        value = np.repeat(value, length)
    if isinstance(value, list) or isinstance(value, tuple):
        value = np.array(value)
    if isinstance(value, np.ndarray):
        value = value.squeeze()
        if np.issubdtype(value.dtype, np.integer):
            value = (value / 255.0).astype(np.float32)
        if value.ndim != 1:
            raise ValueError('Format vector takes only 1-D vectors')
        if length > value.shape[0]:
            value = np.hstack((value, np.ones(length - value.shape[0])))
        elif length < value.shape[0]:
            value = value[:length]
    else:
        raise ValueError('Invalid vector data type')

    return value.squeeze().astype(np.float32)


def format_color_array(value, shape):
    """Format an array of colors.
    """
    # Convert uint8 to floating
    value = np.asanyarray(value)
    if np.issubdtype(value.dtype, np.integer):
        value = (value / 255.0).astype(np.float32)

    # Match up shapes
    if value.ndim == 1:
        value = np.tile(value, (shape[0],1))
    if value.shape[1] < shape[1]:
        nc = shape[1] - value.shape[1]
        value = np.column_stack((value, np.ones((value.shape[0], nc))))
    elif value.shape[1] > shape[1]:
        value = value[:,:shape[1]]
    return value.astype(np.float32)


def format_texture_source(texture, target_channels='RGB'):
    """Format a texture as a float32 np array.
    """

    # Pass through None
    if texture is None:
        return None

    # Convert PIL images into numpy arrays
    if isinstance(texture, Image.Image):
        if texture.mode == 'P' and target_channels in ('RGB', 'RGBA'):
            texture = np.array(texture.convert(target_channels))
        else:
            texture = np.array(texture)

    # Format numpy arrays
    if isinstance(texture, np.ndarray):
        if np.issubdtype(texture.dtype, np.floating):
            texture = np.array(texture * 255.0, dtype=np.uint8)
        elif np.issubdtype(texture.dtype, np.integer):
            texture = texture.astype(np.uint8)
        else:
            raise TypeError('Invalid type {} for texture'.format(
                type(texture)
            ))

        # Format array by picking out correct texture channels or padding
        if texture.ndim == 2:
            texture = texture[:,:,np.newaxis]
        if target_channels == 'R':
            texture = texture[:,:,0]
            texture = texture.squeeze()
        elif target_channels == 'RG':
            if texture.shape[2] == 1:
                texture = np.repeat(texture, 2, axis=2)
            else:
                texture = texture[:,:,(0,1)]
        elif target_channels == 'GB':
            if texture.shape[2] == 1:
                texture = np.repeat(texture, 2, axis=2)
            elif texture.shape[2] > 2:
                texture = texture[:,:,(1,2)]
        elif target_channels == 'RGB':
            if texture.shape[2] == 1:
                texture = np.repeat(texture, 3, axis=2)
            elif texture.shape[2] == 2:
                raise ValueError('Cannot reformat 2-channel texture into RGB')
            else:
                texture = texture[:,:,(0,1,2)]
        elif target_channels == 'RGBA':
            if texture.shape[2] == 1:
                texture = np.repeat(texture, 4, axis=2)
                texture[:,:,3] = 255
            elif texture.shape[2] == 2:
                raise ValueError('Cannot reformat 2-channel texture into RGBA')
            elif texture.shape[2] == 3:
                tx = np.empty((texture.shape[0], texture.shape[1], 4), dtype=np.uint8)
                tx[:,:,:3] = texture
                tx[:,:,3] = 255
                texture = tx
        else:
            raise ValueError('Invalid texture channel specification: {}'
                             .format(target_channels))
    else:
        raise TypeError('Invalid type {} for texture'.format(type(texture)))

    return texture


class Sampler(object):
    """Texture sampler properties for filtering and wrapping modes.

    Parameters
    ----------
    name : str, optional
        The user-defined name of this object.
    magFilter : int, optional
        Magnification filter. Valid values:
            - :attr:`.GLTF.NEAREST`
            - :attr:`.GLTF.LINEAR`
    minFilter : int, optional
        Minification filter. Valid values:
            - :attr:`.GLTF.NEAREST`
            - :attr:`.GLTF.LINEAR`
            - :attr:`.GLTF.NEAREST_MIPMAP_NEAREST`
            - :attr:`.GLTF.LINEAR_MIPMAP_NEAREST`
            - :attr:`.GLTF.NEAREST_MIPMAP_LINEAR`
            - :attr:`.GLTF.LINEAR_MIPMAP_LINEAR`
    wrapS : int, optional
        S (U) wrapping mode. Valid values:
            - :attr:`.GLTF.CLAMP_TO_EDGE`
            - :attr:`.GLTF.MIRRORED_REPEAT`
            - :attr:`.GLTF.REPEAT`
    wrapT : int, optional
        T (V) wrapping mode. Valid values:
            - :attr:`.GLTF.CLAMP_TO_EDGE`
            - :attr:`.GLTF.MIRRORED_REPEAT`
            - :attr:`.GLTF.REPEAT`
    """

    def __init__(self,
                 name=None,
                 magFilter=None,
                 minFilter=None,
                 wrapS=GLTF.REPEAT,
                 wrapT=GLTF.REPEAT):
        self.name = name
        self.magFilter = magFilter
        self.minFilter = minFilter
        self.wrapS = wrapS
        self.wrapT = wrapT

    @property
    def name(self):
        """str : The user-defined name of this object.
        """
        return self._name

    @name.setter
    def name(self, value):
        if value is not None:
            value = str(value)
        self._name = value

    @property
    def magFilter(self):
        """int : Magnification filter type.
        """
        return self._magFilter

    @magFilter.setter
    def magFilter(self, value):
        self._magFilter = value

    @property
    def minFilter(self):
        """int : Minification filter type.
        """
        return self._minFilter

    @minFilter.setter
    def minFilter(self, value):
        self._minFilter = value

    @property
    def wrapS(self):
        """int : S (U) wrapping mode.
        """
        return self._wrapS

    @wrapS.setter
    def wrapS(self, value):
        self._wrapS = value

    @property
    def wrapT(self):
        """int : T (V) wrapping mode.
        """
        return self._wrapT

    @wrapT.setter
    def wrapT(self, value):
        self._wrapT = value


class Texture(object):
    """A texture and its sampler.

    Parameters
    ----------
    name : str, optional
        The user-defined name of this object.
    sampler : :class:`Sampler`
        The sampler used by this texture.
    source : (h,w,c) uint8 or (h,w,c) float or :class:`PIL.Image.Image`
        The image used by this texture. If None, the texture is created
        empty and width and height must be specified.
    source_channels : str
        Either `D`, `R`, `RG`, `GB`, `RGB`, or `RGBA`. Indicates the
        channels to extract from `source`. Any missing channels will be filled
        with `1.0`.
    width : int, optional
        For empty textures, the width of the texture buffer.
    height : int, optional
        For empty textures, the height of the texture buffer.
    tex_type : int
        Either GL_TEXTURE_2D or GL_TEXTURE_CUBE.
    data_format : int
        For now, just GL_FLOAT.
    """

    def __init__(self,
                 name=None,
                 sampler=None,
                 source=None,
                 source_channels=None,
                 width=None,
                 height=None,
                 tex_type=GL_TEXTURE_2D,
                 data_format=GL_UNSIGNED_BYTE):
        self.source_channels = source_channels
        self.name = name
        self.sampler = sampler
        self.source = source
        self.width = width
        self.height = height
        self.tex_type = tex_type
        self.data_format = data_format

        self._texid = None
        self._is_transparent = False

    @property
    def name(self):
        """str : The user-defined name of this object.
        """
        return self._name

    @name.setter
    def name(self, value):
        if value is not None:
            value = str(value)
        self._name = value

    @property
    def sampler(self):
        """:class:`Sampler` : The sampler used by this texture.
        """
        return self._sampler

    @sampler.setter
    def sampler(self, value):
        if value is None:
            value = Sampler()
        self._sampler = value

    @property
    def source(self):
        """(h,w,c) uint8 or float or :class:`PIL.Image.Image` : The image
        used in this texture.
        """
        return self._source

    @source.setter
    def source(self, value):
        if value is None:
            self._source = None
        else:
            self._source = format_texture_source(value, self.source_channels)
        self._is_transparent = False

    @property
    def source_channels(self):
        """str : The channels that were extracted from the original source.
        """
        return self._source_channels

    @source_channels.setter
    def source_channels(self, value):
        self._source_channels = value

    @property
    def width(self):
        """int : The width of the texture buffer.
        """
        return self._width

    @width.setter
    def width(self, value):
        self._width = value

    @property
    def height(self):
        """int : The height of the texture buffer.
        """
        return self._height

    @height.setter
    def height(self, value):
        self._height = value

    @property
    def tex_type(self):
        """int : The type of the texture.
        """
        return self._tex_type

    @tex_type.setter
    def tex_type(self, value):
        self._tex_type = value

    @property
    def data_format(self):
        """int : The format of the texture data.
        """
        return self._data_format

    @data_format.setter
    def data_format(self, value):
        self._data_format = value

    def is_transparent(self, cutoff=1.0):
        """bool : If True, the texture is partially transparent.
        """
        if self._is_transparent is None:
            self._is_transparent = False
            if self.source_channels == 'RGBA' and self.source is not None:
                if np.any(self.source[:,:,3] < cutoff):
                    self._is_transparent = True
        return self._is_transparent

    def delete(self):
        """Remove this texture from the OpenGL context.
        """
        self._unbind()
        self._remove_from_context()

    ##################
    # OpenGL code
    ##################
    def _add_to_context(self):
        if self._texid is not None:
            raise ValueError('Texture already loaded into OpenGL context')

        fmt = GL_DEPTH_COMPONENT
        if self.source_channels == 'R':
            fmt = GL_RED
        elif self.source_channels == 'RG' or self.source_channels == 'GB':
            fmt = GL_RG
        elif self.source_channels == 'RGB':
            fmt = GL_RGB
        elif self.source_channels == 'RGBA':
            fmt = GL_RGBA

        # Generate the OpenGL texture
        self._texid = glGenTextures(1)
        glBindTexture(self.tex_type, self._texid)

        # Flip data for OpenGL buffer
        data = None
        width = self.width
        height = self.height
        if self.source is not None:
            data = np.ascontiguousarray(np.flip(self.source, axis=0).flatten())
            width = self.source.shape[1]
            height = self.source.shape[0]

        # Bind texture and generate mipmaps
        glTexImage2D(
            self.tex_type, 0, fmt, width, height, 0, fmt,
            self.data_format, data
        )
        if self.source is not None:
            glGenerateMipmap(self.tex_type)

        if self.sampler.magFilter is not None:
            glTexParameteri(
                self.tex_type, GL_TEXTURE_MAG_FILTER, self.sampler.magFilter
            )
        else:
            if self.source is not None:
                glTexParameteri(self.tex_type, GL_TEXTURE_MAG_FILTER, GL_LINEAR)
            else:
                glTexParameteri(self.tex_type, GL_TEXTURE_MAG_FILTER, GL_NEAREST)
        if self.sampler.minFilter is not None:
            glTexParameteri(
                self.tex_type, GL_TEXTURE_MIN_FILTER, self.sampler.minFilter
            )
        else:
            if self.source is not None:
                glTexParameteri(self.tex_type, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR)
            else:
                glTexParameteri(self.tex_type, GL_TEXTURE_MIN_FILTER, GL_NEAREST)

        glTexParameteri(self.tex_type, GL_TEXTURE_WRAP_S, self.sampler.wrapS)
        glTexParameteri(self.tex_type, GL_TEXTURE_WRAP_T, self.sampler.wrapT)
        border_color = 255 * np.ones(4).astype(np.uint8)
        if self.data_format == GL_FLOAT:
            border_color = np.ones(4).astype(np.float32)
        glTexParameterfv(
            self.tex_type, GL_TEXTURE_BORDER_COLOR,
            border_color
        )

        # Unbind texture
        glBindTexture(self.tex_type, 0)

    def _remove_from_context(self):
        if self._texid is not None:
            # TODO OPENGL BUG?
            # glDeleteTextures(1, [self._texid])
            glDeleteTextures([self._texid])
            self._texid = None

    def _in_context(self):
        return self._texid is not None

    def _bind(self):
        # TODO HANDLE INDEXING INTO OTHER UV's
        glBindTexture(self.tex_type, self._texid)

    def _unbind(self):
        glBindTexture(self.tex_type, 0)

    def _bind_as_depth_attachment(self):
        glFramebufferTexture2D(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT,
                               self.tex_type, self._texid, 0)

    def _bind_as_color_attachment(self):
        glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0,
                               self.tex_type, self._texid, 0)



@six.add_metaclass(abc.ABCMeta)
class Camera(object):
    """Abstract base class for all cameras.

    Note
    ----
    Camera poses are specified in the OpenGL format,
    where the z axis points away from the view direction and the
    x and y axes point to the right and up in the image plane, respectively.

    Parameters
    ----------
    znear : float
        The floating-point distance to the near clipping plane.
    zfar : float
        The floating-point distance to the far clipping plane.
        ``zfar`` must be greater than ``znear``.
    name : str, optional
        The user-defined name of this object.
    """

    def __init__(self,
                 znear=DEFAULT_Z_NEAR,
                 zfar=DEFAULT_Z_FAR,
                 name=None):
        self.name = name
        self.znear = znear
        self.zfar = zfar

    @property
    def name(self):
        """str : The user-defined name of this object.
        """
        return self._name

    @name.setter
    def name(self, value):
        if value is not None:
            value = str(value)
        self._name = value

    @property
    def znear(self):
        """float : The distance to the near clipping plane.
        """
        return self._znear

    @znear.setter
    def znear(self, value):
        value = float(value)
        if value < 0:
            raise ValueError('z-near must be >= 0.0')
        self._znear = value

    @property
    def zfar(self):
        """float : The distance to the far clipping plane.
        """
        return self._zfar

    @zfar.setter
    def zfar(self, value):
        value = float(value)
        if value <= 0 or value <= self.znear:
            raise ValueError('zfar must be >0 and >znear')
        self._zfar = value

    @abc.abstractmethod
    def get_projection_matrix(self, width=None, height=None):
        """Return the OpenGL projection matrix for this camera.

        Parameters
        ----------
        width : int
            Width of the current viewport, in pixels.
        height : int
            Height of the current viewport, in pixels.
        """
        pass


class PerspectiveCamera(Camera):

    """A perspective camera for perspective projection.

    Parameters
    ----------
    yfov : float
        The floating-point vertical field of view in radians.
    znear : float
        The floating-point distance to the near clipping plane.
        If not specified, defaults to 0.05.
    zfar : float, optional
        The floating-point distance to the far clipping plane.
        ``zfar`` must be greater than ``znear``.
        If None, the camera uses an infinite projection matrix.
    aspectRatio : float, optional
        The floating-point aspect ratio of the field of view.
        If not specified, the camera uses the viewport's aspect ratio.
    name : str, optional
        The user-defined name of this object.
    """

    def __init__(self,
                 yfov,
                 znear=DEFAULT_Z_NEAR,
                 zfar=None,
                 aspectRatio=None,
                 name=None):
        super(PerspectiveCamera, self).__init__(
            znear=znear,
            zfar=zfar,
            name=name,
        )

        self.yfov = yfov
        self.aspectRatio = aspectRatio

    @property
    def yfov(self):
        """float : The vertical field of view in radians.
        """
        return self._yfov

    @yfov.setter
    def yfov(self, value):
        value = float(value)
        if value <= 0.0:
            raise ValueError('Field of view must be positive')
        self._yfov = value

    @property
    def zfar(self):
        """float : The distance to the far clipping plane.
        """
        return self._zfar

    @zfar.setter
    def zfar(self, value):
        if value is not None:
            value = float(value)
            if value <= 0 or value <= self.znear:
                raise ValueError('zfar must be >0 and >znear')
        self._zfar = value

    @property
    def aspectRatio(self):
        """float : The ratio of the width to the height of the field of view.
        """
        return self._aspectRatio

    @aspectRatio.setter
    def aspectRatio(self, value):
        if value is not None:
            value = float(value)
            if value <= 0.0:
                raise ValueError('Aspect ratio must be positive')
        self._aspectRatio = value

    def get_projection_matrix(self, width=None, height=None):
        """Return the OpenGL projection matrix for this camera.

        Parameters
        ----------
        width : int
            Width of the current viewport, in pixels.
        height : int
            Height of the current viewport, in pixels.
        """
        aspect_ratio = self.aspectRatio
        if aspect_ratio is None:
            if width is None or height is None:
                raise ValueError('Aspect ratio of camera must be defined')
            aspect_ratio = float(width) / float(height)

        a = aspect_ratio
        t = np.tan(self.yfov / 2.0)
        n = self.znear
        f = self.zfar

        P = np.zeros((4,4))
        P[0][0] = 1.0 / (a * t)
        P[1][1] = 1.0 / t
        P[3][2] = -1.0

        if f is None:
            P[2][2] = -1.0
            P[2][3] = -2.0 * n
        else:
            P[2][2] = (f + n) / (n - f)
            P[2][3] = (2 * f * n) / (n - f)

        return P


class OrthographicCamera(Camera):
    """A perspective camera for perspective projection.

    Parameters
    ----------
    xmag : float
        The floating-point horizontal magnification of the view.
    ymag : float
        The floating-point vertical magnification of the view.
    znear : float
        The floating-point distance to the near clipping plane.
        If not specified, defaults to 0.05.
    zfar : float
        The floating-point distance to the far clipping plane.
        ``zfar`` must be greater than ``znear``.
        If not specified, defaults to 100.0.
    name : str, optional
        The user-defined name of this object.
    """

    def __init__(self,
                 xmag,
                 ymag,
                 znear=DEFAULT_Z_NEAR,
                 zfar=DEFAULT_Z_FAR,
                 name=None):
        super(OrthographicCamera, self).__init__(
            znear=znear,
            zfar=zfar,
            name=name,
        )

        self.xmag = xmag
        self.ymag = ymag

    @property
    def xmag(self):
        """float : The horizontal magnification of the view.
        """
        return self._xmag

    @xmag.setter
    def xmag(self, value):
        value = float(value)
        if value <= 0.0:
            raise ValueError('X magnification must be positive')
        self._xmag = value

    @property
    def ymag(self):
        """float : The vertical magnification of the view.
        """
        return self._ymag

    @ymag.setter
    def ymag(self, value):
        value = float(value)
        if value <= 0.0:
            raise ValueError('Y magnification must be positive')
        self._ymag = value

    @property
    def znear(self):
        """float : The distance to the near clipping plane.
        """
        return self._znear

    @znear.setter
    def znear(self, value):
        value = float(value)
        if value <= 0:
            raise ValueError('z-near must be > 0.0')
        self._znear = value

    def get_projection_matrix(self, width=None, height=None):
        """Return the OpenGL projection matrix for this camera.

        Parameters
        ----------
        width : int
            Width of the current viewport, in pixels.
            Unused in this function.
        height : int
            Height of the current viewport, in pixels.
            Unused in this function.
        """
        xmag = self.xmag
        ymag = self.ymag

        # If screen width/height defined, rescale xmag
        if width is not None and height is not None:
            xmag = width / height * ymag

        n = self.znear
        f = self.zfar
        P = np.zeros((4,4))
        P[0][0] = 1.0 / xmag
        P[1][1] = 1.0 / ymag
        P[2][2] = 2.0 / (n - f)
        P[2][3] = (f + n) / (n - f)
        P[3][3] = 1.0
        return P


@six.add_metaclass(abc.ABCMeta)
class Light(object):
    """Base class for all light objects.

    Parameters
    ----------
    color : (3,) float
        RGB value for the light's color in linear space.
    intensity : float
        Brightness of light. The units that this is defined in depend on the
        type of light. Point and spot lights use luminous intensity in candela
        (lm/sr), while directional lights use illuminance in lux (lm/m2).
    name : str, optional
        Name of the light.
    """
    def __init__(self,
                 color=None,
                 intensity=None,
                 name=None):

        if color is None:
            color = np.ones(3)
        if intensity is None:
            intensity = 1.0

        self.name = name
        self.color = color
        self.intensity = intensity
        self._shadow_camera = None
        self._shadow_texture = None

    @property
    def name(self):
        """str : The user-defined name of this object.
        """
        return self._name

    @name.setter
    def name(self, value):
        if value is not None:
            value = str(value)
        self._name = value

    @property
    def color(self):
        """(3,) float : The light's color.
        """
        return self._color

    @color.setter
    def color(self, value):
        self._color = format_color_vector(value, 3)

    @property
    def intensity(self):
        """float : The light's intensity in candela or lux.
        """
        return self._intensity

    @intensity.setter
    def intensity(self, value):
        self._intensity = float(value)

    @property
    def shadow_texture(self):
        """:class:`.Texture` : A texture used to hold shadow maps for this light.
        """
        return self._shadow_texture

    @shadow_texture.setter
    def shadow_texture(self, value):
        if self._shadow_texture is not None:
            if self._shadow_texture._in_context():
                self._shadow_texture.delete()
        self._shadow_texture = value

    @abc.abstractmethod
    def _generate_shadow_texture(self, size=None):
        """Generate a shadow texture for this light.

        Parameters
        ----------
        size : int, optional
            Size of texture map. Must be a positive power of two.
        """
        pass

    @abc.abstractmethod
    def _get_shadow_camera(self, scene_scale):
        """Generate and return a shadow mapping camera for this light.

        Parameters
        ----------
        scene_scale : float
            Length of scene's bounding box diagonal.

        Returns
        -------
        camera : :class:`.Camera`
            The camera used to render shadowmaps for this light.
        """
        pass


class DirectionalLight(Light):
    """Directional lights are light sources that act as though they are
    infinitely far away and emit light in the direction of the local -z axis.
    This light type inherits the orientation of the node that it belongs to;
    position and scale are ignored except for their effect on the inherited
    node orientation. Because it is at an infinite distance, the light is
    not attenuated. Its intensity is defined in lumens per metre squared,
    or lux (lm/m2).

    Parameters
    ----------
    color : (3,) float, optional
        RGB value for the light's color in linear space. Defaults to white
        (i.e. [1.0, 1.0, 1.0]).
    intensity : float, optional
        Brightness of light, in lux (lm/m^2). Defaults to 1.0
    name : str, optional
        Name of the light.
    """

    def __init__(self,
                 color=None,
                 intensity=None,
                 name=None):
        super(DirectionalLight, self).__init__(
            color=color,
            intensity=intensity,
            name=name,
        )

    def _generate_shadow_texture(self, size=None):
        """Generate a shadow texture for this light.

        Parameters
        ----------
        size : int, optional
            Size of texture map. Must be a positive power of two.
        """
        if size is None:
            size = SHADOW_TEX_SZ
        self.shadow_texture = Texture(width=size, height=size,
                                      source_channels='D', data_format=GL_FLOAT)

    def _get_shadow_camera(self, scene_scale):
        """Generate and return a shadow mapping camera for this light.

        Parameters
        ----------
        scene_scale : float
            Length of scene's bounding box diagonal.

        Returns
        -------
        camera : :class:`.Camera`
            The camera used to render shadowmaps for this light.
        """
        return OrthographicCamera(
            znear=0.01 * scene_scale,
            zfar=10 * scene_scale,
            xmag=scene_scale,
            ymag=scene_scale
        )


class PointLight(Light):
    """Point lights emit light in all directions from their position in space;
    rotation and scale are ignored except for their effect on the inherited
    node position. The brightness of the light attenuates in a physically
    correct manner as distance increases from the light's position (i.e.
    brightness goes like the inverse square of the distance). Point light
    intensity is defined in candela, which is lumens per square radian (lm/sr).

    Parameters
    ----------
    color : (3,) float
        RGB value for the light's color in linear space.
    intensity : float
        Brightness of light in candela (lm/sr).
    range : float
        Cutoff distance at which light's intensity may be considered to
        have reached zero. If None, the range is assumed to be infinite.
    name : str, optional
        Name of the light.
    """

    def __init__(self,
                 color=None,
                 intensity=None,
                 range=None,
                 name=None):
        super(PointLight, self).__init__(
            color=color,
            intensity=intensity,
            name=name,
        )
        self.range = range

    @property
    def range(self):
        """float : The cutoff distance for the light.
        """
        return self._range

    @range.setter
    def range(self, value):
        if value is not None:
            value = float(value)
            if value <= 0:
                raise ValueError('Range must be > 0')
            self._range = value
        self._range = value

    def _generate_shadow_texture(self, size=None):
        """Generate a shadow texture for this light.

        Parameters
        ----------
        size : int, optional
            Size of texture map. Must be a positive power of two.
        """
        raise NotImplementedError('Shadows not implemented for point lights')

    def _get_shadow_camera(self, scene_scale):
        """Generate and return a shadow mapping camera for this light.

        Parameters
        ----------
        scene_scale : float
            Length of scene's bounding box diagonal.

        Returns
        -------
        camera : :class:`.Camera`
            The camera used to render shadowmaps for this light.
        """
        raise NotImplementedError('Shadows not implemented for point lights')


class SpotLight(Light):
    """Spot lights emit light in a cone in the direction of the local -z axis.
    The angle and falloff of the cone is defined using two numbers, the
    ``innerConeAngle`` and ``outerConeAngle``.
    As with point lights, the brightness
    also attenuates in a physically correct manner as distance increases from
    the light's position (i.e. brightness goes like the inverse square of the
    distance). Spot light intensity refers to the brightness inside the
    ``innerConeAngle`` (and at the location of the light) and is defined in
    candela, which is lumens per square radian (lm/sr). A spot light's position
    and orientation are inherited from its node transform. Inherited scale does
    not affect cone shape, and is ignored except for its effect on position
    and orientation.

    Parameters
    ----------
    color : (3,) float
        RGB value for the light's color in linear space.
    intensity : float
        Brightness of light in candela (lm/sr).
    range : float
        Cutoff distance at which light's intensity may be considered to
        have reached zero. If None, the range is assumed to be infinite.
    innerConeAngle : float
        Angle, in radians, from centre of spotlight where falloff begins.
        Must be greater than or equal to ``0`` and less
        than ``outerConeAngle``. Defaults to ``0``.
    outerConeAngle : float
        Angle, in radians, from centre of spotlight where falloff ends.
        Must be greater than ``innerConeAngle`` and less than or equal to
        ``PI / 2.0``. Defaults to ``PI / 4.0``.
    name : str, optional
        Name of the light.
    """

    def __init__(self,
                 color=None,
                 intensity=None,
                 range=None,
                 innerConeAngle=0.0,
                 outerConeAngle=(np.pi / 4.0),
                 name=None):
        super(SpotLight, self).__init__(
            name=name,
            color=color,
            intensity=intensity,
        )
        self.outerConeAngle = outerConeAngle
        self.innerConeAngle = innerConeAngle
        self.range = range

    @property
    def innerConeAngle(self):
        """float : The inner cone angle in radians.
        """
        return self._innerConeAngle

    @innerConeAngle.setter
    def innerConeAngle(self, value):
        if value < 0.0 or value > self.outerConeAngle:
            raise ValueError('Invalid value for inner cone angle')
        self._innerConeAngle = float(value)

    @property
    def outerConeAngle(self):
        """float : The outer cone angle in radians.
        """
        return self._outerConeAngle

    @outerConeAngle.setter
    def outerConeAngle(self, value):
        if value < 0.0 or value > np.pi / 2.0 + 1e-9:
            raise ValueError('Invalid value for outer cone angle')
        self._outerConeAngle = float(value)

    @property
    def range(self):
        """float : The cutoff distance for the light.
        """
        return self._range

    @range.setter
    def range(self, value):
        if value is not None:
            value = float(value)
            if value <= 0:
                raise ValueError('Range must be > 0')
            self._range = value
        self._range = value

    def _generate_shadow_texture(self, size=None):
        """Generate a shadow texture for this light.

        Parameters
        ----------
        size : int, optional
            Size of texture map. Must be a positive power of two.
        """
        if size is None:
            size = SHADOW_TEX_SZ
        self.shadow_texture = Texture(width=size, height=size,
                                      source_channels='D', data_format=GL_FLOAT)

    def _get_shadow_camera(self, scene_scale):
        """Generate and return a shadow mapping camera for this light.

        Parameters
        ----------
        scene_scale : float
            Length of scene's bounding box diagonal.

        Returns
        -------
        camera : :class:`.Camera`
            The camera used to render shadowmaps for this light.
        """
        return PerspectiveCamera(
            znear=0.01 * scene_scale,
            zfar=10 * scene_scale,
            yfov=np.clip(2 * self.outerConeAngle + np.pi / 16.0, 0.0, np.pi),
            aspectRatio=1.0
        )
        
        
class ShaderProgramCache(object):
    """A cache for shader programs.
    """

    def __init__(self, shader_dir=None):
        self._program_cache = {}
        self.shader_dir = shader_dir
        if self.shader_dir is None:
            base_dir, _ = os.path.split(os.path.realpath(__file__))
            self.shader_dir = os.path.join(base_dir, 'shaders')

    def get_program(self, vertex_shader, fragment_shader,
                    geometry_shader=None, defines=None):
        """Get a program via a list of shader files to include in the program.

        Parameters
        ----------
        vertex_shader : str
            The vertex shader filename.
        fragment_shader : str
            The fragment shader filename.
        geometry_shader : str
            The geometry shader filename.
        defines : dict
            Defines and their values for the shader.

        Returns
        -------
        program : :class:`.ShaderProgram`
            The program.
        """
        shader_names = []
        if defines is None:
            defines = {}
        shader_filenames = [
            x for x in [vertex_shader, fragment_shader, geometry_shader]
            if x is not None
        ]
        for fn in shader_filenames:
            if fn is None:
                continue
            _, name = os.path.split(fn)
            shader_names.append(name)
        cid = OpenGL.contextdata.getContext()
        key = tuple([cid] + sorted(
            [(s,1) for s in shader_names] + [(d, defines[d]) for d in defines]
        ))

        if key not in self._program_cache:
            shader_filenames = [
                os.path.join(self.shader_dir, fn) for fn in shader_filenames
            ]
            if len(shader_filenames) == 2:
                shader_filenames.append(None)
            vs, fs, gs = shader_filenames
            self._program_cache[key] = ShaderProgram(
                vertex_shader=vs, fragment_shader=fs,
                geometry_shader=gs, defines=defines
            )
        return self._program_cache[key]

    def clear(self):
        for key in self._program_cache:
            self._program_cache[key].delete()
        self._program_cache = {}


class ShaderProgram(object):
    """A thin wrapper about OpenGL shader programs that supports easy creation,
    binding, and uniform-setting.

    Parameters
    ----------
    vertex_shader : str
        The vertex shader filename.
    fragment_shader : str
        The fragment shader filename.
    geometry_shader : str
        The geometry shader filename.
    defines : dict
        Defines and their values for the shader.
    """

    def __init__(self, vertex_shader, fragment_shader,
                 geometry_shader=None, defines=None):

        self.vertex_shader = vertex_shader
        self.fragment_shader = fragment_shader
        self.geometry_shader = geometry_shader

        self.defines = defines
        if self.defines is None:
            self.defines = {}

        self._program_id = None
        self._vao_id = None  # PYOPENGL BUG

        # DEBUG
        # self._unif_map = {}

    def _add_to_context(self):
        if self._program_id is not None:
            raise ValueError('Shader program already in context')
        shader_ids = []
        # Load vert shader
        shader_ids.append(shaders.compileShader(
            self._load(self.vertex_shader), GL_VERTEX_SHADER)
        )
        # Load frag shader
        shader_ids.append(shaders.compileShader(
            self._load(self.fragment_shader), GL_FRAGMENT_SHADER)
        )
        # Load geometry shader
        if self.geometry_shader is not None:
            shader_ids.append(shaders.compileShader(
                self._load(self.geometry_shader), GL_GEOMETRY_SHADER)
            )

        # Bind empty VAO PYOPENGL BUG
        if self._vao_id is None:
            self._vao_id = glGenVertexArrays(1)
        glBindVertexArray(self._vao_id)

        # Compile program
        self._program_id = shaders.compileProgram(*shader_ids)

        # Unbind empty VAO PYOPENGL BUG
        glBindVertexArray(0)

    def _in_context(self):
        return self._program_id is not None

    def _remove_from_context(self):
        if self._program_id is not None:
            glDeleteProgram(self._program_id)
            glDeleteVertexArrays(1, [self._vao_id])
            self._program_id = None
            self._vao_id = None

    def _load(self, shader_filename):
        path, _ = os.path.split(shader_filename)

        with open(shader_filename) as f:
            text = f.read()

        def ifdef(matchobj):
            if matchobj.group(1) in self.defines:
                return '#if 1'
            else:
                return '#if 0'

        def ifndef(matchobj):
            if matchobj.group(1) in self.defines:
                return '#if 0'
            else:
                return '#if 1'

        ifdef_regex = re.compile(
            '#ifdef\\s+([a-zA-Z_][a-zA-Z_0-9]*)\\s*$', re.MULTILINE
        )
        ifndef_regex = re.compile(
            '#ifndef\\s+([a-zA-Z_][a-zA-Z_0-9]*)\\s*$', re.MULTILINE
        )
        text = re.sub(ifdef_regex, ifdef, text)
        text = re.sub(ifndef_regex, ifndef, text)

        for define in self.defines:
            value = str(self.defines[define])
            text = text.replace(define, value)

        return text

    def _bind(self):
        """Bind this shader program to the current OpenGL context.
        """
        if self._program_id is None:
            raise ValueError('Cannot bind program that is not in context')
        # glBindVertexArray(self._vao_id)
        glUseProgram(self._program_id)

    def _unbind(self):
        """Unbind this shader program from the current OpenGL context.
        """
        glUseProgram(0)

    def delete(self):
        """Delete this shader program from the current OpenGL context.
        """
        self._remove_from_context()

    def set_uniform(self, name, value, unsigned=False):
        """Set a uniform value in the current shader program.

        Parameters
        ----------
        name : str
            Name of the uniform to set.
        value : int, float, or ndarray
            Value to set the uniform to.
        unsigned : bool
            If True, ints will be treated as unsigned values.
        """
        try:
            # DEBUG
            # self._unif_map[name] = 1, (1,)
            loc = glGetUniformLocation(self._program_id, name)

            if loc == -1:
                raise ValueError('Invalid shader variable: {}'.format(name))

            if isinstance(value, np.ndarray):
                # DEBUG
                # self._unif_map[name] = value.size, value.shape
                if value.ndim == 1:
                    if (np.issubdtype(value.dtype, np.unsignedinteger) or
                            unsigned):
                        dtype = 'u'
                        value = value.astype(np.uint32)
                    elif np.issubdtype(value.dtype, np.integer):
                        dtype = 'i'
                        value = value.astype(np.int32)
                    else:
                        dtype = 'f'
                        value = value.astype(np.float32)
                    self._FUNC_MAP[(value.shape[0], dtype)](loc, 1, value)
                else:
                    self._FUNC_MAP[(value.shape[0], value.shape[1])](
                        loc, 1, GL_TRUE, value
                    )

            # Call correct uniform function
            elif isinstance(value, float):
                glUniform1f(loc, value)
            elif isinstance(value, int):
                if unsigned:
                    glUniform1ui(loc, value)
                else:
                    glUniform1i(loc, value)
            elif isinstance(value, bool):
                if unsigned:
                    glUniform1ui(loc, int(value))
                else:
                    glUniform1i(loc, int(value))
            else:
                raise ValueError('Invalid data type')
        except Exception:
            pass

    _FUNC_MAP = {
        (1,'u'): glUniform1uiv,
        (2,'u'): glUniform2uiv,
        (3,'u'): glUniform3uiv,
        (4,'u'): glUniform4uiv,
        (1,'i'): glUniform1iv,
        (2,'i'): glUniform2iv,
        (3,'i'): glUniform3iv,
        (4,'i'): glUniform4iv,
        (1,'f'): glUniform1fv,
        (2,'f'): glUniform2fv,
        (3,'f'): glUniform3fv,
        (4,'f'): glUniform4fv,
        (2,2): glUniformMatrix2fv,
        (2,3): glUniformMatrix2x3fv,
        (2,4): glUniformMatrix2x4fv,
        (3,2): glUniformMatrix3x2fv,
        (3,3): glUniformMatrix4fv,
        (3,4): glUniformMatrix3x4fv,
        (4,2): glUniformMatrix4x2fv,
        (4,3): glUniformMatrix4x3fv,
        (4,4): glUniformMatrix4fv,
    }


@six.add_metaclass(abc.ABCMeta)
class Material(object):
    """Base for standard glTF 2.0 materials.

    Parameters
    ----------
    name : str, optional
        The user-defined name of this object.
    normalTexture : (n,n,3) float or :class:`Texture`, optional
        A tangent space normal map. The texture contains RGB components in
        linear space. Each texel represents the XYZ components of a normal
        vector in tangent space. Red [0 to 255] maps to X [-1 to 1]. Green
        [0 to 255] maps to Y [-1 to 1]. Blue [128 to 255] maps to Z
        [1/255 to 1]. The normal vectors use OpenGL conventions where +X is
        right and +Y is up. +Z points toward the viewer.
    occlusionTexture : (n,n,1) float or :class:`Texture`, optional
        The occlusion map texture. The occlusion values are sampled from the R
        channel. Higher values indicate areas that should receive full indirect
        lighting and lower values indicate no indirect lighting. These values
        are linear. If other channels are present (GBA), they are ignored for
        occlusion calculations.
    emissiveTexture : (n,n,3) float or :class:`Texture`, optional
        The emissive map controls the color and intensity of the light being
        emitted by the material. This texture contains RGB components in sRGB
        color space. If a fourth component (A) is present, it is ignored.
    emissiveFactor : (3,) float, optional
        The RGB components of the emissive color of the material. These values
        are linear. If an emissiveTexture is specified, this value is
        multiplied with the texel values.
    alphaMode : str, optional
        The material's alpha rendering mode enumeration specifying the
        interpretation of the alpha value of the main factor and texture.
        Allowed Values:

        - `"OPAQUE"` The alpha value is ignored and the rendered output is
          fully opaque.
        - `"MASK"` The rendered output is either fully opaque or fully
          transparent depending on the alpha value and the specified alpha
          cutoff value.
        - `"BLEND"` The alpha value is used to composite the source and
          destination areas. The rendered output is combined with the
          background using the normal painting operation (i.e. the Porter
          and Duff over operator).

    alphaCutoff : float, optional
        Specifies the cutoff threshold when in MASK mode. If the alpha value is
        greater than or equal to this value then it is rendered as fully
        opaque, otherwise, it is rendered as fully transparent.
        A value greater than 1.0 will render the entire material as fully
        transparent. This value is ignored for other modes.
    doubleSided : bool, optional
        Specifies whether the material is double sided. When this value is
        false, back-face culling is enabled. When this value is true,
        back-face culling is disabled and double sided lighting is enabled.
    smooth : bool, optional
        If True, the material is rendered smoothly by using only one normal
        per vertex and face indexing.
    wireframe : bool, optional
        If True, the material is rendered in wireframe mode.
    """

    def __init__(self,
                 name=None,
                 normalTexture=None,
                 occlusionTexture=None,
                 emissiveTexture=None,
                 emissiveFactor=None,
                 alphaMode=None,
                 alphaCutoff=None,
                 doubleSided=False,
                 smooth=True,
                 wireframe=False):

        # Set defaults
        if alphaMode is None:
            alphaMode = 'OPAQUE'

        if alphaCutoff is None:
            alphaCutoff = 0.5

        if emissiveFactor is None:
            emissiveFactor = np.zeros(3).astype(np.float32)

        self.name = name
        self.normalTexture = normalTexture
        self.occlusionTexture = occlusionTexture
        self.emissiveTexture = emissiveTexture
        self.emissiveFactor = emissiveFactor
        self.alphaMode = alphaMode
        self.alphaCutoff = alphaCutoff
        self.doubleSided = doubleSided
        self.smooth = smooth
        self.wireframe = wireframe

        self._tex_flags = None

    @property
    def name(self):
        """str : The user-defined name of this object.
        """
        return self._name

    @name.setter
    def name(self, value):
        if value is not None:
            value = str(value)
        self._name = value

    @property
    def normalTexture(self):
        """(n,n,3) float or :class:`Texture` : The tangent-space normal map.
        """
        return self._normalTexture

    @normalTexture.setter
    def normalTexture(self, value):
        # TODO TMP
        self._normalTexture = self._format_texture(value, 'RGB')
        self._tex_flags = None

    @property
    def occlusionTexture(self):
        """(n,n,1) float or :class:`Texture` : The ambient occlusion map.
        """
        return self._occlusionTexture

    @occlusionTexture.setter
    def occlusionTexture(self, value):
        self._occlusionTexture = self._format_texture(value, 'R')
        self._tex_flags = None

    @property
    def emissiveTexture(self):
        """(n,n,3) float or :class:`Texture` : The emission map.
        """
        return self._emissiveTexture

    @emissiveTexture.setter
    def emissiveTexture(self, value):
        self._emissiveTexture = self._format_texture(value, 'RGB')
        self._tex_flags = None

    @property
    def emissiveFactor(self):
        """(3,) float : Base multiplier for emission colors.
        """
        return self._emissiveFactor

    @emissiveFactor.setter
    def emissiveFactor(self, value):
        if value is None:
            value = np.zeros(3)
        self._emissiveFactor = format_color_vector(value, 3)

    @property
    def alphaMode(self):
        """str : The mode for blending.
        """
        return self._alphaMode

    @alphaMode.setter
    def alphaMode(self, value):
        if value not in set(['OPAQUE', 'MASK', 'BLEND']):
            raise ValueError('Invalid alpha mode {}'.format(value))
        self._alphaMode = value

    @property
    def alphaCutoff(self):
        """float : The cutoff threshold in MASK mode.
        """
        return self._alphaCutoff

    @alphaCutoff.setter
    def alphaCutoff(self, value):
        if value < 0 or value > 1:
            raise ValueError('Alpha cutoff must be in range [0,1]')
        self._alphaCutoff = float(value)

    @property
    def doubleSided(self):
        """bool : Whether the material is double-sided.
        """
        return self._doubleSided

    @doubleSided.setter
    def doubleSided(self, value):
        if not isinstance(value, bool):
            raise TypeError('Double sided must be a boolean value')
        self._doubleSided = value

    @property
    def smooth(self):
        """bool : Whether to render the mesh smoothly by
        interpolating vertex normals.
        """
        return self._smooth

    @smooth.setter
    def smooth(self, value):
        if not isinstance(value, bool):
            raise TypeError('Double sided must be a boolean value')
        self._smooth = value

    @property
    def wireframe(self):
        """bool : Whether to render the mesh in wireframe mode.
        """
        return self._wireframe

    @wireframe.setter
    def wireframe(self, value):
        if not isinstance(value, bool):
            raise TypeError('Wireframe must be a boolean value')
        self._wireframe = value

    @property
    def is_transparent(self):
        """bool : If True, the object is partially transparent.
        """
        return self._compute_transparency()

    @property
    def tex_flags(self):
        """int : Texture availability flags.
        """
        if self._tex_flags is None:
            self._tex_flags = self._compute_tex_flags()
        return self._tex_flags

    @property
    def textures(self):
        """list of :class:`Texture` : The textures associated with this
        material.
        """
        return self._compute_textures()

    def _compute_transparency(self):
        return False

    def _compute_tex_flags(self):
        tex_flags = TexFlags.NONE
        if self.normalTexture is not None:
            tex_flags |= TexFlags.NORMAL
        if self.occlusionTexture is not None:
            tex_flags |= TexFlags.OCCLUSION
        if self.emissiveTexture is not None:
            tex_flags |= TexFlags.EMISSIVE
        return tex_flags

    def _compute_textures(self):
        all_textures = [
            self.normalTexture, self.occlusionTexture, self.emissiveTexture
        ]
        textures = set([t for t in all_textures if t is not None])
        return textures

    def _format_texture(self, texture, target_channels='RGB'):
        """Format a texture as a float32 np array.
        """
        if isinstance(texture, Texture) or texture is None:
            return texture
        else:
            source = format_texture_source(texture, target_channels)
            return Texture(source=source, source_channels=target_channels)


class MetallicRoughnessMaterial(Material):
    """A material based on the metallic-roughness material model from
    Physically-Based Rendering (PBR) methodology.

    Parameters
    ----------
    name : str, optional
        The user-defined name of this object.
    normalTexture : (n,n,3) float or :class:`Texture`, optional
        A tangent space normal map. The texture contains RGB components in
        linear space. Each texel represents the XYZ components of a normal
        vector in tangent space. Red [0 to 255] maps to X [-1 to 1]. Green
        [0 to 255] maps to Y [-1 to 1]. Blue [128 to 255] maps to Z
        [1/255 to 1]. The normal vectors use OpenGL conventions where +X is
        right and +Y is up. +Z points toward the viewer.
    occlusionTexture : (n,n,1) float or :class:`Texture`, optional
        The occlusion map texture. The occlusion values are sampled from the R
        channel. Higher values indicate areas that should receive full indirect
        lighting and lower values indicate no indirect lighting. These values
        are linear. If other channels are present (GBA), they are ignored for
        occlusion calculations.
    emissiveTexture : (n,n,3) float or :class:`Texture`, optional
        The emissive map controls the color and intensity of the light being
        emitted by the material. This texture contains RGB components in sRGB
        color space. If a fourth component (A) is present, it is ignored.
    emissiveFactor : (3,) float, optional
        The RGB components of the emissive color of the material. These values
        are linear. If an emissiveTexture is specified, this value is
        multiplied with the texel values.
    alphaMode : str, optional
        The material's alpha rendering mode enumeration specifying the
        interpretation of the alpha value of the main factor and texture.
        Allowed Values:

        - `"OPAQUE"` The alpha value is ignored and the rendered output is
          fully opaque.
        - `"MASK"` The rendered output is either fully opaque or fully
          transparent depending on the alpha value and the specified alpha
          cutoff value.
        - `"BLEND"` The alpha value is used to composite the source and
          destination areas. The rendered output is combined with the
          background using the normal painting operation (i.e. the Porter
          and Duff over operator).

    alphaCutoff : float, optional
        Specifies the cutoff threshold when in MASK mode. If the alpha value is
        greater than or equal to this value then it is rendered as fully
        opaque, otherwise, it is rendered as fully transparent.
        A value greater than 1.0 will render the entire material as fully
        transparent. This value is ignored for other modes.
    doubleSided : bool, optional
        Specifies whether the material is double sided. When this value is
        false, back-face culling is enabled. When this value is true,
        back-face culling is disabled and double sided lighting is enabled.
    smooth : bool, optional
        If True, the material is rendered smoothly by using only one normal
        per vertex and face indexing.
    wireframe : bool, optional
        If True, the material is rendered in wireframe mode.
    baseColorFactor : (4,) float, optional
        The RGBA components of the base color of the material. The fourth
        component (A) is the alpha coverage of the material. The alphaMode
        property specifies how alpha is interpreted. These values are linear.
        If a baseColorTexture is specified, this value is multiplied with the
        texel values.
    baseColorTexture : (n,n,4) float or :class:`Texture`, optional
        The base color texture. This texture contains RGB(A) components in sRGB
        color space. The first three components (RGB) specify the base color of
        the material. If the fourth component (A) is present, it represents the
        alpha coverage of the material. Otherwise, an alpha of 1.0 is assumed.
        The alphaMode property specifies how alpha is interpreted.
        The stored texels must not be premultiplied.
    metallicFactor : float
        The metalness of the material. A value of 1.0 means the material is a
        metal. A value of 0.0 means the material is a dielectric. Values in
        between are for blending between metals and dielectrics such as dirty
        metallic surfaces. This value is linear. If a metallicRoughnessTexture
        is specified, this value is multiplied with the metallic texel values.
    roughnessFactor : float
        The roughness of the material. A value of 1.0 means the material is
        completely rough. A value of 0.0 means the material is completely
        smooth. This value is linear. If a metallicRoughnessTexture is
        specified, this value is multiplied with the roughness texel values.
    metallicRoughnessTexture : (n,n,2) float or :class:`Texture`, optional
        The metallic-roughness texture. The metalness values are sampled from
        the B channel. The roughness values are sampled from the G channel.
        These values are linear. If other channels are present (R or A), they
        are ignored for metallic-roughness calculations.
    """

    def __init__(self,
                 name=None,
                 normalTexture=None,
                 occlusionTexture=None,
                 emissiveTexture=None,
                 emissiveFactor=None,
                 alphaMode=None,
                 alphaCutoff=None,
                 doubleSided=False,
                 smooth=True,
                 wireframe=False,
                 baseColorFactor=None,
                 baseColorTexture=None,
                 metallicFactor=1.0,
                 roughnessFactor=1.0,
                 metallicRoughnessTexture=None):
        super(MetallicRoughnessMaterial, self).__init__(
            name=name,
            normalTexture=normalTexture,
            occlusionTexture=occlusionTexture,
            emissiveTexture=emissiveTexture,
            emissiveFactor=emissiveFactor,
            alphaMode=alphaMode,
            alphaCutoff=alphaCutoff,
            doubleSided=doubleSided,
            smooth=smooth,
            wireframe=wireframe
        )

        # Set defaults
        if baseColorFactor is None:
            baseColorFactor = np.ones(4).astype(np.float32)

        self.baseColorFactor = baseColorFactor
        self.baseColorTexture = baseColorTexture
        self.metallicFactor = metallicFactor
        self.roughnessFactor = roughnessFactor
        self.metallicRoughnessTexture = metallicRoughnessTexture

    @property
    def baseColorFactor(self):
        """(4,) float or :class:`Texture` : The RGBA base color multiplier.
        """
        return self._baseColorFactor

    @baseColorFactor.setter
    def baseColorFactor(self, value):
        if value is None:
            value = np.ones(4)
        self._baseColorFactor = format_color_vector(value, 4)

    @property
    def baseColorTexture(self):
        """(n,n,4) float or :class:`Texture` : The diffuse texture.
        """
        return self._baseColorTexture

    @baseColorTexture.setter
    def baseColorTexture(self, value):
        self._baseColorTexture = self._format_texture(value, 'RGBA')
        self._tex_flags = None

    @property
    def metallicFactor(self):
        """float : The metalness of the material.
        """
        return self._metallicFactor

    @metallicFactor.setter
    def metallicFactor(self, value):
        if value is None:
            value = 1.0
        if value < 0 or value > 1:
            raise ValueError('Metallic factor must be in range [0,1]')
        self._metallicFactor = float(value)

    @property
    def roughnessFactor(self):
        """float : The roughness of the material.
        """
        return self.RoughnessFactor

    @roughnessFactor.setter
    def roughnessFactor(self, value):
        if value is None:
            value = 1.0
        if value < 0 or value > 1:
            raise ValueError('Roughness factor must be in range [0,1]')
        self.RoughnessFactor = float(value)

    @property
    def metallicRoughnessTexture(self):
        """(n,n,2) float or :class:`Texture` : The metallic-roughness texture.
        """
        return self._metallicRoughnessTexture

    @metallicRoughnessTexture.setter
    def metallicRoughnessTexture(self, value):
        self._metallicRoughnessTexture = self._format_texture(value, 'GB')
        self._tex_flags = None

    def _compute_tex_flags(self):
        tex_flags = super(MetallicRoughnessMaterial, self)._compute_tex_flags()
        if self.baseColorTexture is not None:
            tex_flags |= TexFlags.BASE_COLOR
        if self.metallicRoughnessTexture is not None:
            tex_flags |= TexFlags.METALLIC_ROUGHNESS
        return tex_flags

    def _compute_transparency(self):
        if self.alphaMode == 'OPAQUE':
            return False
        cutoff = self.alphaCutoff
        if self.alphaMode == 'BLEND':
            cutoff = 1.0
        if self.baseColorFactor[3] < cutoff:
            return True
        if (self.baseColorTexture is not None and
                self.baseColorTexture.is_transparent(cutoff)):
            return True
        return False

    def _compute_textures(self):
        textures = super(MetallicRoughnessMaterial, self)._compute_textures()
        all_textures = [self.baseColorTexture, self.metallicRoughnessTexture]
        all_textures = {t for t in all_textures if t is not None}
        textures |= all_textures
        return textures


class SpecularGlossinessMaterial(Material):
    """A material based on the specular-glossiness material model from
    Physically-Based Rendering (PBR) methodology.

    Parameters
    ----------
    name : str, optional
        The user-defined name of this object.
    normalTexture : (n,n,3) float or :class:`Texture`, optional
        A tangent space normal map. The texture contains RGB components in
        linear space. Each texel represents the XYZ components of a normal
        vector in tangent space. Red [0 to 255] maps to X [-1 to 1]. Green
        [0 to 255] maps to Y [-1 to 1]. Blue [128 to 255] maps to Z
        [1/255 to 1]. The normal vectors use OpenGL conventions where +X is
        right and +Y is up. +Z points toward the viewer.
    occlusionTexture : (n,n,1) float or :class:`Texture`, optional
        The occlusion map texture. The occlusion values are sampled from the R
        channel. Higher values indicate areas that should receive full indirect
        lighting and lower values indicate no indirect lighting. These values
        are linear. If other channels are present (GBA), they are ignored for
        occlusion calculations.
    emissiveTexture : (n,n,3) float or :class:`Texture`, optional
        The emissive map controls the color and intensity of the light being
        emitted by the material. This texture contains RGB components in sRGB
        color space. If a fourth component (A) is present, it is ignored.
    emissiveFactor : (3,) float, optional
        The RGB components of the emissive color of the material. These values
        are linear. If an emissiveTexture is specified, this value is
        multiplied with the texel values.
    alphaMode : str, optional
        The material's alpha rendering mode enumeration specifying the
        interpretation of the alpha value of the main factor and texture.
        Allowed Values:

        - `"OPAQUE"` The alpha value is ignored and the rendered output is
          fully opaque.
        - `"MASK"` The rendered output is either fully opaque or fully
          transparent depending on the alpha value and the specified alpha
          cutoff value.
        - `"BLEND"` The alpha value is used to composite the source and
          destination areas. The rendered output is combined with the
          background using the normal painting operation (i.e. the Porter
          and Duff over operator).

    alphaCutoff : float, optional
        Specifies the cutoff threshold when in MASK mode. If the alpha value is
        greater than or equal to this value then it is rendered as fully
        opaque, otherwise, it is rendered as fully transparent.
        A value greater than 1.0 will render the entire material as fully
        transparent. This value is ignored for other modes.
    doubleSided : bool, optional
        Specifies whether the material is double sided. When this value is
        false, back-face culling is enabled. When this value is true,
        back-face culling is disabled and double sided lighting is enabled.
    smooth : bool, optional
        If True, the material is rendered smoothly by using only one normal
        per vertex and face indexing.
    wireframe : bool, optional
        If True, the material is rendered in wireframe mode.
    diffuseFactor : (4,) float
        The RGBA components of the reflected diffuse color of the material.
        Metals have a diffuse value of [0.0, 0.0, 0.0]. The fourth component
        (A) is the opacity of the material. The values are linear.
    diffuseTexture : (n,n,4) float or :class:`Texture`, optional
        The diffuse texture. This texture contains RGB(A) components of the
        reflected diffuse color of the material in sRGB color space. If the
        fourth component (A) is present, it represents the alpha coverage of
        the material. Otherwise, an alpha of 1.0 is assumed.
        The alphaMode property specifies how alpha is interpreted.
        The stored texels must not be premultiplied.
    specularFactor : (3,) float
        The specular RGB color of the material. This value is linear.
    glossinessFactor : float
        The glossiness or smoothness of the material. A value of 1.0 means the
        material has full glossiness or is perfectly smooth. A value of 0.0
        means the material has no glossiness or is perfectly rough. This value
        is linear.
    specularGlossinessTexture : (n,n,4) or :class:`Texture`, optional
        The specular-glossiness texture is a RGBA texture, containing the
        specular color (RGB) in sRGB space and the glossiness value (A) in
        linear space.
    """

    def __init__(self,
                 name=None,
                 normalTexture=None,
                 occlusionTexture=None,
                 emissiveTexture=None,
                 emissiveFactor=None,
                 alphaMode=None,
                 alphaCutoff=None,
                 doubleSided=False,
                 smooth=True,
                 wireframe=False,
                 diffuseFactor=None,
                 diffuseTexture=None,
                 specularFactor=None,
                 glossinessFactor=1.0,
                 specularGlossinessTexture=None):
        super(SpecularGlossinessMaterial, self).__init__(
            name=name,
            normalTexture=normalTexture,
            occlusionTexture=occlusionTexture,
            emissiveTexture=emissiveTexture,
            emissiveFactor=emissiveFactor,
            alphaMode=alphaMode,
            alphaCutoff=alphaCutoff,
            doubleSided=doubleSided,
            smooth=smooth,
            wireframe=wireframe
        )

        # Set defaults
        if diffuseFactor is None:
            diffuseFactor = np.ones(4).astype(np.float32)
        if specularFactor is None:
            specularFactor = np.ones(3).astype(np.float32)

        self.diffuseFactor = diffuseFactor
        self.diffuseTexture = diffuseTexture
        self.specularFactor = specularFactor
        self.glossinessFactor = glossinessFactor
        self.specularGlossinessTexture = specularGlossinessTexture

    @property
    def diffuseFactor(self):
        """(4,) float : The diffuse base color.
        """
        return self._diffuseFactor

    @diffuseFactor.setter
    def diffuseFactor(self, value):
        self._diffuseFactor = format_color_vector(value, 4)

    @property
    def diffuseTexture(self):
        """(n,n,4) float or :class:`Texture` : The diffuse map.
        """
        return self._diffuseTexture

    @diffuseTexture.setter
    def diffuseTexture(self, value):
        self._diffuseTexture = self._format_texture(value, 'RGBA')
        self._tex_flags = None

    @property
    def specularFactor(self):
        """(3,) float : The specular color of the material.
        """
        return self._specularFactor

    @specularFactor.setter
    def specularFactor(self, value):
        self._specularFactor = format_color_vector(value, 3)

    @property
    def glossinessFactor(self):
        """float : The glossiness of the material.
        """
        return self.glossinessFactor

    @glossinessFactor.setter
    def glossinessFactor(self, value):
        if value < 0 or value > 1:
            raise ValueError('glossiness factor must be in range [0,1]')
        self._glossinessFactor = float(value)

    @property
    def specularGlossinessTexture(self):
        """(n,n,4) or :class:`Texture` : The specular-glossiness texture.
        """
        return self._specularGlossinessTexture

    @specularGlossinessTexture.setter
    def specularGlossinessTexture(self, value):
        self._specularGlossinessTexture = self._format_texture(value, 'GB')
        self._tex_flags = None

    def _compute_tex_flags(self):
        flags = super(SpecularGlossinessMaterial, self)._compute_tex_flags()
        if self.diffuseTexture is not None:
            flags |= TexFlags.DIFFUSE
        if self.specularGlossinessTexture is not None:
            flags |= TexFlags.SPECULAR_GLOSSINESS
        return flags

    def _compute_transparency(self):
        if self.alphaMode == 'OPAQUE':
            return False
        cutoff = self.alphaCutoff
        if self.alphaMode == 'BLEND':
            cutoff = 1.0
        if self.diffuseFactor[3] < cutoff:
            return True
        if (self.diffuseTexture is not None and
                self.diffuseTexture.is_transparent(cutoff)):
            return True
        return False

    def _compute_textures(self):
        textures = super(SpecularGlossinessMaterial, self)._compute_textures()
        all_textures = [self.diffuseTexture, self.specularGlossinessTexture]
        all_textures = {t for t in all_textures if t is not None}
        textures |= all_textures
        return textures

class Primitive(object):
    """A primitive object which can be rendered.

    Parameters
    ----------
    positions : (n, 3) float
        XYZ vertex positions.
    normals : (n, 3) float
        Normalized XYZ vertex normals.
    tangents : (n, 4) float
        XYZW vertex tangents where the w component is a sign value
        (either +1 or -1) indicating the handedness of the tangent basis.
    texcoord_0 : (n, 2) float
        The first set of UV texture coordinates.
    texcoord_1 : (n, 2) float
        The second set of UV texture coordinates.
    color_0 : (n, 4) float
        RGBA vertex colors.
    joints_0 : (n, 4) float
        Joint information.
    weights_0 : (n, 4) float
        Weight information for morphing.
    indices : (m, 3) int
        Face indices for triangle meshes or fans.
    material : :class:`Material`
        The material to apply to this primitive when rendering.
    mode : int
        The type of primitives to render, one of the following:

        - ``0``: POINTS
        - ``1``: LINES
        - ``2``: LINE_LOOP
        - ``3``: LINE_STRIP
        - ``4``: TRIANGLES
        - ``5``: TRIANGLES_STRIP
        - ``6``: TRIANGLES_FAN
    targets : (k,) int
        Morph target indices.
    poses : (x,4,4), float
        Array of 4x4 transformation matrices for instancing this object.
    """

    def __init__(self,
                 positions,
                 normals=None,
                 tangents=None,
                 texcoord_0=None,
                 texcoord_1=None,
                 color_0=None,
                 joints_0=None,
                 weights_0=None,
                 indices=None,
                 material=None,
                 mode=None,
                 targets=None,
                 poses=None):

        if mode is None:
            mode = GLTF.TRIANGLES

        self.positions = positions
        self.normals = normals
        self.tangents = tangents
        self.texcoord_0 = texcoord_0
        self.texcoord_1 = texcoord_1
        self.color_0 = color_0
        self.joints_0 = joints_0
        self.weights_0 = weights_0
        self.indices = indices
        self.material = material
        self.mode = mode
        self.targets = targets
        self.poses = poses

        self._bounds = None
        self._vaid = None
        self._buffers = []
        self._is_transparent = None
        self._buf_flags = None

    @property
    def positions(self):
        """(n,3) float : XYZ vertex positions.
        """
        return self._positions

    @positions.setter
    def positions(self, value):
        value = np.asanyarray(value, dtype=np.float32)
        self._positions = np.ascontiguousarray(value)
        self._bounds = None

    @property
    def normals(self):
        """(n,3) float : Normalized XYZ vertex normals.
        """
        return self._normals

    @normals.setter
    def normals(self, value):
        if value is not None:
            value = np.asanyarray(value, dtype=np.float32)
            value = np.ascontiguousarray(value)
            if value.shape != self.positions.shape:
                raise ValueError('Incorrect normals shape')
        self._normals = value

    @property
    def tangents(self):
        """(n,4) float : XYZW vertex tangents.
        """
        return self._tangents

    @tangents.setter
    def tangents(self, value):
        if value is not None:
            value = np.asanyarray(value, dtype=np.float32)
            value = np.ascontiguousarray(value)
            if value.shape != (self.positions.shape[0], 4):
                raise ValueError('Incorrect tangent shape')
        self._tangents = value

    @property
    def texcoord_0(self):
        """(n,2) float : The first set of UV texture coordinates.
        """
        return self._texcoord_0

    @texcoord_0.setter
    def texcoord_0(self, value):
        if value is not None:
            value = np.asanyarray(value, dtype=np.float32)
            value = np.ascontiguousarray(value)
            if (value.ndim != 2 or value.shape[0] != self.positions.shape[0] or
                    value.shape[1] < 2):
                raise ValueError('Incorrect texture coordinate shape')
            if value.shape[1] > 2:
                value = value[:,:2]
        self._texcoord_0 = value

    @property
    def texcoord_1(self):
        """(n,2) float : The second set of UV texture coordinates.
        """
        return self._texcoord_1

    @texcoord_1.setter
    def texcoord_1(self, value):
        if value is not None:
            value = np.asanyarray(value, dtype=np.float32)
            value = np.ascontiguousarray(value)
            if (value.ndim != 2 or value.shape[0] != self.positions.shape[0] or
                    value.shape[1] != 2):
                raise ValueError('Incorrect texture coordinate shape')
        self._texcoord_1 = value

    @property
    def color_0(self):
        """(n,4) float : RGBA vertex colors.
        """
        return self._color_0

    @color_0.setter
    def color_0(self, value):
        if value is not None:
            value = np.ascontiguousarray(
                format_color_array(value, shape=(len(self.positions), 4))
            )
        self._is_transparent = None
        self._color_0 = value

    @property
    def joints_0(self):
        """(n,4) float : Joint information.
        """
        return self._joints_0

    @joints_0.setter
    def joints_0(self, value):
        self._joints_0 = value

    @property
    def weights_0(self):
        """(n,4) float : Weight information for morphing.
        """
        return self._weights_0

    @weights_0.setter
    def weights_0(self, value):
        self._weights_0 = value

    @property
    def indices(self):
        """(m,3) int : Face indices for triangle meshes or fans.
        """
        return self._indices

    @indices.setter
    def indices(self, value):
        if value is not None:
            value = np.asanyarray(value, dtype=np.float32)
            value = np.ascontiguousarray(value)
        self._indices = value

    @property
    def material(self):
        """:class:`Material` : The material for this primitive.
        """
        return self._material

    @material.setter
    def material(self, value):
        # Create default material
        if value is None:
            value = MetallicRoughnessMaterial()
        else:
            if not isinstance(value, Material):
                raise TypeError('Object material must be of type Material')
        self._material = value

    @property
    def mode(self):
        """int : The type of primitive to render.
        """
        return self._mode

    @mode.setter
    def mode(self, value):
        value = int(value)
        if value < GLTF.POINTS or value > GLTF.TRIANGLE_FAN:
            raise ValueError('Invalid mode')
        self._mode = value

    @property
    def targets(self):
        """(k,) int : Morph target indices.
        """
        return self._targets

    @targets.setter
    def targets(self, value):
        self._targets = value

    @property
    def poses(self):
        """(x,4,4) float : Homogenous transforms for instancing this primitive.
        """
        return self._poses

    @poses.setter
    def poses(self, value):
        if value is not None:
            value = np.asanyarray(value, dtype=np.float32)
            value = np.ascontiguousarray(value)
            if value.ndim == 2:
                value = value[np.newaxis,:,:]
            if value.shape[1] != 4 or value.shape[2] != 4:
                raise ValueError('Pose matrices must be of shape (n,4,4), '
                                 'got {}'.format(value.shape))
        self._poses = value
        self._bounds = None

    @property
    def bounds(self):
        if self._bounds is None:
            self._bounds = self._compute_bounds()
        return self._bounds

    @property
    def centroid(self):
        """(3,) float : The centroid of the primitive's AABB.
        """
        return np.mean(self.bounds, axis=0)

    @property
    def extents(self):
        """(3,) float : The lengths of the axes of the primitive's AABB.
        """
        return np.diff(self.bounds, axis=0).reshape(-1)

    @property
    def scale(self):
        """(3,) float : The length of the diagonal of the primitive's AABB.
        """
        return np.linalg.norm(self.extents)

    @property
    def buf_flags(self):
        """int : The flags for the render buffer.
        """
        if self._buf_flags is None:
            self._buf_flags = self._compute_buf_flags()
        return self._buf_flags

    def delete(self):
        self._unbind()
        self._remove_from_context()

    @property
    def is_transparent(self):
        """bool : If True, the mesh is partially-transparent.
        """
        return self._compute_transparency()

    def _add_to_context(self):
        if self._vaid is not None:
            raise ValueError('Mesh is already bound to a context')

        # Generate and bind VAO
        self._vaid = glGenVertexArrays(1)
        glBindVertexArray(self._vaid)

        #######################################################################
        # Fill vertex buffer
        #######################################################################

        # Generate and bind vertex buffer
        vertexbuffer = glGenBuffers(1)
        self._buffers.append(vertexbuffer)
        glBindBuffer(GL_ARRAY_BUFFER, vertexbuffer)

        # positions
        vertex_data = self.positions
        attr_sizes = [3]

        # Normals
        if self.normals is not None:
            vertex_data = np.hstack((vertex_data, self.normals))
            attr_sizes.append(3)

        # Tangents
        if self.tangents is not None:
            vertex_data = np.hstack((vertex_data, self.tangents))
            attr_sizes.append(4)

        # Texture Coordinates
        if self.texcoord_0 is not None:
            vertex_data = np.hstack((vertex_data, self.texcoord_0))
            attr_sizes.append(2)
        if self.texcoord_1 is not None:
            vertex_data = np.hstack((vertex_data, self.texcoord_1))
            attr_sizes.append(2)

        # Color
        if self.color_0 is not None:
            vertex_data = np.hstack((vertex_data, self.color_0))
            attr_sizes.append(4)

        # TODO JOINTS AND WEIGHTS
        # PASS

        # Copy data to buffer
        vertex_data = np.ascontiguousarray(
            vertex_data.flatten().astype(np.float32)
        )
        glBufferData(
            GL_ARRAY_BUFFER, FLOAT_SZ * len(vertex_data),
            vertex_data, GL_STATIC_DRAW
        )
        total_sz = sum(attr_sizes)
        offset = 0
        for i, sz in enumerate(attr_sizes):
            glVertexAttribPointer(
                i, sz, GL_FLOAT, GL_FALSE, FLOAT_SZ * total_sz,
                ctypes.c_void_p(FLOAT_SZ * offset)
            )
            glEnableVertexAttribArray(i)
            offset += sz

        #######################################################################
        # Fill model matrix buffer
        #######################################################################

        if self.poses is not None:
            pose_data = np.ascontiguousarray(
                np.transpose(self.poses, [0,2,1]).flatten().astype(np.float32)
            )
        else:
            pose_data = np.ascontiguousarray(
                np.eye(4).flatten().astype(np.float32)
            )

        modelbuffer = glGenBuffers(1)
        self._buffers.append(modelbuffer)
        glBindBuffer(GL_ARRAY_BUFFER, modelbuffer)
        glBufferData(
            GL_ARRAY_BUFFER, FLOAT_SZ * len(pose_data),
            pose_data, GL_STATIC_DRAW
        )

        for i in range(0, 4):
            idx = i + len(attr_sizes)
            glEnableVertexAttribArray(idx)
            glVertexAttribPointer(
                idx, 4, GL_FLOAT, GL_FALSE, FLOAT_SZ * 4 * 4,
                ctypes.c_void_p(4 * FLOAT_SZ * i)
            )
            glVertexAttribDivisor(idx, 1)

        #######################################################################
        # Fill element buffer
        #######################################################################
        if self.indices is not None:
            elementbuffer = glGenBuffers(1)
            self._buffers.append(elementbuffer)
            glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, elementbuffer)
            glBufferData(GL_ELEMENT_ARRAY_BUFFER, UINT_SZ * self.indices.size,
                         self.indices.flatten().astype(np.uint32),
                         GL_STATIC_DRAW)

        glBindVertexArray(0)

    def _remove_from_context(self):
        if self._vaid is not None:
            glDeleteVertexArrays(1, [self._vaid])
            glDeleteBuffers(len(self._buffers), self._buffers)
            self._vaid = None
            self._buffers = []

    def _in_context(self):
        return self._vaid is not None

    def _bind(self):
        if self._vaid is None:
            raise ValueError('Cannot bind a Mesh that has not been added '
                             'to a context')
        glBindVertexArray(self._vaid)

    def _unbind(self):
        glBindVertexArray(0)

    def _compute_bounds(self):
        """Compute the bounds of this object.
        """
        # Compute bounds of this object
        bounds = np.array([np.min(self.positions, axis=0),
                           np.max(self.positions, axis=0)])

        # If instanced, compute translations for approximate bounds
        if self.poses is not None:
            bounds += np.array([np.min(self.poses[:,:3,3], axis=0),
                                np.max(self.poses[:,:3,3], axis=0)])
        return bounds

    def _compute_transparency(self):
        """Compute whether or not this object is transparent.
        """
        if self.material.is_transparent:
            return True
        if self._is_transparent is None:
            self._is_transparent = False
            if self.color_0 is not None:
                if np.any(self._color_0[:,3] != 1.0):
                    self._is_transparent = True
        return self._is_transparent

    def _compute_buf_flags(self):
        buf_flags = BufFlags.POSITION

        if self.normals is not None:
            buf_flags |= BufFlags.NORMAL
        if self.tangents is not None:
            buf_flags |= BufFlags.TANGENT
        if self.texcoord_0 is not None:
            buf_flags |= BufFlags.TEXCOORD_0
        if self.texcoord_1 is not None:
            buf_flags |= BufFlags.TEXCOORD_1
        if self.color_0 is not None:
            buf_flags |= BufFlags.COLOR_0
        if self.joints_0 is not None:
            buf_flags |= BufFlags.JOINTS_0
        if self.weights_0 is not None:
            buf_flags |= BufFlags.WEIGHTS_0

        return buf_flags


class Mesh(object):
    """A set of primitives to be rendered.

    Parameters
    ----------
    name : str
        The user-defined name of this object.
    primitives : list of :class:`Primitive`
        The primitives associated with this mesh.
    weights : (k,) float
        Array of weights to be applied to the Morph Targets.
    is_visible : bool
        If False, the mesh will not be rendered.
    """

    def __init__(self, primitives, name=None, weights=None, is_visible=True):
        self.primitives = primitives
        self.name = name
        self.weights = weights
        self.is_visible = is_visible

        self._bounds = None

    @property
    def name(self):
        """str : The user-defined name of this object.
        """
        return self._name

    @name.setter
    def name(self, value):
        if value is not None:
            value = str(value)
        self._name = value

    @property
    def primitives(self):
        """list of :class:`Primitive` : The primitives associated
        with this mesh.
        """
        return self._primitives

    @primitives.setter
    def primitives(self, value):
        self._primitives = value

    @property
    def weights(self):
        """(k,) float : Weights to be applied to morph targets.
        """
        return self._weights

    @weights.setter
    def weights(self, value):
        self._weights = value

    @property
    def is_visible(self):
        """bool : Whether the mesh is visible.
        """
        return self._is_visible

    @is_visible.setter
    def is_visible(self, value):
        self._is_visible = value

    @property
    def bounds(self):
        """(2,3) float : The axis-aligned bounds of the mesh.
        """
        if self._bounds is None:
            bounds = np.array([[np.infty, np.infty, np.infty],
                               [-np.infty, -np.infty, -np.infty]])
            for p in self.primitives:
                bounds[0] = np.minimum(bounds[0], p.bounds[0])
                bounds[1] = np.maximum(bounds[1], p.bounds[1])
            self._bounds = bounds
        return self._bounds

    @property
    def centroid(self):
        """(3,) float : The centroid of the mesh's axis-aligned bounding box
        (AABB).
        """
        return np.mean(self.bounds, axis=0)

    @property
    def extents(self):
        """(3,) float : The lengths of the axes of the mesh's AABB.
        """
        return np.diff(self.bounds, axis=0).reshape(-1)

    @property
    def scale(self):
        """(3,) float : The length of the diagonal of the mesh's AABB.
        """
        return np.linalg.norm(self.extents)

    @property
    def is_transparent(self):
        """bool : If True, the mesh is partially-transparent.
        """
        for p in self.primitives:
            if p.is_transparent:
                return True
        return False

    @staticmethod
    def from_points(points, colors=None, normals=None,
                    is_visible=True, poses=None):
        """Create a Mesh from a set of points.

        Parameters
        ----------
        points : (n,3) float
            The point positions.
        colors : (n,3) or (n,4) float, optional
            RGB or RGBA colors for each point.
        normals : (n,3) float, optionals
            The normal vectors for each point.
        is_visible : bool
            If False, the points will not be rendered.
        poses : (x,4,4)
            Array of 4x4 transformation matrices for instancing this object.

        Returns
        -------
        mesh : :class:`Mesh`
            The created mesh.
        """
        primitive = Primitive(
            positions=points,
            normals=normals,
            color_0=colors,
            mode=GLTF.POINTS,
            poses=poses
        )
        mesh = Mesh(primitives=[primitive], is_visible=is_visible)
        return mesh

    @staticmethod
    def from_trimesh(mesh, material=None, is_visible=True,
                     poses=None, wireframe=False, smooth=True):
        """Create a Mesh from a :class:`~trimesh.base.Trimesh`.

        Parameters
        ----------
        mesh : :class:`~trimesh.base.Trimesh` or list of them
            A triangular mesh or a list of meshes.
        material : :class:`Material`
            The material of the object. Overrides any mesh material.
            If not specified and the mesh has no material, a default material
            will be used.
        is_visible : bool
            If False, the mesh will not be rendered.
        poses : (n,4,4) float
            Array of 4x4 transformation matrices for instancing this object.
        wireframe : bool
            If `True`, the mesh will be rendered as a wireframe object
        smooth : bool
            If `True`, the mesh will be rendered with interpolated vertex
            normals. Otherwise, the mesh edges will stay sharp.

        Returns
        -------
        mesh : :class:`Mesh`
            The created mesh.
        """

        if isinstance(mesh, (list, tuple, set, np.ndarray)):
            meshes = list(mesh)
        elif isinstance(mesh, trimesh.Trimesh):
            meshes = [mesh]
        else:
            raise TypeError('Expected a Trimesh or a list, got a {}'
                            .format(type(mesh)))

        primitives = []
        for m in meshes:
            positions = None
            normals = None
            indices = None

            # Compute positions, normals, and indices
            if smooth:
                positions = m.vertices.copy()
                normals = m.vertex_normals.copy()
                indices = m.faces.copy()
            else:
                positions = m.vertices[m.faces].reshape((3 * len(m.faces), 3))
                normals = np.repeat(m.face_normals, 3, axis=0)

            # Compute colors, texture coords, and material properties
            color_0, texcoord_0, primitive_material = Mesh._get_trimesh_props(m, smooth=smooth, material=material)

            # Override if material is given.
            if material is not None:
                #primitive_material = copy.copy(material)
                primitive_material = copy.deepcopy(material)  # TODO

            if primitive_material is None:
                # Replace material with default if needed
                primitive_material = MetallicRoughnessMaterial(
                    alphaMode='BLEND',
                    baseColorFactor=[0.3, 0.3, 0.3, 1.0],
                    metallicFactor=0.2,
                    roughnessFactor=0.8
                )

            primitive_material.wireframe = wireframe
            # Create the primitive
            primitives.append(Primitive(
                positions=positions,
                normals=normals,
                texcoord_0=texcoord_0,
                color_0=color_0,
                indices=indices,
                material=primitive_material,
                mode=GLTF.TRIANGLES,
                poses=poses
            ))

        return Mesh(primitives=primitives, is_visible=is_visible)

    @staticmethod
    def _get_trimesh_props(mesh, smooth=False, material=None):
        """Gets the vertex colors, texture coordinates, and material properties
        from a :class:`~trimesh.base.Trimesh`.
        """
        colors = None
        texcoords = None

        # If the trimesh visual is undefined, return none for both
        if not mesh.visual.defined:
            return colors, texcoords, material

        # Process vertex colors
        if material is None:
            if mesh.visual.kind == 'vertex':
                vc = mesh.visual.vertex_colors.copy()
                if smooth:
                    colors = vc
                else:
                    colors = vc[mesh.faces].reshape(
                        (3 * len(mesh.faces), vc.shape[1])
                    )
                material = MetallicRoughnessMaterial(
                    alphaMode='BLEND',
                    baseColorFactor=[1.0, 1.0, 1.0, 1.0],
                    metallicFactor=0.2,
                    roughnessFactor=0.8
                )
            # Process face colors
            elif mesh.visual.kind == 'face':
                if smooth:
                    raise ValueError('Cannot use face colors with a smooth mesh')
                else:
                    colors = np.repeat(mesh.visual.face_colors, 3, axis=0)

                material = MetallicRoughnessMaterial(
                    alphaMode='BLEND',
                    baseColorFactor=[1.0, 1.0, 1.0, 1.0],
                    metallicFactor=0.2,
                    roughnessFactor=0.8
                )

        # Process texture colors
        if mesh.visual.kind == 'texture':
            # Configure UV coordinates
            if mesh.visual.uv is not None:
                uv = mesh.visual.uv.copy()
                if smooth:
                    texcoords = uv
                else:
                    texcoords = uv[mesh.faces].reshape(
                        (3 * len(mesh.faces), uv.shape[1])
                    )

            if material is None:
                # Configure mesh material
                mat = mesh.visual.material

                if isinstance(mat, trimesh.visual.texture.PBRMaterial):
                    material = MetallicRoughnessMaterial(
                        normalTexture=mat.normalTexture,
                        occlusionTexture=mat.occlusionTexture,
                        emissiveTexture=mat.emissiveTexture,
                        emissiveFactor=mat.emissiveFactor,
                        alphaMode='BLEND',
                        baseColorFactor=mat.baseColorFactor,
                        baseColorTexture=mat.baseColorTexture,
                        metallicFactor=mat.metallicFactor,
                        roughnessFactor=mat.roughnessFactor,
                        metallicRoughnessTexture=mat.metallicRoughnessTexture,
                        doubleSided=mat.doubleSided,
                        alphaCutoff=mat.alphaCutoff
                    )
                elif isinstance(mat, trimesh.visual.texture.SimpleMaterial):
                    glossiness = mat.kwargs.get('Ns', 1.0)
                    if isinstance(glossiness, list):
                        glossiness = float(glossiness[0])
                    roughness = (2 / (glossiness + 2)) ** (1.0 / 4.0)
                    material = MetallicRoughnessMaterial(
                        alphaMode='BLEND',
                        roughnessFactor=roughness,
                        baseColorFactor=mat.diffuse,
                        baseColorTexture=mat.image,
                    )
                elif isinstance(mat, MetallicRoughnessMaterial):
                    material = mat

        texcoords = None
        return colors, texcoords, material


class Node(object):
    """A node in the node hierarchy.

    Parameters
    ----------
    name : str, optional
        The user-defined name of this object.
    camera : :class:`Camera`, optional
        The camera in this node.
    children : list of :class:`Node`
        The children of this node.
    skin : int, optional
        The index of the skin referenced by this node.
    matrix : (4,4) float, optional
        A floating-point 4x4 transformation matrix.
    mesh : :class:`Mesh`, optional
        The mesh in this node.
    rotation : (4,) float, optional
        The node's unit quaternion in the order (x, y, z, w), where
        w is the scalar.
    scale : (3,) float, optional
        The node's non-uniform scale, given as the scaling factors along the x,
        y, and z axes.
    translation : (3,) float, optional
        The node's translation along the x, y, and z axes.
    weights : (n,) float
        The weights of the instantiated Morph Target. Number of elements must
        match number of Morph Targets of used mesh.
    light : :class:`Light`, optional
        The light in this node.
    """

    def __init__(self,
                 name=None,
                 camera=None,
                 children=None,
                 skin=None,
                 matrix=None,
                 mesh=None,
                 rotation=None,
                 scale=None,
                 translation=None,
                 weights=None,
                 light=None):
        # Set defaults
        if children is None:
            children = []

        self._matrix = None
        self._scale = None
        self._rotation = None
        self._translation = None
        if matrix is None:
            if rotation is None:
                rotation = np.array([0.0, 0.0, 0.0, 1.0])
            if translation is None:
                translation = np.zeros(3)
            if scale is None:
                scale = np.ones(3)
            self.rotation = rotation
            self.translation = translation
            self.scale = scale
        else:
            self.matrix = matrix

        self.name = name
        self.camera = camera
        self.children = children
        self.skin = skin
        self.mesh = mesh
        self.weights = weights
        self.light = light

    @property
    def name(self):
        """str : The user-defined name of this object.
        """
        return self._name

    @name.setter
    def name(self, value):
        if value is not None:
            value = str(value)
        self._name = value

    @property
    def camera(self):
        """:class:`Camera` : The camera in this node.
        """
        return self._camera

    @camera.setter
    def camera(self, value):
        if value is not None and not isinstance(value, Camera):
            raise TypeError('Value must be a camera')
        self._camera = value

    @property
    def children(self):
        """list of :class:`Node` : The children of this node.
        """
        return self._children

    @children.setter
    def children(self, value):
        self._children = value

    @property
    def skin(self):
        """int : The skin index for this node.
        """
        return self._skin

    @skin.setter
    def skin(self, value):
        self._skin = value

    @property
    def mesh(self):
        """:class:`Mesh` : The mesh in this node.
        """
        return self._mesh

    @mesh.setter
    def mesh(self, value):
        if value is not None and not isinstance(value, Mesh):
            raise TypeError('Value must be a mesh')
        self._mesh = value

    @property
    def light(self):
        """:class:`Light` : The light in this node.
        """
        return self._light

    @light.setter
    def light(self, value):
        if value is not None and not isinstance(value, Light):
            raise TypeError('Value must be a light')
        self._light = value

    @property
    def rotation(self):
        """(4,) float : The xyzw quaternion for this node.
        """
        return self._rotation

    @rotation.setter
    def rotation(self, value):
        value = np.asanyarray(value)
        if value.shape != (4,):
            raise ValueError('Quaternion must be a (4,) vector')
        if np.abs(np.linalg.norm(value) - 1.0) > 1e-3:
            raise ValueError('Quaternion must have norm == 1.0')
        self._rotation = value
        self._matrix = None

    @property
    def translation(self):
        """(3,) float : The translation for this node.
        """
        return self._translation

    @translation.setter
    def translation(self, value):
        value = np.asanyarray(value)
        if value.shape != (3,):
            raise ValueError('Translation must be a (3,) vector')
        self._translation = value
        self._matrix = None

    @property
    def scale(self):
        """(3,) float : The scale for this node.
        """
        return self._scale

    @scale.setter
    def scale(self, value):
        value = np.asanyarray(value)
        if value.shape != (3,):
            raise ValueError('Scale must be a (3,) vector')
        self._scale = value
        self._matrix = None

    @property
    def matrix(self):
        """(4,4) float : The homogenous transform matrix for this node.

        Note that this matrix's elements are not settable,
        it's just a copy of the internal matrix. You can set the whole
        matrix, but not an individual element.
        """
        if self._matrix is None:
            self._matrix = self._m_from_tqs(
                self.translation, self.rotation, self.scale
            )
        return self._matrix.copy()

    @matrix.setter
    def matrix(self, value):
        value = np.asanyarray(value)
        if value.shape != (4,4):
            raise ValueError('Matrix must be a 4x4 numpy ndarray')
        if not np.allclose(value[3,:], np.array([0.0, 0.0, 0.0, 1.0])):
            raise ValueError('Bottom row of matrix must be [0,0,0,1]')
        self._matrix = value
        self.rotation = Node._q_from_m(value)
        self.scale = Node._s_from_m(value)
        self.translation = Node._t_from_m(value)

    @staticmethod
    def _t_from_m(m):
        return m[:3,3]

    @staticmethod
    def _r_from_m(m):
        U = m[:3,:3]
        norms = np.linalg.norm(U.T, axis=1)
        return U / norms

    @staticmethod
    def _q_from_m(m):
        M = np.eye(4)
        M[:3,:3] = Node._r_from_m(m)
        q_wxyz = trimesh.transformations.quaternion_from_matrix(M)
        return np.roll(q_wxyz, -1)

    @staticmethod
    def _s_from_m(m):
        return np.linalg.norm(m[:3,:3].T, axis=1)

    @staticmethod
    def _r_from_q(q):
        q_wxyz = np.roll(q, 1)
        return trimesh.transformations.quaternion_matrix(q_wxyz)[:3,:3]

    @staticmethod
    def _m_from_tqs(t, q, s):
        S = np.eye(4)
        S[:3,:3] = np.diag(s)

        R = np.eye(4)
        R[:3,:3] = Node._r_from_q(q)

        T = np.eye(4)
        T[:3,3] = t

        return T.dot(R.dot(S))

class Scene(object):
    """A hierarchical scene graph.

    Parameters
    ----------
    nodes : list of :class:`Node`
        The set of all nodes in the scene.
    bg_color : (4,) float, optional
        Background color of scene.
    ambient_light : (3,) float, optional
        Color of ambient light. Defaults to no ambient light.
    name : str, optional
        The user-defined name of this object.
    """

    def __init__(self,
                 nodes=None,
                 bg_color=None,
                 ambient_light=None,
                 name=None):

        if bg_color is None:
            bg_color = np.ones(4)
        else:
            bg_color = format_color_vector(bg_color, 4)

        if ambient_light is None:
            ambient_light = np.zeros(3)

        if nodes is None:
            nodes = set()
        self._nodes = set()  # Will be added at the end of this function

        self.bg_color = bg_color
        self.ambient_light = ambient_light
        self.name = name

        self._name_to_nodes = {}
        self._obj_to_nodes = {}
        self._obj_name_to_nodes = {}
        self._mesh_nodes = set()
        self._point_light_nodes = set()
        self._spot_light_nodes = set()
        self._directional_light_nodes = set()
        self._camera_nodes = set()
        self._main_camera_node = None
        self._bounds = None

        # Transform tree
        self._digraph = nx.DiGraph()
        self._digraph.add_node('world')
        self._path_cache = {}

        # Find root nodes and add them
        if len(nodes) > 0:
            node_parent_map = {n: None for n in nodes}
            for node in nodes:
                for child in node.children:
                    if node_parent_map[child] is not None:
                        raise ValueError('Nodes may not have more than '
                                         'one parent')
                    node_parent_map[child] = node
            for node in node_parent_map:
                if node_parent_map[node] is None:
                    self.add_node(node)

    @property
    def name(self):
        """str : The user-defined name of this object.
        """
        return self._name

    @name.setter
    def name(self, value):
        if value is not None:
            value = str(value)
        self._name = value

    @property
    def nodes(self):
        """set of :class:`Node` : Set of nodes in the scene.
        """
        return self._nodes

    @property
    def bg_color(self):
        """(3,) float : The scene background color.
        """
        return self._bg_color

    @bg_color.setter
    def bg_color(self, value):
        if value is None:
            value = np.ones(4)
        else:
            value = format_color_vector(value, 4)
        self._bg_color = value

    @property
    def ambient_light(self):
        """(3,) float : The ambient light in the scene.
        """
        return self._ambient_light

    @ambient_light.setter
    def ambient_light(self, value):
        if value is None:
            value = np.zeros(3)
        else:
            value = format_color_vector(value, 3)
        self._ambient_light = value

    @property
    def meshes(self):
        """set of :class:`Mesh` : The meshes in the scene.
        """
        return set([n.mesh for n in self.mesh_nodes])

    @property
    def mesh_nodes(self):
        """set of :class:`Node` : The nodes containing meshes.
        """
        return self._mesh_nodes

    @property
    def lights(self):
        """set of :class:`Light` : The lights in the scene.
        """
        return self.point_lights | self.spot_lights | self.directional_lights

    @property
    def light_nodes(self):
        """set of :class:`Node` : The nodes containing lights.
        """
        return (self.point_light_nodes | self.spot_light_nodes |
                self.directional_light_nodes)

    @property
    def point_lights(self):
        """set of :class:`PointLight` : The point lights in the scene.
        """
        return set([n.light for n in self.point_light_nodes])

    @property
    def point_light_nodes(self):
        """set of :class:`Node` : The nodes containing point lights.
        """
        return self._point_light_nodes

    @property
    def spot_lights(self):
        """set of :class:`SpotLight` : The spot lights in the scene.
        """
        return set([n.light for n in self.spot_light_nodes])

    @property
    def spot_light_nodes(self):
        """set of :class:`Node` : The nodes containing spot lights.
        """
        return self._spot_light_nodes

    @property
    def directional_lights(self):
        """set of :class:`DirectionalLight` : The directional lights in
        the scene.
        """
        return set([n.light for n in self.directional_light_nodes])

    @property
    def directional_light_nodes(self):
        """set of :class:`Node` : The nodes containing directional lights.
        """
        return self._directional_light_nodes

    @property
    def cameras(self):
        """set of :class:`Camera` : The cameras in the scene.
        """
        return set([n.camera for n in self.camera_nodes])

    @property
    def camera_nodes(self):
        """set of :class:`Node` : The nodes containing cameras in the scene.
        """
        return self._camera_nodes

    @property
    def main_camera_node(self):
        """set of :class:`Node` : The node containing the main camera in the
        scene.
        """
        return self._main_camera_node

    @main_camera_node.setter
    def main_camera_node(self, value):
        if value not in self.nodes:
            raise ValueError('New main camera node must already be in scene')
        self._main_camera_node = value

    @property
    def bounds(self):
        """(2,3) float : The axis-aligned bounds of the scene.
        """
        if self._bounds is None:
            # Compute corners
            corners = []
            for mesh_node in self.mesh_nodes:
                mesh = mesh_node.mesh
                pose = self.get_pose(mesh_node)
                corners_local = trimesh.bounds.corners(mesh.bounds)
                corners_world = pose[:3,:3].dot(corners_local.T).T + pose[:3,3]
                corners.append(corners_world)
            if len(corners) == 0:
                self._bounds = np.zeros((2,3))
            else:
                corners = np.vstack(corners)
                self._bounds = np.array([np.min(corners, axis=0),
                                         np.max(corners, axis=0)])
        return self._bounds

    @property
    def centroid(self):
        """(3,) float : The centroid of the scene's axis-aligned bounding box
        (AABB).
        """
        return np.mean(self.bounds, axis=0)

    @property
    def extents(self):
        """(3,) float : The lengths of the axes of the scene's AABB.
        """
        return np.diff(self.bounds, axis=0).reshape(-1)

    @property
    def scale(self):
        """(3,) float : The length of the diagonal of the scene's AABB.
        """
        return np.linalg.norm(self.extents)

    def add(self, obj, name=None, pose=None,
            parent_node=None, parent_name=None):
        """Add an object (mesh, light, or camera) to the scene.

        Parameters
        ----------
        obj : :class:`Mesh`, :class:`Light`, or :class:`Camera`
            The object to add to the scene.
        name : str
            A name for the new node to be created.
        pose : (4,4) float
            The local pose of this node relative to its parent node.
        parent_node : :class:`Node`
            The parent of this Node. If None, the new node is a root node.
        parent_name : str
            The name of the parent node, can be specified instead of
            `parent_node`.

        Returns
        -------
        node : :class:`Node`
            The newly-created and inserted node.
        """
        if isinstance(obj, Mesh):
            node = Node(name=name, matrix=pose, mesh=obj)
        elif isinstance(obj, Light):
            node = Node(name=name, matrix=pose, light=obj)
        elif isinstance(obj, Camera):
            node = Node(name=name, matrix=pose, camera=obj)
        else:
            raise TypeError('Unrecognized object type')

        if parent_node is None and parent_name is not None:
            parent_nodes = self.get_nodes(name=parent_name)
            if len(parent_nodes) == 0:
                raise ValueError('No parent node with name {} found'
                                 .format(parent_name))
            elif len(parent_nodes) > 1:
                raise ValueError('More than one parent node with name {} found'
                                 .format(parent_name))
            parent_node = list(parent_nodes)[0]

        self.add_node(node, parent_node=parent_node)

        return node

    def get_nodes(self, node=None, name=None, obj=None, obj_name=None):
        """Search for existing nodes. Only nodes matching all specified
        parameters is returned, or None if no such node exists.

        Parameters
        ----------
        node : :class:`Node`, optional
            If present, returns this node if it is in the scene.
        name : str
            A name for the Node.
        obj : :class:`Mesh`, :class:`Light`, or :class:`Camera`
            An object that is attached to the node.
        obj_name : str
            The name of an object that is attached to the node.

        Returns
        -------
        nodes : set of :class:`.Node`
            The nodes that match all query terms.
        """
        if node is not None:
            if node in self.nodes:
                return set([node])
            else:
                return set()
        nodes = set(self.nodes)
        if name is not None:
            matches = set()
            if name in self._name_to_nodes:
                matches = self._name_to_nodes[name]
            nodes = nodes & matches
        if obj is not None:
            matches = set()
            if obj in self._obj_to_nodes:
                matches = self._obj_to_nodes[obj]
            nodes = nodes & matches
        if obj_name is not None:
            matches = set()
            if obj_name in self._obj_name_to_nodes:
                matches = self._obj_name_to_nodes[obj_name]
            nodes = nodes & matches

        return nodes

    def add_node(self, node, parent_node=None):
        """Add a Node to the scene.

        Parameters
        ----------
        node : :class:`Node`
            The node to be added.
        parent_node : :class:`Node`
            The parent of this Node. If None, the new node is a root node.
        """
        if node in self.nodes:
            raise ValueError('Node already in scene')
        self.nodes.add(node)

        # Add node to sets
        if node.name is not None:
            if node.name not in self._name_to_nodes:
                self._name_to_nodes[node.name] = set()
            self._name_to_nodes[node.name].add(node)
        for obj in [node.mesh, node.camera, node.light]:
            if obj is not None:
                if obj not in self._obj_to_nodes:
                    self._obj_to_nodes[obj] = set()
                self._obj_to_nodes[obj].add(node)
                if obj.name is not None:
                    if obj.name not in self._obj_name_to_nodes:
                        self._obj_name_to_nodes[obj.name] = set()
                    self._obj_name_to_nodes[obj.name].add(node)
        if node.mesh is not None:
            self._mesh_nodes.add(node)
        if node.light is not None:
            if isinstance(node.light, PointLight):
                self._point_light_nodes.add(node)
            if isinstance(node.light, SpotLight):
                self._spot_light_nodes.add(node)
            if isinstance(node.light, DirectionalLight):
                self._directional_light_nodes.add(node)
        if node.camera is not None:
            self._camera_nodes.add(node)
            if self._main_camera_node is None:
                self._main_camera_node = node

        if parent_node is None:
            parent_node = 'world'
        elif parent_node not in self.nodes:
            raise ValueError('Parent node must already be in scene')
        elif node not in parent_node.children:
            parent_node.children.append(node)

        # Create node in graph
        self._digraph.add_node(node)
        self._digraph.add_edge(node, parent_node)

        # Iterate over children
        for child in node.children:
            self.add_node(child, node)

        self._path_cache = {}
        self._bounds = None

    def has_node(self, node):
        """Check if a node is already in the scene.

        Parameters
        ----------
        node : :class:`Node`
            The node to be checked.

        Returns
        -------
        has_node : bool
            True if the node is already in the scene and false otherwise.
        """
        return node in self.nodes

    def remove_node(self, node):
        """Remove a node and all its children from the scene.

        Parameters
        ----------
        node : :class:`Node`
            The node to be removed.
        """
        # Disconnect self from parent who is staying in the graph
        parent = list(self._digraph.neighbors(node))[0]
        self._remove_node(node)
        if isinstance(parent, Node):
            parent.children.remove(node)
        self._path_cache = {}
        self._bounds = None

    def get_pose(self, node):
        """Get the world-frame pose of a node in the scene.

        Parameters
        ----------
        node : :class:`Node`
            The node to find the pose of.

        Returns
        -------
        pose : (4,4) float
            The transform matrix for this node.
        """
        if node not in self.nodes:
            raise ValueError('Node must already be in scene')
        if node in self._path_cache:
            path = self._path_cache[node]
        else:
            # Get path from from_frame to to_frame
            path = nx.shortest_path(self._digraph, node, 'world')
            self._path_cache[node] = path

        # Traverse from from_node to to_node
        pose = np.eye(4)
        for n in path[:-1]:
            pose = np.dot(n.matrix, pose)

        return pose

    def set_pose(self, node, pose):
        """Set the local-frame pose of a node in the scene.

        Parameters
        ----------
        node : :class:`Node`
            The node to set the pose of.
        pose : (4,4) float
            The pose to set the node to.
        """
        if node not in self.nodes:
            raise ValueError('Node must already be in scene')
        node._matrix = pose
        if node.mesh is not None:
            self._bounds = None

    def clear(self):
        """Clear out all nodes to form an empty scene.
        """
        self._nodes = set()

        self._name_to_nodes = {}
        self._obj_to_nodes = {}
        self._obj_name_to_nodes = {}
        self._mesh_nodes = set()
        self._point_light_nodes = set()
        self._spot_light_nodes = set()
        self._directional_light_nodes = set()
        self._camera_nodes = set()
        self._main_camera_node = None
        self._bounds = None

        # Transform tree
        self._digraph = nx.DiGraph()
        self._digraph.add_node('world')
        self._path_cache = {}

    def _remove_node(self, node):
        """Remove a node and all its children from the scene.

        Parameters
        ----------
        node : :class:`Node`
            The node to be removed.
        """

        # Remove self from nodes
        self.nodes.remove(node)

        # Remove children
        for child in node.children:
            self._remove_node(child)

        # Remove self from the graph
        self._digraph.remove_node(node)

        # Remove from maps
        if node.name in self._name_to_nodes:
            self._name_to_nodes[node.name].remove(node)
            if len(self._name_to_nodes[node.name]) == 0:
                self._name_to_nodes.pop(node.name)
        for obj in [node.mesh, node.camera, node.light]:
            if obj is None:
                continue
            self._obj_to_nodes[obj].remove(node)
            if len(self._obj_to_nodes[obj]) == 0:
                self._obj_to_nodes.pop(obj)
            if obj.name is not None:
                self._obj_name_to_nodes[obj.name].remove(node)
                if len(self._obj_name_to_nodes[obj.name]) == 0:
                    self._obj_name_to_nodes.pop(obj.name)
        if node.mesh is not None:
            self._mesh_nodes.remove(node)
        if node.light is not None:
            if isinstance(node.light, PointLight):
                self._point_light_nodes.remove(node)
            if isinstance(node.light, SpotLight):
                self._spot_light_nodes.remove(node)
            if isinstance(node.light, DirectionalLight):
                self._directional_light_nodes.remove(node)
        if node.camera is not None:
            self._camera_nodes.remove(node)
            if self._main_camera_node == node:
                if len(self._camera_nodes) > 0:
                    self._main_camera_node = next(iter(self._camera_nodes))
                else:
                    self._main_camera_node = None

    @staticmethod
    def from_trimesh_scene(trimesh_scene,
                           bg_color=None, ambient_light=None):
        """Create a :class:`.Scene` from a :class:`trimesh.scene.scene.Scene`.

        Parameters
        ----------
        trimesh_scene : :class:`trimesh.scene.scene.Scene`
            Scene with :class:~`trimesh.base.Trimesh` objects.
        bg_color : (4,) float
            Background color for the created scene.
        ambient_light : (3,) float or None
            Ambient light in the scene.

        Returns
        -------
        scene_pr : :class:`Scene`
            A scene containing the same geometry as the trimesh scene.
        """
        # convert trimesh geometries to pyrender geometries
        geometries = {name: Mesh.from_trimesh(geom)
                      for name, geom in trimesh_scene.geometry.items()}

        # create the pyrender scene object
        scene_pr = Scene(bg_color=bg_color, ambient_light=ambient_light)

        # add every node with geometry to the pyrender scene
        for node in trimesh_scene.graph.nodes_geometry:
            pose, geom_name = trimesh_scene.graph[node]
            scene_pr.add(geometries[geom_name], pose=pose)

        return scene_pr


class Renderer(object):
    """Class for handling all rendering operations on a scene.

    Note
    ----
    This renderer relies on the existence of an OpenGL context and
    does not create one on its own.

    Parameters
    ----------
    viewport_width : int
        Width of the viewport in pixels.
    viewport_height : int
        Width of the viewport height in pixels.
    point_size : float, optional
        Size of points in pixels. Defaults to 1.0.
    """

    def __init__(self, viewport_width, viewport_height, point_size=1.0):
        self.dpscale = 1
        # Scaling needed on retina displays
        if sys.platform == 'darwin':
            self.dpscale = 2

        self.viewport_width = viewport_width
        self.viewport_height = viewport_height
        self.point_size = point_size

        # Optional framebuffer for offscreen renders
        self._main_fb = None
        self._main_cb = None
        self._main_db = None
        self._main_fb_ms = None
        self._main_cb_ms = None
        self._main_db_ms = None
        self._main_fb_dims = (None, None)
        self._shadow_fb = None
        self._latest_znear = DEFAULT_Z_NEAR
        self._latest_zfar = DEFAULT_Z_FAR

        # Shader Program Cache
        self._program_cache = ShaderProgramCache()
        self._meshes = set()
        self._mesh_textures = set()
        self._shadow_textures = set()
        self._texture_alloc_idx = 0

    @property
    def viewport_width(self):
        """int : The width of the main viewport, in pixels.
        """
        return self._viewport_width

    @viewport_width.setter
    def viewport_width(self, value):
        self._viewport_width = self.dpscale * value

    @property
    def viewport_height(self):
        """int : The height of the main viewport, in pixels.
        """
        return self._viewport_height

    @viewport_height.setter
    def viewport_height(self, value):
        self._viewport_height = self.dpscale * value

    @property
    def point_size(self):
        """float : The size of screen-space points, in pixels.
        """
        return self._point_size

    @point_size.setter
    def point_size(self, value):
        self._point_size = float(value)

    def render(self, scene, flags, seg_node_map=None):
        """Render a scene with the given set of flags.

        Parameters
        ----------
        scene : :class:`Scene`
            A scene to render.
        flags : int
            A specification from :class:`.RenderFlags`.
        seg_node_map : dict
            A map from :class:`.Node` objects to (3,) colors for each.
            If specified along with flags set to :attr:`.RenderFlags.SEG`,
            the color image will be a segmentation image.

        Returns
        -------
        color_im : (h, w, 3) uint8 or (h, w, 4) uint8
            If :attr:`RenderFlags.OFFSCREEN` is set, the color buffer. This is
            normally an RGB buffer, but if :attr:`.RenderFlags.RGBA` is set,
            the buffer will be a full RGBA buffer.
        depth_im : (h, w) float32
            If :attr:`RenderFlags.OFFSCREEN` is set, the depth buffer
            in linear units.
        """
        # Update context with meshes and textures
        self._update_context(scene, flags)

        # Render necessary shadow maps
        if not bool(flags & RenderFlags.DEPTH_ONLY or flags & RenderFlags.SEG):
            for ln in scene.light_nodes:
                take_pass = False
                if (isinstance(ln.light, DirectionalLight) and
                        bool(flags & RenderFlags.SHADOWS_DIRECTIONAL)):
                    take_pass = True
                elif (isinstance(ln.light, SpotLight) and
                        bool(flags & RenderFlags.SHADOWS_SPOT)):
                    take_pass = True
                elif (isinstance(ln.light, PointLight) and
                        bool(flags & RenderFlags.SHADOWS_POINT)):
                    take_pass = True
                if take_pass:
                    self._shadow_mapping_pass(scene, ln, flags)

        # Make forward pass
        retval = self._forward_pass(scene, flags, seg_node_map=seg_node_map)

        # If necessary, make normals pass
        if flags & (RenderFlags.VERTEX_NORMALS | RenderFlags.FACE_NORMALS):
            self._normals_pass(scene, flags)

        # Update camera settings for retrieving depth buffers
        self._latest_znear = scene.main_camera_node.camera.znear
        self._latest_zfar = scene.main_camera_node.camera.zfar

        return retval

    def read_color_buf(self):
        """Read and return the current viewport's color buffer.

        Alpha cannot be computed for an on-screen buffer.

        Returns
        -------
        color_im : (h, w, 3) uint8
            The color buffer in RGB byte format.
        """
        # Extract color image from frame buffer
        width, height = self.viewport_width, self.viewport_height
        glBindFramebuffer(GL_READ_FRAMEBUFFER, 0)
        glReadBuffer(GL_FRONT)
        color_buf = glReadPixels(0, 0, width, height, GL_RGB, GL_UNSIGNED_BYTE)

        # Re-format them into numpy arrays
        color_im = np.frombuffer(color_buf, dtype=np.uint8)
        color_im = color_im.reshape((height, width, 3))
        color_im = np.flip(color_im, axis=0)

        # Resize for macos if needed
        if sys.platform == 'darwin':
            color_im = self._resize_image(color_im, True)

        return color_im

    def read_depth_buf(self):
        """Read and return the current viewport's color buffer.

        Returns
        -------
        depth_im : (h, w) float32
            The depth buffer in linear units.
        """
        width, height = self.viewport_width, self.viewport_height
        glBindFramebuffer(GL_READ_FRAMEBUFFER, 0)
        glReadBuffer(GL_FRONT)
        depth_buf = glReadPixels(
            0, 0, width, height, GL_DEPTH_COMPONENT, GL_FLOAT
        )

        depth_im = np.frombuffer(depth_buf, dtype=np.float32)
        depth_im = depth_im.reshape((height, width))
        depth_im = np.flip(depth_im, axis=0)

        inf_inds = (depth_im == 1.0)
        depth_im = 2.0 * depth_im - 1.0
        z_near, z_far = self._latest_znear, self._latest_zfar
        noninf = np.logical_not(inf_inds)
        if z_far is None:
            depth_im[noninf] = 2 * z_near / (1.0 - depth_im[noninf])
        else:
            depth_im[noninf] = ((2.0 * z_near * z_far) /
                                (z_far + z_near - depth_im[noninf] *
                                (z_far - z_near)))
        depth_im[inf_inds] = 0.0

        # Resize for macos if needed
        if sys.platform == 'darwin':
            depth_im = self._resize_image(depth_im)

        return depth_im

    def delete(self):
        """Free all allocated OpenGL resources.
        """
        # Free shaders
        self._program_cache.clear()

        # Free meshes
        for mesh in self._meshes:
            for p in mesh.primitives:
                p.delete()

        # Free textures
        for mesh_texture in self._mesh_textures:
            mesh_texture.delete()

        for shadow_texture in self._shadow_textures:
            shadow_texture.delete()

        self._meshes = set()
        self._mesh_textures = set()
        self._shadow_textures = set()
        self._texture_alloc_idx = 0

        self._delete_main_framebuffer()
        self._delete_shadow_framebuffer()

    def __del__(self):
        try:
            self.delete()
        except Exception:
            pass

    ###########################################################################
    # Rendering passes
    ###########################################################################

    def _forward_pass(self, scene, flags, seg_node_map=None):
        # Set up viewport for render
        self._configure_forward_pass_viewport(flags)

        # Clear it
        if bool(flags & RenderFlags.SEG):
            glClearColor(0.0, 0.0, 0.0, 1.0)
            if seg_node_map is None:
                seg_node_map = {}
        else:
            glClearColor(*scene.bg_color)

        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)

        if not bool(flags & RenderFlags.SEG):
            glEnable(GL_MULTISAMPLE)
        else:
            glDisable(GL_MULTISAMPLE)

        # Set up camera matrices
        V, P = self._get_camera_matrices(scene)

        program = None
        # Now, render each object in sorted order
        for node in self._sorted_mesh_nodes(scene):
            mesh = node.mesh

            # Skip the mesh if it's not visible
            if not mesh.is_visible:
                continue

            # If SEG, set color
            if bool(flags & RenderFlags.SEG):
                if node not in seg_node_map:
                    continue
                color = seg_node_map[node]
                if not isinstance(color, (list, tuple, np.ndarray)):
                    color = np.repeat(color, 3)
                else:
                    color = np.asanyarray(color)
                color = color / 255.0

            for primitive in mesh.primitives:

                # First, get and bind the appropriate program
                program = self._get_primitive_program(
                    primitive, flags, ProgramFlags.USE_MATERIAL
                )
                program._bind()

                # Set the camera uniforms
                program.set_uniform('V', V)
                program.set_uniform('P', P)
                program.set_uniform(
                    'cam_pos', scene.get_pose(scene.main_camera_node)[:3,3]
                )
                if bool(flags & RenderFlags.SEG):
                    program.set_uniform('color', color)

                # Next, bind the lighting
                if not (flags & RenderFlags.DEPTH_ONLY or flags & RenderFlags.FLAT or
                        flags & RenderFlags.SEG):
                    self._bind_lighting(scene, program, node, flags)

                # Finally, bind and draw the primitive
                self._bind_and_draw_primitive(
                    primitive=primitive,
                    pose=scene.get_pose(node),
                    program=program,
                    flags=flags
                )
                self._reset_active_textures()

        # Unbind the shader and flush the output
        if program is not None:
            program._unbind()
        glFlush()

        # If doing offscreen render, copy result from framebuffer and return
        if flags & RenderFlags.OFFSCREEN:
            return self._read_main_framebuffer(scene, flags)
        else:
            return

    def _shadow_mapping_pass(self, scene, light_node, flags):
        light = light_node.light

        # Set up viewport for render
        self._configure_shadow_mapping_viewport(light, flags)

        # Set up camera matrices
        V, P = self._get_light_cam_matrices(scene, light_node, flags)

        # Now, render each object in sorted order
        for node in self._sorted_mesh_nodes(scene):
            mesh = node.mesh

            # Skip the mesh if it's not visible
            if not mesh.is_visible:
                continue

            for primitive in mesh.primitives:

                # First, get and bind the appropriate program
                program = self._get_primitive_program(
                    primitive, flags, ProgramFlags.NONE
                )
                program._bind()

                # Set the camera uniforms
                program.set_uniform('V', V)
                program.set_uniform('P', P)
                program.set_uniform(
                    'cam_pos', scene.get_pose(scene.main_camera_node)[:3,3]
                )

                # Finally, bind and draw the primitive
                self._bind_and_draw_primitive(
                    primitive=primitive,
                    pose=scene.get_pose(node),
                    program=program,
                    flags=RenderFlags.DEPTH_ONLY
                )
                self._reset_active_textures()

        # Unbind the shader and flush the output
        if program is not None:
            program._unbind()
        glFlush()

    def _normals_pass(self, scene, flags):
        # Set up viewport for render
        self._configure_forward_pass_viewport(flags)
        program = None

        # Set up camera matrices
        V, P = self._get_camera_matrices(scene)

        # Now, render each object in sorted order
        for node in self._sorted_mesh_nodes(scene):
            mesh = node.mesh

            # Skip the mesh if it's not visible
            if not mesh.is_visible:
                continue

            for primitive in mesh.primitives:

                # Skip objects that don't have normals
                if not primitive.buf_flags & BufFlags.NORMAL:
                    continue

                # First, get and bind the appropriate program
                pf = ProgramFlags.NONE
                if flags & RenderFlags.VERTEX_NORMALS:
                    pf = pf | ProgramFlags.VERTEX_NORMALS
                if flags & RenderFlags.FACE_NORMALS:
                    pf = pf | ProgramFlags.FACE_NORMALS
                program = self._get_primitive_program(primitive, flags, pf)
                program._bind()

                # Set the camera uniforms
                program.set_uniform('V', V)
                program.set_uniform('P', P)
                program.set_uniform('normal_magnitude', 0.05 * primitive.scale)
                program.set_uniform(
                    'normal_color', np.array([0.1, 0.1, 1.0, 1.0])
                )

                # Finally, bind and draw the primitive
                self._bind_and_draw_primitive(
                    primitive=primitive,
                    pose=scene.get_pose(node),
                    program=program,
                    flags=RenderFlags.DEPTH_ONLY
                )
                self._reset_active_textures()

        # Unbind the shader and flush the output
        if program is not None:
            program._unbind()
        glFlush()

    ###########################################################################
    # Handlers for binding uniforms and drawing primitives
    ###########################################################################

    def _bind_and_draw_primitive(self, primitive, pose, program, flags):
        # Set model pose matrix
        program.set_uniform('M', pose)

        # Bind mesh buffers
        primitive._bind()

        # Bind mesh material
        if not (flags & RenderFlags.DEPTH_ONLY or flags & RenderFlags.SEG):
            material = primitive.material

            # Bind textures
            tf = material.tex_flags
            if tf & TexFlags.NORMAL:
                self._bind_texture(material.normalTexture,
                                   'material.normal_texture', program)
            if tf & TexFlags.OCCLUSION:
                self._bind_texture(material.occlusionTexture,
                                   'material.occlusion_texture', program)
            if tf & TexFlags.EMISSIVE:
                self._bind_texture(material.emissiveTexture,
                                   'material.emissive_texture', program)
            if tf & TexFlags.BASE_COLOR:
                self._bind_texture(material.baseColorTexture,
                                   'material.base_color_texture', program)
            if tf & TexFlags.METALLIC_ROUGHNESS:
                self._bind_texture(material.metallicRoughnessTexture,
                                   'material.metallic_roughness_texture',
                                   program)
            if tf & TexFlags.DIFFUSE:
                self._bind_texture(material.diffuseTexture,
                                   'material.diffuse_texture', program)
            if tf & TexFlags.SPECULAR_GLOSSINESS:
                self._bind_texture(material.specularGlossinessTexture,
                                   'material.specular_glossiness_texture',
                                   program)

            # Bind other uniforms
            b = 'material.{}'
            program.set_uniform(b.format('emissive_factor'),
                                material.emissiveFactor)
            if isinstance(material, MetallicRoughnessMaterial):
                program.set_uniform(b.format('base_color_factor'),
                                    material.baseColorFactor)
                program.set_uniform(b.format('metallic_factor'),
                                    material.metallicFactor)
                program.set_uniform(b.format('roughness_factor'),
                                    material.roughnessFactor)
            elif isinstance(material, SpecularGlossinessMaterial):
                program.set_uniform(b.format('diffuse_factor'),
                                    material.diffuseFactor)
                program.set_uniform(b.format('specular_factor'),
                                    material.specularFactor)
                program.set_uniform(b.format('glossiness_factor'),
                                    material.glossinessFactor)

            # Set blending options
            if material.alphaMode == 'BLEND':
                glEnable(GL_BLEND)
                glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA)
            else:
                glEnable(GL_BLEND)
                glBlendFunc(GL_ONE, GL_ZERO)

            # Set wireframe mode
            wf = material.wireframe
            if flags & RenderFlags.FLIP_WIREFRAME:
                wf = not wf
            if (flags & RenderFlags.ALL_WIREFRAME) or wf:
                glPolygonMode(GL_FRONT_AND_BACK, GL_LINE)
            else:
                glPolygonMode(GL_FRONT_AND_BACK, GL_FILL)

            # Set culling mode
            if material.doubleSided or flags & RenderFlags.SKIP_CULL_FACES:
                glDisable(GL_CULL_FACE)
            else:
                glEnable(GL_CULL_FACE)
                glCullFace(GL_BACK)
        else:
            glEnable(GL_CULL_FACE)
            glEnable(GL_BLEND)
            glCullFace(GL_BACK)
            glBlendFunc(GL_ONE, GL_ZERO)
            glPolygonMode(GL_FRONT_AND_BACK, GL_FILL)

        # Set point size if needed
        glDisable(GL_PROGRAM_POINT_SIZE)
        if primitive.mode == GLTF.POINTS:
            glEnable(GL_PROGRAM_POINT_SIZE)
            glPointSize(self.point_size)

        # Render mesh
        n_instances = 1
        if primitive.poses is not None:
            n_instances = len(primitive.poses)

        if primitive.indices is not None:
            glDrawElementsInstanced(
                primitive.mode, primitive.indices.size, GL_UNSIGNED_INT,
                ctypes.c_void_p(0), n_instances
            )
        else:
            glDrawArraysInstanced(
                primitive.mode, 0, len(primitive.positions), n_instances
            )

        # Unbind mesh buffers
        primitive._unbind()

    def _bind_lighting(self, scene, program, node, flags):
        """Bind all lighting uniform values for a scene.
        """
        max_n_lights = self._compute_max_n_lights(flags)

        n_d = min(len(scene.directional_light_nodes), max_n_lights[0])
        n_s = min(len(scene.spot_light_nodes), max_n_lights[1])
        n_p = min(len(scene.point_light_nodes), max_n_lights[2])
        program.set_uniform('ambient_light', scene.ambient_light)
        program.set_uniform('n_directional_lights', n_d)
        program.set_uniform('n_spot_lights', n_s)
        program.set_uniform('n_point_lights', n_p)
        plc = 0
        slc = 0
        dlc = 0

        light_nodes = scene.light_nodes
        if (len(scene.directional_light_nodes) > max_n_lights[0] or
                len(scene.spot_light_nodes) > max_n_lights[1] or
                len(scene.point_light_nodes) > max_n_lights[2]):
            light_nodes = self._sorted_nodes_by_distance(
                scene, scene.light_nodes, node
            )

        for n in light_nodes:
            light = n.light
            pose = scene.get_pose(n)
            position = pose[:3,3]
            direction = -pose[:3,2]

            if isinstance(light, PointLight):
                if plc == max_n_lights[2]:
                    continue
                b = 'point_lights[{}].'.format(plc)
                plc += 1
                shadow = bool(flags & RenderFlags.SHADOWS_POINT)
                program.set_uniform(b + 'position', position)
            elif isinstance(light, SpotLight):
                if slc == max_n_lights[1]:
                    continue
                b = 'spot_lights[{}].'.format(slc)
                slc += 1
                shadow = bool(flags & RenderFlags.SHADOWS_SPOT)
                las = 1.0 / max(0.001, np.cos(light.innerConeAngle) -
                                np.cos(light.outerConeAngle))
                lao = -np.cos(light.outerConeAngle) * las
                program.set_uniform(b + 'direction', direction)
                program.set_uniform(b + 'position', position)
                program.set_uniform(b + 'light_angle_scale', las)
                program.set_uniform(b + 'light_angle_offset', lao)
            else:
                if dlc == max_n_lights[0]:
                    continue
                b = 'directional_lights[{}].'.format(dlc)
                dlc += 1
                shadow = bool(flags & RenderFlags.SHADOWS_DIRECTIONAL)
                program.set_uniform(b + 'direction', direction)

            program.set_uniform(b + 'color', light.color)
            program.set_uniform(b + 'intensity', light.intensity)
            # if light.range is not None:
            #     program.set_uniform(b + 'range', light.range)
            # else:
            #     program.set_uniform(b + 'range', 0)

            if shadow:
                self._bind_texture(light.shadow_texture,
                                   b + 'shadow_map', program)
                if not isinstance(light, PointLight):
                    V, P = self._get_light_cam_matrices(scene, n, flags)
                    program.set_uniform(b + 'light_matrix', P.dot(V))
                else:
                    raise NotImplementedError(
                        'Point light shadows not implemented'
                    )

    def _sorted_mesh_nodes(self, scene):
        cam_loc = scene.get_pose(scene.main_camera_node)[:3,3]
        solid_nodes = []
        trans_nodes = []
        for node in scene.mesh_nodes:
            mesh = node.mesh
            if mesh.is_transparent:
                trans_nodes.append(node)
            else:
                solid_nodes.append(node)

        # TODO BETTER SORTING METHOD
        trans_nodes.sort(
            key=lambda n: -np.linalg.norm(scene.get_pose(n)[:3,3] - cam_loc)
        )
        solid_nodes.sort(
            key=lambda n: -np.linalg.norm(scene.get_pose(n)[:3,3] - cam_loc)
        )

        return solid_nodes + trans_nodes

    def _sorted_nodes_by_distance(self, scene, nodes, compare_node):
        nodes = list(nodes)
        compare_posn = scene.get_pose(compare_node)[:3,3]
        nodes.sort(key=lambda n: np.linalg.norm(
            scene.get_pose(n)[:3,3] - compare_posn)
        )
        return nodes

    ###########################################################################
    # Context Management
    ###########################################################################

    def _update_context(self, scene, flags):

        # Update meshes
        scene_meshes = scene.meshes

        # Add new meshes to context
        for mesh in scene_meshes - self._meshes:
            for p in mesh.primitives:
                p._add_to_context()

        # Remove old meshes from context
        for mesh in self._meshes - scene_meshes:
            for p in mesh.primitives:
                p.delete()

        self._meshes = scene_meshes.copy()

        # Update mesh textures
        mesh_textures = set()
        for m in scene_meshes:
            for p in m.primitives:
                mesh_textures |= p.material.textures

        # Add new textures to context
        for texture in mesh_textures - self._mesh_textures:
            texture._add_to_context()

        # Remove old textures from context
        for texture in self._mesh_textures - mesh_textures:
            texture.delete()

        self._mesh_textures = mesh_textures.copy()

        shadow_textures = set()
        for l in scene.lights:
            # Create if needed
            active = False
            if (isinstance(l, DirectionalLight) and
                    flags & RenderFlags.SHADOWS_DIRECTIONAL):
                active = True
            elif (isinstance(l, PointLight) and
                    flags & RenderFlags.SHADOWS_POINT):
                active = True
            elif isinstance(l, SpotLight) and flags & RenderFlags.SHADOWS_SPOT:
                active = True

            if active and l.shadow_texture is None:
                l._generate_shadow_texture()
            if l.shadow_texture is not None:
                shadow_textures.add(l.shadow_texture)

        # Add new textures to context
        for texture in shadow_textures - self._shadow_textures:
            texture._add_to_context()

        # Remove old textures from context
        for texture in self._shadow_textures - shadow_textures:
            texture.delete()

        self._shadow_textures = shadow_textures.copy()

    ###########################################################################
    # Texture Management
    ###########################################################################

    def _bind_texture(self, texture, uniform_name, program):
        """Bind a texture to an active texture unit and return
        the texture unit index that was used.
        """
        tex_id = self._get_next_active_texture()
        glActiveTexture(GL_TEXTURE0 + tex_id)
        texture._bind()
        program.set_uniform(uniform_name, tex_id)

    def _get_next_active_texture(self):
        val = self._texture_alloc_idx
        self._texture_alloc_idx += 1
        return val

    def _reset_active_textures(self):
        self._texture_alloc_idx = 0

    ###########################################################################
    # Camera Matrix Management
    ###########################################################################

    def _get_camera_matrices(self, scene):
        main_camera_node = scene.main_camera_node
        if main_camera_node is None:
            raise ValueError('Cannot render scene without a camera')
        P = main_camera_node.camera.get_projection_matrix(
            width=self.viewport_width, height=self.viewport_height
        )
        pose = scene.get_pose(main_camera_node)
        V = np.linalg.inv(pose)  # V maps from world to camera
        return V, P

    def _get_light_cam_matrices(self, scene, light_node, flags):
        light = light_node.light
        pose = scene.get_pose(light_node).copy()
        s = scene.scale
        camera = light._get_shadow_camera(s)
        P = camera.get_projection_matrix()
        if isinstance(light, DirectionalLight):
            direction = -pose[:3,2]
            c = scene.centroid
            loc = c - direction * s
            pose[:3,3] = loc
        V = np.linalg.inv(pose)  # V maps from world to camera
        return V, P

    ###########################################################################
    # Shader Program Management
    ###########################################################################

    def _get_text_program(self):
        program = self._program_cache.get_program(
            vertex_shader='text.vert',
            fragment_shader='text.frag'
        )

        if not program._in_context():
            program._add_to_context()

        return program

    def _compute_max_n_lights(self, flags):
        max_n_lights = [MAX_N_LIGHTS, MAX_N_LIGHTS, MAX_N_LIGHTS]
        n_tex_units = glGetIntegerv(GL_MAX_TEXTURE_IMAGE_UNITS)

        # Reserved texture units: 6
        #   Normal Map
        #   Occlusion Map
        #   Emissive Map
        #   Base Color or Diffuse Map
        #   MR or SG Map
        #   Environment cubemap

        n_reserved_textures = 6
        n_available_textures = n_tex_units - n_reserved_textures

        # Distribute textures evenly among lights with shadows, with
        # a preference for directional lights
        n_shadow_types = 0
        if flags & RenderFlags.SHADOWS_DIRECTIONAL:
            n_shadow_types += 1
        if flags & RenderFlags.SHADOWS_SPOT:
            n_shadow_types += 1
        if flags & RenderFlags.SHADOWS_POINT:
            n_shadow_types += 1

        if n_shadow_types > 0:
            tex_per_light = n_available_textures // n_shadow_types

            if flags & RenderFlags.SHADOWS_DIRECTIONAL:
                max_n_lights[0] = (
                    tex_per_light +
                    (n_available_textures - tex_per_light * n_shadow_types)
                )
            if flags & RenderFlags.SHADOWS_SPOT:
                max_n_lights[1] = tex_per_light
            if flags & RenderFlags.SHADOWS_POINT:
                max_n_lights[2] = tex_per_light

        return max_n_lights

    def _get_primitive_program(self, primitive, flags, program_flags):
        vertex_shader = None
        fragment_shader = None
        geometry_shader = None
        defines = {}

        if (bool(program_flags & ProgramFlags.USE_MATERIAL) and
                not flags & RenderFlags.DEPTH_ONLY and
                not flags & RenderFlags.FLAT and
                not flags & RenderFlags.SEG):
            vertex_shader = 'mesh.vert'
            fragment_shader = 'mesh.frag'
        elif bool(program_flags & (ProgramFlags.VERTEX_NORMALS |
                                   ProgramFlags.FACE_NORMALS)):
            vertex_shader = 'vertex_normals.vert'
            if primitive.mode == GLTF.POINTS:
                geometry_shader = 'vertex_normals_pc.geom'
            else:
                geometry_shader = 'vertex_normals.geom'
            fragment_shader = 'vertex_normals.frag'
        elif flags & RenderFlags.FLAT:
            vertex_shader = 'flat.vert'
            fragment_shader = 'flat.frag'
        elif flags & RenderFlags.SEG:
            vertex_shader = 'segmentation.vert'
            fragment_shader = 'segmentation.frag'
        else:
            vertex_shader = 'mesh_depth.vert'
            fragment_shader = 'mesh_depth.frag'

        # Set up vertex buffer DEFINES
        bf = primitive.buf_flags
        buf_idx = 1
        if bf & BufFlags.NORMAL:
            defines['NORMAL_LOC'] = buf_idx
            buf_idx += 1
        if bf & BufFlags.TANGENT:
            defines['TANGENT_LOC'] = buf_idx
            buf_idx += 1
        if bf & BufFlags.TEXCOORD_0:
            defines['TEXCOORD_0_LOC'] = buf_idx
            buf_idx += 1
        if bf & BufFlags.TEXCOORD_1:
            defines['TEXCOORD_1_LOC'] = buf_idx
            buf_idx += 1
        if bf & BufFlags.COLOR_0:
            defines['COLOR_0_LOC'] = buf_idx
            buf_idx += 1
        if bf & BufFlags.JOINTS_0:
            defines['JOINTS_0_LOC'] = buf_idx
            buf_idx += 1
        if bf & BufFlags.WEIGHTS_0:
            defines['WEIGHTS_0_LOC'] = buf_idx
            buf_idx += 1
        defines['INST_M_LOC'] = buf_idx

        # Set up shadow mapping defines
        if flags & RenderFlags.SHADOWS_DIRECTIONAL:
            defines['DIRECTIONAL_LIGHT_SHADOWS'] = 1
        if flags & RenderFlags.SHADOWS_SPOT:
            defines['SPOT_LIGHT_SHADOWS'] = 1
        if flags & RenderFlags.SHADOWS_POINT:
            defines['POINT_LIGHT_SHADOWS'] = 1
        max_n_lights = self._compute_max_n_lights(flags)
        defines['MAX_DIRECTIONAL_LIGHTS'] = max_n_lights[0]
        defines['MAX_SPOT_LIGHTS'] = max_n_lights[1]
        defines['MAX_POINT_LIGHTS'] = max_n_lights[2]

        # Set up vertex normal defines
        if program_flags & ProgramFlags.VERTEX_NORMALS:
            defines['VERTEX_NORMALS'] = 1
        if program_flags & ProgramFlags.FACE_NORMALS:
            defines['FACE_NORMALS'] = 1

        # Set up material texture defines
        if bool(program_flags & ProgramFlags.USE_MATERIAL):
            tf = primitive.material.tex_flags
            if tf & TexFlags.NORMAL:
                defines['HAS_NORMAL_TEX'] = 1
            if tf & TexFlags.OCCLUSION:
                defines['HAS_OCCLUSION_TEX'] = 1
            if tf & TexFlags.EMISSIVE:
                defines['HAS_EMISSIVE_TEX'] = 1
            if tf & TexFlags.BASE_COLOR:
                defines['HAS_BASE_COLOR_TEX'] = 1
            if tf & TexFlags.METALLIC_ROUGHNESS:
                defines['HAS_METALLIC_ROUGHNESS_TEX'] = 1
            if tf & TexFlags.DIFFUSE:
                defines['HAS_DIFFUSE_TEX'] = 1
            if tf & TexFlags.SPECULAR_GLOSSINESS:
                defines['HAS_SPECULAR_GLOSSINESS_TEX'] = 1
            if isinstance(primitive.material, MetallicRoughnessMaterial):
                defines['USE_METALLIC_MATERIAL'] = 1
            elif isinstance(primitive.material, SpecularGlossinessMaterial):
                defines['USE_GLOSSY_MATERIAL'] = 1

        program = self._program_cache.get_program(
            vertex_shader=vertex_shader,
            fragment_shader=fragment_shader,
            geometry_shader=geometry_shader,
            defines=defines
        )

        if not program._in_context():
            program._add_to_context()

        return program

    ###########################################################################
    # Viewport Management
    ###########################################################################

    def _configure_forward_pass_viewport(self, flags):

        # If using offscreen render, bind main framebuffer
        if flags & RenderFlags.OFFSCREEN:
            self._configure_main_framebuffer()
            glBindFramebuffer(GL_DRAW_FRAMEBUFFER, self._main_fb_ms)
        else:
            glBindFramebuffer(GL_DRAW_FRAMEBUFFER, 0)

        glViewport(0, 0, self.viewport_width, self.viewport_height)
        glEnable(GL_DEPTH_TEST)
        glDepthMask(GL_TRUE)
        glDepthFunc(GL_LESS)
        glDepthRange(0.0, 1.0)

    def _configure_shadow_mapping_viewport(self, light, flags):
        self._configure_shadow_framebuffer()
        glBindFramebuffer(GL_FRAMEBUFFER, self._shadow_fb)
        light.shadow_texture._bind()
        light.shadow_texture._bind_as_depth_attachment()
        glActiveTexture(GL_TEXTURE0)
        light.shadow_texture._bind()
        glDrawBuffer(GL_NONE)
        glReadBuffer(GL_NONE)

        glClear(GL_DEPTH_BUFFER_BIT)
        glViewport(0, 0, SHADOW_TEX_SZ, SHADOW_TEX_SZ)
        glEnable(GL_DEPTH_TEST)
        glDepthMask(GL_TRUE)
        glDepthFunc(GL_LESS)
        glDepthRange(0.0, 1.0)
        glDisable(GL_CULL_FACE)
        glDisable(GL_BLEND)

    ###########################################################################
    # Framebuffer Management
    ###########################################################################

    def _configure_shadow_framebuffer(self):
        if self._shadow_fb is None:
            self._shadow_fb = glGenFramebuffers(1)

    def _delete_shadow_framebuffer(self):
        if self._shadow_fb is not None:
            glDeleteFramebuffers(1, [self._shadow_fb])

    def _configure_main_framebuffer(self):
        # If mismatch with prior framebuffer, delete it
        if (self._main_fb is not None and
                self.viewport_width != self._main_fb_dims[0] or
                self.viewport_height != self._main_fb_dims[1]):
            self._delete_main_framebuffer()

        # If framebuffer doesn't exist, create it
        if self._main_fb is None:
            # Generate standard buffer
            self._main_cb, self._main_db = glGenRenderbuffers(2)

            glBindRenderbuffer(GL_RENDERBUFFER, self._main_cb)
            glRenderbufferStorage(
                GL_RENDERBUFFER, GL_RGBA,
                self.viewport_width, self.viewport_height
            )

            glBindRenderbuffer(GL_RENDERBUFFER, self._main_db)
            glRenderbufferStorage(
                GL_RENDERBUFFER, GL_DEPTH_COMPONENT24,
                self.viewport_width, self.viewport_height
            )

            self._main_fb = glGenFramebuffers(1)
            glBindFramebuffer(GL_DRAW_FRAMEBUFFER, self._main_fb)
            glFramebufferRenderbuffer(
                GL_DRAW_FRAMEBUFFER, GL_COLOR_ATTACHMENT0,
                GL_RENDERBUFFER, self._main_cb
            )
            glFramebufferRenderbuffer(
                GL_DRAW_FRAMEBUFFER, GL_DEPTH_ATTACHMENT,
                GL_RENDERBUFFER, self._main_db
            )

            # Generate multisample buffer
            self._main_cb_ms, self._main_db_ms = glGenRenderbuffers(2)
            glBindRenderbuffer(GL_RENDERBUFFER, self._main_cb_ms)
            glRenderbufferStorageMultisample(
                GL_RENDERBUFFER, 4, GL_RGBA,
                self.viewport_width, self.viewport_height
            )
            glBindRenderbuffer(GL_RENDERBUFFER, self._main_db_ms)
            glRenderbufferStorageMultisample(
                GL_RENDERBUFFER, 4, GL_DEPTH_COMPONENT24,
                self.viewport_width, self.viewport_height
            )
            self._main_fb_ms = glGenFramebuffers(1)
            glBindFramebuffer(GL_DRAW_FRAMEBUFFER, self._main_fb_ms)
            glFramebufferRenderbuffer(
                GL_DRAW_FRAMEBUFFER, GL_COLOR_ATTACHMENT0,
                GL_RENDERBUFFER, self._main_cb_ms
            )
            glFramebufferRenderbuffer(
                GL_DRAW_FRAMEBUFFER, GL_DEPTH_ATTACHMENT,
                GL_RENDERBUFFER, self._main_db_ms
            )

            self._main_fb_dims = (self.viewport_width, self.viewport_height)

    def _delete_main_framebuffer(self):
        if self._main_fb is not None:
            glDeleteFramebuffers(2, [self._main_fb, self._main_fb_ms])
        if self._main_cb is not None:
            glDeleteRenderbuffers(2, [self._main_cb, self._main_cb_ms])
        if self._main_db is not None:
            glDeleteRenderbuffers(2, [self._main_db, self._main_db_ms])

        self._main_fb = None
        self._main_cb = None
        self._main_db = None
        self._main_fb_ms = None
        self._main_cb_ms = None
        self._main_db_ms = None
        self._main_fb_dims = (None, None)

    def _read_main_framebuffer(self, scene, flags):
        width, height = self._main_fb_dims[0], self._main_fb_dims[1]

        # Bind framebuffer and blit buffers
        glBindFramebuffer(GL_READ_FRAMEBUFFER, self._main_fb_ms)
        glBindFramebuffer(GL_DRAW_FRAMEBUFFER, self._main_fb)
        glBlitFramebuffer(
            0, 0, width, height, 0, 0, width, height,
            GL_COLOR_BUFFER_BIT, GL_LINEAR
        )
        glBlitFramebuffer(
            0, 0, width, height, 0, 0, width, height,
            GL_DEPTH_BUFFER_BIT, GL_NEAREST
        )
        glBindFramebuffer(GL_READ_FRAMEBUFFER, self._main_fb)

        # Read depth
        depth_buf = glReadPixels(
            0, 0, width, height, GL_DEPTH_COMPONENT, GL_FLOAT
        )
        depth_im = np.frombuffer(depth_buf, dtype=np.float32)
        depth_im = depth_im.reshape((height, width))
        depth_im = np.flip(depth_im, axis=0)
        inf_inds = (depth_im == 1.0)
        depth_im = 2.0 * depth_im - 1.0
        z_near = scene.main_camera_node.camera.znear
        z_far = scene.main_camera_node.camera.zfar
        noninf = np.logical_not(inf_inds)
        if z_far is None:
            depth_im[noninf] = 2 * z_near / (1.0 - depth_im[noninf])
        else:
            depth_im[noninf] = ((2.0 * z_near * z_far) /
                                (z_far + z_near - depth_im[noninf] *
                                (z_far - z_near)))
        depth_im[inf_inds] = 0.0

        # Resize for macos if needed
        if sys.platform == 'darwin':
            depth_im = self._resize_image(depth_im)

        if flags & RenderFlags.DEPTH_ONLY:
            return depth_im

        # Read color
        if flags & RenderFlags.RGBA:
            color_buf = glReadPixels(
                0, 0, width, height, GL_RGBA, GL_UNSIGNED_BYTE
            )
            color_im = np.frombuffer(color_buf, dtype=np.uint8)
            color_im = color_im.reshape((height, width, 4))
        else:
            color_buf = glReadPixels(
                0, 0, width, height, GL_RGB, GL_UNSIGNED_BYTE
            )
            color_im = np.frombuffer(color_buf, dtype=np.uint8)
            color_im = color_im.reshape((height, width, 3))
        color_im = np.flip(color_im, axis=0)

        # Resize for macos if needed
        if sys.platform == 'darwin':
            color_im = self._resize_image(color_im, True)

        return color_im, depth_im

    def _resize_image(self, value, antialias=False):
        """If needed, rescale the render for MacOS."""
        img = Image.Image.fromarray(value)
        resample = Image.Image.NEAREST
        if antialias:
            resample = Image.Image.BILINEAR
        size = (self.viewport_width // self.dpscale,
                self.viewport_height // self.dpscale)
        img = img.resize(size, resample=resample)
        return np.array(img)

    ###########################################################################
    # Shadowmap Debugging
    ###########################################################################

    def _forward_pass_no_reset(self, scene, flags):
        # Set up camera matrices
        V, P = self._get_camera_matrices(scene)

        # Now, render each object in sorted order
        for node in self._sorted_mesh_nodes(scene):
            mesh = node.mesh

            # Skip the mesh if it's not visible
            if not mesh.is_visible:
                continue

            for primitive in mesh.primitives:

                # First, get and bind the appropriate program
                program = self._get_primitive_program(
                    primitive, flags, ProgramFlags.USE_MATERIAL
                )
                program._bind()

                # Set the camera uniforms
                program.set_uniform('V', V)
                program.set_uniform('P', P)
                program.set_uniform(
                    'cam_pos', scene.get_pose(scene.main_camera_node)[:3,3]
                )

                # Next, bind the lighting
                if not flags & RenderFlags.DEPTH_ONLY and not flags & RenderFlags.FLAT:
                    self._bind_lighting(scene, program, node, flags)

                # Finally, bind and draw the primitive
                self._bind_and_draw_primitive(
                    primitive=primitive,
                    pose=scene.get_pose(node),
                    program=program,
                    flags=flags
                )
                self._reset_active_textures()

        # Unbind the shader and flush the output
        if program is not None:
            program._unbind()
        glFlush()

    def _render_light_shadowmaps(self, scene, light_nodes, flags, tile=False):
        glBindFramebuffer(GL_DRAW_FRAMEBUFFER, 0)
        glClearColor(*scene.bg_color)
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
        glEnable(GL_DEPTH_TEST)
        glDepthMask(GL_TRUE)
        glDepthFunc(GL_LESS)
        glDepthRange(0.0, 1.0)

        w = self.viewport_width
        h = self.viewport_height

        num_nodes = len(light_nodes)
        viewport_dims = {
            (0, 2): [0, h // 2, w // 2, h],
            (1, 2): [w // 2, h // 2, w, h],
            (0, 3): [0, h // 2, w // 2, h],
            (1, 3): [w // 2, h // 2, w, h],
            (2, 3): [0, 0, w // 2, h // 2],
            (0, 4): [0, h // 2, w // 2, h],
            (1, 4): [w // 2, h // 2, w, h],
            (2, 4): [0, 0, w // 2, h // 2],
            (3, 4): [w // 2, 0, w, h // 2]
        }

        if tile:
            for i, ln in enumerate(light_nodes):
                light = ln.light

                if light.shadow_texture is None:
                    raise ValueError('Light does not have a shadow texture')

                glViewport(*viewport_dims[(i, num_nodes + 1)])

                program = self._get_debug_quad_program()
                program._bind()
                self._bind_texture(light.shadow_texture, 'depthMap', program)
                self._render_debug_quad()
                self._reset_active_textures()
                glFlush()
            i += 1
            glViewport(*viewport_dims[(i, num_nodes + 1)])
            self._forward_pass_no_reset(scene, flags)
        else:
            for i, ln in enumerate(light_nodes):
                light = ln.light

                if light.shadow_texture is None:
                    raise ValueError('Light does not have a shadow texture')

                glViewport(0, 0, self.viewport_width, self.viewport_height)

                program = self._get_debug_quad_program()
                program._bind()
                self._bind_texture(light.shadow_texture, 'depthMap', program)
                self._render_debug_quad()
                self._reset_active_textures()
                glFlush()
                return

    def _get_debug_quad_program(self):
        program = self._program_cache.get_program(
            vertex_shader='debug_quad.vert',
            fragment_shader='debug_quad.frag'
        )
        if not program._in_context():
            program._add_to_context()
        return program

    def _render_debug_quad(self):
        x = glGenVertexArrays(1)
        glBindVertexArray(x)
        glDrawArrays(GL_TRIANGLES, 0, 6)
        glBindVertexArray(0)
        glDeleteVertexArrays(1, [x])


class OffscreenRenderer(object):
    """A wrapper for offscreen rendering.

    Parameters
    ----------
    viewport_width : int
        The width of the main viewport, in pixels.
    viewport_height : int
        The height of the main viewport, in pixels.
    point_size : float
        The size of screen-space points in pixels.
    """

    def __init__(self, viewport_width, viewport_height, point_size=1.0):
        self.viewport_width = viewport_width
        self.viewport_height = viewport_height
        self.point_size = point_size

        self._platform = None
        self._renderer = None
        self._create()

    @property
    def viewport_width(self):
        """int : The width of the main viewport, in pixels.
        """
        return self._viewport_width

    @viewport_width.setter
    def viewport_width(self, value):
        self._viewport_width = int(value)

    @property
    def viewport_height(self):
        """int : The height of the main viewport, in pixels.
        """
        return self._viewport_height

    @viewport_height.setter
    def viewport_height(self, value):
        self._viewport_height = int(value)

    @property
    def point_size(self):
        """float : The pixel size of points in point clouds.
        """
        return self._point_size

    @point_size.setter
    def point_size(self, value):
        self._point_size = float(value)

    def render(self, scene, flags=RenderFlags.NONE, seg_node_map=None):
        """Render a scene with the given set of flags.

        Parameters
        ----------
        scene : :class:`Scene`
            A scene to render.
        flags : int
            A bitwise or of one or more flags from :class:`.RenderFlags`.
        seg_node_map : dict
            A map from :class:`.Node` objects to (3,) colors for each.
            If specified along with flags set to :attr:`.RenderFlags.SEG`,
            the color image will be a segmentation image.

        Returns
        -------
        color_im : (h, w, 3) uint8 or (h, w, 4) uint8
            The color buffer in RGB format, or in RGBA format if
            :attr:`.RenderFlags.RGBA` is set.
            Not returned if flags includes :attr:`.RenderFlags.DEPTH_ONLY`.
        depth_im : (h, w) float32
            The depth buffer in linear units.
        """
        self._platform.make_current()
        # If platform does not support dynamically-resizing framebuffers,
        # destroy it and restart it
        if (self._platform.viewport_height != self.viewport_height or
                self._platform.viewport_width != self.viewport_width):
            if not self._platform.supports_framebuffers():
                self.delete()
                self._create()

        self._platform.make_current()
        self._renderer.viewport_width = self.viewport_width
        self._renderer.viewport_height = self.viewport_height
        self._renderer.point_size = self.point_size

        if self._platform.supports_framebuffers():
            flags |= RenderFlags.OFFSCREEN
            retval = self._renderer.render(scene, flags, seg_node_map)
        else:
            self._renderer.render(scene, flags, seg_node_map)
            depth = self._renderer.read_depth_buf()
            if flags & RenderFlags.DEPTH_ONLY:
                retval = depth
            else:
                color = self._renderer.read_color_buf()
                retval = color, depth

        # Make the platform not current
        self._platform.make_uncurrent()
        return retval

    def delete(self):
        """Free all OpenGL resources.
        """
        self._platform.make_current()
        self._renderer.delete()
        self._platform.delete_context()
        del self._renderer
        del self._platform
        self._renderer = None
        self._platform = None
        import gc
        gc.collect()

    def _create(self):
        if 'PYOPENGL_PLATFORM' not in os.environ:
                        
            class PygletPlatform(Platform):
                """Renders on-screen using a 1x1 hidden Pyglet window for getting
                an OpenGL context.
                """

                def __init__(self, viewport_width, viewport_height):
                    super(PygletPlatform, self).__init__(viewport_width, viewport_height)
                    self._window = None

                def init_context(self):
                    
                    pyglet.options['shadow_window'] = False

                    try:
                        pyglet.lib.x11.xlib.XInitThreads()
                    except Exception:
                        pass

                    self._window = None
                    confs = [pyglet.gl.Config(sample_buffers=1, samples=4,
                                            depth_size=24,
                                            double_buffer=True,
                                            major_version=TARGET_OPEN_GL_MAJOR,
                                            minor_version=TARGET_OPEN_GL_MINOR),
                            pyglet.gl.Config(depth_size=24,
                                            double_buffer=True,
                                            major_version=TARGET_OPEN_GL_MAJOR,
                                            minor_version=TARGET_OPEN_GL_MINOR),
                            pyglet.gl.Config(sample_buffers=1, samples=4,
                                            depth_size=24,
                                            double_buffer=True,
                                            major_version=MIN_OPEN_GL_MAJOR,
                                            minor_version=MIN_OPEN_GL_MINOR),
                            pyglet.gl.Config(depth_size=24,
                                            double_buffer=True,
                                            major_version=MIN_OPEN_GL_MAJOR,
                                            minor_version=MIN_OPEN_GL_MINOR)]
                    for conf in confs:
                        try:
                            self._window = pyglet.window.Window(config=conf, visible=False,
                                                                resizable=False,
                                                                width=1, height=1)
                            break
                        except pyglet.window.NoSuchConfigException as e:
                            print("Error while creating pyglet window",e)
                            pass

                    if not self._window:
                        raise ValueError(
                            'Failed to initialize Pyglet window with an OpenGL >= 3+ '
                            'context. If you\'re logged in via SSH, ensure that you\'re '
                            'running your script with vglrun (i.e. VirtualGL). The '
                            'internal error message was "{}"'.format(e)
                        )

                def make_current(self):
                    if self._window:
                        self._window.switch_to()

                def make_uncurrent(self):
                    try:
                        import pyglet
                        pyglet.gl.xlib.glx.glXMakeContextCurrent(self._window.context.x_display, 0, 0, None)
                    except Exception:
                        pass

                def delete_context(self):
                    if self._window is not None:
                        self.make_current()
                        cid = OpenGL.contextdata.getContext()
                        try:
                            self._window.context.destroy()
                            self._window.close()
                        except Exception:
                            pass
                        self._window = None
                        OpenGL.contextdata.cleanupContext(cid)
                        del cid

                def supports_framebuffers(self):
                    return True


            self._platform = PygletPlatform(self.viewport_width,
                                            self.viewport_height)
        elif os.environ['PYOPENGL_PLATFORM'] == 'egl':
            EGL_PLATFORM_DEVICE_EXT = 0x313F
            EGL_DRM_DEVICE_FILE_EXT = 0x3233

            def _ensure_egl_loaded():
                plugin = OpenGL.platform.PlatformPlugin.by_name('egl')
                if plugin is None:
                    raise RuntimeError("EGL platform plugin is not available.")

                plugin_class = plugin.load()
                plugin.loaded = True
                # create instance of this platform implementation
                plugin = plugin_class()

                plugin.install(vars(OpenGL.platform))

            _ensure_egl_loaded()

            from OpenGL import EGL as egl

            def _get_egl_func(func_name, res_type, *arg_types):
                address = egl.eglGetProcAddress(func_name)
                if address is None:
                    return None

                proto = ctypes.CFUNCTYPE(res_type)
                proto.argtypes = arg_types
                func = proto(address)
                return func


            def _get_egl_struct(struct_name):
                from OpenGL._opaque import opaque_pointer_cls
                return opaque_pointer_cls(struct_name)

            # These are not defined in PyOpenGL by default.
            _EGLDeviceEXT = _get_egl_struct('EGLDeviceEXT')
            _eglGetPlatformDisplayEXT = _get_egl_func('eglGetPlatformDisplayEXT', egl.EGLDisplay)
            _eglQueryDevicesEXT = _get_egl_func('eglQueryDevicesEXT', egl.EGLBoolean)
            _eglQueryDeviceStringEXT = _get_egl_func('eglQueryDeviceStringEXT', ctypes.c_char_p)

            def query_devices():
                if _eglQueryDevicesEXT is None:
                    raise RuntimeError("EGL query extension is not loaded or is not supported.")

                num_devices = egl.EGLint()
                success = _eglQueryDevicesEXT(0, None, ctypes.pointer(num_devices))
                if not success or num_devices.value < 1:
                    return []

                devices = (_EGLDeviceEXT * num_devices.value)()  # array of size num_devices
                success = _eglQueryDevicesEXT(num_devices.value, devices, ctypes.pointer(num_devices))
                if not success or num_devices.value < 1:
                    return []

                return [EGLDevice(devices[i]) for i in range(num_devices.value)]

            def get_default_device():
                # Fall back to not using query extension.
                if _eglQueryDevicesEXT is None:
                    return EGLDevice(None)

                return query_devices()[0]

            def get_device_by_index(device_id):
                if _eglQueryDevicesEXT is None and device_id == 0:
                    return get_default_device()

                devices = query_devices()
                if device_id >= len(devices):
                    raise ValueError('Invalid device ID ({})'.format(device_id, len(devices)))
                return devices[device_id]

            class EGLDevice:

                def __init__(self, display=None):
                    self._display = display

                def get_display(self):
                    if self._display is None:
                        return egl.eglGetDisplay(egl.EGL_DEFAULT_DISPLAY)

                    return _eglGetPlatformDisplayEXT(EGL_PLATFORM_DEVICE_EXT, self._display, None)

                @property
                def name(self):
                    if self._display is None:
                        return 'default'

                    name = _eglQueryDeviceStringEXT(self._display, EGL_DRM_DEVICE_FILE_EXT)
                    if name is None:
                        return None

                    return name.decode('ascii')

                def __repr__(self):
                    return "<EGLDevice(name={})>".format(self.name)

            class EGLPlatform(Platform):
                """Renders using EGL.
                """

                def __init__(self, viewport_width, viewport_height, device: EGLDevice = None):
                    super(EGLPlatform, self).__init__(viewport_width, viewport_height)
                    if device is None:
                        device = get_default_device()

                    self._egl_device = device
                    self._egl_display = None
                    self._egl_context = None

                def init_context(self):
                    _ensure_egl_loaded()

                    from OpenGL.EGL import (
                        EGL_SURFACE_TYPE, EGL_PBUFFER_BIT, EGL_BLUE_SIZE,
                        EGL_RED_SIZE, EGL_GREEN_SIZE, EGL_DEPTH_SIZE,
                        EGL_COLOR_BUFFER_TYPE, EGL_RGB_BUFFER,
                        EGL_RENDERABLE_TYPE, EGL_OPENGL_BIT, EGL_CONFORMANT,
                        EGL_NONE, EGL_DEFAULT_DISPLAY, EGL_NO_CONTEXT,
                        EGL_OPENGL_API, EGL_CONTEXT_MAJOR_VERSION,
                        EGL_CONTEXT_MINOR_VERSION,
                        EGL_CONTEXT_OPENGL_PROFILE_MASK,
                        EGL_CONTEXT_OPENGL_CORE_PROFILE_BIT,
                        eglGetDisplay, eglInitialize, eglChooseConfig,
                        eglBindAPI, eglCreateContext, EGLConfig
                    )
                    from OpenGL import arrays

                    config_attributes = arrays.GLintArray.asArray([
                        EGL_SURFACE_TYPE, EGL_PBUFFER_BIT,
                        EGL_BLUE_SIZE, 8,
                        EGL_RED_SIZE, 8,
                        EGL_GREEN_SIZE, 8,
                        EGL_DEPTH_SIZE, 24,
                        EGL_COLOR_BUFFER_TYPE, EGL_RGB_BUFFER,
                        EGL_RENDERABLE_TYPE, EGL_OPENGL_BIT,
                        EGL_CONFORMANT, EGL_OPENGL_BIT,
                        EGL_NONE
                    ])
                    context_attributes = arrays.GLintArray.asArray([
                        EGL_CONTEXT_MAJOR_VERSION, 4,
                        EGL_CONTEXT_MINOR_VERSION, 1,
                        EGL_CONTEXT_OPENGL_PROFILE_MASK,
                        EGL_CONTEXT_OPENGL_CORE_PROFILE_BIT,
                        EGL_NONE
                    ])
                    major, minor = ctypes.c_long(), ctypes.c_long()
                    num_configs = ctypes.c_long()
                    configs = (EGLConfig * 1)()

                    # Cache DISPLAY if necessary and get an off-screen EGL display
                    orig_dpy = None
                    if 'DISPLAY' in os.environ:
                        orig_dpy = os.environ['DISPLAY']
                        del os.environ['DISPLAY']

                    self._egl_display = self._egl_device.get_display()
                    if orig_dpy is not None:
                        os.environ['DISPLAY'] = orig_dpy

                    # Initialize EGL
                    assert eglInitialize(self._egl_display, major, minor)
                    assert eglChooseConfig(
                        self._egl_display, config_attributes, configs, 1, num_configs
                    )

                    # Bind EGL to the OpenGL API
                    assert eglBindAPI(EGL_OPENGL_API)

                    # Create an EGL context
                    self._egl_context = eglCreateContext(
                        self._egl_display, configs[0],
                        EGL_NO_CONTEXT, context_attributes
                    )

                    # Make it current
                    self.make_current()

                def make_current(self):
                    from OpenGL.EGL import eglMakeCurrent, EGL_NO_SURFACE
                    assert eglMakeCurrent(
                        self._egl_display, EGL_NO_SURFACE, EGL_NO_SURFACE,
                        self._egl_context
                    )

                def make_uncurrent(self):
                    """Make the OpenGL context uncurrent.
                    """
                    pass

                def delete_context(self):
                    from OpenGL.EGL import eglDestroyContext, eglTerminate
                    if self._egl_display is not None:
                        if self._egl_context is not None:
                            eglDestroyContext(self._egl_display, self._egl_context)
                            self._egl_context = None
                        eglTerminate(self._egl_display)
                        self._egl_display = None

                def supports_framebuffers(self):
                    return True


            
            device_id = int(os.environ.get('EGL_DEVICE_ID', '0'))
            egl_device = egl.get_device_by_index(device_id)
            self._platform = egl.EGLPlatform(self.viewport_width,
                                             self.viewport_height,
                                             device=egl_device)
        elif os.environ['PYOPENGL_PLATFORM'] == 'osmesa':
                        
            class OSMesaPlatform(Platform):
                """Renders into a software buffer using OSMesa. Requires special versions
                of OSMesa to be installed, plus PyOpenGL upgrade.
                """

                def __init__(self, viewport_width, viewport_height):
                    super(OSMesaPlatform, self).__init__(viewport_width, viewport_height)
                    self._context = None
                    self._buffer = None

                def init_context(self):
                    from OpenGL import arrays
                    from OpenGL.osmesa import (
                        OSMesaCreateContextAttribs, OSMESA_FORMAT,
                        OSMESA_RGBA, OSMESA_PROFILE, OSMESA_CORE_PROFILE,
                        OSMESA_CONTEXT_MAJOR_VERSION, OSMESA_CONTEXT_MINOR_VERSION,
                        OSMESA_DEPTH_BITS
                    )

                    attrs = arrays.GLintArray.asArray([
                        OSMESA_FORMAT, OSMESA_RGBA,
                        OSMESA_DEPTH_BITS, 24,
                        OSMESA_PROFILE, OSMESA_CORE_PROFILE,
                        OSMESA_CONTEXT_MAJOR_VERSION, 3,
                        OSMESA_CONTEXT_MINOR_VERSION, 3,
                        0
                    ])
                    self._context = OSMesaCreateContextAttribs(attrs, None)
                    self._buffer = arrays.GLubyteArray.zeros(
                        (self.viewport_height, self.viewport_width, 4)
                    )

                def make_current(self):
                    from OpenGL import GL as gl
                    from OpenGL.osmesa import OSMesaMakeCurrent
                    assert(OSMesaMakeCurrent(
                        self._context, self._buffer, gl.GL_UNSIGNED_BYTE,
                        self.viewport_width, self.viewport_height
                    ))

                def make_uncurrent(self):
                    """Make the OpenGL context uncurrent.
                    """
                    pass

                def delete_context(self):
                    from OpenGL.osmesa import OSMesaDestroyContext
                    OSMesaDestroyContext(self._context)
                    self._context = None
                    self._buffer = None

                def supports_framebuffers(self):
                    return False
            self._platform = OSMesaPlatform(self.viewport_width,
                                            self.viewport_height)
        else:
            raise ValueError('Unsupported PyOpenGL platform: {}'.format(
                os.environ['PYOPENGL_PLATFORM']
            ))
        self._platform.init_context()
        self._platform.make_current()
        self._renderer = Renderer(self.viewport_width, self.viewport_height)

    def __del__(self):
        try:
            self.delete()
        except Exception:
            pass

def createThumbnailAndReturn(model_path, thumbnail_width, thumbnail_height, thumbnail_save_path, transparent=True, perspective=False):
    
    # Create scene
    try:
        scene = Scene(ambient_light=np.array([0.2, 0.2, 0.2, 1.0]))
    except Exception as e:
        print("createThumbnailError1",e)
        return False

    # Load objects
    try:
        object_gltf = trimesh.load(model_path,file_type="gltf")
    except Exception as e:
        print("createThumbnailError2",e)
        return False
    object_meshes = []
    for key in list(object_gltf.geometry.keys()):
        object_trimesh = object_gltf.geometry[key]
        try:
            object_meshes.append(Mesh.from_trimesh(object_trimesh))
        except Exception as e:
            print("createThumbnailError3",e)
            return False

    # Set up lighting
    light = DirectionalLight(color=np.ones(3), intensity=5.0)
    light_pose = np.array([
        [0.0,  -np.sqrt(2)/2, np.sqrt(2)/2, -10.5],
        [1.0, 0.0,           0.0,           -10.0],
        [0.0,  np.sqrt(2)/2,  np.sqrt(2)/2, -10.4],
        [0.0,  0.0,           0.0,          1.0]
    ])

    # Add objects to scene
    scene.add(light, pose=light_pose)
    for mesh in object_meshes:
        try:
            scene.add(mesh)
        except Exception as e:
            print("createThumbnailError4",e)
            return False
    # Calculate Size and Centre
    centroid = scene.centroid
    scale = scene.scale
    if scale <= 0.0:
        scale = 2
    s2 = 1.0 / np.sqrt(2.0)
    print("Centroid and Scale",centroid,scale)
    # Create render camera using scene centroid information
    
    if perspective:
        cam = PerspectiveCamera(yfov=(np.pi / 4.0)) #3.0
    else:
        cam = OrthographicCamera(xmag=scale*s2,ymag=scale*s2,zfar=scale*100)
    cam_pose = np.eye(4)
    cam_pose[:3,:3] = np.array([
        [0.0, -s2, s2],
        [1.0, 0.0, 0.0],
        [0.0, s2, s2]
    ])
    hfov = np.pi / 6.0
    dist = scale / (2.0 * np.tan(hfov))
   
    cam_pose[:3,3] = dist * np.array([1.0, 0.0, 1.0]) + centroid
    
    # Add camera to scene
    scene.add(cam,  pose=cam_pose)
    try:
        r = OffscreenRenderer(viewport_width=thumbnail_width, viewport_height=thumbnail_height)
    except Exception as e:
        print("createThumbnailError5",e)
        return False
    try:
        color, _ = r.render(scene)
    except Exception as e:
        print("createThumbnailError6",e)
        return False
    try:
        myImage = Image.Image.fromarray(color)
    except Exception as e:
        print("createThumbnailError7",e)
        return False
    if transparent:
        try:
            rgba = myImage.convert("RGBA")  #routine to save transparent image which might be slower and hence commented.
            datas = rgba.getdata()  
            newData = []
            for item in datas:
                if item[0] == 255 and item[1] == 255 and item[2] == 255:  # finding white colour by its RGB value
                    # storing a transparent value when we find a white colour
                    newData.append((255, 255, 255, 0))
                else:
                    newData.append(item)  # other colours remain unchanged
            rgba.putdata(newData) 
            rgba.save(thumbnail_save_path, "PNG")
        except Exception as e:
            print("createThumbnailError8",e)
            try:
                myImage.save(thumbnail_save_path, "PNG")
            except Exception as e:
                print("createThumbnailError9",e)
                return False           
            return False
    else:
        try:
            myImage.save(thumbnail_save_path, "PNG")
        except Exception as e:
            print("createThumbnailError10",e)
            return False
    try:
        r.delete()
    except Exception as e:
        print("createThumbnailError11",e)
        return True
    return True

def createThumbnail(model_path, thumbnail_width, thumbnail_height, thumbnail_save_path, transparent=True):
    try:
        retValue = createThumbnailAndReturn(model_path, int(thumbnail_width), int(thumbnail_height), thumbnail_save_path, transparent)
        if retValue==False:
            try:
                _, tail = os.path.split(model_path)        
                pathfilename, _ = os.path.splitext(tail)       
                grey = (127,127,127)
                #white = (255,255,255)
                transparent = (0,0,0,0)        
                wm = Image.Image.new('RGBA',(int(thumbnail_width),int(thumbnail_height)),transparent)            
                font = Image.ImageFont.load_default() #Image.ImageFont.truetype('verdana.ttf',8)
                draw = Image.ImageDraw.Draw(wm)
                w,h = draw.textsize(pathfilename, font)
                draw.text((int((thumbnail_width-w)/2),int((thumbnail_height-h)/2)),pathfilename,grey,font)
                wm.save(thumbnail_save_path)
            except Exception as e:
                print("createThumbnailTextError1",e)
                try:
                    wm = Image.Image.new('RGBA',(int(thumbnail_width),int(thumbnail_height)),transparent)
                    wm.save(thumbnail_save_path)
                except Exception as e:
                    print("createThumbnailTextError2",e)
    except Exception as e:
        print("createThumbnailTextError3",e)
    