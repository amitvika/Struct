import React, { useEffect } from "react";

import ProductDesignAPI from '@ravibasil/common/api/productDesign.api';
import TableGridView from '@ravibasil/common/components/TableGridView';
import { fields } from '@ravibasil/common/constants/productDesign'
// import { typeOption } from "@ravibasil/common/constants/productDesign";
import AddUpdateModal from "./AddUpdateModal";
const ProductDesign = () => {

    const handleItemClick = (id) => { };

    return (
        <TableGridView
            title={'Product Design'}
            fields={fields}
            fetchList={ProductDesignAPI.fetchProductDesigns}
            upsertListItem={ProductDesignAPI.upsertProductDesign}
            isAddEditActionsEnabled={true}
            handleItemClick={handleItemClick}
            isAddEditLinkVisible={true}
            AddUpdateModal={AddUpdateModal}
        />
    );
}

export default ProductDesign;