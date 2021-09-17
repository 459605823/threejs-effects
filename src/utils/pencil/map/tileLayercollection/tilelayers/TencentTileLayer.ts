/* eslint-disable no-restricted-properties */
import BaseTileLayer, {Args} from './BaseTileLayer';
import params from '../param';

type Arg = Args<typeof params.Tencent>;

class TencentTileLayer extends BaseTileLayer {
  public options: Arg['options'];

  constructor(id: Arg['id'], options: Arg['options'] = {}) {
    const style = options.style || 'Normal';
    options.urlTemplate = params.Tencent[style].url;
    super(id, options);
  }

  getTileUrl(x: number, y: number, z: number) {
    const urlArgs = this.getUrlArgs(x, y, z);
    const l = urlArgs.z;
    const r = urlArgs.x;
    const c = urlArgs.y;

    const m = Math.floor(r / 16.0);
    const n = Math.floor(c / 16.0);
    const {urlTemplate} = this.options;
    const url = (urlTemplate as string)
      .replace('{x}', `${r}`)
      .replace('{y}', `${c}`)
      .replace('{z}', `${l}`)
      .replace('{m}', `${m}`)
      .replace('{n}', `${n}`);
    return url;
  }

  getUrlArgs(x: number, y: number, z: number) {
    return {
      z,
      x,
      y: Math.pow(2, z) - 1 - y,
    };
  }
}

export default TencentTileLayer;
