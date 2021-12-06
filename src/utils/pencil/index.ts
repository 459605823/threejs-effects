import TWEEN from '@tweenjs/tween.js';
import * as THREE from 'three';
import {EventEmitter} from 'events';
import {v4 as uuidv4} from 'uuid';
import deepmerge from 'deepmerge';

import BaseObject from './BaseObject';
import createRenderer, {
  bloomComposerRender,
  edgeComposerRender,
  EDGE_SCENE,
  BLOOM_SCENE,
  BloomParams,
} from './createRenderer';
import creatCSS3DRenderer from './createRenderer/creatCSS3DRenderer';
import createCamera from './createCamera';
import createScene from './createScene';
import createLights from './createLights';
import createStats from './createStats';
import createAxesHelper from './createAxesHelper';
import createControl from './createControl';
import createGui from './createGui';

import animate, {cancel} from './animate';

import Plugin from './map';

type RendererObj = ReturnType<typeof createRenderer>;
type Mesh = BaseObject | THREE.Object3D;

type DeepPartial<T> = T extends Function
  ? T
  : T extends object
  ? {[P in keyof T]?: DeepPartial<T[P]>}
  : T;

interface Options {
  container: HTMLElement;
  stats: boolean;
  gui: boolean;
  axesHelper: boolean;
  control: boolean;
  css3DRenderer: boolean;
  renderer: {
    antialias: boolean | 'fxaa';
    bloom: boolean;
    edge: boolean;
    bloomParams: BloomParams;
  };
  scene: {
    background: THREE.Scene['background'];
  };
  plugin: any;
}

const getFactory = (Element: typeof BaseObject) =>
  class Factory {
    create(pencil: Pencil, options: {} = {}) {
      return new Element(pencil, options);
    }
  };

export default class Pencil {
  public options: Options;

  public scene?: ReturnType<typeof createScene>;

  public renderer?: RendererObj['renderer'];

  public css3DRenderer?: ReturnType<typeof creatCSS3DRenderer>;

  public finalComposer?: RendererObj['finalComposer'];

  public fxaaPass?: RendererObj['fxaaPass'];

  public edgePass?: RendererObj['edgePass'];

  public edgeComposer?: RendererObj['edgeComposer'];

  public bloomComposer?: RendererObj['bloomComposer'];

  public camera?: ReturnType<typeof createCamera>;

  public stats?: ReturnType<typeof createStats>;

  public gui?: ReturnType<typeof createGui>;

  public control?: ReturnType<typeof createControl>;

  private resizeObserver: ResizeObserver;

  private elementNamesToFactories = new Map<
    string,
    ReturnType<typeof getFactory>
  >();

  public elements = new Map<string, BaseObject>();

  public plugin: Plugin;

  get elementsPromise() {
    const res: Promise<any>[] = [];
    this.elements.forEach((value) => {
      res.push(value.pm.promise);
    });
    return res;
  }

  public event = new EventEmitter();

  static options = {
    stats: false,
    gui: false,
    axesHelper: false,
    control: false,
    container: document.body,
    renderer: {
      antialias: false,
      edge: false,
      bloom: false,
      bloomParams: {
        exposure: 1,
        bloomThreshold: 0.2,
        bloomStrength: 0.5,
        bloomRadius: 0,
      },
    },
    scene: {
      background: new THREE.Color('#000000'),
    },
    plugin: false,
  };

  constructor(options: DeepPartial<Options>) {
    this.options = deepmerge(Pencil.options, options, {
      customMerge: (key) => {
        if (key === 'container' || key === 'background' || key === 'plugin') {
          return (a, b) => b;
        }
      },
    });
    const {container, stats: showStats, gui: showGui, plugin} = this.options;
    if (plugin) {
      this.plugin = plugin;
      this.initPlugin();
    } else {
      this.init();
    }
    if (showStats) {
      const stats = createStats();
      container.appendChild(stats.dom);
      this.stats = stats;
    }
    if (showGui) {
      const gui = createGui();
      this.gui = gui;
    }
  }

