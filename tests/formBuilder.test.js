import { test, expect } from 'vitest';
import LxForm from '@/components/forms/Form.vue';
import LxFormBuilder from '@/components/forms/FormBuilder.vue';
import { mount } from '@vue/test-utils';
import { h } from 'vue';

test('LxFormBuilder with one row', () => {
  const schema = { type: 'object', properties: { name: { type: 'string' } } };
  const wrapper = mount(LxForm, {
    props: {
      showHeader: false,
    },
    slots: {
      default: h(LxFormBuilder, { schema }),
    },
    global: {
      components: {
        LxFormBuilder,
      },
    },
  });
  // process.stdout.write(`${wrapper.html()}\n`);
  expect(wrapper.find('.lx-row').exists()).toBe(true);
});

test('LxFormBuilder LxRow label', async () => {
  const schemaValue = {
    type: 'object',
    properties: { name: { type: 'string', label: 'name' } },
  };

  const wrapper = mount(LxForm, {
    props: {
      showHeader: false,
    },
    slots: {
      default: h(LxFormBuilder, { schema: schemaValue }),
    },
    global: {
      components: {
        LxFormBuilder,
      },
    },
  });
  const label = wrapper.find('.lx-row').find('label');
  expect(label.text()).toBe('name');
});

test('LxFormBuilder order', () => {
  const schemaValue = {
    type: 'object',
    properties: {
      one: { type: 'string', label: 'one', lx: { order: 2 } },
      two: { type: 'string', label: 'two', lx: { order: 1 } },
      three: { type: 'string', label: 'three' },
    },
  };

  const wrapper = mount(LxForm, {
    props: {
      showHeader: false,
    },
    slots: {
      default: h(LxFormBuilder, { schema: schemaValue }),
    },
    global: {
      components: {
        LxFormBuilder,
      },
    },
  });
  const label = wrapper.findAll('.lx-row');
  expect(label[0].find('label').text()).toBe('two');
  expect(label[1].find('label').text()).toBe('one');
  expect(label[2].find('label').text()).toBe('three');
});

test('LxFormBuilder order 2', () => {
  const schemaValue = {
    type: 'object',
    properties: {
      one: { type: 'string', label: 'one', lx: { order: 2 } },
      two: { type: 'string', label: 'two', lx: { order: 1 } },
      three: { type: 'string', label: 'three' },
      four: { type: 'string', label: 'four', lx: { order: 10 } },
    },
  };

  const wrapper = mount(LxForm, {
    props: {
      showHeader: false,
    },
    slots: {
      default: h(LxFormBuilder, { schema: schemaValue }),
    },
  });
  const label = wrapper.findAll('.lx-row');
  expect(label[0].find('label').text()).toBe('two');
  expect(label[1].find('label').text()).toBe('one');
  expect(label[2].find('label').text()).toBe('four');
  expect(label[3].find('label').text()).toBe('three');
});

// Input component tests
test('LxFormBuilder with LxTextInput', () => {
  const schemaValue = { type: 'object', properties: { name: { type: 'string' } } };
  const wrapper = mount(LxForm, {
    props: {
      showHeader: false,
    },
    slots: {
      default: h(LxFormBuilder, { schema: schemaValue }),
    },
  });
  expect(wrapper.find('.lx-text-input').exists()).toBe(true);
});

test('LxFormBuilder with LxTextArea', () => {
  const schemaValue = {
    type: 'object',
    properties: { name: { type: 'string', lx: { kind: 'multiline' } } },
  };
  const wrapper = mount(LxForm, {
    props: {
      showHeader: false,
    },
    slots: {
      default: h(LxFormBuilder, { schema: schemaValue }),
    },
  });
  expect(wrapper.find('.lx-text-area').exists()).toBe(true);
});

test('LxFormBuilder with LxDateTimePicker', () => {
  const schemaValue = {
    type: 'object',
    properties: { name: { type: 'string', format: 'date' } },
  };
  const wrapper = mount(LxForm, {
    props: {
      showHeader: false,
    },
    slots: {
      default: h(LxFormBuilder, { schema: schemaValue }),
    },
  });
  expect(wrapper.find('.lx-date-time-picker').exists()).toBe(true);
});

test('LxFormBuilder with LxDateTimePicker time', () => {
  const schemaValue = {
    type: 'object',
    properties: { name: { type: 'string', format: 'time' } },
  };
  const wrapper = mount(LxForm, {
    props: {
      showHeader: false,
    },
    slots: {
      default: h(LxFormBuilder, { schema: schemaValue }),
    },
  });
  expect(wrapper.find('.lx-time').exists()).toBe(true);
});

test('LxFormBuilder with LxDateTimePicker dateTime', () => {
  const schemaValue = {
    type: 'object',
    properties: { name: { type: 'string', format: 'date-time' } },
  };
  const wrapper = mount(LxForm, {
    props: {
      showHeader: false,
    },
    slots: {
      default: h(LxFormBuilder, { schema: schemaValue }),
    },
  });
  expect(wrapper.find('.lx-date-time').exists()).toBe(true);
});

test('LxFormBuilder with LxToggle', () => {
  const schemaValue = {
    type: 'object',
    properties: { name: { type: 'boolean' } },
  };
  const wrapper = mount(LxForm, {
    props: {
      showHeader: false,
    },
    slots: {
      default: h(LxFormBuilder, { schema: schemaValue }),
    },
  });
  expect(wrapper.find('.lx-toggle').exists()).toBe(true);
});

