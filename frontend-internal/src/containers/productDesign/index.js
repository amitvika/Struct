import React, { useState, useEffect } from "react";

import ProductDesignAPI from '../../api/productDesign.api';
import { fields } from '../../constants/productDesign'
import TableGridView from '../../components/TableGridView';
import { useHistory } from "react-router-dom";

const ProductDesign = () => {
    let history = useHistory();
    const handleItemClick = (id) => {};

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