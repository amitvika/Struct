import makeStyles from '@mui/styles/makeStyles';

export const useStyles = makeStyles((theme) => ({
  menuButton: {
    size: '18px',
    fontWeight: '800 !important',
    margin: '0 5px 0 5px !important',
    '&::after': {
      content: '',
      borderLeft: '1px solid white'
    },
    whiteSpace: 'nowrap !important'
  },
  linkSelected: {
    background: '#5D6D7E !important',
    color: '#ffffff !important'
  }
}));
