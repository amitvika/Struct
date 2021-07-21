import React from "react";
import { AppBar, Toolbar, makeStyles } from "@material-ui/core";
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { useLocation, Link as RouterLink } from "react-router-dom";
import Box from '@material-ui/core/Box';

const useStyles = makeStyles((theme) => ({
    toolbar: {
        display: "flex",
        justifyContent: "space-between"
    },
    header: {
        ...theme.header,
        backgroundColor: "#1e1d1e",
        paddingRight: "79px",
        paddingLeft: "118px",
        // position: 'sticky'

    },
    logo: {
        // fontWeight: 600,
        color: "#FFFEFE",
        textAlign: "left",
    },
    menuButton: {
        ...theme.menuButton,

    },
    menuContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '50%',
    },
    linkSelected: {
        background: "#5D6D7E",
        color: '#ffffff'
    }
}));

export default function Header() {
    const classes = useStyles();
    const location = useLocation();

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
            <p>
                OMNIDESIGN
            </p>
        </Typography>
    );

    const getMenuButtons = () => {
        let menuItems = headersData.map(({ label, href }) => {
            console.log(`primary_button_${label}`);
            return (
                <Button
                    key={`primary_button_${label}`}
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
        return menuItems;
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
        href: "/",
    },
    {
        label: "Product",
        href: "/clients",
    },
    {
        label: "CAD",
        href: "/vendors",
    },
    {
        label: "PCB",
        href: "/items",
    },
    {
        label: "Silicon",
        href: "/items",
    },
    {
        label: "Clothes",
        href: "/items",
    },
    {
        label: "Architecture",
        href: "/items",
    },
];
