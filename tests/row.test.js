import { test, expect, afterEach } from 'vitest';
import LxForm from '@/components/forms/Form.vue';
import LxRow from '@/components/forms/Row.vue';
import LxSection from '@/components/forms/Section.vue';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import LxTextInput from '@/components/TextInput.vue';
import LxTextArea from '@/components/TextArea.vue';

let wrapper;

afterEach(() => {
  if (wrapper) {
    wrapper.unmount();
  }
});

test('LxRow label', () => {
  expect(LxRow).toBeTruthy();

  wrapper = mount(LxForm, {
    slots: {
      default: h(LxRow, { label: 'Label' }),
    },
    global: {
      components: {
        LxRow,
      },
    },
  });
  // process.stdout.write(`${wrapper.html()}\n`);
  const label = wrapper.find('.lx-row').find('label');
  expect(label.text()).toBe('Label');
});

test('LxRow hideLabel', () => {
  expect(LxRow).toBeTruthy();

  wrapper = mount(LxForm, {
    slots: {
      default: h(LxRow, { hideLabel: true }),
    },
    global: {
      components: {
        LxRow,
      },
    },
  });

  const row = wrapper.find('.lx-row');
  expect(row.find('label').exists()).toBe(false);
});

test('LxRow description', () => {
  expect(LxRow).toBeTruthy();

  wrapper = mount(LxForm, {
    slots: {
      default: h(LxRow, { label: 'Label', description: 'Description' }),
    },
    global: {
      components: {
        LxRow,
      },
    },
  });

  const title = wrapper.find('.lx-row').find('label').attributes('title');
  expect(title).toBe('Label\nDescription');
});

test('LxRow columnSpan', () => {
  expect(LxRow).toBeTruthy();

  wrapper = mount(LxForm, {
    props: {
      columnCount: 2,
    },
    slots: {
      default: h(LxRow, { columnSpan: 2 }),
    },
    global: {
      components: {
        LxRow,
      },
    },
  });

  const row = wrapper.find('.lx-row');
  expect(row.classes()).toContain('lx-row-column-2');
});

test('LxRow columnSpan 2', () => {
  expect(LxRow).toBeTruthy();

  wrapper = mount(LxForm, {
    props: {
      columnCount: 8,
    },
    slots: {
      default: [
        h(LxRow, { columnSpan: 3 }),
        h(LxRow, { columnSpan: 4 }),
        h(LxRow, { columnSpan: 6 }),
        h(LxRow, { columnSpan: 8 }),
      ],
    },
    global: {
      components: {
        LxRow,
      },
    },
  });
  const row = wrapper.findAll('.lx-row');
  expect(row[0].classes()).toContain('lx-row-column-3');
  expect(row[1].classes()).toContain('lx-row-column-4');
  expect(row[2].classes()).toContain('lx-row-column-6');
  expect(row[3].classes()).toContain('lx-row-column-8');
});

test('LxRow rowSpan', () => {
  expect(LxRow).toBeTruthy();

  wrapper = mount(LxForm, {
    slots: {
      default: [
        h(LxRow, { rowSpan: 2 }),
        h(LxRow, { rowSpan: 3 }),
        h(LxRow, { rowSpan: 4 }),
        h(LxRow, { rowSpan: 6 }),
        h(LxRow, { rowSpan: 8 }),
      ],
    },
    global: {
      components: {
        LxRow,
      },
    },
  });
  const row = wrapper.findAll('.lx-row');
  expect(row[0].classes()).toContain('lx-row-row-2');
  expect(row[1].classes()).toContain('lx-row-row-3');
  expect(row[2].classes()).toContain('lx-row-row-4');
  expect(row[3].classes()).toContain('lx-row-row-6');
  expect(row[4].classes()).toContain('lx-row-row-8');
});

