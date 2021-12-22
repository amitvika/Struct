import React, { useState, useEffect } from 'react';
import ItemsAPI from '@monostruct/common/api/items.api';

export default function ThreejsViewModal({
  itemId = '',
  isVisible = false,
  closeModal
}) {
  const [threejsObject, setThreejsObject] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchStep();
  }, [isVisible]);

  const fetchStep = () => {};

  return (
    <div className="Vendor_modal" style={{ width: '500px', height: '500px' }}>
      {/* <ThreejsViewer data={threejsObject} isLoading={isLoading}/> */}
    </div>
  );
}
