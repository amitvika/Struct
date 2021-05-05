import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox from '@material-ui/core/Checkbox';

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
    const { RoHS, ISO, CE, FCC } = itemValue?.compliance || {};

    const handleChange = (event) => {
        setItemValue(prevValue => ({
            ...prevValue,
            compliance: {
                ...prevValue.compliance,
                [event.target.name]: event.target.checked
            }
        }));
    };

    const error = [RoHS, ISO, CE, FCC].filter((v) => v).length !== 2;

    return (
        <div className={classes.root}>
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
        </div>
    );
}
