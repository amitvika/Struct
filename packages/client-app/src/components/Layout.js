import React from 'react';
import Header from '@monostruct/common/components/Header/Header';
const pages = ['My Purchases', 'Robot Programming', 'Design'];
const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

export const headerListItem = [
  {
    label: 'My Purchases',
    href: '/my-purchases',
    addSeparator: false
  },
  {
    label: 'Robot Programming',
    href: '/product',
    addSeparator: false
  },
  {
    label: 'Design',
    href: '/design',
    addSeparator: false
  }
];

export default function Layout(props) {
  return (
    <>
      <Header {...{ headerListItem }} />
      <div
        style={{
          marginTop: '75px',
          width: '100%',
          top: 0,
          left: 'auto',
          right: 0,
          position: 'fixed'
        }}
      >
        {props.children}
      </div>
    </>
  );
}
