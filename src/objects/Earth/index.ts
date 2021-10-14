import * as THREE from 'three';
import {BufferGeometryUtils} from 'three/examples/jsm/utils/BufferGeometryUtils';
import TWEEN from '@tweenjs/tween.js';
import BaseObject from '@/utils/pencil/BaseObject';
import countryInfos from './country-info.json';
import {getTexture} from '@/utils/pencil/utils';
import manPopulation from './man.asc?raw';
import womenPopulation from './women.asc?raw';

type ICountryInfo = typeof countryInfos[number] & {
  position: THREE.Vector3;
  area: number;
  elem: HTMLElement;
};

type file = ReturnType<Earth['parseData']>;

type IFileInfos = {
  name: string;
  hueRange: [number, number];
  file: file;
  elem?: HTMLElement;
};

function mapValues(data: number[][], fn: Function) {
  return data.map((row, rowNdx) => {
    return row.map((value, colNdx) => {
      return fn(value, rowNdx, colNdx);
    });
  });
}

function makeDiffFile(baseFile: file, otherFile: file, compareFn: Function) {
  let min: number | undefined;
  let max: number | undefined;
  const baseData = baseFile.data;
  const otherData = otherFile.data;
  const data = mapValues(
    baseData,
    (base: file, rowNdx: number, colNdx: number) => {
      const other = otherData[rowNdx][colNdx];
      if (base === undefined || other === undefined) {
        return undefined;
      }
      const value = compareFn(base, other);
      min = Math.min(min === undefined ? value : min, value);
      max = Math.max(max === undefined ? value : max, value);
      return value;
    }
  );
  // make a copy of baseFile and replace min, max, and data
  // with the new data
  return {...baseFile, min, max, data};
}

function dataMissingInAnySet(
  fileInfos: IFileInfos[],
  latNdx: number,
  lonNdx: number
) {
  for (const fileInfo of fileInfos) {
    if (fileInfo.file.data[latNdx][lonNdx] === undefined) {
      return true;
    }
  }
  return false;
}

export default class Earth extends BaseObject {
  countryInfos: ICountryInfo[];

  time: number;

  tempV: THREE.Vector3;

  cameraToPoint: THREE.Vector3;

  cameraPosition: THREE.Vector3;

  normalMatrix: THREE.Matrix3;

  minArea: number;

  maxVisibleDot: number;

  raycaster: THREE.Raycaster;

  baseGeo: THREE.BufferGeometry;

  colors: any;

  mesh: THREE.Mesh;

  constructor(...args: ConstructorParameters<typeof BaseObject>) {
    super(args[0], {
      ...args[1],
    });
    this.time = 0;
    this.tempV = new THREE.Vector3();
    this.cameraToPoint = new THREE.Vector3();
    this.cameraPosition = new THREE.Vector3();
    this.normalMatrix = new THREE.Matrix3();
    this.raycaster = new THREE.Raycaster();
    this.minArea = 10;
    this.maxVisibleDot = -0.2;
  }

  initFileInfo() {
    const fileInfos: IFileInfos[] = [
      {
        name: 'men',
        hueRange: [0.7, 0.3],
        file: this.parseData(manPopulation),
      },
      {
        name: 'women',
        hueRange: [0.9, 1.1],
        file: this.parseData(womenPopulation),
      },
    ];
    const [menInfo, womenInfo] = fileInfos;
    const menFile = menInfo.file;
    const womenFile = womenInfo.file;
    const amountGreaterThan = (a: number, b: number) => Math.max(a - b, 0);
    fileInfos.push({
      name: '>50%men',
      hueRange: [0.6, 1.1],
      file: makeDiffFile(menFile, womenFile, (men: number, women: number) => {
        return amountGreaterThan(men, women);
      }),
    });
    fileInfos.push({
      name: '>50% women',
      hueRange: [0.0, 0.4],
      file: makeDiffFile(womenFile, menFile, (women: number, men: number) => {
        return amountGreaterThan(women, men);
      }),
    });
    return fileInfos;
  }

