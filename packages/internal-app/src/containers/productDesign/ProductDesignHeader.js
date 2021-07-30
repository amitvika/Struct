import React from "react";
import { AppBar, Toolbar, makeStyles, Paper, Grid } from "@material-ui/core";
import Typography from '@material-ui/core/Typography'
import { useLocation, Link as RouterLink } from "react-router-dom";
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import MenuIcon from '@material-ui/icons/Menu';
import Viewer from "src/components/Viewer";
import { Headding } from "src/components";
import { useQuery } from '../../utils/customHooks'

const useStyles = makeStyles((theme) => ({
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    color: 'white'
  },
  header: {
    ...theme.header,
    backgroundColor: "#1e1d1e",
    // paddingRight: "79px",
    // paddingLeft: "118px",
    // position: 'fixed',
    top: '80px',
    position: 'sticky',
    zIndex: 5,
  },
  logo: {
    fontWeight: 600,
    color: "#FFFEFE",
    textAlign: "left",
  },
  menuButton: {
    ...theme.menuButton,
    color: 'dodgerblue',
    whiteSpace: ' nowrap'
  },
  menuContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '70%',
  },
  linkSelected: {
    background: "#5D6D7E ",
    color: '#ffffff'
  },
  list: {
    width: 800,
    top: '145px',
    // marginTop: '65px'
  },
  fullList: {
    width: 'auto',
    // top: 65,
    // marginTop: '65px'
  },
  drawer: {
    top: '145px',
  }

}));


export default function ProductDesignHeader({ gltfjson, setgltfjson }) {
  const classes = useStyles();
  const location = useLocation();
  let query = useQuery();

  const [state, setState] = React.useState({

    left: false,
    bottom: false,
    right: false,
  });

  const toggleDrawer = (anchor, open) => (event) => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };
  let anchor = 'right';
  const list = (anchor) => (
    <div
      className={clsx(classes.list, {
        [classes.fullList]: anchor === 'top' || anchor === 'bottom',
      })}

      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >

      <Paper style={{ padding: 20, margin: 10 }}>
        <Headding>ThreeJS Screen</Headding>
        <Viewer
          gltfjson={gltfjson}
          setgltfjson={setgltfjson}
        />
      </Paper>

    </div>
  )

  const displayDesktop = () => {
    return (<Toolbar className={classes.toolbar}>
      {structLogo}
      <Box component="div" className={classes.menuContainer}>
        {getMenuButtons()}

        <Grid key={anchor}  >
          <MenuIcon onClick={toggleDrawer(anchor, true)} />
          <SwipeableDrawer
            className={classes.drawer}
            anchor={anchor}
            open={state[anchor]}
            onClose={toggleDrawer(anchor, false)}
            onOpen={toggleDrawer(anchor, true)}
          >
            {list(anchor)}
          </SwipeableDrawer>
        </Grid>
      </Box>
    </Toolbar >);
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
            className: classes.menuButton + ` ${href.includes(query.get('type')) && classes.linkSelected}`
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
    label: "My Designs",
    href: "/design?type=my-design"
  },
  {
    label: "Product",
    href: "/design?type=product",
  },
  {
    label: "CAD",
    href: "/design?type=cad",
  },
  {
    label: "PCB",
    href: "/design?type=pcb",
  },
  {
    label: "Silicon",
    href: "/design?type=silicon",
  },
  {
    label: "Clothes",
    href: "/design?type=clothes",
  },
  {
    label: "Architecture",
    href: "/design?type=architecture",
  },
  {
    label: "Predesigned Components",
    href: "/design?type=predesigned",
  },
  {
    label: "App Designer",
    href: "/design?type=app-designer"
  }
];
