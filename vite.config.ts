import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import {resolve} from 'path';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import Pages from 'vite-plugin-pages';
import viteSvgIcons from 'vite-plugin-svg-icons';
import typescript from '@rollup/plugin-typescript';

// https://vitejs.dev/config/
export default defineConfig(({command, mode}) => {
  return {
    plugins: [
      vue(),
      AutoImport({
        imports: ['vue', 'vue-router'],
        dts: true,
      }),
      Components({
        dirs: ['src/components'],
        extensions: ['vue'],
        exclude: [/node_modules/, /\.git/],
        include: [/\.vue$/, /\.vue\?vue/],
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
    publicDir: command === 'build' && mode === 'lib' ? false : 'public',
    build:
      mode === 'lib'
        ? {
            outDir: 'lib',
            lib: {
              entry: resolve(__dirname, 'src/objects'),
              name: 'threejs-effects',
              fileName: (format) => `threejs-effects.${format}.js`,
            },
            rollupOptions: {
              // 确保外部化处理那些你不想打包进库的依赖
              external: ['vue', 'vue-router', 'three', 'maptalks'],
              output: {
                // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
                globals: {
                  vue: 'Vue',
                  three: 'THREE',
                },
                exports: 'named',
              },
              plugins: [
                typescript({
                  include: ['objects/**/*', 'src/shims.d.ts'],
                  declaration: true,
                  declarationDir: resolve(__dirname, 'lib'),
                }),
              ],
            },
          }
        : {},
    optimizeDeps: {
      include: ['vue', 'vue-router'],
      exclude: ['vue-demi'],
    },
  };
});
