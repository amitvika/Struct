import React from 'react';
import Header from '@monostruct/common/components/Header/Header';

const headerListItem = [
  {
    label: 'Items',
    href: '/items',
    addSeparator: false
  },
  {
    label: 'Clients',
    href: '/clients',
    addSeparator: false
  },
  {
    label: 'Vendors',
    href: '/vendors',
    addSeparator: false
  },
  {
    label: 'Factories',
    href: '/factories',
    addSeparator: false
  },
  {
    label: 'Product design',
    href: `${process.env.REACT_APP_DESIGN_URL}`,
    target: '_blank',
    addSeparator: false,
    rel: 'noopener noreferrer'
  }
];

const secondHeaderList = [
  {
    label: 'My Tasks and Profile',
    href: `/viewMyProfile?tab=3`,
    addSeparator: false
  }
];

const dropdownList = [
  {
    label: 'Administrative ',
    href: `/administrative`,
    addSeparator: false
  }
];

export default function Layout(props) {
  return (
    <>
      <Header
        {...{
          headerListItem,
          secondHeaderList,
          dropdownList,
          isInternalApp: true
        }}
      />
      {props.children}
    </>
  );
}
