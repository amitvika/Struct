import React from 'react'
import Box from '@material-ui/core/Box';
import Popover from '@material-ui/core/Popover';
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
import Logo from "../../assets/images/loginLogo.jpg"
import Button from '@material-ui/core/Button';
import {Link} from "react-router-dom";
// import './style.css'

export default function LoginPopup({ popupState }) {

  return (
    <div>
      <Popover className="main_popover"
        style={{
          overflow: "hidden",
          top: "19px",

        }}
        {...bindPopover(popupState)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <div style={{ overflow: "hidden", display: "block", height: "566px", width: "400px" }} >
          <div style={{
            height: "221px",
            display: "flex",
            justifyContent: "center"
          }}>
            <img src={Logo} style={{
              height: "130px",
              width: "127px",
              margin: "17px",
              borderRadius: "86px"
            }}></img>
          </div>
          <div style={{
            height: "103px",
            textAlign: "center"
          }}>
            <h3>Profile</h3>
          </div>
          <div style={{
            height: "103px",
            textAlign: "center"
          }}>
            <h3>Theme</h3>
          </div>
          <div style={{
            height: "103px",
            textAlign: "center"
          }}>
            <Link to="/login">
            <Button style={{
              height: "50px",
              width: "100px"
            }} 
            variant="contained"
             color="secondary"
             >
              Logout
            </Button>
            </Link>
          </div>
        </div>
      </Popover>
    </div >
  )
}
