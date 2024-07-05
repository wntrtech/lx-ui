const europe = {
  AL: 'Albānija',
  AD: 'Andora',
  GB: 'Apvienotā Karaliste',
  AT: 'Austrija',
  BY: 'Baltkrievija',
  BE: 'Beļģija',
  BA: 'Bosnija un Hercegovina',
  BG: 'Bulgārija',
  CZ: 'Čehija',
  DK: 'Dānija',
  FR: 'Francija',
  GR: 'Grieķija',
  HR: 'Horvātija',
  EE: 'Igaunija',
  IE: 'Īrija',
  IS: 'Islande',
  IT: 'Itālija',
  CY: 'Kipra',
  LV: 'Latvija',
  LT: 'Lietuva',
  LI: 'Lihtenšteina',
  LU: 'Luksemburga',
  MT: 'Malta',
  ME: 'Melnkalne',
  MD: 'Moldova',
  MC: 'Monako',
  NL: 'Nīderlande',
  NO: 'Norvēģija',
  PL: 'Polija',
  PT: 'Portugāle',
  RO: 'Rumānija',
  SM: 'Sanmarīno',
  RS: 'Serbija',
  SK: 'Slovākija',
  SI: 'Slovēnija',
  FI: 'Somija',
  ES: 'Spānija',
  CH: 'Šveice',
  TR: 'Turcija',
  UA: 'Ukraina',
  HU: 'Ungārija',
  VA: 'Vatikāns',
  DE: 'Vācija',
  MK: 'Ziemeļmaķedonija',
  SE: 'Zviedrija',
};

const spine = {
  278915007: 'Coccyx',
  699698002: 'Sacrum',
  49668003: 'Fifth lumbar vertebra',
  11994002: 'Fourth lumbar vertebra',
  36470004: 'Third lumbar vertebra',
  14293000: 'Second lumbar vertebra',
  66794005: 'First lumbar vertebra',
  23215003: 'Twelfth thoracic vertebra',
  12989004: 'Eleventh thoracic vertebra',
  7610001: 'Tenth thoracic vertebra',
  82687006: 'Ninth thoracic vertebra',
  11068009: 'Eighth thoracic vertebra',
  62487009: 'Seventh thoracic vertebra',
  45296009: 'Sixth thoracic vertebra',
  56401006: 'Fifth thoracic vertebra',
  73071006: 'Fourth thoracic vertebra',
  1626008: 'Third thoracic vertebra',
  53733008: 'Second thoracic vertebra',
  64864005: 'First thoracic vertebra',
  87391001: 'Seventh cervical vertebra',
  36054005: 'Sixth cervical vertebra',
  36978003: 'Fifth cervical vertebra',
  5329002: 'Fourth cervical vertebra',
  113205007: 'Third cervical vertebra',
  39976000: 'Second cervical vertebra',
  14806007: 'First cervical vertebra',
};

