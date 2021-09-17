<template>
  <div ref="container" class="w-full h-full bg-black"></div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import ShieldCover from '@objects/ShieldCover';
import Grid from '@objects/Grid';
import Pencil from '@/utils/pencil/index';

export default defineComponent({
  name: 'ShieldCover',
  setup() {
    const container = ref<HTMLDivElement>();
    onMounted(() => {
      const pencil = new Pencil({
        container: container.value,
        control: true,
        stats: true,
        renderer: {
          bloom: false,
        },
      });
      if (pencil.camera) {
        pencil.camera.position.y = 3;
        pencil.camera.position.z = 10;
      }
      pencil.registerElement('shieldCover', ShieldCover);
      pencil.registerElement('grid', Grid);
      pencil.draw('shieldCover');
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
