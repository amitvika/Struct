import React from 'react';
import GLTFRenderer from '../../gltf/GltfRenderer';

export default function index({ gltfjson }) {
  return (
    <div>
      {
        Object.keys(gltfjson).length > 0  &&
        <GLTFRenderer gltfjson={gltfjson} activefile={'fileId'} />
      }
    </div>
  )
}
