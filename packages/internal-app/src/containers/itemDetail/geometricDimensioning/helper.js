import {
  SELECTSOLID,
  SELECTFACE,
  SELECTEDGE,
  SELECTCORNER,
  SELECTMEASURE,
  SELECTASSEMBLY,
  SELECTFEATURE,
  gltf_Dict
} from '@monostruct/common/gltf/Tree/utils';

export const buildParentChildTree = (
  data = [],
  mySelectedOption = 0,
  idKey = gltf_Dict['id'],
  parentKey = gltf_Dict['parentId'],
  childrenKey = 'children',
  myGlobalTree = null
) => {
  const tree = [];
  const childrenOf = {};
  if (!data) {
    return tree;
  }
  try {
    data.forEach((item) => {
      item[childrenKey] = [];
    });
  } catch (error) {
    return tree;
  }
  //console.log(data, mySelectedOption, mySelectedOption == SELECTFACE);
  data.forEach((item) => {
    let visible = false;
    if (item[gltf_Dict['topLeft']]) {
      visible = item[gltf_Dict['topLeft']][0] !== null;
      if (visible) {
        let myelement = item[gltf_Dict['element']];
        let myName = item[gltf_Dict['name']];
        let first4chars = myName.slice(0, 4);
        let first6chars = myName.slice(0, 6);
        if (myelement) {
          first4chars = myelement;
          first6chars = myelement;
          if (myelement == 'F') {
            first4chars = 'FACE';
          } else if (myelement == 'E') {
            first4chars = 'EDGE';
          } else if (myelement == 'V') {
            first6chars = 'VERTEX';
          } else if (myelement == 'P') {
            first4chars = 'PART';
          } else if (myelement == 'f' || myelement == 'e' || myelement == 'v') {
            first6chars = 'SLICER';
          }
        }
        //console.log("1",myName,first4chars,selectedOption,visible);
        if (first4chars != 'PART') {
          visible =
            mySelectedOption == SELECTMEASURE ||
            mySelectedOption == SELECTFEATURE;
          if (first4chars == 'FACE') {
            visible =
              visible ||
              mySelectedOption == SELECTFACE ||
              mySelectedOption == SELECTEDGE ||
              mySelectedOption == SELECTCORNER;
          } else if (first4chars == 'EDGE') {
            visible =
              visible ||
              mySelectedOption == SELECTEDGE ||
              mySelectedOption == SELECTCORNER;
          } else if (first6chars == 'VERTEX') {
            visible = visible || mySelectedOption == SELECTCORNER;
          } else if (first6chars == 'SLICER') {
            visible =
              mySelectedOption != SELECTSOLID &&
              mySelectedOption != SELECTASSEMBLY;
          } else {
            visible = true;
          }
        }
      } else {
        //visible = true;
      }
    } else {
      //visible = true;
    }
    if (visible) {
      if (!item['id']) {
        item['id'] = item[gltf_Dict['id']];
      }
      if (!item['name']) {
        item['name'] = item[gltf_Dict['name']];
      }
      if (!item['state']) {
        item['state'] = {
          expanded: item[gltf_Dict['id']] == '1',
          selected: item.selectedshell
        };
      } else {
        const mySelectedToupdate = item.selectedshell;
        const currentNode = findMyTreeNode(item, myGlobalTree);

        if (currentNode) {
          item['state'] = {
            expanded: currentNode['state'].expanded,
            selected: mySelectedToupdate
          };
        } else {
          item['state'] = {
            selected: mySelectedToupdate
          };
        }
      }
      const { [idKey]: id, [parentKey]: parentId = 0 } = item;
      childrenOf[id] = childrenOf[id] || [];
      item[childrenKey] = childrenOf[id];
      parentId !== null
        ? (childrenOf[parentId] = childrenOf[parentId] || []).push(item)
        : tree.push(item);
    }
  });
  myGlobalTree = tree;
  //console.log('Got myGlobalTree', tree, myGlobalTree);
  return tree;
};

const findMyTreeNode = (node, myGlobalTree) => {
  if (myGlobalTree) {
    return findrecursiveTreeNode(node, myGlobalTree[0]);
  } else {
    return null;
  }
};

const findrecursiveTreeNode = (node, myParent) => {
  if (myParent[gltf_Dict['name']] == node[gltf_Dict['name']]) {
    return myParent;
  }
  if (myParent.children && myParent.children.length > 0) {
    for (let index = 0; index < myParent.children.length; index++) {
      const element = myParent.children[index];
      const gotAnswer = findrecursiveTreeNode(node, element);
      if (gotAnswer) {
        return gotAnswer;
      }
    }
  }
  return null;
};
