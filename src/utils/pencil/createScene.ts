import * as THREE from 'three';

interface Options {
  background?: THREE.Scene['background'];
}

export default (options: Options): THREE.Scene => {
  const {background} = options;
  const scene = new THREE.Scene();
  if (background) {
    scene.background = background;
  }
  return scene;
};
