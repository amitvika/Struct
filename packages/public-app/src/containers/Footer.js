import React from 'react'
import {Link} from "react-router-dom"


export default function Footer() {
    return (
        <div>

            <footer className="footer-area" style={{ overflow: 'hidden' }}>
                <div className="footer-top">
                    <div className="container">
                        <div className="row footer_sidebar">
                            <div className="col-xs-6 col-sm-6 col-md-3">
                                <div className="widget widget1 about_us_widget">
                                    <a href="#" className="logo">
                                        <img src="assets/images/logo.png" alt="f-logo" />
                                    </a>
                                    <p>Lorem ipsum dolor sit consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud.</p>
                                    <ul className="nav social_icon row m0">
                                        <li><a target="_blank" href="#"><i className="fa fa-facebook" /></a></li>
                                        <li><a target="_blank" href="#"><i className="fa fa-twitter" /></a></li>
                                        <li><a target="_blank" href="#"><i className="fa fa-instagram" /></a></li>
                                        <li><a target="_blank" href="#"><i className="fa fa-linkedin" /></a></li>
                                        <li><a target="_blank" href="#"><i className="fa fa-google-plus" /></a></li>
                                        <li><a target="_blank" href="#"><i className="fa fa-pinterest-p" /></a></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-xs-6 col-sm-6 col-md-3">
                                <div className="widget widget2 widget_contact">
                                    <h4 className="widget_title">CONTACT INFO</h4>
                                    <div className="widget_inner row m0">
                                        <ul>
                                            <li>
                                                <i className="ti-location-pin" />
                                                <div className="location_address fleft">
                                                    25 Bedford St. <br />
                          New York City, N.Y.
                        </div>
                                            </li>
                                            <li>
                                                <i className="ti-mobile" />
                                                <div className="fleft contact_no">
                                                    <a href="#">+8801236 47896</a>
                                                </div>
                                            </li>
                                            <li>
                                                <i className="ti-email" />
                                                <div className="fleft contact_mail">
                                                    <a href="#">inova.theme@gmail.com</a>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xs-6 col-sm-6 col-md-3">
                                <li className="widget tweets-widget">
                                    <h2 className="widget_title">Twitter Feeds</h2>
                                    <ul className="tweets">
                                        <li>
                                            <div>Are you planning to build your <a href="#" target="_blank">#Website</a> in a <a href="#" target="_blank">#trendy</a> &amp; modern style like a “Split Slider”? Our Saasland MultiPurpos… <a href="#" target="_blank">https://t.co/Uj3W4EES1o</a></div>
                                            <span><i className="fa fa-twitter" /> 6m ago </span>
                                        </li>
                                    </ul>
                                </li>
                            </div>
                            <div className="col-xs-6 col-sm-6 col-md-3">
                                …
              </div>
                        </div>
                    </div>
                </div>
                <div className="row m0 footer_bottom">
                    <div className="container">
                        <div className="row">
                            <div className="col-sm-4">
                                {/* This will generate HTML, that's why this is ecoed as shortcode. It shouldn't be escaped with esc_html as it will generate HTML */}
                2018 All Right Reserved | <a href="#">DroitThemes</a>
                                <p />
                            </div>
                            <div className="right col-sm-8">
                                <div className="menu-quick-links-container">
                                    <ul id="menu-quick-links" className="footer-menu">
                                        <li className="menu-item menu-item-type-custom menu-item-object-custom"><a href="#">About</a></li>
                                        <li className="menu-item menu-item-type-custom menu-item-object-custom"><a href="#">Help</a></li>
                                        <li className="menu-item menu-item-type-custom menu-item-object-custom"><a href="#">Contact</a></li>
                                        <li className="menu-item menu-item-type-custom menu-item-object-custom"><a href="#">Terms</a></li>
                                        <li className="menu-item menu-item-type-custom menu-item-object-custom"><a href="#">Privacy</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
     
    )
}
