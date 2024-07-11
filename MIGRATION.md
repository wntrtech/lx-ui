# LX/UI Migration Guide

## 1.5 → 1.6

### Breaking changes

A navbar has been added for `public` layout mode. To hide it, make sure to add `hideNavBar="true"` to `LxShell`.

## 1.3 → 1.5

### Namespace

Starting 1.5 we're using different namespace for LX/UI library.

We'll be using **`@wntr/lx-ui`** instead of ~~`@zzdats/lx-ui`~~ from now on (make sure to update your css and font imports, which are probably in your `main.js` and `vite.config.js`). Other than that - no breaking changes.

### Date format

We've also have changed default date format from "dd.MM.yyyy" to "dd.MM.yyyy." (in accordance to [Latvian law](https://likumi.lv/ta/id/301436#p15)). If, for any reason, you want to change it back, you can always use LX globals (most likely, in your `main.js`), like so:

```js
myApp.use(createLx, {
  dateFormat: 'dd.MM.yyyy',
  dateTimeFormat: 'dd.MM.yyyy HH:mm',
  dateTimeFullFormat: 'dd.MM.yyyy HH:mm:ss',
});
```

### List item grouping

LxList items that have no groups defined, will be shown ungrouped by default (previously, they were not rendered at all). If for some reason you want the old behavior back - try assigning them groups that aren't defined in `group-definitions`.


## 1.2 → 1.3

### Prop changes

#### LxQrScanner

- `fileUploader` changed to `hasFileUploader`

### Some HTML changes

To make LX/UI more compliant to Semantic Web Guidelines, we've changed markup for some components. If you're not using local copies of the components, it should be all fine. If you are, check the list below for possible breaking changes.

#### LxDataBlock

- `<main>` changed to `<div class="lx-main">`

#### LxDataGrid

- `<label>` changed to `<p class="lx-primary">`
- `div` changed to `article`

#### LxExpander

- `<div class="lx-body">` changed to `<article class="lx-body">`

#### LxForm

- `<main>` changed to `<div class="lx-main">`
- `<label>` changed to `<p class="lx-description">`

#### LxHeader

- `<label>` changed to `<p class="lx-primary"`
- `<label class="lx-description">` changed to `<p class="lx-description"`

#### LxMap

- `<label class="lx-menu-label">` changed to `<p class="lx-menu-label">`

#### LxMarkdownTextArea

- `<label>` changed to `<p class="lx-description">`

#### LxModal

- `<main>` changed to `<article class="lx-main">`
- `<label>` changed to `<p class="lx-primary">`

#### LxStateDisplay

- `<label>` changed to `<p class="lx-primary">`

#### LxSteps

- `<label>` changed to `<p class="lx-description">`

#### LxTabControl

- `<label>` changed to `<p class="lx-primary">`
- `<div class="lx-tab-body">` changed to `<article class="lx-tab-body">`

#### LxTile

- `<main>` changed to `<article class="lx-main">`
- `<label>` changed to `<p class="lx-primary">`

#### LxWidget

- `<main>` changed to `<article class="lx-main">`

---

## 1.1 → 1.2

### Using themes

Make sure you import `'@zzdats/lx-ui/dist/styles/lx-ut-carbon-dark.css';` **and** `'@zzdats/lx-ui/dist/styles/lx-ut-carbon-contrast.css';`, as well as set `systemId` parameter in `createLx` for themes to work properly.

All themes come in a bundle, if deciding to use LX theming, you should implement all three of those (`light`, `dark` and `contrast`).

### Notable changes

#### LxShell

