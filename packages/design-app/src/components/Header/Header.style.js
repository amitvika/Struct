import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  header: {
    ...theme.header,
    backgroundColor: '#1e1d1e',
    paddingRight: '50px',
    paddingLeft: '50px',
    // position: 'sticky'
  },
  logo: {
    fontWeight: 600,
    color: '#FFFEFE',
    textAlign: 'left',
  },
  menuButton: {
    ...theme.menuButton,
    marginRight: '0px',
    '&::after': {
      content: '',
      borderLeft: '1px solid white',
    },
  },
  menuContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  linkSelected: {
    background: '#5D6D7E',
    color: '#ffffff',
  },
}));
