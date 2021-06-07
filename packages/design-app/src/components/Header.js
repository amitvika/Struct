import React, { useState, useRef } from "react";
import { AppBar, Toolbar, makeStyles } from "@material-ui/core";
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { useHistory, Link as RouterLink } from "react-router-dom";
import Box from '@material-ui/core/Box';

const useStyles = makeStyles((theme) => ({
    toolbar: {
        display: "flex",
        justifyContent: "space-between",
    },
    header: {
        ...theme.header,
        backgroundColor: "#1e1d1e",
        paddingRight: "79px",
        paddingLeft: "118px",
    },
    logo: {
        fontFamily: "Work Sans, sans-serif",
        fontWeight: 600,
        color: "#FFFEFE",
        textAlign: "left",
    },
    menuButton: {
        fontFamily: "Open Sans, sans-serif",
        fontWeight: 700,
        size: "18px",
        // color: theme.header.color
    },
    menuContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '50%',
    },
    textColor: {
        color: 'white'
        // color: theme.header.color
    }
}));

export default function Header() {
    const classes = useStyles();
    // const dispatch = useDispatch();
    const history = useHistory();
    // const { isAuthenticated, user } = useSelector(state => state.auth);
    const [open, setOpen] = useState(false);
    const [lightThemeSelected, setLightThemeSelected] = useState(false);
    const anchorRef = useRef(null);

    const displayDesktop = () => {
        return (<Toolbar className={classes.toolbar}>
            {structLogo}
            <Box component="div" className={classes.menuContainer}>
                {getMenuButtons()}
            </Box>
        </Toolbar>);
    };

    const structLogo = (
        <Typography component="div" className={classes.logo}>
            <div className="d-inline-block align-top" style={{ width: "150", height: "30", fontSize: "x-large" }}>
                OMNIDESIGN
            </div>
        </Typography>
    );

    const getMenuButtons = () => {
        let menuItems = headersData.map(({ label, href }) => {
            return (
                <Button
                    key={`primary_button_${label}`}
                    {...{
                        key: label,
                        color: "inherit",
                        to: href,
                        component: RouterLink,
                        className: classes.menuButton
                    }}
                >
                    {label}
                </Button>
            );
        });
        return menuItems;
    };


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

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };

    return (
        <header>
            <AppBar className={classes.header}>{displayDesktop()}</AppBar>
        </header>
    );
}


const headersData = [
    {
        label: "Designs",
        href: "/design",
    },
    {
        label: "Product",
        // href: "/clients",
    },
    {
        label: "CAD",
        // href: "/vendors",
    },
    {
        label: "PCB",
        // href: "/items",
    },
    {
        label: "Silicon",
        // href: "/items",
    },
    {
        label: "Clothes",
        // href: "/items",
    },
    {
        label: "Architecture",
        // href: "/items",
    },
];
