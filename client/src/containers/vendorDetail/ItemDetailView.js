import React, { useState, useEffect } from 'react'
import ItemsAPI from '../../api/items.api';
import ThreejsViewer from '../3DViewer/ThreejsViewer';

export default function ThreejsViewModal({ itemId = '', isVisible = false, closeModal }) {
  const [threejsObject, setThreejsObject] = useState({});

  useEffect(() => {
    fetchStep()
  }, [isVisible]);



  const fetchStep = () => {

    ItemsAPI
      .getItemThreejsData(itemId)
      .then(res => {
        setTimeout(() => {
          setThreejsObject(res.data)
        }, 100);

      })
  }

  return (
    <div className="Vendor_modal" style={{ width: '500px', height: '500px' }}>
      <ThreejsViewer data={threejsObject} />
    </div>
  )

}
