import * as THREE from 'three';
import BaseObject from '@/utils/pencil/BaseObject';
import getMaterial from './material';

export default class ElectricShield extends BaseObject {
  constructor(...args: ConstructorParameters<typeof BaseObject>) {
    super(args[0], {
      speed: 0.01,
      radius: 1,
      interactive: false,
      ...args[1],
    });
  }

  create() {
    const material = getMaterial();
    const {position, radius} = this.options;
    const geometry = new THREE.SphereBufferGeometry(
      radius,
      50,
      50,
      0,
      Math.PI * 2
    );
    this.createMesh(geometry, material);

    this.object3d.position.copy(position);
    // this.object3d.rotation.x = Math.PI / 2;
  }

  update() {
    const ball = this.object3d;
    const {speed} = this.options;
    ((ball as any).material as THREE.ShaderMaterial).uniforms.time.value +=
      speed;
  }
}
