function isElementFocusable(element) {
  return element && element.offsetParent !== null && !element.disabled;
}

const focusableSelectors = [
  'a:not([disabled])',
  'button:not([disabled])',
  'input:not([disabled])',
  '[tabindex="0"]',
];

function findFocusableElement(element) {
  if (element.matches(focusableSelectors.join(',')) && isElementFocusable(element)) {
    return element;
  }

  return Array.from(element.children).map(findFocusableElement).find(Boolean) || null;
}

export function focusNextFocusableElement(startElement) {
  let currentElement = startElement.nextElementSibling;

  while (currentElement) {
    const focusable = findFocusableElement(currentElement);
    if (focusable) {
      focusable.focus();
      return;
    }
    currentElement = currentElement.nextElementSibling;
  }

  currentElement = startElement.parentElement;
  while (currentElement && currentElement !== document.body) {
    let sibling = currentElement.nextElementSibling;
    while (sibling) {
      const focusable = findFocusableElement(sibling);
      if (focusable) {
        focusable.focus();
        return;
      }
      sibling = sibling.nextElementSibling;
    }
    currentElement = currentElement.parentElement;
  }

  // If no next focusable element is found, focus the first focusable element in the document
  const firstFocusableElement = document.querySelector(focusableSelectors.join(', '));
  if (firstFocusableElement) {
    firstFocusableElement.focus();
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
