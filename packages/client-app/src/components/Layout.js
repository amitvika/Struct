import React from 'react';
import Header from '@monostruct/common/components/Header/Header';

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
    label: 'Design Stuff',
    href: `//${process.env.REACT_APP_DESIGN_URL}`,
    target: '_blank',
    addSeparator: false
  },
  {
    label: 'Struct Home',
    href: `//${process.env.REACT_APP_STRUCT_HOME}`,
    target: '_blank',
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
