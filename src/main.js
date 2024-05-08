/* eslint-disable import/no-extraneous-dependencies */
import { createApp } from 'vue';
import VueClickAway from 'vue3-click-away';
import App from '@/App.vue';

const myApp = createApp(App);

myApp.use(VueClickAway);

myApp.mount('#app');
