import React from 'react'
import {
  Grid,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  makeStyles,
  Paper,
  GridListTile,
  ButtonBase
} from '@material-ui/core';

import GridList from './GridList';
import StructLogo from '../assets/images/struct_logo.png';

const useStyles = makeStyles((theme) => ({
  tableCell: {
    borderBottom: "none",
    padding: '10px'
  },
  boldtablecell: {
    borderBottom: "none",
    fontWeight: 'bold',
    padding: '10px'
  },
  paper: {
    height: '100%',
    width:'100%',
    padding: theme.spacing(2),
    margin: '10px 2px 10px 2px',
    cursor: 'pointer',
    transition: '0.3s',
    "&:hover, &:focus": {
      backgroundColor: '#DCDCDC'
    }
  },

  image: {
    width: 55,
    height: 70,
  },
  img: {
    margin: 'auto',
    display: 'block',
    maxWidth: '100%',
    maxHeight: '100%',
  },
}));

export default function GridView({ list, handleHistoryToggle, columnsFields, handleTableRowClick }) {
  const classes = useStyles();

  const renderItem = (data) => {
    let item = [];

    Object.keys(columnsFields).forEach(fieldItem => {
      item.push(
        <TableRow>
          <TableCell className={classes.boldtablecell}>{columnsFields[fieldItem]}</TableCell>
          <TableCell className={classes.tableCell}>{data[fieldItem]}</TableCell>
        </TableRow>
      )
    })
    return item;
  }

  return (
    // <GridList>
    <Grid container spacing={3}>
      {list.map(product => {
        return (
          <Grid item xs={12} sm={4}>
          <Paper className={classes.paper} onClick={() => handleTableRowClick(product)}>
            <Grid container style={{ padding: '5px 10px' }}>
              <Grid item sm sm={2}>
                <ButtonBase className={classes.image}>
                  <img className={classes.img} alt="complex" src={StructLogo} />
                </ButtonBase>
              </Grid>
              <Grid item sm sm={10}>

                <Table>
                  {renderItem(product)}
                </Table>
              </Grid>
              <Grid item sm sm={12} style={{ margin: '10px', justifyContent: 'center' }}>
                <Typography variant="body2" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={(event) => {
                  event.stopPropagation();
                  handleHistoryToggle({ rowId: product.id })
                }}>
                  View History
                </Typography>
              </Grid>

            </Grid>
          </Paper>
          </Grid>
        )
      })
      }
    </Grid>

  )
}
