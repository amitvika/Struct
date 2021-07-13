import React, { useEffect, useState } from 'react'
// import SharedHeader from 'shared-lib/src/components/Header';
import {Link} from"react-router-dom"
import { Grid } from '@material-ui/core';



export default function Header(props) {



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

  // Google Login
  // const handleLogin = async googleData => {
    // history.push("/login")
    // console.log(googleData);
    // const res = await fetch("/api/v1/auth/google", {
    //   method: "POST",
    //   body: JSON.stringify({
    //     token: googleData.tokenId
    //   }),
    //   headers: {
    //     "Content-Type": "application/json"
    //   }
    // })
    // const data = await res.json()
    // // store returned user somehow
  



  return (

    <Grid nav={nav} >
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


        <li className="menu-item">
          <Link to="/login">
           Login
          </Link>
          {/* <GoogleLogin
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            render={renderProps => (
              <div style={{ height: '100%' }}>
                <a>
                  <button style={{
                    background: 'none', color: nav ? 'black' : 'white',
                    border: 'none'
                  }} onClick={renderProps.onClick} disabled={renderProps.disabled}>Google Log in </button>
                </a>
              </div>
            )}

            buttonText="Log in with Google"
            onSuccess={handleLogin}
            onFailure={handleLogin}
            cookiePolicy={'single_host_origin'}
          />
        */}
        </li>
      </ul>

    </Grid>

  )
}
