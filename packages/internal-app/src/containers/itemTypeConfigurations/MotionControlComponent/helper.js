import { gltf_Dict } from '@monostruct/common/gltf/Tree/utils';

export const getTableData = ({ gltfjson, filePartName }) => {
  const gltfjsonParam = gltfjson;
  let currentData = [];
  if (gltfjsonParam && gltfjsonParam.tree) {
    for (let index = 1; index < gltfjsonParam.tree.length; index++) {
      const element = gltfjsonParam.tree[index];
      if (
        filePartName == element[gltf_Dict['display']] ||
        filePartName == element[gltf_Dict['name']]
      ) {
        currentData.push({
          id: index,
          index: index,
          name: element[gltf_Dict['name']],
          // order: null, //these are need only for assembly order
          // AX: 0,
          // AY: 0,
          // AZ: 1,
          // CX: 0,
          // CY: 0,
          // CZ: 1,
          // CW: 0,
          // insert: 'Sliding',
          // dispense: null,
          // quantity: null,
          ...element,
          selected:
            filePartName == element[gltf_Dict['display']] ||
            filePartName == element[gltf_Dict['name']],
          selectedshell:
            filePartName == element[gltf_Dict['display']] ||
            filePartName == element[gltf_Dict['name']]
        });
      }
    }
  }
  console.log('CurrentClickedData', currentData);
  return currentData;
};