test('LxRow rowSpan, columnSpan', () => {
  expect(LxRow).toBeTruthy();

  wrapper = mount(LxForm, {
    props: {
      columnCount: 8,
    },
    slots: {
      default: [
        h(LxRow, { rowSpan: 2, columnSpan: 4 }),
        h(LxRow, { rowSpan: '3', columnSpan: '6' }),
        h(LxRow, { rowSpan: 4, columnSpan: '8' }),
      ],
    },
    global: {
      components: {
        LxRow,
      },
    },
  });
  const row = wrapper.findAll('.lx-row');
  expect(row[0].classes()).toContain('lx-row-row-2');
  expect(row[0].classes()).toContain('lx-row-column-4');
  expect(row[1].classes()).toContain('lx-row-row-3');
  expect(row[1].classes()).toContain('lx-row-column-6');
  expect(row[2].classes()).toContain('lx-row-row-4');
  expect(row[2].classes()).toContain('lx-row-column-8');
});

test('LxRow required', () => {
  expect(LxRow).toBeTruthy();

  wrapper = mount(LxForm, {
    props: {},
    slots: {
      default: [
        h(LxRow, { label: 'Name', required: null }),
        h(LxRow, { label: 'Surname', required: true }),
        h(LxRow, { label: 'Age', required: false }),
      ],
    },
    global: {
      components: {
        LxRow,
      },
    },
  });
  const row = wrapper.findAll('.lx-row');
  expect(row[0].find('label').text()).toBe('Name');
  expect(row[1].find('label').text()).toBe('Surname');
  expect(row[2].find('label').text()).toBe('Age');
});

test('LxRow required 2', () => {
  expect(LxRow).toBeTruthy();

  wrapper = mount(LxForm, {
    props: {
      requiredMode: 'required',
    },
    slots: {
      default: [
        h(LxRow, { label: 'Name', required: null }),
        h(LxRow, { label: 'Surname', required: true }),
        h(LxRow, { label: 'Age', required: false }),
      ],
    },
    global: {
      components: {
        LxRow,
      },
    },
  });
  const row = wrapper.findAll('.lx-row');
  expect(row[0].find('label').text()).not.toContain('(obligāts)');
  expect(row[1].find('label').text()).toContain('(obligāts)');
  expect(row[2].find('label').text()).not.toContain('(obligāts)');
});

test('LxRow required 3', () => {
  expect(LxRow).toBeTruthy();

  wrapper = mount(LxForm, {
    props: {
      requiredMode: 'required-asterisk',
    },
    slots: {
      default: [
        h(LxRow, { label: 'Name', required: null }),
        h(LxRow, { label: 'Surname', required: true }),
        h(LxRow, { label: 'Age', required: false }),
      ],
    },
    global: {
      components: {
        LxRow,
      },
    },
  });
  const row = wrapper.findAll('.lx-row');
  expect(row[0].find('label').text()).not.toContain('*');
  expect(row[1].find('label').text()).toContain('*');
  expect(row[2].find('label').text()).not.toContain('*');
});

test('LxRow required 4', () => {
  expect(LxRow).toBeTruthy();

  wrapper = mount(LxForm, {
    props: {
      requiredMode: 'optional',
    },
    slots: {
      default: [
        h(LxRow, { label: 'Name', required: null }),
        h(LxRow, { label: 'Surname', required: true }),
        h(LxRow, { label: 'Age', required: false }),
      ],
    },
    global: {
      components: {
        LxRow,
      },
    },
  });
  const row = wrapper.findAll('.lx-row');
  expect(row[0].find('label').text()).not.toContain('(neobligāts)');
  expect(row[1].find('label').text()).not.toContain('(neobligāts)');
  expect(row[2].find('label').text()).toContain('(neobligāts)');
});

test('LxRow required 5', () => {
  expect(LxRow).toBeTruthy();

  wrapper = mount(LxForm, {
    props: {
      requiredMode: 'required',
      texts: { required: '(super required)', optional: '(very optional)' },
    },
    slots: {
      default: [
        h(LxRow, { label: 'Name', required: null }),
        h(LxRow, { label: 'Surname', required: true }),
        h(LxRow, { label: 'Age', required: false }),
      ],
    },
    global: {
      components: {
        LxRow,
      },
    },
  });

  const row = wrapper.findAll('.lx-row');
  expect(row[0].find('label').text()).not.toContain('(super required)');
  expect(row[1].find('label').text()).not.toContain('(neobligāts)');
  expect(row[1].find('label').text()).toContain('(super required)');
  expect(row[2].find('label').text()).not.toContain('(super required)');
});

