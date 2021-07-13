import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentItemAction } from '../../../actions/itemActions'

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    formControl: {
        margin: theme.spacing(3),
    },
}));

export default function ComplianceAndCertifications({ itemValue, setItemValue }) {
    const classes = useStyles();

    const dispatch = useDispatch();
    const [currentTab, setCurrentTab] = useState(true);
    const currentItem = useSelector(state => state.item.currentItem);
    const [compliance, setCompliance] = useState({});

    useEffect(() => {
        setCompliance(currentItem.compliance)

    }, [currentItem])
    const handleChange = (event) => {
        console.log('----', event.target.name, event.target.checked)
        const updatedItem = {
            ...currentItem,
            compliance: {
                ...compliance,
                [event.target.name]: event.target.checked
            }
        };


        dispatch(setCurrentItemAction(updatedItem));

    };

    const handleListItem = (value) => {
        if (currentTab === value) {
            setCurrentTab(null);
        }
        else {
            setCurrentTab(value)

        }
    }


    const { RoHS, ISO, CE, FCC } = currentItem?.compliance || {};


    const error = [RoHS, ISO, CE, FCC].filter((v) => v).length !== 2;

    return (
        <Paper style={{ margin: 10, padding: 10 }}>
            <FormControl component="fieldset" className={classes.formControl}>
                {/* <FormLabel component="legend">Assign responsibility</FormLabel> */}
                <FormGroup>
                    <FormControlLabel
                        control={<Checkbox checked={RoHS} onChange={handleChange} name="RoHS" />}
                        label="RoHS"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={ISO} onChange={handleChange} name="ISO" />}
                        label="ISO"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={CE} onChange={handleChange} name="CE" />}
                        label="CE"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={FCC} onChange={handleChange} name="FCC" />}
                        label="FCC"
                    />
                </FormGroup>
                {/* <FormHelperText>Be careful</FormHelperText> */}
            </FormControl>
        </Paper>
    );
}
