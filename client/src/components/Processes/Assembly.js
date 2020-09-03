import React, { useState, useEffect } from "react";

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
      <h1>Assembly Decision Trees</h1>
      <ol>
        <li>
          <h3>Determine assembly order</h3>
          <p></p>
        </li>
        <li>
          <h3>Determine Holding Sequence</h3>
          <p>Determine first holding scheme</p>
          <p>
            Determine second holding scheme and which part step to transition to
            it
          </p>
          <p>repeat until no more different holdings are needed</p>
        </li>
        <li>
          <h3>
            Determine Part Holding for Each Item and part Holding location
          </h3>
          <p>Use normal or perpendicular contact</p>
        </li>
      </ol>
      <h1>Assembly Machines</h1>
      <ol>
        <li>Transport (Linear lead screw, multi axis lead screw)</li>
        <li>Dispensing</li>
        <li>Holding</li>
        <li>Placement</li>
      </ol>
    </div>
  );
}
