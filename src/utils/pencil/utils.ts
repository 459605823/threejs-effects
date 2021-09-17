/* eslint-disable import/no-dynamic-require */

import * as THREE from 'three';

export const getImage = (...urls: string[]) => {
  if (urls.length > 1) {
    return urls.map((url) => require(`@/assets/images/${url}`));
  }
  return require(`@/assets/images/${urls[0]}`);
};
export const getTexture = (url: string) => {
  return new THREE.TextureLoader().load(getImage(url));
};
export const getOriginTexture = (url: string) => {
  return new THREE.TextureLoader().load(url);
};
export const getTextureAsync = (url: string) => {
  return new THREE.TextureLoader().loadAsync(getImage(url));
};
export const getImgElement = (url: string) => {
  return new Promise((resolve) => {
    const img = window.document.createElement('img');
    img.src = getImage(url);

    img.onload = () => {
      img.onload = null;
      resolve(img);
    };
  });
};
