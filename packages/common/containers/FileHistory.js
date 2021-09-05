import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid
} from "@material-ui/core";
import { Headding } from '@ravibasil/common/components';
import { fetchFileHistoryApi } from '@ravibasil/common/api/fileHistory.api';

export default function FileHistory({ link_id, selectedFileName }) {

  const [fileHistory, setFileHistory] = React.useState([]);

  React.useEffect(() => {
    if(!link_id){
      return;
    }
    
    fetchFileHistoryApi(link_id)
      .then(res => {
        setFileHistory(res.data)
      })
      .catch(error => {

      })
    console.log("File Nmae", fileHistory)
  }, [selectedFileName]);


  return (
    <Grid item xs={12}>
      <Headding bold title={'File History'} />
      <TableContainer component={Paper}>

        <Table aria-label="simple table">

          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Loaded By</TableCell>
              <TableCell>Loaded At</TableCell>
              <TableCell>Cleared By</TableCell>
              <TableCell>Cleared At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              fileHistory.map((item, index) => {
                return (<TableRow key={index}>
                  <TableCell>
                    <a href={item.file_url}
                      target="_blank">
                      {item.file_name}
                    </a></TableCell>
                  <TableCell>{item.loaded_by_name}</TableCell>
                  <TableCell>{item.loaded_at}</TableCell>
                  <TableCell>{item.cleared_by}</TableCell>
                  <TableCell>{item.cleared_at}</TableCell>
                </TableRow>)
              })
            }

          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  )
}
