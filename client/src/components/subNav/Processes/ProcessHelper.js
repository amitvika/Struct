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
      <p>Input the geometry->size and shape</p>
      <p>
        Input the material: plastic, metal (steel->10 types, stainless steel->4
        types, aluminium->10 types, copper->2, nickel->5, titanium->5),
        ceramic->porcelein, earthenware, wood->{" "}
      </p>
      <p>
        strenght of compoennet or areas where strength is required(determines
        material and processes to material)->selection criteria include what
        material is even allowed(material), what processes are inherently
        fast/slow(rate), geometry allownaces(geomtery), what is the inherenet
        process precision (precision), -->Processes: Machining, Assembly and
        Fastening, High Pressure Die injection, investment casting, sand
        casting, sheet stamping, sheet punching, forging, roller die,
        photolithography, pick n place, heat treatment, clothing cut, clothing
        place and stitch
      </p>
      <p>
        other processes include basic processes for seperation, heating,
        cooling, mixing for custom formulations
      </p>
    </div>
  );
}
