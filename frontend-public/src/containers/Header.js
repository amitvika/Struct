import React from 'react'

export default function Header() {
    return (
        <header className="header" id="stricky">
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
            {/*========== Collect the nav links, forms, and other content for toggling ==========*/}
            <ul className="nav navbar-nav nav-right navbar-right menu">
              <li className="menu-item-has-children">
                <a href="#" className="dropdown-toggle" data-toggle="dropdown"> <i className="fa fa-shopping-bag" /><span className="badge">0</span>
                </a>
                <div className="cart-list sub-menu">
                  <div className="parent-area">
                    <div className="empty">No products in the cart.</div>
                  </div>
                  <div className="total">
                    <div className="sub-total">
                      <p>Subtotal                        :<span><span className="Price-amount amount"><span className="Price-currencySymbol">£</span>0.00</span></span></p>
                    </div>
                    <div className="menu-cart-action">
                      <a className="menu-cart-btn-action" href="#">View Cart</a>
                      <a href="#" className="btn btn-cart btn-animated-none"> Checkout </a>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
            <div className="collapse navbar-right navbar-collapse" id="bs-example-navbar-collapse-1">
              <div className="menu-main-menu-container">
                <ul id="nav" className="nav navbar-nav menu">
                  <li className="menu-item">
                    <a href="#">Home</a>
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
                    <a href="#">Portfolio</a>
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
                    <a href="#">Blog</a>
                    <ul className="sub-menu">
                      <li className="menu-item">
                        <a href="#">List</a>
                        <ul className="sub-menu">
                          <li className="menu-item"><a href="#">Large Image</a></li>
                          <li className="menu-item"><a href="#">Small Image</a></li>
                        </ul>
                      </li>
                      <li className="menu-item">
                        <a href="#">Grid</a>
                        <ul className="sub-menu">
                          <li className="menu-item"><a href="#">3 Columns</a></li>
                          <li className="menu-item"><a href="#">2 Columns</a></li>
                        </ul>
                      </li>
                      <li className="menu-item"><a href="#">Blog Single</a></li>
                    </ul>
                  </li>
                  <li className="menu-item  menu-item-has-mega-menu">
                    <a href="#">Shortcodes</a>
                    <div className="mega-menu">
                      <ul className="sub-menu mega-menu-row">
                        <li className="menu-item">
                          <a href="#">Content Elements</a>
                          <ul className="sub-menu">
                            <li className="menu-item"><a href="#">Recent Posts</a></li>
                            <li className="menu-item"><a href="#">Recent Projects</a></li>
                            <li className="menu-item"><a href="#">Tabs</a></li>
                            <li className="menu-item"><a href="#">Accordion</a></li>
                            <li className="menu-item"><a href="#">Product With Hotpots</a></li>
                          </ul>
                        </li>
                        <li className="menu-item">
                          <a href="#">Presentation</a>
                          <ul className="sub-menu">
                            <li className="menu-item"><a href="#">Clients Logo</a></li>
                            <li className="menu-item"><a href="#">Compare Our Plans</a></li>
                            <li className="menu-item"><a href="#">Subscribe</a></li>
                            <li className="menu-item"><a href="#">Team Members</a></li>
                            <li className="menu-item"><a href="#">Pricing Table</a></li>
                          </ul>
                        </li>
                        <li className="menu-item">
                          <a href="#">Basic Elements</a>
                          <ul className="sub-menu">
                            <li className="menu-item"><a href="#">Product Carousel</a></li>
                            <li className="menu-item"><a href="#">Countdown</a></li>
                            <li className="menu-item"><a href="#">Contact Form</a></li>
                            <li className="menu-item"><a href="#">Single Product</a></li>
                            <li className="menu-item"><a href="#">Short Address</a></li>
                          </ul>
                        </li>
                        <li className="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children mega-menu-col menu-item-3157">
                          <a href="#">Content blocks</a>
                          <ul className="sub-menu">
                            <li className="menu-item"><a href="#">Video Page</a></li>
                            <li className="menu-item"><a href="#">Features Apps</a></li>
                            <li className="menu-item"><a href="#">Call to action</a></li>
                            <li className="menu-item"><a href="#">Product Gallery</a></li>
                            <li className="menu-item"><a href="#">Icon Box</a></li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                  </li>
                  <li className="menu-item">
                    <a href="#">Pages</a>
                    <ul className="sub-menu">
                      <li className="menu-item"><a href="#">Services</a></li>
                      <li className="menu-item"><a href="#">Features</a></li>
                      <li className="menu-item"><a href="#">About</a></li>
                      <li className="menu-item"><a href="#">Pricing</a></li>
                      <li className="menu-item"><a href="#">Faq</a></li>
                      <li className="menu-item"><a href="#">Contact</a></li>
                    </ul>
                  </li>
                  <li className="menu-item"><a href="#">Shop</a></li>
                </ul>
              </div>
            </div>
            {/* /.navbar-collapse */}
          </div>
        </nav>
      </header>
    )
}
