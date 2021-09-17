import * as THREE from 'three';
import BaseObject from '@/utils/pencil/BaseObject';
import {MeshLine, MeshLineMaterial} from '../meshLine/index';
import getLinePosition from './getLinePosition';
import getArcPoints from './getArcPoints';

export default class SpriteLine extends BaseObject {
  static options = {
    altitude: 0,
    speed: 0.05,
    height: 0,
    lineWidth: 8,
    bloom: false,
  };

  constructor(...args) {
    super(args[0], {
      ...SpriteLine.options,
      ...args[1],
    });
  }

  init() {
    const {plugin} = this.pencil;
    const {lineWidth} = this.options;
    if (!this.options.material && this.options.texture) {
      const {texture} = this.options;
      texture.anisotropy = 16;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.needsUpdate = true;

      const {camera} = plugin;
      const material = new MeshLineMaterial({
        map: texture,
        useMap: true,
        lineWidth,
        sizeAttenuation: false,
        transparent: true,
        near: camera.near,
        far: camera.far,
      });
      this.options.material = material;
    }
  }

  create() {
    const {pencil} = this;
    const {layer} = pencil.plugin;
    const {lineString, position, height, center, material} = this.options;
    // console.log(' texture.anisotropy', texture.anisotropy);

    const geometry = new THREE.Geometry();

    if (!height) {
      const {positions} = getLinePosition(lineString, layer, center);
      for (let i = 0; i < positions.length; i += 3) {
        geometry.vertices.push(
          new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2])
        );
      }
    } else {
      const points = getArcPoints(lineString, height, layer);
      geometry.vertices = points;
    }

    const meshLine = new MeshLine();
    meshLine.setGeometry(geometry);

    const map = layer.getMap();
    const size = map.getSize();
    material.uniforms.resolution.value.set(size.width, size.height);

    this.createMesh(meshLine.geometry, material);

    this.object3d.position.copy(position);
  }

  update(delta) {
    const {speed, material} = this.options;
    const offset = material.uniforms.offset.value;
    if (speed) {
      offset.x -= speed * delta;
    }
  }
}