  initBox() {
    const fileInfos = this.initFileInfo();
    // show the selected data, hide the rest
    const handleMousOver = (
      fileInfos: IFileInfos[],
      fileInfo: IFileInfos,
      mesh: THREE.Mesh
    ) => {
      const targets: number[] = [];
      fileInfos.forEach((info, i) => {
        const visible = fileInfo === info;
        info.elem!.className = visible ? 'selected' : '';
        targets[i] = visible ? 1 : 0;
      });
      const durationInMs = 1000;
      new TWEEN.Tween(mesh.morphTargetInfluences as number[])
        .to(targets, durationInMs)
        .start();
    };
    const geos = fileInfos.map(({file, hueRange}) =>
      this.makeBoxes(file, hueRange, fileInfos)
    );
    const baseGeo = geos[0];
    // 以第一个几何体作为基准, 将其他的作为变形目标
    baseGeo.morphAttributes.position = geos.map((geo, index) => {
      const attribute = geo.getAttribute('position');
      const name = `target${index}`;
      attribute.name = name;
      return attribute;
    });
    const colorAttributes = geos.map((geometry, ndx) => {
      const attribute = geometry.getAttribute('color');
      const name = `morphColor${ndx}`;
      attribute.name = `color${ndx}`;
      return {name, attribute};
    });
    const material = new THREE.MeshBasicMaterial({
      vertexColors: true,
      morphTargets: true,
    });
    const vertexShaderReplacements = [
      {
        from: '#include <morphtarget_pars_vertex>',
        to: `
          uniform float morphTargetInfluences[8];
        `,
      },
      {
        from: '#include <morphnormal_vertex>',
        to: `
        `,
      },
      {
        from: '#include <morphtarget_vertex>',
        to: `
          transformed += (morphTarget0 - position) * morphTargetInfluences[0];
          transformed += (morphTarget1 - position) * morphTargetInfluences[1];
          transformed += (morphTarget2 - position) * morphTargetInfluences[2];
          transformed += (morphTarget3 - position) * morphTargetInfluences[3];
        `,
      },
      {
        from: '#include <color_pars_vertex>',
        to: `
          varying vec3 vColor;
          attribute vec3 morphColor0;
          attribute vec3 morphColor1;
          attribute vec3 morphColor2;
          attribute vec3 morphColor3;
        `,
      },
      {
        from: '#include <color_vertex>',
        to: `
          vColor.xyz = morphColor0 * morphTargetInfluences[0] +
                       morphColor1 * morphTargetInfluences[1] +
                       morphColor2 * morphTargetInfluences[2] +
                       morphColor3 * morphTargetInfluences[3];
        `,
      },
    ];
    material.onBeforeCompile = (shader) => {
      vertexShaderReplacements.forEach((rep) => {
        shader.vertexShader = shader.vertexShader.replace(rep.from, rep.to);
      });
    };
    const mesh = new THREE.Mesh(baseGeo, material);
    this.object3d.add(mesh);

    const uiElem = document.querySelector('#ui');
    fileInfos.forEach((info) => {
      const div = document.createElement('div');
      div.textContent = info.name;
      uiElem?.appendChild(div);
      div.addEventListener('mouseover', () =>
        handleMousOver(fileInfos, info, mesh)
      );
      info.elem = div;
    });
    handleMousOver(fileInfos, fileInfos[0], mesh);
    this.baseGeo = baseGeo;
    this.colors = colorAttributes;
    this.mesh = mesh;
  }