test('LxRow required 6', () => {
  expect(LxRow).toBeTruthy();

  wrapper = mount(LxForm, {
    props: {
      requiredMode: 'optional',
      texts: { required: '(super required)', optional: '(very optional)' },
    },
    slots: {
      default: [
        h(LxRow, { label: 'Name', required: null }),
        h(LxRow, { label: 'Surname', required: true }),
        h(LxRow, { label: 'Age', required: false }),
      ],
    },
    global: {
      components: {
        LxRow,
      },
    },
  });

  const row = wrapper.findAll('.lx-row');
  expect(row[0].find('label').text()).not.toContain('(very optional)');
  expect(row[1].find('label').text()).not.toContain('(very optional)');
  expect(row[2].find('label').text()).toContain('(very optional)');
});

test('LxRow required 7', () => {
  expect(LxRow).toBeTruthy();

  wrapper = mount(LxForm, {
    props: {
      requiredMode: 'optional',
      texts: { required: '(super required)', optional: '(very optional)' },
    },
    slots: {
      default: [
        h(LxRow, { label: 'Name', required: null }),
        h(LxRow, { label: 'Surname', required: true }),
        h(LxRow, { label: 'Age', required: false }),
      ],
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
        LxRow,
        LxSection,
      },
    },
  });

  const row = wrapper.findAll('.lx-row');
  expect(row[0].find('label').text()).not.toContain('(very optional)');
  expect(row[1].find('label').text()).not.toContain('(very optional)');
  expect(row[2].find('label').text()).toContain('(very optional)');
  expect(row[3].find('label').text()).not.toContain('(super required)');
  expect(row[4].find('label').text()).not.toContain('(super required)');
  expect(row[5].find('label').text()).toContain('(super required)');
});

test('LxRow default slot', () => {
  expect(LxRow).toBeTruthy();

  wrapper = mount(LxForm, {
    slots: {
      default: h(LxRow, {}, { default: () => 'Default slot' }),
    },
    global: {
      components: {
        LxRow,
      },
    },
  });
  const row = wrapper.find('.lx-row');
  expect(row.text()).toBe('Default slot');
});

test('LxRow default slot 2', () => {
  expect(LxRow).toBeTruthy();

  wrapper = mount(LxForm, {
    slots: {
      default: h(LxRow, {}, { default: () => h(LxTextInput) }),
    },
    global: {
      components: {
        LxRow,
        LxTextInput,
      },
    },
  });
  const row = wrapper.find('.lx-row');
  expect(row.find('.lx-text-input').exists()).toBe(true);
});

test('LxRow default slot 3', () => {
  expect(LxRow).toBeTruthy();

  wrapper = mount(LxForm, {
    slots: {
      default: [
        h(LxRow, {}, { default: () => h(LxTextInput) }),
        h(LxRow, {}, { default: () => h(LxTextArea) }),
      ],
    },
    global: {
      components: {
        LxRow,
        LxTextInput,
        LxTextArea,
      },
    },
  });
  const rows = wrapper.findAll('.lx-row');
  expect(rows.length).toBe(2);
  expect(rows[0].find('.lx-text-input').exists()).toBe(true);
  expect(rows[1].find('.lx-text-area').exists()).toBe(true);
});

test('LxRow inputId', () => {
  expect(LxRow).toBeTruthy();

  wrapper = mount(LxForm, {
    slots: {
      default: h(
        LxRow,
        { label: 'Test Label', inputId: 'one' },
        { default: () => h(LxTextInput, { id: 'one' }) }
      ),
    },
    global: {
      components: {
        LxRow,
        LxTextInput,
      },
    },
  });

  const rowLabel = wrapper.find('.lx-row').find('label');
  expect(rowLabel.attributes('for')).toBe('one');
});

// ReferenceError: regeneratorRuntime is not defined
// test('LxRow info slot', () => {
//   expect(LxRow).toBeTruthy();

//   wrapper = mount(LxForm, {
//     slots: {
//       default: h(LxRow, { label: 'Name' }, { default: () => '22', info: () => 'aaa' }),
//     },
//     global: {
//       components: {
//         LxRow,
//       },
//     },
//   });
// });
