/* eslint-disable */

import * as THREE from 'three';

import vertexShader from './shader/vertex';
import fragmentShader from './shader/fragment';


export function MeshLine() {
  this.positions = [];

  this.previous = [];
  this.next = [];
  this.side = [];
  this.width = [];
  this.indices_array = [];
  this.uvs = [];
  this.counters = [];
  this.geometry = new THREE.BufferGeometry();

  this.widthCallback = null;

  // Used to raycast
  this.matrixWorld = new THREE.Matrix4();
}

MeshLine.prototype.setMatrixWorld = function (matrixWorld) {
  this.matrixWorld = matrixWorld;
};

MeshLine.prototype.setGeometry = function (g, c) {
  this.widthCallback = c;

  this.positions = [];
  this.counters = [];
  // g.computeBoundingBox();
  // g.computeBoundingSphere();

  // set the normals
  // g.computeVertexNormals();
  if (g instanceof THREE.Geometry) {
    for (var j = 0; j < g.vertices.length; j++) {
      const v = g.vertices[j];
      var c = j / g.vertices.length;
      this.positions.push(v.x, v.y, v.z);
      this.positions.push(v.x, v.y, v.z);
      this.counters.push(c);
      this.counters.push(c);
    }
  }

  if (g instanceof THREE.BufferGeometry) {
    // read attribute positions ?
  }

  if (g instanceof Float32Array || g instanceof Array) {
    for (var j = 0; j < g.length; j += 3) {
      var c = j / g.length;
      this.positions.push(g[j], g[j + 1], g[j + 2]);
      this.positions.push(g[j], g[j + 1], g[j + 2]);
      this.counters.push(c);
      this.counters.push(c);
    }
  }

  this.process();
};

MeshLine.prototype.raycast = (function () {
  const inverseMatrix = new THREE.Matrix4();
  const ray = new THREE.Ray();
  const sphere = new THREE.Sphere();

  return function raycast(raycaster, intersects) {
    const precision = raycaster.linePrecision;
    const precisionSq = precision * precision;
    const interRay = new THREE.Vector3();

    const { geometry } = this;

    if (geometry.boundingSphere === null) geometry.computeBoundingSphere();

    // Checking boundingSphere distance to ray

    sphere.copy(geometry.boundingSphere);
    sphere.applyMatrix4(this.matrixWorld);

    if (raycaster.ray.intersectSphere(sphere, interRay) === false) {
      return;
    }

    inverseMatrix.getInverse(this.matrixWorld);
    ray.copy(raycaster.ray).applyMatrix4(inverseMatrix);

    const vStart = new THREE.Vector3();
    const vEnd = new THREE.Vector3();
    const interSegment = new THREE.Vector3();
    const step = this instanceof THREE.LineSegments ? 2 : 1;

    if (geometry instanceof THREE.BufferGeometry) {
      const { index } = geometry;
      const { attributes } = geometry;

      if (index !== null) {
        const indices = index.array;
        var positions = attributes.position.array;

        for (var i = 0, l = indices.length - 1; i < l; i += step) {
          const a = indices[i];
          const b = indices[i + 1];

          vStart.fromArray(positions, a * 3);
          vEnd.fromArray(positions, b * 3);

          var distSq = ray.distanceSqToSegment(vStart, vEnd, interRay, interSegment);

          if (distSq > precisionSq) continue;

          interRay.applyMatrix4(this.matrixWorld); // Move back to world space for distance calculation

          var distance = raycaster.ray.origin.distanceTo(interRay);

          if (distance < raycaster.near || distance > raycaster.far) continue;

          intersects.push({

            distance,
            // What do we want? intersection point on the ray or on the segment??
            // point: raycaster.ray.at( distance ),
            point: interSegment.clone().applyMatrix4(this.matrixWorld),
            index: i,
            face: null,
            faceIndex: null,
            object: this,

          });
        }
      } else {
        var positions = attributes.position.array;

        for (var i = 0, l = positions.length / 3 - 1; i < l; i += step) {
          vStart.fromArray(positions, 3 * i);
          vEnd.fromArray(positions, 3 * i + 3);

          var distSq = ray.distanceSqToSegment(vStart, vEnd, interRay, interSegment);

          if (distSq > precisionSq) continue;

          interRay.applyMatrix4(this.matrixWorld); // Move back to world space for distance calculation

          var distance = raycaster.ray.origin.distanceTo(interRay);

          if (distance < raycaster.near || distance > raycaster.far) continue;

          intersects.push({

            distance,
            // What do we want? intersection point on the ray or on the segment??
            // point: raycaster.ray.at( distance ),
            point: interSegment.clone().applyMatrix4(this.matrixWorld),
            index: i,
            face: null,
            faceIndex: null,
            object: this,

          });
        }
      }
    } else if (geometry instanceof THREE.Geometry) {
      const { vertices } = geometry;
      const nbVertices = vertices.length;

      for (var i = 0; i < nbVertices - 1; i += step) {
        var distSq = ray.distanceSqToSegment(vertices[i], vertices[i + 1], interRay, interSegment);

        if (distSq > precisionSq) continue;

        interRay.applyMatrix4(this.matrixWorld); // Move back to world space for distance calculation

        var distance = raycaster.ray.origin.distanceTo(interRay);

        if (distance < raycaster.near || distance > raycaster.far) continue;

        intersects.push({

          distance,
          // What do we want? intersection point on the ray or on the segment??
          // point: raycaster.ray.at( distance ),
          point: interSegment.clone().applyMatrix4(this.matrixWorld),
          index: i,
          face: null,
          faceIndex: null,
          object: this,

        });
      }
    }
  };
}());

