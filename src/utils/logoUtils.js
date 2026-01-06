const logos = import.meta.glob('@/assets/logos/**/*.{png,jpg,jpeg,svg}', { eager: true });

const logoAltTexts = {
  zzdats: 'ZZ Dats logo',
  wntr: 'WNTR TECH logo',
  swedbank: 'Swedbank bankas logo',
  seb: 'SEB bankas logo',
  citadele: 'Citadele bankas logo',
  bluor: 'BlueOr bankas logo',
  industra: 'Industra bankas logo',
  eparaksts: 'eParaksts.lv logo',
  'eparaksts-mobile': 'eParaksts mobile logo',
  eid: 'eID logo',
  'eid-scan': 'eID Scan logo',
  'smart-id': 'Smart ID logo',
  'latvija-lv': 'Latvija.lv logo',
  digimaks: 'Digimaks logo',
  dorvis: 'Dōrvis logo',
};

const logoMap = {};

Object.entries(logos).forEach(([path, image]) => {
  const squareMatch = /\/([^/]+)-square-logo(-dark)?(@\d+x)?\.png$/.exec(path);
  const defaultMatch = /\/([^/]+)-logo(-dark)?(@\d+x)?\.png$/.exec(path);

  let baseName;
  let kind = 'default';
  let theme = 'light';
  let sizeSuffix;

  // Match square logos with optional dark theme and size
  if (squareMatch) {
    [, baseName, theme, sizeSuffix] = squareMatch;
    kind = 'square';
  }
  // Match default logos with optional dark theme and size
  else if (defaultMatch) {
    [, baseName, theme, sizeSuffix] = defaultMatch;
  }

  // If baseName is undefined, skip this iteration (the file doesn't match expected patterns)
  if (!baseName) return;

  // If theme is undefined (i.e., no -dark suffix), treat it as 'light'
  if (theme === undefined) {
    theme = 'light';
  }

  // Handle size suffix (2x or 3x)
  let size;
  switch (true) {
    case sizeSuffix === '@2x':
      size = 'm';
      break;
    case sizeSuffix === '@3x':
      size = 'l';
      break;
    default:
      size = 's';
  }

  // If theme is 'dark', set theme accordingly
  if (theme === '-dark') {
    theme = 'dark';
  }

  // Initialize logoMap entry for this baseName if it doesn't exist
  if (!logoMap[baseName]) {
    logoMap[baseName] = {
      default: { light: {}, dark: {} },
      square: { light: {}, dark: {} },
      altText: logoAltTexts[baseName] || '',
    };
  }

  // @ts-ignore
  logoMap[baseName][kind][theme][size] = image.default;
});

export function getLogo(name, kind, size, theme = 'light') {
  return logoMap?.[name]?.[kind]?.[theme]?.[size] || 'zzdats';
}

export function getAltText(name) {
  return logoMap?.[name]?.altText || '';
}

export function getAvailableLogos() {
  const logoNames = new Set();

  Object.keys(logoMap).forEach((baseName) => {
    logoNames.add(baseName);
  });

  return Array.from(logoNames);
}
