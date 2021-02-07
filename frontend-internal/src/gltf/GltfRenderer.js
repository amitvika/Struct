import React, { Component } from "react";
import {
  Scene,
  Color,
  MeshNormalMaterial,
  PerspectiveCamera,
  WebGLRenderer
} from "three";
import Stats from "stats.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

var gltfJSON = "";
var activeFile = 0;

class GLTFRenderer extends Component {
  
  componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    this.cleanup();
  }

  alter = () => {
	gltfJSON = this.props.gltfjson;
    activeFile = this.props.activefile;
    if(gltfJSON!="") {
	      this.scene = new Scene();
          this.scene.background = new Color("#FFFFFF");
    	
	      this.gltfLoader = new GLTFLoader();
		  this.gltfLoader.parse(gltfJSON, "http://localhost:8000/Media/", ({ scene }) => {
		  this.object = scene;
		  this.object.traverse(node => {
			if (node.isMesh) {
			  node.material = new MeshNormalMaterial();
			  node.material.needsUpdate = true;
			}
		  });

		  this.scene.add(this.object);
		});
	}
    
    this.renderer.render(this.scene, this.camera);
    this.renderer.setAnimationLoop(this.animate);
  };

  init = () => {
	gltfJSON = this.props.gltfjson;
    this.aspect = this.node.clientWidth / this.node.clientHeight;
    this.camera = new PerspectiveCamera(0.1, this.aspect, 0.01, 10000);
    this.camera.position.set(200, 50, 200);
	//this.camera.zoom = 5;
    this.controls = new OrbitControls(this.camera, this.node);
    this.scene = new Scene();
    this.scene.background = new Color("#FFFFFF");
    //const gltfJSON = require(filename);
	
    
    this.renderer = new WebGLRenderer({
      antialias: true
    });
    
    this.node.appendChild(this.renderer.domElement);
    window.addEventListener("resize", this.onWindowResize);

    this.stats = new Stats();
    //this.node.appendChild(this.stats.dom);

    this.camera.aspect = this.node.clientWidth / this.node.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.node.clientWidth, this.node.clientHeight);
    this.alter();
	
  };

  animate = () => {
    this.stats.begin();

    if (this.object) {
     // this.object.rotation.y += 0.001;
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);

    this.stats.end();
  };

  cleanup = () => {
    window.removeEventListener("resize", this.onWindowResize);
    this.renderer.setAnimationLoop(null);
  };

  onWindowResize = () => {
    this.camera.aspect = this.node.clientWidth / this.node.clientHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.node.clientWidth, this.node.clientHeight);
  };

  render() {
	if( activeFile != this.props.activefile ) {
		this.alter();		
	}
    return (
      <div
        css={{ width: "100%", height: "100%" }}
        ref={el => (this.node = el)}
      />
    );
  }
}

export default GLTFRenderer;
