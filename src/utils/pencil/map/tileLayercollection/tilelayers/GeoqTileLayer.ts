import BaseTileLayer, {Args} from './BaseTileLayer';
import params from '../param';

type Arg = Args<typeof params.GEOQ>;
class GeoqTileLayer extends BaseTileLayer {
  constructor(id: Arg['id'], options: Arg['options'] = {}) {
    const style = options.style || 'Colour';
    options.urlTemplate = params.GEOQ[style].url;
    super(id, options);
  }
}

export default GeoqTileLayer;
