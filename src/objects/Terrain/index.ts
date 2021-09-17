import * as THREE from 'three';
import BaseObject from '@/utils/pencil/BaseObject';
import destroy from '@/utils/destroy';
import Pencil from '@/utils/pencil';
import {getImgElement, getTexture} from '@/utils/pencil/utils';
import Terrain from './THREE.Terrain';
import fragmentShader from './shader/fragment.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';

const defaultOptions = {
  // length: 50,
};

export default class extends BaseObject {
  terrainScene: THREE.Object3D | null = null;

  getPosition = (x: number, y: number) =>
    Terrain.getPosition(this.terrainScene, {
      xSegments: 384,
      ySegments: 208,
      x,
      y,
    });

  time = {value: 0};

  constructor(pencil: Pencil, params: any) {
    params = {...defaultOptions, ...params};
    super(pencil, params);
    this.pencil = pencil;
  }

  create() {
    this.createGroup();

    const waterDiffuseTexture = getTexture(
      'Building/Ocean_Foam-5_diffuseOriginal.png'
    );
    waterDiffuseTexture.wrapS = THREE.RepeatWrapping;
    waterDiffuseTexture.wrapT = THREE.RepeatWrapping;

    getImgElement('Building/qingdao.png').then((heightmap) => {
      const terrainScene = Terrain({
        easing: Terrain.Linear,
        frequency: 2.5,
        heightmap,
        material: new THREE.ShaderMaterial({
          uniforms: {
            iTime: this.time,
            defaultTexture: {value: getTexture('Building/qingdao-texture.jpg')},
            waterTexture: {
              value: getTexture('Building/qingdao-water-texture.png'),
            },
            waterDiffuseTexture: {
              value: waterDiffuseTexture,
            },
            repeat: {
              value: new THREE.Vector2(1, 1),
            },
          },
          transparent: true,
          vertexShader,
          fragmentShader,
          defines: {},
        }),
        maxHeight: 100,
        minHeight: 0,
        steps: 1,
        xSegments: 384,
        xSize: 3840,
        ySegments: 208,
        ySize: 2078,
      });

      this.object3d.add(terrainScene);
      this.terrainScene = terrainScene;
    });
  }

  update() {
    this.time.value += 0.01;
  }

  destroy() {
    destroy(this.object3d);
  }
}
