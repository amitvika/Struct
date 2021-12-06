# %%
"""
# Baxter kinematics
"""

# %%
"""
In this notebook, we'll try IKPy on the baxter robot
![image.png](attachment:147cc5d0-2ef3-43f4-a3fb-173e91a26899.png)

You will get the following chains:

![Figure 10.png](attachment:485fc81c-e3f6-4e35-9992-20aafef71077.png)

Let's begin!
"""

# %%
"""
## Requirements
"""

# %%
"""
To get this notebook to work, you need to install IKPy, version >= 3.0

Also, if you want to use interactive 3D visualisation (highly recommended), you must use the `widget` matplotlib backend
"""

# %%
# Some necessary imports
import numpy as np

from ikpy.chain import Chain
from ikpy.utils import plot

# Optional: support for 3D plotting in the NB
#matplotlib widget
# turn this off, if you don't need it

# %%
"""
 ## Robot import and setup
"""

# %%
# First, let's import the baxter chains
baxter_left_arm_chain = Chain.from_json_file("../resources/baxter/baxter_left_arm.json")
baxter_right_arm_chain = Chain.from_json_file("../resources/baxter/baxter_right_arm.json")
baxter_pedestal_chain = Chain.from_json_file("../resources/baxter/baxter_pedestal.json")
baxter_head_chain = Chain.from_json_file("../resources/baxter/baxter_head.json")

# %%
#from mpl_toolkits.mplot3d import Axes3D;
""" fig, ax = plot.init_3d_figure()
baxter_left_arm_chain.plot([0] * (len(baxter_left_arm_chain)), ax)
baxter_right_arm_chain.plot([0] * (len(baxter_right_arm_chain)), ax)
baxter_pedestal_chain.plot([0] * (2 + 2), ax)
baxter_head_chain.plot([0] * (4 + 2), ax)
ax.legend()
plot.show_figure() """
# %%
"""
## Inverse kinematics
"""

# %%
### Let's try some IK
fig, ax = plot.init_3d_figure()


target = [0.3, 0.5, 0.15]
target = [0.8, 0, 0]
target_orientation = [1, 0, 0]

frame_target = np.eye(4)
frame_target[:3, 3] = target

ik = baxter_left_arm_chain.inverse_kinematics_frame(frame_target)

baxter_left_arm_chain.plot(ik, ax, target=target)

baxter_right_arm_chain.plot([0] * (len(baxter_left_arm_chain)), ax)
baxter_pedestal_chain.plot([0] * (2 + 2), ax)
baxter_head_chain.plot([0] * (4 + 2), ax)
ax.legend()
plot.show_figure()
print("Succesfully completed")