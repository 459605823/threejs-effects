import * as THREE from 'three';
import * as maptalks from 'maptalks';
import {ThreeLayer} from 'maptalks.three/dist/maptalks.three';
import deepmerge from 'deepmerge';
import makePromiseCreator from '@/utils/makePromiseCreator';
import TileLayerCollection from './tileLayercollection';
import './bloom';

const isDev = process.env.NODE_ENV === 'development';

type DeepPartial<T> = T extends Function
  ? T
  : T extends object
  ? {[P in keyof T]?: DeepPartial<T[P]>}
  : T;

interface Options {
  container: HTMLElement;
  map: {
    center: number[];
    zoom: number;
    pitch: number;
    bearing: number;
    centerCross: boolean;
    draggable: boolean;
    dragPan: boolean;
    dragRotate: boolean;
    dragPitch: boolean;
    scrollWheelZoom: boolean;
    touchZoom: boolean;
    doubleClickZoom: boolean;
    attribution: boolean;
  };
  layer: {
    forceRenderOnMoving: boolean;
    forceRenderOnZooming: boolean;
    forceRenderOnRotating: boolean;
  };
  bloom: boolean;
  pointLightPosition: number[];
}

export default class Map {
  ready = makePromiseCreator();

  scene: THREE.Scene;

  camera: THREE.PerspectiveCamera;

  renderer: THREE.WebGLRenderer;

  distanceMap: Record<string, number> = {'0': 0};

  static options = {
    container: document.body,
    map: {
      center: [],
      zoom: 15,
      pitch: 75,
      bearing: 0,
      centerCross: isDev,
      draggable: false,
      dragPan: false,
      dragRotate: false,
      dragPitch: false,
      scrollWheelZoom: false,
      touchZoom: false,
      doubleClickZoom: false,
      attribution: false,
    },
    layer: {
      forceRenderOnMoving: true,
      forceRenderOnZooming: true,
      forceRenderOnRotating: true,
    },
    bloom: false,
    pointLightPosition: [],
  };

  public isDev: boolean = isDev;

  public options: Options;

  public map: maptalks.Map;

  public layer: typeof ThreeLayer;

  constructor(options: DeepPartial<Options> = {}) {
    this.isDev = isDev;
    this.options = deepmerge(Map.options, options, {
      customMerge: (key) => {
        if (key === 'container') {
          return (a, b) => b;
        }
      },
    });
    this.init();
  }

  init() {
    this.setMap();
    this.setLayer();
  }

  setMap() {
    const {container, map: mapOptions} = this.options;
    const map = new maptalks.Map(container, mapOptions);
    this.map = map;
  }

  setBaseLayer() {
    const baseLayer = TileLayerCollection.getAmapTileLayer('1', {
      style: 'Satellite',
    });
    this.map.setBaseLayer(baseLayer);
  }

  setLayer() {
    const {bloom} = this.options;
    const layer = new ThreeLayer('t', this.options.layer);
    this.layer = layer;
    layer.prepareToDraw = (
      gl: THREE.WebGLRenderer,
      scene: THREE.Scene,
      camera: THREE.PerspectiveCamera
    ) => {
      gl.getContext().getExtension('OES_standard_derivatives');

      this.scene = scene;
      this.camera = camera;
      this.renderer = gl;
      this.addLight();
      if (bloom) {
        layer.initBloom();
        layer.setRendererRenderScene();
      }
      this.ready.resolve();
    };
    layer.addTo(this.map);
  }

  addLight() {
    const {scene} = this;
    const {pointLightPosition, map} = this.options;

    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, -10, 10).normalize();
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 2);
    const defPointLightPosition = [...map.center, 8000];
    const position = this.getPosition(
      ...(pointLightPosition.length
        ? pointLightPosition
        : defPointLightPosition)
    );
    pointLight.position.copy(position);
    scene.add(pointLight);
  }

  formatOptions(options: Record<string, any>) {
    const res = {} as Record<string, any>;
    Object.keys(options).forEach((key) => {
      if (key === '_position') {
        res.position = this.getPosition(...options[key]);
      } else if (key.startsWith('_')) {
        res[key.slice(1)] = this.getDistance(options[key]);
      } else {
        res[key] = options[key];
      }
    });
    return res;
  }

  getPosition(...args: any[]): THREE.Vector3 {
    const {layer} = this;
    let coordinate;
    let height;
    if (args.length === 2 && args[0] instanceof maptalks.Coordinate) {
      [coordinate, height] = args;
    } else if (args.length === 3) {
      coordinate = this.getCoordinate(args[0], args[1]);
      [, , height] = args;
    }

    const position = layer.coordinateToVector3(
      coordinate,
      this.getDistance(height)
    );
    return position;
  }

  getDistance(n: number) {
    const cache = this.distanceMap[`${n}`];
    if (typeof cache !== 'undefined') {
      return cache;
    }
    const d = this.layer.distanceToVector3(n, n).x;
    this.distanceMap[`${n}`] = d;
    return d;
  }

  getCoordinate(...args: any[]) {
    return new maptalks.Coordinate(...args);
  }

  getPolygonCenter(p: any) {
    let polygon = p;
    if (Array.isArray(polygon)) {
      polygon = new maptalks.Polygon([polygon]);
    }
    return polygon.getCenter();
  }

  addMesh(mesh: THREE.Object3D) {
    this.layer.addMesh(mesh);
  }

  removeMesh(mesh: THREE.Object3D) {
    this.layer.removeMesh(mesh);
  }

  render() {
    this.layer._needsUpdate = !this.layer._needsUpdate;
    if (this.layer._needsUpdate) {
      this.layer.renderScene();
    }
  }
}