const arms = {
  734355008: 'Bone structure of right hand',
  734354007: 'Bone structure of left hand',
  719464007: 'Bone structure of left radius',
  719465008: 'Bone structure of right radius',
  719462006: 'Bone structure of left ulna',
  719463001: 'Bone structure of right ulna',
  719460003: 'Bone structure of left humerus',
  719461004: 'Bone structure of right humerus',
  719627005: 'Bone structure of left scapula',
  719628000: 'Bone structure of right scapula',
  720617006: 'Bone structure of left clavicle',
  720616002: 'Bone structure of right clavicle',
};
const leftHand = {
  737403003: 'Left lunate bone',
  764825000: 'Left triquetum',
  724196009: 'Left scaphoid',
  764702007: 'Pisiform bone of left hand',
  764746004: 'Hamate of left wrist',
  764658006: 'Capitate bone of left wrist',
  787049004: 'Left trapezoid bone',
  764661007: 'Trapezium of left wrist',
  762010000: 'Fifth metacarpal bone of left hand',
  762027008: 'Fourth metacarpal bone of left hand',
  762041004: 'Third metacarpal bone of left hand',
  762033004: 'Second metacarpal bone of left hand',
  762016006: 'First metacarpal bone of left hand',
  762840002: 'Proximal phalanx of little finger of left hand',
  762842005: 'Proximal phalanx of ring finger of left hand',
  762854005: 'Proximal phalanx of middle finger of left hand',
  762860005: 'Proximal phalanx of index finger of left hand',
  762868003: 'Proximal phalanx of left thumb',
  762838007: 'Middle phalanx of little finger of left hand',
  762844006: 'Middle phalanx of ring finger of left hand',
  762856007: 'Middle phalanx of middle finger of left hand',
  762862002: 'Middle phalanx of index finger of left hand',
  762836006: 'Distal phalanx of little finger of left hand',
  762846008: 'Distal phalanx of ring finger of left hand',
  762858008: 'Distal phalanx of middle finger of left hand',
  762864001: 'Distal phalanx of index finger of left hand',
  762866004: 'Distal phalanx of left thumb',
};
const rightHand = {
  737404009: 'Right lunate bone',
  764824001: 'Right triquetum',
  724197000: 'Right scaphoid',
  764706005: 'Pisiform bone of right hand',
  764747008: 'Hamate of right wrist',
  764659003: 'Capitate bone of right wrist',
  787048007: 'Right trapezoid bone',
  764662000: 'Trapezium of right wrist',
  762011001: 'Fifth metacarpal bone of right hand',
  762028003: 'Fourth metacarpal bone of right hand',
  762042006: 'Third metacarpal bone of right hand',
  762035006: 'Second metacarpal bone of right hand',
  762017002: 'First metacarpal bone of right hand',
  762841003: 'Proximal phalanx of little finger of right hand',
  762843000: 'Proximal phalanx of ring finger of right hand',
  762855006: 'Proximal phalanx of middle finger of right hand',
  762861009: 'Proximal phalanx of index finger of right hand',
  762869006: 'Proximal phalanx of right thumb',
  762839004: 'Middle phalanx of little finger of right hand',
  762845007: 'Middle phalanx of ring finger of right hand',
  762857003: 'Middle phalanx of middle finger of right hand',
  762863007: 'Middle phalanx of index finger of right hand',
  762837002: 'Distal phalanx of little finger of right hand',
  762847004: 'Distal phalanx of ring finger of right hand',
  762859000: 'Distal phalanx of middle finger of right hand',
  762865000: 'Distal phalanx of index finger of right hand',
  762867008: 'Distal phalanx of right thumb',
};
const skeleton = {
  764406006: 'Bone structure of left lower limb',
  764405005: 'Bone structure of right lower limb',
  719309000: 'Bone structure of left upper limb',
  719459008: 'Bone structure of right upper limb',
  421060004: 'Vertebral column',
  60413009: 'Rib cage',
  272679001: 'Bone structure of head',
};
const latvia = {
  '0001000': 'Rīga',
  '0002000': 'Daugavpils',
  '0003000': 'Jelgava',
  '0004000': 'Jūrmala',
  '0005000': 'Liepāja',
  '0006000': 'Rēzekne',
  '0007000': 'Ventspils',
  '0020000': 'Aizkraukles novads',
  '0021000': 'Alūksnes novads',
  '0022000': 'Augšdaugavas novads',
  '0023000': 'Ādažu novads',
  '0024000': 'Balvu novads',
  '0025000': 'Bauskas novads',
  '0026000': 'Cēsu novads',
  '0027000': 'Dienvidkurzemes novads',
  '0028000': 'Dobeles novads',
  '0029000': 'Gulbenes novads',
  '0030000': 'Jelgavas novads',
  '0031000': 'Jēkabpils novads',
  '0032000': 'Krāslavas novads',
  '0033000': 'Kuldīgas novads',
  '0034000': 'Ķekavas novads',
  '0035000': 'Limbažu novads',
  '0036000': 'Līvānu novads',
  '0037000': 'Ludzas novads',
  '0038000': 'Madonas novads',
  '0039000': 'Mārupes novads',
  '0040000': 'Ogres novads',
  '0041000': 'Olaines novads',
  '0042000': 'Preiļu novads',
  '0043000': 'Rēzeknes novads',
  '0044000': 'Ropažu novads',
  '0045000': 'Salaspils novads',
  '0046000': 'Saldus novads',
  '0047000': 'Saulkrastu novads',
  '0048000': 'Siguldas novads',
  '0049000': 'Smiltenes novads',
  '0051000': 'Talsu novads',
  '0052000': 'Tukuma novads',
  '0053000': 'Valkas novads',
  '0054000': 'Valmieras novads',
  '0055000': 'Varakļānu novads',
  '0056000': 'Ventspils novads',
};

export function kebabToCamel(kebabStr) {
  return kebabStr
    .split('-')
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
}

export function getTexts(kind) {
  switch (kind) {
    case 'europe':
      return europe;
    case 'spine':
      return spine;
    case 'arms':
      return arms;
    case 'left-hand':
      return leftHand;
    case 'right-hand':
      return rightHand;
    case 'skeleton':
      return skeleton;
    case 'latvia':
      return latvia;
    default:
      return null;
  }
}
