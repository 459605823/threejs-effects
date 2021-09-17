import {GroupTileLayer} from 'maptalks';
import TdtTileLayer from './tilelayers/TdtTileLayer';
import GeoqTileLayer from './tilelayers/GeoqTileLayer';
import GoogleTileLayer from './tilelayers/GoogleTileLayer';
import AmapTileLayer from './tilelayers/AmapTileLayer';
import TencentTileLayer from './tilelayers/TencentTileLayer';
import OsmTileLayer from './tilelayers/OsmTileLayer';
import CartoDbTileLayer from './tilelayers/CartoDbTileLayer';
import MapboxTileLayer from './tilelayers/MapboxTileLayer';
import Utils from './utils';

type Option<T extends new (...args: any) => any> = ConstructorParameters<T>[1];

class TileLayerCollection {
  static getTdtTileLayer(
    id: string,
    options: Option<typeof TdtTileLayer> = {}
  ) {
    const baselayers = [];
    const baseLayer = new TdtTileLayer(Utils.uuid(), options);
    baselayers.push(baseLayer);

    if (options.style) {
      options.style += '_Label';
      const baseLayer1 = new TdtTileLayer(Utils.uuid(), options);
      baselayers.push(baseLayer1);
    }

    return new GroupTileLayer(id, baselayers);
  }

  static getGeoqTileLayer(
    id: string,
    options: Option<typeof GeoqTileLayer> = {}
  ) {
    const baseLayer = new GeoqTileLayer(id, options);
    return baseLayer;
  }

  static getGoogleTileLayer(
    id: string,
    options: Option<typeof GoogleTileLayer> = {}
  ) {
    const baseLayer = new GoogleTileLayer(id, options);
    return baseLayer;
  }

  static getAmapTileLayer(
    id: string,
    options: Option<typeof AmapTileLayer> = {}
  ) {
    if (options.style === 'Satellite') {
      const baseLayers = [];
      const baseLayer = new AmapTileLayer(Utils.uuid(), options);
      baseLayers.push(baseLayer);
      options.style = `${options.style}_Label` as 'Satellite_Label';
      const baseLayer1 = new AmapTileLayer(Utils.uuid(), options);
      baseLayers.push(baseLayer1);
      return new GroupTileLayer(id, baseLayers);
    }
    return new AmapTileLayer(id, options);
  }

  static getTencentTileLayer(
    id: string,
    options: Option<typeof TencentTileLayer> = {}
  ) {
    if (options.style === 'Normal') {
      return new TencentTileLayer(id, options);
    }
    const baseLayers = [];
    const baseLayer = new TencentTileLayer(Utils.uuid(), options);
    baseLayers.push(baseLayer);
    options.style = `${options.style}_Label` as 'Terrain_Label';
    const baseLayer1 = new TencentTileLayer(Utils.uuid(), options);
    baseLayers.push(baseLayer1);
    return new GroupTileLayer(id, baseLayers);
  }

  static getOsmTileLayer(
    id: string,
    options: Option<typeof OsmTileLayer> = {}
  ) {
    return new OsmTileLayer(id, options);
  }

  static getCartoDbTileLayer(
    id: string,
    options: Option<typeof CartoDbTileLayer> = {}
  ) {
    return new CartoDbTileLayer(id, options);
  }

  static getMapboxTileLayer(
    id: string,
    options: Option<typeof MapboxTileLayer> = {}
  ) {
    return new MapboxTileLayer(id, options);
  }
}

export default TileLayerCollection;
