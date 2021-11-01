import React, { useRef, useState } from 'react'
import {
  Grid,
  Typography,
  makeStyles,
  Paper,
  Button,
  IconButton
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import Avatar from '@material-ui/core/Avatar';
import PictureAsPdf from '@material-ui/icons/PictureAsPdf';
import DescriptionIcon from '@material-ui/icons/Description';
import ClipboardText from '../ClipboardText'
import HistoryIcon from '@material-ui/icons/History';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import Tooltip from '@material-ui/core/Tooltip';

import StructLogo from '../../assets/images/new_logo.png';
import './style.css'

const useStyles = makeStyles((theme) => ({
  tableCell: {
    borderBottom: "none"
  },
  boldtablecell: {
    borderBottom: "none",
    fontWeight: 'bold'
  },
  paper: {

    height: '100%',
    width: '100%',
    cursor: 'pointer',
    transition: '0.3s',
    "&:hover, &:focus": {
      backgroundColor: '#DCDCDC',
      color: "#000000"
    }
  },

  image: {
    width: '100%',
    height: '100%',
  },
  img: {
    margin: 'auto',
    padding: '5px',
    display: 'block',
    maxWidth: '96px',
    maxHeight: '96px',
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  copy_img: {
    cursor: 'pointer',
    width: '12%',
    marginLeft: '15px',
    padding: '4px',
    borderStyle: 'solid',
    borderRadius: '14px',
    color: '#371919',
    '&:active': {
      backgroundColor: '#c9c5c5'
    }
  },
  historyLink: {
    margin: '10px',
    justifyContent: 'center',
    color: '#0b79c7',
  },
  fieldItem: {
    display: 'flex',
    padding: '10px 0 0 0'
  }

}));

export default function GridView({
  list,
  handleDelete = () => { },
  handleHistoryToggle = () => { },
  handleEditButtonPress = () => { },
  columnsFields,
  handleTableRowClick,
  isHistoryLinkVisible = true,
  isAddEditLinkVisible = false,
  isInsideDetailPanel = false
}) {
  const classes = useStyles();
  const [text, setText] = useState('')
  const titleRef = useRef();

  const renderItem = (data) => {
    let item = [];
    columnsFields
      .filter(fieldItem => fieldItem.isGridViewVisible === false ? fieldItem.isGridViewVisible : true)
      .map(fieldItem => {
        item.push(
          <Grid item sm sm={12} key={`${fieldItem.title}_${data[fieldItem.field]}`}>
            {
              fieldItem.isLink ?
                <Typography variant="body2" style={{ cursor: 'pointer', textAlign: 'center' }}
                  onClick={fieldItem.onClick}
                  className={classes.historyLink}>
                  {fieldItem.title}
                </Typography> :
                <Typography variant="subtitle2" gutterBottom noWrap={true} >
                  <span className={classes.boldtablecell}>{fieldItem.title}</span>
                  {`: `}
                  <span ref={titleRef} className={classes.tableCell} value={`${data[fieldItem.field]}`}>{` ${data[fieldItem.field] != undefined || data[fieldItem.field] != null ? data[fieldItem.field] : ''}`}</span>

                </Typography>
            }
          </Grid>
        )
      })
    return item;
  }

  const renderIconBasedOnFileType = (file_url) => {
    if (!file_url) {
      return (<img className={classes.img} alt="complex" src={StructLogo} />);
    }
    //console.log(file_url);
    file_url = file_url.toString();
    if (file_url.indexOf(".pdf") != -1 || file_url.indexOf(".PDF") != -1) {
      return (<PictureAsPdf className={classes.img} fontSize="large" />)
    }
    else if (file_url.indexOf(".docs") != -1 || file_url.indexOf(".docx") != -1) {
      return (<DescriptionIcon className={classes.img} fontSize="large" />)
    }
    else if (file_url.indexOf(".png") != -1 || file_url.indexOf(".jpg") != -1 || file_url.indexOf(".jpeg") != -1) {
      return (<img className={classes.img} alt="complex" src={file_url} />);
    }
    else {
      let fileName = file_url.substring(file_url.lastIndexOf('/') + 1);
      return (<Avatar variant="square" alt={fileName} />)
    }
  }


  const CustomIconButton = ({ title, onClick, children }) => {
    return (
      <Tooltip title={title} aria-label={title} placement="left">
        <IconButton onClick={(event) => {
          event.stopPropagation();
          onClick()
        }} style={{padding: '7px'}}>
          {children}
        </IconButton>
      </Tooltip>
    )
  }



  return (
    <Grid container spacing={2}>
      {list.map(product => {
        return (
          <Grid item xs={6} sm={3} key={product.id}>
            <Paper className={classes.paper} onClick={() => handleTableRowClick(product)}>
              <Grid container style={{
                height: '100%',
                paddingBottom: '10px'

              }}>
                <Grid item sm sm={4} style={{ display: 'flex' }}>
                  {renderIconBasedOnFileType(product.file_url)}
                </Grid>
                <Grid elevation={3} item sm sm={6} style={{ marginTop: '25px' }}>
                  {renderItem(product)}
                </Grid>
                <Grid item sm sm={2} style={{
                  display: 'flex',
                  margin: 'auto',
                  flexDirection: 'column'
                }}>

                  <ClipboardText item_id={product.id} />
                  {
                    isAddEditLinkVisible &&
                    <CustomIconButton
                      title={'Edit'}
                      onClick={(event) => {
                        handleEditButtonPress(product)
                      }}>
                      <EditIcon />
                    </CustomIconButton>
                  }
                  {
                    isHistoryLinkVisible &&
                    <CustomIconButton
                      title={'View History'}
                      onClick={(event) => {
                        handleHistoryToggle({ rowId: product.id })
                      }}>
                      <HistoryIcon />
                    </CustomIconButton>
                  }
                 
                  <CustomIconButton
                      title={'Delete'}
                      onClick={(event) => {
                        handleDelete({ id: product.id })
                      }}>
                       <DeleteOutlineIcon />
                    </CustomIconButton>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )
      })
      }

    </Grid >

  )
}
