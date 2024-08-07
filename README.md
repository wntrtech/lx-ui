![LX/UI](https://raw.githubusercontent.com/wntrtech/lx-ui/main/public/imgs/cover.png)

# LX/UI

Powerful and flexible **Vue.js 3** components and **vanilla CSS** styles library, originally developed for [ZZ Dats](https://zzdats.lv) and [WNTR tech](https://wntr.tech) projects and products.

## Features

- 🔤 Over 30 input and data display components;
- 🏗️ Various shell, layout and form building components;
- 🖼️ SVG icons library (including multiple styles and brand logos);
- 🛠️ Hooks and utils;
- 📘 UX guidelines;
- 📐 Responsive layouts;
- 🎨 Theming:
  - ☀️ Light user theme;
  - 🌙 Dark user theme;
  - 🔆 High Contrast user theme;
  - Various products branding themes;
- ♿ Accessibility features ([WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/), [semantic web](https://en.wikipedia.org/wiki/Semantic_Web) and [APG](https://www.w3.org/WAI/ARIA/apg/patterns/));
- 🏆 Based on [Carbon Design System](https://carbondesignsystem.com/);
- 🕵️ Updating HTML or CSS is not a requirement (but still an option) - components are declarative in nature and fit together like puzzle pieces;

## Get

```bash
pnpm i -w '@wntr/lx-ui@latest'
```

For migration tips refer to [Migration guide](https://github.com/wntrtech/lx-ui/blob/main/MIGRATION.md)

## Use

install with pinia store:

```js
import { createPinia } from 'pinia';
import { createLx } from '@wntr/lx-ui';
import App from '@/App.vue';
…
const myApp = createApp(App);
myApp.use(createPinia());
myApp.use(createLx());
…
```

## Develop

```bash
pnpm
pnpm dev
```

Read more about development in [Development manual](https://github.com/wntrtech/lx-ui/blob/main/DEVELOPMENT.md)
