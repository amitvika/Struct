import React, { useEffect, useState } from 'react'
import { useQuery } from '@ravibasil/common/utils/customHooks'
import LoadingModal from '@ravibasil/common/components/LoadingModal';

export default function HomePage() {
  const query = useQuery();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    localStorage.setItem('token', query.get('token'));

    setTimeout(() => setIsLoading(false), 3000)

  }, [query.get('token')])

  return (
    <div>
      <LoadingModal isLoading={false} />
    </div>
  )
}
