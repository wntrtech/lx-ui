import { test, expect, afterEach } from 'vitest';
import LxForm from '@/components/forms/Form.vue';
import LxSection from '@/components/forms/Section.vue';
import LxRow from '@/components/forms/Row.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import { mount } from '@vue/test-utils';
import 'regenerator-runtime/runtime';

let wrapper;

afterEach(() => {
  if (wrapper) {
    wrapper.unmount();
  }
});

/* Header and Footer tests */
test('LxForm with no header', () => {
  expect(LxForm).toBeTruthy();

  wrapper = mount(LxForm, {
    props: {
      showHeader: false,
    },
  });
  // process.stdout.write(`${wrapper.html()}\n`);
  expect(wrapper.html()).not.toContain('<header');
});

test('LxForm with no footer', () => {
  expect(LxForm).toBeTruthy();
  wrapper = mount(LxForm, {
    props: {
      showFooter: false,
    },
  });
  expect(wrapper.html()).not.toContain('<footer');
});

test('LxForm not sticky header', () => {
  expect(LxForm).toBeTruthy();
  wrapper = mount(LxForm, {
    props: {
      stickyHeader: false,
    },
  });
  const header = wrapper.find('header');
  expect(header.classes()).not.toContain('lx-sticky');
});

test('LxForm not sticky footer', () => {
  expect(LxForm).toBeTruthy();
  wrapper = mount(LxForm, {
    props: {
      stickyFooter: false,
    },
  });
  const header = wrapper.find('footer');
  expect(header.classes()).not.toContain('lx-sticky');
});

test('LxForm compact kind', () => {
  expect(LxForm).toBeTruthy();
  wrapper = mount(LxForm, {
    props: {
      kind: 'compact',
    },
  });
  const main = wrapper.find('.lx-main');
  expect(main.classes()).toContain('lx-compact-sections');
});

test('LxForm stripped kind', () => {
  expect(LxForm).toBeTruthy();

  wrapper = mount(LxForm, {
    props: {
      kind: 'stripped',
    },
  });

  const main = wrapper.find('.lx-main');
  expect(main.classes()).toContain('lx-compact-sections');
  expect(wrapper.classes()).toContain('lx-form-grid-stripped');
});

test('LxForm columnCount 2 test', () => {
  expect(LxForm).toBeTruthy();

  wrapper = mount(LxForm, {
    props: {
      columnCount: 2,
    },
  });

  const main = wrapper.find('.lx-main').find('.lx-form-section');
  expect(main.classes()).toContain('lx-form-section-2');
});

test('LxForm columnCount 3 test', () => {
  expect(LxForm).toBeTruthy();

  wrapper = mount(LxForm, {
    props: {
      columnCount: 3,
    },
  });

  const main = wrapper.find('.lx-main').find('.lx-form-section');
  expect(main.classes()).toContain('lx-form-section-3');
});

test('LxForm columnCount 4 test', () => {
  expect(LxForm).toBeTruthy();

  wrapper = mount(LxForm, {
    props: {
      columnCount: 4,
    },
  });

  const main = wrapper.find('.lx-main').find('.lx-form-section');
  expect(main.classes()).toContain('lx-form-section-4');
});

/* Button tests */
test('LxForm buttons test', () => {
  expect(LxForm).toBeTruthy();

  wrapper = mount(LxForm, {
    props: {
      actionDefinitions: [
        { id: 'one', name: 'one', kind: 'primary' },
        { id: 'two', name: 'two', kind: 'secondary' },
      ],
    },
    global: {
      stubs: ['router-link'],
    },
  });
  expect(wrapper.html()).toContain('button');
});

test('LxForm with 2 buttons test', () => {
  expect(LxForm).toBeTruthy();

  wrapper = mount(LxForm, {
    props: {
      actionDefinitions: [
        { id: 'one', name: 'one', kind: 'primary' },
        { id: 'two', name: 'two', kind: 'secondary' },
      ],
    },
    global: {
      stubs: ['router-link'],
    },
  });

  const lxButtons = wrapper.findAll('.lx-button');
  expect(lxButtons.length).toBe(2);
});

test('LxForm button click emit', () => {
  expect(LxForm).toBeTruthy();

  wrapper = mount(LxForm, {
    props: {
      actionDefinitions: [{ id: 'one', name: 'one', kind: 'primary' }],
    },
    global: {
      stubs: ['router-link'],
    },
  });
  wrapper.find('button').trigger('click');
  expect(wrapper.emitted()).toHaveProperty('buttonClick');
});

test('LxForm button click emit 3 times', () => {
  expect(LxForm).toBeTruthy();

  wrapper = mount(LxForm, {
    props: {
      actionDefinitions: [
        { id: 'one', name: 'one', kind: 'primary' },
        { id: 'two', name: 'two', kind: 'secondary' },
      ],
    },
    global: {
      stubs: ['router-link'],
    },
  });
  wrapper.findAll('button')[0].trigger('click');
  wrapper.findAll('button')[1].trigger('click');
  wrapper.findAll('button')[0].trigger('click');
  const emits = wrapper.emitted('buttonClick');
  expect(emits).toHaveLength(3);
  expect(emits[0]).toEqual(['one']);
  expect(emits[1]).toEqual(['two']);
  expect(emits[2]).toEqual(['one']);
});

