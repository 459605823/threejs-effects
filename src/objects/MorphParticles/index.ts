import * as THREE from 'three';
import {MeshSurfaceSampler} from 'three/examples/jsm/math/MeshSurfaceSampler';
import gsap from 'gsap';
import BaseObject from '@/utils/pencil/BaseObject';
import vertexShader from './shader/vertex.glsl?raw';
import fragmentShader from './shader/fragment.glsl?raw';

const point2Array = (point: THREE.Vector3) => [point.x, point.y, point.z];

export default class MorphParticles extends BaseObject {
  currentTransition!: number;

  material!: THREE.ShaderMaterial;

  constructor(...args: ConstructorParameters<typeof BaseObject>) {
    super(args[0], {
      ...MorphParticles.options,
      ...args[1],
    });
    this.currentTransition = 0;
  }

  static options = {
    rotateSpeed: 0.01,
    pointColor: '#4ec0e9',
  };

  createMaterial() {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: {
          value: 0,
        },
        uMouse: {
          value: new THREE.Vector2(0, 0),
        },
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uTransition1: {
          value: 0,
        },
        uTransition2: {
          value: 0,
        },
        uColor: {
          value: new THREE.Color(this.options.pointColor),
        },
      },
    });
  }

  sampleParticlesPositionFromMesh(
    geometry: THREE.BufferGeometry,
    count = 10000
  ) {
    const material = new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    const sampler = new MeshSurfaceSampler(mesh).build();
    const particlesPosition = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const position = new THREE.Vector3();
      sampler.sample(position);
      particlesPosition.set(point2Array(position), i * 3);
    }
    return particlesPosition;
  }

  create() {
    const geometry = new THREE.BufferGeometry();
    // sphere
    const sphereGeometry = new THREE.SphereBufferGeometry(100, 128, 128);
    const spherePositions = this.sampleParticlesPositionFromMesh(
      sphereGeometry.toNonIndexed()
    );
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(spherePositions, 3)
    );

    // box
    const boxGeometry = new THREE.BoxBufferGeometry(100, 100, 100, 128, 128);
    const boxPositions = this.sampleParticlesPositionFromMesh(
      boxGeometry.toNonIndexed()
    );
    geometry.setAttribute(
      'aPositionBox',
      new THREE.BufferAttribute(boxPositions, 3)
    );

    // torus
    const torusGeometry = new THREE.TorusBufferGeometry(70, 30, 128, 128);
    const torusPositions = this.sampleParticlesPositionFromMesh(
      torusGeometry.toNonIndexed()
    );
    geometry.setAttribute(
      'aPositionTorus',
      new THREE.BufferAttribute(torusPositions, 3)
    );
    const material = this.createMaterial();
    this.createPoints(geometry, material);
    this.material = material;
    this.onClickParticles();
  }

  // 监听点击微粒
  onClickParticles() {
    document.addEventListener('click', () => {
      this.changeShape();
    });
    document.addEventListener('touchstart', () => {
      this.changeShape();
    });
  }

  changeShape() {
    const {currentTransition} = this;
    const {uniforms} = this.material;
    if (currentTransition === 0) {
      gsap.to(uniforms.uTransition1, {
        value: 1,
      });
      this.currentTransition += 1;
    } else if (currentTransition === 1) {
      gsap.to(uniforms.uTransition2, {
        value: 1,
      });
      this.currentTransition += 1;
    } else if (currentTransition === 2) {
      gsap.to(uniforms.uTransition2, {
        value: 0,
      });
      this.currentTransition += 1;
    } else if (currentTransition === 3) {
      gsap.to(uniforms.uTransition1, {
        value: 0,
      });
      this.currentTransition = 0;
    }
  }

  update() {
    const {rotateSpeed} = this.options;
    this.object3d.rotation.x += rotateSpeed;
    this.object3d.rotation.y += rotateSpeed;
  }
}
