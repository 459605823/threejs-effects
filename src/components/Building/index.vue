<template>
  <div ref="container" class="w-full h-full bg-black"></div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import Building from '@objects/Building';
import Terrain from '@objects/Terrain';
import * as THREE from 'three';
import {getMaterial2, getLineMaterial} from '@objects/Building/material';
import Pencil from '@/utils/pencil/index';
import AreaScale from '@/utils/AreaScale';

export default defineComponent({
  name: 'Building',
  setup() {
    const container = ref<HTMLDivElement>();
    const area = [119.993, 35.9975, 120.6514, 36.2859] as [
      number,
      number,
      number,
      number
    ];
    const polygonCenter = [120.3224, 36.1415];
    const init = async (pencil: Pencil) => {
      const areaScale = AreaScale(area, [3840, 2080]);
      const center = areaScale.getPoint(polygonCenter[0], polygonCenter[1]);
      const terrain = await pencil.draw('terrain');
      const material = getMaterial2(
        container.value?.clientWidth as number,
        container.value?.clientHeight as number
      );
      await pencil.draw('building', {
        url: '/geojson/qingdao-polygon.json',
        material,
        position: [center.x, 0, center.y],
        lineMaterial: getLineMaterial(),
        areaScale,
        terrain,
      });
      pencil.control?.target.set(center.x, 0, center.y);
      pencil.camera?.position.set(0, 1500, 0);
      pencil.start();
    };
    onMounted(() => {
      const pencil = new Pencil({
        container: container.value,
        control: true,
        stats: true,
        renderer: {
          edge: false,
          bloom: false,
        },
        scene: {
          background: new THREE.Color('#999999'),
        },
      });
      pencil.registerElement('building', Building);
      pencil.registerElement('terrain', Terrain);
      init(pencil);
    });
    return {
      container,
    };
  },
});
</script>

<style scoped></style>
