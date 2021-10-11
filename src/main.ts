import {createApp} from 'vue';
import './styles/index.tailwind.css';
import router from '@/router';
import App from './App.vue';
import 'virtual:svg-icons-register';

createApp(App).use(router).mount('#app');