MeshLine.prototype.compareV3 = function (a, b) {
  const aa = a * 6;
  const ab = b * 6;
  return (this.positions[aa] === this.positions[ab]) && (this.positions[aa + 1] === this.positions[ab + 1]) && (this.positions[aa + 2] === this.positions[ab + 2]);
};

MeshLine.prototype.copyV3 = function (a) {
  const aa = a * 6;
  return [this.positions[aa], this.positions[aa + 1], this.positions[aa + 2]];
};

MeshLine.prototype.process = function () {
  const l = this.positions.length / 6;

  this.previous = [];
  this.next = [];
  this.side = [];
  this.width = [];
  this.indices_array = [];
  this.uvs = [];

  for (var j = 0; j < l; j++) {
    this.side.push(1);
    this.side.push(-1);
  }

  let w;
  for (var j = 0; j < l; j++) {
    if (this.widthCallback) w = this.widthCallback(j / (l - 1));
    else w = 1;
    this.width.push(w);
    this.width.push(w);
  }

  for (var j = 0; j < l; j++) {
    this.uvs.push(j / (l - 1), 0);
    this.uvs.push(j / (l - 1), 1);
  }

  let v;

  if (this.compareV3(0, l - 1)) {
    v = this.copyV3(l - 2);
  } else {
    v = this.copyV3(0);
  }
  this.previous.push(v[0], v[1], v[2]);
  this.previous.push(v[0], v[1], v[2]);
  for (var j = 0; j < l - 1; j++) {
    v = this.copyV3(j);
    this.previous.push(v[0], v[1], v[2]);
    this.previous.push(v[0], v[1], v[2]);
  }

  for (var j = 1; j < l; j++) {
    v = this.copyV3(j);
    this.next.push(v[0], v[1], v[2]);
    this.next.push(v[0], v[1], v[2]);
  }

  if (this.compareV3(l - 1, 0)) {
    v = this.copyV3(1);
  } else {
    v = this.copyV3(l - 1);
  }
  this.next.push(v[0], v[1], v[2]);
  this.next.push(v[0], v[1], v[2]);

  for (var j = 0; j < l - 1; j++) {
    const n = j * 2;
    this.indices_array.push(n, n + 1, n + 2);
    this.indices_array.push(n + 2, n + 1, n + 3);
  }

  if (!this.attributes) {
    this.attributes = {
      position: new THREE.BufferAttribute(new Float32Array(this.positions), 3),
      previous: new THREE.BufferAttribute(new Float32Array(this.previous), 3),
      next: new THREE.BufferAttribute(new Float32Array(this.next), 3),
      side: new THREE.BufferAttribute(new Float32Array(this.side), 1),
      width: new THREE.BufferAttribute(new Float32Array(this.width), 1),
      uv: new THREE.BufferAttribute(new Float32Array(this.uvs), 2),
      index: new THREE.BufferAttribute(new Uint16Array(this.indices_array), 1),
      counters: new THREE.BufferAttribute(new Float32Array(this.counters), 1),
    };
  } else {
    this.attributes.position.copyArray(new Float32Array(this.positions));
    this.attributes.position.needsUpdate = true;
    this.attributes.previous.copyArray(new Float32Array(this.previous));
    this.attributes.previous.needsUpdate = true;
    this.attributes.next.copyArray(new Float32Array(this.next));
    this.attributes.next.needsUpdate = true;
    this.attributes.side.copyArray(new Float32Array(this.side));
    this.attributes.side.needsUpdate = true;
    this.attributes.width.copyArray(new Float32Array(this.width));
    this.attributes.width.needsUpdate = true;
    this.attributes.uv.copyArray(new Float32Array(this.uvs));
    this.attributes.uv.needsUpdate = true;
    this.attributes.index.copyArray(new Uint16Array(this.indices_array));
    this.attributes.index.needsUpdate = true;
  }



  this.geometry.setAttribute('position', this.attributes.position);
  this.geometry.setAttribute('previous', this.attributes.previous);
  this.geometry.setAttribute('next', this.attributes.next);
  this.geometry.setAttribute('side', this.attributes.side);
  this.geometry.setAttribute('width', this.attributes.width);
  this.geometry.setAttribute('uv', this.attributes.uv);
  this.geometry.setAttribute('counters', this.attributes.counters);

  this.geometry.setIndex(this.attributes.index);
};

