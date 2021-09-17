import makePromiseCreator from '@/utils/makePromiseCreator';

type Features = {
  geometry: {
    coordinates: any[];
  };
  properties: Record<string, any>;
}[];

export const insideCircle = (circle: number[], radius: number) => {
  return (features: Features) => {
    const res: any[] = [];
    features.forEach((feature) => {
      const {coordinates} = feature.geometry;
      const point =
        coordinates.length === 1 ? coordinates[0][0] : coordinates[0];
      const dx = circle[0] - point[0];
      const dy = circle[1] - point[1];
      if (dx * dx + dy * dy <= radius * radius) {
        res.push(feature);
      }
    });
    return res;
  };
};

export const hasKeyword = (key: string, Keyword: string) => {
  return (features: Features) => {
    const res: any[] = [];
    features.forEach((feature) => {
      const {properties} = feature;
      if (properties[key] && properties[key].indexOf(Keyword) !== -1) {
        res.push(feature);
      }
    });
    return res;
  };
};

export const insidePolygon = (points: number[][]) => {
  return (features: Features) => {
    const res: any[] = [];
    features.forEach((feature) => {
      const {coordinates} = feature.geometry;
      const point =
        coordinates.length === 1 ? coordinates[0][0] : coordinates[0];
      const x = point[0];
      const y = point[1];
      let inside = false;
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i][0];
        const yi = points[i][1];
        const xj = points[j][0];
        const yj = points[j][1];

        const intersect =
          yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }
      if (inside) {
        res.push(feature);
      }
    });
    return res;
  };
};

export const getGeojson = (
  url: string,
  options?: {
    f: Function | Function[];
  }
): Promise<any[]> => {
  const pm = makePromiseCreator();
  fetch(url)
    .then((res) => res.json())
    .then((json) => {
      let res = [];
      const features = json.features || json;
      if (options?.f) {
        if (Array.isArray(options.f)) {
          res = options.f.reduce((prev, curr) => {
            return curr(prev);
          }, features);
        } else {
          res = options.f(features);
        }
      } else {
        res = features;
      }
      pm.resolve(res);
    });

  return pm.promise;
};

export const getOriginGeojson = (url: string): Promise<any[]> => {
  const pm = makePromiseCreator();
  fetch(url)
    .then((res) => res.json())
    .then((json) => {
      pm.resolve(json);
    });

  return pm.promise;
};
