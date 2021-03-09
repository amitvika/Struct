import React from 'react'
import RobotWeldingBackground from '../assets/images/robot_welding.jpg'

export default function home() {
    return (
        <>

            <div>
                <div className="hero-section" style={{ backgroundImage: `url(${RobotWeldingBackground})` }}>
                    <div className="hero-section-area paypal">
                        <div className="container paypal-flex">
                            <div className="hero-content">
                                <h1>Infinitely Scalable<br /> Manufacturing</h1>
                                <p>We bring you the latest technology at your service</p>
                                <a href="#" className="btn slider-btn">Explore Top Products</a>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="pr-2-power-features">
                    <div className="container">
                        <div className="section-title">
                            <h2>Powerful Features</h2>
                            <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed consequuntur magni dolores ratione voluptatem sequi nesciunt.</p>
                        </div>
                        <div className="row pr-2-features">
                            <div className="col-sm-6 pr-2-features-content">
                                <h2 className="th-h2">Track &amp; share your activity</h2>
                                <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed consequuntur magni dolores ratione voluptatem sequi nesciunt.</p>
                                <ul>
                                    <li><i className="fa fa-check" />Very high resolution (4K)</li>
                                    <li><i className="fa fa-check" />Built on latest technologies</li>
                                    <li><i className="fa fa-check" />Can integrate with iOS and Android</li>
                                    <li><i className="fa fa-check" />Built on latest technologies</li>
                                </ul>
                            </div>
                            <div className="col-sm-6">
                                <div className="pr-sliders pr-sliders-feature owl-carousel owl-theme">
                                    <div className="item">
                                        <img src="assets/images/fea-watch1.png" alt="Image" />
                                    </div>
                                    <div className="item">
                                        <img src="assets/images/pr-watch-2-1.png" alt="Image" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="power-full-features-area">
                    <div className="inova-bg-overlay" style={{ backgroundImage: '-ms-linear-gradient(0deg,  #02a4c7 0%, #89ba86 100%)', opacity: '0.979' }} />
                    <div className="container">
                        <div className="section-title">
                            <h2>Products Features</h2>
                            <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed consequuntur magni dolores ratione voluptatem sequi nesciunt.</p>
                        </div>
                        <div className="row pow-features">
                            <div className="col-md-4 pow-feature-items text-right">
                                <div className="power-features-item">
                                    <i className="ti-target" />
                                    <div className="power-fea-text">
                                        <h2>Track Anything </h2>
                                        <p>Ut enim ad minim veniam, quis nostrud exercitation mint ullamco laboris nisi commodo consequat. </p>
                                    </div>
                                </div>
                                <div className="power-features-item">
                                    <i className="ti-lock" />
                                    <div className="power-fea-text">
                                        <h2>Secure Your Data </h2>
                                        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="middle-img">
                                    <img className="img-responsive" src="assets/images/pr-watch-2-1.png" alt="Image" />
                                </div>
                            </div>
                            <div className="col-md-4 pow-feature-items text-left">
                                <div className="power-features-item">
                                    <i className="ti-pencil-alt" />
                                    <div className="power-fea-text">
                                        <h2>Easily Add New Projects </h2>
                                        <p>Quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat reprehenderit. </p>
                                    </div>
                                </div>
                                <div className="power-features-item">
                                    <i className="ti-settings" />
                                    <div className="power-fea-text">
                                        <h2>Manage Complex Workflows </h2>
                                        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="hot-features-area">
                    <div className="container">
                        <div className="section-title">
                            <h2>Asesome Features With Hotspots</h2>
                            <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed consequuntur magni dolores ratione voluptatem sequi nesciunt.</p>
                        </div>
                        <div className="row hot-features">
                            <div className="col-md-6 col-md-offset-3">
                                <div className="hots-img">
                                    <img className="img-fluid" src="assets/images/featured-pro.png" alt="Image" />
                                    <div className="hotspot hotspot-1" style={{ top: '10%', left: '45%' }}>
                                        <div className="pulse-wrapper">
                                            <div className="pulse-1">1</div>
                                        </div>
                                        <div className="pulse-wrapper">
                                            <div className="pulse-2">2</div>
                                        </div>
                                        <div className="hotspot-tooltip border-default align-bottom">
                                            <a href="assets/images/product-landing-2/">
                                                <h5>Easily Add New Projects</h5>
                                                <p className="font-family-body text-gray text-sm">Lorem ipsum dolor sit amet, consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore.</p>
                                            </a>
                                        </div>
                                    </div>
                                    <div className="hotspot hotspot-2" style={{ top: '65%', left: '25%' }}>
                                        <div className="pulse-wrapper">
                                            <div className="pulse-1">1</div>
                                        </div>
                                        <div className="pulse-wrapper">
                                            <div className="pulse-2">2</div>
                                        </div>
                                        <div className="hotspot-tooltip border-default align-bottom">
                                            <a href="assets/images/product-landing-2/">
                                                <h5>Manage Complex Workflows</h5>
                                                <p className="font-family-body text-gray text-sm">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                                            </a>
                                        </div>
                                    </div>
                                    <div className="hotspot hotspot-3" style={{ top: '65%', left: '65%' }}>
                                        <div className="pulse-wrapper">
                                            <div className="pulse-1">1</div>
                                        </div>
                                        <div className="pulse-wrapper">
                                            <div className="pulse-2">2</div>
                                        </div>
                                        <div className="hotspot-tooltip border-default align-bottom">
                                            <a href="assets/images/product-landing-2/">
                                                <h5>See Progress Accross Projects</h5>
                                                <p className="font-family-body text-gray text-sm">Excepteur sint occaecat cupidatat non proident, sunt culpa officia deserunt mollit anim id est laborum.</p>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="shop-product-pr">
                    <div className="container">
                        <div className="section-title">
                            <h2>Shop Similar Products</h2>
                            <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed consequuntur magni dolores ratione voluptatem sequi nesciunt.</p>
                        </div>
                        <div className="shop-pr-slider owl-carousel owl-theme">
                            <div className="item">
                                <div className="shop-pr-content">
                                    <div className="product-thumb">
                                        <img width={215} height={387} src="assets/images/ads-215x387.jpg" />
                                    </div>
                                    <a href="#">
                                        <h2>Premium Quality</h2>
                                    </a>
                                    <p className="price">
                                        <span className="amount"><span className="Price-currencySymbol">£</span>20.00</span>
                                    </p>
                                    <a href="#" className="btn product-btn pr-2-btn">Shop Now</a>
                                </div>
                            </div>
                            <div className="item">
                                <div className="shop-pr-content">
                                    <div className="product-thumb">
                                        <img width={215} height={387} src="assets/images/shop-pr3.png" />
                                    </div>
                                    <a href="#">
                                        <h2>Ship Your Idea</h2>
                                    </a>
                                    <p className="price">
                                        <span className="amount"><span className="Price-currencySymbol">£</span>20.00</span>
                                    </p>
                                    <a href="#" className="btn product-btn pr-2-btn">Shop Now</a>
                                </div>
                            </div>
                            <div className="item">
                                <div className="shop-pr-content">
                                    <div className="product-thumb">
                                        <img width={215} height={387} src="assets/images/shop-pr3.png" />
                                    </div>
                                    <a href="#">
                                        <h2>4K Resolution Gear VR</h2>
                                    </a>
                                    <p className="price">
                                        <span className="Price-amount amount"><span className="Price-currencySymbol">£</span>20.00</span>
                                    </p>
                                    <a href="#" className="btn product-btn pr-2-btn">Shop Now</a>
                                </div>
                            </div>
                            <div className="item">
                                <div className="shop-pr-content">
                                    <div className="product-thumb">
                                        <img width={215} height={386} src="assets/images/shop-pr1-215x386.png" />
                                    </div>
                                    <a href="#">
                                        <h2>Woo Logo</h2>
                                    </a>
                                    <p className="price">
                                        <del><span className="Price-amount prev-amount"><span className="Price-currencySymbol">£</span>20.00</span></del>
                                        <ins><span className="Price-amount amount"><span className="Price-currencySymbol">£</span>18.00</span></ins>
                                    </p>
                                    <a href="#" className="btn product-btn pr-2-btn">Shop Now</a>
                                </div>
                            </div>
                            <div className="item">
                                <div className="shop-pr-content">
                                    <div className="product-thumb">
                                        <img width={215} height={387} src="assets/images/ads-215x387.jpg" />
                                    </div>
                                    <a href="#">
                                        <h2>Premium Quality</h2>
                                    </a>
                                    <p className="price">
                                        <span className="Price-amount amount"><span className="Price-currencySymbol">£</span>20.00</span>
                                    </p>
                                    <a href="#" className="btn product-btn pr-2-btn">Shop Now</a>
                                </div>
                            </div>
                            <div className="item">
                                <div className="shop-pr-content">
                                    <div className="product-thumb">
                                        <img width={215} height={387} src="assets/images/shop-pr3.png" />
                                    </div>
                                    <a href="#">
                                        <h2>Ship Your Idea</h2>
                                    </a>
                                    <p className="price">
                                        <span className="Price-amount amount"><span className="Price-currencySymbol">£</span>20.00</span>
                                    </p>
                                    <a href="#" className="btn product-btn pr-2-btn">Shop Now</a>
                                </div>
                            </div>
                            <div className="item">
                                <div className="shop-pr-content">
                                    <div className="product-thumb">
                                        <img width={215} height={387} src="assets/images/shop-pr3.png" />
                                    </div>
                                    <a href="#">
                                        <h2>4K Resolution Gear VR</h2>
                                    </a>
                                    <p className="price">
                                        <span className="Price-amount amount"><span className="Price-currencySymbol">£</span>20.00</span>
                                    </p>
                                    <a href="#" className="btn product-btn pr-2-btn">Shop Now</a>
                                </div>
                            </div>
                            <div className="item">
                                <div className="shop-pr-content">
                                    <div className="product-thumb">
                                        <img width={215} height={386} src="assets/images/shop-pr1-215x386.png" />
                                    </div>
                                    <a href="#">
                                        <h2>Woo Logo</h2>
                                    </a>
                                    <p className="price">
                                        <del><span className="Price-amount prev-amount"><span className="Price-currencySymbol">£</span>20.00</span></del>
                                        <ins><span className="Price-amount amount"><span className="Price-currencySymbol">£</span>18.00</span></ins>
                                    </p>
                                    <a href="#" className="btn product-btn pr-2-btn">Shop Now</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="regular-work-section">
                    <div className="inova-bg-overlay" style={{ backgroundImage: '-ms-linear-gradient(0deg,  #2124dd 0%, #89ba86 100%)', background: '-webkit-linear-gradient(0deg,  #2124dd 0%, #89ba86 100%)', opacity: '0.8' }} />
                    <div className="container">
                        <div className="regular-work">
                            <div className="section-title">
                                <h2>For All The Ways You Work Out</h2>
                                <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
                            </div>
                            <div className="button"><a href="#" className="btn product-btn">Explore More</a></div>
                            <div className="row">
                                <div className="col-xs-6 col-sm-3">
                                    <div className="regular-item">
                                        <i className="ti-heart" />
                                        <h2>Heart Rate</h2>
                                    </div>
                                </div>
                                <div className="col-xs-6 col-sm-3">
                                    <div className="regular-item">
                                        <i className="ti-stats-up" />
                                        <h2>Step Count</h2>
                                    </div>
                                </div>
                                <div className="col-xs-6 col-sm-3">
                                    <div className="regular-item">
                                        <i className="ti-share-alt" />
                                        <h2>Share Status</h2>
                                    </div>
                                </div>
                                <div className="col-xs-6 col-sm-3">
                                    <div className="regular-item">
                                        <i className="ti-package" />
                                        <h2>iPhone App</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="features-area2 pr-2-image-features">
                    <div className="row col-height m0">
                        <div className="col-sm-6 p0 left-inner-content">
                            <img src="assets/images//01111.png" alt="Image" />
                        </div>
                        <div className="col-sm-6 p0 right-inner-content">
                            <div className="features-content">
                                <h2>Powerful &amp; Elegant Design Layout</h2>
                                <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed consequuntur magni dolores ratione voluptatem sequi nesciunt.</p>
                                <a href="#" className="btn product-btn pr-2-btn">Learn More</a>
                            </div>
                        </div>
                    </div>
                    <div className="row m0 col-height two-row ">
                        <div className="col-sm-6 p0 right-inner-content">
                            <div className="features-content">
                                <h2>Every move counts. So count every move.</h2>
                                <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed consequuntur magni dolores ratione voluptatem sequi nesciunt.</p>
                                <a href="#" className="btn product-btn pr-2-btn">Learn More</a>
                            </div>
                        </div>
                        <div className="col-sm-6 p0 left-inner-content">
                            <img src="assets/images/02222.png" alt="Image" />
                        </div>
                    </div>
                </section>
                <section className="call-action2-area pr-2-call-action">
                    <div className="container">
                        <div className="section-title ">
                            <h2> Dive Into Magic</h2>
                        </div>
                        <a href="#" className="btn product-btn pr-2-btn active">Buy Via Paypal</a>
                        <a href="#" className="btn product-btn pr-2-btn">Explore More</a>
                    </div>
                </section>
               
                <section className="reviews-area-pr-2">
                    <div className="container">
                        <div className="section-title">
                            <h2>Customer Reviews</h2>
                            <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed consequuntur magni dolores ratione voluptatem sequi nesciunt.</p>
                        </div>
                        <div className="row">
                            <div className="reviews-slider2 owl-carousel owl-theme">
                                <div className="item">
                                    <div className="review-content">
                                        <i className="fa fa-quote-left" aria-hidden="true" />
                                        <p>
                                            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident sunt in culpa.
                          </p>
                                        <img src="assets/images/review-logo1.png" alt="Image" />
                                    </div>
                                </div>
                                <div className="item">
                                    <div className="review-content">
                                        <i className="fa fa-quote-left" aria-hidden="true" />
                                        <p>
                                            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident sunt in culpa.
                          </p>
                                        <img src="assets/images/review-logo2.png" alt="Image" />
                                    </div>
                                </div>
                                <div className="item">
                                    <div className="review-content">
                                        <i className="fa fa-quote-left" aria-hidden="true" />
                                        <p>
                                            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident sunt in culpa.
                          </p>
                                        <img src="assets/images/review-logo1.png" alt="Image" />
                                    </div>
                                </div>
                                <div className="item">
                                    <div className="review-content">
                                        <i className="fa fa-quote-left" aria-hidden="true" />
                                        <p>
                                            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident sunt in culpa.
                          </p>
                                        <img src="assets/images/review-logo2.png" alt="Image" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

        </>
    )
}
