import React, { useState } from 'react';
import {
  SELECTSOLID,
  SELECTLINEAR,
  SELECTCIRCULAR,
  gltf_Dict,
  SELECTFEATURE,
  SELECTFACE,
  elementCopy
} from '@monostruct/common/gltf/Tree/utils';
import Button from '@mui/material/Button';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

export default function ThreejsSelection(props) {
  const {
    setRenderData,
    value,
    mykey,
    mytype,
    active,
    onChange,
    onClick,
    setIsCircularFaceOrEdgeSelection,
    cylindrical_axis_of_rotation,
    handleRotationalAxisChange,
    showKinematicMove,
    showKinematicSliderMove,
    showKinematicSliderAnimate,
    showKinematicSliderAnimateValues,
    applyTangentToEdges,
    isMountSurfaceFaceSelection,
    setIsMountSurfaceFaceSelection,
    isJointSurfaceFaceSelection,
    setIsJointSurfaceFaceSelection
  } = props;

  const [myvalue, setMyvalue] = useState(value);
  const [clicked, setClicked] = useState(active);
  const [snackBarMessage, setSnackBarMessage] = useState('');
  const [snackBarAlertType, setSnackBarAlertType] = useState('');
  const [snackBarState, setSnackBarState] = useState(false);
  const [autoHideDuration, setAutoHideDuration] = useState(1000);

  const openSnackBar = (alert, message) => {
    setSnackBarAlertType(alert);
    setSnackBarMessage(message);
    setAutoHideDuration(alert === 'success' ? 1000 : 5000);
    setSnackBarState(true);
  };

  const closeSnackBar = () => {
    setSnackBarState(false);
  };

  React.useEffect(() => {
    setMyvalue(value);
    if (value && value.length > 0) {
      if (active) {
        const notEmpty = getNotEmpty(value);
        if (!notEmpty) {
          let errorMessage = '';
          if (
            mytype === 'PartSelection' ||
            mytype === 'PartSelection3D' ||
            mytype === 'MotionControlKinematicModelling'
          ) {
            errorMessage = 'Please select a Part';
          } else if (mytype === 'FaceSelection') {
            errorMessage = 'Please select a Face after pressing CTRL+B';
          } else {
            errorMessage =
              'Please select a Face or Edge after pressing ALT+B or CTRL+B';
          }
          try {
            openSnackBar('error', errorMessage);
          } catch (error) {
            console.log(
              'Error while displaying snackbar in errormessage',
              error
            );
          }
        }
      }
    }
  }, [value]);

  React.useEffect(() => {
    setClicked(active);
    if (active) {
      doClick();
    }
  }, [active]);

  const getMyOption = () => {
    if (
      mytype === 'PartSelection' ||
      mytype === 'PartSelection3D' ||
      mytype === 'MotionControlKinematicModelling'
    )
      return SELECTSOLID;
    if (mytype === 'CircularFaceOrEdgeSelection') return SELECTCIRCULAR;
    if (mytype === 'LinearFaceOrEdgeSelection3D') return SELECTLINEAR;
    if (mytype === 'FaceSelection') return SELECTFACE;
    return SELECTFEATURE;
  };
  const getNameWithFeatures = (item) => {
    let myName = elementCopy(item[gltf_Dict['name']]);
    let myDisplayName = elementCopy(item[gltf_Dict['display']]);
    if (!myDisplayName) {
      return myName;
    }
    const myelement = item[gltf_Dict['element']];
    let prefix = '';
    if (myelement) {
      if (myelement === 'F') {
        prefix = 'FACE';
      } else if (myelement === 'E') {
        prefix = 'EDGE';
      } else if (myelement === 'V') {
        prefix = 'VERTEX';
      } else if (myelement === 'P') {
        prefix = 'PART';
      } else if (myelement === 'f' || myelement === 'e' || myelement === 'v') {
        prefix = 'SLICER';
      }
    } else {
      prefix = myName.slice(0, 4);
      if (prefix !== 'FACE' && prefix !== 'EDGE' && prefix !== 'PART') {
        prefix = myName.slice(0, 6);
        if (prefix !== 'VERTEX') {
          prefix = 'SLICER';
        }
      }
    }
    return prefix + myDisplayName;
  };
  const getMyName = (item) => {
    let myelement = item[gltf_Dict['element']];
    //let myName = item[gltf_Dict['name']];
    let myName = getNameWithFeatures(item);
    //let myCode = item[gltf_Dict['geometry']];
    let first4chars = myName.slice(0, 4);
    let first6chars = myName.slice(0, 6);
    if (myelement) {
      first4chars = myelement;
      first6chars = myelement;
      if (myelement === 'F') {
        first4chars = 'FACE';
      } else if (myelement === 'E') {
        first4chars = 'EDGE';
      } else if (myelement === 'V') {
        first6chars = 'VERTEX';
      } else if (myelement === 'P') {
        first4chars = 'PART';
      } else if (myelement === 'f' || myelement === 'e' || myelement === 'v') {
        first6chars = 'SLICER';
      }
    }
    if (
      (mytype === 'PartSelection' ||
        mytype === 'PartSelection3D' ||
        mytype === 'MotionControlKinematicModelling') &&
      first4chars === 'PART'
    ) {
      return myName + '\u2003';
    } else if (
      mytype === 'FaceSelection' &&
      (first4chars === 'FACE' || first4chars === 'PART')
    ) {
      return myName + '\u2003';
    } else if (
      mytype !== 'PartSelection' &&
      mytype !== 'PartSelection3D' &&
      mytype !== 'MotionControlKinematicModelling' &&
      mytype !== 'FaceSelection' &&
      (first4chars === 'EDGE' || first4chars === 'FACE')
    ) {
      /* if (item.parentnode) {
        const myParentName = getNameWithFeatures(item.parentnode);
        if (myParentName) {
          return myParentName + '\u2003';
        } else {
          return myName + '\u2003';
        }
      } else */ {
        return myName + '\u2003';
      }
    } else {
      return '\u0020';
    }
  };
  const getComponents = (myvalue) => {
    if (!myvalue) {
      return '\u0020';
    }
    const myvalueList = myvalue.map((row, index) => {
      if (row && row[gltf_Dict['name']]) {
        return getMyName(row);
      } else if (row) {
        return row + '\u2002';
      }
      return '\u0020';
    });

    return myvalueList;
  };
  const getNotEmpty = (myvalue) => {
    if (!myvalue) {
      return false;
    }

    for (let index = 0; index < myvalue.length; index++) {
      const item = myvalue[index];
      if (item && item[gltf_Dict['name']]) {
        let myelement = item[gltf_Dict['element']];
        //let myName = item[gltf_Dict['name']];
        let myName = getNameWithFeatures(item);
        //let myCode = item[gltf_Dict['geometry']];
        let first4chars = myName.slice(0, 4);
        let first6chars = myName.slice(0, 6);
        if (myelement) {
          first4chars = myelement;
          first6chars = myelement;
          if (myelement === 'F') {
            first4chars = 'FACE';
          } else if (myelement === 'E') {
            first4chars = 'EDGE';
          } else if (myelement === 'V') {
            first6chars = 'VERTEX';
          } else if (myelement === 'P') {
            first4chars = 'PART';
          } else if (
            myelement === 'f' ||
            myelement === 'e' ||
            myelement === 'v'
          ) {
            first6chars = 'SLICER';
          }
        }
        if (
          (mytype === 'PartSelection' ||
            mytype === 'PartSelection3D' ||
            mytype === 'MotionControlKinematicModelling') &&
          first4chars === 'PART'
        ) {
          return true;
        } else if (
          mytype === 'FaceSelection' &&
          (first4chars === 'FACE' || first4chars === 'PART')
        ) {
          return true;
        } else if (
          mytype !== 'PartSelection' &&
          mytype !== 'PartSelection3D' &&
          mytype !== 'MotionControlKinematicModelling' &&
          mytype !== 'FaceSelection' &&
          (first4chars === 'EDGE' || first4chars === 'FACE')
        ) {
          return true;
        }
      }
    }
    /* if (myvalue.length > 0) {
      if (active) {
        let errorMessage = '';
        if (
          mytype === 'PartSelection' ||
          mytype === 'PartSelection3D' ||
          mytype === 'MotionControlKinematicModelling'
        ) {
          errorMessage = 'Please select a Part';
        } else if (mytype === 'FaceSelection') {
          errorMessage = 'Please select a Face after pressing CTRL+B';
        } else {
          errorMessage =
            'Please select a Face or Edge after pressing ALT+B or CTRL+B';
        }
        try {
          openSnackBar('error', errorMessage);
        } catch (error) {
          console.log('Error while displaying snackbar in errormessage', error);
        }
      }
    } */
    return false;
  };
  const doClick = () => {
    if (showKinematicMove || showKinematicSliderMove) {
      return;
    }
    const myoption = getMyOption();
    if (myvalue) {
      myvalue.forEach((element) => {
        element.selectedshell = true;
        element.selected = true;
      });
    }
    setRenderData(myvalue, { name: mykey, option: myoption }, onChange);
    console.log('What I Got in selection is', mykey, mytype, myoption);
    if (
      mytype === 'CircularFaceOrEdgeSelection' ||
      mytype === 'LinearFaceOrEdgeSelection3D'
    ) {
      setIsCircularFaceOrEdgeSelection(true);
      setIsMountSurfaceFaceSelection(false);
      setIsJointSurfaceFaceSelection(false);
    } else if (mykey === 'Mount Surface(s)' && mytype === 'FaceSelection') {
      setIsCircularFaceOrEdgeSelection(false);
      setIsMountSurfaceFaceSelection(true);
      setIsJointSurfaceFaceSelection(false);
    } else if (mykey === 'Joint Surface(s)' && mytype === 'FaceSelection') {
      setIsCircularFaceOrEdgeSelection(false);
      setIsMountSurfaceFaceSelection(false);
      setIsJointSurfaceFaceSelection(true);
    } else {
      setIsCircularFaceOrEdgeSelection(false);
      setIsMountSurfaceFaceSelection(false);
    }
    onClick(mykey);
    //setRenderData(myvalue, { name: mykey, option: myoption }, onChange);
  };

  // const createAxisUI = () => {
  //   const axisArr = ['x', 'y', 'z'];
  //   let checkboxArr = [];

  //   axisArr.map((primAxis) => {
  //     let value = [];

  //     axisArr.map((secAxis) => {
  //       value.push(
  //         (
  //           Math.round(
  //             cylindrical_axis_of_rotation[`${primAxis}${secAxis}`] * 100
  //           ) / 100
  //         ).toFixed(2)
  //       );
  //     });

  //     checkboxArr.push(
  //       <FormControlLabel
  //         control={
  //           <Checkbox
  //             // checked={key}
  //             onChange={handleRotationalAxisChange}
  //             name={`key_${primAxis}`}
  //           />
  //         }
  //         label={`${primAxis} (${value.join(', ')})`}
  //       />
  //     );
  //   });

  //   return checkboxArr;
  // };
  return (
    <>
      <Button
        aria-describedby={'Save Controls'}
        id={'popselect'}
        type="button"
        variant="contained"
        color={active && clicked ? 'primary' : 'inherit'}
        onClick={(event) => {
          if (showKinematicMove || showKinematicSliderMove) {
            return;
          }
          if (active) {
            let clickedState = !clicked;
            setClicked(clickedState);
            if (clickedState) {
              doClick();
            } else {
              setRenderData(
                myvalue,
                { name: 'NoKey', option: SELECTFEATURE, onChange },
                null
              );
              onClick('NoKey');
            }
          } else {
            setClicked(true);
            doClick();
          }
        }}
      >
        {getNotEmpty(myvalue)
          ? getComponents(myvalue)
          : 'Please select features'}
      </Button>
      {/* {cylindrical_axis_of_rotation && (
        <FormGroup sx={{ flexDirection: 'row' }}>{createAxisUI()}</FormGroup>
      )} */}
      <Snackbar
        open={snackBarState}
        autoHideDuration={autoHideDuration}
        onClose={closeSnackBar}
      >
        <MuiAlert
          color={snackBarAlertType}
          variant="filled"
          onClose={closeSnackBar}
        >
          {snackBarMessage}
        </MuiAlert>
      </Snackbar>
    </>
  );
}
