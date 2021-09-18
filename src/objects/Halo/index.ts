import * as THREE from 'three';
import BaseObject from '@/utils/pencil/BaseObject';
import vertexShader from './shader/vertex.glsl?raw';
import fragmentShader from './shader/fragment.glsl?raw';

export default class Halo extends BaseObject {
  constructor(...args: ConstructorParameters<typeof BaseObject>) {
    super(args[0], {
      size: 5,
      ...args[1],
    });
  }

  time = {value: 0};

  create() {
    const {pencil} = this;
    const {size} = this.options;
    const {width, height} = pencil.getSize();
    this.createGroup();
    const geometry = new THREE.PlaneGeometry(size, size, 1);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: this.time,
        iResolution: {value: new THREE.Vector2(width, height)},
      },
      fragmentShader,
      vertexShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const halo = new THREE.Mesh(geometry, material);

    halo.rotation.x = Math.PI / -2;

    this.object3d.add(halo);
  }

  update() {
    this.time.value += 0.04;
  }
}
