import LineSegments2 from './LineSegments2';
import LineGeometry from './LineGeometry';
import LineMaterial from './LineMaterial';

class LineMesh extends LineSegments2 {
  constructor(
    geometry = new LineGeometry(),
    material = new LineMaterial({
      color: Math.random() * 0xffffff
    })
  ) {
    super(geometry, material);
    this.type = 'MeshLine';
  }
}

LineMesh.prototype.isMeshLine = true;

export default LineMesh;
