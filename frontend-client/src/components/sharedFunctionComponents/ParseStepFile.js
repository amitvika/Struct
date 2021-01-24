import React, { Fragment, useState, useEffect } from "react";
import {
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  FormText,
  CustomInput
} from "reactstrap";
import { Button } from "@material-ui/core";
import axios from "axios";

export default function ParseStepFile({ display3DFile }) {
  const [stepFileElementCount, setStepFileElementCount] = useState();
  const [parsedStepFile, setParsedStepFile] = useState({});
  const [stepFileChildComponents, setStepFileChildComponents] = useState({});
  useEffect(() => {
    //findClosedShell();
    // console.log(parsedStepFile);
    display3DFile(parsedStepFile, stepFileElementCount);
  }, [parsedStepFile]);
  useEffect(() => {}, [stepFileChildComponents]);
  const getOneFile = () => {
    axios
      .get(`/api/upload/${"5ec74bfa312ab08288522a01"}`)
      .then(res => {
        parseStepFile(res.data);
        //display3DFile();   this function is an example of how to send stuff from components backwards
      })
      .catch(err => {
        console.log(err);
      });
  };

  const printStepFile = () => {
    console.log(parsedStepFile);
  };

  const parseStepFile = fS => {
    console.log("File Loaded");
    var parsingFile = fS.slice(fS.indexOf("DATA;") + 6, fS.length);
    var i = 0;
    var exitVar = 0;
    var stepElementObject = {};
    var elementDetails;
    var elementName;
    var elementDetail;
    var stepFileComponents = {};
    var x = [];
    var numIndexCurrent;
    var sec;
    var endElementIndex;
    var parsedElement;
    var firstPart;
    var secondPart;
    var lookback = 0;
    while (exitVar !== -1) {
      i++;
      if (i > 2000) {
        lookback = numIndexCurrent - 100000;
      } else {
        lookback = 0;
      }
      numIndexCurrent = parsingFile.indexOf(`#${i} =`, lookback);
      //previousNumIndexCurrent = numIndexCurrent;
      sec = parsingFile.substr(numIndexCurrent);
      endElementIndex = sec.indexOf(";");
      parsedElement = sec.slice(0, endElementIndex);

      var numIndexNext = parsingFile.indexOf(`#${i + 1} =`, lookback);
      if (numIndexNext === -1) {
        numIndexNext = parsingFile.indexOf(`ENDSEC;`);
        exitVar = -1;
      }
      //  console.log(numIndexCurrent);
      //console.log(parsedElement);
      stepElementObject[i] = preProcessString(parsedElement)[0];
      // if (i > 56000) {
      // console.log(stepElementObject[i]);
      // console.log(i);
      // }

      var transitionVar = stepElementObject[i][0];
      if (transitionVar.indexOf(" = ") !== -1) {
        stepElementObject[i][0] = transitionVar.slice(
          transitionVar.indexOf(" = ") + 3,
          transitionVar.length - 1
        );
      } else if (transitionVar.indexOf("#") !== -1) {
        // console.log(stepElementObject[i][0]);
        // console.log(stepElementObject[i][1][0]);
        stepElementObject[i][0] = stepElementObject[i][1][0];
      }

      // if (i === 30) {
      // exitVar = -1;
      //}
      if (i % 1000 === 0) {
        console.log(i);
      }
    }
    //console.log(stepElementObject);
    setStepFileElementCount(i);
    setParsedStepFile(stepElementObject);
    //setStepFileChildComponents(stepFileComponents);

    //display3DFile();
  };

  const findClosedShell = () => {
    var count = 0;
    for (var i = 1; i < stepFileElementCount; i++) {
      if (parsedStepFile[i][0] === "CLOSED_SHELL") {
        count++;
        parseClosedShell(i);
      }
    }
    /////dev error code
    if (count > 1) {
      console.log(
        "Error: There are " +
          count +
          " CLOSED_SHELL elements instead the expected count of 1."
      );
    }
  };

  const parseClosedShell = elementId => {
    console.log(parsedStepFile[elementId]);
    parsedStepFile[elementId][1][1][0].forEach(e => {
      parseAdvanceFace(e);
    });
  };

  const preProcessString = element => {
    var elementComponents = [];
    var part = "";
    var portion = "";
    var rS;
    var commaSepValues = [];
    var loopStop = true;
    while (true) {
      if (
        element.indexOf("(") < element.indexOf(")") &&
        element.indexOf("(") !== -1
      ) {
        commaSepValues = [];
        part = element.slice(0, element.indexOf("("));
        ////process part

        if (part.indexOf(",") !== -1) {
          loopStop = true;
          while (loopStop) {
            if (part.indexOf(",") === -1) {
              loopStop = false;
              ////////////////////////////

              part = part.slice(0, part.length - 1); ///
              if (part.indexOf("#") !== -1) {
                part = part.substr(2);
              }

              /////////////////////

              if (part !== "") {
                commaSepValues.push(part);
              }
            } else {
              //////////////////
              portion = part.slice(0, part.indexOf(",")); ////check thisss
              if (portion.indexOf("#") !== -1) {
                portion = portion.substr(2);
              }

              //////////////////////

              if (portion !== "") {
                commaSepValues.push(portion);
              }
            }
            part = part.substr(part.indexOf(",") + 1);
          }
          elementComponents.push(commaSepValues);
        } else {
          if (part !== "") {
            if (part.indexOf(" #") !== -1) {
              elementComponents.push(part.slice(2, part.length - 1));
            } else {
              elementComponents.push(part);
            }
          }
        }

        ////process part
        rS = preProcessString(element.substr(element.indexOf("(") + 1));
        elementComponents.push(rS[0]);
        element = rS[1];
      } else {
        commaSepValues = [];
        part = element.slice(0, element.indexOf(")"));

        ///////////////////
        if (part.indexOf(",") !== -1) {
          loopStop = true;
          while (loopStop) {
            if (part.indexOf(",") === -1) {
              loopStop = false;

              ////////////////////////////

              part = part.slice(0, part.length - 1); ///
              if (part.indexOf("#") !== -1) {
                part = part.substr(2);
              }

              /////////////////////

              if (part !== "") {
                commaSepValues.push(part);
              }
            } else {
              //   portion = part.slice(2, part.indexOf(",")); ////check thisss
              //////////////////
              portion = part.slice(0, part.indexOf(",")); ////check thisss
              if (portion.indexOf("#") !== -1) {
                portion = portion.substr(2);
              }

              //////////////////////

              if (portion !== "") {
                commaSepValues.push(portion);
              }
            }
            part = part.substr(part.indexOf(",") + 1);
          }
          elementComponents.push(commaSepValues);
        } else {
          if (part !== "") {
            if (part.indexOf(" #") !== -1) {
              elementComponents.push(part.slice(2, part.length - 1));
            } else {
              elementComponents.push(part);
            }
          }
        }
        ////process part

        return [elementComponents, element.substr(element.indexOf(")") + 1)];
      }
    }
    // return [elementComponents, element];
  };

  const parseAdvanceFace = elementId => {
    var myVar = parsedStepFile[elementId][1][1][0];
    if (typeof myVar === "string" || myVar instanceof String) {
      if (parsedStepFile[myVar][0] === "FACE_OUTER_BOUND") {
        parseFaceOuterBound(myVar);
      } else {
        console.log(
          "Advanced face Surface Edge argument does not match FACE_OUTER_BOUND.  Please see element: " +
            parsedStepFile[myVar]
        );
      }
    } else {
      myVar.forEach(e => {
        //console.log(parsedStepFile[e][0]);
        if (parsedStepFile[e][0] === "FACE_BOUND") {
          parseFaceBound(e);
        } else if (parsedStepFile[e][0] === "FACE_OUTER_BOUND") {
          parseFaceOuterBound(e);
        } else {
          console.log(
            "Advanced face Surface Edge argumentS does not match FACE_BOUND or FACE_OUTER_BOUND.  Please see element: " +
              parsedStepFile[e]
          );
        }
      });
    }
    ///surface arguments
    var myVar2 = parsedStepFile[elementId][1][2][0];
  };
  const parseFaceBound = elementId => {
    //console.log("FACE BOUND CHILD");
    var childElementIndex = parsedStepFile[elementId][1][0][1];
    if (parsedStepFile[childElementIndex][0] === "EDGE_LOOP") {
      parseEdgeLoop(childElementIndex);
    } else {
      console.log(
        "The child of FACE_BOUND elementID: " +
          elementId +
          ", is not an EDGE_LOOP.  Please see element: " +
          parsedStepFile[childElementIndex]
      );
    }
  };
  const parseFaceOuterBound = elementId => {
    var childElementIndex = parsedStepFile[elementId][1][0][1];
    if (parsedStepFile[childElementIndex][0] === "EDGE_LOOP") {
      parseEdgeLoop(childElementIndex);
    } else {
      console.log(
        "The child of FACE_OUTER_BOUND elementID: " +
          elementId +
          ", is not an EDGE_LOOP.  Please see element: " +
          parsedStepFile[childElementIndex]
      );
    }
  };
  const parseEdgeLoop = elementId => {
    var edgeLoopElement = parsedStepFile[elementId];
    edgeLoopElement[1][1][0].forEach(e => {
      if (parsedStepFile[e][0] === "ORIENTED_EDGE") {
        parseOrientedEdge(e);
      } else {
        console.log(
          "The child of EDGE_LOOP elementID: " +
            elementId +
            ", is not an ORIENTED_EDGE.  Please see element: " +
            parsedStepFile[e]
        );
      }
    });
  };
  const parseOrientedEdge = elementId => {
    var orientedEdgeElement = parsedStepFile[elementId];
    var childElementId = orientedEdgeElement[1][0][1];
    if (parsedStepFile[childElementId][0] === "EDGE_CURVE") {
      parseEdgeCurve(childElementId);
    } else {
      console.log(
        "The child of ORIENTED_EDGE elementID: " +
          elementId +
          ", is not an EDGE_CURVE.  Please see element: " +
          parsedStepFile[childElementId]
      );
    }
  };
  const parseEdgeCurve = elementId => {
    console.log(parsedStepFile[elementId][1][0][3]);
    console.log(parsedStepFile[parsedStepFile[elementId][1][0][3]]);
  };
  return (
    <Fragment>
      <Button style={{ marginLeft: "1%" }} color="primary" onClick={getOneFile}>
        Retrieve File From DB
      </Button>
    </Fragment>
  );
}
