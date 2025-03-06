import CyrillicToTranslit from 'cyrillic-to-translit-js';

const cyrillicToTranslit = CyrillicToTranslit();

export function generateUUID() {
  let uuid = 'LX';
  const hexDigits = '0123456789abcdef';
  const cryptoObj = window.crypto || window.msCrypto;

  for (let i = 0; i < 32; i += 1) {
    const randomBytes = new Uint8Array(1);
    cryptoObj.getRandomValues(randomBytes);
    const hexValue = randomBytes[0] % 16;
    const hexIndex = Math.floor(i / 8);
    uuid += hexDigits[i % 8 === 0 ? 8 + hexIndex : hexValue];
  }

  return uuid;
}

/**
 * Generates an integer hash for a given string value.
 * @param {string} value - The string value to generate hash for.
 * @param {number} [seed=0] - The seed value for the hash calculation.
 * @returns {number} - The generated integer hash.
 */
export function generateIntegerHash(value, seed = 0) {
  let hash = seed;
  if (value.length === 0) {
    return hash;
  }
  for (let i = 0; i < value.length; i += 1) {
    const char = value.charCodeAt(i);
    // Incorporate the seed in the hash calculation
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + char + seed;
    // eslint-disable-next-line no-bitwise
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export function isPhone(value) {
  return /^(\+[1-9]\d{0,3}-?)?\d{2,11}$/.test(value);
}

export function isEmail(value) {
  return /^[a-zA-Z0-9\u00C0-\u017E.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9\u00C0-\u017E-]+(?:\.[a-zA-Z0-9\u00C0-\u017E-]+)+$/.test(
    value
  );
}

export function isUrl(value) {
  return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&=]*)/.test(
    value
  );
}
/**
 * Check if a string is a valid file name
 * @param {string} fileName -  file name to check
 * @returns {boolean} - True if the file name is valid, false otherwise
 */
export function isValidFileName(fileName) {
  // eslint-disable-next-line no-control-regex
  const invalidChars = /[<>:"/\\|?*\u0000-\u001F]/gu;
  return !invalidChars.test(fileName) && fileName?.length > 0;
}

export function foldToAscii(v) {
  return cyrillicToTranslit
    .transform(v)
    ?.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');
}
export function safeString(v) {
  return foldToAscii(v)
    ?.trim()
    ?.toLowerCase()
    ?.replace(/[^a-z0-9]/g, '-');
}

export function textSearch(query, text) {
  return foldToAscii(text)?.toLowerCase()?.includes(foldToAscii(query)?.toLowerCase());
}

/** Take and join values only if they are not empty */
export function joinValues(arr, separator = ', ') {
  return arr?.filter(Boolean)?.join(separator) || '';
}

/** Take substring from string with specified character count and add '…' at the end */
export function cutString(string, characterCount) {
  let ret = '';

  if (string) {
    if (string.length > characterCount) {
      ret = `${string.slice(0, characterCount)}…`;
    } else {
      ret = string;
    }
  }

  return ret;
}

/**
 * Truncate first name so that only first letter remains, and concatenate it with last name,
 * e.g., John Doe -> J. Doe
 */
export function shortenUserName(firstName, lastName) {
  return `${firstName.charAt(0)}. ${lastName}`;
}

/**
 * Extract the file name using a regular expression
 * @returns {string} the file name or an empty string if it couldn't be extracted
 */
export function getFileNameFromPath(path) {
  const fileNameMatch = path?.match(/\/([^/]+)$/);
  return fileNameMatch ? fileNameMatch[1] : '';
}

export function camelToKebab(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Remove the part of the string after the last dot
 * @returns {string} part of the string after the last dot
 */
export function removeExtension(fileName) {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return fileName;
  }
  return fileName.slice(0, lastDotIndex);
}

/**
 * Capitalize the first letter of provided string
 * @returns {string} string with capitalized first letter
 */
export function capitalizeFirstLetter(string) {
  return `${string.charAt(0).toUpperCase()}${string.slice(1)}`;
}
