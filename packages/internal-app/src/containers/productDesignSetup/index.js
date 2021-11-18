import React, { useEffect, useState } from 'react';
import Assembly from '../itemDetail/assembly';
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

  const handleItemSelect = (data) => {
    const itemFind = firstLevelItems.find((item) =>
      data.name.includes(item.name)
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
