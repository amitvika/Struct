import * as React from 'react';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import MenuItem from '@mui/material/MenuItem';
import Popper from '@mui/material/Popper';
import Header from '@monostruct/common/components/Header/Header';
import MenuList from '@mui/material/MenuList';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import { useStyles } from './Layout.style';
import InfoSection from '../InfoSection/InfoSection';

export const headerListItem = [
  {
    label: 'Designs and Components Database',
    href: '/design',
    addSeparator: true
  },
  {
    label: 'Product Builder',
    href: '/product',
    addSeparator: false,
    hoverMenuHandler: true,
    hoverMenuLabel: 'Design Tools'
  },
  {
    label: 'CAD',
    href: '/cad',
    addSeparator: false,
    showOnHover: true
  },
  {
    label: 'PCB',
    href: '/pcb',
    addSeparator: false,
    showOnHover: true
  },
  {
    label: 'Silicon',
    href: '/silicon',
    addSeparator: false,
    showOnHover: true
  },
  {
    label: 'Architecture',
    href: '/architecture',
    addSeparator: false,
    showOnHover: true
  },
  {
    label: 'Clothing',
    href: '/clothes',
    addSeparator: false,
    showOnHover: true
  },
  {
    label: 'UI & UX App Designer',
    href: '/appdesigner',
    addSeparator: true,
    showOnHover: true
  },
  {
    label: 'Designers',
    addSeparator: false,
    showOnHover: false
  },
  {
    label: 'Makers',
    addSeparator: true,
    showOnHover: false
  },
  {
    label: 'Buy/Rent STRUCT Machines',
    isCustomComponent: true,
    Component: BuyRentSTRUCTMachines
  }
];

const RecursiveMenuItem = (props) => {
  // const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  return (
    <MenuItem
      {...props}
      ref={ref}
      sx={{ backgroundColor: `${open ? '#dcdcdc' : ''}` }}
      onMouseEnter={() => setOpen(true)}
      // onFocus={() => setOpen(true)}
      // onBlur={() => setOpen(false)}
      onMouseLeave={() => setOpen(false)}
    >
      <span>{props.label}</span>
      <Popper
        anchorEl={ref.current}
        open={open}
        placement={props.placement ?? 'right'}
        modifiers={{
          flip: {
            enabled: true
          },
          preventOverflow: {
            enabled: true,
            boundariesElement: 'viewport'
          }
        }}
      >
        {props.children}
      </Popper>
    </MenuItem>
  );
};

function BuyRentSTRUCTMachines() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <Button
        ref={anchorRef}
        id="composition-button"
        aria-controls={open ? 'composition-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        className={`${classes.menuButton} ${open && classes.linkSelected}`}
      >
        Buy/Rent STRUCT Machines
      </Button>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-start"
        transition
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom-start' ? 'left top' : 'left bottom'
            }}
          >
            <Paper elevation={4}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList>
                  <MenuItem>Robot Arms</MenuItem>
                  <RecursiveMenuItem label={'Prototyping'}>
                    <Paper elevation={4}>
                      <MenuList>
                        <MenuItem>PCBs</MenuItem>
                        <MenuItem>5-Axis Plastic</MenuItem>
                        <MenuItem>Metal Print Mill</MenuItem>
                      </MenuList>
                    </Paper>
                  </RecursiveMenuItem>
                  <MenuItem>Textile/Clothes Production</MenuItem>
                  <MenuItem>Automated Food Production</MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

export default function Layout(props) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLogoClick = () => handleClickOpen();
  const loginPageUrl = '/login';

  return (
    <>
      <InfoSection {...{ open, handleClose }} />
      <Header {...{ headerListItem, loginPageUrl, handleLogoClick }} />
      {props.children}
    </>
  );
}
