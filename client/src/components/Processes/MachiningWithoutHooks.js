import axios from "axios";
import React, { Component, useState, useEffect } from "react";
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
export default function Machining() {
  const [cartItems, setCartItems] = useState([]);
  const [scrollDepth, setScrollDepth] = useState(0);

  function determineScrollDepth() {
    const scrolled =
      document.documentElement.scrollTop || document.body.scrollTop;
    setScrollDepth(scrolled);
  }

  useEffect(() => {
    window.addEventListener("scroll", determineScrollDepth);
  });

  return (
    <div>
      <Form>
        <FormGroup row>
          <Button
            style={{ marginLeft: "1%" }}
            variant="contained"
            color="primary"
          >
            Load File
          </Button>

          <Col>
            <CustomInput
              type="file"
              id="exampleCustomFileBrowser"
              name="customFile"
              label="Upload Goal Geometry File - ASCII STL Files Only"
            />
          </Col>
        </FormGroup>
      </Form>

      <h2>Input File</h2>
      <h2>Workholding Location</h2>
      <h2>Goal Model-Workholding Projection</h2>
      <p>
        Determine by what cant be machined when held. Is that place suitable to
        be held in a part flip?
      </p>
      <h2>Machining Mode</h2>
      <p>
        Roughing (machining without or with goal surface contact), Fine touching
        (Goal surface contact only)
      </p>
      <h2>Face Types</h2>
      <p>
        Flat Plane, 3d Plane (ex: waves in a puddle), 2d Plane (ex: cone
        face),1D Plane (if the plane feature is not defined by a line, instead a
        common curve, then that specific tool can be made->such as a wooworking
        router bit like for moldings ) No Plane (Roughing)
      </p>
      <h2>Tool Path Type Variable:</h2>
      <p>Circular divergence, cirvular convergence, linear sweep</p>
      <h2>Tool Path Type Modifier Variable:</h2>
      <p>vertical tool, normal tool</p>
      <h2>Tool Variable:</h2>
      <p>
        Facer 3x size, Flat End end mill 10x size, Ball Nose end mill 10x types
      </p>
      <ol>
        <li>
          <h3>
            Determine side(s) most efficacious for holding after machining is
            completed
          </h3>
          <p>
            The portion must be holdable by flat clamps, and the unclamped
            surface must be squareble to a fixed position
          </p>
          <p>
            If a flat clamp cannot be used, then machine aluminium to create a
            custom clamp face for the face to be held
          </p>
        </li>
        <li>
          <h3>Begin Roughing with Rotary flat face tool</h3>
          <p>Start with linear sweep for major material removal</p>
          <p>
            Once the model surfaces are encountered, stay a certain defined
            danger threshold away from it. Start circular convergence.
          </p>
          <p>
            If a pocket is encountered at the level, and the roughing tool can
            fit, save to do circular divergence in the pocket after external
            roughing is completed
          </p>
        </li>
        <li>
          <h3>Smooth out flat surfaces with flat end end mill</h3>
          <p>Use normal or perpendicular contact</p>
        </li>
        <li>
          <h3>Begin Flat End End Mill Roughing</h3>
          <p>Same procedure as above but with a flat end mill</p>
          <p>
            Reduce endmill width by factor of 3 until but got to minimum flat
            end end mill size as per the minimum ball nose endmill required as
            per precision requirements
          </p>
        </li>
        <li>
          <h3>Begin Ball Nose Normal Tracing</h3>
          <p>Do precise surfaces with normal where possible</p>
          <p>
            If hard to reach places can be done via non-normal contact, utilize
            an angle that meets acceptable interference distance thresholds
          </p>
        </li>
      </ol>
    </div>
  );
}