function memcpy(src, srcOffset, dst, dstOffset, length) {
  let i;

  src = src.subarray || src.slice ? src : src.buffer;
  dst = dst.subarray || dst.slice ? dst : dst.buffer;

  src = srcOffset ? src.subarray
    ? src.subarray(srcOffset, length && srcOffset + length)
    : src.slice(srcOffset, length && srcOffset + length) : src;

  if (dst.set) {
    dst.set(src, dstOffset);
  } else {
    for (i = 0; i < src.length; i++) {
      dst[i + dstOffset] = src[i];
    }
  }

  return dst;
}

/**
 * Fast method to advance the line by one position.  The oldest position is removed.
 * @param position
 */
MeshLine.prototype.advance = function (position) {
  const positions = this.attributes.position.array;
  const previous = this.attributes.previous.array;
  const next = this.attributes.next.array;
  const l = positions.length;

  // PREVIOUS
  memcpy(positions, 0, previous, 0, l);

  // POSITIONS
  memcpy(positions, 6, positions, 0, l - 6);

  positions[l - 6] = position.x;
  positions[l - 5] = position.y;
  positions[l - 4] = position.z;
  positions[l - 3] = position.x;
  positions[l - 2] = position.y;
  positions[l - 1] = position.z;

  // NEXT
  memcpy(positions, 6, next, 0, l - 6);

  next[l - 6] = position.x;
  next[l - 5] = position.y;
  next[l - 4] = position.z;
  next[l - 3] = position.x;
  next[l - 2] = position.y;
  next[l - 1] = position.z;

  this.attributes.position.needsUpdate = true;
  this.attributes.previous.needsUpdate = true;
  this.attributes.next.needsUpdate = true;
};

THREE.ShaderChunk.meshline_vert = vertexShader;

THREE.ShaderChunk.meshline_frag = fragmentShader 

