import os
import os.path


class Texture(object):
    """
    This class encapsulates the necessary texture properties:
    Filename, toScaleU, etc.
    """
    def __init__(self, filename):
        if not os.path.isfile(filename):
            raise IOError("File %s not found.\n" % filename)
        self._filename = filename
        self._toScaleU = 1.0
        self._toScaleV = 1.0
        self._toRepeatU = 1.0
        self._toRepeatV = 1.0
        self._originU = 0.0
        self._originV = 0.0

    def TextureScale(self, toScaleU, toScaleV):
        self._toScaleU = toScaleU
        self._toScaleV = toScaleV

    def TextureRepeat(self, toRepeatU, toRepeatV):
        self._toRepeatU = toRepeatU
        self._toRepeatV = toRepeatV

    def TextureOrigin(self, originU, originV):
        self._originU = originU
        self._originV = originV

    def GetProperties(self):
        return (self._filename,
                self._toScaleU, self._toScaleV,
                self._toRepeatU, self._toRepeatV,
                self._originU, self._originV)
