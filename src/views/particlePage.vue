<template>
  <div ref="container" class="w-screen h-screen"></div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import Particles from '@objects/MorphParticles';
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
        pencil.camera.position.set(200, 200, 100);
      }

      pencil.registerElement('particles', Particles);
      pencil.draw('particles');

      pencil.start();
    });
    return {
      container,
    };
  },
});
</script>

<style scoped></style>
