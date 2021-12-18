import React from 'react';
import Header from '@monostruct/common/components/Header/Header';

export const headerListItem = [
  {
    label: 'All Designs',
    href: '/design',
    addSeparator: true
  },
  {
    label: 'Product Builder',
    href: '/product',
    addSeparator: false
  },
  {
    label: 'CAD',
    href: '/cad',
    addSeparator: false
  },
  {
    label: 'PCB',
    href: '/pcb',
    addSeparator: false
  },
  {
    label: 'Silicon',
    href: '/silicon',
    addSeparator: false
  },
  {
    label: 'Architecture',
    href: '/architecture',
    addSeparator: false
  },
  {
    label: 'Clothing',
    href: '/clothes',
    addSeparator: false
  },
  {
    label: 'UI & UX App Designer',
    href: '/appdesigner',
    addSeparator: true
  },
  {
    label: 'Designers',
    addSeparator: false
  },
  {
    label: 'Makers',
    addSeparator: false
  }
];

export default function Layout(props) {
  return (
    <>
      <Header {...{ headerListItem }} />
      {props.children}
    </>
  );
}
