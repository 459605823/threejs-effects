import BaseTileLayer, {Args} from './BaseTileLayer';
import params from '../param';

type Arg = Args<typeof params.CartoDb>;

class CartoDbTileLayer extends BaseTileLayer {
  constructor(id: Arg['id'], options: Arg['options'] = {}) {
    const style = options.style || 'Light';
    options.urlTemplate = params.CartoDb[style].url;
    super(id, options);
  }
}

export default CartoDbTileLayer;
