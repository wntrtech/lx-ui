import { test, expect, afterEach } from 'vitest';
import LxButton from '@/components/Button.vue';
import { mount, RouterLinkStub } from '@vue/test-utils';

let wrapper;

afterEach(() => {
  if (wrapper) {
    wrapper.unmount();
  }
});

test('LxButton label', async () => {
  expect(LxButton).toBeTruthy();

  wrapper = mount(LxButton, {
    props: {
      label: 'Required test label',
    },
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });

  const inputElement = wrapper.find('.lx-button-label').text();
  expect(inputElement).toBe('Required test label');
  // after setting href, element changes from 'button' to 'a' so we need to check again
  await wrapper.setProps({ href: { name: 'test' } });
  expect(inputElement).toBe('Required test label');
});

test('LxButton title', async () => {
  expect(LxButton).toBeTruthy();

  wrapper = mount(LxButton, {
    props: {
      label: 'Required test label',
      title: 'Test title',
    },
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });
  const inputElement = wrapper.find('button');
  expect(inputElement.attributes('title')).toBe('Test title');

  await wrapper.setProps({ href: { name: 'test' } });
  const hrefElement = wrapper.find('a');
  expect(hrefElement.attributes('title')).toBe('Test title');
});

test('LxButton id', async () => {
  expect(LxButton).toBeTruthy();

  wrapper = mount(LxButton, {
    props: {
      id: 'Test id',
      label: 'Required test label',
    },
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });
  const inputElement = wrapper.find('button');
  expect(inputElement.attributes('id')).toBe('Test id');

  await wrapper.setProps({ href: { name: 'test' } });
  const hrefElement = wrapper.find('a');
  expect(hrefElement.attributes('id')).toBe('Test id');
});

test('LxButton icon', async () => {
  expect(LxButton).toBeTruthy();

  wrapper = mount(LxButton, {
    props: {
      label: 'Required test label',
      icon: 'add',
      iconSet: 'cds',
    },
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });
  const inputElement = wrapper.find('button').find('svg');
  expect(inputElement.isVisible()).toBe(true);

  await wrapper.setProps({ href: { name: 'test' } });
  const hrefElement = wrapper.find('a').find('svg');
  expect(hrefElement.isVisible()).toBe(true);
});

test('LxButton kind', async () => {
  expect(LxButton).toBeTruthy();

  wrapper = mount(LxButton, {
    props: {
      label: 'Required test label',
      kind: '',
    },
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });
  const inputElement = wrapper.find('button');
  expect(inputElement.classes()).toMatchObject(['lx-button', 'lx-button-text-only']);
  await wrapper.setProps({ kind: 'secondary' });
  expect(inputElement.classes('lx-button-secondary')).toBe(true);
  await wrapper.setProps({ kind: 'tertiary' });
  expect(inputElement.classes('lx-button-tertiary')).toBe(true);
  await wrapper.setProps({ kind: 'ghost' });
  expect(inputElement.classes('lx-button-ghost')).toBe(true);

  await wrapper.setProps({ href: { name: 'test' } });
  const hrefElement = wrapper.find('a');
  expect(hrefElement.classes('lx-button-ghost')).toBe(true);
  await wrapper.setProps({ kind: 'secondary' });
  expect(hrefElement.classes('lx-button-secondary')).toBe(true);
  await wrapper.setProps({ kind: 'tertiary' });
  expect(hrefElement.classes('lx-button-tertiary')).toBe(true);
  await wrapper.setProps({ kind: '' });
  expect(hrefElement.classes()).toMatchObject(['lx-button', 'lx-button-text-only']);
});

