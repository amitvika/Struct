import React from 'react';
import Header from '@monostruct/common/components/Header/Header';

export const headerListItem = [
  {
    label: 'All Designs',
    href: '/design',
    addSeparator: true
  },
  {
    label: 'Design Tools',
    addSeparator: false,
    hoverMenuHandler: true
  },
  {
    label: 'Product Builder',
    href: '/product',
    addSeparator: false,
    showOnHover: true
  },
  {
    label: 'CAD',
    href: '/cad',
    addSeparator: false,
    showOnHover: true
  },
  {
    label: 'PCB',
    href: '/pcb',
    addSeparator: false,
    showOnHover: true
  },
  {
    label: 'Silicon',
    href: '/silicon',
    addSeparator: false,
    showOnHover: true
  },
  {
    label: 'Architecture',
    href: '/architecture',
    addSeparator: false,
    showOnHover: true
  },
  {
    label: 'Clothing',
    href: '/clothes',
    addSeparator: false,
    showOnHover: true
  },
  {
    label: 'UI & UX App Designer',
    href: '/appdesigner',
    addSeparator: true,
    showOnHover: true
  },
  {
    label: 'Designers',
    addSeparator: false,
    showOnHover: true
  },
  {
    label: 'Makers',
    addSeparator: false,
    showOnHover: true
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
