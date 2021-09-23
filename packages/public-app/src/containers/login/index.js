import React from 'react';
import './style.css';
import Logo from '@monostruct/common/assets/images/new_logo.png';
import { Link } from 'react-router-dom';

export default function index(props) {
  return (
    <div>
      <form className="modal-content animate" method="post">
        <div className="imgcontainer">
          <img src={Logo} alt="Avatar" className="avatar" />
        </div>
        <div className="container">
          <label htmlFor="uname">
            <b>Username</b>
          </label>
          <input
            type="text"
            placeholder="Enter Username"
            name="uname"
            required
          />
          <label htmlFor="psw">
            <b>Password</b>
          </label>
          <input
            type="password"
            placeholder="Enter Password"
            name="psw"
            required
          />
          <Link to="/dashboard">
            <button className="btn_login" type="submit">
              Login
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}
