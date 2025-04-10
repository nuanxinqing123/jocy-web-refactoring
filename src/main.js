import { createApp } from 'vue'
import './style.css'
import '@arco-design/web-vue/dist/arco.css';
import App from './App.vue'
import ArcoVue from '@arco-design/web-vue';

const app = createApp(App);
// noinspection JSCheckFunctionSignatures
app.use(ArcoVue);
app.mount('#app');
