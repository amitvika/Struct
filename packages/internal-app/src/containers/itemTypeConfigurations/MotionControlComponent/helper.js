import { gltf_Dict } from '@monostruct/common/gltf/Tree/utils';

export const getTableData = (gltfjsonParam) => {
  //console.log(gltfjsonParam,gltfjson);
  let currentData = [];
  console.log('gltgltfjsonParam', gltfjsonParam);
  if (gltfjsonParam && gltfjsonParam.tree) {
    for (let index = 1; index < gltfjsonParam.tree.length; index++) {
      const element = gltfjsonParam.tree[index];
      //console.log(element);
      currentData.push({
        id: index,
        index: index,
        name: element[gltf_Dict['name']],
        order: null,
        AX: 0,
        AY: 0,
        AZ: 1,
        CX: 0,
        CY: 0,
        CZ: 1,
        CW: 0,
        insert: 'Sliding',
        dispense: null,
        quantity: null,
        ...element,
        selected: true,
        selectedshell: true
      });
    }
  }
  console.log('Currentdata', currentData);
  return currentData;
};
