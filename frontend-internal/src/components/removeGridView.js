import React from 'react'
import {
    Grid,
    Typography,
    makeStyles,
    Paper,
    IconButton
} from '@material-ui/core';
import './style.css'
import EditIcon from '@material-ui/icons/Edit';
import Box from '@material-ui/core/Box';
import StructLogo from '../assets/images/struct_logo.png';


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
    handleTableRowClick = () => { },
    isHistoryLinkVisible = true,
    isAddEditLinkVisible = false,
    isInsideDetailPanel = false
}) {
    const classes = useStyles();

    const renderItem = (data) => {
        let item = [];

        Object.keys(columnsFields).forEach(fieldItem => {
            item.push(
                <Grid item sm sm={12}>
                    <Typography variant="subtitle2" gutterBottom noWrap={true}>
                        {`${columnsFields[fieldItem]} : ${data[fieldItem] != undefined || data[fieldItem] != null ? data[fieldItem] : ''}`}
                    </Typography>
                </Grid >
            )
        })
        return item;
    }

    return (
        <Grid container spacing={2}>
            {list.map((product) => {
                return (
                    <Grid item xs={6} sm={3}>
                        <Paper className={classes.paper} onClick={() => handleTableRowClick(product)} >

                            <Grid container style={{
                                height: '100%',
                                paddingBottom: '10px',

                            }}  >

                                <Grid item xs={3} style={{ display: 'flex' }}>
                                    <img className={classes.img} alt="complex" src={product.logoUrl || StructLogo} />

                                </Grid>

                                <Grid container xs={9} >
                                    {renderItem(product)}
                                </Grid>
                                <Grid container xs={12} >
                                    {
                                        isHistoryLinkVisible &&
                                        <Grid item xs style={{ display: "flex" }} className={classes.historyLink}>
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
                                        <Grid item xs >

                                            <IconButton >

                                                <Typography variant="body2" style={{ cursor: 'pointer', textAlign: 'right' }} onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleEditButtonPress(product)
                                                }}>
                                                    <EditIcon />
                                                </Typography>
                                            </IconButton>
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
