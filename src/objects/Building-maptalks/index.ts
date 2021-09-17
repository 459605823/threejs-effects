import * as THREE from 'three';
import * as maptalks from 'maptalks';
import BaseObject from '@/utils/pencil/BaseObject';
import {getGeojson} from '@/utils/pencil/map/utils';

export default class Build extends BaseObject {
  json: any[];

  material: THREE.MeshBasicMaterial;

  static options = {
    buildingColor: '#3c4046',
    buildingTopColor: '',
    exp: 1,
    altitude: 0,
  };

  constructor(...args: ConstructorParameters<typeof BaseObject>) {
    super(args[0], {
      ...Build.options,
      ...args[1],
    });
  }

  async init() {
    const {url, fn, json, buildingColor} = this.options;
    this.json = json || (await getGeojson(url, {f: fn}));
    if (!this.options.material && this.options.texture) {
      const {texture} = this.options;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.anisotropy = 16;
      texture.needsUpdate = true;
      this.options.material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        blending: THREE.AdditiveBlending,
      });
    } else if (!this.options.material) {
      this.options.material = new THREE.MeshLambertMaterial({
        color: buildingColor,
        transparent: true,
        opacity: 0.5,
      });
    }

    this.options.material.vertexColors = true;
  }

  create() {
    const {json} = this;
    const {height, exp} = this.options;
    const j: {
      g: any;
      height: number;
    }[] = [];

    json.forEach((g: any) => {
      const floorHeight = (+g.properties.FloorHeight || 3) * 1;
      const floorNum = +g.properties.FloorNum || 5;
      const h = height ?? (+g.properties.Height || floorHeight * floorNum);
      j.push({g, height: h * exp});
    });
    this.box.push(this.getMesh(j));
  }

  getMesh(json: any[]) {
    if (!json.length) {
      return [];
    }

    const {buildingTopColor, altitude, material} = this.options;
    const {layer} = this.pencil.plugin;
    const polygons = json.map(({g, height}) => {
      const polygon = maptalks.GeoJSON.toGeometry(g);
      if (height) {
        polygon.setProperties({
          height,
        });
      }

      return polygon;
    });

    const mesh = layer.toExtrudePolygons(
      polygons,
      {interactive: false},
      material
    );
    if (altitude) {
      mesh.setAltitude(altitude);
    }

    if (buildingTopColor) {
      const topColor = new THREE.Color(buildingTopColor);
      const bufferGeometry = mesh.getObject3d().geometry;
      const geometry = new THREE.Geometry().fromBufferGeometry(bufferGeometry);
      const {vertices, faces, faceVertexUvs} = geometry;
      for (let i = 0, len = faces.length; i < len; i++) {
        const {a, b, c} = faces[i];
        const p1 = vertices[a];
        const p2 = vertices[b];
        const p3 = vertices[c];
        // top face
        if (p1.z > 0 && p2.z > 0 && p3.z > 0) {
          const {vertexColors} = faces[i];
          for (let j = 0, len1 = vertexColors.length; j < len1; j++) {
            vertexColors[j].r = topColor.r;
            vertexColors[j].g = topColor.g;
            vertexColors[j].b = topColor.b;
          }
          const uvs = faceVertexUvs[0][i];
          for (let j = 0, len1 = uvs.length; j < len1; j++) {
            uvs[j].x = 0;
            uvs[j].y = 0;
          }
        }
      }
      mesh.getObject3d().geometry = new THREE.BufferGeometry().fromGeometry(
        geometry
      );
      bufferGeometry.dispose();
      geometry.dispose();
    }
    return mesh;
  }

  dispose() {
    this.json = [];
  }
}
