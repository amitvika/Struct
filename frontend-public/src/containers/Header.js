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
          <a href="#">Design Quote</a>
          <ul className="sub-menu">
            <li className="menu-item"><a href="#">Product Landing 1</a></li>
            <li className="menu-item"><a href="#">Product Landing 2</a></li>
            <li className="menu-item"><a href="#">Digital Agency</a></li>
            <li className="menu-item"><a href="#">Startup</a></li>
            <li className="menu-item"><a href="#">Saas/Software</a></li>
            <li className="menu-item"><a href="#">App Showcase</a></li>
            <li className="menu-item"><a href="#">SEO/Marketing</a></li>
            <li className="menu-item"><a href="#">Book/eBook</a></li>
          </ul>
        </li>
        <li className="menu-item">
          <a href="http://localhost:3002" target="_blank">Develop Products</a>
        </li>
        <li className="menu-item">
          <a href="#">Company</a>
          <ul className="sub-menu">
            <li className="menu-item"><a href="#">Services</a></li>
            <li className="menu-item"><a href="#">Features</a></li>
            <li className="menu-item"><a href="#">About</a></li>
            <li className="menu-item"><a href="#">Pricing</a></li>
            <li className="menu-item"><a href="#">Faq</a></li>
            <li className="menu-item"><a href="#">Contact</a></li>
          </ul>
        </li>

        <li>
          <a href="#">Login</a>
        </li>

      </ul>
    </SharedHeader>)
}
