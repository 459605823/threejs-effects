<template>
  <div ref="container" class="w-screen h-screen"></div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import Water from '@objects/Water';
import Sky from '@objects/Sky';
import * as THREE from 'three';
import Pencil from '@/utils/pencil/index';

export default defineComponent({
  setup() {
    const container = ref<HTMLDivElement>();
    onMounted(async () => {
      const pencil = new Pencil({
        container: container.value,
        control: true,
        stats: true,
        renderer: {
          bloom: false,
        },
      });
      if (pencil.camera) {
        pencil.camera.position.set(30, 30, 100);
      }
      pencil.registerElement('ocean', Water);
      pencil.registerElement('sky', Sky);
      const ocean = await pencil.draw('ocean');
      const sky = await pencil.draw('sky');
      const sun = new THREE.Vector3();
      const parameters = {
        elevation: 2,
        azimuth: 180,
      };
      const {renderer, scene} = pencil;
      if (renderer && scene) {
        // renderer.toneMapping = THREE.ACESFilmicToneMapping;
        const pmremGenerator = new THREE.PMREMGenerator(renderer);

        const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
        const theta = THREE.MathUtils.degToRad(parameters.azimuth);

        sun.setFromSphericalCoords(1, phi, theta);
        (
          sky.object3d.children[0] as any
        ).material.uniforms.sunPosition.value.copy(sun);
        (ocean.object3d.children[0] as any).material.uniforms.sunDirection.value
          .copy(sun)
          .normalize();

        scene.environment = pmremGenerator.fromScene(
          sky.object3d.children[0] as THREE.Scene
        ).texture;
      }

      pencil.start();
    });
    return {
      container,
    };
  },
});
</script>

<style scoped></style>
