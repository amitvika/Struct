import React, { useState, useEffect, Fragment } from "react";
import Paper from "@material-ui/core/Paper"
import Tab from "@material-ui/core/Tab"
import Tabs from "@material-ui/core/Tabs"
import Grid from "@material-ui/core/Grid"
import CircularProgress from "@material-ui/core/CircularProgress"

import { useHistory } from "react-router-dom";
import { useQuery } from '../../utils/customHooks'

import TeamSetup from '../teamSetup';


const CriteriaUpload = () => {
    const history = useHistory();
    let query = useQuery();

    const [isLoading, setIsLoading] = useState(true);
    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => {
       

        (async () => {
            setIsLoading(true);

            setIsLoading(false);
        })()
    }, []);
    
    useEffect(() => {
        if (query.get('tab')) {
            setTabIndex(parseInt(query.get('tab')))
        }
    },[query.get('tab')])

    const renderPageSwitch = () => {
        switch (tabIndex) {
            case 0:
                return <TeamSetup />;
            default:
                return "Undefined Tab Index";
        }
    }

    const handleTabChange = (event, newTabIndex, accessSetupId) => {
        setTabIndex(newTabIndex)

        let search = `?tab=${newTabIndex}`
        if (accessSetupId) {
            search += `&accessSetupId=${accessSetupId}`
        }

        history.push({
            pathname: `criteria-upload`,
            search
        })
    }

    if (isLoading) {
        return <CircularProgress />;
    }

    return (
        <>
            <Grid container>
                <Grid item sm sm={12}>
                    <Paper style={{ display: 'flex', justifyContent: 'center', padding: 10, margin: 10 }}>
                        <h4>Criteria Upload</h4>
                    </Paper>
                </Grid>

                <Grid item sm={2}>
                    <Paper style={{ padding: 20, margin: 10 }}>
                        <Tabs
                            orientation="vertical"
                            variant="scrollable"
                            value={tabIndex}
                            onChange={handleTabChange}>

                            <Tab label="Criteria" value={0} />
    
                        </Tabs>
                    </Paper>
                </Grid>
                <Grid item sm sm={10} >
                    <Paper style={{ padding: 25, margin: 10 }}>
                        {/* {renderPageSwitch()} */}
                    </Paper>
                </Grid>
            </Grid>

        </>
    );
}

export default CriteriaUpload;
