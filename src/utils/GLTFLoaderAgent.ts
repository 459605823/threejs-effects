import {GLTFLoader, GLTF} from 'three/examples/jsm/loaders/GLTFLoader';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader';
import THREE from 'three';

let STORE: Record<string, THREE.Object3D> = {};

let QUEUE: Record<string, Function[]> = {};

const loader = new GLTFLoader();
export default function getObject(
  path = '',
  cloneTexture = false,
  DRACO = false
) {
  return new Promise<THREE.Object3D>((resolve) => {
    const object = STORE[path];
    if (cloneTexture || !object) {
      let queue = QUEUE[path];
      if (!queue) {
        queue = [];
        QUEUE[path] = queue;
        if (DRACO) {
          loader.setDRACOLoader(new DRACOLoader());
        }
        loader.load(path, (gltf) => {
          queue.forEach((callback) => {
            callback(gltf);
          });
          queue = [];
        });
      }
      queue.push((gltf: GLTF) => {
        STORE[path] = gltf.scene;
        resolve(STORE[path].clone());
      });
    } else {
      resolve(object.clone());
    }
  });
}

getObject.reload = () => {
  STORE = {};
  QUEUE = {};
};
