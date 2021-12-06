import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import BaseObject from '@/utils/pencil/BaseObject';
import destroy from '@/utils/destroy';
import {MeshLine, MeshLineMaterial} from '../lines/meshLine';

const getTexture = (
  length: number,
  lineColor: string,
  lightColor: string,
  isHalf: boolean
) => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const gradient = ctx.createLinearGradient(0, 0, 256, 1);
  gradient.addColorStop(0, lineColor);
  gradient.addColorStop(isHalf ? length : length / 2, lightColor);
  gradient.addColorStop(length, lineColor);
  gradient.addColorStop(length, lineColor);
  gradient.addColorStop(1, lineColor);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 1);
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

const defaultOptions = {
  speed: 1,
  lineWidth: 120,
  nodes: [],
  length: 0.4,
  isHalf: true,
  lineColor: 'rgba(171,157,245,0)',
  lightColor: 'rgba(239,238,255,1)',
  color: new THREE.Color('#ffffff'),
  duration: 6000,
  delay: 0,
  onArrive: null,
  repeat: new THREE.Vector2(3, 0),
};

export default class Flyline extends BaseObject {
  material: MeshLineMaterial;

  offset: any;

  tween: any;

  static options = {
    ...defaultOptions,
    // random 不能写在defaultOptions
    start: Math.random(),
  };

  constructor(...args: ConstructorParameters<typeof BaseObject>) {
    super(args[0], {
      ...Flyline.options,
      ...args[1],
    });
  }

  create() {
    const {
      lineWidth,
      nodes,
      length,
      lineColor,
      lightColor,
      color,
      isHalf,
      duration,
      delay,
      start,
      onArrive,
      repeat,
    } = this.options;

    const {pencil} = this;

    const points = nodes;

    const geometry = new THREE.Geometry();

    geometry.vertices = points;

    const meshLine = new MeshLine();
    meshLine.setGeometry(geometry);

    const texture = getTexture(length, lineColor, lightColor, isHalf);
    texture.anisotropy = 16;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    const material = new MeshLineMaterial({
      map: texture,
      useMap: true,
      color,
      lineWidth,
      repeat,
      sizeAttenuation: false,
      transparent: true,
    });
    this.material = material;
    this.offset = (material as any).uniforms.offset.value;
    this.offset.x = start;
    // eslint-disable-next-line max-len
    const {width, height} = pencil.getSize();
    (material as any).uniforms.resolution.value.set(width, height);
    (material as any).uniforms.visibility.value = 0;
    this.createMesh(meshLine.geometry, material as any);

    if (this.tween) {
      TWEEN.remove(this.tween);
    }

    const tween = new TWEEN.Tween(this.offset)
      .to({x: this.offset.x - 1}, duration)
      .delay(delay)
      .repeat(Infinity)
      .start()
      .onComplete(onArrive);
    this.tween = tween;
  }

  animateIn() {
    const {duration, delay, onArrive} = this.options;
    new TWEEN.Tween(this.material.uniforms.visibility as {})
      .to({value: 1}, 2000)
      .start()
      .onComplete(() => {
        if (this.tween) {
          TWEEN.remove(this.tween);
        }
        const tween = new TWEEN.Tween(this.offset)
          .to({x: this.offset.x - 1}, duration)
          .delay(delay)
          .repeat(Infinity)
          .start()
          .onComplete(onArrive);
        this.tween = tween;
      });
  }

  destroy() {
    destroy(this.object3d);
    TWEEN.remove(this.tween);
    this.tween = null;
  }
}
