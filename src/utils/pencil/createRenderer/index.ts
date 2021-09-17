import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass';
import {FXAAShader} from 'three/examples/jsm/shaders/FXAAShader';
// import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import {UnrealBloomPass} from './UnrealBloomPass';
import vertexShader from './shader/vertex.glsl?raw';
import fragmentShader from './shader/fragment.glsl?raw';
import createEdgePass from './edge';

export interface BloomParams {
  exposure: number;
  bloomThreshold: number;
  bloomStrength: number;
  bloomRadius: number;
}

interface Options {
  width: number;
  height: number;
  devicePixelRatio?: number;
  antialias?: boolean | 'fxaa';
  bloom: boolean;
  bloomParams: BloomParams;
  edge: boolean;
  scene: THREE.Scene;
  camera: THREE.Camera;
}
type Object3D = THREE.Object3D & {
  isMesh: boolean;
  isSprite: boolean;
  material: any;
};

const materials: Record<string, any> = {};
const darkMaterial = new THREE.MeshBasicMaterial({color: 'black'});
const darkSpriteMaterial = new THREE.SpriteMaterial({
  color: '#000',
});
export const BLOOM_SCENE = 1;
export const EDGE_SCENE = 2;

const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);

const edgeLayer = new THREE.Layers();
edgeLayer.set(EDGE_SCENE);

function createUnrealBloomPass(
  width: number,
  height: number,
  params: BloomParams
) {
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    1.5,
    0.4,
    0.85
  );

  bloomPass.threshold = params.bloomThreshold;
  bloomPass.strength = params.bloomStrength;
  bloomPass.radius = params.bloomRadius;
  return bloomPass;
}

function createShaderPass(bloomComposer: EffectComposer) {
  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      baseTexture: {value: null},
      bloomTexture: {value: bloomComposer.renderTarget2.texture},
    },
    vertexShader,
    fragmentShader,
    defines: {},
  });
  const shaderPass = new ShaderPass(shaderMaterial, 'baseTexture');
  shaderPass.needsSwap = true;
  return shaderPass;
}

function createFxaaPass(options: {
  renderer: THREE.WebGLRenderer;
  width: number;
  height: number;
}) {
  const {renderer, width, height} = options;
  const fxaaPass = new ShaderPass(FXAAShader);
  const pixelRatio = renderer.getPixelRatio();
  fxaaPass.material.uniforms.resolution.value.x = 1 / (width * pixelRatio);
  fxaaPass.material.uniforms.resolution.value.y = 1 / (height * pixelRatio);
  fxaaPass.renderToScreen = true;
  return fxaaPass;
}

function createComposer(options: {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
  width: number;
  height: number;
  bloom: boolean;
  bloomParams: BloomParams;
  fxaa: boolean;
  edge: boolean;
}) {
  const {
    renderer,
    scene,
    camera,
    width,
    height,
    bloom,
    fxaa,
    bloomParams,
    edge,
  } = options;
  const renderPass = new RenderPass(scene, camera);
  let finalComposer;
  let edgeComposer;
  let bloomComposer;
  let fxaaPass;
  let edgePass;

  if (bloom) {
    bloomComposer = new EffectComposer(renderer);
    bloomComposer.renderToScreen = false;
    const bloomPass = createUnrealBloomPass(width, height, bloomParams) as any;
    bloomComposer.addPass(renderPass);
    bloomComposer.addPass(bloomPass);
    const shaderPass = createShaderPass(bloomComposer);
    finalComposer = new EffectComposer(renderer);
    finalComposer.addPass(renderPass);
    finalComposer.addPass(shaderPass);
  }
  if (fxaa) {
    fxaaPass = createFxaaPass({renderer, width, height});
    finalComposer = new EffectComposer(renderer);
    finalComposer.addPass(renderPass);
    finalComposer.addPass(fxaaPass);
  }
  if (edge) {
    edgePass = createEdgePass({renderer, width, height});
    edgeComposer = new EffectComposer(renderer);
    edgeComposer.addPass(renderPass);
    edgeComposer.addPass(edgePass);
  }

  return {bloomComposer, fxaaPass, finalComposer, edgePass, edgeComposer};
}

export const bloomComposerRender = (
  bloomComposer: EffectComposer,
  scene: THREE.Scene
) => {
  scene.traverse((object) => {
    const obj = object as Object3D;
    if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
      materials[obj.uuid] = obj.material;
      obj.material = obj.isSprite ? darkSpriteMaterial : darkMaterial;
    }
  });
  bloomComposer.render();
  scene.traverse((object) => {
    const obj = object as Object3D;
    if (materials[obj.uuid]) {
      obj.material = materials[obj.uuid];
      delete materials[obj.uuid];
    }
  });
};

export const edgeComposerRender = (
  edgeComposer: EffectComposer,
  scene: THREE.Scene
) => {
  edgeComposer.render();
};

export default (
  options: Options
): {
  renderer: THREE.WebGLRenderer;
  finalComposer?: EffectComposer;
  fxaaPass?: ShaderPass;
  edgeComposer?: EffectComposer;
  edgePass?: ShaderPass;
  bloomComposer?: EffectComposer;
} => {
  const {
    width,
    height,
    devicePixelRatio,
    antialias,
    scene,
    camera,
    bloom,
    edge,
    bloomParams,
  } = options;
  const sceneArea = document.createElement('canvas');
  sceneArea.width = width;
  sceneArea.height = height;
  const renderer = new THREE.WebGLRenderer({
    canvas: sceneArea,
    alpha: true,
    antialias: antialias === true,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(devicePixelRatio ?? window.devicePixelRatio);
  renderer.autoClear = false;
  renderer.sortObjects = false;
  if (antialias === 'fxaa' || bloom || edge) {
    const {bloomComposer, fxaaPass, finalComposer, edgePass, edgeComposer} =
      createComposer({
        width,
        height,
        renderer,
        scene,
        camera,
        fxaa: antialias === 'fxaa',
        bloom: !!bloom,
        bloomParams,
        edge: !!edge,
      });
    return {
      finalComposer,
      fxaaPass,
      bloomComposer,
      edgePass,
      edgeComposer,
      renderer,
    };
  }

  return {renderer};
};
