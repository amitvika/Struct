import React from 'react'
import AppNavbar from './AppNavbar';

export default function Layout(props) {
  return (
    <div >
      <AppNavbar />
      <div style={{ marginTop : '65px' }}>
      {props.children}
      </div>
    </div>
  )
}
