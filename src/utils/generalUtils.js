const focusableSelectors = [
  'a:not([disabled])',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
];

function findFocusableElements(element) {
  if (!element) return [];

  const candidates = [
    ...(element.matches(focusableSelectors.join(', ')) &&
    !element.disabled &&
    element.offsetParent !== null
      ? [element]
      : []),
    ...element.querySelectorAll(focusableSelectors.join(', ')),
  ];

  return candidates.filter((el) => !el.disabled && el.offsetParent !== null);
}

function findNextFocusableElement(startElement, forward) {
  let currentElement = forward
    ? startElement.nextElementSibling
    : startElement.previousElementSibling;

  while (currentElement) {
    const focusable = findFocusableElements(currentElement);
    if (focusable.length > 0) {
      return forward ? focusable[0] : focusable[focusable.length - 1];
    }
    currentElement = forward
      ? currentElement.nextElementSibling
      : currentElement.previousElementSibling;
  }

  return null;
}

function findFocusableInSiblingsAndParents(startElement, forward) {
  let currentElement = startElement.parentElement;

  while (currentElement && currentElement !== document.body) {
    let sibling = forward
      ? currentElement.nextElementSibling
      : currentElement.previousElementSibling;

    while (sibling) {
      const focusable = findFocusableElements(sibling);
      if (focusable.length > 0) {
        return forward ? focusable[0] : focusable[focusable.length - 1];
      }
      sibling = forward ? sibling.nextElementSibling : sibling.previousElementSibling;
    }

    currentElement = currentElement.parentElement;
  }

  return null;
}

export function focusNextFocusableElement(startElement, forward = true) {
  if (!startElement) return;

  const allFocusable = Array.from(document.querySelectorAll(focusableSelectors.join(', '))).filter(
    // @ts-ignore
    (el) => !el.disabled && el.offsetParent !== null
  );

  const nextFocusable =
    findNextFocusableElement(startElement, forward) ||
    findFocusableInSiblingsAndParents(startElement, forward) ||
    (forward ? allFocusable[0] : allFocusable[allFocusable.length - 1]);

  if (nextFocusable) {
    nextFocusable.focus();
  }
}

// Calculates a dictionary of texts to be displayed in a component, replacing default texts with any passed by property
export function getDisplayTexts(textsPassed, textsDefault, noCopy) {
  let ret = textsPassed ?? {};
  if (!noCopy) {
    ret = textsPassed ? JSON.parse(JSON.stringify(textsPassed)) : {};
  }
  Object.keys(textsDefault).forEach((key) => {
    if (typeof textsDefault[key] === 'object') {
      ret[key] = getDisplayTexts(ret[key], textsDefault[key], true);
    } else if (ret[key] === undefined) {
      ret[key] = textsDefault[key];
    }
  });

  return ret;
}

export function secondsToMinutesAndSeconds(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return { minutes, seconds: remainingSeconds };
}

export function sessionEndsInText(secondsToLive, texts) {
  const { minutes, seconds } = secondsToMinutesAndSeconds(secondsToLive);

  let minutesFinal = texts?.minutesPlural;

  if (minutes === 1 || (minutes % 10 === 1 && minutes !== 11)) {
    minutesFinal = texts?.minutesSingular;
  } else if (minutes === 11) {
    minutesFinal = texts?.minutes11;
  } else if (minutes % 10 === 1) {
    minutesFinal = texts?.minutesPluralEndsWith1;
  }

  let secondsFinal = texts?.secondsPlural;

  if (seconds === 1) {
    secondsFinal = texts?.secondsSingular;
  } else if (seconds === 11) {
    secondsFinal = texts?.seconds11;
  } else if (seconds % 10 === 1) {
    secondsFinal = texts?.secondsPluralEndsWith1;
  }

  let res = texts?.sessionEndingIn;
  if (minutes > 0) res += ` ${minutes} ${minutesFinal}`;
  if (minutes > 0 && seconds > 0) res += ` ${texts?.and}`;
  if (seconds > 0) res += ` ${seconds} ${secondsFinal}`;
  return res;
}

/**
 * Checks whether a value is `null` or `undefined`.
 *
 * @param {*} v - The value to check.
 * @returns {boolean} `true` if the value is `null` or `undefined`, otherwise `false`.
 */
export const isNil = (v) => v === null || v === undefined;

/**
 * Checks whether a value is not `null` or `undefined`.
 *
 * @param {*} v - The value to check.
 * @returns {boolean} `true` if the value is neither `null` nor `undefined`, otherwise `false`.
 */
export const isDefined = (v) => v !== null && v !== undefined;

/**
 * Checks whether a value is empty.
 * A value is considered empty if it is `null`, `undefined`, or an empty string (`''`).
 *
 * @param {*} v - The value to check.
 * @returns {boolean} `true` if the value is empty, otherwise `false`.
 */
export const isEmpty = (v) => v === null || v === undefined || v === '';

/**
 * Checks whether a value is a boolean.
 *
 * @param {*} v - The value to check.
 * @returns {boolean} `true` if the value is a boolean (`true` or `false`), otherwise `false`.
 */
export const isBoolean = (v) => typeof v === 'boolean';
