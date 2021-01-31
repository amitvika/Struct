import React from 'react';
import RobotWeldingBackground from '../../assets/images/robot_welding.jpg'
import FabricateAnything from '../../assets/images/fabricate_anything.jpg'
import AssembleAnything from '../../assets/images/assemble_anything.jpg'
import Molding from '../../assets/images/molding.jpg'
import Prototype from '../../assets/images/prototype.jpg'
import Fabrication from '../../assets/images/fabrication.jpg'

export default function Home() {
    return (
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
                            <h2 className="th-h2">Fabricate Anything</h2>
                            <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed consequuntur magni dolores ratione voluptatem sequi nesciunt.</p>
                            <ul>
                                <li><i className="fa fa-check" />Very high resolution (4K)</li>
                                <li><i className="fa fa-check" />Built on latest technologies</li>
                                <li><i className="fa fa-check" />Can integrate with iOS and Android</li>
                                <li><i className="fa fa-check" />Built on latest technologies</li>
                            </ul>
                        </div>
                        <div className="col-sm-6">
                            {/* <div className="pr-sliders pr-sliders-feature owl-carousel owl-theme">
                                <div className="item"> */}
                            <img style={{ width: '100%' }} src={FabricateAnything} alt="Image" />
                            {/* </div>
                            </div> */}
                        </div>
                    </div>
                </div>
            </section>

            <section className="hot-features-area">
                <div className="container">
                    <div className="section-title">
                        <h2>Assemble Anything</h2>
                        <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed consequuntur magni dolores ratione voluptatem sequi nesciunt.</p>
                    </div>
                    <div className="row hot-features">
                        <div className="col-md-6 col-md-offset-3">
                            <div className="hots-img">
                                <img className="img-fluid" src={AssembleAnything} alt="Image" />
                                
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="features-area2 pr-2-image-features">
                <div className="row col-height m0">
                    <div className="col-sm-6 p0 left-inner-content">
                        <img src={Molding} alt="Image" />
                    </div>
                    <div className="col-sm-6 p0 right-inner-content">
                        <div className="features-content">
                            <h2>Mold Making,&amp; Injection Molding,&amp; Die Casting and Sand Casting</h2>
                            <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed consequuntur magni dolores ratione voluptatem sequi nesciunt.</p>
                            <a href="#" className="btn product-btn pr-2-btn">Learn More</a>
                        </div>
                    </div>
                </div>

                <div className="row m0 col-height two-row ">
                    <div className="col-sm-6 p0 right-inner-content">
                        <div className="features-content">
                            <h2>Prototype, Batch, or Infinite Scale Production.</h2>
                            <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed consequuntur magni dolores ratione voluptatem sequi nesciunt.</p>
                            <a href="#" className="btn product-btn pr-2-btn">Learn More</a>
                        </div>
                    </div>
                    <div className="col-sm-6 p0 left-inner-content">
                        <img src={Prototype} alt="Image" />
                    </div>
                </div>

                <div className="row col-height m0">
                    <div className="col-sm-6 p0 left-inner-content">
                        <img src={Fabrication} alt="Image" />
                    </div>
                    <div className="col-sm-6 p0 right-inner-content">
                        <div className="features-content">
                            <h2>PCB, MEMs, & Integrated Circuits Fabrication</h2>
                            <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed consequuntur magni dolores ratione voluptatem sequi nesciunt.</p>
                            <a href="#" className="btn product-btn pr-2-btn">Learn More</a>
                        </div>
                    </div>
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

    )
}
