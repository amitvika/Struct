import os
from OCP.TopoDS import TopoDS_Compound
from OCP.IGESControl import IGESControl_Reader
from OCP.STEPControl import STEPControl_Reader
from OCP.IFSelect import IFSelect_RetDone, IFSelect_ItemsByEntity
from .OCPTopologyUtils import (TopologyExplorer, list_of_shapes_to_compound)

def getChildren(parent, count=0, depth = 0,returnshapes = [] ) :
    
    topology = TopologyExplorer(parent,ignore_orientation=False)         
    mysolids = topology.solids() 
    list_of_solids = list(mysolids)               
    
    depth = depth + 1 
    length = len(list_of_solids)  
    returnshapes=[]                      
    for mysolid in list_of_solids:
        if mysolid: 
            count = count + 1
            print(" I have reached here ", count, "depth", depth, length)
            if(depth < 10 and length > 1 ) :  
                
                myChildren =  getChildren(mysolid,count=count, depth=depth, returnshapes=returnshapes)                                                 
                returnshapes.append({
                    "count" : count,
                    "depth" : depth,
                    "parent":mysolid,
                    "children": myChildren                   
                })
            else:
                returnshapes.append({
                    "count" : count,
                    "depth" : depth,
                    "parent":mysolid,
                    "children":{}
                })
            #print(returnshapes)
    return returnshapes

################
# Step import  #
################
def read_step_file(filename, as_compound=False, verbosity=False, visible_only=False):
    """ read the STEP file and returns a compound
    filename: the file path
    verbosity: optional, False by default.
    as_compound: True by default. If there are more than one shape at root,
    gather all shapes into one compound. Otherwise returns a list of shapes.
    """
    if not os.path.isfile(filename):
        raise FileNotFoundError("%s not found." % filename)

    step_reader = STEPControl_Reader()
    #step_reader.SetReadVisible(visible_only)
    status = step_reader.ReadFile(filename)

    if status == IFSelect_RetDone:  # check status
        if verbosity:
            failsonly = False
            step_reader.PrintCheckLoad(failsonly, IFSelect_ItemsByEntity)
            step_reader.PrintCheckTransfer(failsonly, IFSelect_ItemsByEntity)
        nbr = step_reader.NbRootsForTransfer()
        for i in range(1, nbr + 1):
            transfer_result = step_reader.TransferRoot(i)
            print(filename, "Transfer result", transfer_result, "for", i, "Out of Number of roots", nbr) 
        myshapes=[]
                   
            #if not transfer_result:
                 #raise AssertionError("Transfer failed.")
        nbs = step_reader.NbShapes()
        if nbs == 0:
            print("No shapes to transfer")
        else:  # most cases
            print("Number of shapes:", nbs)
            #shps = []
            # loop over root shapes
            for k in range(1, nbs + 1):
                mycompund = step_reader.Shape(k)
                if mycompund:                                                     
                    myshapes.append(mycompund)
        myshapelen = len(myshapes)
        if myshapelen == 0 :
            print("Warning: no shapes were return", filename)
            return myshapes
        if as_compound:
            if myshapelen<=1 :
                print("Only one shape in", filename)
                return myshapes
            compound, result = list_of_shapes_to_compound(myshapes)
            if not result:
                print("Warning: all shapes were not added to the compound")
            return [compound]
        else:
            if myshapelen == 1:
                mychildren = getChildren(myshapes[0])
                print(mychildren)
                topology = TopologyExplorer(myshapes[0],ignore_orientation=False)         
                mysolids = topology.solids()
                print("I am manually splitting the files",filename)
                returnshapes = []                           
                for mysolid in mysolids:
                    if mysolid:                                                     
                        returnshapes.append(mysolid)
                myretlen = len(returnshapes)
                if myretlen<=1:
                    print("Only one shape in", filename)
                    return myshapes
                print("I have manually splitted the files",filename,"in to",myretlen)
                return returnshapes
            else:
                print("Program has splitted the files",filename,"in to",myshapelen)
                return myshapes
    else:
        raise AssertionError("Error: can't read file.")
    return []

###############
# IGES import #
###############
def read_iges_file(filename, return_as_shapes=False, verbosity=False, visible_only=False):
    """ read the IGES file and returns a compound
    filename: the file path
    return_as_shapes: optional, False by default. If True returns a list of shapes,
                      else returns a single compound
    verbosity: optionl, False by default.
    """
    if not os.path.isfile(filename):
        raise FileNotFoundError("%s not found." % filename)

    iges_reader = IGESControl_Reader()
    iges_reader.SetReadVisible(visible_only)
    status = iges_reader.ReadFile(filename)

    if status == IFSelect_RetDone:  # check status
        if verbosity:
            failsonly = False
            iges_reader.PrintCheckLoad(failsonly, IFSelect_ItemsByEntity)
            iges_reader.PrintCheckTransfer(failsonly, IFSelect_ItemsByEntity)
        nbr = iges_reader.NbRootsForTransfer()
        myshapes=[]
        for i in range(1, nbr + 1):
            transfer_result = iges_reader.TransferRoot(i)
            print(filename, "Transfer result", transfer_result, "for", i, "Out of Number of roots", nbr)            
            #if not transfer_result:
                 #raise AssertionError("Transfer failed.")
            nbs = iges_reader.NbShapes()
            if nbs == 0:
                print("No shapes to transfer in",i,"root")
            else:  # most cases
                print("Number of shapes:", nbs, "in", i,"root")
                #shps = []
                # loop over root shapes
                for k in range(1, nbs + 1):
                    mycompund = iges_reader.Shape(k)
                    if mycompund:                                                     
                        myshapes.append(mycompund)
        myshapelen = len(myshapes)
        if myshapelen == 0 :
            print("Warning: no shapes were return", filename)
            return myshapes
        if as_compound:
            if myshapelen<=1 :
                print("Only one shape in", filename)
                return myshapes
            compound, result = list_of_shapes_to_compound(myshapes)
            if not result:
                print("Warning: all shapes were not added to the compound")
            return [compound]
        else:
            if myshapelen == 1:
                topology = TopologyExplorer(myshapes[0],ignore_orientation=False)         
                mysolids =topology.solids()
                print("I am manually splitting the files",filename)
                returnshapes = []                           
                for mysolid in mysolids:
                    if mysolid:                                                     
                        returnshapes.append(mysolid)
                myretlen = len(returnshapes)
                if myretlen<=1:
                    print("Only one shape in", filename)
                    return myshapes
                print("I have manually splitted the files",filename,"in to",myretlen)
                return returnshapes
            else:
                print("Program has splitted the files",filename,"in to",myshapelen)
                return myshapes
    else:
        raise AssertionError("Error: can't read file.")
    return []


