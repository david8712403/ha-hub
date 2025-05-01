// Ant Design Vue 插件配置
import { defineNuxtPlugin } from 'nuxt/app';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

// 全局導入 Ant Design Vue
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Antd);
});