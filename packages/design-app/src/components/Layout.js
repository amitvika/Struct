import React from 'react';
import Header from '@monostruct/common/components/Header/Header';

export const headerListItem = [
  {
    label: 'All Designs',
    href: '/design',
    addSeparator: true
  },
  {
    label: 'Product Maker',
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
    label: 'Clothes',
    href: '/clothes',
    addSeparator: false
  },
  {
    label: 'Architecture',
    href: '/architecture',
    addSeparator: false
  },
  {
    label: 'UI & UX App Designer',
    href: '/appdesigner',
    addSeparator: true
  },
  {
    label: 'Buy From Creators',
    addSeparator: false
  },
  {
    label: 'Creators',
    addSeparator: true
  },
  {
    label: 'Machines and Tools',
    addSeparator: true
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
