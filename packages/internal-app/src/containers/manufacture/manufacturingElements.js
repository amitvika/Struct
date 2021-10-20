import React, { useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';

import Assembly from './assembly'
import Maching from './machining';
import InjectionCasting from './injectionCasting';
import Dispensing from './Dispensing'
import Storage from './Storage';
import FullProcess from './fullProcess';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    marginTop: '10px',
    marginBottom: '10px'
  },
  tabPaper: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    cursor: 'pointer',
    transition: '0.3s',
    "&:hover, &:focus": {
      backgroundColor: '#DCDCDC'
    }
  },
  selectedTab: {
    backgroundColor: "blue",

  },
  dividerStyle: {
    marginTop: '20px',
    marginBottom: '20px'
  },
  verticalDivider: {
    margin: '5px',
    width: '1px'
  }
}));

export default function ManufacturingElements(props) {

  const { itemProperties, setOrder } = props;
  const classes = useStyles();

  const [selectedTab, setSelectedTab] = useState("");
  const [selectedSubTab, setselectedSubTab] = useState("");
  const [isSubTabVisible, setisSubTabVisible] = useState(false);


  const tabArray = ['Machining', 'Injection Casting', 'Assembly', 'Photolithography', 'Unpacking',
    'PCB Assembly', 'Extrusion', '3D Printing', 'Forming', ' Textile Assembly',
    'Powder Stamping and Sintering', ' Coatings', ' Temperature and Gas Treatments',
    ' Photochemical Machining', 'Storage', 'Dispensing', 'Holding', 'Separation and Refinement',
    'Particulate/Liquid/Gas Mixing', 'Particulate Consolidation','Designer', 'Manufacture', 'Classification',]

  const subTabArray = ['Manufacturability Analysis', 'Process Configuration', 'Process Statistics and Analysis', 'Process Steps']

  const handleTabChange = (tabName) => {
    setSelectedTab(tabName);
    setselectedSubTab(subTabArray[1]);
    setisSubTabVisible(true);
  }

  const handleTabChange2 = (tabName2) => {
    if (tabName2 === selectedSubTab) {
      setselectedSubTab('');
    }
    else {
      setselectedSubTab(tabName2);
    }
    if (tabName2 == 'Manufacturability Analysis') {
      if (selectedTab == "Assembly") {
        setOrder(itemProperties);
      } /* else if(selectedTab=="Storage") {
                setStack(itemProperties);
            } */
    }
  }

  const renderDetailPanel = () => {

    if (selectedTab === 'Machining') {
      return <Maching
        {...props}
        selectedSubTab={selectedSubTab} />
    }
    else if (selectedTab === 'Injection Casting') {
      return <InjectionCasting
        {...props}
        selectedSubTab={selectedSubTab} />
    }
    else if (selectedTab === 'Assembly') {
      return <Assembly
        {...props}
        selectedSubTab={selectedSubTab} />
    }
    else if (selectedTab === 'Dispensing') {
      return <Dispensing
        {...props}
        selectedSubTab={selectedSubTab} />
    }
    else if (selectedTab === 'Storage') {
      return <Storage
        {...props}
        selectedSubTab={selectedSubTab} />
    }
    else if (selectedTab === 'Full Process') {
      return <FullProcess
        {...props}
        selectedSubTab={selectedSubTab} />
    }
    else {

      return null

    }

  }


  return (
    <>
      <Paper elevation={3} className={classes.paper}>
        <Grid container spacing={1}>
          <Grid item xs={2}>
            <Paper onClick={() => handleTabChange('Full Process')}
              style={{
                backgroundColor: selectedTab === 'Full Process' ? "#343a40" : "",
                color: selectedTab === 'Full Process' ? "white" : "",
                fontWeight: 'bold'
              }}
              className={classes.tabPaper}>{'Full Process'}</Paper>
          </Grid>

          <Divider orientation="vertical" flexItem className={classes.verticalDivider} style={{ borderStyle: 'inset', height: '30px' }} />
          {
            tabArray.map(tabName =>
            (
              <Grid item xs={2} key={tabName}>
                <Paper onClick={() => handleTabChange(tabName)}
                  style={{
                    backgroundColor: selectedTab === tabName ? "#343a40" : "",
                    color: selectedTab === tabName ? "white" : ""
                  }}
                  className={classes.tabPaper}>{tabName}</Paper>

              </Grid>
            )
            )
          }
        </Grid>
      </Paper>

      {
        isSubTabVisible ?
          <>
            <Paper elevation={3} style={{
              visibility: isSubTabVisible ? "visible" : "hidden",

            }} className={classes.paper}>
              <Grid container spacing={1}>
                {
                  subTabArray.map(tabName2 => (
                    <Grid item xs={3} key={tabName2}>

                      <Paper onClick={() => handleTabChange2(tabName2)} style={{
                        backgroundColor: selectedSubTab === tabName2 ? "#3369FF" : "",
                        color: selectedSubTab === tabName2 ? "white" : ""
                      }}
                        className={classes.tabPaper}>{tabName2}</Paper>

                    </Grid>
                  )
                  )
                }
              </Grid>
            </Paper>

            {renderDetailPanel()}

          </> : null
      }
    </>
  )
}
