import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import {resolve} from 'path';
import styleImport from 'vite-plugin-style-import';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers';
import Pages from 'vite-plugin-pages';
import viteSvgIcons from 'vite-plugin-svg-icons';
import typescript from '@rollup/plugin-typescript';

// https://vitejs.dev/config/
export default defineConfig(({command, mode}) => ({
  plugins: [
    vue(),
    styleImport({
      libs: [
        {
          libraryName: 'element-plus',
          esModule: true,
          ensureStyleFile: true,
          resolveStyle: (name) => {
            name = name.slice(3);
            return `element-plus/packages/theme-chalk/src/${name}.scss`;
          },
          resolveComponent: (name) => {
            return `element-plus/lib/${name}`;
          },
        },
      ],
    }),
    AutoImport({
      imports: ['vue', 'vue-router', {'@vueuse/core': ['useMouse']}],
      dts: true,
    }),
    Components({
      dirs: ['src/components'],
      extensions: ['vue'],
      exclude: [/node_modules/, /\.git/],
      include: [/\.vue$/, /\.vue\?vue/],
      resolvers: [ElementPlusResolver()],
      dts: true,
    }),
    Pages({
      pagesDir: 'src/views',
      extensions: ['vue'],
    }),
    viteSvgIcons({
      // 指定需要缓存的图标文件夹
      iconDirs: [resolve(process.cwd(), 'src/assets/svgs')],
      // 指定symbolId格式
      symbolId: 'icon-[name]',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, '/src'),
      '@objects': resolve(__dirname, '/src/objects/'),
    },
  },
  base: './',
  server: {
    open: true,
    port: 3000,
    cors: true,
  },
  publicDir: command === 'build' ? false : 'public',
  build: {
    outDir: 'lib',
    lib: {
      entry: resolve(__dirname, 'src/objects'),
      name: 'threejs-effects',
      fileName: (format) => `threejs-effects.${format}.js`,
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue', 'vue-router', 'three', 'maptalks', 'element-plus'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue',
        },
      },
      plugins: [
        typescript({
          include: ['objects/**/*', 'src/shims.d.ts'],
          declaration: true,
          declarationDir: resolve(__dirname, 'lib'),
        }),
      ],
    },
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', '@vueuse/core'],
    exclude: ['vue-demi'],
  },
}));
