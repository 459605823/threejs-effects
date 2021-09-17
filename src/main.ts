import {createApp} from 'vue';
import './styles/index.tailwind.scss';
import router from '@/router';
import App from './App.vue';
import 'element-plus/packages/theme-chalk/src/base.scss';
import 'virtual:svg-icons-register';

createApp(App).use(router).mount('#app');
