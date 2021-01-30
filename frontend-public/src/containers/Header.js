import React, { useEffect, useState } from 'react'

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
    <header className={`header ${nav ? 'stricky-fixed' : ''}`} id="stricky">
      <nav className="navbar navbar-default">
        <div className="container">
          <div className="navbar-header">
            <a className="navbar-brand" href="#">
              <img id="outer_menu_logo" src="assets/images/logo.png" alt="Logo" />
              <img id="sticky_menu_logo" src="assets/images/inova-sticky.png" alt="Sticky Logo" />
            </a>
            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar cross" />
              <span className="icon-bar" />
              <span className="icon-bar" />
            </button>
          </div>

          <div className="collapse navbar-right navbar-collapse" id="bs-example-navbar-collapse-1">
            <div className="menu-main-menu-container">
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
                  <a href="#">Develop Products</a>
                  <ul className="sub-menu">
                    <li className="menu-item">
                      <a href="#">Grid</a>
                      <ul className="sub-menu">
                        <li className="menu-item"><a href="#">2 Columns</a></li>
                        <li className="menu-item"><a href="#">3 Columns</a></li>
                        <li className="menu-item"><a href="#">4 Columns</a></li>
                      </ul>
                    </li>
                    <li className="menu-item">
                      <a href="#">Full Width</a>
                      <ul className="sub-menu">
                        <li className="menu-item"><a href="#">3 Columns</a></li>
                        <li className="menu-item"><a href="#">4 Columns</a></li>
                      </ul>
                    </li>
                    <li className="menu-item"><a href="#">Project Details</a></li>
                  </ul>
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
            </div>
          </div>
          {/* /.navbar-collapse */}
        </div>
      </nav>
    </header>
  )
}
