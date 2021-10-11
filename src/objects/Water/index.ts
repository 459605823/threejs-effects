import * as THREE from 'three';
import {Water} from 'three/examples/jsm/objects/Water';
import BaseObject from '@/utils/pencil/BaseObject';
import {getTexture} from '@/utils/pencil/utils';

export default class Ocean extends BaseObject {
  constructor(...args: ConstructorParameters<typeof BaseObject>) {
    super(args[0], {
      ...Ocean.options,
      ...args[1],
    });
  }

  static options = {
    size: 10000,
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: null,
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: false,
  };

  water: Water;

  create() {
    const {options, pencil} = this;
    const {scene} = pencil;
    const {size} = options;
    const waterGeo = new THREE.PlaneBufferGeometry(size, size);
    const texture = getTexture('Ocean/waternormals.jpeg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    options.fog = scene?.fog !== undefined;
    options.waterNormals = texture;
    const water = new Water(waterGeo, options);
    water.rotation.x = -Math.PI / 2;
    this.createGroup();
    this.object3d.add(water);
    this.water = water;
  }

  update() {
    (this.water.material as THREE.ShaderMaterial).uniforms.time.value +=
      1.0 / 60.0;
  }
}
