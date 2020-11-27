import React, { useState, useEffect } from 'react'
import ItemsAPI from '../../api/items.api';
import ThreejsViewer from '../3DViewer/ThreejsViewer';

export default function ThreejsViewModal({ itemId = '', isVisible = false, closeModal }) {
  const [threejsObject, setThreejsObject] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchStep()
  }, [isVisible]);

  const fetchStep = () => {
    setIsLoading(true);
    ItemsAPI
      .getItemThreejsData(itemId)
      .then(res => {
        setIsLoading(false);
        setTimeout(() => {
          setThreejsObject(res.data)
        }, 100);
      })
      .catch(error=>{
        setIsLoading(false);
      })
  }

  return (
    <div className="Vendor_modal" style={{ width: '500px', height: '500px' }}>
      <ThreejsViewer data={threejsObject} isLoading={isLoading}/>
    </div>
  )

}
