import React, { useState, useEffect } from 'react'
import ItemsAPI from '../../api/items.api';
import ThreejsViewer from '../3DViewer/ThreejsViewer';

export default function ThreejsViewModal({ itemId = '', isVisible = false, closeModal }) {
  const [jsonMesh, setJSONMesh] = useState({});

  useEffect(() => {
    fetchStep()
  }, [isVisible]);



  const fetchStep = () => {

    ItemsAPI
      .getItemGeomtery(itemId)
      .then(res => {
        setTimeout(() => {
          setJSONMesh(res.data.step)
        }, 100);

      })
  }

  return (
    <div className="Vendor_modal" style={{ width: '500px', height: '500px' }}>
      <ThreejsViewer jsonMesh={jsonMesh} />
    </div>
  )

}
