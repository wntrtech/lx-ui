import { getGlobalProperties } from '@/utils/global';

export default () => {
  /**
   * @typedef {Object} GlobalProperties
   * @property {string} [environment] - The current environment
   * @property {string} [iconSet] - The current icon set
   * @property {string} [dateFormat] - The current date format
   */

  /**
   * Get the global properties
   * @returns {GlobalProperties} The global properties
   */
  const getGlobals = () => {
    const instance = getGlobalProperties();
    if (!instance) return null;
    return instance;
  };

  return {
    getGlobals,
  };
};
