import * as maptalks from 'maptalks';
import * as THREE from 'three';

export default function getArcPoints(lineString, height, layer) {
  const lnglats = [];
  if (Array.isArray(lineString)) {
    lnglats.push(lineString[0], lineString[lineString.length - 1]);
  } else if (lineString instanceof maptalks.LineString) {
    const coordinates = lineString.getCoordinates();
    lnglats.push(coordinates[0], coordinates[coordinates.length - 1]);
  }
  const [first, last] = lnglats;
  let center;
  if (Array.isArray(first)) {
    center = [first[0] / 2 + last[0] / 2, first[1] / 2 + last[1] / 2];
  } else if (first instanceof maptalks.Coordinate) {
    center = [first.x / 2 + last.x / 2, first.y / 2 + last.y / 2];
  }
  const centerPt = layer.coordinateToVector3(lineString.getCenter());
  const v = layer.coordinateToVector3(first).sub(centerPt);
  const v1 = layer.coordinateToVector3(last).sub(centerPt);
  const vh = layer.coordinateToVector3(center, height).sub(centerPt);
  const ellipse = new THREE.CatmullRomCurve3([v, vh, v1], false, 'catmullrom');
  const points = ellipse.getPoints(40);
  return points;
}
