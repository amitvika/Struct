import React from 'react'
import StickyLogo from '../assets/images/new_logo.png'
import Logo from '../assets/images/logo_white.png'

export default function Header({ nav, children, menuButton }) {

  return (
    <header className={`header ${nav ? 'stricky-fixed' : ''}`} id="stricky">
      <nav className="navbar navbar-default">
        {
          menuButton
        }
        <div className="container">
          <div className="navbar-header">
            <a className="navbar-brand" href="#">
              <img id="outer_menu_logo" style={{ width: '270px' }} src={Logo} alt="Logo" />
              <img id="sticky_menu_logo" style={{ width: '270px' }} src={StickyLogo} alt="Sticky Logo" />
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
              {children}
            </div>
          </div>
          {/* /.navbar-collapse */}
        </div>
      </nav>
    </header>
  )
}
