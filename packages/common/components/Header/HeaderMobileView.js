import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { IconButton, Typography, Menu, MenuItem } from '@mui/material';
import { useStyles } from './Header.style';
import MenuIcon from '@mui/icons-material/Menu';
import LogoComponent from './LogoComponent';

export default function HeaderMobileView({
  handleLogout,
  headerListItem = [],
  dropdownList
}) {
  const classes = useStyles();
  const [anchor, setAnchor] = React.useState(null);
  const open = Boolean(anchor);

  const handleMenu = (event) => {
    setAnchor(event.currentTarget);
  };

  return (
    <>
      <IconButton
        className={classes.menuButton}
        edge="start"
        aria-label="menu"
        onClick={handleMenu}
        style={{ color: 'unset' }}
        size="large"
      >
        <MenuIcon />
      </IconButton>
      <LogoComponent />
      <Menu
        id="menu-appbar"
        anchorEl={anchor}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        KeepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        open={open}
        classes={classes.header}
      >
        {headerListItem.map((item) => (
          <MenuItem
            onClick={() => setAnchor(null)}
            component={RouterLink}
            to={item.href || '/'}
          >
            <Typography variant="h6"> {item.label}</Typography>
          </MenuItem>
        ))}
        <MenuItem
          key={`user_setup_link`}
          onClick={() => setAnchor(null)}
          component={RouterLink}
          to={'/my_profile'}
        >
          <Typography variant="h6">My Profile</Typography>
        </MenuItem>

        <MenuItem key={`logout_link`} onClick={handleLogout}>
          <Typography variant="h6">Logout</Typography>
        </MenuItem>
      </Menu>
    </>
  );
}
