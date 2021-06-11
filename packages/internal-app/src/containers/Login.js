import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { login } from "../actions/authActions";
import { useHistory } from "react-router-dom";
import { Card, CardContent } from "@material-ui/core";
import { NavLink } from 'react-router-dom';
import StructLogo from '../assets/images/new_logo.png';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Backdrop from '@ravibasil/common/components/Backdrop'

const useStyles = makeStyles((theme) => ({
    container: {
        background: 'linear-gradient(45deg, rgb(42, 42, 42) 30%, rgb(125, 125, 125) 90%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    card_container: {
        maxWidth: '700px',
        width: '35%'
        
    },
    logo_container: {
        display: "flex",
        justifyContent: "center"
    },
    logo: {
        width: 200,
        height: 50
    },
    form_root: {
        display: 'flex',
        flexDirection: 'column',
        '& .MuiTextField-root': {
            margin: theme.spacing(1)
        },
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
}));

const LoginModal = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const classes = useStyles()

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState(null);
    const { isAuthenticated, isLoginStarted } = useSelector(state => state.auth);
    const error = useSelector(state => state.error);

    useEffect(() => {
        if (error && error.id === "LOGIN_FAIL") {
            setMsg(error.msg.msg);
        }
        else {
            setMsg(null);
        }
    }, [error]);

    useEffect(() => {
        if (isAuthenticated) {
            history.push('/items');
        }
    }, [isAuthenticated]);

    const handleLoginSubmit = (event) => {
        event.preventDefault();
        dispatch(login({ email, password }))
    }

    return (
        <Box as="div" className={classes.container}>
            <Card className={classes.card_container}>
                <CardContent>
                    <Box as="div" className={classes.logo_container}>
                        <img
                            src={StructLogo}
                            className={classes.logo}
                        />
                    </Box>
                    {/* {msg ? (
                        <Alert color="danger">{msg}</Alert>
                    ) : null} */}
                    <form className={classes.form_root} noValidate autoComplete="off" onSubmit={handleLoginSubmit}>

                        <TextField
                            id="outlined-basic"
                            variant="outlined"
                            label="Email"
                            type="email"
                            name="email" //has to match the name of the variable in the state
                            onChange={(event) => setEmail(event.target.value)}

                        />
                        <TextField
                            id="outlined-password"
                            variant="outlined"
                            label="Password"
                            type="password"
                            name="password" //has to match the name of the variable in the state
                            onChange={(event) => setPassword(event.target.value)}

                        />

                        <Box as="div" style={{ margin: '8px' }}>

                            <Button
                                type="submit"
                                variant="contained" style={{
                                    marginBottom: "2rem",
                                    width: '100%',
                                    background: '#2b2b2b'
                                }} color="primary">Login</Button>
                        </Box>
                    </form>
                    <Backdrop isLoading={isLoginStarted} />
                    <NavLink to='/register'> Go to Registration Page </NavLink>
                </CardContent>
            </Card>
        </Box >
    );
}


export default LoginModal;
//mapStateToProps gets state variables from elsewhere in the app.
//the stuff in the curly braces are methods brought in to modify state in other parts of the app
//all these things will be declared in the component props
