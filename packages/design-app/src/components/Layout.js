import React from 'react'
import Header from './Header/Header';

export default function Layout(props) {
  return (
    < >
      <Header />
      <div style={{ marginTop: '75px', width: '100%',
    top: 0,
    left: "auto",
    right: 0,
    position: "fixed", }}>
        {props.children}
      </div>
    </>
  )
}
