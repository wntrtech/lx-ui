import { formatDate, formatDateTime } from '@/utils/dateUtils';

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
