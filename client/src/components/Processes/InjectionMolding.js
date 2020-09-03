import axios from "axios";
import React, { Component, useState, useEffect } from "react";
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
      input file, choose stock based on file geometry and material constraints
      with a most recomended stock based on least material removal and ease of
      workholding. Determine operation 1 holding zone/ machining zone. Determine
      op1 machining style. Derive max machining depth possible in op1. determine
      new holding zone in finished op area or in unfinished are if another op is
      required. Decisions to be made: number of ops, holding in op, stock, tp
      type in op
      <p>Items in your cart: {cartItems.toString()}</p>
      <button
        onClick={() => {
          setCartItems([...cartItems, "apple"]);
        }}
      >
        Add to Cart
      </button>
      <p>You've scrolled this far: {scrollDepth}</p>
      <ol>
        <li>
          <h3>Validate Part Overhangs</h3>
          <p>
            Detect overhangs: take each plane, perform raycast normal to plane,
            check if intersection with another plane. Tells you{" "}
          </p>
        </li>

        <li>
          <h3>Determine Main Parting Direction</h3>
          <p>Determine direction with least overhangs</p>
        </li>

        <li>
          <h3>Determine Sub-Parting directions and planes</h3>
          <p>Determine direction with least overhangs</p>
        </li>

        <li>
          <h3>Determine Parting Lines</h3>
          <p>Lead parting lines through part edges</p>
          <p>Choose parting </p>
          <p></p>
        </li>

        <li>
          <h3>Validate Flow Pressure </h3>
          <p>
            Validate Flow Pressure Required while only allowing flow holes on
            non decorative side
          </p>
          <p>
            Flow hole size and hole density to be standarized based on required
            plastic volume and non decorative side area{" "}
          </p>
        </li>

        <li>
          <h3>Determine pusher pins locations</h3>
          <p>
            Validate Flow Pressure Required while only allowing flow holes on
            non decorative side
          </p>
        </li>

        <li>
          <h3>Validate Flow Analysis</h3>
          <p>
            Make sure adequate mold filling without premature solidification
          </p>
          <p>
            Need to figure out how to prevent clogging of plumbing and have the
            injection holes not have imperfections
          </p>
          <p>Airpressure pushers?</p>
        </li>
      </ol>
    </div>
  );
}
