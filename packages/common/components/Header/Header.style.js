import makeStyles from '@mui/styles/makeStyles';

export const useStyles = makeStyles((theme) => ({
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  header: {
    ...theme.header,
    backgroundColor: '#1e1d1e',
    paddingRight: '50px',
    paddingLeft: '50px'
    // position: 'sticky'
  },
  logo: {
    fontWeight: 600,
    color: '#FFFEFE',
    textAlign: 'left'
  },
  primaryListHeader: {
    display: 'flex',
    ['list-style-type']: 'none',
    margin: 0,
    alignItems: 'center'
  },
  verticalBar: {
    borderRight: '1px solid #bbb'
  },
  primaryListItemHeader: {
    '& span': {
      whiteSpace: 'nowrap'
    }
  },
  menuButton: {
    size: '18px',
    fontWeight: '800 !important',
    margin: '0 10px 0 10px !important',
    '&::after': {
      content: '',
      borderLeft: '1px solid white'
    }
  },
  menuContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    justifyContent: 'center',
    alignItems: 'center'
  },
  linkSelected: {
    background: '#5D6D7E !important',
    color: '#ffffff !important'
  }
}));
