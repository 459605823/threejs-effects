import * as THREE from 'three';
import {getOriginTexture, getTexture} from '@/utils/pencil/utils';
import {colorVector} from '@/utils/color';
import vertexShader from './vertex.glsl?raw';
import fragmentShader from './fragment.glsl?raw';
import gridUrl from './uv_grid_opengl.jpg';
import qiangbiUrl from './qiangbi.png';

export const getMaterial1 = () => {
  const texture = getTexture('city/side_01.jpg');
  texture.needsUpdate = true;
  texture.wrapS = THREE.RepeatWrapping;
  // texture.wrapT = THREE.RepeatWrapping;
  texture.offset.set(0, 0);
  texture.repeat.set(1, 1);
  const material = new THREE.MeshPhongMaterial({
    map: texture,
    transparent: true,
    color: '#ffffff',
  });
  return material;
};

export const getMaterial2 = (width: number, height: number) => {
  const topMaterial = new THREE.MeshLambertMaterial({
    color: 0xa9bce7,
    opacity: 1.0,
    transparent: true,
  });
  const m = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      normalColor: {value: colorVector(0xa9bce7)},
      shadowColor: {value: colorVector(0x000000)},
      iResolution: {value: new THREE.Vector2(width, height)},
      map1: {value: getOriginTexture(gridUrl)},
    },
    transparent: true,
    // wireframe: true,
    // depthWrite: false,
    // depthTest: true,
  });
  const texture = getOriginTexture(gridUrl);
  const texture2 = getOriginTexture(qiangbiUrl);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(0.05, 0.05);
  texture.offset.set(0, -0.1);

  texture2.wrapS = THREE.RepeatWrapping;
  texture2.wrapT = THREE.RepeatWrapping;
  texture2.repeat.set(0.05, 0.03);
  texture2.offset.set(0, 0.1);
  texture2.rotation = Math.PI;
  // return m;
  return [
    new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      envMapIntensity: 2,
    }),
    new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      map: texture2,
      envMapIntensity: 0.5,
    }),
  ];
};

export const getLineMaterial = () => {
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xff0000,
  });
  return lineMaterial;
};

export const getMaterialArea = () => {
  // const m = new THREE.ShaderMaterial({
  //   vertexShader,
  //   fragmentShader,
  //   uniforms: {
  //     normalColor: {value: colorVector(0x3f4e70)},
  //     lightColor: {value: colorVector(0xffffff)},
  //   },
  //   // opacity: 0.8,
  //   transparent: true,
  //   // depthWrite: false,
  //   // depthTest: true,
  // });
  const m = new THREE.MeshLambertMaterial({
    color: 0x11131d,
    opacity: 1,
    // transparent: true,
    // depthWrite: false,
    // depthTest: true,
  });
  return m;
};
