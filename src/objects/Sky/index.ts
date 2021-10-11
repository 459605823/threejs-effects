import {Sky} from 'three/examples/jsm/objects/Sky';
import BaseObject from '@/utils/pencil/BaseObject';

export default class SkyBox extends BaseObject {
  constructor(...args: ConstructorParameters<typeof BaseObject>) {
    super(args[0], {
      ...SkyBox.options,
      ...args[1],
    });
  }

  static options = {
    scale: 10000,
    turbidity: 0.1,
    rayleigh: 1,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.8,
  };

  create() {
    const {options} = this;
    const {scale, turbidity, rayleigh, mieCoefficient, mieDirectionalG} =
      options;
    const sky = new Sky();
    sky.scale.setScalar(scale);
    const skyUniforms = sky.material.uniforms;
    skyUniforms.turbidity.value = turbidity;
    skyUniforms.rayleigh.value = rayleigh;
    skyUniforms.mieCoefficient.value = mieCoefficient;
    skyUniforms.mieDirectionalG.value = mieDirectionalG;

    this.createGroup();
    this.object3d.add(sky);
  }
}
