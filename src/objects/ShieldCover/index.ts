import * as THREE from 'three';
import BaseObject from '@/utils/pencil/BaseObject';
import vertexShader from './shader/vertex.glsl?raw';
import fragmentShader from './shader/fragment.glsl?raw';
import {getTexture} from '@/utils/pencil/utils';

export default class ShieldCover extends BaseObject {
  texture: THREE.Texture;

  time: THREE.IUniform;

  offset: THREE.IUniform;

  glowColor: THREE.IUniform;

  static options = {
    scale: new THREE.Vector3(1, 1, 1),
  };

  constructor(...args: ConstructorParameters<typeof BaseObject>) {
    super(args[0], {
      ...ShieldCover.options,
      ...args[1],
    });
  }

  create() {
    this.createGroup();
    const {scale, position} = this.options;
    const time = {value: 1};
    const offset = {type: 'f', value: 0.0};
    const glowColor = {type: 'c', value: new THREE.Color(0x4b88c5)};
    const texture = getTexture('ShieldCover/texture.png');
    const geometry = new THREE.SphereBufferGeometry(
      5,
      36,
      36,
      0,
      Math.PI * 2,
      0,
      (Math.PI / 180) * 90
    );
    const material = new THREE.ShaderMaterial({
      uniforms: {
        c: {value: 1.5},
        p: {value: 4},
        backgroundTexture: {value: texture},
        offset,
        u_resolution: {value: new THREE.Vector2(500, 500)},
        u_time: time,
        glowColor,
        viewVector: {value: this.pencil?.camera?.position},
      },
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      depthWrite: false,
      transparent: true,
    });
    const Shield = new THREE.Mesh(geometry, material);
    Shield.scale.multiply(scale);
    this.object3d.add(Shield);
    this.object3d.position.copy(position);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.x = 1;
    texture.repeat.y = 1;
    this.texture = texture;
    this.time = time;
    this.offset = offset;
    this.glowColor = glowColor;
  }

  update() {
    this.offset.value += 0.01;
    this.offset.value %= 1.0;
    this.time.value += 0.004;
  }
}
