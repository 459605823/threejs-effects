declare module '*.vue' {
  import type {DefineComponent} from 'vue';

  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '*.glsl' {
  export default string;
}

declare module '*.jpg' {
  export default string;
}
declare module '*.png' {
  export default string;
}

declare module '*.gltf' {
  export default string;
}

declare module 'maptalks' {
  // import * as THREE from 'three';

  export class TileLayer {
    constructor(...args: any[]);
  }

  export class GroupTileLayer {
    constructor(...args: any[]);
  }
  export class Map {
    constructor(...args: any[]);

    setBaseLayer(...args: any[]) {}

    setBaseLayer(...args: any[]) {}

    getCenter(...args: any[]) {}

    setCenter(...args: any[]) {}

    setBearing(arg: number) {}

    setZoom(zoom: number, options?: {animation: boolean}) {}

    setPitch(zoom: number) {}

    getView(...args: any[]): {} {}

    getDevicePixelRatio(...args: any[]): number | void {}

    animateTo(...args: any[]) {}
  }
  export class Coordinate {
    constructor(...args: any[]);

    x: number;

    y: number;
  }
  export class Polygon {
    constructor(...args: any[]);

    getCenter(...args: any[]) {}

    getShell(...args: any[]): any[] {}
  }
  export class LineString {
    constructor(...args: any[]);

    getCoordinates(...args: any[]);

    getCenter(...args: any[]);
  }

  export class Extent {
    constructor(...args: any[]);

    add(...args: any[]);
  }
  export const GeoJSON = {
    toGeometry<T>(arg: T): T extends any[] ? any[] : any {},
  };
}

declare module 'maptalks.three/dist/maptalks.three' {
  export default any;
  export const ThreeLayer: any;
  export const BaseObject: any;
}
