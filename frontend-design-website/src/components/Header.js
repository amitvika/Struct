import React, { useEffect, useState } from 'react'
import SharedHeader from 'shared-lib/src/components/Header';

export default function Header() {

  const [nav, setNav] = useState(false);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener('scroll', () => { });
    }
  }, [])

  const handleScroll = () => {
    if (window.pageYOffset > 0) {
      setNav(true);
    } else {

      setNav(false);
    }

  }


  return (
    <SharedHeader nav={nav}>
      <ul id="nav" className="nav navbar-nav menu">
        <li className="menu-item">
          <a href="#">Designs</a>
        </li>
        <li className="menu-item">
          <a href="#">Product</a>
        </li>
        <li className="menu-item">
          <a href="#">CAD</a>
        </li>
        <li className="menu-item">
          <a href="#">PCB</a>
        </li>
        <li className="menu-item">
          <a href="#">Silicon</a>
        </li>
        <li className="menu-item">
          <a href="#">Clothes</a>
        </li>
        <li className="menu-item">
          <a href="#">Architecture</a>
        </li>
      </ul>
    </SharedHeader>)
}
