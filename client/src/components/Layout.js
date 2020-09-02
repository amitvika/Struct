import React from 'react'
import AppNavbar from './AppNavbar';

export default function Layout(props) {
  return (
    <div>
      <AppNavbar />
      {props.children}
    </div>
  )
}
