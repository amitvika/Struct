# =========================== Package Information ===========================
# Version Planning:
#   0.1.x               - Development Status :: 2 - Pre-Alpha
#   0.2.x               - Development Status :: 3 - Alpha
#   0.3.x               - Development Status :: 4 - Beta
#   1.x                 - Development Status :: 5 - Production/Stable
#   <any above>.y       - developments on that version (pre-release)
#   <any above>*.dev*   - development release (intended purely to test deployment)
__version__ = '0.2.0.'

__title__ = 'structparts'
__description__ = 'Hierarchical and deeply parametric models using structquery'
__url__ = 'https://www.linkedin.com/in/lakshmanarajsankaralingam/'

__author__ = 'S Lakshmanaraj'
__email__ = 'lksmangai@yahoo.com'

__license__ = 'Apache Public License 2.0'

__keywords__ = ['structquery', 'cad', '3d', 'modeling', 'strutparts']

# package_data
import inspect as _inspect
import os as _os
_this_path = _os.path.dirname(_os.path.abspath(_inspect.getfile(_inspect.currentframe())))

__package_data__ = []
# append display/web-templates (recursive)
_web_template_path = _os.path.join(_this_path, 'display', 'web-template')
for (root, subdirs, files) in _os.walk(_web_template_path):
    dir_name = _os.path.relpath(root, _this_path)
    __package_data__.append(_os.path.join(dir_name, '*'))


# not text-parsable
import datetime
_now = datetime.date.today()
__copyright__ = "Copyright {year} {author}".format(year=_now.year, author=__author__)


# =========================== Imports ===========================
__all__ = [
    # Sub-modules
    # bringing scope closer to structparts for commonly used classes
    'Component',
    'Part',
    'Assembly',

    # Modules
    'catalogue',
    'codec',
    'constraint',
    'display',
    'errors',
    'params',
    'search',
    'utils',
]

# Sub-modules
from .component import Component
from .part import Part
from .assembly import Assembly

from . import catalogue
from . import codec
from . import constraint
from . import display
from . import errors
from . import params
from . import search
from . import utils
