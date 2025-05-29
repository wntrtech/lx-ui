import { getFileNameFromPath, camelToKebab, removeExtension } from '@/utils/stringUtils';

export function getAvailableIcons(iconSet = 'cds') {
  let icons = [];
  if (iconSet === 'cds') {
    icons = import.meta.glob('@/components/icons/cds/*.vue', { eager: true, as: 'url' });
  }
  if (iconSet === 'material') {
    icons = import.meta.glob('@/components/icons/material/*.vue', { eager: true, as: 'url' });
  }
  if (iconSet === 'phosphor') {
    icons = import.meta.glob('@/components/icons/phosphor/*.vue', { eager: true, as: 'url' });
  }
  if (iconSet === 'brand') {
    icons = import.meta.glob('@/components/icons/brand/*.vue', { eager: true, as: 'url' });
  }

  return Object.keys(icons).map((o) => camelToKebab(removeExtension(getFileNameFromPath(o))));
}

/**
 * Concatenate all arrays into a single array and map each key to an object with boolean values indicating which original array it was found in
 */
function getDistinctKeysWithBooleans(arrays) {
  const allValues = arrays.reduce((acc, arr) => acc.concat(arr), []);
  const distinctKeys = allValues.filter((value, index, array) => array.indexOf(value) === index);
  const keyBooleans = distinctKeys.reduce((acc, key) => {
    acc[key] = { icon: key };
    arrays.forEach((arr, i) => {
      acc[key][`inArray${i + 1}`] = arr.includes(key);
    });
    return acc;
  }, {});
  return keyBooleans;
}

export function getAvailableIconsMatrix() {
  const cdsIcons = getAvailableIcons('cds');
  const brandIcons = getAvailableIcons('brand');
  const materialIcons = getAvailableIcons('material');
  const phosphorIcon = getAvailableIcons('phosphor');
  return getDistinctKeysWithBooleans([cdsIcons, brandIcons, materialIcons, phosphorIcon]);
}

export function getAvailableIconSets() {
  return ['cds', 'material', 'brand', 'phosphor'];
}
