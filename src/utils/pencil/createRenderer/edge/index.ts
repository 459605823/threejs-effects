import * as THREE from 'three';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass';
import {colorVector} from '@/utils/color';
import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

interface Options {
  width: number;
  height: number;
  renderer: THREE.WebGLRenderer;
}

export default function createEdgePass({width, height, renderer}: Options) {
  const pixelRatio = renderer.getPixelRatio();
  const resolution = new THREE.Vector2(
    1 / (width * pixelRatio),
    1 / (height * pixelRatio)
  );

  const pass = new ShaderPass({
    uniforms: {
      edgeColor: {type: 'v3', value: colorVector('#0288d1')},
      tDiffuse: {type: 't', value: null},
      iResolution: {type: 'v2', value: resolution},
    },
    vertexShader,
    fragmentShader,
    defines: {},
  });
  pass.renderToScreen = true;

  return pass;
}
