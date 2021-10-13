import * as THREE from 'three';
import {EXRLoader} from 'three/examples/jsm/loaders/EXRLoader';
import BaseObject from '@/utils/pencil/BaseObject';
import {getImage} from '@/utils/pencil/utils';

export default class EnvBackground extends BaseObject {
  uniforms: {[key: string]: THREE.IUniform};

  time: number;

  constructor(...args: ConstructorParameters<typeof BaseObject>) {
    super(args[0], {
      ...args[1],
    });
  }

  create() {
    const {pencil} = this;
    const {scene, renderer} = pencil;
    const pmremGenerator = new THREE.PMREMGenerator(renderer!);
    pmremGenerator.compileEquirectangularShader();
    new EXRLoader().load(getImage('kloppenheim_02_4k.exr'), (texture) => {
      const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
      scene!.environment = exrCubeRenderTarget.texture; // 给场景添加环境光效果
      scene!.background = exrCubeRenderTarget.texture; // 给场景添加背景图
    });
  }
}
