import LineSegments2 from "./LineSegments2";
import LineGeometry from "./LineGeometry";
import LineMaterial from "./LineMaterial";


	class MeshLine extends LineSegments2 {

		constructor( geometry = new LineGeometry(), material = new LineMaterial( {
			color: Math.random() * 0xffffff
		} ) ) {

			super( geometry, material );
			this.type = 'MeshLine';

		}

	}

	MeshLine.prototype.isMeshLine = true;



export default MeshLine;
