import * as maptalks from 'maptalks';
import * as THREE from 'three';
import BaseObject from '@/utils/pencil/BaseObject';
import {getGeojson} from '@/utils/pencil/map/utils';
import lineLength from '@/utils/lineLength';
import getTexture from './texture';

export default class Road extends BaseObject {
  json: any[];

  lineStrings: any[];

  static options = {
    type: 'sprite',
    texture: getTexture('rgba(253,128,93,0.3)', 'rgba(253,128,93,1)'),
    speed: 1,
    pathOptions: {},
    bloom: false,
    altitude: 0,
    minLineLength: 0,
    exp: 1,
  };

  constructor(...args: ConstructorParameters<typeof BaseObject>) {
    super(args[0], {
      ...Road.options,
      ...args[1],
    });
  }

  async init() {
    const {url, fn} = this.options;
    const json = await getGeojson(url, {f: fn});
    this.json = json;
  }

  create() {
    const {json} = this;
    const {layer} = this.pencil.plugin;
    const {type, altitude, bloom, material} = this.options;

    const lineStrings = maptalks.GeoJSON.toGeometry(json);
    this.lineStrings = lineStrings;
    if (type === 'sprite' || type === 'path') {
      this.createGroup();
      // const center = this.getCenter(lineStrings);
      // const pos = this.pencil.plugin.getPosition(center, altitude);
      // this.object3d.position.copy(pos);
    } else if (type === 'line') {
      // lineStrings.forEach((lineString) => {
      //   lineString.setProperties({altitude, width: 3, height: 1});
      // });

      const mesh = layer.toLines(
        lineStrings,
        {altitude, width: 4, height: 1},
        material ||
          new THREE.MeshBasicMaterial({
            color: 'rgb(255,45,0)',
          })
      );
      if (bloom) {
        mesh.object3d.layers.enable(1);
      }

      this.box = [mesh];
    }
  }

  render() {
    const {json, lineStrings} = this;
    const {
      type,
      texture,
      speed,
      bloom,
      minLineLength,
      exp,
      altitude,
      key,
      material,
      width,
    } = this.options;

    if (type === 'sprite' || type === 'path') {
      lineStrings
        .filter((lineString, i) => {
          if (minLineLength) {
            const len = lineLength(lineString);
            return len >= minLineLength;
          }
          return true;
        })
        .forEach((lineString, i) => {
          let lineWidth = json[i].properties.RoadWidth;
          lineWidth = parseInt(lineWidth, 10);
          lineWidth = lineWidth < 2 ? 2 : lineWidth;
          const center = lineString.getCenter();
          if (type === 'sprite') {
            this.pencil.draw(
              'spriteLine',
              {
                lineString,
                lineWidth: width ?? lineWidth * exp,
                bloom,
                center,
                _position: [center, altitude],
                texture,
                speed,
              },
              'road'
            );
          } else if (type === 'path') {
            this.pencil.draw(
              `path#${key || ''}`,
              {
                lineString,
                bloom,
                _position: [center, altitude],
                texture,
                speed,
                width,
                material,
              },
              'road'
            );
          }
        });
    }
  }

  getCenter(lineStrings: any[]) {
    if (!Array.isArray(lineStrings)) {
      lineStrings = [lineStrings];
    }
    const len = lineStrings.length;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < len; i++) {
      const lineString = lineStrings[i];
      const center = lineString.getCenter();
      const {x} = center;
      const {y} = center;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
    // Get the center point of the point set
    const center = new maptalks.Coordinate(
      (minX + maxX) / 2,
      (minY + maxY) / 2
    );
    return center;
  }

  update(delta: number) {
    const {speed, type, texture} = this.options;
    if (this.options.speed && type === 'path') {
      texture.offset.x -= delta * speed * 24;
      texture.repeat.x = 1 / 24;
    }
  }

  dispose() {
    this.json = [];
  }
}
