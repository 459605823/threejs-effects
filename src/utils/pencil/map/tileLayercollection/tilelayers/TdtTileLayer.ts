import BaseTileLayer, {Args} from './BaseTileLayer';
import params from '../param';

type Arg = Args<typeof params.TDT>;

class TDTTileLayer extends BaseTileLayer {
  constructor(id: Arg['id'], options: Arg['options'] = {}) {
    const style = options.style || 'Normal';
    options.urlTemplate = params.TDT[style].url;
    super(id, options);
  }
}

export default TDTTileLayer;
