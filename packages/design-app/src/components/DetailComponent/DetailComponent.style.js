import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  paperContainer: {
    display: 'flex',
    justifyContent: 'center',
    margin: 10,
    padding: 10,
  },
  title: {
    fontWeight: 700,
  },
}));
