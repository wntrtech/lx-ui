import { formatDate, formatDateTime } from '@/utils/dateUtils';
import { cutString, shortenUserName } from '@/utils/stringUtils';
import useLx from '@/hooks/useLx';
import { countryCodeToName } from '@/utils/countryCodeUtils';

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

function formatWithUnit(absValue, isNegative, maxChars) {
  const units = [
    { limit: 1e45, suffix: 'Qd' },
    { limit: 1e42, suffix: 'Td' },
    { limit: 1e39, suffix: 'Dd' },
    { limit: 1e36, suffix: 'Ud' },
    { limit: 1e33, suffix: 'Dc' },
    { limit: 1e30, suffix: 'N' },
    { limit: 1e27, suffix: 'Oc' },
    { limit: 1e24, suffix: 'Sp' },
    { limit: 1e21, suffix: 'Sx' },
    { limit: 1e18, suffix: 'Qi' },
    { limit: 1e15, suffix: 'Q' },
    { limit: 1e12, suffix: 'T' },
    { limit: 1e9, suffix: 'B' },
    { limit: 1e6, suffix: 'M' },
    { limit: 1e3, suffix: 'K' },
  ];
  const unit = units.find(({ limit }) => absValue >= limit);

  if (unit) {
    const scaledValue = absValue / unit.limit;

    // Allow space for suffix and negative sign
    const maxNumericChars = isNegative
      ? maxChars - unit.suffix.length - 1
      : maxChars - unit.suffix.length;

    let numericPart = scaledValue.toFixed(maxNumericChars);

    // Reduce decimal places until the number fits within allowed length
    for (let decimals = maxNumericChars; decimals >= 0; decimals -= 1) {
      if (numericPart.length <= maxNumericChars) break;
      numericPart = scaledValue.toFixed(decimals);
    }

    if (numericPart.length > maxNumericChars) {
      const nextUnit = units[units.findIndex(({ limit }) => unit.limit === limit) - 1];
      return `0${nextUnit?.suffix}`;
    }
    return `${isNegative ? '-' : ''}${numericPart.replace('.', ',')}${unit.suffix}`;
  }
  return `${isNegative ? '-' : ''}${absValue.toString()}`;
}

function shortenInteger(value, maxChars) {
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const valueStr = absValue.toString().replace('.', '');

  if (valueStr.length <= maxChars) {
    return isNegative ? `-${valueStr}` : valueStr;
  }

  // Prevent showing undefined suffix
  const shouldHideSuffix =
    (Number(maxChars) === 3 && absValue >= (isNegative ? 1e45 : 1e46)) ||
    (Number(maxChars) === 4 && absValue >= (isNegative ? 1e46 : 1e47));

  if (absValue >= 1e48 || shouldHideSuffix) {
    // Prevent showing exponent if not enough space
    if (maxChars > 17) {
      return `${isNegative ? '-' : ''}${cutString(valueStr, 17)}`;
    }
    return isNegative ? `-${cutString(valueStr, maxChars - 1)}` : cutString(valueStr, maxChars);
  }

  return formatWithUnit(absValue, isNegative, maxChars);
}

function shortenName(name, maxChars) {
  const { firstName, lastName } = name;

  if (!firstName || !lastName) {
    return firstName || lastName || '';
  }

  const fullName = `${firstName} ${lastName}`;
  if (fullName.length <= maxChars) {
    return fullName;
  }

  if (maxChars >= 5) {
    const shortenedUserName = shortenUserName(firstName, lastName);
    return cutString(shortenedUserName, maxChars);
  }

  if (Number(maxChars) === 4) {
    return `${firstName[0]}.${lastName[0]}.`;
  }

  if (Number(maxChars) === 3) {
    return `${firstName[0]}${lastName[0]}`;
  }

  return fullName;
}

export function shortenValue(value, maxChars = 4, type = null) {
  if (maxChars < 3) {
    return value;
  }
  if (type === 'integer' || typeof value === 'number') {
    const intValue = Math.floor(value);
    return shortenInteger(intValue, maxChars);
  }
  if (type === 'name') {
    return shortenName(value, maxChars);
  }

  return value;
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

// Source: https://www.iso.org/iso-3166-country-codes.html
// Used in translation to LV: https://lv.wikipedia.org/wiki/ISO_3166-1
export function formatCountryCode(value, language = 'lv', notExistsValue = null) {
  return countryCodeToName(value, language) || notExistsValue;
}
