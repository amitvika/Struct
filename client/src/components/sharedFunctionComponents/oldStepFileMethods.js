const parseStepFileElement = element => {
    //find space = space.  if not found use space =
    // console.log(element);
    var transitionElement;
    var parsedElementName;
    var parsedElementDetail;
    var start = element.indexOf(" = ");
    if (start !== -1) {
      transitionElement = element.slice(start + 3, element.length);
      parsedElementName = transitionElement.slice(
        0,
        transitionElement.indexOf(" ")
      );
      parsedElementDetail = transitionElement.slice(
        transitionElement.indexOf(" ") + 1,
        element.length
      );
    } else {
      start = element.indexOf(` =`);
      parsedElementName = element.slice(start + 2, element.length);
      parsedElementDetail = "";
    }

    //console.log(parsedElementName);
    // console.log(parsedElementDetail);
    return [parsedElementName, parsedElementDetail];
  };

  const findTermninationIndex = elementDetail => {
    var minIndex = 10000;
    if (
      elementDetail.indexOf(" ") < elementDetail.indexOf(",") ||
      elementDetail.indexOf(",") == -1
    ) {
      minIndex = elementDetail.indexOf(" ");
    } else {
      minIndex = elementDetail.indexOf(",");
    }
    return minIndex;
  };

  const parseClosedShell = () => {
    var closedShellElement = "";
    for (var i = 1; i < stepFileElementCount; i++) {
      if (parsedStepFile[i].elementName === "CLOSED_SHELL") {
        parseAdvancedFaces(
          parsedStepFile[i].elementDetail.slice(
            parsedStepFile[i].elementDetail.indexOf("(", 1) + 1,
            parsedStepFile[i].elementDetail.indexOf(")")
          )
        );
      }
    }
  };
  const parseAdvancedFaces = faces => {
    //console.log(faces);
    var slice = "";

    while (faces.indexOf("#") != -1) {
      if (faces.indexOf("#", faces.indexOf("#") + 1) != -1) {
        slice = faces.slice(
          faces.indexOf("#") + 1,
          faces.indexOf("#", faces.indexOf("#") + 1)
        );
        faces = faces.substr(faces.indexOf("#", faces.indexOf("#") + 1));
      } else {
        slice = faces.slice(1, faces.indexOf(" "));
        slice += ",";
        faces = faces.substr(faces.indexOf("#") + 1);
      }
      parseAdvanceFace(slice);
    }
  };
  const parseAdvanceFace = face => {
    //console.log(face);
    var slice = face.slice(0, face.indexOf(","));
    var elementDetail = parsedStepFile[slice].elementDetail;
    //console.log(elementDetail);
    var cutoff = "";
    var minIndex = 100000;
    var count = 1;
    while (elementDetail.indexOf("#") != -1) {
      elementDetail = elementDetail.substr(elementDetail.indexOf("#") + 1);
      if (elementDetail.indexOf(" ") < elementDetail.indexOf(",")) {
        minIndex = elementDetail.indexOf(" ");
      } else {
        minIndex = elementDetail.indexOf(",");
      }
      cutoff = elementDetail.slice(0, minIndex);

      if (count === 1) {
        parseFaceOuterBound(cutoff);
      } else if (count === 2) {
        parsePlane(cutoff);
      }
      count++;
    }
  };

  const parseFaceOuterBound = elementId => {
    // console.log(parsedStepFile[elementId].elementName);
    //console.log(parsedStepFile[elementId].elementDetail);
    var cutoff = "";
    var minIndex = 100000;
    var elementDetail = parsedStepFile[elementId].elementDetail;
    elementDetail = elementDetail.substr(elementDetail.indexOf("#") + 1);
    if (
      elementDetail.indexOf(" ") < elementDetail.indexOf(",") ||
      elementDetail.indexOf(",") == -1
    ) {
      minIndex = elementDetail.indexOf(" ");
    } else {
      minIndex = elementDetail.indexOf(",");
    }
    cutoff = elementDetail.slice(0, minIndex);
    //console.log(cutoff);
    //console.log(parsedStepFile[cutoff].elementDetail);
    parseEdgeLoop(cutoff);
  };

  const parsePlane = elementId => {
    var cutoff = "";
    var minIndex = 100000;
    var elementDetail = parsedStepFile[elementId].elementDetail;
    elementDetail = elementDetail.substr(elementDetail.indexOf("#") + 1);
    if (
      elementDetail.indexOf(" ") < elementDetail.indexOf(",") ||
      elementDetail.indexOf(",") == -1
    ) {
      minIndex = elementDetail.indexOf(" ");
    } else {
      minIndex = elementDetail.indexOf(",");
    }
    cutoff = elementDetail.slice(0, minIndex);
    parseAxis2Placement3D(cutoff);
  };

  const parseEdgeLoop = elementId => {
    //console.log(parsedStepFile[elementId].elementName);
    // console.log(parsedStepFile[elementId].elementDetail);
    var elementDetail = parsedStepFile[elementId].elementDetail;

    var cutoff = "";
    var minIndex = 100000;
    var count = 1;
    while (elementDetail.indexOf("#") != -1) {
      elementDetail = elementDetail.substr(elementDetail.indexOf("#") + 1);
      if (
        elementDetail.indexOf(" ") < elementDetail.indexOf(",") ||
        elementDetail.indexOf(",") == -1
      ) {
        minIndex = elementDetail.indexOf(" ");
      } else {
        minIndex = elementDetail.indexOf(",");
      }
      cutoff = elementDetail.slice(0, minIndex);

      /*if (count === 1) {
     parseFaceOuterBound(cutoff);
   } else if (count === 2) {
     parsePlane(cutoff);
   }
   count++;*/
      //console.log("edge loop");
      //console.log(parsedStepFile[cutoff].elementName);
      parseOrientedEdge(cutoff);
    }
  };
  const parseAxis2Placement3D = elementId => {
    //console.log(parsedStepFile[elementId].elementName);
    // console.log(parsedStepFile[elementId].elementDetail);
    var elementDetail = parsedStepFile[elementId].elementDetail;

    var cutoff = "";
    var minIndex = 100000;
    var count = 1;
    while (elementDetail.indexOf("#") != -1) {
      elementDetail = elementDetail.substr(elementDetail.indexOf("#") + 1);
      if (
        elementDetail.indexOf(" ") < elementDetail.indexOf(",") ||
        elementDetail.indexOf(",") == -1
      ) {
        minIndex = elementDetail.indexOf(" ");
      } else {
        minIndex = elementDetail.indexOf(",");
      }
      cutoff = elementDetail.slice(0, minIndex);

      if (count === 1) {
        parseCartesianPoint(cutoff);
      } else if (count > 1) {
        parseDirection(cutoff);
      }
      count++;
      //console.log("3d");
      // console.log(parsedStepFile[cutoff].elementName);
    }
  };
  const parseOrientedEdge = elementId => {
    //console.log("OrientedEdge");
    //console.log(parsedStepFile[elementId].elementDetail);
    var cutoff = "";
    var minIndex = 100000;
    var elementDetail = parsedStepFile[elementId].elementDetail;
    elementDetail = elementDetail.substr(elementDetail.indexOf("#") + 1);
    if (
      elementDetail.indexOf(" ") < elementDetail.indexOf(",") ||
      elementDetail.indexOf(",") == -1
    ) {
      minIndex = elementDetail.indexOf(" ");
    } else {
      minIndex = elementDetail.indexOf(",");
    }
    cutoff = elementDetail.slice(0, minIndex);
    //console.log(parsedStepFile[cutoff].elementDetail);
    parseEdgeCurve(cutoff);
  };

  const parseCartesianPoint = elementId => {
    console.log("CartesianPoint");
    console.log(parsedStepFile[elementId].elementDetail);
  };
  const parseDirection = elementId => {
    console.log("Direction");
    console.log(parsedStepFile[elementId].elementDetail);
  };
  const parseEdgeCurve = elementId => {
    var elementDetail = parsedStepFile[elementId].elementDetail;

    var cutoff = "";
    var minIndex = 100000;
    var count = 1;
    while (elementDetail.indexOf("#") != -1) {
      elementDetail = elementDetail.substr(elementDetail.indexOf("#") + 1);
      if (
        elementDetail.indexOf(" ") < elementDetail.indexOf(",") ||
        elementDetail.indexOf(",") == -1
      ) {
        minIndex = elementDetail.indexOf(" ");
      } else {
        minIndex = elementDetail.indexOf(",");
      }
      cutoff = elementDetail.slice(0, minIndex);

      if (count <= 2) {
        // console.log("Vertext Point");
        // console.log(parsedStepFile[cutoff].elementName);
        parseVertexPoint(cutoff);
      } else if (count > 2) {
        // console.log("Line");
        // console.log(parsedStepFile[cutoff].elementName);
        parseLine(cutoff);
      }
      count++;
    }
  };

  const parseVertexPoint = elementId => {
    var cutoff = "";
    var minIndex = 100000;
    var elementDetail = parsedStepFile[elementId].elementDetail;
    elementDetail = elementDetail.substr(elementDetail.indexOf("#") + 1);
    if (
      elementDetail.indexOf(" ") < elementDetail.indexOf(",") ||
      elementDetail.indexOf(",") == -1
    ) {
      minIndex = elementDetail.indexOf(" ");
    } else {
      minIndex = elementDetail.indexOf(",");
    }
    cutoff = elementDetail.slice(0, minIndex);
    //console.log(parsedStepFile[cutoff].elementDetail);
    //console.log("from vertext point");
    parseCartesianPoint(cutoff);
  };
  const parseLine = elementId => {
    var elementDetail = parsedStepFile[elementId].elementDetail;

    var cutoff = "";
    var minIndex = 100000;
    var count = 1;
    while (elementDetail.indexOf("#") != -1) {
      elementDetail = elementDetail.substr(elementDetail.indexOf("#") + 1);
      if (
        elementDetail.indexOf(" ") < elementDetail.indexOf(",") ||
        elementDetail.indexOf(",") == -1
      ) {
        minIndex = elementDetail.indexOf(" ");
      } else {
        minIndex = elementDetail.indexOf(",");
      }
      cutoff = elementDetail.slice(0, minIndex);

      if (count === 1) {
        // console.log("Vertext Point");
        // console.log(parsedStepFile[cutoff].elementName);
        parseCartesianPoint(cutoff);
      } else if (count > 1) {
        // console.log("Line");
        // console.log(parsedStepFile[cutoff].elementName);
        parseVector(cutoff);
      }
      count++;
    }
  };
  const findStepFileChildComponents = () => {
    var elementDetail;
    var cutoff = "";
    var minIndex = 100000;
    var count = 1;
    for (var i = 1; i <= stepFileElementCount; i++) {
      elementDetail = parsedStepFile[i].elementDetail;
      cutoff = "";
      minIndex = 100000;
      count = 1;

      console.log("Parent");
      console.log(parsedStepFile[i].elementName);
      console.log("Children");

      while (elementDetail.indexOf("#") != -1) {
        elementDetail = elementDetail.substr(elementDetail.indexOf("#") + 1);
        if (
          elementDetail.indexOf(" ") < elementDetail.indexOf(",") ||
          elementDetail.indexOf(",") == -1
        ) {
          minIndex = elementDetail.indexOf(" ");
        } else {
          minIndex = elementDetail.indexOf(",");
        }
        cutoff = elementDetail.slice(0, minIndex);

        console.log(parsedStepFile[cutoff].elementName);
      }

      console.log("-----------------");
    }
  };
  const parseVector = elementId => {
    var cutoff = "";
    var minIndex = 100000;
    var elementDetail = parsedStepFile[elementId].elementDetail;
    elementDetail = elementDetail.substr(elementDetail.indexOf("#") + 1);
    if (
      elementDetail.indexOf(" ") < elementDetail.indexOf(",") ||
      elementDetail.indexOf(",") == -1
    ) {
      minIndex = elementDetail.indexOf(" ");
    } else {
      minIndex = elementDetail.indexOf(",");
    }
    cutoff = elementDetail.slice(0, minIndex);
    //console.log(parsedStepFile[cutoff].elementDetail);
    //console.log("from vertext point");
    parseDirection(cutoff);
  };
  const findChildElements = () => {
    //console.log(stepFileChildComponents);
    var elementDetail;
    var cutoff = "";
    var minIndex = 100000;
    var count = 1;
    var keyList = Object.keys(stepFileChildComponents);
    var freqObj = {};
    keyList.forEach(e => {
      //console.log("top");
      // console.log(e);
      freqObj[e] = {};
      stepFileChildComponents[e].forEach(i => {
        //console.log(parsedStepFile[i].elementDetail);////use the element detail here to map the counts of each

        ///////////////////////////////////////////////////////////////

        elementDetail = parsedStepFile[i].elementDetail;
        cutoff = "";
        minIndex = 100000;
        count = 1;
        while (elementDetail.indexOf("#") != -1) {
          elementDetail = elementDetail.substr(elementDetail.indexOf("#") + 1);
          if (
            elementDetail.indexOf(" ") < elementDetail.indexOf(",") ||
            elementDetail.indexOf(",") == -1
          ) {
            minIndex = elementDetail.indexOf(" ");
          } else {
            minIndex = elementDetail.indexOf(",");
          }
          cutoff = elementDetail.slice(0, minIndex);

          //console.log(parsedStepFile[cutoff].elementName);

          freqObj[e][parsedStepFile[cutoff].elementName] = cutoff;
        }

        ////////////////////////////////////////////////////
      });
      //console.log("bottom");
    });
    console.log(freqObj);
    //console.log(Object.keys(stepFileChildComponents));
  };
