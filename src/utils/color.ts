import * as THREE from 'three';

export const colorVector = (c: any) => {
  const color = new THREE.Color(c);
  const vector = new THREE.Vector3();
  vector.x = color.r;
  vector.y = color.g;
  vector.z = color.b;
  return vector;
};

export default {colorVector};
