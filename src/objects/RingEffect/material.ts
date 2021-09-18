import * as THREE from 'three';
import vertexShader from './shader/vertex.glsl?raw';
import fragmentShader from './shader/fragment.glsl?raw';

export default (type = 0) => {
  const ringShield = {
    uniforms: {
      color: {
        type: 'c',
        value: new THREE.Color('#9999FF'),
      },
      time: {
        type: 'f',
        value: -1.5,
      },
      type: {
        type: 'f',
        value: type || 0,
      },
      num: {
        type: 'f',
        value: 4,
      },
    },
  };
  const material = new THREE.ShaderMaterial({
    uniforms: ringShield.uniforms,
    vertexShader,
    fragmentShader,
    blending: THREE.AdditiveBlending,
    depthWrite: !1,
    depthTest: !0,
    side: THREE.DoubleSide,
    transparent: !0,
    fog: !0,
  });
  return material;
};
