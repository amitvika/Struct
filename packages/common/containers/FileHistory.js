import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography
} from '@mui/material';
import { fetchFileHistoryApi } from '@monostruct/common/api/fileHistory.api';
import get from 'lodash/get';

export default function FileHistory({ link_id, selectedFileName }) {
  const [fileHistory, setFileHistory] = React.useState([]);

  React.useEffect(() => {
    if (!link_id) {
      return;
    }

    fetchFileHistoryApi(link_id)
      .then((res) => {
        setFileHistory(get(res, 'data', []));
      })
      .catch((error) => {});
    console.log('File Nmae', fileHistory);
  }, [selectedFileName]);

  if (fileHistory) {
    return null;
  }

  return (
    <Paper>
      <Typography
        sx={{ flex: '1 1 100%', fontWeight: 'bold' }}
        variant="h6"
        id="tableTitle"
        component="div"
      >
        File History
      </Typography>
      <TableContainer>
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
            {fileHistory.map((item, index) => {
              return (
                <TableRow key={index}>
                  <TableCell>
                    <a href={item.file_url} target="_blank">
                      {item.file_name}
                    </a>
                  </TableCell>
                  <TableCell>{item.loaded_by_name}</TableCell>
                  <TableCell>{item.loaded_at}</TableCell>
                  <TableCell>{item.cleared_by}</TableCell>
                  <TableCell>{item.cleared_at}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
