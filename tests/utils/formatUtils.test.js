import { test, expect } from 'vitest';
import { formatAddress } from '@/utils/formatUtils';

test('Format address city', async () => {
  const address = {
    country: 'LATVIJA',
    city: 'RĪGA',
    streetName: 'DUNTES IELA',
    buildingNumberNumeric: '28',
    unitId: '82',
    postalCode: 'LV1005',
  };

  const addressLine = formatAddress(address);
  expect(addressLine).toBe('DUNTES IELA 28-82, RĪGA, LV-1005, LATVIJA');
});

test('Format address outside city', async () => {
  const address = {
    country: 'LATVIJA',
    atvkName3: 'ILŪKSTES NOVADS',
    atvkName4: 'ILŪKSTE',
    streetName: 'MEŽA IELA',
    buildingNumberNumeric: '5',
    buildingNumberSuffix: '2',
    unitId: '33/35',
    postalCode: 'LV5477',
  };

  const addressLine = formatAddress(address);
  expect(addressLine).toBe('MEŽA IELA 5/2-33/35, ILŪKSTE, ILŪKSTES NOVADS, LV-5477, LATVIJA');
});

test('Format address street address line', async () => {
  const address = {
    country: 'LATVIJA',
    streetAddressLine: 'DUNTES IELA 28-82, RĪGA, LV-1005',
  };

  const addressLine = formatAddress(address);
  expect(addressLine).toBe('DUNTES IELA 28-82, RĪGA, LV-1005, LATVIJA');
});

test('Format address building number', async () => {
  const address = {
    country: 'LATVIJA',
    city: 'RĪGA',
    streetName: 'DUNTES IELA',
    buildingNumber: '28',
    unitId: '82',
    postalCode: 'LV1005',
  };

  const addressLine = formatAddress(address);
  expect(addressLine).toBe('DUNTES IELA 28-82, RĪGA, LV-1005, LATVIJA');
});

test('Format address named building', async () => {
  const address = {
    country: 'LATVIJA',
    atvkName3: 'TUKUMA NOVADS',
    atvkName4: 'ZENTENES PAGASTS',
    buildingNumber: 'CĪRULĪŠI',
    postalCode: 'LV3123',
  };

  const addressLine = formatAddress(address);
  expect(addressLine).toBe('CĪRULĪŠI, ZENTENES PAGASTS, TUKUMA NOVADS, LV-3123, LATVIJA');
});

test('Format address postal code with dash', async () => {
  const address = {
    country: 'LATVIJA',
    city: 'RĪGA',
    streetName: 'DUNTES IELA',
    buildingNumber: '28',
    unitId: '82',
    postalCode: 'LV-1005',
  };

  const addressLine = formatAddress(address);
  expect(addressLine).toBe('DUNTES IELA 28-82, RĪGA, LV-1005, LATVIJA');
});

test('Format address postal code numbers only', async () => {
  const address = {
    country: 'LATVIJA',
    city: 'RĪGA',
    streetName: 'DUNTES IELA',
    buildingNumber: '28',
    unitId: '82',
    postalCode: '1005',
  };

  const addressLine = formatAddress(address);
  expect(addressLine).toBe('DUNTES IELA 28-82, RĪGA, LV-1005, LATVIJA');
});

test('Format address no postal code', async () => {
  const address = {
    country: 'LATVIJA',
    city: 'RĪGA',
    streetName: 'DUNTES IELA',
    buildingNumber: '28',
    unitId: '82',
  };

  const addressLine = formatAddress(address);
  expect(addressLine).toBe('DUNTES IELA 28-82, RĪGA, LATVIJA');
});

test('Format address with atvk', async () => {
  const address = {
    country: 'LATVIJA',
    city: 'RĪGA',
    streetName: 'DUNTES IELA',
    buildingNumberNumeric: '28',
    unitId: '82',
    postalCode: 'LV1005',
    atvkCode: '010096',
  };

  const addressLine = formatAddress(address, true);
  expect(addressLine).toBe('DUNTES IELA 28-82, RĪGA, LV-1005, LATVIJA (010096)');
});

test('Format address no street', async () => {
  const address = {
    country: 'LATVIJA',
    city: 'RĪGA',
    postalCode: 'LV1005',
    atvkCode: '010096',
  };

  const addressLine = formatAddress(address, false);
  expect(addressLine).toBe('RĪGA, LV-1005, LATVIJA');
});

test('Format address no city', async () => {
  const address = {
    country: 'LATVIJA',
    atvkName3: 'LIMBAŽU NOVADS',
  };

  const addressLine = formatAddress(address, false);
  expect(addressLine).toBe('LIMBAŽU NOVADS, LATVIJA');
});
