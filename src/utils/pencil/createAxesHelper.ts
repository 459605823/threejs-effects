import * as THREE from 'three';

export default (size = 100) => {
  const axesHelper = new THREE.AxesHelper(size);
  return axesHelper;
};
