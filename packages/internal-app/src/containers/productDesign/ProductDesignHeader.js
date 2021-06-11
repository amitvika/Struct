import React from "react";
import { AppBar, Toolbar, makeStyles } from "@material-ui/core";
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { Link as RouterLink } from "react-router-dom";
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
        fontWeight: 600,
        color: "#FFFEFE",
        textAlign: "left",
    },
    menuButton: {
        ...theme.menuButton,
        color: 'dodgerblue'
    },
    menuContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '50%',
    },
}));

export default function ProductDesignHeader() {
    const classes = useStyles();

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


    return (

        <div className={classes.header}>{displayDesktop()}</div>
    );
}


const headersData = [
    {
        label: "Designs",
        href: "/design",
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
