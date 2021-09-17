import * as THREE from 'three';

interface Options {
  width: number;
  height: number;
}

export default (options: Options): THREE.PerspectiveCamera => {
  const {width, height} = options;
  const camera = new THREE.PerspectiveCamera(60, width / height, 1, 20000);
  camera.position.set(0, 0, 1400);
  camera.lookAt(0, 0, 0);
  return camera;
};