LxShell now displays alerts in `cover` mode by default (but only if they're defined).

If you want to use alerts only in the non-cover mode's header, but not in `cover`, make sure to leave `:alerts` prop empty when navigating to `/`!

### Breaking changes

#### LxDataGrid

- `actionDefinitions` changes:
  - `enableByAttributeName` changed to `enableByAttribute`

#### LxList

- `groupDefinitions` changes:
  - `expander` changed to `expanded`

---

## 1.0 → 1.1

### createLX

Make sure you're using [`myApp.use(createLx)`](src/main.js) in your project. A lot of future changes will require settings from this call.

### Using themes

Make sure you import `'@zzdats/lx-ui/dist/styles/lx-ut-carbon-dark.css';` and set `systemId` parameter in `createLx` for themes to work properly.

### Breaking changes

Make sure you don't use `:root` styles in your local styles and use `.lx` instead. You probably don't, but just in case, make sure 🙂. We've made some global style architecture changes, it might break something if you haven't been using LX styles properly before.

Sadly, we've also missed some breaking changes when updating to 1.0. Here are some of the missing ones. Hopefully, that's it for now:

**LxErrorPage**

- `actionDefinitions` changes:
  - `actionName` changed to `id`
  - `label` changed to `name`
  - `isDestructive` changed to `destructive`
  - `isDisabled` changed to `disabled`

**LxForm**

- `actionDefinitions` changes:
  - `actionName` changed to `id`
  - `label` changed to `name`

**LxList:**

- `groupDefinitions` changes:
  - `code` changed to `id`

**LxListItem** (only if you're using it standalone. If not - LxList takes care of that)

- `data` changed to `value`

**LxShell**

- `systemNameFormatted` functionality added. If defined, this prop will be used as portal cover heading instead of `systemName`. If `systemNameFormatted` was previously defined, then cover heading will be changed. Please, make sure that the desired text is displayed!!!

---

## 0.4 → 1.0

For every ongoing project, please consider migrating to 1.0, as this will be the version that will be maintained starting November 1, 2023.

### Prop naming changes

**LxContentSwitcher:**

- `idAttribute` default value changed from `code` to `id`
- `nameAttribute` default value changed from `displayName` to `name`

**LxDataBlock**

- `actionDefinitions` changes:
  - `actionName` changed to `id`
  - `label` changed to `name`
  - `isDestructive` changed to `destructive`

**LxDataGrid:**

- `rowIdAttributeName` with default value `code` changed to `idAttribute` with default value `id`
- `columnDefinitions` changes:
  - `code` changed to `id`
  - `displayName` changed to `name`
- `value` changed to `items`
- `actionDefinitions` changes:
  - `actionName` changed to `id`
  - `label` changed to `name`
  - `isDestructive` changed to `destructive`

**LxFilters:**

- `fastIdAttribute` with default value `id` added. Can be used for fast filters
- `fastNameAttribute` with default value `name` added. Can be used for fast filters

**LxFlag:**

- `country` changed to `value`

**LxIcon:**

- `icon` changed to `value`
- `class` changed to `customClass`

**LxList:**

- `modelValue` changed to `items`
- `itemIdAttributeName` with default value `code` changed to `idAttribute` with default value `id`
- `itemPrimaryAttributeName` changed to `primaryAttribute`
- `itemSecondaryAttributeName` changed to `secondaryAttribute`
- `itemHrefAttributeName` changed to `hrefAttribute`
- `itemGroupAttributeName` changed to `groupAttribute`
- `itemClickableAttributeName` changed to `clickableAttribute`
- `itemIconAttributeName` changed to `iconAttribute`
- `itemIconSetAttributeName` changed to `iconSetAttribute`
- `itemTooltipAttributeName` changed to `tooltipAttribute`
- `itemCategoryAttributeName` changed to `categoryAttribute`
- `actionDefinitions` changes:
  - `actionName` changed to `id`
  - `label` changed to `name`
  - `isDestructive` changed to `destructive`

**LxListItem**

- `actionDefinitions` changes:
  - `actionName` changed to `id`
  - `label` changed to `name`
  - `isDestructive` changed to `destructive`

**LxMasterDetail:**

- `idAttribute` with default value `id` added
- `nameAttribute` with default value `name` added
- `descriptionAttribute` with default value _null_ added

**LxSteps:**

- `codeAttribute` with default value `code` changed to `idAttribute` with default value `id`

**LxValuePicker:**

- `alwaysAsArray` default value changed to `false` from `true`

### Changes to importing styles

Starting v1.0 lx/styles library is obsolete, if you're using `lx-ui@1.0.0` and up, you should use lx/ui styles.

To do that,

1. Change your imports (usually in `main.js`) to use `@zzdats/lx-ui/dist/styles/`, like so:

```js
import '@zzdats/lx-ui/dist/styles/lx-reset.css';
import '@zzdats/lx-ui/dist/styles/lx-fonts-carbon.css';
import '@zzdats/lx-ui/dist/styles/lx-pt-carbon.css';
import '@zzdats/lx-ui/dist/styles/lx-ut-carbon-light.css';

import '@zzdats/lx-ui/dist/styles/lx-buttons.css';
import '@zzdats/lx-ui/dist/styles/lx-data-grid.css';
import '@zzdats/lx-ui/dist/styles/lx-inputs.css';
import '@zzdats/lx-ui/dist/styles/lx-steps.css';
import '@zzdats/lx-ui/dist/styles/lx-forms.css';
import '@zzdats/lx-ui/dist/styles/lx-notifications.css';
import '@zzdats/lx-ui/dist/styles/lx-modal.css';
import '@zzdats/lx-ui/dist/styles/lx-loaders.css';
import '@zzdats/lx-ui/dist/styles/lx-lists.css';
import '@zzdats/lx-ui/dist/styles/lx-expanders.css';
import '@zzdats/lx-ui/dist/styles/lx-tabs.css';
import '@zzdats/lx-ui/dist/styles/lx-calendars.css';
import '@zzdats/lx-ui/dist/styles/lx-animations.css';
import '@zzdats/lx-ui/dist/styles/lx-master-detail.css';
import '@zzdats/lx-ui/dist/styles/lx-ratings.css';

import '@zzdats/lx-ui/dist/styles/lx-shell-grid.css';
import '@zzdats/lx-ui/dist/styles/lx-shell-grid-public.css';
import '@zzdats/lx-ui/dist/styles/lx-forms-grid.css';

import '@/assets/lx-pt-demo.css'; /* use your product theme file here */
```

2. Update your `vite.config.js` to use `@zzdats/lx-ui/dist/lx-fonts`, like so:

```js
  resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '/lx-fonts': fileURLToPath(
          new URL('./node_modules/@zzdats/lx-ui/dist/lx-fonts', import.meta.url)
        ),
      },
    },
```

### Other changes

**LxTextInput:**

- `mask="password"` removed
- `kind="password"` added

---

## 0.X.X → 1.0.X

To migrate to 1.0, please, migrate to 0.4 first.

## 0.X.X → 0.4.X

If you can't afford to migrate to 1.0, please consider updating to 0.4.

Breaking changes from your Beta version to Beta 0.4 should be solved case-by-case, there is no guide.
