import React, { useEffect } from "react";
import { useHistory } from 'react-router-dom';
import { useQuery } from '../../utils/customHooks'

import DesignAPage from '@ravibasil/common/containers/design/design'
import ProductDesignHeader from "./ProductDesignHeader";
import Product from '@ravibasil/common/containers/product';
import ProductTab from '@ravibasil/common/containers/productTab';
import AppDesigner from '@ravibasil/common/containers/appDesigner';
import CadTab from '@ravibasil/design-app/src/containers/cad'
import PcbTab from '@ravibasil/design-app/src/containers/cad'
import Silicon from '@ravibasil/design-app/src/containers/silicon'
import Clothes from '@ravibasil/design-app/src/containers/clothes'
import Architecture from '@ravibasil/design-app/src/containers/architecture'
import PredesignedComponents from '@ravibasil/design-app/src/containers/predesigned'

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
      case 'product':
        return <ProductTab
          gltfjson={gltfjson}
          setgltfjson={setgltfjson} />;
      case 'cad':
        return <CadTab
          gltfjson={gltfjson}
          setgltfjson={setgltfjson} />;
      case 'pcb':
        return <PcbTab
          gltfjson={gltfjson}
          setgltfjson={setgltfjson} />
      case 'silicon':
        return <Silicon
          gltfjson={gltfjson}
          setgltfjson={setgltfjson} />
      case 'clothes':
        return <Clothes
          gltfjson={gltfjson}
          setgltfjson={setgltfjson} />
      case 'architecture':
        return <Architecture
          gltfjson={gltfjson}
          setgltfjson={setgltfjson} />
      case 'predesigned':
        return <PredesignedComponents
          gltfjson={gltfjson}
          setgltfjson={setgltfjson} />
      case 'app-designer':
        return <AppDesigner />;
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