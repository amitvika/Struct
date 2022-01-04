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
    href: `${process.env.REACT_APP_DESIGN_URL}`,
    target: '_blank',
    addSeparator: false,
    rel: 'noopener noreferrer'
  },
  {
    label: 'Struct Home',
    href: `${process.env.REACT_APP_STRUCT_HOME}`,
    target: '_blank',
    addSeparator: false,
    rel: 'noopener noreferrer'
  }
];

export default function Layout(props) {
  const loginPageUrl = '/login';
  return (
    <div sx={{ margin: '20px 7%' }}>
      <Header {...{ headerListItem, loginPageUrl }} />

      {props.children}
    </div>
  );
}
