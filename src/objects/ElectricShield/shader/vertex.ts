import * as THREE from 'three';

export default `
precision lowp float;
precision lowp int;
${THREE.ShaderChunk.fog_pars_vertex}

varying vec2 vUv;
void main() {
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    ${THREE.ShaderChunk.fog_vertex}

}

`;
