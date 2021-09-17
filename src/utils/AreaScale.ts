import {scaleLinear, ScaleLinear} from 'd3-scale';
import * as THREE from 'three';

interface Position {
  x: number;
  y: number;
}

export interface AreaScaleType {
  xScale: ScaleLinear<number, number, never>;
  yScale: ScaleLinear<number, number, never>;
  getPoint(lon: number, lat: number): Position;
  getPercent(lon: number, lat: number): THREE.Vector2;
}

export default function AreaScale(
  area: [number, number, number, number],
  size: [number, number]
): AreaScaleType {
  const [maxX, maxY, minX, minY] = area;
  const [sizeX, sizeY] = size;

  const xScale = scaleLinear()
    .domain([maxX, minX])
    .range([-sizeX / 2, sizeX / 2]);
  const yScale = scaleLinear()
    .domain([maxY, minY])
    .range([-sizeY / 2, sizeY / 2]);

  const xScaleOrigin = scaleLinear().domain([maxX, minX]);
  const yScaleOrigin = scaleLinear().domain([maxY, minY]);

  const getPoint = (lon: number, lat: number) => ({
    x: xScale(lon),
    y: yScale(lat),
  });

  const getPercent = (lon: number, lat: number) =>
    new THREE.Vector2(xScaleOrigin(lon), yScaleOrigin(lat));

  return {
    xScale,
    yScale,
    getPoint,
    getPercent,
  };
}
