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
import {resourcePathURL} from '@ravibasil/common/api/fileUpload.api';
//import {isURLExisting} from  '@ravibasil/common/utils/usefulHelpers';

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
    handleEditButtonPress = () => { },
    columnsFields,
    handleTableRowClick,
    isHistoryLinkVisible = true,
    isAddEditLinkVisible = false,
    isInsideDetailPanel = false
}) {
    const classes = useStyles();
    
    const renderItem = (data) => {
        let item = [];

        columnsFields
            .filter(fieldItem => fieldItem.isGridViewVisible === false ? fieldItem.isGridViewVisible : true)
            .map(fieldItem => {
                item.push(
                    <Grid item sm sm={12} key={`${fieldItem.title}_${data[fieldItem.field]}`}>
                        <Typography variant="subtitle2" gutterBottom noWrap={true}>
                            <span className={classes.boldtablecell}>{fieldItem.title}</span>
                            {`: `}
                            <span className={classes.tableCell}>{` ${data[fieldItem.field] != undefined || data[fieldItem.field] != null ? data[fieldItem.field] : ''}`}</span>
                        </Typography>
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
        <Grid container spacing={2}>
            {list.map(product => {
                //console.log(product);
                if(product.thumbnail && !product.file_url){
                    product.file_url = resourcePathURL+product.thumbnail;                    
                   /*  isURLExisting(file_url).then(found=>{
                        //console.log(found);
                        if(found){
                            product.file_url = file_url;
                            //console.log(product.file_url);
                        }
                    }) */
                    //console.log(product.file_url);
                }
                return (
                    <Grid item xs={6} sm={3} key={product.id}>
                        <Paper className={classes.paper} onClick={() => handleTableRowClick(product)}
                        // style={{ backgroundColor: `${product.is_archived ? '#d0cece' : '#ffffff'}` }}
                        >
                            <Grid container style={{
                                height: '100%',
                                paddingBottom: '10px'

                            }}>
                                <Grid item sm sm={4} style={{ display: 'flex' }}>
                                    {renderIconBasedOnFileType(product.file_url)}
                                    {/* <img className={classes.img} alt="complex" src={StructLogo}></img> */}
                                </Grid>
                                <Grid elevation={3} item sm sm={8} style={{marginTop: '25px'}}>

                                    {renderItem(product)}
                                </Grid>
                                <Grid style={{display: 'flex', margin: 'auto',width: '154px'}}>
                                    
                                    {
                                        isAddEditLinkVisible &&
                                        <Grid item sm sm={12} >
                                            <IconButton onClick={(event) => {
                                                event.stopPropagation();
                                                handleEditButtonPress(product)
                                            }}>

                                                <Typography variant="body2" style={{ cursor: 'pointer', textAlign: 'right' }}>
                                                    <EditIcon />
                                                </Typography>
                                            </IconButton>

                                        </Grid>
                                    }
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
