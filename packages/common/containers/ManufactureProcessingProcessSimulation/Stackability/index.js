import React, { useState, useEffect } from 'react';
//import { getPartsStackableInfo } from '@monostruct/common/api/fileUpload.api';
//import { useSelector } from 'react-redux';
import { Paper, Grid, /*CircularProgress,*/ Box /*, LinearProgress, makeStyles*/ } from '@material-ui/core';
// import { Headding } from '../../../components';
import Heading from '@monostruct/common/components/atoms/Headding';

import GLTFRenderer from '@monostruct/common/gltf/GltfRenderer.js';
import {
  DEFAULTBACKCOLOR,
  DEFAULTSELECTCOLOR,
  DEFAULTTOUCHCOLOR,
  SELECTFEATURE,
  SELECTHIRERACHY,
  STATEPROPS,
  USESTYLES
} from '@monostruct/common/gltf/Tree/utils';
import LinearProgressBarTiming from '@monostruct/common/gltf/LinearProgressBarTiming';
import '../style.css';
/*
const DEFAULTDISTANCEGAP = 0.1;
const DEFAULTANGLEGAP = 0.5;
const DEFAULTEXPLODEGAP = 10;
const DEFAULTFROMCENTER = true;
const DEFAULTDISECT = false;
const DEFAULTSHOWDISECT = false;
const DEFAULTSHOWINFOONSELECT = false;
const DEFAULTMATERIALNAME = 'Basic';
const DEFAULTMATERIALTYPE = [{ id: 1, name: DEFAULTMATERIALNAME }];

const stateprops = {
  distancegap: DEFAULTDISTANCEGAP,
  anglegap: DEFAULTANGLEGAP,
  explodegap: DEFAULTEXPLODEGAP,
  disect: DEFAULTDISECT,
  showdisect: DEFAULTSHOWDISECT,
  showinfoonselect: DEFAULTSHOWINFOONSELECT,
  materialtype: DEFAULTMATERIALTYPE,
  fromcenter: DEFAULTFROMCENTER,
};
mainContainer: {
      margin: 10,
      padding: 10,
      display: 'inline-flex',
      minWidth: '100%',
      //background: "#F3F3F3",
      backgroundColor:selectedTheme=='light'?"#F3F3F3":"#0C0C0C",
    },
    viewerContainer: {
      flex: 1,
      padding: '20px',
      margin: '0px 15px',
      display: 'inline-block',
      boxShadow: '0 0 10px rgb(0 0 0 / 20%)',
      minWidth: '800px',
      //background: "#F3F3F3",
      backgroundColor:selectedTheme=='light'?"#F3F3F3":"#0C0C0C",
    },    

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    margin: 10,
    padding: 10,
    display: 'inline-flex',
    minWidth: '100%',
  },
  viewerContainer: {
    width: '600px',
    height: '600px',
    padding: '20px',
    margin: '0px 15px',
    display: 'inline-block',
    border: '1px solid rgba(0, 0, 0, 0.3)',
    boxShadow: '0 0 10px rgb(0 0 0 / 20%)',
  },
}));
*/
export default function Stackability(props) {
  const { fileId, gltfjson, isLoading, fileUUId, progressBarLoad, percentage, currentProgressText, completionProgressText } = props;
  const [isFileLoading, setIsFileLoading] = useState(isLoading);

  const classes = USESTYLES();

  const [splitfiles, setsplitfiles] = useState({ gltfjson });

  useEffect(() => {
    setsplitfiles(props.gltfjson);
  }, [props]);
  const [state, _setState] = useState({});

  const setState = (data) => {
    _setState((prevState) => {
      return {
        ...prevState,
        ...data,
      };
    });
  };
  useEffect(() => {
    setIsFileLoading(isLoading);
  }, [isLoading]);
  useEffect(() => {
    const includeParts = true;
    console.log('Reaching', gltfjson, fileId, isLoading);
    let gltfjsonlen = Object.keys(gltfjson).length;
    if (gltfjsonlen > 0) {
      gltfjsonlen += gltfjson?.gltf?.accessors?.length;
    }
    if (gltfjsonlen > 0) {
      setState({
        selectedindex: 0,
        activefile:
        (fileId || fileUUId || "").toString() +
          includeParts.toString() +
          STATEPROPS.distancegap.toString() +
          STATEPROPS.anglegap.toString() +
          gltfjsonlen.toString(),
        gltfjson: gltfjson,
        dataselection: 0,
        firstshell: null,
        secondshell: null,
        materialname: STATEPROPS.materialtype[0].name,
        disectstruct: STATEPROPS.disect,
        showdisect: STATEPROPS.showdisect,
        showinfoonselect: STATEPROPS.showinfoonselect,
        //splitMethod: includeParts ? SELECTDISECTPARTS : SELECTHIRERACHY,
        selectedObjects: [],
        parentObjects: [],
        mates: [],
        renderdata: {},
        whatchange: 0,
      });
    }
  }, [gltfjson]);
  let gltfjsonlen = Object.keys(gltfjson).length;
  if (gltfjsonlen > 0) {
    gltfjsonlen += gltfjson?.gltf?.accessors?.length;
  }
  return (
    <Paper className={classes.mainContainer}>
      <Paper className={classes.stackContainer}>
        {progressBarLoad && (
          <Box sx={{ width: '100%' }}>
            <LinearProgressBarTiming 
              value={percentage}
              currentProgressText={currentProgressText}
              completionProgressText={completionProgressText}
            />
          </Box>
        )}
        {!isLoading && Object.keys(gltfjson).length > 0 && !isFileLoading && (
          <GLTFRenderer
            //gltfjson={JSON.stringify(gltfjson)}
            gltfobj={gltfjson}
            fileGDT={null}
            fileUUId={fileUUId}
            fileAnimation={true}
            //view="Perspective"
            activefile={fileId + gltfjsonlen.toString()}
            backcolor={DEFAULTBACKCOLOR()}
            selectcolor={DEFAULTSELECTCOLOR()}
            touchcolor={DEFAULTTOUCHCOLOR()}
            selectedoption={SELECTFEATURE}
            splitmethod={SELECTHIRERACHY}
            changedata={[]}
            data2texture={null}
            data3texture={null}
            materialtype={STATEPROPS.materialname}
            whatchanged={0}
            dataselection={0}
            activeDataTable={0}
          />
        )}
        {/* {(isLoading || isFileLoading) && <CircularProgress />} */}
      </Paper>
      {splitfiles.stackable && splitfiles.stackable.length > 0 && (
        <Paper style={{ padding: 10, width: '200px', flexWrap: 'wrap' }}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Heading bold>Parts Stackable Info</Heading>
            </Grid>
            <Grid item xs={3}>
              {' '}
              Count:{' '}
            </Grid>
            <Grid item xs={9}>
              {splitfiles.stackable[0].count} unit(s)
            </Grid>
            <Grid item xs={3}>
              {' '}
              Any Dir:
            </Grid>
            <Grid item xs={9}>
              {prettyPrintArray(splitfiles.stackable[0].stack.direction)}
            </Grid>

            <Grid item xs={3}>
              Top:
            </Grid>
            <Grid item xs={9}>
              {prettyPrintArray(splitfiles.stackable[0].stack.top)}
            </Grid>

            <Grid item xs={3}>
              Bottom:
            </Grid>
            <Grid item xs={9}>
              {prettyPrintArray(splitfiles.stackable[0].stack.bottom)}
            </Grid>

            <Grid item xs={3}>
              Right:
            </Grid>
            <Grid item xs={9}>
              {prettyPrintArray(splitfiles.stackable[0].stack.right)}
            </Grid>

            <Grid item xs={3}>
              Left:
            </Grid>
            <Grid item xs={9}>
              {prettyPrintArray(splitfiles.stackable[0].stack.left)}
            </Grid>

            <Grid item xs={3}>
              Front:
            </Grid>
            <Grid item xs={9}>
              {prettyPrintArray(splitfiles.stackable[0].stack.front)}
            </Grid>
            <Grid item xs={3}>
              Back:
            </Grid>
            <Grid item xs={9}>
              {prettyPrintArray(splitfiles.stackable[0].stack.back)}
            </Grid>
          </Grid>
        </Paper>
      )}
    </Paper>
  );
}

export const prettyPrintArray = (json, maxlength = 30) => {
  if (json) {
    return JSON.stringify(json).split(',').join(', ');
  }
  return 'No Info';
};
