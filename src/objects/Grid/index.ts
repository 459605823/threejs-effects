import * as THREE from 'three';
import BaseObject from '@/utils/pencil/BaseObject';

export default class Grid extends BaseObject {
  static options = {
    size: 10,
    divisions: 10,
  };

  constructor(...args: ConstructorParameters<typeof BaseObject>) {
    super(args[0], {
      ...Grid.options,
      ...args[1],
    });
  }

  create() {
    const {size, divisions, colorCenterLine, colorGrid} = this.options;
    const grid = new THREE.GridHelper(
      size,
      divisions,
      colorCenterLine,
      colorGrid
    );
    this.object3d = grid;
  }
}
