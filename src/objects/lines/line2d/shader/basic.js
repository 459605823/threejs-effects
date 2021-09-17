import * as THREE from 'three';
import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

export default (opt) => {
  opt = opt || {};
  const thickness = typeof opt.thickness === 'number' ? opt.thickness : 0.1;
  const opacity = typeof opt.opacity === 'number' ? opt.opacity : 1.0;
  const diffuse = opt.diffuse !== null ? opt.diffuse : 0xffffff;

  // remove to satisfy r73
  delete opt.thickness;
  delete opt.opacity;
  delete opt.diffuse;
  delete opt.precision;

  const ret = {
    uniforms: {
      thickness: {type: 'f', value: thickness},
      opacity: {type: 'f', value: opacity},
      diffuse: {type: 'c', value: new THREE.Color(diffuse)},
    },
    vertexShader,
    fragmentShader,
    ...opt,
  };

  return ret;
};
