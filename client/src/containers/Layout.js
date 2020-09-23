import React from 'react'
import AppNavbar from './AppNavbar';

export default function Layout(props) {
  return (
    <div >
      <AppNavbar />
      <div style={{ margin: '7% 5%' }}>
        {props.children}
      </div>
    </div>
  )
}