test('LxButton icon-only', async () => {
  expect(LxButton).toBeTruthy();

  wrapper = mount(LxButton, {
    props: {
      label: 'Required test label',
      variant: 'icon-only',
    },
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });
  const inputElement = wrapper.find('button');
  expect(inputElement.classes('lx-button-icon-only')).toBe(true);
  await wrapper.setProps({ variant: '', icon: 'add', iconSet: 'cds', label: '' });
  expect(inputElement.classes('lx-button-icon-only')).toBe(true);
  expect(inputElement.find('svg').isVisible()).toBe(true);

  await wrapper.setProps({ href: { name: 'test' } });
  const hrefElement = wrapper.find('a');
  expect(hrefElement.classes('lx-button-icon-only')).toBe(true);
  expect(hrefElement.find('svg').isVisible()).toBe(true);
  await wrapper.setProps({
    variant: 'icon-only',
    icon: undefined,
    iconSet: undefined,
    label: undefined,
  });
  expect(inputElement.classes('lx-button-icon-only')).toBe(true);
});

test('LxButton destructive', async () => {
  expect(LxButton).toBeTruthy();

  wrapper = mount(LxButton, {
    props: {
      label: 'Required test label',
      destructive: true,
    },
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });
  const inputElement = wrapper.find('button');
  expect(inputElement.classes('lx-destructive')).toBe(true);
  await wrapper.setProps({ destructive: false });
  expect(inputElement.classes('lx-destructive')).toBe(false);

  await wrapper.setProps({ href: { name: 'test' } });
  const hrefElement = wrapper.find('a');
  expect(hrefElement.classes('lx-destructive')).toBe(false);
  await wrapper.setProps({ destructive: true });
  expect(hrefElement.classes('lx-destructive')).toBe(true);
});

test('LxButton href', async () => {
  expect(LxButton).toBeTruthy();

  wrapper = mount(LxButton, {
    props: {
      label: 'Required test label',
      href: { name: 'test' },
    },
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });
  expect(wrapper.findComponent(RouterLinkStub).props().to).toMatchObject({
    name: 'test',
  });
  await wrapper.setProps({ disabled: true });
  expect(wrapper.findComponent(RouterLinkStub).props().to).toMatchObject({});
});

test('LxButton disabled', async () => {
  expect(LxButton).toBeTruthy();

  wrapper = mount(LxButton, {
    props: {
      label: 'Required test label',
      disabled: true,
    },
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });
  const inputElement = wrapper.find('button');
  expect(inputElement.attributes('disabled')).toBeDefined();
  expect(inputElement.attributes('aria-disabled')).toBe('true');
  await wrapper.setProps({ disabled: false });
  expect(inputElement.attributes('disabled')).toBeUndefined();
  expect(inputElement.attributes('aria-disabled')).toBe('false');

  await wrapper.setProps({ href: { name: 'test' } });
  const hrefElement = wrapper.find('a');
  expect(hrefElement.classes('lx-disabled')).toBe(false);
  await wrapper.setProps({ disabled: true });
  expect(hrefElement.classes('lx-disabled')).toBe(true);
});

test('LxButton loading', async () => {
  expect(LxButton).toBeTruthy();

  wrapper = mount(LxButton, {
    props: {
      label: 'Required test label',
      loading: true,
    },
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });
  const inputElement = wrapper.find('button');
  expect(inputElement.attributes('disabled')).toBeDefined();
  expect(inputElement.attributes('aria-disabled')).toBe('true');
  await wrapper.setProps({ loading: false });
  expect(inputElement.attributes('disabled')).toBeUndefined();
  expect(inputElement.attributes('aria-disabled')).toBe('false');

  await wrapper.setProps({ href: { name: 'test' } });
  const hrefElement = wrapper.find('a');
  expect(hrefElement.classes('lx-disabled')).toBe(false);
  await wrapper.setProps({ disabled: true });
  expect(hrefElement.classes('lx-disabled')).toBe(true);
});

test('LxButton busy', async () => {
  expect(LxButton).toBeTruthy();

  wrapper = mount(LxButton, {
    props: {
      label: 'Required test label',
      busy: true,
      icon: 'add',
    },
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });
  const inputElement = wrapper.find('button');
  expect(inputElement.classes('lx-busy')).toBe(true);
  expect(inputElement.find('.lx-loader-container').exists()).toBe(true);
  await wrapper.setProps({ busy: false });
  expect(inputElement.classes('lx-busy')).toBe(false);
  expect(inputElement.find('.lx-loader-container').exists()).toBe(false);

  await wrapper.setProps({ href: { name: 'test' } });
  const hrefElement = wrapper.find('a');
  expect(hrefElement.find('.lx-loader-container').exists()).toBe(false);
  await wrapper.setProps({ busy: true });
  expect(hrefElement.find('.lx-loader-container').exists()).toBe(true);
});

