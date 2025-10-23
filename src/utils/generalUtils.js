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

export function focusNextFocusableElement(startElement, forward = true) {
  if (!startElement) return;

  const allFocusable = Array.from(document.querySelectorAll(focusableSelectors.join(', '))).filter(
    // @ts-ignore
    (el) => !el.disabled && el.offsetParent !== null
  );

  if (forward) {
    let currentElement = startElement.nextElementSibling;

    while (currentElement) {
      const focusable = findFocusableElements(currentElement);
      if (focusable.length > 0) {
        focusable[0].focus();
        return;
      }
      currentElement = currentElement.nextElementSibling;
    }

    currentElement = startElement.parentElement;
    while (currentElement && currentElement !== document.body) {
      let sibling = currentElement.nextElementSibling;
      while (sibling) {
        const focusable = findFocusableElements(sibling);
        if (focusable.length > 0) {
          focusable[0].focus();
          return;
        }
        sibling = sibling.nextElementSibling;
      }
      currentElement = currentElement.parentElement;
    }

    // If no next focusable element is found, focus the first focusable element in the document
    const firstFocusableElement = allFocusable[0];
    if (firstFocusableElement) {
      firstFocusableElement.focus();
    }
  } else {
    let currentElement = startElement.previousElementSibling;

    while (currentElement) {
      const focusable = findFocusableElements(currentElement);
      if (focusable.length > 0) {
        focusable[focusable.length - 1].focus();
        return;
      }
      currentElement = currentElement.previousElementSibling;
    }

    currentElement = startElement.parentElement;
    while (currentElement && currentElement !== document.body) {
      let sibling = currentElement.previousElementSibling;
      while (sibling) {
        const focusable = findFocusableElements(sibling);
        if (focusable.length > 0) {
          focusable[focusable.length - 1].focus();
          return;
        }
        sibling = sibling.previousElementSibling;
      }
      currentElement = currentElement.parentElement;
    }

    // If no next focusable element is found, focus the first focusable element in the document
    const lastFocusableElement = allFocusable[allFocusable.length - 1];
    if (lastFocusableElement) {
      lastFocusableElement.focus();
    }
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
