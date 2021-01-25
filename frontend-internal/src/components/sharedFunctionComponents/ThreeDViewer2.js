import React, { Component, Fragment, useState, useEffect } from "react";
import * as THREE from "three";
import ParseStepFile from "./ParseStepFile";

var STLLoader = require("three-stl-loader")(THREE);
var OrbitControls = require("three-orbit-controls")(THREE);
class ThreeDViewer extends Component {
  state = {
    threed: "file"
  };
  componentDidMount() {
    this.sceneSetup();
    this.addCustomSceneObjects();
    this.startAnimationLoop();
    window.addEventListener("resize", this.handleWindowResize);

    /*
    console.log(this.state.threed);
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(
      10,
      window.innerWidth / window.innerHeight,
      0.1,
      100000
    );
    camera.position.x = 3000;
    var light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);
    var light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(50, 50, 50);
    scene.add(light);
    var light = new THREE.DirectionalLight(0xffffff, 0.5);
    scene.add(light);

    var canvas = document.querySelector("#editor");
    var renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    new OrbitControls(camera, renderer.domElement);

    //var geometry = new THREE.BoxGeometry(1, 1, 1);
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, -50, 50));
    geometry.vertices.push(new THREE.Vector3(0, 50, 50));
    var material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.5,
      roughness: 0.5
    });
    var normal = new THREE.Vector3(0, 0, 1); //optional
    var color = new THREE.Color(0xffaa00); //optional
    var materialIndex = 0; //optional
    var face = new THREE.Face3(0, 2, 1);
    geometry.faces.push(face);
    geometry.computeFaceNormals();
    //geometry.computeVertexNormals();
    //geometry.center();
    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    var animate = function() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      var windowAspectRatio = window.innerHeight / window.innerWidth; //used to actively resize the canvas when it is changed in size
      var container = document.getElementById("container"); //used to actively resize the canvas when it is changed in size
      renderer.setSize(
        container.clientWidth,
        container.clientWidth * windowAspectRatio
      ); //used to actively resize the canvas when it is changed in size
    };
    animate();*/
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowResize);
    window.cancelAnimationFrame(this.requestID);
    this.controls.dispose();
  }

  handleWindowResize = () => {
    const width = this.el.clientWidth;
    const height = this.el.clientHeight;

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };
  sceneSetup = () => {
    // get container dimensions and use them for scene sizing
    const width = this.el.clientWidth;
    const height = this.el.clientHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75, // fov = field of view
      width / height, // aspect ratio
      0.1, // near plane
      1000 // far plane
    );
    this.camera.position.z = 5;
    this.controls = new OrbitControls(this.camera, this.el);
    // set some distance from a cube that is located at z = 0

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(width, height);
    this.el.appendChild(this.renderer.domElement); // mount using React ref
  };

  addCustomSceneObjects = () => {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshPhongMaterial({
      color: 0x156289,
      emissive: 0x072534,
      side: THREE.DoubleSide,
      flatShading: true
    });
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);

    const lights = [];
    lights[0] = new THREE.PointLight(0xffffff, 1, 0);
    lights[1] = new THREE.PointLight(0xffffff, 1, 0);
    lights[2] = new THREE.PointLight(0xffffff, 1, 0);

    lights[0].position.set(0, 200, 0);
    lights[1].position.set(100, 200, 100);
    lights[2].position.set(-100, -200, -100);

    this.scene.add(lights[0]);
    this.scene.add(lights[1]);
    this.scene.add(lights[2]);
  };
  startAnimationLoop = () => {
    // this.cube.rotation.x += 0.01;
    // this.cube.rotation.y += 0.01;

    this.renderer.render(this.scene, this.camera);
    this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
  };

  getParsedStepFileForDisplay = element => {
    this.setState({ threed: "u wot m8" });
  };
  render() {
    //return <div ref={ref => (this.mount = ref)} />;

    return (
      <Fragment>
        <ParseStepFile display3DFile={this.getParsedStepFileForDisplay} />
        <div ref={ref => (this.el = ref)} />
      </Fragment>
    );
  }
}
export default ThreeDViewer;
