import { getCurrentInstance } from 'vue';

export default () => {
  const getGlobals = () => {
    const instance = getCurrentInstance();
    if (!instance) {
      console.error('This function must be used within a setup function.');
      return null;
    }
    return instance.appContext.config?.globalProperties?.$lx;
  };

  return {
    getGlobals,
  };
};
