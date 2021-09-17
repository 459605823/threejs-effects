/* eslint-disable camelcase */
import * as THREE from 'three';
import {OBJExporter} from 'three/examples/jsm/exporters/OBJExporter';
import BaseObject from '@/utils/pencil/BaseObject';
import {getGeojson} from '@/utils/pencil/map/utils';
import type {AreaScaleType} from '@/utils/AreaScale';
import Terrain from '../Terrain/index';

function download(content: string, fileName: string) {
  const blob = new Blob([content]);
  const a = document.createElement('a');
  const url = window.URL.createObjectURL(blob);
  const filename = fileName;
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

const WorldUVGenerator = {
  generateTopUV(
    geometry: any,
    vertices: any[],
    indexA: number,
    indexB: number,
    indexC: number
  ) {
    const a_x = vertices[indexA * 3];
    const a_y = vertices[indexA * 3 + 1];
    const b_x = vertices[indexB * 3];
    const b_y = vertices[indexB * 3 + 1];
    const c_x = vertices[indexC * 3];
    const c_y = vertices[indexC * 3 + 1];

    return [
      new THREE.Vector2(a_x, a_y),
      new THREE.Vector2(b_x, b_y),
      new THREE.Vector2(c_x, c_y),
    ];
  },

  generateSideWallUV(
    geometry: any,
    vertices: any[],
    indexA: number,
    indexB: number,
    indexC: number,
    indexD: number
  ) {
    const a_x = vertices[indexA * 3];
    const a_y = vertices[indexA * 3 + 1];
    const a_z = vertices[indexA * 3 + 2];
    const b_x = vertices[indexB * 3];
    const b_y = vertices[indexB * 3 + 1];
    const b_z = vertices[indexB * 3 + 2];
    const c_x = vertices[indexC * 3];
    const c_y = vertices[indexC * 3 + 1];
    const c_z = vertices[indexC * 3 + 2];
    const d_x = vertices[indexD * 3];
    const d_y = vertices[indexD * 3 + 1];
    const d_z = vertices[indexD * 3 + 2];

    if (Math.abs(a_y - b_y) < Math.abs(a_x - b_x)) {
      return [
        new THREE.Vector2(a_x, 1 - a_z),
        new THREE.Vector2(b_x, 1 - b_z),
        new THREE.Vector2(c_x, 1 - c_z),
        new THREE.Vector2(d_x, 1 - d_z),
      ];
    }
    return [
      new THREE.Vector2(a_y, 1 - a_z),
      new THREE.Vector2(b_y, 1 - b_z),
      new THREE.Vector2(c_y, 1 - c_z),
      new THREE.Vector2(d_y, 1 - d_z),
    ];
  },
};
export default class Build extends BaseObject {
  json: any[];

  material: THREE.MeshLambertMaterial;

  static options = {
    buildingColor: '#dddddd',
    buildingTopColor: '',
    exp: 1,
    altitude: 0,
    area: [-Infinity, -Infinity, Infinity, Infinity],
    terrain: null,
  };

  constructor(...args: ConstructorParameters<typeof BaseObject>) {
    super(args[0], {
      ...Build.options,
      ...args[1],
    });

    this.createGroup();
  }

  async init() {
    const {url} = this.options;
    this.json = await getGeojson(url);

    this.options.material.vertexColors = true;
  }

  create() {
    const {json} = this;
    const {
      height,
      exp,
      material,
      lineMaterial,
      areaScale,
      terrain,
      position,
    }: {
      terrain?: Terrain;
      height?: number;
      exp?: number;
      material?: THREE.Material;
      lineMaterial?: THREE.Material;
      areaScale?: AreaScaleType;
      position?: [number, number, number];
    } = this.options;
    const polygons: {
      polygon: [number, number][];
      height: number;
    }[] = [];

    json.forEach((g: any) => {
      const polygon = g?.geometry?.coordinates?.[0] || [];
      if (!polygon.length || g?.properties?.landuse !== 'residential') {
        // if (!polygon.length || g?.properties?.id !== 'way/532477046') {
        return;
      }

      g.properties = g.properties || {};
      const floorHeight = +g.properties.FloorHeight || 1 + Math.random();
      const floorNum = +g.properties.FloorNum || 5;
      const h = height ?? (+g.properties.Height || floorHeight * floorNum);
      polygons.push({polygon, height: h * exp!});
    });
    const geometry = new THREE.Geometry();

    const {xScale, yScale, getPercent} = areaScale!;
    polygons.slice(0, 1000).forEach((item, _i) => {
      const shape = new THREE.Shape();
      const center = new THREE.Vector2();
      item.polygon.forEach(([x, y], _index) => {
        if (!_index) {
          shape.moveTo(xScale(x), yScale(y));
        } else {
          shape.lineTo(xScale(x), yScale(y));
          const origin = getPercent(x, y);
          center.add(new THREE.Vector2(origin.x, origin.y));
        }
      });
      // extrude形状的UV错误在r129版本被修复
      const _geometry = new THREE.ExtrudeGeometry(shape, {
        steps: 1,
        bevelSegments: 0,
        depth: item.height,
        bevelEnabled: true,
        bevelThickness: 0,
        bevelSize: 0,
        bevelOffset: 0,
        UVGenerator: WorldUVGenerator,
      });
      const mesh = new THREE.Mesh(_geometry);
      if (terrain) {
        const {x, y} = center.divideScalar(shape.curves.length);
        if (
          !Number.isNaN(x) &&
          !Number.isNaN(y) &&
          x < 1 &&
          y < 1 &&
          x > 0 &&
          y > 0
        ) {
          const offset = terrain.getPosition(x, 1.0 - y);
          if (offset) {
            mesh.position.z = offset!.z;
            mesh.updateMatrix();
          }
        }
      }
      geometry.merge(mesh.geometry, mesh.matrix);
    });
    const line = new THREE.LineSegments(geometry, lineMaterial);
    // const exporter = new OBJExporter();
    // const parseStr = exporter.parse(new THREE.Mesh(geometry, material));
    // download(parseStr, 'building.obj');
    this.object3d.add(new THREE.Mesh(geometry, material));
    // this.object3d.add(line);
    this.object3d.position.sub(new THREE.Vector3(...position!));
    this.object3d.rotation.x = Math.PI / -2;
    this.object3d.position.y = 2;
  }

  dispose() {
    this.json = [];
  }
}
