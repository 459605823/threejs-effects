import {ThreeLayer} from 'maptalks.three/dist/maptalks.three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';

import * as THREE from 'three';
// import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import {UnrealBloomPass} from '../createRenderer/UnrealBloomPass';

ThreeLayer.prototype.initBloom = function initBloom() {
  const params = {
    exposure: 1,
    bloomThreshold: 0.2,
    bloomStrength: 0.5,
    bloomRadius: 0,
  };

  const renderer = this.getThreeRenderer();
  const size = this.getMap().getSize();
  this.composer = new EffectComposer(renderer);
  this.composer.setSize(size.width, size.height);

  const scene = this.getScene();
  const camera = this.getCamera();
  this.renderPass = new RenderPass(scene, camera);

  this.composer.addPass(this.renderPass);

  this.bloomPass = new UnrealBloomPass(
    new THREE.Vector2(size.width, size.height),
    1.5,
    0.4,
    0.85
  );
  const {bloomPass} = this;
  bloomPass.renderToScreen = true;
  bloomPass.threshold = params.bloomThreshold;
  bloomPass.strength = params.bloomStrength;
  bloomPass.radius = params.bloomRadius;

  // composer.setSize(size.width, size.height);
  // composer.addPass(renderPass);
  this.composer.addPass(bloomPass);
  this.bloomEnable = true;
};

ThreeLayer.prototype.setRendererRenderScene =
  function setRendererRenderScene() {
    this.getRenderer().renderScene = function renderScene() {
      const {layer} = this;
      layer._callbackBaseObjectAnimation();
      this._syncCamera();

      const renderer = this.context;
      const {camera} = this;
      const {scene} = this;
      if (
        layer.bloomEnable &&
        layer.composer &&
        layer.composer.passes.length > 1
      ) {
        if (renderer.autoClear) {
          renderer.autoClear = false;
        }
        if (layer.bloomPass) {
          camera.layers.set(1);
        }
        if (layer && layer.composer) {
          layer.composer.render(0);
        }
        renderer.clearDepth();
        camera.layers.set(0);
        renderer.render(scene, camera);
      } else {
        if (!renderer.autoClear) {
          renderer.autoClear = true;
        }
        renderer.render(scene, camera);
      }

      this.completeRender();
    };
  };
