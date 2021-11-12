import { MeshLineGeometry } from "./MeshLineGeometry";
import { MeshLineMaterial } from "./MeshLineMaterial";
class MeshLine extends MeshLineGeometry{	
	constructor( geometry, material ) {
		super(geometry=geometry,material=material);	
		this.isMeshLine=true;
		this.type="MeshLine";
	}
}
  
export default MeshLine;