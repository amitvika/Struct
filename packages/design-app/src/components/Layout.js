import React from 'react'
import Header from './Header/Header';

export default function Layout(props) {
  return (
    < >
      <Header />
      <div style={{ marginTop: '75px' }}>
        {props.children}
      </div>
    </>
  )
}