  init() {
    const {
      container,

      axesHelper: showAxesHelper,
      control: addControl,
      css3DRenderer: addCSS3DRenderer,
      renderer: rendererOptions,
      scene: sceneOptions,
    } = this.options;

    const {width, height} = this.getSize();

    const camera = createCamera({
      width,
      height,
    });
    const scene = createScene(sceneOptions);
    const {ambientLight, pointLight} = createLights();
    const {
      renderer,
      finalComposer,
      fxaaPass,
      bloomComposer,
      edgeComposer,
      edgePass,
    } = createRenderer({
      width,
      height,
      scene,
      camera,
      ...rendererOptions,
    });

    scene.add(camera);
    scene.add(ambientLight);
    camera.add(pointLight);

    this.scene = scene;
    this.renderer = renderer;

    this.finalComposer = finalComposer;
    this.fxaaPass = fxaaPass;
    this.edgeComposer = edgeComposer;
    this.edgePass = edgePass;
    this.bloomComposer = bloomComposer;
    this.camera = camera;
    if (showAxesHelper) {
      const axesHelper = createAxesHelper();
      scene.add(axesHelper);
    }

    if (addControl) {
      const control = createControl({
        camera,
        renderer,
      });
      this.control = control;
    }
    if (addCSS3DRenderer) {
      const css3DRenderer = creatCSS3DRenderer(width, height);
      container.appendChild(css3DRenderer.domElement);
      this.css3DRenderer = css3DRenderer;
    }

    container.appendChild(renderer.domElement);
    const resizeObserver = new ResizeObserver((entries) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const entry of entries) {
        const dimensions = entry.contentRect;
        this.handeleResize(dimensions.width, dimensions.height);
      }
    });
    resizeObserver.observe(container);
    this.resizeObserver = resizeObserver;
  }

  async initPlugin() {
    const {renderer: rendererOptions} = this.options;

    const {width, height} = this.getSize();
    const {plugin} = this;
    await plugin.ready.promise;
    this.camera = plugin.camera;
    this.renderer = plugin.renderer;
    this.scene = plugin.scene;
    const {edgeComposer, edgePass} = createRenderer({
      width,
      height,
      scene: this.scene,
      camera: this.camera,
      ...rendererOptions,
    });
    this.edgeComposer = edgeComposer;
    this.edgePass = edgePass;
  }

  getSize() {
    const {container} = this.options;
    return {
      width: container.offsetWidth,
      height: container.offsetHeight,
    };
  }

  registerElements(elements: Record<string, typeof BaseObject>) {
    Object.keys(elements).forEach((key) => {
      this.registerElement(key, elements[key]);
    });
  }

  registerElement(name: string, Element: typeof BaseObject) {
    if (this.elementNamesToFactories.get(name)) {
      console.warn(`registerElement:err:重复 ${name}`);
      return this.elementNamesToFactories.get(name);
    }
    const Factory = getFactory(Element);
    this.elementNamesToFactories.set(name, Factory);
  }

  async draw(
    nameOrigin: string,
    options?: Record<string, any>,
    target?: string
  ) {
    let targetElement;
    const [name] = nameOrigin.split('#');

    const Factory = this.elementNamesToFactories.get(name);
    if (typeof target !== 'undefined') {
      targetElement = this.elements.get(target);
    }
    if (Factory) {
      const mesh = new Factory().create(this, options);
      await this.addMesh(nameOrigin, mesh, targetElement);
      return mesh;
    }

    throw new Error(`Unrecognized:${name}`);
  }

  private async addMesh(key: string, mesh: Mesh, target?: Mesh) {
    if (!target) target = this.scene;

    if (mesh instanceof BaseObject) {
      await mesh.init();
      mesh.create();
      if (mesh.object3d) {
        if (this.options.renderer.bloom && mesh.options.bloom) {
          mesh.object3d.layers.enable(BLOOM_SCENE);
        }
        await this.addMesh(key, mesh.object3d, target);
      } else if (mesh.box.length) {
        const addBox = mesh.box.flat(Infinity).map((el, i) => {
          return this.addMesh(`${key}_${i}`, el);
        });
        await Promise.all(addBox);
      }

      if (!mesh.isAdd) {
        mesh.isAdd = true;
      }
      if (!this.elements.has(key)) {
        this.elements.set(key, mesh);
      } else {
        const uuid = uuidv4();
        this.elements.set(`${key}@${uuid}`, mesh);
        // console.warn('多个', key, '已添加 key', uuid);
      }
      mesh.render();
      mesh.pm.resolve();
    } else if (this.plugin || !target) {
      this.plugin.addMesh(mesh);
    } else {
      (target as Mesh).add(mesh);
    }
  }

  private removeMesh(key: string, mesh: Mesh, target?: Mesh) {
    if (!target) target = this.scene;

    if (mesh instanceof BaseObject) {
      if (mesh.object3d) {
        this.removeMesh(key, mesh.object3d, target);
      } else if (mesh.box.length) {
        mesh.box.flat(Infinity).forEach((el, i) => {
          this.removeMesh(`${key}_${i}`, el);
        });
      }
      if (mesh.isAdd) {
        mesh.isAdd = false;
      }
      this.elements.delete(key);
    } else if (this.plugin || !target) {
      this.plugin.removeMesh(mesh);
    } else {
      (target as Mesh).remove(mesh);
    }
  }

  private sceneTraverse(obj: THREE.Object3D, fn: (o: THREE.Object3D) => void) {
    if (!obj) return;
    fn(obj);
    if (obj.children && obj.children.length > 0) {
      obj.children.forEach((o) => {
        this.sceneTraverse(o, fn);
      });
    }
  }

  private handeleResize(width: number, height: number) {
    const {
      finalComposer,
      fxaaPass,
      camera,
      renderer,
      bloomComposer,
      css3DRenderer,
    } = this;
    if (!camera || !renderer) {
      return;
    }
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    finalComposer?.setSize(width, height);
    css3DRenderer?.setSize(width, height);
    if (fxaaPass) {
      const pixelRatio = renderer.getPixelRatio();
      fxaaPass.material.uniforms.resolution.value.x = 1 / (width * pixelRatio);
      fxaaPass.material.uniforms.resolution.value.y = 1 / (height * pixelRatio);
    }
    if (bloomComposer) {
      bloomComposer.setSize(width, height);
    }
  }

  start() {
    const clock = new THREE.Clock();
    animate((time) => {
      const {renderer, scene, camera, plugin} = this;
      if (!renderer || !scene || !camera) return;

      if (!plugin) {
        renderer.clear();
      }

      TWEEN.update(time);
      if (this.stats) {
        this.stats.update();
      }
      if (this.control) {
        this.control.update();
      }
      const delta = clock.getDelta();
      this.elements.forEach((element) => {
        if (element instanceof BaseObject) {
          element.update(delta);
        }
      });

      if (!plugin) {
        if (this.bloomComposer) {
          bloomComposerRender(this.bloomComposer, scene);
        }
        if (this.edgeComposer) {
          edgeComposerRender(this.edgeComposer, scene);
        } else if (this.finalComposer) {
          this.finalComposer.render();
        } else {
          renderer.render(scene, camera);
        }
      } else {
        plugin.render();
      }
      this.css3DRenderer?.render(scene, camera);
    });
    this.event.emit('start');
  }

  stop() {
    cancel();
  }

  dispose() {
    this.stop();
    this.renderer?.clear();
    this.resizeObserver?.unobserve(this.options.container);
    if (this.scene) {
      this.elements.forEach((element) => {
        if (element instanceof BaseObject) {
          element.dispose();
        }
      });

      this.sceneTraverse(this.scene, (o: any) => {
        if (o.geometry) {
          o.geometry.dispose();
        }
        if (o.material) {
          if (o.material.length) {
            for (let i = 0; i < o.material.length; ++i) {
              o.material[i].dispose();
            }
          } else {
            o.material.dispose();
          }
        }
      });
    }

    this.scene = undefined;
    this.camera = undefined;
    this.renderer?.renderLists.dispose();

    this.renderer = undefined;
    this.css3DRenderer = undefined;
    this.finalComposer = undefined;
    this.fxaaPass = undefined;
    this.bloomComposer = undefined;
    this.elements.clear();
    this.elementNamesToFactories.clear();
    this.gui?.destroy();
    this.control?.dispose();
    this.event.removeAllListeners();
  }
}
