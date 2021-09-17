import BaseTileLayer, {Args} from './BaseTileLayer';
import params from '../param';

type Arg = Args<typeof params.Amap>;

class AmapTileLayer extends BaseTileLayer {
  constructor(id: Arg['id'], options: Arg['options'] = {}) {
    const style = options.style || 'Normal';
    options.urlTemplate = params.Amap[style].url;
    super(id, options);
  }
}

export default AmapTileLayer;