export function MeshLineMaterial(parameters) {
  THREE.ShaderMaterial.call(this, {
    uniforms: {
      ...THREE.UniformsLib.fog,
      lineWidth: { value: 1 },
      map: { value: null },
      useMap: { value: 0 },
      alphaMap: { value: null },
      useAlphaMap: { value: 0 },
      color: { value: new THREE.Color(0xffffff) },
      opacity: { value: 1 },
      resolution: { value: new THREE.Vector2(1, 1) },
      sizeAttenuation: { value: 1 },
      near: { value: 1 },
      far: { value: 1 },
      dashArray: { value: 0 },
      dashOffset: { value: 0 },
      dashRatio: { value: 0.5 },
      useDash: { value: 0 },
      visibility: { value: 1 },
      alphaTest: { value: 0 },
      repeat: { value: new THREE.Vector2(1, 1) },
      offset: { value: new THREE.Vector2(1, 1) },
    },

    vertexShader: THREE.ShaderChunk.meshline_vert,

    fragmentShader: THREE.ShaderChunk.meshline_frag,

  });

  this.type = 'MeshLineMaterial';

  Object.defineProperties(this, {
    lineWidth: {
      enumerable: true,
      get() {
        return this.uniforms.lineWidth.value;
      },
      set(value) {
        this.uniforms.lineWidth.value = value;
      },
    },
    map: {
      enumerable: true,
      get() {
        return this.uniforms.map.value;
      },
      set(value) {
        this.uniforms.map.value = value;
      },
    },
    useMap: {
      enumerable: true,
      get() {
        return this.uniforms.useMap.value;
      },
      set(value) {
        this.uniforms.useMap.value = value;
      },
    },
    alphaMap: {
      enumerable: true,
      get() {
        return this.uniforms.alphaMap.value;
      },
      set(value) {
        this.uniforms.alphaMap.value = value;
      },
    },
    useAlphaMap: {
      enumerable: true,
      get() {
        return this.uniforms.useAlphaMap.value;
      },
      set(value) {
        this.uniforms.useAlphaMap.value = value;
      },
    },
    color: {
      enumerable: true,
      get() {
        return this.uniforms.color.value;
      },
      set(value) {
        this.uniforms.color.value = value;
      },
    },
    opacity: {
      enumerable: true,
      get() {
        return this.uniforms.opacity.value;
      },
      set(value) {
        this.uniforms.opacity.value = value;
      },
    },
    resolution: {
      enumerable: true,
      get() {
        return this.uniforms.resolution.value;
      },
      set(value) {
        this.uniforms.resolution.value.copy(value);
      },
    },
    sizeAttenuation: {
      enumerable: true,
      get() {
        return this.uniforms.sizeAttenuation.value;
      },
      set(value) {
        this.uniforms.sizeAttenuation.value = value;
      },
    },
    near: {
      enumerable: true,
      get() {
        return this.uniforms.near.value;
      },
      set(value) {
        this.uniforms.near.value = value;
      },
    },
    far: {
      enumerable: true,
      get() {
        return this.uniforms.far.value;
      },
      set(value) {
        this.uniforms.far.value = value;
      },
    },
    dashArray: {
      enumerable: true,
      get() {
        return this.uniforms.dashArray.value;
      },
      set(value) {
        this.uniforms.dashArray.value = value;
        this.useDash = (value !== 0) ? 1 : 0;
      },
    },
    dashOffset: {
      enumerable: true,
      get() {
        return this.uniforms.dashOffset.value;
      },
      set(value) {
        this.uniforms.dashOffset.value = value;
      },
    },
    dashRatio: {
      enumerable: true,
      get() {
        return this.uniforms.dashRatio.value;
      },
      set(value) {
        this.uniforms.dashRatio.value = value;
      },
    },
    useDash: {
      enumerable: true,
      get() {
        return this.uniforms.useDash.value;
      },
      set(value) {
        this.uniforms.useDash.value = value;
      },
    },
    visibility: {
      enumerable: true,
      get() {
        return this.uniforms.visibility.value;
      },
      set(value) {
        this.uniforms.visibility.value = value;
      },
    },
    alphaTest: {
      enumerable: true,
      get() {
        return this.uniforms.alphaTest.value;
      },
      set(value) {
        this.uniforms.alphaTest.value = value;
      },
    },
    repeat: {
      enumerable: true,
      get() {
        return this.uniforms.repeat.value;
      },
      set(value) {
        this.uniforms.repeat.value.copy(value);
      },
    },
  });

  this.setValues(parameters);
}

MeshLineMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
MeshLineMaterial.prototype.constructor = MeshLineMaterial;
MeshLineMaterial.prototype.isMeshLineMaterial = true;

MeshLineMaterial.prototype.copy = function (source) {
  THREE.ShaderMaterial.prototype.copy.call(this, source);

  this.lineWidth = source.lineWidth;
  this.map = source.map;
  this.useMap = source.useMap;
  this.alphaMap = source.alphaMap;
  this.useAlphaMap = source.useAlphaMap;
  this.color.copy(source.color);
  this.opacity = source.opacity;
  this.resolution.copy(source.resolution);
  this.sizeAttenuation = source.sizeAttenuation;
  this.near = source.near;
  this.far = source.far;
  this.dashArray.copy(source.dashArray);
  this.dashOffset.copy(source.dashOffset);
  this.dashRatio.copy(source.dashRatio);
  this.useDash = source.useDash;
  this.visibility = source.visibility;
  this.alphaTest = source.alphaTest;
  this.repeat.copy(source.repeat);

  return this;
};



