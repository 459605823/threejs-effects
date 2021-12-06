import * as THREE from 'three';

import makePromiseCreator from '@/utils/makePromiseCreator';
import Pencil from './index';

export {CSS3DObject} from 'three/examples/jsm/renderers/CSS3DRenderer';

type Options = Record<string, any>;

export default class BaseObject {
  public name?: string;

  public object3d: THREE.Object3D;

  public box: any[] = [];

  public isAdd: boolean;

  public options: Options;

  public pm: ReturnType<typeof makePromiseCreator>;

  private visible = true;

  constructor(public pencil: Pencil, options: Options = {}) {
    this.options = pencil.plugin
      ? pencil.plugin.formatOptions(options)
      : {...options};
    this.isAdd = false;
    this.pm = makePromiseCreator();
  }

  public init(...args: any[]) {}

  public create(...args: any[]) {}

  public render(...args: any[]) {}

  public update(...args: any[]) {}

  public show() {
    if (this.object3d) {
      this.object3d.visible = true;
    }
    this.box.flat(Infinity).forEach((el, i) => {
      el.show?.();
    });
    this.visible = true;
    return this;
  }

  public hide() {
    if (this.object3d) {
      this.object3d.visible = false;
    }

    this.box.flat(Infinity).forEach((el, i) => {
      el.hide?.();
    });

    this.visible = false;
    return this;
  }

  public isVisible() {
    return this.visible;
  }

  public createMesh(...args: ConstructorParameters<typeof THREE.Mesh>) {
    this.object3d = new THREE.Mesh(...args);
    return this;
  }

  public createGroup() {
    this.object3d = new THREE.Group();
    return this;
  }

  public createPoints(...args: ConstructorParameters<typeof THREE.Points>) {
    this.object3d = new THREE.Points(...args);
    return this;
  }

  public add(...args: Parameters<THREE.Object3D['add']>) {
    this.object3d.add(...args);
    return this;
  }

  public remove(...args: Parameters<THREE.Object3D['remove']>) {
    this.object3d.remove(...args);
    return this;
  }

  animateIn(...args: any[]) {}

  public dispose() {}
}
