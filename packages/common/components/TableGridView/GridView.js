import React, { useRef, useState, useEffect } from 'react';
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
import ClipboardText from '../ClipboardText';
import HistoryIcon from '@material-ui/icons/History';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
// import DeleteForeverIcon from '@material-ui/icons/DeleteForeverIcon';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

import StructLogo from '../../assets/images/new_logo.png';
import { getExistingPathFromServer } from '@monostruct/common/api/fileUpload.api';
import Tooltip from '@mui/material/Tooltip';

import './style.css';

const useStyles = makeStyles((theme) => ({
  tableCell: {
    borderBottom: 'none'
  },
  boldtablecell: {
    borderBottom: 'none',
    fontWeight: 'bold'
  },
  paper: {
    height: '100%',
    width: '100%',
    cursor: 'pointer',
    transition: '0.3s',
    '&:hover, &:focus': {
      backgroundColor: '#DCDCDC',
      color: '#000000'
    }
  },

  image: {
    width: '100%',
    height: '100%'
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
    color: '#0b79c7'
  },
  fieldItem: {
    display: 'flex',
    padding: '10px 0 0 0'
  },
  actionIconContainer: {
    display: 'flex',
    margin: '0 auto',
    flexDirection: 'row'
  },
  thumbnailContainer: {
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center'
    }
  },
  contentContainer: {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('sm')]: {
      marginTop: '0',
      padding: '5px'
    }
  }
}));

const HeadingCopyToClipboard = ({ title, valueToCopy }) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = (event) => {
    event.stopPropagation();
    setOpen(true);

    navigator.clipboard.writeText(valueToCopy);

    setTimeout(() => {
      setOpen(false);
    }, 500);
  };
  return (
    <Tooltip
      PopperProps={{
        disablePortal: true
      }}
      onClose={handleTooltipClose}
      open={open}
      disableFocusListener
      disableHoverListener
      disableTouchListener
      title="Copied To Clipboard"
    >
      <span className={classes.boldtablecell} onClick={handleTooltipOpen}>
        {title}
      </span>
    </Tooltip>
  );
};

