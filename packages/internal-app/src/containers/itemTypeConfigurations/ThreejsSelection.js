import React, { useState } from 'react';
import {
  SELECTSOLID,
  SELECTLINEAR,
  SELECTCIRCULAR,
  gltf_Dict,
  SELECTFEATURE,
  SELECTFACE
} from '@monostruct/common/gltf/Tree/utils';
import Button from '@mui/material/Button';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

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
    handleRotationalAxisChange
  } = props;

  const [myvalue, setMyvalue] = useState(value);
  const [clicked, setClicked] = useState(false);

  React.useEffect(() => {
    console.log('Getting changed value to assign', value);
    setMyvalue(value);
  }, [value]);

  const getMyOption = () => {
    if (
      mytype == 'PartSelection' ||
      mytype == 'PartSelection3D' ||
      mytype == 'MotionControlKinematicModelling'
    )
      return SELECTSOLID;
    if (mytype == 'CircularFaceOrEdgeSelection') return SELECTCIRCULAR;
    if (mytype == 'LinearFaceOrEdgeSelection3D') return SELECTLINEAR;
    if (mytype == 'FaceSelection') return SELECTFACE;
    return SELECTFEATURE;
  };
  const getNameWithFeatures = (item) => {
    let myName = item[gltf_Dict['name']];
    let myDisplayName = item[gltf_Dict['display']];
    if (!myDisplayName) {
      return myName;
    }
    const myelement = item[gltf_Dict['element']];
    let prefix = '';
    if (myelement) {
      if (myelement == 'F') {
        prefix = 'FACE';
      } else if (myelement == 'E') {
        prefix = 'EDGE';
      } else if (myelement == 'V') {
        prefix = 'VERTEX';
      } else if (myelement == 'P') {
        prefix = 'PART';
      } else if (myelement == 'f' || myelement == 'e' || myelement == 'v') {
        prefix = 'SLICER';
      }
    } else {
      prefix = myName.slice(0, 4);
      if (prefix != 'FACE' && prefix != 'EDGE' && prefix != 'PART') {
        prefix = myName.slice(0, 6);
        if (prefix != 'VERTEX') {
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
    //console.log('GetMyName', myName, first4chars, first6chars);
    if (myelement) {
      first4chars = myelement;
      first6chars = myelement;
      if (myelement == 'F') {
        first4chars = 'FACE';
      } else if (myelement == 'E') {
        first4chars = 'EDGE';
      } else if (myelement == 'V') {
        first6chars = 'VERTEX';
      } else if (myelement == 'P') {
        first4chars = 'PART';
      } else if (myelement == 'f' || myelement == 'e' || myelement == 'v') {
        first6chars = 'SLICER';
      }
    }
    if (
      (mytype == 'PartSelection' ||
        mytype == 'PartSelection3D' ||
        mytype == 'MotionControlKinematicModelling') &&
      first4chars == 'PART'
    ) {
      return myName + '\u2003';
    } else if (mytype == 'FaceSelection' && first4chars == 'FACE') {
      return myName + '\u2003';
    } else if (
      mytype != 'PartSelection' &&
      mytype != 'PartSelection3D' &&
      mytype != 'MotionControlKinematicModelling' &&
      mytype != 'FaceSelection' &&
      first4chars == 'EDGE'
    ) {
      if (item.parentnode) {
        const myParentName = getNameWithFeatures(item.parentnode);
        if (myParentName) {
          return myParentName + '\u2003';
        } else {
          return myName + '\u2003';
        }
      } else {
        return myName + '\u2003';
      }
    } else {
      return '\u0020';
    }
  };
  const getComponents = (myvalue) => {
    //console.log('GetComponents1', myvalue);
    if (!myvalue) {
      return '\u0020';
    }
    //console.log('GetComponents2', myvalue);
    return myvalue.map((row, index) =>
      row
        ? row[gltf_Dict['name']]
          ? getMyName(row)
          : row + '\u2002'
        : '\u0020'
    );
  };
  const getNotEmpty = (myvalue) => {
    //console.log('GetNotEmpty1', myvalue);
    if (!myvalue) {
      return false;
    }
    //console.log('GetNotEmpty2', myvalue);
    for (let index = 0; index < myvalue.length; index++) {
      const item = myvalue[index];
      //console.log(item, mytype);
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
          if (myelement == 'F') {
            first4chars = 'FACE';
          } else if (myelement == 'E') {
            first4chars = 'EDGE';
          } else if (myelement == 'V') {
            first6chars = 'VERTEX';
          } else if (myelement == 'P') {
            first4chars = 'PART';
          } else if (myelement == 'f' || myelement == 'e' || myelement == 'v') {
            first6chars = 'SLICER';
          }
        }
        if (
          (mytype == 'PartSelection' ||
            mytype == 'PartSelection3D' ||
            mytype == 'MotionControlKinematicModelling') &&
          first4chars == 'PART'
        ) {
          return true;
        } else if (mytype == 'FaceSelection' && first4chars == 'FACE') {
          return true;
        } else if (
          mytype != 'PartSelection' &&
          mytype != 'PartSelection3D' &&
          mytype != 'MotionControlKinematicModelling' &&
          mytype != 'FaceSelection' &&
          first4chars == 'EDGE'
        ) {
          return true;
        }
      }
    }
    return false;
  };

  return (
    <>
      <Button
        aria-describedby={'Save Controls'}
        id={'popselect'}
        type="button"
        variant="contained"
        color={active && clicked ? 'primary' : 'inherit'}
        onClick={(event) => {
          const clickedState = !clicked;
          setClicked(clickedState);
          if (clickedState) {
            const myoption = getMyOption();

            setRenderData(myvalue, { name: mykey, option: myoption }, onChange);

            if (mytype === 'CircularFaceOrEdgeSelection') {
              setIsCircularFaceOrEdgeSelection(true);
            }
            onClick(mykey);
          } else {
            setRenderData(
              myvalue,
              { name: 'NoKey', option: SELECTFEATURE, onChange },
              null
            );
          }
        }}
      >
        {/* <div style={{background:active?"#A0A0A0":"#D0D0D0"}}> */}
        {getNotEmpty(myvalue)
          ? getComponents(myvalue)
          : 'Please select features'}

        {/* </div> */}
      </Button>
      {cylindrical_axis_of_rotation && (
        <FormGroup sx={{ flexDirection: 'row' }}>
          {Object.keys(cylindrical_axis_of_rotation).map((key) => (
            <FormControlLabel
              control={
                <Checkbox
                  // checked={key}
                  onChange={handleRotationalAxisChange}
                  name={key}
                />
              }
              label={key}
            />
          ))}
        </FormGroup>
      )}
    </>
  );
}
