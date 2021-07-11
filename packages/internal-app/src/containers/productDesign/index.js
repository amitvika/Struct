import React from "react";
import { useQuery } from '../../utils/customHooks'

import DesignAPage from '@ravibasil/common/containers/design/design'
import ProductDesignHeader from "./ProductDesignHeader";
import Product from '@ravibasil/common/containers/product'

const ProductDesign = ({ gltfjson, setgltfjson }) => {
    let query = useQuery();

    const handleItemClick = (id) => { };


    const renderView = () => {
        switch (query.get('type')) {
            case 'my-design':
                return <DesignAPage />;
            case 'product':
                return <Product />
            default:
                return <Product />;
        }
    }
    return (
        <>
            <ProductDesignHeader
                gltfjson={gltfjson}
                setgltfjson={setgltfjson}
            />
            <div>
                {renderView()}

            </div>
        </>
    );
}

export default ProductDesign;