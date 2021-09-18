import * as THREE from 'three';
import vertexShader from './shader/vertex';
import fragmentShader from './shader/fragment.glsl?raw';

export default () => {
  const uniforms = {
    time: {
      type: 'f',
      value: 0,
    },
    color: {
      type: 'c',
      value: new THREE.Color('#0f84ec'),
    },
    opacity: {
      type: 'f',
      value: 1,
    },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    blending: THREE.AdditiveBlending,
    depthWrite: !1,
    depthTest: !0,
    side: THREE.DoubleSide,
    transparent: !0,
  });
  return material;
};
