import { Mesh } from 'three';

class MeshLine extends Mesh {
  constructor(geometry, material) {
    super((geometry = geometry), (material = material));
    this.isMeshLine = true;
    this.type = 'MeshLine';
    this.raycast = geometry.raycast;
  }
}

export default MeshLine;
