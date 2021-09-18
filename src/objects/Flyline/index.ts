/* eslint-disable no-restricted-properties */
import * as THREE from 'three';
import BaseObject from '@/utils/pencil/BaseObject';
import {getTexture} from '@/utils/pencil/utils';
import vertexShader from './shader/vertex.glsl?raw';
import fragmentShader from './shader/fragment.glsl?raw';

export const commonUniforms = {
  time: {
    value: 0,
  },
  number: {
    value: 1,
  },
  speed: {
    value: 0.5,
  },
  length: {
    value: 0.8,
  },
  size: {
    value: 5,
  },
};

function createLineMaterial(color: string | number) {
  const uniforms = {
    time: {value: Math.round(Math.random() * 20) / 10},
    number: commonUniforms.number,
    speed: commonUniforms.speed,
    length: commonUniforms.length,
    size: commonUniforms.size,
    color: {
      value: new THREE.Color(color),
    },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
  });

  return material;
}
export default class Flyline extends BaseObject {
  name = 'flyline';

  line: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;

  start: THREE.Mesh<THREE.PlaneBufferGeometry, THREE.MeshBasicMaterial>;

  end: THREE.Mesh<THREE.PlaneBufferGeometry, THREE.MeshBasicMaterial>;

  static options = {
    height: 25, // 地球半径
    pointsLength: 20, // 点数
    pointSize: 15,
    altitude: 1,
    color: '#FF7502',
  };

  constructor(...args: ConstructorParameters<typeof BaseObject>) {
    super(args[0], {
      ...Flyline.options,
      ...args[1],
    });
  }

  create() {
    this.createGroup();
    const {position, height, pointSize, altitude, color} = this.options;
    const [[x1, y1], [x2, y2]] = position;
    const v0 = new THREE.Vector3(x1, y1, altitude);
    const v1 = new THREE.Vector3(
      x1 + (x2 - x1) * 0.25,
      y1 + (y2 - y1) * 0.25,
      height
    );
    const v2 = new THREE.Vector3(
      x1 + (x2 - x1) * 0.75,
      y1 + (y2 - y1) * 0.75,
      height
    );
    const v3 = new THREE.Vector3(x2, y2, altitude);

    // 三维三次贝塞尔曲线（v0起点，v1第一个控制点，v2第二个控制点，v3终点）
    const curve = new THREE.CubicBezierCurve3(v0, v1, v2, v3);
    const points = curve.getPoints(1500);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const {length} = points;
    const percents = new Float32Array(length);
    for (let i = 0; i < length; i += 1) {
      percents[i] = i / length;
    }
    geometry.setAttribute('percent', new THREE.BufferAttribute(percents, 1));

    const material = createLineMaterial(color);
    const line = new THREE.Points(geometry, material);

    const flyPoint = getTexture('fly_point.png');

    const startGeometry = new THREE.PlaneBufferGeometry(
      pointSize,
      pointSize,
      pointSize
    );
    const startMaterial = new THREE.MeshBasicMaterial({
      map: flyPoint,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      color,
    });
    const start = new THREE.Mesh(startGeometry, startMaterial);
    start.position.copy(v0);
    start.position.z = altitude;

    const endGeometry = new THREE.PlaneBufferGeometry(
      pointSize,
      pointSize,
      pointSize
    );
    const endMaterial = new THREE.MeshBasicMaterial({
      map: flyPoint,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      color,
    });
    const end = new THREE.Mesh(endGeometry, endMaterial);
    end.position.copy(v3);
    end.position.z = altitude;
    this.object3d.add(start);
    this.object3d.add(end);
    this.object3d.add(line);
    this.line = line;
    this.start = start;
    this.end = end;
  }

  update() {
    if (!this.line) return;
    const {uniforms} = this.line.material;
    const max = 1 / uniforms.speed.value;
    const length = uniforms.length.value / uniforms.speed.value;
    uniforms.time.value += 0.02;
    if (uniforms.time.value > max + 0.02) {
      uniforms.time.value = 0;
    }
    const percent = uniforms.time.value;
    // 0.6 => 1;    1 => 0;
    if (percent >= max - length && percent <= max + 0.04) {
      // 0 => 0.4
      const scale = 1 - (percent - (max - length)) / length;
      this.start.scale.setScalar(scale);
      this.start.material.opacity = 1 - scale + 0.3;
      this.end.scale.setScalar(1 - scale);
      this.end.material.opacity = 0.3 + scale;
    } else {
      this.start.scale.setScalar(0);
      this.end.scale.setScalar(0);
    }
  }
}
