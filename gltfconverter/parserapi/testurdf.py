from odio_urdf import Robot, Link, Joint, Parent, Child

my_robot = Robot(
    Link(name="link1"),
    Link(name="link2"),
    Link("link3"), #String arguments without keys are assumed to be 'name'
    Link(name="link4"),

    Joint("joint1", Parent("link1"), Child("link2"), type="continuous"),
    Joint("joint2", 
        Parent("link1"),
        Child("link2"),
        type="continuous" #KeyValue arguments go at the end of a call
    ),
    Joint("joint3", Parent("link3"), Child("link4"), type="continuous")
) 
mystr = my_robot.urdf()
print(mystr) #Dump urdf to stdout