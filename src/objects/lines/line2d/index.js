import * as THREE from 'three';
import BaseObject from '@/utils/pencil/BaseObject';
import getLinePosition from '../spriteLine/getLinePosition';
import Line from './lineMesh';
import BasicShader from './shader/basic';

export default class Line2d extends BaseObject {
  static options = {
    material: new THREE.ShaderMaterial(
      BasicShader({
        side: THREE.DoubleSide,
        diffuse: '#8fa29f',
        thickness: 0.3,
      })
    ),
  };

  constructor(...args) {
    super(args[0], {
      ...Line2d.options,
      ...args[1],
    });
  }

  create() {
    const {plugin} = this.pencil;
    const {layer} = plugin;
    const {lineString, position, material} = this.options;

    const {positionsV} = getLinePosition(lineString, layer);
    const coordinates = positionsV.map((c) => {
      return [c.x, c.y];
    });
    const curveGeometry = new Line(coordinates);
    this.createMesh(curveGeometry, material);

    this.object3d.position.copy(position);
  }

  update() {}
}
