<template>
  <div ref="container" class="w-full h-full bg-black"></div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import Building from '@objects/Building-maptalks';
import Road from '@objects/Road';
import spriteLine from '@objects/lines/spriteLine';
import Plugin from '@/utils/pencil/map';
import Pencil from '@/utils/pencil/index';

const test = (type: string, json: any) => {
  if (type === 'build') {
    return json.map((item: any) => {
      return {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: item.polygon,
        },
        properties: {
          Height: item.height,
        },
      };
    });
  }
  if (type === 'road') {
    return json.map((item: any) => {
      return {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: item.path,
        },
        properties: {
          RoadWidth: '2',
        },
      };
    });
  }
};

export default defineComponent({
  name: 'Building',
  setup() {
    const container = ref<HTMLDivElement>();
    onMounted(async () => {
      const plugin = new Plugin({
        container: container.value,
        bloom: true,
        map: {
          center: [-74.00790992756748, 40.71167813139547],
          zoom: 15,
          pitch: 45,
          bearing: 0,
          draggable: true,
          dragPan: true,
          scrollWheelZoom: true,
        },
      });
      const pencil = new Pencil({
        container: '.box',
        plugin,
      });
      pencil.registerElement('building', Building);
      pencil.registerElement('road', Road);
      pencil.registerElement('spriteLine', spriteLine);
      await pencil.draw('building', {
        url: '/geojson/buildings.json',
        fn: test.bind(null, 'build'),
      });
      await pencil.draw('road', {
        url: '/geojson/road.json',
        fn: test.bind(null, 'road'),
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