test('LxButton badge', async () => {
  expect(LxButton).toBeTruthy();
  wrapper = mount(LxButton, {
    props: {
      label: 'Required test label',
      badge: 'Test badge',
      badgeType: 'default',
    },
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });
  const inputElement = wrapper.find('button').find('.lx-badge');
  expect(inputElement.classes('lx-badge-info')).toBe(true);
  expect(inputElement.text()).toBe('Test badge');
  await wrapper.setProps({ badgeType: 'default' });
  expect(inputElement.classes('lx-badge-info')).toBe(true);
  await wrapper.setProps({ badgeType: 'good' });
  expect(inputElement.classes('lx-badge-good')).toBe(true);
  await wrapper.setProps({ badgeType: 'warning' });
  expect(inputElement.classes('lx-badge-warning')).toBe(true);
  await wrapper.setProps({ badgeType: 'important', badge: ' ' });
  expect(inputElement.classes('lx-badge-important')).toBe(true);
  expect(inputElement.classes('lx-badge-empty')).toBe(true);

  await wrapper.setProps({ href: { name: 'test' } });
  const hrefElement = wrapper.find('a').find('.lx-badge');
  expect(hrefElement.classes('lx-badge-important')).toBe(true);
  expect(hrefElement.classes('lx-badge-empty')).toBe(true);
  await wrapper.setProps({ badgeType: 'default', badge: 'Test badge' });
  expect(hrefElement.classes('lx-badge-info')).toBe(true);
  expect(hrefElement.text()).toBe('Test badge');
  await wrapper.setProps({ badgeType: 'default' });
  expect(hrefElement.classes('lx-badge-info')).toBe(true);
  await wrapper.setProps({ badgeType: 'good' });
  expect(hrefElement.classes('lx-badge-good')).toBe(true);
  await wrapper.setProps({ badgeType: 'warning' });
  expect(hrefElement.classes('lx-badge-warning')).toBe(true);
});

test('LxButton active', async () => {
  expect(LxButton).toBeTruthy();

  wrapper = mount(LxButton, {
    props: {
      label: 'Required test label',
      active: true,
    },
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });
  const inputElement = wrapper.find('button');
  expect(inputElement.classes('lx-active')).toBe(true);
  await wrapper.setProps({ active: false });
  expect(inputElement.classes('lx-active')).toBe(false);

  await wrapper.setProps({ href: { name: 'test' } });
  const hrefElement = wrapper.find('a');
  expect(hrefElement.classes('lx-active')).toBe(false);
  await wrapper.setProps({ active: true });
  expect(hrefElement.classes('lx-active')).toBe(true);
});

test('LxButton tabindex', async () => {
  expect(LxButton).toBeTruthy();

  wrapper = mount(LxButton, {
    props: {
      label: 'Required test label',
      tabindex: 1,
    },
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });
  const inputElement = wrapper.find('button');
  expect(inputElement.attributes('tabindex')).toBe('1');

  await wrapper.setProps({ href: { name: 'test' } });
  const hrefElement = wrapper.find('a');
  expect(hrefElement.attributes('tabindex')).toBe('1');
});

test('LxButton custom class', async () => {
  expect(LxButton).toBeTruthy();

  wrapper = mount(LxButton, {
    props: {
      label: 'Required test label',
      customClass: 'test-class',
    },
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });
  const inputElement = wrapper.find('.test-class');
  expect(inputElement.classes('test-class')).toBe(true);

  await wrapper.setProps({ href: { name: 'test' } });
  const hrefElement = wrapper.find('.test-class');
  expect(hrefElement.classes('test-class')).toBe(true);
});