test('LxForm button destructive', () => {
  expect(LxForm).toBeTruthy();

  wrapper = mount(LxForm, {
    props: {
      actionDefinitions: [{ id: 'one', name: 'one', kind: 'secondary', destructive: true }],
    },
    global: {
      stubs: ['router-link'],
    },
  });
  const button = wrapper.find('button');
  expect(button.classes()).toContain('lx-destructive');
});

test('LxForm button disabled', () => {
  expect(LxForm).toBeTruthy();

  wrapper = mount(LxForm, {
    props: {
      actionDefinitions: [
        { id: 'two', name: 'two', kind: 'primary' },
        { id: 'one', name: 'one', kind: 'secondary', disabled: true },
      ],
    },
    global: {
      stubs: ['router-link'],
    },
  });
  const button = wrapper.findAll('button');
  expect(button[0].attributes('disabled')).toEqual(undefined);
  expect(button[1].attributes('disabled')).toBe('');
});

test('LxForm button label', () => {
  expect(LxForm).toBeTruthy();

  wrapper = mount(LxForm, {
    props: {
      actionDefinitions: [
        { id: 'one', name: 'one', kind: 'primary' },
        { id: 'two', name: 'two', kind: 'secondary' },
      ],
    },
    global: {
      stubs: ['router-link'],
    },
  });
  const button = wrapper.findAll('button');
  expect(button[0].text()).toBe('one');
  expect(button[1].text()).toBe('two');
});

test('LxForm actionDefinitions is []', () => {
  expect(LxForm).toBeTruthy();
  wrapper = mount(LxForm, {
    props: {
      actionDefinitions: [],
    },
    global: {
      stubs: ['router-link'],
    },
  });

  expect(wrapper.findAll('button').length).toBe(0);
});

test('LxForm actionDefinitions is null', () => {
  expect(LxForm).toBeTruthy();
  wrapper = mount(LxForm, {
    props: {
      actionDefinitions: null,
    },
    global: {
      stubs: ['router-link'],
    },
  });

  expect(wrapper.findAll('button').length).toBe(0);
});

/* Slot tests */
test('LxForm header slot', () => {
  expect(LxForm).toBeTruthy();

  wrapper = mount(LxForm, {
    props: {},
    slots: {
      header: '<h1>Header</h1>',
    },
  });
  const headerSlot = wrapper.find('header').find('.lx-primary');
  expect(headerSlot.text()).toBe('Header');
});

test('LxForm default slot test', () => {
  expect(LxForm).toBeTruthy();

  wrapper = mount(LxForm, {
    props: {},
    global: {
      components: {
        LxRow,
      },
    },
    slots: {
      default: '<LxRow label="one">Default</LxRow>',
    },
  });
  const lxRowComponent = wrapper.find('.lx-row');
  expect(lxRowComponent.exists()).toBe(true);
});

test('LxForm sections slot with one section', () => {
  expect(LxForm).toBeTruthy();

  // const section = mount(LxSection, { slots: { default: 'Default' } });

  wrapper = mount(LxForm, {
    props: {},
    slots: {
      sections: '<LxSection>Default</LxSection>',
    },
    global: {
      components: {
        LxSection,
      },
    },
  });

  const lxSectionComponent = wrapper.findAll('.lx-form-section');
  expect(lxSectionComponent.length).toBe(2);
});

test('LxForm sections class test', () => {
  expect(LxForm).toBeTruthy();

  wrapper = mount(LxForm, {
    props: {
      columnCount: 3,
    },
    slots: {
      sections: '<LxSection :columnCount="2"></LxSection>',
    },
    global: {
      components: {
        LxSection,
      },
    },
  });

  const lxSectionComponent = wrapper.findAll('.lx-form-section');
  expect(lxSectionComponent[0].classes()).toContain('lx-form-section-3');
  expect(lxSectionComponent[1].classes()).toContain('lx-form-section-2');
});

test('LxForm pre,post header slots', () => {
  expect(LxForm).toBeTruthy();

  wrapper = mount(LxForm, {
    slots: {
      'pre-header': 'preHeader',
      'post-header': 'postHeader',
    },
  });
  const preHeaderSlot = wrapper.find('header').find('.pre-header-group');
  const postHeaderSlot = wrapper.find('header').find('.post-header-group');

  expect(preHeaderSlot.text()).toBe('preHeader');
  expect(postHeaderSlot.text()).toBe('postHeader');
});

/* Index tests */

test('LxForm indexes', () => {
  expect(LxForm).toBeTruthy();
  wrapper = mount(LxForm, {
    props: {
      index: [
        { id: 'one', name: 'one' },
        { id: 'two', name: 'two' },
      ],
      indexType: 'default',
    },
    slots: {
      sections: '<LxSection id="one"/> <LxSection id="two" />',
    },
    global: {
      components: {
        LxSection,
        LxDropDownMenu,
      },
      stubs: {
        'router-link': true,
      },
      directives: {
        'click-away': true,
      },
    },
  });

  const aside = wrapper.find('aside');
  expect(aside.html()).toContain('li');
});
