import React from 'react'
import {
    Grid,
    Typography,
    makeStyles,
    Paper,
    IconButton
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import Avatar from '@material-ui/core/Avatar';
import PictureAsPdf from '@material-ui/icons/PictureAsPdf';
import DescriptionIcon from '@material-ui/icons/Description';
import './style.css'

import StructLogo from '../../assets/images/struct_logo.png';


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
        display: 'block',
        maxWidth: '96px',
        maxHeight: '96px',
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
    handleHistoryToggle = () => { },
    handleAddButtonPress = () => { },
    columnsFields,
    handleTableRowClick,
    isHistoryLinkVisible = true,
    isAddEditLinkVisible = true,
    isInsideDetailPanel = false
}) {
    const classes = useStyles();

    const renderItem = (data) => {
        let item = [];

        columnsFields.map(fieldItem => {
            item.push(
                <Grid item sm sm={12} className={classes.fieldItem}>
                    <div >
                        <span className={classes.boldtablecell}>{fieldItem.title}</span>
                        {`: `}
                        <span className={classes.tableCell}>{` ${data[fieldItem.field] != undefined || data[fieldItem.field] != null ? data[fieldItem.field] : ''}`}</span>
                    </div>
                </Grid>
            )
        })
        return item;
    }

    const renderIconBasedOnFileType = (file_url) => {
        if (!file_url) {
            return (<img className={classes.img} alt="complex" src={StructLogo} />);
        }

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

    return (
        <div className={isInsideDetailPanel ? 'fixed-grid--around-350' : 'fixed-grid--around'}>
            {list.map(product => {
                return (
                    <div style={{ marginTop: '10px', marginBottom: '10px', width: isInsideDetailPanel ? '350px' : '380px' }}>
                        <Paper className={classes.paper} onClick={() => handleTableRowClick(product)}
                            style={{ backgroundColor: `${product.is_archived ? '#d0cece' : '#ffffff'}` }}>
                            <Grid container style={{
                                height: '100%',
                                paddingBottom: '10px'

                            }}>
                                <Grid item sm sm={4} style={{ display: 'flex' }}>
                                    {renderIconBasedOnFileType(product.file_url)}
                                </Grid>
                                <Grid item sm sm={8}>

                                    {renderItem(product)}

                                    {
                                        isHistoryLinkVisible &&
                                        <Grid item sm sm={12} className={classes.historyLink}>
                                            <Typography variant="body2" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={(event) => {
                                                event.stopPropagation();
                                                handleHistoryToggle({ rowId: product.id })
                                            }}>
                                                View History
                		</Typography>
                                        </Grid>

                                    }
                                    {
                                        isAddEditLinkVisible &&
                                        <Grid item sm sm={12} >
                                            <IconButton >
                                                <Typography >
                                                    <EditIcon onClick={handleAddButtonPress}/>
                                                </Typography>
                                            </IconButton>

                                        </Grid>
                                    }
                                </Grid>
                            </Grid>
                        </Paper>
                    </div>
                )
            })
            }

        </div >

    )
}