  updateMorphTargets(
    colorAttributes: any,
    baseGeo: THREE.BufferGeometry,
    mesh: THREE.Mesh
  ) {
    // remove all the color attributes
    for (const {name} of colorAttributes) {
      baseGeo.deleteAttribute(name);
    }

    // three.js provides no way to query this so we have to guess and hope it doesn't change.
    const maxInfluences = 8;

    // three provides no way to query which morph targets it will use
    // nor which attributes it will assign them to so we'll guess.
    // If the algorithm in three.js changes we'll need to refactor this.
    (mesh.morphTargetInfluences as number[])
      .map((influence, i) => [i, influence]) // map indices to influence
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])) // sort by highest influence first
      .slice(0, maxInfluences) // keep only top influences
      .sort((a, b) => a[0] - b[0]) // sort by index
      .filter((a) => !!a[1]) // remove no influence entries
      .forEach(([ndx], i) => {
        // assign the attributes
        const name = `morphColor${i}`;
        baseGeo.setAttribute(name, colorAttributes[ndx].attribute);
      });
  }

  create() {
    const bumpTexture = getTexture('world.jpeg');
    const outlineTexture = getTexture('map_outline.png');
    const outline2 = getTexture('country-outlines.png');
    const geometry = new THREE.SphereBufferGeometry(1, 64, 32);
    const material = new THREE.MeshPhongMaterial({
      map: bumpTexture,
    });
    this.createMesh(geometry, material);
    this.initBox();
    this.addLabels();
    this.setGui();
  }

  parseData(text: string) {
    const data: number[][] = [];
    const settings: Record<string, any> & {data: number[][]} = {data};
    let max: number | undefined;
    let min: number | undefined;
    // split into lines
    text.split('\n').forEach((line: any) => {
      // split the line by whitespace
      const parts = line.trim().split(/\s+/);
      if (parts.length === 2) {
        // only 2 parts, must be a key/value pair
        settings[parts[0]] = parseFloat(parts[1]);
      } else if (parts.length > 2) {
        // more than 2 parts, must be data
        const values = parts.map((v: any) => {
          const value = parseFloat(v);
          if (value === settings.NODATA_value) {
            return undefined;
          }
          max = Math.max(max === undefined ? value : max, value);
          min = Math.min(min === undefined ? value : min, value);
          return value;
        });
        data.push(values);
      }
    });
    return Object.assign(settings, {min, max});
  }

  addLabels() {
    const lonFudge = Math.PI * 1.5;
    const latFudge = Math.PI;
    // these helpers will make it easy to position the boxes
    // We can rotate the lon helper on its Y axis to the longitude
    const lonHelper = new THREE.Object3D();
    // We rotate the latHelper on its X axis to the latitude
    const latHelper = new THREE.Object3D();
    lonHelper.add(latHelper);
    // The position helper moves the object to the edge of the sphere
    const positionHelper = new THREE.Object3D();
    positionHelper.position.z = 1;
    latHelper.add(positionHelper);

    const labelParentElem = document.querySelector('#labels');
    for (const countryInfo of countryInfos as ICountryInfo[]) {
      const {lat, lon, name, min, max} = countryInfo;

      // adjust the helpers to point to the latitude and longitude
      lonHelper.rotation.y = THREE.MathUtils.degToRad(lon) + lonFudge;
      latHelper.rotation.x = THREE.MathUtils.degToRad(lat) + latFudge;

      // get the position of the lat/lon
      positionHelper.updateWorldMatrix(true, false);
      const position = new THREE.Vector3();
      positionHelper.getWorldPosition(position);
      countryInfo.position = position;

      // compute the area for each country
      const width = max[0] - min[0];
      const height = max[1] - min[1];
      const area = width * height;
      countryInfo.area = area;

      // add an element for each country
      const elem = document.createElement('div');
      elem.textContent = name;
      labelParentElem?.appendChild(elem);
      countryInfo.elem = elem;
    }
    this.countryInfos = countryInfos as ICountryInfo[];
  }

  makeBoxes(
    file: ReturnType<Earth['parseData']>,
    hueRange: [number, number],
    fileInfos: IFileInfos[]
  ) {
    const {min, max, data} = file;
    const range = max! - min!;

    // these helpers will make it easy to position the boxes
    // We can rotate the lon helper on its Y axis to the longitude
    const lonHelper = new THREE.Object3D();
    // We rotate the latHelper on its X axis to the latitude
    const latHelper = new THREE.Object3D();
    lonHelper.add(latHelper);
    // The position helper moves the object to the edge of the sphere
    const positionHelper = new THREE.Object3D();
    positionHelper.position.z = 1;
    latHelper.add(positionHelper);
    // Used to move the center of the cube so it scales from the position Z axis
    const originHelper = new THREE.Object3D();
    originHelper.position.z = 0.5;
    positionHelper.add(originHelper);

    const color = new THREE.Color();

    const lonFudge = Math.PI * 0.5;
    const latFudge = Math.PI * -0.135;
    const geometries: THREE.BufferGeometry[] = [];
    data.forEach((row, latNdx) => {
      row.forEach((value, lonNdx) => {
        if (dataMissingInAnySet(fileInfos, latNdx, lonNdx)) {
          return;
        }
        const amount = (value - min!) / range;

        const boxWidth = 1;
        const boxHeight = 1;
        const boxDepth = 1;
        const geometry = new THREE.BoxBufferGeometry(
          boxWidth,
          boxHeight,
          boxDepth
        );

        // adjust the helpers to point to the latitude and longitude
        lonHelper.rotation.y =
          THREE.MathUtils.degToRad(lonNdx + file.xllcorner) + lonFudge;
        latHelper.rotation.x =
          THREE.MathUtils.degToRad(latNdx + file.yllcorner) + latFudge;

        // use the world matrix of the origin helper to
        // position this geometry
        positionHelper.scale.set(
          0.005,
          0.005,
          THREE.MathUtils.lerp(0.01, 0.5, amount)
        );
        originHelper.updateWorldMatrix(true, false);
        geometry.applyMatrix4(originHelper.matrixWorld);

        // compute a color
        const hue = THREE.MathUtils.lerp(...hueRange, amount);
        const saturation = 1;
        const lightness = THREE.MathUtils.lerp(0.4, 1.0, amount);
        color.setHSL(hue, saturation, lightness);
        // get the colors as an array of values from 0 to 255
        const rgb = color.toArray().map((v) => v * 255);

        // make an array to store colors for each vertex
        const numVerts = geometry.getAttribute('position').count;
        const itemSize = 3; // r, g, b
        const colors = new Uint8Array(itemSize * numVerts);

        // copy the color into the colors array for each vertex
        colors.forEach((v, ndx) => {
          colors[ndx] = rgb[ndx % 3];
        });

        const normalized = true;
        const colorAttrib = new THREE.BufferAttribute(
          colors,
          itemSize,
          normalized
        );
        geometry.setAttribute('color', colorAttrib);

        geometries.push(geometry);
      });
    });

    // 大量对象优化：合并多个geometry为一个geometry
    return BufferGeometryUtils.mergeBufferGeometries(geometries, false);
  }

  setGui() {
    const {pencil} = this;
    const {gui} = pencil;
    if (!gui) {
      return;
    }
    gui.add(this, 'minArea', 0, 50).onChange(this.updateLabels);
    gui.add(this, 'maxVisibleDot', -1, 1, 0.01).onChange(this.updateLabels);
  }

  updateLabels() {
    const {
      countryInfos,
      tempV,
      pencil,
      cameraPosition,
      cameraToPoint,
      normalMatrix,
      maxVisibleDot,
      minArea,
    } = this;
    if (!countryInfos) return;
    const {camera} = pencil;
    const {width, height} = pencil.getSize();
    const minShowAreaSize = minArea * minArea;

    // get a matrix that represents a relative orientation of the camera
    normalMatrix.getNormalMatrix(camera?.matrixWorldInverse as THREE.Matrix4);
    // get the camera's position
    camera?.getWorldPosition(cameraPosition);
    for (const countryInfo of countryInfos) {
      const {position, elem, area} = countryInfo;
      if (area < minShowAreaSize) {
        elem.style.display = 'none';
        // eslint-disable-next-line no-continue
        continue;
      }
      // orient the position based on the camera's orientation.
      // 计算该点到原点（地球中心）的方向
      tempV.copy(position);
      tempV.applyMatrix3(normalMatrix);

      // compute the direction to this position from the camera
      // 计算相机到该点方向
      cameraToPoint.copy(position);
      cameraToPoint
        .applyMatrix4(camera?.matrixWorldInverse as THREE.Matrix4)
        .normalize();

      // 计算两者点积，得到两向量余弦值
      // 1 = facing directly towards the camera
      // 0 = exactly on tangent of the sphere from the camera
      // < 0 = facing away
      const dot = tempV.dot(cameraToPoint);
      if (dot > maxVisibleDot) {
        elem.style.display = 'none';
        // eslint-disable-next-line no-continue
        continue;
      }
      elem.style.display = '';

      // get the normalized screen coordinate of that position
      // x and y will be in the -1 to +1 range with x = -1 being
      // on the left and y = -1 being on the bottom
      tempV.copy(position);
      tempV.project(camera!);

      // convert the normalized position to CSS coordinates
      const x = (tempV.x * 0.5 + 0.5) * width;
      const y = (tempV.y * -0.5 + 0.5) * height;

      // move the elem to that position
      elem.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;

      // set the zIndex for sorting
      elem.style.zIndex = `${((-tempV.z * 0.5 + 0.5) * 100000) | 0}`;
    }
  }

  update() {
    this.updateLabels();
    const {mesh, baseGeo, colors} = this;
    this.updateMorphTargets(colors, baseGeo, mesh);
  }
}
