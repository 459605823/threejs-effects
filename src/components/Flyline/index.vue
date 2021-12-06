<template>
  <div ref="container" class="w-full h-full bg-black"></div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import Flyline from '@objects/Flyline';
import FlyMeshLine from '@objects/FlyMeshLine';
import SpriteLine from '@objects/lines/spriteLine';
import Grid from '@objects/Grid';
import * as THREE from 'three';
import Pencil from '@/utils/pencil/index';

export default defineComponent({
  name: 'Flyline',
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
        pencil.camera.position.y = 80;
        pencil.camera.position.z = 80;
      }
      pencil.registerElement('flyline', Flyline);
      pencil.registerElement('flyMeshLine', FlyMeshLine);
      pencil.registerElement('grid', Grid);
      const flyline = await pencil.draw('flyline', {
        bloom: true,
        position: [
          [-50, 0],
          [30, 0],
        ],
        altitude: 0,
      });
      flyline.object3d.rotation.copy(
        new THREE.Euler((-Math.PI / 180) * 90, 0, 0)
      );
      const meshline = await pencil.draw('flyMeshLine', {
        nodes: [
          new THREE.Vector3(-50, 10, 30),
          new THREE.Vector3(0, 30, 30),
          new THREE.Vector3(50, 10, 30),
        ],
        speed: 10,
        length: 0.1,
        lineWidth: 10,
        isHalf: false,
        lineColor: 'rgba(25,108,226,0.3)',
        lightColor: 'rgba(255,255,255,1)',
        start: 0,
      });
      meshline.animateIn();
      pencil.draw('grid', {
        size: 150,
        divisions: 50,
      });
      pencil.start();
    });
    return {
      container,
    };
  },
});
</script>

<style scoped></style>
