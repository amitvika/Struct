import React, { useState } from "react";
import { TextField, Button, Paper } from "@material-ui/core";
import './style.css'

export default function Signin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const handleEmailInput = (e) => {
    setEmail(e.target.value)
  }
  const handlePasswordInput = (e) => {
    setPassword(e.target.value)
  }

  return (
    <Paper style={{width: '405px'}}>
      <form className="form">
        <TextField
          value={email}
          onChange={handleEmailInput}
          label="Email"
          variant="outlined"
        />
        <TextField
          value={password}
          onChange={handlePasswordInput}
          label="Password"
          variant="outlined"
        />

        <Button type="button" variant='contained' color='primary' className="form__custom-button">
          Log in
        </Button>

      </form>
      <div className='register_btn'>
        <Button type="button" variant='outlined'>
          Register
        </Button>
      </div>
    </Paper>
  );
}


