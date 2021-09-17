import BaseTileLayer, {Args} from './BaseTileLayer';
import params from '../param';

type Arg = Args<typeof params.Osm>;

class OsmTileLayer extends BaseTileLayer {
  constructor(id: Arg['id'], options: Arg['options'] = {}) {
    const style = options.style || 'Normal';
    options.urlTemplate = params.Osm[style].url;
    super(id, options);
  }
}

export default OsmTileLayer;
