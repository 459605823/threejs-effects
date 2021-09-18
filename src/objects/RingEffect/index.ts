import * as THREE from 'three';

import BaseObject from '@/utils/pencil/BaseObject';
import getMaterial from './material';

export default class RingEffect extends BaseObject {
  constructor(...args: ConstructorParameters<typeof BaseObject>) {
    super(args[0], {
      altitude: 0,
      interactive: false,
      speed: 0.003,
      _radius: 1,
      ...args[1],
    });
  }

  create() {
    const material = getMaterial(1);
    const {position, radius} = this.options;
    const geometry = new THREE.RingBufferGeometry(
      0.001,
      radius,
      100,
      5,
      0,
      Math.PI * 2
    );
    this.createMesh(geometry, material);
    this.object3d.position.copy(position);
  }

  update() {
    const ring = this.object3d;
    const {speed} = this.options;
    ((ring as any).material as THREE.ShaderMaterial).uniforms.time.value +=
      speed;
  }
}
