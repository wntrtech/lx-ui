import { setGlobalProperties } from '@/utils/global';

function install(Vue, options) {
  // Don't install more than once
  if (install.installed) return;
  install.installed = true;
  setGlobalProperties(options);
}

// Create module definition for Vue.use()
const plugin = { install };

// Use automatically when global Vue instance detected
let GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(plugin);
}

// Default export is library as a whole, registered via Vue.use()
export const createLx = plugin;

export * from '@/stores';

// Allow component use individually
export * from '@/components';

// Allow util use individually
export * from '@/utils';
