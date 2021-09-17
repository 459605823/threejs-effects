import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';

interface Options {
  camera: THREE.Camera;
  renderer: THREE.Renderer;
}

export default (options: Options): OrbitControls => {
  const {camera, renderer} = options;
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minPolarAngle = Math.PI * 0.15;
  controls.maxPolarAngle = Math.PI * 0.85;

  controls.enableDamping = true;
  controls.dampingFactor = 0.063;

  controls.autoRotate = false;
  controls.autoRotateSpeed = -60;

  controls.enableZoom = true;
  // controls.minDistance = 0;
  // controls.maxDistance = 4000;
  controls.zoomSpeed = 0.2;
  // controls.zoomFactor = 0.1;

  return controls;
};
