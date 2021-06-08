import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";

import ProductDesignAPI from '@ravibasil/common/api/productDesign.api';
import TableGridView from '@ravibasil/common/components/TableGridView';
import { fields } from '@ravibasil/common/constants/productDesign'

const ProductDesign = () => {
    let history = useHistory();
    const handleItemClick = (id) => {};

    useEffect(() =>{
        console.log('--------->>>')
    })

    return (
        <TableGridView
            title={'Product Design'}
            fields={fields}
            fetchList={ProductDesignAPI.fetchProductDesigns}
            upsertListItem={ProductDesignAPI.upsertProductDesign}
            isAddEditActionsEnabled={true}
            handleItemClick={handleItemClick}
            isAddEditLinkVisible ={ true}
        />
    );
}

export default ProductDesign;