export default function GridView({
  list,
  columnsFields,
  handleTableRowClick,
  ...props
}) {
  const classes = useStyles();
  const titleRef = useRef();

  const renderItem = (data) => {
    let item = [];
    columnsFields
      .filter((fieldItem) =>
        fieldItem.isGridViewVisible === false
          ? fieldItem.isGridViewVisible
          : true
      )
      .map((fieldItem) => {
        item.push(
          <Grid
            item
            sm
            sm={12}
            key={`${fieldItem.title}_${data[fieldItem.field]}`}
          >
            {fieldItem.isLink ? (
              <Typography
                variant="body2"
                style={{ cursor: 'pointer', textAlign: 'center' }}
                onClick={fieldItem.onClick}
                className={classes.historyLink}
              >
                {fieldItem.title}
              </Typography>
            ) : (
              <Typography
                variant="subtitle2"
                gutterBottom
                noWrap={true}
                style={{ display: 'flex' }}
              >
                <HeadingCopyToClipboard
                  {...{
                    title: fieldItem.title,
                    valueToCopy: data[fieldItem.field]
                  }}
                />
                {`: `}
                <span
                  ref={titleRef}
                  className={classes.tableCell}
                  value={`${data[fieldItem.field]}`}
                >{` ${
                  data[fieldItem.field] != undefined ||
                  data[fieldItem.field] != null
                    ? data[fieldItem.field]
                    : ''
                }`}</span>
              </Typography>
            )}
          </Grid>
        );
      });
    return item;
  };

  const RenderIconBasedOnFileType = ({ file_url, logo_url }) => {
    const [icons, setIcons] = useState(file_url);
    useEffect(() => {
      //console.log('URL', file_url);
      if (file_url) {
        getExistingPathFromServer(file_url, 'png')
          .then((file_png) => {
            //console.log('PNG', file_png + file_url + '.png');
            if (file_png) {
              setIcons(file_png + file_url + '.png');
            } else {
              setIcons('');
            }
          })
          .catch((err) => {
            console.log('while fetching', err, file_url);
          });
      } else if (logo_url) {
        setIcons(logo_url);
      } else {
        setIcons('');
      }
    }, [file_url, logo_url]);

    if (!icons) {
      return <img className={classes.img} alt="complex" src={StructLogo} />;
    }
    let file_png = icons.toString();
    file_png.replace('undefined/', '');
    if (file_png.indexOf('.pdf') != -1 || file_png.indexOf('.PDF') != -1) {
      return <PictureAsPdf className={classes.img} fontSize="large" />;
    } else if (
      file_png.indexOf('.docs') != -1 ||
      file_png.indexOf('.docx') != -1
    ) {
      return <DescriptionIcon className={classes.img} fontSize="large" />;
    } else if (file_png) {
      return <img className={classes.img} alt="complex" src={file_png} />;
    } else {
      let fileName = file_png.substring(file_png.lastIndexOf('/') + 1);
      return <Avatar variant="square" alt={fileName} />;
    }
  };

  return (
    <Grid container spacing={2}>
      {list.map((product) => {
        return (
          <Grid item xs={6} sm={3} key={product.id}>
            <Paper
              className={classes.paper}
              onClick={() => handleTableRowClick(product)}
            >
              <Grid
                container
                style={{
                  height: '100%',
                  paddingBottom: '10px'
                }}
              >
                <Grid item sm sm={4} className={classes.thumbnailContainer}>
                  <RenderIconBasedOnFileType
                    file_url={product.file_url}
                    logo_url={product.logo_url}
                  />
                  <ActionButtonContainer {...{ product, ...props }} />
                </Grid>
                <Grid item sm sm={8} className={classes.contentContainer}>
                  {renderItem(product)}
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
}

const ActionButtonContainer = ({
  product,
  handleUndeleteButton = () => {},
  handleDelete = () => {},
  handleHistoryToggle = () => {},
  handleEditButtonPress = () => {},
  isViewArchivedChecked = true,
  isHistoryLinkVisible = true,
  isInsideDetailPanel = false,
  showDeleteActionButton = true,
  isEditLinkVisible = false
}) => {
  const classes = useStyles();

  const CustomIconButton = ({ title, onClick, children }) => {
    return (
      <Tooltip title={title} aria-label={title} placement="left">
        <IconButton
          onClick={(event) => {
            event.stopPropagation();
            onClick();
          }}
          style={{ padding: '7px' }}
        >
          {children}
        </IconButton>
      </Tooltip>
    );
  };

  return (
    <div className={classes.actionIconContainer}>
      {/* <ClipboardText item_id={product.id} /> */}
      {isEditLinkVisible && (
        <CustomIconButton
          title={'Edit'}
          onClick={(event) => {
            handleEditButtonPress(product);
          }}
        >
          <EditIcon />
        </CustomIconButton>
      )}
      {isHistoryLinkVisible && (
        <CustomIconButton
          title={'View History'}
          onClick={(event) => {
            handleHistoryToggle({ rowId: product.id });
          }}
        >
          <HistoryIcon />
        </CustomIconButton>
      )}

      {showDeleteActionButton && !isViewArchivedChecked && (
        <CustomIconButton
          title={'Delete'}
          onClick={(event) => {
            handleDelete({ id: product.id });
          }}
        >
          <DeleteOutlineIcon />
        </CustomIconButton>
      )}
      {showDeleteActionButton && isViewArchivedChecked && (
        <CustomIconButton
          title={'Undelete'}
          onClick={(event) => {
            handleUndeleteButton({ id: product.id });
          }}
        >
          <DeleteForeverIcon />
        </CustomIconButton>
      )}
    </div>
  );
};
