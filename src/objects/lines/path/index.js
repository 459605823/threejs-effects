import * as THREE from 'three';
import BaseObject from '@/utils/pencil/BaseObject';

import getLinePosition from '../spriteLine/getLinePosition';
import PathPointList from './PathPointList';
import PathGeometry from './PathGeometry';

export default class Line2d extends BaseObject {
  static options = {
    width: 0.1,
  };

  constructor(...args) {
    super(args[0], {
      ...Line2d.options,
      ...args[1],
    });
  }

  init() {
    if (!this.options.material && this.options.texture) {
      const {texture} = this.options;
      // texture.wrapS = THREE.RepeatWrapping;
      // texture.wrapT = THREE.RepeatWrapping;
      texture.anisotropy = 16;
      texture.needsUpdate = true;
      this.options.material = new THREE.MeshBasicMaterial({
        // depthWrite: false,
        // depthTest: true,
        // transparent: true,
        // blending: THREE.AdditiveBlending,
        // side: THREE.DoubleSide,
        map: texture,
      });
      // this.texture = texture;
    } else if (!this.options.material) {
      this.options.material = new THREE.MeshBasicMaterial({
        color: '#8fa29f',
      });
    }
  }

  create() {
    const {plugin} = this.pencil;
    const {layer} = plugin;
    const {lineString, position, width, material} = this.options;

    const {positionsV} = getLinePosition(lineString, layer);
    const points = positionsV.map((c) => {
      return new THREE.Vector3(c.x, c.y, 0);
    });
    const pathPointList = new PathPointList();
    pathPointList.set(points, 0, 0, new THREE.Vector3(0, 0, 1));
    const geometry = new PathGeometry();

    geometry.update(pathPointList, {
      width,
      arrow: false,
    });

    this.createMesh(geometry, material);
    // this.object3d.translateX(Math.PI / 2);

    this.object3d.position.copy(position);
  }
}
