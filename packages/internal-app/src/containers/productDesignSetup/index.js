import React, { useEffect, useState } from 'react';
import Assembly from '@monostruct/common/containers/AssemblyTab';
import { buildParentChildTree } from '../itemDetail/geometricDimensioning/helper';
import { SELECTFEATURE } from '@monostruct/common/gltf/Tree/utils';
import ItemAPI from '@monostruct/common/api/items.api';
import { get } from 'lodash';
import { useHistory } from 'react-router';

export default function ProductDesignSetup({ gltfjson, itemId }) {
  const history = useHistory();
  const [firstLevelItems, setFirstLevelItems] = useState([]);

  useEffect(() => {
    ItemAPI.getItemsAPI(`is_child_item=true&parent_id=${itemId}`)
      .then((res) => {
        setFirstLevelItems(get(res, 'data', []));
      })
      .catch((error) => {
        console.log('Error:', error);
      });
  }, []);

  const itemName = (item) => {
    return item.name
      ? item.name + '0' == item.fileStore
        ? item.filePartName
          ? item.filePartName
          : item.name
        : item.name
      : item.filePartName
      ? item.filePartName
      : 'Untitled-2';
  };
  const handleItemSelect = (data) => {
    const itemFind = firstLevelItems.find((item) =>
      data.name.includes(itemName(item))
    );

    if (itemFind) {
      history.push(`${itemFind.id}?tab=pdcu`);
    }
  };

  return (
    <div>
      {gltfjson?.tree && (
        <Assembly
          {...{
            assemblyTree: buildParentChildTree(gltfjson.tree, SELECTFEATURE),
            handleItemSelect
          }}
        />
      )}
    </div>
  );
}
