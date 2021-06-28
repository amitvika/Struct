import React, { useState, useRef } from "react";
import { AppBar, Toolbar, makeStyles } from "@material-ui/core";
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { useLocation, useHistory, Link as RouterLink } from "react-router-dom";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";

import StructLogo from '../assets/images/logo_white.png';
import Box from '@material-ui/core/Box';
import { useDispatch, useSelector } from 'react-redux';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Switch from '@material-ui/core/Switch';

import { logout } from "../actions/authActions";
import { setThemeAction } from '../actions/theme.action'

const useStyles = makeStyles((theme) => ({
    toolbar: {
        display: "flex"
    },
    header: {
        ...theme.header
    },
    logo: {
        fontFamily: "Work Sans, sans-serif",
        fontWeight: 600,
        color: "#FFFEFE",
        textAlign: "left",
    },
    menuButton: {
        ...theme.menuButton
    },
    linkSelected: {
        background: "#5D6D7E ",
        color: '#ffffff'
    },
    menuContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%'
    },
}));

export default function Header() {
    const classes = useStyles();
    const dispatch = useDispatch();
    const history = useHistory();
    const location = useLocation();

    const { isAuthenticated, user } = useSelector(state => state.auth);
    const [open, setOpen] = useState(false);
    const [lightThemeSelected, setLightThemeSelected] = useState(false);
    const anchorRef = useRef(null);

    const displayDesktop = () => {
        return (<Toolbar className={classes.toolbar}>
            {structLogo}
            <Box component="div" className={classes.menuContainer}>
                <Box component="div" key={`primary_list1`} style={{ display: 'flex' }}>
                    {getMenuButtons()}
                </Box>
                <Box component="div" key={`secondary_list1`} style={{ display: 'flex' }}>
                    {getSecondMenu()}
                </Box>
            </Box>
        </Toolbar>);
    };

    const structLogo = (
        <Typography component="div" className={classes.logo}>
            <img
                src={StructLogo}
                width="150"
                height="30"
                className="d-inline-block align-top"
            />
        </Typography>
    );
    const getMenuButtons = () => {
        let menuItems = headersData.map(({ label, href }) => {
            return (
                <Button
                    key={`"primary_button_1${label}"`}
                    {...{
                        key: label,
                        color: "inherit",
                        to: href,
                        component: RouterLink,
                        className: classes.menuButton + ` ${location.pathname.includes(href) && classes.linkSelected}`
                    }}
                >
                    {label}
                </Button>
            );
        });

        // menuItems.push(<Button
        //     key='back_button'
        //     {...{
        //         key: 'back_button',
        //         color: "inherit",
        //         to: '#',
        //         component: RouterLink,
        //         className: classes.menuButton
        //     }}

        //     onClick={() => history.goBack()}
        // >
        //     <ArrowBackIcon />
        // </Button>)

        // menuItems.push(<Button
        //     key='forward_button'
        //     {...{
        //         key: 'forward_button',
        //         color: "inherit",
        //         to: '#',
        //         component: RouterLink,
        //         className: classes.menuButton
        //     }}
        //     onClick={() => history.goForward()}
        // >
        //     <ArrowForwardIcon />
        // </Button>)

        return menuItems;
    };

    const getSecondMenu = () => {
        let menuItems = [];

        menuItems.push(
            <Button
                key='viewMyProfile'
                {...{
                    key: 'viewMyProfile',
                    color: "inherit",
                    to: '/viewMyProfile?tab=3',
                    component: RouterLink,
                    className: classes.menuButton
                }}
            >
                My Tasks and Profile
            </Button>
        );

        menuItems.push(
            <>
                <Button
                    key='user_profile'
                    ref={anchorRef}
                    aria-controls={open ? 'menu-list-grow' : undefined}
                    aria-haspopup="true"
                    onClick={handleToggle}
                    style={{ color: 'white' }}
                    className={classes.menuButton}
                >

                    {isAuthenticated
                        ? `Welcome: ${user.name} ${user.email}`
                        : "Not logged in"}
                </Button>
                <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={handleClose}>
                                    <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                                        <MenuItem
                                            key={`configuration-history_link`}
                                            onClick={() => handleLink('/configuration-history')}>Configuration History</MenuItem>
                                        <MenuItem
                                            key={`user_setup_link`}
                                            onClick={() => handleLink('/user-setup')}>Administrative</MenuItem>
                                        {/* <MenuItem
                                            key={`my_profile_link`}
                                            onClick={() => handleLink('/viewMyProfile')}>My Profile</MenuItem> */}
                                        <MenuItem
                                            key={`theme_changer`}>
                                            <Switch checked={lightThemeSelected} onChange={handleThemeChange} name="currentTheme" />
                                            {lightThemeSelected ? 'Dark' : 'Light'}
                                        </MenuItem>

                                        <MenuItem
                                            key={`logout_link`}
                                            onClick={handleLogout}>Logout</MenuItem>
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            </>
        );

        return menuItems;

    }

    const handleLink = (path) => {
        setOpen(false);
        history.push(path);
    }

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };


    const handleListKeyDown = (event) => {
        if (event.key === 'Tab') {
            event.preventDefault();
            setOpen(false);
        }
    }

    const handleThemeChange = (event) => {
        setLightThemeSelected(event.target.checked)
        if (event.target.checked) {
            dispatch(setThemeAction({ themeName: 'darkTheme' }))
        }
        else {
            dispatch(setThemeAction({ themeName: 'lightTheme' }))
        }
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };

    const handleLogout = () => {

        dispatch(logout());
        history.replace('/')
    }

    return (
        <header>
            <AppBar className={classes.header}>{displayDesktop()}</AppBar>
        </header>
    );
}


const headersData = [
    {
        label: "Product Design",
        href: "/product-design",
    },
    {
        label: "Clients",
        href: "/clients",
    },
    {
        label: "Vendors",
        href: "/vendors",
    },
    {
        label: "Items",
        href: "/items",
    },
    {
        label: "Factories",
        href: "/factories",
    }
];