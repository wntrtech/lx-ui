![LX/UI](https://raw.githubusercontent.com/wntrtech/lx-ui/main/public/imgs/cover.png)

# LX/UI

Powerful and flexible **Vue.js 3** components and **vanilla CSS** styles library, originally developed for various enterpise apps.

Focus on business logic, not boilerplate.

## Features
 
 - 🔤 50+ input, data display and container components;
 - 🏗️ Declarative building tools;
 - 🖼️ 350+ functional icons, 3 icon sets;
 - 🖼️ 100+ branding logo icons;
 - 🛠️ Hooks, stores and utils;
 - 📘 UX guidelines;
 - 📐 Responsive layouts;
 - 🎨 Theming:
   - ☀️ Light user theme;
   - 🌙 Dark user theme;
   - 🔆 High Contrast user theme;
   - Various products branding themes;
 - ♿ Accessibility: 
   - Standards: [WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/), [Semantic Web](https://en.wikipedia.org/wiki/Semantic_Web) and [APG](https://www.w3.org/WAI/ARIA/apg/patterns/);
    - Regulations: [🇱🇻 Ministru kabineta noteikumi Nr. 445](https://likumi.lv/ta/id/316109-kartiba-kada-iestades-ievieto-informaciju-interneta), [🇪🇺 Directive 2019/882](https://eur-lex.europa.eu/eli/dir/2019/882/oj)
 - 🏆 Based on [Carbon Design System](https://carbondesignsystem.com/);
 - 🕵️ Updating HTML or CSS is not a requirement (but still an option) - components are declarative in nature and fit together like puzzle pieces;


## Play around

Check out our [🌐 Demo](https://lx-ui.dev/) and 
[ℹ️ List of Components](https://github.com/wntrtech/lx-ui/blob/main/docs/Components.md) for live demo sandbox.

## Read the docs
- [ℹ️ Design Tokens](https://github.com/wntrtech/lx-ui/blob/main/docs/DesignTokens.md)
- [ℹ️ Progressive Web App Guide](https://github.com/wntrtech/lx-ui/blob/main/docs/PWA.md)
- [🌐 Forms](https://lx.zzdats.lv/resources/forms)
- [🌐 Colors](https://lx.zzdats.lv/resources/colors)
- [🌐 Icons](https://lx.zzdats.lv/resources/icons)
- [🌐 Utils](https://lx.zzdats.lv/resources/utility/stringUtils)
### Declarative Tools
- [🏗️ LxFormBuilder](https://github.com/wntrtech/lx-ui/blob/main/docs/FormBuilder.md)
- [🏗️ LxViewBuilder](https://github.com/wntrtech/lx-ui/blob/main/docs/ViewBuilder.md)
- 🛠️ LxFilterBuilder

## Get

```bash
pnpm i -w '@wntr/lx-ui@latest'
```

For migration tips refer to [ℹ️ Migration Guide](https://github.com/wntrtech/lx-ui/blob/main/MIGRATION.md)

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

Read more about development in [ℹ️ Development manual](https://github.com/wntrtech/lx-ui/blob/main/DEVELOPMENT.md)

### Vite Plugins

LX/UI now includes several Vite plugins to enhance your development experience and application security. These plugins are designed to seamlessly integrate with your Vite-based projects.

For detailed information on available plugins and their usage, please refer to our [ℹ️ Vite Plugins Documentation](https://github.com/wntrtech/lx-ui/blob/main/docs/VITE_PLUGINS.md).