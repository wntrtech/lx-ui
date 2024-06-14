import { getGlobalProperties } from '@/utils/global';

export default () => {
  const getGlobals = () => {
    const instance = getGlobalProperties();
    if (!instance) return null;
    return instance;
  };

  return {
    getGlobals,
  };
};
