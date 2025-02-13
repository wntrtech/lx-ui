import { test, expect, afterEach } from 'vitest';
import LxForm from '@/components/forms/Form.vue';
import LxSection from '@/components/forms/Section.vue';
import LxRow from '@/components/forms/Row.vue';
import { mount } from '@vue/test-utils';
import { h } from 'vue';

let wrapper;

afterEach(() => {
  if (wrapper) {
    wrapper.unmount();
  }
});

test('LxSection id', () => {
  expect(LxSection).toBeTruthy();

  wrapper = mount(LxForm, {
    slots: {
      sections: h(LxSection, { id: 'section' }),
    },
    global: {
      components: {
        LxSection,
      },
    },
  });
  // process.stdout.write(`${wrapper.html()}\n`);
  const section = wrapper.findAll('section');
  expect(section[0].attributes('id')).toBe('default');
  expect(section[1].attributes('id')).toBe('section');
});

test('LxSection columnCount', () => {
  expect(LxSection).toBeTruthy();

  wrapper = mount(LxForm, {
    slots: {
      sections: h(LxSection, { columnCount: 4 }),
    },
    global: {
      components: {
        LxSection,
      },
    },
  });

  const section = wrapper.findAll('section');
  expect(section[1].classes()).toContain('lx-form-section-4');
});

test('LxSection columnCount 2', () => {
  expect(LxSection).toBeTruthy();

  wrapper = mount(LxForm, {
    slots: {
      sections: [
        h(LxSection, { columnCount: 2 }),
        h(LxSection, { columnCount: 3 }),
        h(LxSection, { columnCount: 4 }),
        h(LxSection, { columnCount: 8 }),
      ],
    },
    global: {
      components: {
        LxSection,
      },
    },
  });

  const sections = wrapper.findAll('section.lx-form-section');
  expect(sections.length).toBe(5);
  expect(sections[0].classes()).toContain('lx-form-section');
  expect(sections[1].classes()).toContain('lx-form-section-2');
  expect(sections[2].classes()).toContain('lx-form-section-3');
  expect(sections[3].classes()).toContain('lx-form-section-4');
  expect(sections[4].classes()).toContain('lx-form-section-8');
});

test('LxSection columnCount default', () => {
  expect(LxSection).toBeTruthy();

  wrapper = mount(LxForm, {
    slots: {
      sections: h(LxSection),
    },
    global: {
      components: {
        LxSection,
      },
    },
  });

  const sections = wrapper.findAll('section.lx-form-section');
  expect(sections.length).toBe(2);
});

test('LxSection label', () => {
  expect(LxSection).toBeTruthy();

  wrapper = mount(LxForm, {
    slots: {
      sections: h(LxSection, { id: 'one', label: 'Section one' }),
    },
    global: {
      components: {
        LxSection,
      },
    },
  });

  const section = wrapper.find('section#one');
  expect(section.find('.heading-3').text()).toBe('Section one');
});

test('LxSection description', () => {
  expect(LxSection).toBeTruthy();

  wrapper = mount(LxForm, {
    slots: {
      sections: h(LxSection, { id: 'one', description: 'Section one description' }),
    },
    global: {
      components: {
        LxSection,
      },
    },
  });

  const section = wrapper.find('section#one');
  expect(section.find('.lx-description').text()).toBe('Section one description');
});

test('LxSection default slot', () => {
  expect(LxSection).toBeTruthy();

  wrapper = mount(LxForm, {
    slots: {
      sections: h(
        LxSection,
        { id: 'one' },
        {
          default: () => 'Default slot',
        }
      ),
    },
    global: {
      components: {
        LxSection,
      },
    },
  });

  expect(wrapper.find('section#one').text()).toBe('Default slot');
});

test('LxSection requiredMode "none"', () => {
  expect(LxSection).toBeTruthy();

  wrapper = mount(LxForm, {
    slots: {
      sections: h(
        LxSection,
        {
          id: 'one',
        },
        {
          default: () => [
            h(LxRow, { label: 'One', required: null }),
            h(LxRow, { label: 'Two', required: false }),
            h(LxRow, { label: 'Three', required: true }),
          ],
        }
      ),
    },
    global: {
      components: {
        LxSection,
      },
    },
  });

  const section = wrapper.find('section#one');
  const rows = section.findAll('.lx-row');
  expect(rows[0].find('label').text()).toBe('One');
  expect(rows[1].find('label').text()).toBe('Two');
  expect(rows[2].find('label').text()).toBe('Three');
});

test('LxSection requiredMode "required"', () => {
  expect(LxSection).toBeTruthy();

  wrapper = mount(LxForm, {
    slots: {
      sections: h(
        LxSection,
        {
          id: 'one',
          requiredMode: 'required',
        },
        {
          default: () => [
            h(LxRow, { label: 'One', required: null }),
            h(LxRow, { label: 'Two', required: false }),
            h(LxRow, { label: 'Three', required: true }),
          ],
        }
      ),
    },
    global: {
      components: {
        LxSection,
      },
    },
  });

  const section = wrapper.find('section#one');
  const rows = section.findAll('.lx-row');
  expect(rows[0].find('label').text()).not.toContain('(obligāts)');
  expect(rows[1].find('label').text()).not.toContain('(obligāts)');
  expect(rows[2].find('label').text()).toContain('(obligāts)');
});

test('LxSection requiredMode "required-asterisk"', () => {
  expect(LxSection).toBeTruthy();

  wrapper = mount(LxForm, {
    slots: {
      sections: h(
        LxSection,
        {
          id: 'one',
          requiredMode: 'required-asterisk',
        },
        {
          default: () => [
            h(LxRow, { label: 'One', required: null }),
            h(LxRow, { label: 'Two', required: false }),
            h(LxRow, { label: 'Three', required: true }),
          ],
        }
      ),
    },
    global: {
      components: {
        LxSection,
      },
    },
  });

  const section = wrapper.find('section#one');
  const rows = section.findAll('.lx-row');
  expect(rows[0].find('label').text()).not.toContain('*');
  expect(rows[1].find('label').text()).not.toContain('*');
  expect(rows[2].find('label').text()).toContain('*');
});

test('LxSection requiredMode "optional"', () => {
  expect(LxSection).toBeTruthy();

  wrapper = mount(LxForm, {
    slots: {
      sections: h(
        LxSection,
        {
          id: 'one',
          requiredMode: 'optional',
        },
        {
          default: () => [
            h(LxRow, { label: 'One', required: null }),
            h(LxRow, { label: 'Two', required: false }),
            h(LxRow, { label: 'Three', required: true }),
          ],
        }
      ),
    },
    global: {
      components: {
        LxSection,
      },
    },
  });

  const section = wrapper.find('section#one');
  const rows = section.findAll('.lx-row');
  expect(rows[0].find('label').text()).not.toContain('(neobligāts)');
  expect(rows[1].find('label').text()).toContain('(neobligāts)');
  expect(rows[2].find('label').text()).not.toContain('(neobligāts)');
});
