;(function() {
	'use strict'
  
	var root = this
  
	var has_require = typeof require !== 'undefined'
  
	var THREE = root.THREE || (has_require && require('three'))
	if (!THREE) throw new Error('MeshLine requires three.js')
  
	class MeshLineMaterial extends THREE.ShaderMaterial {

		constructor( parameters ) {

			super( {
				uniforms: Object.assign({}, THREE.UniformsLib.fog, {
				lineWidth: { value: 1 },
				map: { value: null },
				useMap: { value: 0 },
				alphaMap: { value: null },
				useAlphaMap: { value: 0 },
				color: { value: new THREE.Color(0xffffff) },
				opacity: { value: 1 },
				resolution: { value: new THREE.Vector2(1, 1) },
				sizeAttenuation: { value: 1 },
				dashArray: { value: 0 },
				dashOffset: { value: 0 },
				dashRatio: { value: 0.5 },
				useDash: { value: 0 },
				visibility: { value: 1 },
				alphaTest: { value: 0 },
				repeat: { value: new THREE.Vector2(1, 1) },
				}),
  
				vertexShader: THREE.ShaderChunk.meshline_vert,
  
				fragmentShader: THREE.ShaderChunk.meshline_frag,
				type:'MeshLineMaterial'
	  		});
  
			Object.defineProperties(this, {
				lineWidth: {
				enumerable: true,
				get: function() {
					return this.uniforms.lineWidth.value
				},
				set: function(value) {
					this.uniforms.lineWidth.value = value
				},
				},
				map: {
				enumerable: true,
				get: function() {
					return this.uniforms.map.value
				},
				set: function(value) {
					this.uniforms.map.value = value
				},
				},
				useMap: {
				enumerable: true,
				get: function() {
					return this.uniforms.useMap.value
				},
				set: function(value) {
					this.uniforms.useMap.value = value
				},
				},
				alphaMap: {
				enumerable: true,
				get: function() {
					return this.uniforms.alphaMap.value
				},
				set: function(value) {
					this.uniforms.alphaMap.value = value
				},
				},
				useAlphaMap: {
				enumerable: true,
				get: function() {
					return this.uniforms.useAlphaMap.value
				},
				set: function(value) {
					this.uniforms.useAlphaMap.value = value
				},
				},
				color: {
				enumerable: true,
				get: function() {
					return this.uniforms.color.value
				},
				set: function(value) {
					this.uniforms.color.value = value
				},
				},
				opacity: {
				enumerable: true,
				get: function() {
					return this.uniforms.opacity.value
				},
				set: function(value) {
					this.uniforms.opacity.value = value
				},
				},
				resolution: {
				enumerable: true,
				get: function() {
					return this.uniforms.resolution.value
				},
				set: function(value) {
					this.uniforms.resolution.value.copy(value)
				},
				},
				sizeAttenuation: {
				enumerable: true,
				get: function() {
					return this.uniforms.sizeAttenuation.value
				},
				set: function(value) {
					this.uniforms.sizeAttenuation.value = value
				},
				},
				dashArray: {
				enumerable: true,
				get: function() {
					return this.uniforms.dashArray.value
				},
				set: function(value) {
					this.uniforms.dashArray.value = value
					this.useDash = value !== 0 ? 1 : 0
				},
				},
				dashOffset: {
				enumerable: true,
				get: function() {
					return this.uniforms.dashOffset.value
				},
				set: function(value) {
					this.uniforms.dashOffset.value = value
				},
				},
				dashRatio: {
				enumerable: true,
				get: function() {
					return this.uniforms.dashRatio.value
				},
				set: function(value) {
					this.uniforms.dashRatio.value = value
				},
				},
				useDash: {
				enumerable: true,
				get: function() {
					return this.uniforms.useDash.value
				},
				set: function(value) {
					this.uniforms.useDash.value = value
				},
				},
				visibility: {
				enumerable: true,
				get: function() {
					return this.uniforms.visibility.value
				},
				set: function(value) {
					this.uniforms.visibility.value = value
				},
				},
				alphaTest: {
				enumerable: true,
				get: function() {
					return this.uniforms.alphaTest.value
				},
				set: function(value) {
					this.uniforms.alphaTest.value = value
				},
				},
				repeat: {
				enumerable: true,
				get: function() {
					return this.uniforms.repeat.value
				},
				set: function(value) {
					this.uniforms.repeat.value.copy(value)
				},
				},
			})
	
			this.setValues(parameters);
			this.isMeshLineMaterial = true;
		}
	}
	/* MeshLineMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype)
	MeshLineMaterial.prototype.constructor = MeshLineMaterial */
	MeshLineMaterial.prototype.isMeshLineMaterial = true;
  
	if (typeof exports !== 'undefined') {
	  if (typeof module !== 'undefined' && module.exports) {
		exports = module.exports = {		 
		  MeshLineMaterial: MeshLineMaterial,		 
		}
	  }	 
	  exports.MeshLineMaterial = MeshLineMaterial
	  
	} else {
	  root.MeshLineMaterial = MeshLineMaterial
	}
  }.call(this))
  