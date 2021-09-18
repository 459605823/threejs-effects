import * as THREE from 'three';
import BaseObject from '@/utils/pencil/BaseObject';
import Water from './water-material';
import {getTexture} from '@/utils/pencil/utils';

export default class Ocean extends BaseObject {
  water: Water;

  constructor(...args: ConstructorParameters<typeof BaseObject>) {
    super(args[0], {
      ...Ocean.options,
      ...args[1],
    });
  }

  static options = {
    textureWidth: 256,
    textureHeight: 256,
    sunColor: 0xffffff,
    betaVersion: 0,
    waterNormals: null,
    side: THREE.DoubleSide,
    depthTest: true,
    alpha: 1,
    waterColor: '#00ff4a',
    noiseScale: 0.1,
    interactive: false,
    altitude: 0,
  };

  create() {
    const {pencil, options} = this;
    const texture = getTexture('Ocean/waternormals.jpeg');
    const dirLight = new THREE.DirectionalLight(0xffff55, 1);
    dirLight.position.set(100, 100, 100);
    pencil.scene?.add(dirLight);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    options.waterNormals = texture;
    options.sunDirection = dirLight.position.normalize();
    const {renderer, camera, scene} = pencil;
    const water = new Water(renderer, camera, scene, options);
    const plane = new THREE.PlaneBufferGeometry(2000, 2000, 10, 10);
    this.createMesh(plane, water.material);
    this.object3d.add(water);
    this.object3d.rotation.x = -Math.PI / 2;
    this.water = water;
  }

  update() {
    this.water.material.uniforms.time.value += 1.0 / 60.0;
    this.water.render();
  }
}
