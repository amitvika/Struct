import React from "react";

import DesignAPage from '@ravibasil/common/containers/design'
import ProductDesignHeader from "./ProductDesignHeader";
const ProductDesign = ({gltfjson, setgltfjson}) => {
    // let history = useHistory();
    const handleItemClick = (id) => { };

    return (
        <>
            <ProductDesignHeader
             gltfjson={gltfjson}
             setgltfjson={setgltfjson}
            />
            <div>

                <DesignAPage />
            </div>
        </>
        // <TableGridView
        //     title={'Product Design'}
        //     fields={fields}
        //     fetchList={ProductDesignAPI.fetchProductDesigns}
        //     upsertListItem={ProductDesignAPI.upsertProductDesign}
        //     isAddEditActionsEnabled={true}
        //     handleItemClick={handleItemClick}
        //     isAddEditLinkVisible ={ true}
        // />
    );
}

export default ProductDesign;