test('LxFormBuilder with LxValuePicker default', () => {
  const schemaValue = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        lx: {
          variant: 'default',
          items: [
            { id: 'one', name: 'one' },
            { id: 'two', name: 'two' },
          ],
        },
      },
    },
  };
  const wrapper = mount(LxForm, {
    props: {
      showHeader: false,
    },
    slots: {
      default: h(LxFormBuilder, { schema: schemaValue }),
    },
  });
  expect(wrapper.find('.lx-value-picker-default-wrapper').exists()).toBe(true);
});

test('LxFormBuilder with LxValuePicker tags', () => {
  const schemaValue = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        lx: {
          variant: 'tags',
          items: [
            { id: 'one', name: 'one' },
            { id: 'two', name: 'two' },
          ],
        },
      },
    },
  };
  const wrapper = mount(LxForm, {
    props: {
      showHeader: false,
    },
    slots: {
      default: h(LxFormBuilder, { schema: schemaValue }),
    },
  });
  expect(wrapper.find('.lx-value-picker-tags').exists()).toBe(true);
});

test('LxFormBuilder with LxValuePicker multiple', () => {
  const schemaValue = {
    type: 'object',
    properties: {
      name: {
        type: 'array',
        lx: {
          items: [
            { id: 'one', name: 'one' },
            { id: 'two', name: 'two' },
          ],
        },
      },
    },
  };
  const wrapper = mount(LxForm, {
    props: {
      showHeader: false,
    },
    slots: {
      default: h(LxFormBuilder, { schema: schemaValue }),
    },
  });

  const valuePicker = wrapper.find('.lx-value-picker-default-wrapper');
  expect(valuePicker.find('.lx-checkbox').exists()).toBe(true);
});

test('LxFormBuilder with LxValuePicker 4 items', () => {
  const schemaValue = {
    type: 'object',
    properties: {
      name: {
        type: 'array',
        lx: {
          items: [
            { id: 'one', name: 'one' },
            { id: 'two', name: 'two' },
            { id: 'three', name: 'three' },
            { id: 'four', name: 'four' },
          ],
        },
      },
    },
  };
  const wrapper = mount(LxForm, {
    props: {
      showHeader: false,
    },
    slots: {
      default: h(LxFormBuilder, { schema: schemaValue }),
    },
  });

  const checkboxes = wrapper.find('.lx-value-picker-default-wrapper').findAll('.lx-checkbox');
  expect(checkboxes.length).toBe(4);
});

test('LxFormBuilder with LxValuePicker 4 items using enum', () => {
  const schemaValue = {
    type: 'object',
    properties: {
      name: {
        type: 'array',
        enum: ['one', 'two', 'three', 'four'],
      },
    },
  };
  const wrapper = mount(LxForm, {
    props: {
      showHeader: false,
    },
    slots: {
      default: h(LxFormBuilder, { schema: schemaValue }),
    },
  });

  const checkboxes = wrapper.find('.lx-value-picker-default-wrapper').findAll('.lx-checkbox');
  expect(checkboxes.length).toBe(4);
});

test('LxFormBuilder with LxDataBlock', () => {
  const schemaValue = {
    type: 'object',
    properties: {
      one: {
        type: 'object',
        properties: { name: { type: 'string' } },
      },
    },
  };
  const modelValue = { one: { name: 'one' } };
  const wrapper = mount(LxForm, {
    props: {
      showHeader: false,
    },
    slots: {
      default: h(LxFormBuilder, { schema: schemaValue, modelValue }),
    },
  });
  expect(wrapper.find('.lx-data-block').exists()).toBe(true);
});

test('LxFormBuilder with LxPlaceholder', () => {
  const formB = mount(LxFormBuilder, {
    props: {
      schema: {
        type: 'object',
        properties: {
          one: {
            lx: {
              wrapper: 'placeholder',
            },
          },
        },
      },
    },
  });
  const wrapper = mount(LxForm, {
    props: {
      showHeader: false,
    },
    slots: {
      default: formB.html(),
    },
  });
  expect(wrapper.find('.lx-placeholder').exists()).toBe(true);
});

// test('LxFormBuilder cannot render LxRow', () => {
//   const schemaValue = {
//     type: 'object',
//     properties: {
//       one: {
//         type: 'object',
//       },
//     },
//   };
//   const wrapper = mount(LxForm, {
//     props: {
//       showHeader: false,
//     },
//     slots: {
//       default: h(LxFormBuilder, { schema: schemaValue }),
//     },
//   });
//   expect(wrapper.find('.lx-placeholder').exists()).toBe(true);
// });

// testi ar LxAppendablelist  un LxAppenableListSimple

test('LxFormBuilder with LxAppendableList', () => {
  const schemaValue = {
    type: 'object',
    properties: {
      name: {
        type: 'array',
        lx: {
          variant: 'default',
        },
        items: {
          properties: {
            name: {
              type: 'string',
              title: 'Vārds',
            },
            surname: {
              type: 'string',
              title: 'Uzvārds',
            },
          },
        },
      },
    },
  };

  const wrapper = mount(LxForm, {
    props: {
      showHeader: false,
    },
    slots: {
      default: h(LxFormBuilder, { schema: schemaValue }),
    },
    global: {
      stubs: ['router-link'],
    },
  });
  expect(wrapper.find('.lx-appendable-list').exists()).toBe(true);
});
test('LxFormBuilder with LxAppendableListSimple', () => {
  const schemaValue = {
    type: 'object',
    properties: {
      name: {
        type: 'array',
        lx: {
          variant: 'default',
        },
        items: { type: 'string' },
      },
    },
  };
  const wrapper = mount(LxForm, {
    props: {
      showHeader: false,
    },
    slots: {
      default: h(LxFormBuilder, { schema: schemaValue }),
    },
    global: {
      stubs: ['router-link'],
    },
  });
  expect(wrapper.find('.lx-appendable-list-simple').exists()).toBe(true);
});
