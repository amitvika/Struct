import React, { useEffect } from "react";
import { useHistory } from 'react-router-dom';
import { useQuery } from '../../utils/customHooks'

import DesignAPage from '@ravibasil/common/containers/design/design'
import ProductDesignHeader from "./ProductDesignHeader";
import Product from '@ravibasil/common/containers/product'

import ProductDesignAPI from '@ravibasil/common/api/productDesign.api';

const ProductDesign = ({ gltfjson, setgltfjson }) => {
    let query = useQuery();
    let history = useHistory();

    const handleAddDesign = (name) => {
        ProductDesignAPI.upsertProductDesign({ name, type: query.get('type'), id: query.get('id') })
            .then(res => {
                history.push(`/design?type=my-design`);
            })
            .catch(error => {

            })
    }

    const renderView = () => {
        switch (query.get('type')) {
            case 'my-design':
                return <DesignAPage />;
            default:
                return <Product handleSave={handleAddDesign} name={query.get('name')} />;
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