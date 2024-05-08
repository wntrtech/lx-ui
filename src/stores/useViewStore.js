export default {
  state: () => ({
    header: true,
    navBar: true,
    goBack: false,
    backName: null,
    description: null,
    blockNav: false,
    title: null,
    breadcrumbOverrides: null,
  }),
  getters: {
    isHeaderShown: (state) => state.header,
    isNavBarShown: (state) => state.navBar,
    pageTitle: (state) => state.title,
    canGoBack: (state) => state.goBack,
    backRouteName: (state) => state.backName,
    pageDescription: (state) => state.description,
    getBreadcrumbOverrides: (state) => state.breadcrumbOverrides,
  },
  actions: {
    showHeader() {
      this.header = true;
    },
    hideHeader() {
      this.header = false;
    },
    showNavBar() {
      this.navBar = true;
    },
    hideNavBar() {
      this.navBar = false;
    },
    showBack() {
      this.goBack = true;
    },
    hideBack() {
      this.goBack = false;
    },
    blockNavigation() {
      this.blockNav = true;
    },
    unblockNavigation() {
      this.blockNav = false;
    },
    setBackRouteName(value) {
      this.backName = value;
    },
    setPageTitle(value) {
      this.title = value;
      this.forcePageState(value);
    },
    setPageDescription(value) {
      this.description = value;
    },
    forcePageState(title, url = null) {
      if (title) document.title = title;
      if (url) window.history.pushState({}, '', url);
    },
    overrideBreadcrumbs(code, value) {
      if (!this.breadcrumbOverrides) {
        this.breadcrumbOverrides = [];
      }
      const val = { code, value };
      this.breadcrumbOverrides.push(val);
    },
  },
};
