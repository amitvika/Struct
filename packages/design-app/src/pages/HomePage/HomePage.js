import React, { useEffect, useState } from 'react';
import { useQuery } from '@monostruct/common/utils/customHooks';
import LoadingModal from '@monostruct/common/components/LoadingModal';

export default function HomePage() {
  const query = useQuery();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    localStorage.setItem('token', query.get('token'));

    setTimeout(() => setIsLoading(false), 3000);
  }, [query.get('token')]);

  return (
    <div>
      <LoadingModal isLoading={false} />
    </div>
  );
}
