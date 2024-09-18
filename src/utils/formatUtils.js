import { formatDate, formatDateTime } from '@/utils/dateUtils';
import useLx from '@/hooks/useLx';

const EMPTY_VALUE = '—';

export function formatValueDefault(value) {
  return value || EMPTY_VALUE;
}

export function formatValueDate(value) {
  return formatDate(value) || EMPTY_VALUE;
}

export function formatPersonCode(value, country = 'LV') {
  if (country === 'LV') {
    return value ? value.replace(/(\d{6})-?(\d{5})/, '$1-$2') : '';
  }
  return value;
}

export function formatValueDateTime(value) {
  return formatDateTime(value) || EMPTY_VALUE;
}

export function formatValueArray(value) {
  return value?.map((o) => o.name).join(', ') || EMPTY_VALUE;
}

export function formatValueBool(value, texts = { yes: 'Jā', no: 'Nē' }) {
  return (value === true ? texts.yes : texts.no) || EMPTY_VALUE;
}

export function formatUrl(value) {
  let newUrl = window.decodeURIComponent(value);
  newUrl = newUrl.trim().replace(/\s/g, '');

  if (/^(:\/\/)/.test(newUrl)) {
    return `https${newUrl}`;
  }
  if (!/^(f|ht)tps?:\/\//i.test(newUrl)) {
    return `https://${newUrl}`;
  }

  return newUrl;
}

export function formatValue(value, type = 'default', texts = { yes: 'Jā', no: 'Nē' }) {
  switch (type) {
    case 'date':
      return formatValueDate(value);
    case 'dateTime':
      return formatValueDateTime(value);
    case 'array':
      return formatValueArray(value);
    case 'bool':
      return formatValueBool(value, texts);
    case 'link':
      return formatUrl(value);
    default:
      return formatValueDefault(value);
  }
}

export function formatFieldName(name) {
  return name || EMPTY_VALUE;
}

export function objectClone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** @typedef Address
 * @property {string} [country]
 * @property {string} [county]
 * @property {string} [city]
 * @property {string} [postalCode]
 * @property {string} [streetName]
 * @property {string} [buildingNumber]
 * @property {string} [buildingNumberNumeric]
 * @property {string} [buildingNumberSuffix]
 * @property {string} [unitId]
 * @property {string} [streetAddressLine]
 * @property {string} [atvkCode]
 * @property {string} [atvkName1]
 * @property {string} [atvkName2]
 * @property {string} [atvkName3]
 * @property {string} [atvkName4]
 */

function formatStreetLine(address) {
  let streetLine;
  if (address.streetName) {
    streetLine = address.streetName;

    // Usually regular (numeric) building number
    // is stored in a buildingNumberNumeric field.
    streetLine += address.buildingNumberNumeric ? ` ${address.buildingNumberNumeric}` : '';

    // But in some rare cases regular (numeric) building number
    // is stored in a buildingNumber field.
    streetLine += address.buildingNumber ? ` ${address.buildingNumber}` : '';
  } else if (address.buildingNumber) {
    streetLine = address.buildingNumber;
  }

  // In case if has street details, add more details
  if (streetLine) {
    streetLine += address.buildingNumberSuffix ? `/${address.buildingNumberSuffix}` : '';
    streetLine += address.unitId ? `-${address.unitId}` : '';
  }
  return streetLine;
}

function formatAddressParts(address, streetLine) {
  const addressParts = [];
  if (streetLine) {
    addressParts.push(streetLine);
  }

  if (address.city) {
    addressParts.push(address.city);
  } else {
    if (address.atvkName4) {
      addressParts.push(address.atvkName4);
    }
    if (address.atvkName3) {
      addressParts.push(address.atvkName3);
    }
  }

  if (address.postalCode) {
    let { postalCode } = address;
    if (!postalCode.startsWith('LV') && postalCode.length === 4) {
      // Case when postal code includes only numbers.
      postalCode = `LV-${postalCode}`;
    } else if (postalCode.indexOf('-') === -1) {
      // Case when postal code isn't formatted with '-'.
      postalCode = `${postalCode.slice(0, 2)}-${postalCode.slice(2)}`;
    }
    addressParts.push(postalCode);
  }

  if (addressParts.length === 0) {
    addressParts.push(address.streetAddressLine);
  }

  addressParts.push(address.country);
  return addressParts;
}

export function formatAddress(/** @type {Address} */ address, includeAtvk = false) {
  if (!address) {
    return EMPTY_VALUE;
  }
  const streetLine = formatStreetLine(address);
  const addressParts = formatAddressParts(address, streetLine);

  let addressString = addressParts.filter((line) => !!line).join(', ');

  if (!addressString) {
    return EMPTY_VALUE;
  }

  if (includeAtvk && address.atvkCode) {
    addressString += ` (${address.atvkCode})`;
  }

  return addressString;
}

export function formatDecimal(value, precision = 2) {
  const language = useLx().getGlobals()?.locale || 'lv-LV';

  return Number.isInteger(value)
    ? value
    : new Intl.NumberFormat(language, {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      }).format(value);
}
