import React, { useEffect, useState } from 'react'
import { useQuery } from '@ravibasil/common/utils/customHooks'
import { loginApi, registrationApi, loadUserApi } from '@ravibasil/common/api/auth';
import LoadingModal from '@ravibasil/common/components/LoadingModal';

export default function ProductDesign() {
  const query = useQuery();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem()
    // loadUserApi()
    //   .then(res => {
    //     console.log('------->> Res ', res)
    //   })
    //   .catch(error => {
    //     console.log('Error')
    //   })
  }, [query.get('token')])

  return (
    <div>
      <LoadingModal isLoading={false} />
    </div>
  )
}
