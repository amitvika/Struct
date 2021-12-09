import React, { Component, Fragment, useState, useEffect } from "react";

import * as THREE from "three";
import ParseStepFile from "./ParseStepFile";

import { Button } from "@mui/material";
import { NURBSCurve } from "../../ThreeJSFunctionalElements/NURBSCurve.js";
import { NURBSSurface } from "../../ThreeJSFunctionalElements/NURBSSurface.js";

var STLLoader = require("three-stl-loader")(THREE);
var OrbitControls = require("three-orbit-controls")(THREE);
class ThreeDViewer extends Component {
  state = {
    threed: "file",
    bCurveCnt: 0
  };
  componentWillUnmount() {
    //window.removeEventListener("resize", this.handleWindowResize);
    window.cancelAnimationFrame(this.requestID);
    this.controls.dispose();
  }
  componentDidMount() {
    console.log(this.state.threed);
    const scene = new THREE.Scene();
    this.scene = scene;
    this.groups = [];
    this.camera = new THREE.PerspectiveCamera(
      10,
      window.innerWidth / window.innerHeight,
      0.1,
      1000000
    );
    this.camera.position.x = 3000;
    var light1 = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(light1);
    var light2 = new THREE.PointLight(0xffffff, 1, 100);
    light2.position.set(50, 50, 50);
    this.scene.add(light2);
    var light3 = new THREE.DirectionalLight(0xffffff, 0.5);
    //light3.position.set(50, 50, 50);
    this.scene.add(light3);
    var light4 = new THREE.DirectionalLight(0xffffff, 0.5);
    light4.position.set(-100, -50, -50);
    this.scene.add(light4);

    var canvas = document.querySelector("#editor");
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.5,
      roughness: 0.5
    });
    this.material.side = THREE.DoubleSide;
    this.geometry = new THREE.SphereBufferGeometry(0.1, 32, 32);
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    var axesHelper = new THREE.AxesHelper(100);
    axesHelper.position.set(0, 0, 0);
    this.scene.add(axesHelper);
    //The X axis is red. The Y axis is green. The Z axis is blue.
    /*
    var paraFunction = function(a, b, target) {
      var x = -5 + 5 * a;
      var y = -5 + 5 * b;
      var z = (Math.sin(a * Math.PI) + Math.sin(b * Math.PI)) * -7;

      target.set(x, y, z);

      // console.log(target);
    };
    var paraGeometry = new THREE.ParametricGeometry(paraFunction, 8, 8);
    var paraMaterial = new THREE.MeshLambertMaterial({ color: 0xf3ffe2 });
    var paraMesh = new THREE.Mesh(paraGeometry, paraMaterial);
    this.scene.add(paraMesh);*/

    this.animate();
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
    var windowAspectRatio = window.innerHeight / window.innerWidth; //used to actively resize the canvas when it is changed in size
    var container = document.getElementById("container"); //used to actively resize the canvas when it is changed in size
    if (container !== null) {
      this.renderer.setSize(
        container.clientWidth,
        container.clientWidth * windowAspectRatio
      ); //used to actively resize the canvas when it is changed in size
    }
  };

  getParsedStepFileForDisplay = (parsedStepFile, stepFileElementCount) => {
    if (Object.keys(parsedStepFile).length !== 0) {
      this.findClosedShell(parsedStepFile, stepFileElementCount);
    }
    console.log("# of Surfaces: ");
    console.log(this.groups.length);

    var faceNum = 0; ////use this to select which faces to print
    var selector = 3;
    var singleGeometry = new THREE.Geometry();
    if (selector === 0) {
      try {
        console.log(
          "-------------------SINGLE SURFACE DIAGNOSTICS---------------------s"
        );
        console.log("Chosen Surface Number: " + faceNum);
        console.log("Surface Type");
        console.log(this.groups[faceNum][5]);
        console.log("Outerbounds");
        console.log(this.groups[faceNum][1]);
        console.log("twoDPointCloud right after insertion of edges ");
        console.log(this.groups[faceNum][4]);
        console.log("twoDPointCloud");
        console.log(this.groups[faceNum][2]);
        console.log("twoDSurfaceCloud");
        console.log(this.groups[faceNum][3]);
        this.scene.add(this.groups[faceNum][0]);
      } catch (err) {
        console.log(err);
      }
    } else if (selector === 1) {
      try {
        console.log("Number of Faces:");
        console.log(this.groups.length);
        var totalTriangleCount = 0;

        this.groups.forEach(e => {
          console.log("This face triangle count:");
          console.log(e[6]);
          totalTriangleCount = e[6] + totalTriangleCount;
          
          for (var i = 0; i < e[7].length; i++) {
            var mesh = new THREE.Mesh(e[7][i]);
            mesh.updateMatrix();
            singleGeometry.merge(mesh.geometry, mesh.matrix);
          }
        });
        console.log("Total triangle count per object:");
        console.log(totalTriangleCount);
        var objCount = 50;
        for (var i = 0; i < objCount; i++) {
          var closedShell = new THREE.Mesh(singleGeometry, this.material);
          closedShell.position.set(
            Math.random() * 1000,
            Math.random() * 1000,
            Math.random() * 1000
          );
          closedShell.rotation.set(
            Math.random() * 1000,
            Math.random() * 1000,
            Math.random() * 1000
          );
          this.scene.add(closedShell);
        }
        console.log("Total triangle count:");
        console.log(totalTriangleCount * objCount);
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        console.log("Number of Faces:");
        console.log(this.groups.length);
        var totalTriangleCount = 0;

        this.groups.forEach(e => {
          console.log("This face triangle count:");
          console.log(e[6]);
          totalTriangleCount = e[6] + totalTriangleCount;
          for (var i = 0; i < e[7].length; i++) {
            var mesh = new THREE.Mesh(e[7][i]);
            mesh.updateMatrix();
            singleGeometry.merge(mesh.geometry, mesh.matrix);
          }
        });
        var closedShell = new THREE.Mesh(singleGeometry, this.material);
        this.scene.add(closedShell);
      } catch (err) {
        console.log(err);
      }
    }
  };
  findClosedShell = (parsedStepFile, stepFileElementCount) => {
    var count = 0;
    for (var i = 1; i < stepFileElementCount; i++) {
      if (parsedStepFile[i][0] === "CLOSED_SHELL") {
        count++;
        this.parseClosedShell(i, parsedStepFile);
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

  parseClosedShell = (elementId, parsedStepFile) => {
    var count = 1;
    parsedStepFile[elementId][1][1][0].forEach(e => {
      //e === "539"  ||
      //if (e === "870") {
      this.parseAdvanceFace(e, parsedStepFile);
      // }
      count++;
    });
  };

  parseAdvanceFace = (elementId, parsedStepFile) => {
    console.log(elementId);
    console.log(parsedStepFile[elementId]);
    var myVar = parsedStepFile[elementId][1][1][0];
    var myVar2 = parsedStepFile[elementId][1][2][0];

    if (parsedStepFile[myVar2][0] === "PLANE") {
      ////////////////////////////PLANE/////////////
      console.log("Adv Face: Parsing a PLANE");
      //Check if third argument is a plane. if so, use the edge bounds to add a shape to the scene
      if (typeof myVar === "string" || myVar instanceof String) {
        if (parsedStepFile[myVar][0] === "FACE_OUTER_BOUND") {
          console.log("Adv Face: parsing FACE_OUTER_BOUND of PLANE");
          var outerBoundPointList = this.parseFaceOuterBound(
            myVar,
            parsedStepFile
          );
          this.addPlanarFaceToScene(outerBoundPointList, null);
        } else {
          console.log(
            "Advanced face Surface Edge argument does not match FACE_OUTER_BOUND.  Please see element: " +
              parsedStepFile[myVar]
          );
        }
      } else {
        var innerBoundPointListArray = [];
        var outerBoundPointList;
        myVar.forEach(e => {
          if (parsedStepFile[e][0] === "FACE_BOUND") {
            console.log("Adv Face: parsing FACE_BOUND of PLANE");
            innerBoundPointListArray.push(
              this.parseFaceBound(e, parsedStepFile)
            );
          } else if (parsedStepFile[e][0] === "FACE_OUTER_BOUND") {
            console.log("Adv Face: parsing FACE_OUTER_BOUND of PLANE");
            outerBoundPointList = this.parseFaceOuterBound(e, parsedStepFile);
          } else {
            console.log(
              "Advanced face Surface Edge argumentS does not match FACE_BOUND or FACE_OUTER_BOUND.  Please see element: " +
                parsedStepFile[e]
            );
          }
        });
        this.addPlanarFaceToScene(
          outerBoundPointList,
          innerBoundPointListArray
        );
      }
      ///surface arguments
    } else if (parsedStepFile[myVar2][0] === " BOUNDED_SURFACE ") {
      ////////////////////////////BOUNDED SURFACE///////////////////////////////
      console.log("Adv Face: Parsing a BOUNDED_SURFACE");

      console.log(
        "The above bounded surface has the following as FACE_OUTER_BOUND and FACE_BOUND arguments: "
      );
      var outerBounds;
      if (typeof myVar === "string" || myVar instanceof String) {
        console.log("BOUNDED_SURFACE: parsing FACE_OUTER_BOUND");
        outerBounds = this.parseFaceOuterBound(myVar, parsedStepFile);
      } else {
        myVar.forEach(e => {
          if (parsedStepFile[e][0] === "FACE_BOUND") {
            console.log("BOUNDED_SURFACE: parsing FACE_BOUND");
            console.log(this.parseFaceBound(e, parsedStepFile));
          } else if (parsedStepFile[e][0] === "FACE_OUTER_BOUND") {
            console.log("BOUNDED_SURFACE: parsing FACE_OUTER_BOUND");
            console.log(this.parseFaceOuterBound(e, parsedStepFile));
          } else {
            console.log(
              "Advanced face Surface Edge argumentS does not match FACE_BOUND or FACE_OUTER_BOUND.  Please see element: " +
                parsedStepFile[e]
            );
          }
        });
      }
      this.groups.push(
        this.parseCurvedBoundedSurface(myVar2, parsedStepFile, outerBounds, 1)
      );
    } else if (parsedStepFile[myVar2][0] === "B_SPLINE_SURFACE_WITH_KNOTS") {
      ////////////////////////////B_SPLINE_SURFACE_WITH_KNOTS/////////////
      console.log("Adv Face: Parsing a B_SPLINE_SURFACE_WITH_KNOTS");
      //this.parseBSplineSurfaceWithKnots(myVar2, parsedStepFile);
      var outerBounds;
      if (typeof myVar === "string" || myVar instanceof String) {
        console.log("BOUNDED_SURFACE: parsing FACE_OUTER_BOUND");
        outerBounds = this.parseFaceOuterBound(myVar, parsedStepFile);
      } else {
        myVar.forEach(e => {
          if (parsedStepFile[e][0] === "FACE_BOUND") {
            console.log("BOUNDED_SURFACE: parsing FACE_BOUND");
            console.log(this.parseFaceBound(e, parsedStepFile));
          } else if (parsedStepFile[e][0] === "FACE_OUTER_BOUND") {
            console.log("BOUNDED_SURFACE: parsing FACE_OUTER_BOUND");
            console.log(this.parseFaceOuterBound(e, parsedStepFile));
          } else {
            console.log(
              "Advanced face Surface Edge argumentS does not match FACE_BOUND or FACE_OUTER_BOUND.  Please see element: " +
                parsedStepFile[e]
            );
          }
        });
      }
      this.groups.push(
        this.parseCurvedBoundedSurface(myVar2, parsedStepFile, outerBounds, 2)
      );
    } else if (parsedStepFile[myVar2][0] === "CYLINDRICAL_SURFACE") {
      ////////////////////////////CYLINDRICAL_SURFACE/////////////
      console.log("Adv Face: Parsing a CYLINDRICAL_SURFACE");
      if (typeof myVar === "string" || myVar instanceof String) {
        var circleElements = this.parseFaceOuterBound(myVar, parsedStepFile);
        console.log("Cylindrical surfac edge info: ");
        console.log(circleElements);
        // this.parseCylindricalSurface(myVar2, parsedStepFile, circleElements);
        //console.log(this.parseFaceOuterBound(myVar, parsedStepFile));
      }
      //
    } else {
      console.log(
        "The face argument of ADVANCED_FACE Id: " +
          elementId +
          ", is not a PLANE or  BOUNDED_SURFACE . Please see element: "
      );
      console.log(parsedStepFile[myVar2]);
    }
  };

  parseCylindricalSurface = (elementId, parsedStepFile, circleElements) => {
    //console.log(elementId);
    //console.log(parsedStepFile[elementId]);
    console.log(circleElements);
    var element = parsedStepFile[elementId];
    var radius = element[1][0][2];
    var xDiff =
      parseFloat(circleElements[3][1][0][0]) -
      parseFloat(circleElements[1][1][0][0]);
    var yDiff =
      parseFloat(circleElements[3][1][0][1]) -
      parseFloat(circleElements[1][1][0][1]);
    var zDiff =
      parseFloat(circleElements[3][1][0][2]) -
      parseFloat(circleElements[1][1][0][2]);

    var depth = Math.pow(
      Math.pow(xDiff, 2) + Math.pow(yDiff, 2) + Math.pow(zDiff, 2),
      0.5
    );
    console.log(depth);

    var extrudeSettings = {
      depth: depth,
      steps: 1,
      bevelEnabled: false,
      curveSegments: 1000
    };

    var arcShape = new THREE.Shape();

    arcShape.absarc(0, 0, radius, 0, Math.PI * 2, 0, false);

    var holePath = new THREE.Path();
    holePath.absarc(0, 0, radius - 0.00001, 0, Math.PI * 2, true);
    arcShape.holes.push(holePath);

    var geometry = new THREE.ExtrudeGeometry(arcShape, extrudeSettings);

    var object = new THREE.Mesh(geometry, this.material);

    var angle1 = new THREE.Vector3(
      circleElements[1][1][1][0],
      circleElements[1][1][1][1],
      circleElements[1][1][1][2]
    );

    object.lookAt(angle1);

    object.position.x = parseFloat(circleElements[3][1][0][0]);
    object.position.y = parseFloat(circleElements[3][1][0][1]);
    object.position.z = parseFloat(circleElements[3][1][0][2]);

    this.scene.add(object);
    /**/

    //var arcShape = new THREE.Shape();
    //  var radius = 100;

    //  var geometry = new THREE.CircleGeometry(radius, 1000);
    // var object = new THREE.Mesh(geometry, this.material);

    //this.scene.add(object);

    //point = this.parseCartesianPoint(element[1][0][1], parsedStepFile);
  };

  parseCurvedBoundedSurface = (
    elementId,
    parsedStepFile,
    outerBounds,
    type
  ) => {
    var stepFileComponent = parsedStepFile[elementId][1];
    var ctrlPointArray = [];
    var knots1 = [];
    var knots2 = [];
    var rawKnots1;
    var rawKnots2;
    var knot1Multiplicities;
    var knot2Multiplicities;
    var fullPointCloud = [];
    var degree1;
    var degree2;
    var controlPoints;
    var grp = new THREE.Group();
    var geometryList = [];
    if (type === 1) {
      degree1 = parseInt(stepFileComponent[3][0][0]);
      degree2 = parseInt(stepFileComponent[3][0][1]);
      controlPoints = stepFileComponent[3][1];
      knot1Multiplicities = stepFileComponent[5][1][0];
      rawKnots1 = stepFileComponent[5][5][0];
      knot2Multiplicities = stepFileComponent[5][3][0];
      rawKnots2 = stepFileComponent[5][7][0];
    } else {
      degree1 = parseInt(stepFileComponent[0][1]);
      degree2 = parseInt(stepFileComponent[0][2]);
      controlPoints = stepFileComponent[1];
      knot1Multiplicities = stepFileComponent[3][0];
      rawKnots1 = stepFileComponent[7][0];
      knot2Multiplicities = stepFileComponent[5][0];
      rawKnots2 = stepFileComponent[9][0];
    }

    controlPoints.forEach(e => {
      if (typeof e[0] === "object") {
        var ctrlPointArrayRow = [];
        var point;
        e[0].forEach(x => {
          point = this.parseCartesianPoint(x, parsedStepFile);
          ctrlPointArrayRow.push(
            new THREE.Vector3(
              parseFloat(point[0]),
              parseFloat(point[1]),
              parseFloat(point[2])
            )
          );
        }); /**/
        ctrlPointArray.push(ctrlPointArrayRow);
      }
    });

    for (var i = 0; i < rawKnots2.length; i++) {
      for (var x = 0; x < knot2Multiplicities[i]; x++) {
        knots2.push(parseFloat(rawKnots2[i]));
      }
    }
    for (var i = 0; i < rawKnots1.length; i++) {
      for (var x = 0; x < knot1Multiplicities[i]; x++) {
        knots1.push(parseFloat(rawKnots1[i]));
      }
    }
    var nurbsSurface = new NURBSSurface(
      degree1,
      degree2,
      knots1,
      knots2,
      ctrlPointArray
    );
    function getSurfacePoint(u, v, target) {
      var target1 = new THREE.Vector3();
      target1.x = target.x;
      target1.y = target.y;
      target1.z = target.z;
      fullPointCloud.push(target1);
      return nurbsSurface.getPoint(u, v, target);
    }
    var rowLength = 25;
    var geometry = new THREE.ParametricBufferGeometry(
      getSurfacePoint,
      rowLength,
      400 //40 for nurbs blob
    );
    var pc = new THREE.Mesh(geometry, this.material);
   //   this.scene.add(pc); 
    var y = 0;
    var twoDPointCloud = [];
    twoDPointCloud.push([]);
    fullPointCloud.splice(0, 1);
    for (var i = 0; i < fullPointCloud.length; i++) {
      twoDPointCloud[y].push([fullPointCloud[i], "S"]);
      // console.log(twoDPointCloud[y][twoDPointCloud[y].length-1]);
      if (i % (rowLength * 3 + 3) === 0) {
        // console.log("moving to next line");
        twoDPointCloud.push([]);
        y++;
      }
    }
    twoDPointCloud.shift();
    for (var a = 0; a < twoDPointCloud.length; a++) {
      var cnt = 0;
      for (var b = 0; b < twoDPointCloud[a].length; b++) {
        if (cnt % 3 != 0) {
          twoDPointCloud[a].splice(b, 1);
          b--;
        }
        cnt++;
      }
    }

    ///////////////////////////
    var dist;
    var distSum = 0;
    var outerBoundsDistTable = [];
    for (var c = 0; c < outerBounds.length; c++) {
      if (outerBounds[c].length === 2) {
        outerBounds[c].push(this.parseLine(outerBounds[c]));
      }

      if (outerBounds[c].length === 3) {
        outerBoundsDistTable.push([]);
        for (var d = 1; d < outerBounds[c][2].length; d++) {
          dist = Math.sqrt(
            Math.pow(outerBounds[c][2][d - 1].x - outerBounds[c][2][d].x, 2) +
              Math.pow(outerBounds[c][2][d - 1].y - outerBounds[c][2][d].y, 2) +
              Math.pow(outerBounds[c][2][d - 1].z - outerBounds[c][2][d].z, 2)
          );
          outerBoundsDistTable[outerBoundsDistTable.length - 1].push(dist);
        }
      }
      //outerBounds[c].push(distSum/(outerBounds[c][2].length-1));
      // distSum=0;
    }
    console.log("Outer Bounds Distance Table");
    console.log(outerBoundsDistTable);
    //////////////////////////////////////
    var surfacePointsDistTable = [];
    var dist;
    for (var a = 0; a < twoDPointCloud.length; a++) {
      surfacePointsDistTable.push([]);
      for (var b = 0; b < twoDPointCloud[a].length; b++) {
        if (b === 0) {
          ////console.log(twoDPointCloud[a][b-1][0]);
          //console.log(twoDPointCloud[a][b][0]);

          twoDPointCloud[a].splice(0, 1);

          continue;
        }
        dist = Math.sqrt(
          Math.pow(
            twoDPointCloud[a][b - 1][0].x - twoDPointCloud[a][b][0].x,
            2
          ) +
            Math.pow(
              twoDPointCloud[a][b - 1][0].y - twoDPointCloud[a][b][0].y,
              2
            ) +
            Math.pow(
              twoDPointCloud[a][b - 1][0].z - twoDPointCloud[a][b][0].z,
              2
            )
        );
        // console.log(dist);
        surfacePointsDistTable[surfacePointsDistTable.length - 1].push(dist);
      }
    }
    console.log("Surface Points Distance Table");
    console.log(surfacePointsDistTable);
    /////////////////////new edge placement algorithm
    for (var c = 0; c < outerBounds.length; c++) {
      if (outerBounds[c].length === 2) {
        /*
   
    outerBounds[c].push(this.parseLine(outerBounds[c]));*/
      }
      if (outerBounds[c].length === 3) {
        for (var d = 0; d < outerBounds[c][2].length; d++) {
          var index = 100;
          var min1 = 1000000;
          var min1LocA;
          var min1LocB;
          var min2 = 1000000;
          var min2LocA;
          var min2LocB;
          var dist = 10000000;
          var added = false;
          // var avg=0;
          // var lastAvg=0;
          for (var a = 0; a < twoDPointCloud.length; a++) {
            var avg = 0;
            var lastAvg = 0;
            var lastLastAvg = 0;
            for (var b = 0; b < twoDPointCloud[a].length; b++) {
              if (twoDPointCloud[a][b][1] === "E") {
                continue;
              }
              dist = Math.sqrt(
                Math.pow(
                  twoDPointCloud[a][b][0].x - outerBounds[c][2][d].x,
                  2
                ) +
                  Math.pow(
                    twoDPointCloud[a][b][0].y - outerBounds[c][2][d].y,
                    2
                  ) +
                  Math.pow(
                    twoDPointCloud[a][b][0].z - outerBounds[c][2][d].z,
                    2
                  )
              );
              var offset1 = 0;
              var offset2 = 0;
              if (b === surfacePointsDistTable[a].length) {
                offset1 = 1;
              }
              if (d === outerBoundsDistTable[c].length) {
                offset2 = 1;
              }
              if (
                dist < surfacePointsDistTable[a][b - offset1] ||
                dist < outerBoundsDistTable[c][d - offset2]
              ) {
                if (dist < min1) {
                  min1LocA = a;
                  min1LocB = b;
                  min1 = dist;
                  added = true;
                }
                // twoDPointCloud[a].splice(b , 0, [outerBounds[c][2][d], "E"]);
              }
            }
          }
          //console.log();

          if (added) {
            twoDPointCloud[min1LocA].splice(min1LocB, 0, [
              outerBounds[c][2][d],
              "E"
            ]);
          }
        }
      }
    }
    console.log("twoDPointCloud Right After Edge Insertion");
    var distanceBWEdges = 0;
    for (var a = 0; a < twoDPointCloud.length; a++) {
      distanceBWEdges = 0;
      for (var b = 0; b < twoDPointCloud[a].length; b++) {
        if (twoDPointCloud[a][b][1] === "S") {
          distanceBWEdges++;
          twoDPointCloud[a][b].push(distanceBWEdges);
        } else {
          distanceBWEdges = 0;
        }
      }
    }

    for (var a = 0; a < twoDPointCloud.length; a++) {
      distanceBWEdges = 0;
      for (var b = twoDPointCloud[a].length - 1; b >= 0; b--) {
        if (twoDPointCloud[a][b][1] === "S") {
          distanceBWEdges++;
          //twoDPointCloud[a][b].push(distanceBWEdges);
          if (twoDPointCloud[a][b][2] > distanceBWEdges) {
            twoDPointCloud[a][b][2] = distanceBWEdges;
          }
        } else {
          distanceBWEdges = 0;
        }
      }
    }
    var gridAfterEdgeInsertion = [];

    for (var a = 0; a < twoDPointCloud.length; a++) {
      gridAfterEdgeInsertion.push([]);

      for (var b = 0; b < twoDPointCloud[a].length; b++) {
        gridAfterEdgeInsertion[gridAfterEdgeInsertion.length - 1].push(
          twoDPointCloud[a][b]
        );
      }
    }
    console.log(gridAfterEdgeInsertion);

    var twoDistanceToE = 0;
    var edgeIntersectionCnt = 0;
    var firstELoc = -1;
    var surfaceArray = [];
    var inSurfaceTerritory = false;
    var lastE = 10000000;
    var tempTwoDPointCloud = [];
    var lastTwo = false;
    var eTrigger = false;
    for (var a = 0; a < twoDPointCloud.length; a++) {
      firstELoc = -1;
      lastE = 10000000;
      inSurfaceTerritory = false;
      surfaceArray = [];
      lastTwo = -12;

      eTrigger = false;
      for (var b = 0; b < twoDPointCloud[a].length; b++) {
        //turn surface mode on

        if (twoDPointCloud[a][b][1] === "E") {
          eTrigger = true;
        }
        if (twoDPointCloud[a][b][1] === "S" && eTrigger) {
          if (twoDPointCloud[a][b][2] === 2) {
            if (b - lastTwo < 40) {
              eTrigger = false;
              inSurfaceTerritory = !inSurfaceTerritory;
            }
          }
        }

        if (twoDPointCloud[a][b][1] === "S") {
          if (twoDPointCloud[a][b][2] === 2) {
            lastTwo = b;
          }
        }

        //add surface points to array when surface mode is on
        if (inSurfaceTerritory && twoDPointCloud[a][b][1] === "S") {
          if (twoDPointCloud[a][b][2] >= 2) {
            surfaceArray.push(b);
          }
        }
      }
      // console.log(surfaceArray);
      if (surfaceArray.length > 0) {
        tempTwoDPointCloud.push([]);
        surfaceArray.forEach(l => {
          tempTwoDPointCloud[tempTwoDPointCloud.length - 1].push(
            twoDPointCloud[a][l]
          );
        });
      }
    }
    twoDPointCloud = tempTwoDPointCloud;

    /**/
    var twoDSurfaceCloud = [];
    var aPrime = 0;
    for (var a = 0; a < twoDPointCloud.length; a++) {
      if (twoDPointCloud[a].length === 0) {
        continue;
      }
      twoDSurfaceCloud.push([]);

      for (var b = 0; b < twoDPointCloud[a].length; b++) {
        if (twoDPointCloud[a][b][1] === "S") {
          twoDSurfaceCloud[twoDSurfaceCloud.length - 1].push(
            twoDPointCloud[a][b]
          );
        }
      }

      if (twoDSurfaceCloud[twoDSurfaceCloud.length - 1].length === 0) {
        twoDSurfaceCloud.pop();
      }
    }

    //twoDPointCloud Dots
    ////////inserted edge points/////////
    /*
    var vertices = [];
    for (var a = 0; a < twoDPointCloud.length; a++) {
      if (twoDPointCloud[a].length === 0) {
        break;
      }
      for (var b = 0; b < twoDPointCloud[a].length - 1; b++) {
        if (twoDPointCloud[a][b][1] === "S") {
          continue;
        }
        vertices.push(
          twoDPointCloud[a][b][0].x,
          twoDPointCloud[a][b][0].y,
          twoDPointCloud[a][b][0].z
        );
      }
    }
    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    var material = new THREE.PointsMaterial({ color: 0xfc0303 });
    var points = new THREE.Points(geometry, material);
    // this.scene.add(points);/
    grp.add(points);
    geometryList.push(geometry);

    ////////ALl edge points/////////
*/
    var vertices = [];
    for (var a = 0; a < outerBounds.length; a++) {
      for (var b = 0; b < outerBounds[a][2].length - 1; b++) {
        vertices.push(
          outerBounds[a][2][b].x,
          outerBounds[a][2][b].y,
          outerBounds[a][2][b].z
        );
      }
    }
    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    var material = new THREE.PointsMaterial({ color: 0xfc0303 });
    var points = new THREE.Points(geometry, material);
     this.scene.add(points); 
    //grp.add(points);
    //geometryList.push(geometry);

    ////////////////twoDSurfaceCloud Dots
/*
    var vertices = [];
    for (var a = 0; a < twoDSurfaceCloud.length; a++) {
      for (var b = 0; b < twoDSurfaceCloud[a].length; b++) {
        vertices.push(
          twoDSurfaceCloud[a][b][0].x,
          twoDSurfaceCloud[a][b][0].y,
          twoDSurfaceCloud[a][b][0].z
        );
      }
    }
    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    var material = new THREE.PointsMaterial({ color: 0x5efc03 });
    var points = new THREE.Points(geometry, material);
    // this.scene.add(points);///////////////////////////////////////
    grp.add(points);
    geometryList.push(geometry);

    /* */
    console.log("Outerbounds");
    console.log(outerBounds);
    console.log("twoDPointCloud");
    console.log(twoDPointCloud);
    console.log("twoDSurfaceCloud");
    console.log(twoDSurfaceCloud);
    //create internal surface triangles
    var triangleCount = 0;
/*
    for (var a = 0; a < twoDSurfaceCloud.length - 1; a++) {
      for (var b = 0; b < twoDSurfaceCloud[a].length - 1; b++) {
        if (b <= twoDSurfaceCloud[a + 1].length - 1) {
          var geometry = new THREE.Geometry();
          geometry.vertices.push(twoDSurfaceCloud[a][b][0]);
          geometry.vertices.push(twoDSurfaceCloud[a][b + 1][0]);
          geometry.vertices.push(twoDSurfaceCloud[a + 1][b][0]);
          var face = new THREE.Face3(0, 1, 2);
          geometry.faces.push(face);
          geometry.computeFaceNormals();
          geometry.computeVertexNormals();
          //geometry = new THREE.BufferGeometry().fromGeometry(geometry);
          //  this.scene.add(new THREE.Mesh(geometry, this.material));////////////////////////////
          // grp.add(new THREE.Mesh(geometry, this.material));
          geometryList.push(geometry);
          triangleCount++;
        }
        if (b + 1 <= twoDSurfaceCloud[a + 1].length - 1) {
          var geometry = new THREE.Geometry();
          geometry.vertices.push(twoDSurfaceCloud[a + 1][b][0]);
          geometry.vertices.push(twoDSurfaceCloud[a + 1][b + 1][0]);
          geometry.vertices.push(twoDSurfaceCloud[a][b + 1][0]);
          var face = new THREE.Face3(0, 1, 2);
          geometry.faces.push(face);
          geometry.computeFaceNormals();
          geometry.computeVertexNormals();
          //geometry = new THREE.BufferGeometry().fromGeometry(geometry);
          // this.scene.add(new THREE.Mesh(geometry, this.material));//////////////////////////////////////
          // grp.add(new THREE.Mesh(geometry, this.material));
          geometryList.push(geometry);
          triangleCount++;
        }
        if (
          twoDSurfaceCloud[a + 1].length > twoDSurfaceCloud[a].length &&
          b === twoDSurfaceCloud[a].length - 2
        ) {
          var geometry = new THREE.Geometry();
          var tempLen = twoDSurfaceCloud[a + 1].length - 1;
          geometry.vertices.push(twoDSurfaceCloud[a + 1][tempLen][0]);
          geometry.vertices.push(twoDSurfaceCloud[a + 1][tempLen - 1][0]);
          geometry.vertices.push(twoDSurfaceCloud[a][b + 1][0]);
          var face = new THREE.Face3(0, 1, 2);
          geometry.faces.push(face);
          geometry.computeFaceNormals();
          geometry.computeVertexNormals();
          // geometry = new THREE.BufferGeometry().fromGeometry(geometry);
          //  this.scene.add(new THREE.Mesh(geometry, this.material));//////////////////////////////
          //grp.add(new THREE.Mesh(geometry, this.material));
          geometryList.push(geometry);
          triangleCount++;
        }
      }
    }

    var min = 10000000;
    var dist1 = 1000000;
    var dist2 = 1000000;
    var arrayLen = 100000;
    var minRow = 1000000;
    var minCol = 1000000;
    var edgeSurfacePtList = [];
    for (var c = 0; c < outerBounds.length; c++) {
      if (outerBounds[c].length === 2) {
        //   for (var d = 0; d < outerBounds[c].length; d++) {  }
      } else if (outerBounds[c].length === 3) {
        for (var d = 0; d < outerBounds[c][2].length; d++) {
          min = 1000000;
          for (var a = 0; a < twoDSurfaceCloud.length; a++) {
            if (a === twoDSurfaceCloud.length - 1) {
              for (var b = 0; b < twoDSurfaceCloud[a].length; b++) {
                dist1 = Math.sqrt(
                  Math.pow(
                    twoDSurfaceCloud[a][b][0].x - outerBounds[c][2][d].x,
                    2
                  ) +
                    Math.pow(
                      twoDSurfaceCloud[a][b][0].y - outerBounds[c][2][d].y,
                      2
                    ) +
                    Math.pow(
                      twoDSurfaceCloud[a][b][0].z - outerBounds[c][2][d].z,
                      2
                    )
                );

                if (dist1 < min) {
                  min = dist1;
                  minRow = a;
                  minCol = b;
                }
              }
            } else {
              dist1 = Math.sqrt(
                Math.pow(
                  twoDSurfaceCloud[a][0][0].x - outerBounds[c][2][d].x,
                  2
                ) +
                  Math.pow(
                    twoDSurfaceCloud[a][0][0].y - outerBounds[c][2][d].y,
                    2
                  ) +
                  Math.pow(
                    twoDSurfaceCloud[a][0][0].z - outerBounds[c][2][d].z,
                    2
                  )
              );
              arrayLen = twoDSurfaceCloud[a].length - 1;
              dist2 = Math.sqrt(
                Math.pow(
                  twoDSurfaceCloud[a][arrayLen][0].x - outerBounds[c][2][d].x,
                  2
                ) +
                  Math.pow(
                    twoDSurfaceCloud[a][arrayLen][0].y - outerBounds[c][2][d].y,
                    2
                  ) +
                  Math.pow(
                    twoDSurfaceCloud[a][arrayLen][0].z - outerBounds[c][2][d].z,
                    2
                  )
              );
              if (dist1 < min) {
                min = dist1;
                minRow = a;
                minCol = 0;
              }
              if (dist2 < min) {
                min = dist2;
                minRow = a;
                minCol = arrayLen;
              }
            }
          }

          edgeSurfacePtList.push([
            outerBounds[c][2][d],
            twoDSurfaceCloud[minRow][minCol][0],
            minRow,
            minCol
          ]);
        }
      }
    }
    //  console.log(edgeSurfacePtList);
    var x = -1;
    var y = -1;
    var z = -1;

    for (var i = 0; i < edgeSurfacePtList.length - 1; i++) {
      if (
        i > 0 &&
        (x !== edgeSurfacePtList[i][1].x ||
          y !== edgeSurfacePtList[i][1].y ||
          z !== edgeSurfacePtList[i][1].z)
      ) {
        var geometry = new THREE.Geometry();
        geometry.vertices.push(edgeSurfacePtList[i - 1][1]);
        geometry.vertices.push(edgeSurfacePtList[i][1]);
        geometry.vertices.push(edgeSurfacePtList[i][0]);
        var face = new THREE.Face3(0, 1, 2);
        geometry.faces.push(face);
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        // geometry = new THREE.BufferGeometry().fromGeometry(geometry);
        // this.scene.add(new THREE.Mesh(geometry, this.material));//////////////////////////////////
        //grp.add(new THREE.Mesh(geometry, this.material));
        geometryList.push(geometry);
        triangleCount++;
      }
      x = edgeSurfacePtList[i][1].x;
      y = edgeSurfacePtList[i][1].y;
      z = edgeSurfacePtList[i][1].z;
      var geometry = new THREE.Geometry();
      geometry.vertices.push(edgeSurfacePtList[i][0]);
      geometry.vertices.push(edgeSurfacePtList[i][1]);
      geometry.vertices.push(edgeSurfacePtList[i + 1][0]);
      var face = new THREE.Face3(0, 1, 2);
      geometry.faces.push(face);
      geometry.computeFaceNormals();
      geometry.computeVertexNormals();
      // geometry = new THREE.BufferGeometry().fromGeometry(geometry);
      // this.scene.add(new THREE.Mesh(geometry, this.material));////////////////////////////
      // grp.add(new THREE.Mesh(geometry, this.material));
      geometryList.push(geometry);
      triangleCount++;
      // this.scene.add(grp);
    }     
    return [
      grp,
      outerBounds,
      twoDPointCloud,
      twoDSurfaceCloud,
      gridAfterEdgeInsertion,
      "Bounded NURBS Surface",
      triangleCount,
      geometryList
    ];
    */
  };

  parseAxis2Placement3D = (elementId, parsedStepFile) => {
    // console.log(elementId);
    // console.log(parsedStepFile[elementId]);
    var element = parsedStepFile[elementId];
    var direction1 = element[1][0][2];
    var direction2 = element[1][0][3];
    var center = element[1][0][1];
    var returnElements = [];
    if (parsedStepFile[center][0] === "CARTESIAN_POINT") {
      returnElements.push(this.parseCartesianPoint(center, parsedStepFile));
    } else {
      console.log(
        "The first child of Axis2Placement3D elementID: " +
          elementId +
          ", is not a CARTESIAN_POINT.  Please see element: " +
          parsedStepFile[center]
      );
    }
    if (parsedStepFile[direction1][0] === "DIRECTION") {
      returnElements.push(this.parseDirection(direction1, parsedStepFile));
    } else {
      console.log(
        "The second child of Axis2Placement3D elementID: " +
          elementId +
          ", is not a DIRECTION.  Please see element: " +
          parsedStepFile[direction1]
      );
    }
    if (parsedStepFile[direction2][0] === "DIRECTION") {
      returnElements.push(this.parseDirection(direction2, parsedStepFile));
    } else {
      console.log(
        "The thirdchild of Axis2Placement3D elementID: " +
          elementId +
          ", is not a DIRECTION.  Please see element: " +
          parsedStepFile[direction2]
      );
    }
    return returnElements;
  };
  parseDirection = (elementId, parsedStepFile) => {
    //  console.log(elementId);
    // console.log(parsedStepFile[elementId]);
    var element = parsedStepFile[elementId];
    return [
      parseFloat(element[1][1][0][0]),
      parseFloat(element[1][1][0][1]),
      parseFloat(element[1][1][0][2])
    ];
  };

  parsePlane = (elementId, parsedStepFile) => {
    // console.log(elementId);
    // console.log(parsedStepFile[elementId]);
    var childElementIndex = parsedStepFile[elementId][1][0][1].substr(1);
    if (parsedStepFile[childElementIndex][0] === "AXIS2_PLACEMENT_3D") {
      this.parseAxis2Placement3D(childElementIndex, parsedStepFile);

      // console.log("axis element found");
    } else {
      console.log(
        "The child of PLANE elementID: " +
          elementId +
          ", is not an AXIS2_PLACEMENT_3D.  Please see element: " +
          parsedStepFile[childElementIndex]
      );
    }
  };
  orderPointsToEdgeLoop = faceOuterBoundPoints => {
    //console.log("face outer bound points");
    // console.log(faceOuterBoundPoints);
    var facePts = [];
    var currentLine = 0;
    ////probably need to figure out how to add curves that are not at index 0
    //old code 7.12.2020 12.56am
    /*
    if (faceOuterBoundPoints[0].length > 2) {
      facePts.push(faceOuterBoundPoints[0][0]);

      faceOuterBoundPoints[0][2].forEach(element => {
        facePts.push([element.x, element.y, element.z]);
      });

      facePts.push(faceOuterBoundPoints[0][1]);

    }else{


      facePts.push(faceOuterBoundPoints[0][0]);
      facePts.push(faceOuterBoundPoints[0][1]);
    }*/
    facePts.push(faceOuterBoundPoints[0][0]);
    if (faceOuterBoundPoints[0].length > 2) {
      faceOuterBoundPoints[0][2].forEach(element => {
        facePts.push([element.x, element.y, element.z]);
      });
    }

    facePts.push(faceOuterBoundPoints[0][1]);

    /*if (faceOuterBoundPoints[0].length > 5) {
      facePts.push(faceOuterBoundPoints[0][0]);

      faceOuterBoundPoints[0][2].forEach(element => {
        facePts.push([element.x, element.y, element.z]);
      });

      facePts.push(faceOuterBoundPoints[0][1]);

    }else{


      
    }*/

    var i = 0;
    while (
      JSON.stringify(facePts[0]) !== JSON.stringify(facePts[facePts.length - 1])
    ) {
      while (true) {
        if (
          JSON.stringify(facePts[facePts.length - 1]) ===
            JSON.stringify(faceOuterBoundPoints[i][0]) &&
          i !== currentLine
        ) {
          ///if faceOuterBountPoints[i].length>2, insert all of the points in via loop
          if (faceOuterBoundPoints[i].length > 2) {
            faceOuterBoundPoints[i][2].forEach(element => {
              facePts.push([element.x, element.y, element.z]);
            });
          }
          facePts.push(faceOuterBoundPoints[i][1]);
          currentLine = i;
          i = 0;
          break;
        } else if (
          JSON.stringify(facePts[facePts.length - 1]) ===
            JSON.stringify(faceOuterBoundPoints[i][1]) &&
          i !== currentLine
        ) {
          ///if faceOuterBountPoints[i].length>2, insert all of the points in via loop
          //  faceOuterBoundPoints[i][2].forEach(element => {
          //    facePts.push([element.x, element.y, element.z]);
          // });
          if (faceOuterBoundPoints[i].length > 2) {
            for (var r = faceOuterBoundPoints[i][2].length - 1; r >= 0; r--) {
              facePts.push([
                faceOuterBoundPoints[i][2][r].x,
                faceOuterBoundPoints[i][2][r].y,
                faceOuterBoundPoints[i][2][r].z
              ]);
            }
          }
          facePts.push(faceOuterBoundPoints[i][0]);
          currentLine = i;
          i = 0;
          break;
        }
        i++;
      }
    }
    // console.log(facePts);
    if (faceOuterBoundPoints[0].length > 2) {
      facePts.shift();
    }
    // console.log(facePts);
    return facePts;
  };
  translatePointOneToOrigin = (facePts, facePts2) => {
    var translationScalar = facePts[0];
    translationScalar[0] = parseFloat(translationScalar[0]);
    translationScalar[1] = parseFloat(translationScalar[1]);
    translationScalar[2] = parseFloat(translationScalar[2]);

    var facePts = facePts.map(element => {
      return [
        parseFloat(element[0]) - translationScalar[0],
        parseFloat(element[1]) - translationScalar[1],
        parseFloat(element[2]) - translationScalar[2]
      ];
    });

    if (facePts2 !== null) {
      facePts2 = facePts2.map(element1 => {
        return element1.map(element => {
          return [
            parseFloat(element[0]) - translationScalar[0],
            parseFloat(element[1]) - translationScalar[1],
            parseFloat(element[2]) - translationScalar[2]
          ];
        });
      });
    }
    return [facePts, translationScalar, facePts2];
  };

  rotatePoints = (points, crossP, angle) => {
    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(crossP, angle);
    const rotatedPoints = [];
    var count = 0;
    points.forEach(element => {
      const q = element.applyQuaternion(quaternion);
      rotatedPoints.push(q);
    });
    return rotatedPoints;
  };

  addPlanarFaceToScene = (faceOuterBoundPoints, faceBoundPoints) => {
    ///Step0: Order edge points in a loop
    //console.log(faceOuterBoundPoints);

    var facePts;
    var faceOBPtsVectors;
    var faceIBPtsVectors;

    facePts = this.orderPointsToEdgeLoop(faceOuterBoundPoints);
    if (faceBoundPoints !== null) {
      var facePts2 = [];
      faceBoundPoints.forEach(element => {
        facePts2.push(this.orderPointsToEdgeLoop(element));
      });
    }
    // console.log("Facepts2");
    //console.log(facePts2);

    //  facePts = this.orderPointsToEdgeLoop(faceOuterBoundPoints);
    //  console.log("Untranslated points: ");
    // console.log(facePts);
    ///Step1: Translate vector from original position to origin using first point
    if (faceBoundPoints !== null) {
      ///inner face
      var translated = this.translatePointOneToOrigin(facePts, facePts2);
    } else {
      // console.log("Facepts: ");
      // console.log(facePts);
      var translated = this.translatePointOneToOrigin(facePts, null);
    }

    var translationScalar = translated[1];
    if (faceBoundPoints !== null) {
      // console.log(translationScalar);
    }

    var translatedPoints = translated[0];

    ///inner face
    var translatedInnerFace = translated[2];

    //console.log("Translated inner face: ");
    // console.log(translatedInnerFace);
    ///Step2: rotate figure such that index=1 point is on the x axis
    /////step2.1: convert index=1 point to vector3

    var vectorOne = new THREE.Vector3(
      translatedPoints[1][0],
      translatedPoints[1][1],
      translatedPoints[1][2]
    );
    var vectorOne1 = new THREE.Vector3(
      translatedPoints[1][0],
      translatedPoints[1][1],
      translatedPoints[1][2]
    );
    /////step2.2: convert x axis unit vector to vector3

    var unitXVector = new THREE.Vector3(1, 0, 0);
    /////step2.3: get cross product of the two above vectors to use as xis to rotate the first axis onto the x axis
    var crossProductVector = vectorOne.cross(unitXVector);
    crossProductVector = crossProductVector.normalize(); //normalize the cross product for sake of quaternion

    /////step2.4: get angle between x unit vector and index=1 vector
    var angleBetweenVectors = vectorOne1.angleTo(unitXVector);
    /////step2.5: rotate shape with angle and normalized cross product
    var translatedPoints1 = [];
    ///inner face
    var translatedInnerFace1 = [];

    translatedPoints1 = translatedPoints.map(element => {
      return new THREE.Vector3(element[0], element[1], element[2]);
    });
    ///inner face
    if (faceBoundPoints !== null) {
      translatedInnerFace1 = translatedInnerFace.map(element1 => {
        return element1.map(element => {
          return new THREE.Vector3(element[0], element[1], element[2]);
        });
      });
    }
    // console.log("Translated points converted to vector3: ");
    // console.log(translatedPoints1);
    // console.log(crossProductVector);
    //  console.log(unitXVector1);
    // console.log(vectorOne);
    // console.log(angleBetweenVectors);

    var rotatedTranslatedPoints = [];

    var rotatedTranslatedInnerFacePoints = [];

    //  console.log("before index 1 rotation: ");
    //  console.log(rotatedTranslatedInnerFacePoints);

    if (translatedPoints1[1].y === 0 && translatedPoints1[1].z === 0) {
      rotatedTranslatedPoints = translatedPoints1;
      ///inner face
      rotatedTranslatedInnerFacePoints = translatedInnerFace1;
      angleBetweenVectors = 0;
    } else {
      rotatedTranslatedPoints = this.rotatePoints(
        translatedPoints1,
        crossProductVector,
        angleBetweenVectors
      );

      ///inner face

      if (faceBoundPoints !== null) {
        rotatedTranslatedInnerFacePoints = translatedInnerFace1.map(element => {
          return this.rotatePoints(
            element,
            crossProductVector,
            angleBetweenVectors
          );
        });
      }
    }
    //// console.log("index 1 rotation onto x axis");
    // console.log(rotatedTranslatedPoints);

    //console.log("after index 1 rotation: ");
    //console.log(rotatedTranslatedInnerFacePoints);

    ///Step3: rotate figure about x axis such that index=2 vector yz component is parallel to y axis
    /////step3.1: convert y axis unit vector to vector3
    //var unitYVector = new THREE.Vector3(0, -1, 0);
    var unitYVector = new THREE.Vector3(0, rotatedTranslatedPoints[2].y, 0);
    unitYVector = unitYVector.normalize();

    var projectedYAxisVector = new THREE.Vector3(
      0,
      rotatedTranslatedPoints[2].y,
      rotatedTranslatedPoints[2].z
    );
    //  console.log(rotatedTranslatedPoints[2]);
    //  console.log(projectedYAxisVector);
    //  console.log(unitYVector);
    //var angleBetweenVectors2 = projectdYAxisVector.angleTo(unitYVector);

    var angleBetweenVectors2 = unitYVector.angleTo(projectedYAxisVector);
    // console.log(angleBetweenVectors2);

    var unitXVector2 = new THREE.Vector3(rotatedTranslatedPoints[2].x, 0, 0);
    unitXVector2 = unitXVector2.normalize();
    // console.log(unitXVector2);
    var trialPoint = [];

    var trialVector = new THREE.Vector3(
      rotatedTranslatedPoints[2].x,
      rotatedTranslatedPoints[2].y,
      rotatedTranslatedPoints[2].z
    );
    trialPoint.push(trialVector);
    var trialOutput = this.rotatePoints(
      trialPoint,
      unitXVector2,
      angleBetweenVectors2
    );
    //console.log(trialOutput);
    if (trialOutput[0].z > 0.000001 || trialOutput[0].z < -0.000001) {
      angleBetweenVectors2 = -angleBetweenVectors2;
    }
    //  console.log(angleBetweenVectors2);
    //  console.log(rotatedTranslatedPoints);

    var rotatedTranslatedPoints2 = this.rotatePoints(
      rotatedTranslatedPoints,
      unitXVector2,
      angleBetweenVectors2
    );

    ///inner face
    var rotatedTranslatedInnerFacePoints2;

    if (faceBoundPoints !== null) {
      rotatedTranslatedInnerFacePoints2 = rotatedTranslatedInnerFacePoints.map(
        element => {
          return this.rotatePoints(element, unitXVector2, angleBetweenVectors2);
        }
      );
    }

    //console.log(rotatedTranslatedInnerFacePoints2);
    // console.log("Rotation of index 2 point on to xy  axis: ");
    // console.log(rotatedTranslatedPoints2);

    var facePtsVectors = [];
    rotatedTranslatedPoints2.forEach(p => {
      facePtsVectors.push(new THREE.Vector2(p.x, p.y));
    });

    faceOBPtsVectors = facePtsVectors;
    //console.log(faceOBPtsVectors);
    var faceShape = new THREE.Shape(faceOBPtsVectors);
    // console.log(faceShape);
    var holeShape;
    if (faceBoundPoints !== null) {
      rotatedTranslatedInnerFacePoints2.forEach(q => {
        var facePtsVectorsInnerFace = [];
        q.forEach(p => {
          facePtsVectorsInnerFace.push(new THREE.Vector2(p.x, p.y));
        });
        holeShape = new THREE.Shape(facePtsVectorsInnerFace);
        faceShape.holes.push(holeShape);
      });
    }

    //faceShape.holes.push( hole );
    //var geometry = new THREE.ShapeGeometry(faceShape);

    var extrudeSettings = {
      depth: 0,
      bevelEnabled: false
    };

    // var geometry = new THREE.ExtrudeBufferGeometry(faceShape, extrudeSettings);

    var geometry = new THREE.ShapeGeometry(faceShape);
    var mesh = new THREE.Mesh(geometry, this.material);

    // console.log(unitXVector2);
    //console.log(crossProductVector);

    mesh.rotateOnAxis(crossProductVector, -angleBetweenVectors);
    mesh.rotateOnAxis(unitXVector2, -angleBetweenVectors2);

    mesh.position.set(
      mesh.position.x + translationScalar[0],
      mesh.position.y + translationScalar[1],
      mesh.position.z + translationScalar[2]
    );
    this.scene.add(mesh); /* */
  };

  parseFaceBound = (elementId, parsedStepFile) => {
    //console.log(elementId);
    // console.log(parsedStepFile[elementId]);
    var childElementIndex = parsedStepFile[elementId][1][0][1];
    if (parsedStepFile[childElementIndex][0] === "EDGE_LOOP") {
      return this.parseEdgeLoop(childElementIndex, parsedStepFile);
    } else {
      console.log(
        "The child of FACE_BOUND elementID: " +
          elementId +
          ", is not an EDGE_LOOP.  Please see element: " +
          parsedStepFile[childElementIndex]
      );
    }
  };
  parseFaceOuterBound = (elementId, parsedStepFile) => {
    // console.log(elementId);
    //console.log(parsedStepFile[elementId]);
    var childElementIndex = parsedStepFile[elementId][1][0][1];
    if (parsedStepFile[childElementIndex][0] === "EDGE_LOOP") {
      return this.parseEdgeLoop(childElementIndex, parsedStepFile);
    } else {
      console.log(
        "The child of FACE_OUTER_BOUND elementID: " +
          elementId +
          ", is not an EDGE_LOOP.  Please see element: " +
          parsedStepFile[childElementIndex]
      );
    }
  };
  parseEdgeLoop = (elementId, parsedStepFile) => {
    //console.log(elementId);
    //console.log(parsedStepFile[elementId]);
    var edgeLoopElement = parsedStepFile[elementId];
    var orientedEdgeList = [];
    edgeLoopElement[1][1][0].forEach(e => {
      if (parsedStepFile[e][0] === "ORIENTED_EDGE") {
        //console.log(parsedStepFile[e]);
        orientedEdgeList.push(this.parseOrientedEdge(e, parsedStepFile));
      } else {
        console.log(
          "The child of EDGE_LOOP elementID: " +
            elementId +
            ", is not an ORIENTED_EDGE.  Please see element: " +
            parsedStepFile[e]
        );
      }
    });
    return orientedEdgeList;
  };
  parseOrientedEdge = (elementId, parsedStepFile) => {
    //console.log(elementId);
    // console.log(parsedStepFile[elementId]);
    var orientedEdgeElement = parsedStepFile[elementId];
    // console.log(elementId);
    //console.log(orientedEdgeElement);
    var childElementId = orientedEdgeElement[1][0][3];

    if (parsedStepFile[childElementId][0] === "EDGE_CURVE") {
      return this.parseEdgeCurve(childElementId, parsedStepFile);
    } else {
      console.log(
        "The child of ORIENTED_EDGE elementID: " +
          elementId +
          ", is not an EDGE_CURVE.  Please see element: " +
          parsedStepFile[childElementId]
      );
    }
  };
  parseEdgeCurve = (elementId, parsedStepFile) => {
    //console.log(elementId);
    //console.log(parsedStepFile[elementId]);
    var endPoints = [];
    var element = parsedStepFile[elementId][1][0];
    if (parsedStepFile[element[1]][0] === "VERTEX_POINT") {
      endPoints.push(this.parseVertexPoint(element[1], parsedStepFile));
    } else {
      console.log(
        "The first child of EDGE_CURVE elementID: " +
          elementId +
          ", is not a VERTEX_POINT.  Please see element: " +
          parsedStepFile[element[1]]
      );
    }

    if (parsedStepFile[element[2]][0] === "VERTEX_POINT") {
      endPoints.push(this.parseVertexPoint(element[2], parsedStepFile));
    } else {
      console.log(
        "The second child of EDGE_CURVE elementID: " +
          elementId +
          ", is not a VERTEX_POINT.  Please see element: " +
          parsedStepFile[element[2]]
      );
    }

    if (parsedStepFile[element[3]][0] === "B_SPLINE_CURVE_WITH_KNOTS") {
      console.log("Edge Curve: Parsing a B_SPLINE_CURVE_WITH_KNOTS edge");
      endPoints.push(this.parseBoundedCurve(element[3], parsedStepFile, 2));
    } else if (parsedStepFile[element[3]][0] === " BOUNDED_CURVE ") {
      console.log("Edge Curve: Parsing a BOUNDED_CURVE edge");
      endPoints.push(this.parseBoundedCurve(element[3], parsedStepFile, 1));
      console.log(endPoints);
    } else if (parsedStepFile[element[3]][0] === "CIRCLE") {
      console.log("Edge Curve: Parsing a CIRCLE edge");
      // return this.parseCircle(element[3], parsedStepFile); ////get radius, position and direction

      //parse circle to points
      // console.log();
    } else if (parsedStepFile[element[3]][0] === "LINE") {
      console.log("Edge Curve: Parsing a LINE edge");
      // endPoints.push(this.parseLine(endPoints));
    } else {
      console.log(
        "The third child of EDGE_CURVE elementID: " +
          elementId +
          ", is not a LINE, B_SPLINE_CURVE_WITH_KNOTS, BOUNDED_CURVE, or a CIRCLE.  Please see element: " +
          parsedStepFile[element[3]][0]
      );
    }

    return endPoints;
    // console.log(parsedStepFile[parsedStepFile[elementId][1][0][1]]);
    // console.log(parsedStepFile[parsedStepFile[elementId][1][0][2]]);
    //console.log(parsedStepFile[parsedStepFile[elementId][1][0][3]]);

    // console.log(parsedStepFile[parsedStepFile[elementId][1][0][3]]);
  };
  parseLine = endPoints => {
    var pointList = [];
    var numPoints = 20;
    var dX = (endPoints[0][0] - endPoints[1][0]) / numPoints;
    var dY = (endPoints[0][1] - endPoints[1][1]) / numPoints;
    var dZ = (endPoints[0][2] - endPoints[1][2]) / numPoints;
    // console.log(dX);
    //console.log(dY);
    // console.log(dZ);
    for (var i = 1; i <= numPoints - 1; i++) {
      pointList.push(
        new THREE.Vector3(
          endPoints[0][0] - dX * i,
          endPoints[0][1] - dY * i,
          endPoints[0][2] - dZ * i
        )
      );
    }
    return pointList;
  };

  parseCircle = (elementId, parsedStepFile) => {
    //console.log(elementId);
    // console.log(parsedStepFile[elementId]);
    var element = parsedStepFile[elementId];
    var returnElements = [];
    var radius = parseFloat(element[1][0][2]);
    var axis3D = this.parseAxis2Placement3D(element[1][0][1], parsedStepFile);
    //console.log(axis3D);
    returnElements.push(radius);
    returnElements.push(axis3D);
    // return returnElements;
  };

  parseBoundedCurve = (elementId, parsedStepFile, type) => {
    var element = parsedStepFile[elementId];
    var degree;
    var rawControlPoints;

    var knotMultiplicities;
    var rawKnots;

    if (type === 1) {
      degree = parseInt(element[1][3][0][0]);
      rawControlPoints = element[1][3][1][0];
      knotMultiplicities = element[1][5][1][0];
      rawKnots = element[1][5][3][0];
    } else {
      degree = parseInt(element[1][0][1]);
      rawControlPoints = element[1][1][0];

      knotMultiplicities = element[1][3][0];
      rawKnots = element[1][5][0];
    }

    var ctrlPointArray = [];

    var knots = [];
    var point;

    rawControlPoints.forEach(x => {
      point = this.parseCartesianPoint(x, parsedStepFile);
      ctrlPointArray.push(
        new THREE.Vector3(
          parseFloat(point[0]),
          parseFloat(point[1]),
          parseFloat(point[2])
        )
      );
    });

    for (var i = 0; i < rawKnots.length; i++) {
      for (var x = 0; x < knotMultiplicities[i]; x++) {
        knots.push(parseFloat(rawKnots[i]));
      }
    }
    var nurbsCurve = new NURBSCurve(degree, knots, ctrlPointArray);
    var nurbsGeometry = new THREE.BufferGeometry();
    console.log("Spline Curve Calc");
    console.log("Knots");
    console.log(knots);
    console.log("Degree");
    console.log(degree);
    console.log("Ctrl Points");
    console.log(ctrlPointArray);
    console.log("Ctrl Points");
    console.log(ctrlPointArray);


    console.log("Nurbs Points (3JS Code)");
    console.log(nurbsCurve.getPoints(20));

    console.log("Spline Curve Calc End");

    //console.log(nurbsCurve.getPoints(20));
    return nurbsCurve.getPoints(350);
    /* */
  };

  parseVertexPoint = (elementId, parsedStepFile) => {
    // console.log(elementId);
    // console.log(parsedStepFile[elementId]);
    var childElementId = parsedStepFile[elementId][1][0][1];
    //console.log(parsedStepFile[elementId]);
    if (parsedStepFile[childElementId][0] === "CARTESIAN_POINT") {
      return this.parseCartesianPoint(childElementId, parsedStepFile);
    } else {
      console.log(
        "The child of VERTEX_POINT elementID: " +
          elementId +
          ", is not a CARTESIAN_POINT.  Please see element: " +
          parsedStepFile[childElementId]
      );
    }
  };
  parseCartesianPoint = (elementId, parsedStepFile) => {
    var childData = parsedStepFile[elementId][1][1][0];
    //console.log(elementId);
    //console.log(parsedStepFile[elementId]);
    //  console.log(childData[0] + ", " + childData[1] + ", " + childData[2]);
    //var mesh = new THREE.Mesh(this.geometry, this.material);

    //mesh.position.set(childData[0], childData[1], childData[2]);
    // this.scene.add(mesh);
    return [childData[0], childData[1], childData[2]];  
  };

  render() {
    //return <div ref={ref => (this.mount = ref)} />;

    return (
      <Fragment>
        <ParseStepFile
          display3DFile={this.getParsedStepFileForDisplay.bind(this)}
        />
        <div id="container">
          <canvas id="editor"></canvas>
        </div>
        <Button
          style={{ marginLeft: "1%" }}
          color="primary"
          variant="contained"
        >
          See Face
        </Button>
      </Fragment>
    );
  }
}
export default ThreeDViewer;
