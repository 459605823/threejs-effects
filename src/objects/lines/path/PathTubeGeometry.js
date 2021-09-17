/* eslint-disable eqeqeq */
/* eslint-disable no-shadow */
import * as THREE from 'three';
import PathPoint from './PathPoint';
import PathGeometry from './PathGeometry';
/**
 * PathTubeGeometry
 */
class PathTubeGeometry extends PathGeometry {
  constructor(maxVertex = 1000) {
    super(maxVertex);
  }

  _updateAttributes(pathPointList, options) {
    const radius = options.radius || 0.1;
    const radialSegments = Math.max(2, options.radialSegments || 8);
    const startRad = options.startRad || 0;
    const progress = options.progress !== undefined ? options.progress : 1;

    let count = 0;

    // modify data
    const position = [];
    const normal = [];
    const uv = [];
    const indices = [];
    let verticesCount = 0;

    const normalDir = new THREE.Vector3();
    function addVertices(pathPoint, radius, radialSegments, uvDist) {
      const first = position.length === 0;

      for (let r = 0; r <= radialSegments; r++) {
        let _r = r;
        if (_r == radialSegments) {
          _r = 0;
        }
        normalDir
          .copy(pathPoint.up)
          .applyAxisAngle(
            pathPoint.dir,
            startRad + (Math.PI * 2 * _r) / radialSegments
          )
          .normalize();

        position.push(
          pathPoint.pos.x + normalDir.x * radius * pathPoint.widthScale,
          pathPoint.pos.y + normalDir.y * radius * pathPoint.widthScale,
          pathPoint.pos.z + normalDir.z * radius * pathPoint.widthScale
        );
        normal.push(normalDir.x, normalDir.y, normalDir.z);
        uv.push(uvDist, r / radialSegments);

        verticesCount++;
      }

      if (!first) {
        const begin1 = verticesCount - (radialSegments + 1) * 2;
        const begin2 = verticesCount - (radialSegments + 1);

        for (let i = 0; i < radialSegments; i++) {
          indices.push(
            begin2 + i,
            begin1 + i,
            begin1 + i + 1,
            begin2 + i,
            begin1 + i + 1,
            begin2 + i + 1
          );

          count += 6;
        }
      }
    }

    // build path geometry
    const totalDistance = pathPointList.distance();
    const progressDistance = progress * totalDistance;

    if (progressDistance == 0) {
      return 0;
    }

    if (progressDistance > 0) {
      for (let i = 0; i < pathPointList.count; i++) {
        const pathPoint = pathPointList.array[i];

        if (pathPoint.dist > progressDistance) {
          const prevPoint = pathPointList.array[i - 1];
          const lastPoint = new PathPoint();

          // linear lerp for progress
          const alpha =
            (progressDistance - prevPoint.dist) /
            (pathPoint.dist - prevPoint.dist);
          lastPoint.lerpPathPoints(prevPoint, pathPoint, alpha);

          addVertices(
            lastPoint,
            radius,
            radialSegments,
            lastPoint.dist / (radius * 2 * Math.PI)
          );
          break;
        } else {
          addVertices(
            pathPoint,
            radius,
            radialSegments,
            pathPoint.dist / (radius * 2 * Math.PI)
          );
        }
      }
    }

    let positionAttribute = this.getAttribute('position');
    let normalAttribute = this.getAttribute('normal');
    let uvAttribute = this.getAttribute('uv');
    let indexAttribute = this.getIndex();

    this._resizeAttribute('position', positionAttribute, position.length);
    this._resizeAttribute('normal', normalAttribute, normal.length);
    this._resizeAttribute('uv', uvAttribute, uv.length);
    this._resizeIndex(indexAttribute, indices.length);

    positionAttribute = this.getAttribute('position');
    normalAttribute = this.getAttribute('normal');
    uvAttribute = this.getAttribute('uv');
    indexAttribute = this.getIndex();

    positionAttribute.array.set(position, 0);
    normalAttribute.array.set(normal, 0);
    uvAttribute.array.set(uv, 0);
    indexAttribute.set(indices, 0);

    positionAttribute.updateRange.count = position.length;
    normalAttribute.updateRange.count = normal.length;
    uvAttribute.updateRange.count = uv.length;
    indexAttribute.updateRange.count = indices.length;

    positionAttribute.needsUpdate = true;
    normalAttribute.needsUpdate = true;
    uvAttribute.needsUpdate = true;
    indexAttribute.needsUpdate = true;

    return count;
  }
}

export default PathTubeGeometry;
