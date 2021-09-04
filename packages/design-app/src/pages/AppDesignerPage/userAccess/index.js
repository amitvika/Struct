import React, { useContext, useEffect, useState } from 'react'
import { AppDesignerContext } from '../../../context/AppDesignerContext'
import Signin from './signin'

export default function UserAccess() {
  const { appDesigner } = useContext(AppDesignerContext)

  return (
    <div>
      {
        (appDesigner === "userAccess") ?
          <>
            <Signin />
          </>
          : "No Componenet"
      }

    </div>
  )
}
