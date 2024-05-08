import { test, expect } from 'vitest';
import LxValuePicker from '@/components/ValuePicker.vue';
import LxValuePickerDefault from '@/components/valuePickers/Default.vue';
import { mount } from '@vue/test-utils';
import 'regenerator-runtime/runtime';

test('LxValuePicker default', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'default',
    },
  });
  // process.stdout.write(`${wrapper.html()}\n`);
  expect(wrapper.find('.lx-value-picker-default-wrapper').exists()).toBe(true);
});

test('LxValuePicker dropdown', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'dropdown',
      modelValue: 'one',
    },
  });

  expect(wrapper.find('.lx-dropdown-default').exists()).toBe(true);
});

test('LxValuePicker tiles', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'tiles',
    },
  });
  expect(wrapper.find('.lx-value-picker-tile-wrapper').exists()).toBe(true);
});

test('LxValuePicker tags', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'tags',
    },
  });
  expect(wrapper.find('.lx-value-picker-tags').exists()).toBe(true);
});

test('LxValuePicker default items count', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'default',
      items: [
        { id: 'one', name: 'One' },
        { id: 'two', name: 'Two' },
        { id: 'three', name: 'Three' },
      ],
    },
  });

  expect(wrapper.findAll('.lx-value-picker-default-item').length).toBe(3);
});

test('LxValuePicker default items labels', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'default',
      items: [
        { id: 'one', name: 'One' },
        { id: 'two', name: 'Two' },
        { id: 'three', name: 'Three' },
      ],
    },
  });
  const items = wrapper.findAll('.lx-value-picker-default-item');
  expect(items.length).toBe(3);
  expect(items[0].find('.lx-value-picker-default-item-label').text()).toBe('One');
  expect(items[1].find('.lx-value-picker-default-item-label').text()).toBe('Two');
  expect(items[2].find('.lx-value-picker-default-item-label').text()).toBe('Three');
});

test('LxValuePicker dropdown items labels', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'default',
      items: [
        { id: 'one', name: 'One' },
        { id: 'two', name: 'Two' },
        { id: 'three', name: 'Three' },
      ],
    },
  });
  const items = wrapper.findAll('.lx-value-picker-default-item');
  expect(items[0].find('.lx-value-picker-default-item-label').text()).toBe('One');
  expect(items[1].find('.lx-value-picker-default-item-label').text()).toBe('Two');
  expect(items[2].find('.lx-value-picker-default-item-label').text()).toBe('Three');
});

test('LxValuePicker tags items labels', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'tags',
      items: [
        { id: 'one', name: 'One' },
        { id: 'two', name: 'Two' },
        { id: 'three', name: 'Three' },
      ],
    },
  });
  const items = wrapper.find('.lx-value-picker-tags').findAll('.lx-tag');
  expect(items.length).toBe(3);
  expect(items[0].text()).toBe('One');
  expect(items[1].text()).toBe('Two');
  expect(items[2].text()).toBe('Three');
});

test('LxValuePicker tiles items labels, descriptions', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'tiles',
      items: [
        { id: 'one', name: 'One', description: 'One description' },
        { id: 'two', name: 'Two', description: 'Two description' },
        { id: 'three', name: 'Three', description: 'Three description' },
      ],
    },
  });

  const items = wrapper.find('.lx-value-picker-tile-wrapper').findAll('.lx-value-picker-tile');
  expect(items.length).toBe(3);
  expect(items[0].find('.lx-value-picker-tile-name').text()).toBe('One');
  expect(items[0].find('.lx-value-picker-description').text()).toBe('One description');
  expect(items[1].find('.lx-value-picker-tile-name').text()).toBe('Two');
  expect(items[1].find('.lx-value-picker-description').text()).toBe('Two description');
  expect(items[2].find('.lx-value-picker-tile-name').text()).toBe('Three');
  expect(items[2].find('.lx-value-picker-description').text()).toBe('Three description');
});

test('LxValuePicker idAttribute, nameAttribute, descriptionAttribute', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'tiles',
      idAttribute: 'ID',
      nameAttribute: 'NAME',
      descriptionAttribute: 'DESC',
      items: [
        {
          id: 'one',
          ID: 'oneID',
          name: 'One',
          NAME: 'OneNAME',
          description: 'One description',
          DESC: 'OneDESC',
        },
        {
          id: 'two',
          ID: 'twoID',
          name: 'Two',
          NAME: 'TwoNAME',
          description: 'Two description',
          DESC: 'TwoDESC',
        },
        {
          id: 'three',
          ID: 'threeID',
          name: 'Three',
          NAME: 'ThreeNAME',
          description: 'Three description',
          DESC: 'ThreeDESC',
        },
      ],
    },
  });

  const items = wrapper.find('.lx-value-picker-tile-wrapper').findAll('.lx-value-picker-tile');
  expect(items.length).toBe(3);
  expect(items[0].find('.lx-value-picker-tile-name').text()).toBe('OneNAME');
  expect(items[0].find('.lx-value-picker-description').text()).toBe('OneDESC');
  expect(items[1].find('.lx-value-picker-tile-name').text()).toBe('TwoNAME');
  expect(items[1].find('.lx-value-picker-description').text()).toBe('TwoDESC');
  expect(items[2].find('.lx-value-picker-tile-name').text()).toBe('ThreeNAME');
  expect(items[2].find('.lx-value-picker-description').text()).toBe('ThreeDESC');
});

test('LxValuePicker kind "single"', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      kind: 'single',
      items: [
        { id: 'one', name: 'One' },
        { id: 'two', name: 'Two' },
      ],
    },
  });

  const items = wrapper
    .find('.lx-value-picker-default-wrapper')
    .findAll('.lx-value-picker-default-item');
  expect(items[0].find('.lx-radio-button').exists()).toBe(true);
  expect(items[1].find('.lx-radio-button').exists()).toBe(true);
});

test('LxValuePicker kind "multiple"', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      kind: 'multiple',
      items: [
        { id: 'one', name: 'One' },
        { id: 'two', name: 'Two' },
      ],
    },
  });

  const items = wrapper
    .find('.lx-value-picker-default-wrapper')
    .findAll('.lx-value-picker-default-item');
  expect(items[0].find('.lx-checkbox').exists()).toBe(true);
  expect(items[1].find('.lx-checkbox').exists()).toBe(true);
});

test('LxValuePicker "default" nullable', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      items: [
        { id: 'one', name: 'One' },
        { id: 'two', name: 'Two' },
      ],
      nullable: true,
    },
  });
  expect(wrapper.find('.lx-value-picker-default-wrapper').findAll('.lx-radio-button').length).toBe(
    3
  );
});

/* hasSearch */

test('LxValuePicker default hasSearch', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'default',
      hasSearch: true,
    },
  });

  expect(
    wrapper.find('.lx-value-picker-default-wrapper').find('.lx-value-picker-search').exists()
  ).toBe(true);
});

test('LxValuePicker dropdown hasSearch', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'dropdown',

      hasSearch: true,
    },
    global: {
      stubs: ['router-link'],
    },
  });

  expect(wrapper.find('.lx-text-input').exists()).toBe(true);
});

test('LxValuePicker tags hasSearch', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'tags',
      hasSearch: true,
    },
  });

  expect(wrapper.find('.lx-value-picker-search').exists()).toBe(true);
});

test('LxValuePicker tiles hasSearch', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'tiles',
      hasSearch: true,
    },
  });

  expect(wrapper.find('.lx-value-picker-search').exists()).toBe(true);
});

/* Tooltip */
test('LxValuePicker default tooltip', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'default',
      tooltip: 'Tooltip text',
      items: [{ id: 'one', name: 'One' }],
    },
    global: {
      components: {
        LxValuePickerDefault,
      },
    },
  });
  expect(wrapper.find('.lx-value-picker-default-wrapper').attributes('title')).toBe('Tooltip text');
});

test('LxValuePicker dropdown tooltip', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'dropdown',
      tooltip: 'Tooltip text',
      items: [{ id: 'one', name: 'One' }],
      modelValue: 'one',
    },
    global: {
      components: {
        LxValuePickerDefault,
      },
    },
  });

  expect(wrapper.find('.lx-dropdown-default-panel').attributes('title')).toBe('Tooltip text');
});

test('LxValuePicker tags tooltip', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'tags',
      tooltip: 'Tooltip text',
      items: [{ id: 'one', name: 'One' }],
    },
    global: {
      components: {
        LxValuePickerDefault,
      },
    },
  });

  expect(wrapper.find('.lx-value-picker-tags').attributes('title')).toBe('Tooltip text');
});

test('LxValuePicker tiles tooltip', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'tiles',
      tooltip: 'Tooltip text',
      items: [{ id: 'one', name: 'One' }],
    },
    global: {
      components: {
        LxValuePickerDefault,
      },
    },
  });

  expect(wrapper.find('.lx-value-picker-tile-wrapper').attributes('title')).toBe('Tooltip text');
});

/* readOnly */
test('LxValuePicker default readOnly', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'default',
      readOnly: true,
      items: [{ id: 'one', name: 'One' }],
      modelValue: 'one',
    },
  });

  expect(wrapper.find('.lx-data').text()).toBe('One');
});

test('LxValuePicker dropdown readOnly', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'dropdown',
      readOnly: true,
      items: [{ id: 'one', name: 'One' }],
      modelValue: 'one',
    },
  });

  expect(wrapper.find('.lx-data').text()).toBe('One');
});

test('LxValuePicker tags readOnly', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'tags',
      readOnly: true,
      items: [{ id: 'one', name: 'One' }],
      modelValue: 'one',
    },
  });

  expect(wrapper.find('.lx-data').text()).toBe('One');
});

test('LxValuePicker tiles readOnly', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'tiles',
      readOnly: true,
      items: [{ id: 'one', name: 'One' }],
      modelValue: 'one',
    },
  });

  expect(wrapper.find('.lx-data').text()).toBe('One');
});

/* disabled */

test('LxValuePicker default disabled', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'default',
      disabled: true,
      items: [{ id: 'one', name: 'One' }],
    },
  });

  expect(wrapper.find('.lx-value-picker-default-item').classes()).toContain(
    'lx-value-picker-item-disabled'
  );
});

test('LxValuePicker dropdown disabled', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'dropdown',
      disabled: true,
      items: [{ id: 'one', name: 'One' }],
      modelValue: 'one',
    },
  });

  expect(wrapper.find('.lx-dropdown-default').attributes('disabled')).toBe('true');
});

test('LxValuePicker tags disabled', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'tags',
      disabled: true,
      items: [{ id: 'one', name: 'One' }],
    },
  });

  expect(wrapper.find('.lx-value-picker-tags').find('.lx-tag').attributes('disabled')).toBe('true');
});

test('LxValuePicker tiles disabled', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'tiles',
      disabled: true,
      items: [{ id: 'one', name: 'One' }],
    },
  });

  expect(
    wrapper
      .find('.lx-value-picker-tile-wrapper')
      .find('.lx-value-picker-tile')
      .attributes('disabled')
  ).toBe('true');
});

/* invalid and invalidationMessage */

test('LxValuePicker default invalid', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      invalid: true,
      invalidationMessage: 'Invalid input',
      items: [{ id: 'one', name: 'One' }],
    },
  });

  expect(
    wrapper.find('.lx-value-picker-default-wrapper').find('.lx-invalidation-message').text()
  ).toBe('Invalid input');
});

test('LxValuePicker dropdown invalid', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'dropdown',
      invalid: true,
      invalidationMessage: 'Invalid input',
      items: [{ id: 'one', name: 'One' }],
      modelValue: 'one',
    },
  });

  expect(wrapper.find('.lx-dropdown-default-panel').classes()).toContain('lx-invalid');
  expect(wrapper.find('.lx-invalidation-message').text()).toBe('Invalid input');
});

test('LxValuePicker tags invalid', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'tags',
      invalid: true,
      invalidationMessage: 'Invalid input',
      items: [{ id: 'one', name: 'One' }],
    },
  });

  expect(wrapper.find('.lx-invalidation-message').text()).toBe('Invalid input');
});

test('LxValuePicker tiles invalid', () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'tiles',
      invalid: true,
      invalidationMessage: 'Invalid input',
      items: [{ id: 'one', name: 'One' }],
    },
  });

  expect(wrapper.find('.lx-invalidation-message').text()).toBe('Invalid input');
});
// modelValue

test('LxValuePicker default modelValue', async () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'default',
      items: [
        { id: 'one', name: 'One' },
        { id: 'two', name: 'Two' },
      ],
      modelValue: 'one',
    },
  });

  const items = wrapper.findAll('.lx-value-picker-default-item');
  expect(items[0].find('.lx-radio-button').attributes('aria-checked')).toBe('true');
  expect(items[1].find('.lx-radio-button').attributes('aria-checked')).toBe('false');
  await items[1].trigger('click');
  expect(items[0].find('.lx-radio-button').attributes('aria-checked')).toBe('false');
  expect(items[1].find('.lx-radio-button').attributes('aria-checked')).toBe('true');
});

test('LxValuePicker default modelValue 2', async () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'default',
      items: [
        { id: 'one', name: 'One' },
        { id: 'two', name: 'Two' },
      ],
      modelValue: ['one'],
      alwaysAsArray: true,
      kind: 'multiple',
    },
  });

  const items = wrapper.findAll('.lx-checkbox-wrapper');
  expect(items[0].find('.lx-checkbox').attributes('aria-checked')).toBe('true');
  expect(items[1].find('.lx-checkbox').attributes('aria-checked')).toBe('false');
  await items[1].trigger('click');
  expect(items[0].find('.lx-checkbox').attributes('aria-checked')).toBe('true');
  expect(items[1].find('.lx-checkbox').attributes('aria-checked')).toBe('true');
  expect(wrapper.props('modelValue')).toStrictEqual(['one', 'two']);
});

test('LxValuePicker default modelValue 3', async () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'default',
      items: [
        { id: 'one', name: 'One' },
        { id: 'two', name: 'Two' },
      ],
      modelValue: ['one'],
      kind: 'multiple',
    },
  });

  const items = wrapper.findAll('.lx-checkbox-wrapper');
  expect(items[0].find('.lx-checkbox').attributes('aria-checked')).toBe('true');
  expect(items[1].find('.lx-checkbox').attributes('aria-checked')).toBe('false');
  await items[0].trigger('click');
  await items[1].trigger('click');
  expect(items[0].find('.lx-checkbox').attributes('aria-checked')).toBe('false');
  expect(items[1].find('.lx-checkbox').attributes('aria-checked')).toBe('true');
  expect(wrapper.props('modelValue')).toStrictEqual(['two']);
});

test('LxValuePicker dropdown modelValue', async () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'dropdown',
      items: [
        { id: 'one', name: 'One' },
        { id: 'two', name: 'Two' },
      ],
      modelValue: 'one',
      'onUpdate:modelValue': (e) => wrapper.setProps({ modelValue: e }),
      kind: 'single',
    },
  });
  expect(wrapper.find('.lx-dropdown-default-data').text()).toBe('One');
  await wrapper.trigger('click');
  const items = wrapper.findAll('.lx-value-picker-item');
  await items[1].trigger('click');
  expect(wrapper.find('.lx-dropdown-default-data').text()).toBe('Two');
});

test('LxValuePicker dropdown modelValue 2', async () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'dropdown',
      items: [
        { id: 'one', name: 'One' },
        { id: 'two', name: 'Two' },
      ],
      modelValue: ['one'],
      'onUpdate:modelValue': (e) => wrapper.setProps({ modelValue: e }),
      kind: 'multiple',
    },
    global: {
      stubs: ['router-link'],
    },
  });
  expect(wrapper.find('.lx-dropdown-default-data').text()).toBe('One');
  await wrapper.trigger('click');
  const items = wrapper.findAll('.lx-value-picker-item');
  await items[1].trigger('click');
  expect(wrapper.find('.lx-dropdown-default-data').text()).toBe('One, Two');
  await wrapper.trigger('click');
  await items[0].trigger('click');
  expect(wrapper.find('.lx-dropdown-default-data').text()).toBe('Two');
});

test('LxValuePicker tags modelValue', async () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'tags',
      items: [
        { id: 'one', name: 'One' },
        { id: 'two', name: 'Two' },
      ],
      modelValue: 'one',
      'onUpdate:modelValue': (e) => wrapper.setProps({ modelValue: e }),
      kind: 'single',
    },
  });
  const items = wrapper.findAll('.lx-tag');
  expect(items[0].classes()).toContain('lx-tags-tile-selected');
  expect(items[1].classes()).not.toContain('lx-tags-tile-selected');
  await items[1].trigger('click');
  expect(items[0].classes()).not.toContain('lx-tags-tile-selected');
  expect(items[1].classes()).toContain('lx-tags-tile-selected');
});

test('LxValuePicker tags modelValue 2', async () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'tags',
      items: [
        { id: 'one', name: 'One' },
        { id: 'two', name: 'Two' },
      ],
      modelValue: ['one'],
      'onUpdate:modelValue': (e) => wrapper.setProps({ modelValue: e }),
      kind: 'multiple',
    },
  });

  const items = wrapper.findAll('.lx-tag');
  expect(items[0].classes()).toContain('lx-tags-tile-selected');
  expect(items[1].classes()).not.toContain('lx-tags-tile-selected');
  await items[0].trigger('click');
  await items[1].trigger('click');
  expect(items[0].classes()).not.toContain('lx-tags-tile-selected');
  expect(items[1].classes()).toContain('lx-tags-tile-selected');
});

test('LxValuePicker tiles modelValue', async () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'tiles',
      items: [
        { id: 'one', name: 'One' },
        { id: 'two', name: 'Two' },
      ],
      modelValue: 'one',
      'onUpdate:modelValue': (e) => wrapper.setProps({ modelValue: e }),
    },
  });

  const items = wrapper.findAll('.lx-value-picker-tile');
  expect(items[0].classes()).toContain('lx-value-picker-tile-selected');
  expect(items[1].classes()).not.toContain('lx-value-picker-tile-selected');
  await items[1].trigger('click');
  expect(items[0].classes()).not.toContain('lx-value-picker-tile-selected');
  expect(items[1].classes()).toContain('lx-value-picker-tile-selected');
});

test('LxValuePicker tiles modelValue 2', async () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'tiles',
      items: [
        { id: 'one', name: 'One' },
        { id: 'two', name: 'Two' },
      ],
      kind: 'multiple',
      modelValue: ['one'],
      'onUpdate:modelValue': (e) => wrapper.setProps({ modelValue: e }),
    },
  });

  const items = wrapper.findAll('.lx-value-picker-tile');
  expect(items[0].classes()).toContain('lx-value-picker-tile-selected');
  expect(items[1].classes()).not.toContain('lx-value-picker-tile-selected');
  await items[0].trigger('click');
  await items[1].trigger('click');
  expect(items[0].classes()).not.toContain('lx-value-picker-tile-selected');
  expect(items[1].classes()).toContain('lx-value-picker-tile-selected');
});

// search

test('LxValuePicker default search', async () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'default',
      items: [
        { id: 'one', name: 'One' },
        { id: 'two', name: 'Two' },
        { id: 'three', name: 'Three' },
      ],
      hasSearch: true,
    },
    global: {
      stubs: ['router-link'],
    },
  });

  const search = wrapper.get('.lx-value-picker-search input');
  const items = wrapper.findAll('.lx-value-picker-default-item');
  expect(items[0].classes()).not.toContain('lx-value-hidden');
  expect(items[1].classes()).not.toContain('lx-value-hidden');
  expect(items[2].classes()).not.toContain('lx-value-hidden');
  await search.setValue('one');
  expect(items[0].classes()).not.toContain('lx-value-hidden');
  expect(items[1].classes()).toContain('lx-value-hidden');
  expect(items[2].classes()).toContain('lx-value-hidden');
});

test('LxValuePicker default search 2', async () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'default',
      items: [
        { id: 'one', name: 'One' },
        { id: 'two', name: 'Two' },
        { id: 'three', name: 'Three' },
      ],
      hasSearch: true,
    },
    global: {
      stubs: ['router-link'],
    },
  });

  const search = wrapper.get('.lx-value-picker-search input');
  const items = wrapper.findAll('.lx-value-picker-default-item');
  expect(items[0].classes()).not.toContain('lx-value-hidden');
  expect(items[1].classes()).not.toContain('lx-value-hidden');
  expect(items[2].classes()).not.toContain('lx-value-hidden');
  await search.setValue('o');
  expect(items[0].classes()).not.toContain('lx-value-hidden');
  expect(items[1].classes()).not.toContain('lx-value-hidden');
  expect(items[2].classes()).toContain('lx-value-hidden');
});

test('LxValuePicker dropdown search', async () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'dropdown',
      items: [
        { id: 'one', name: 'One' },
        { id: 'two', name: 'Two' },
        { id: 'three', name: 'Three' },
      ],
      hasSearch: true,
    },
    global: {
      stubs: ['router-link'],
    },
  });

  const search = wrapper.find('.lx-text-input');
  await search.setValue('o');
  const items = wrapper.findAll('.lx-value-picker-item');
  expect(items.length).toBe(2);
  expect(items[0].text()).toBe('One');
  expect(items[1].text()).toBe('Two');
});

test('LxValuePicker tags search', async () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'tags',
      items: [
        { id: 'one', name: 'One' },
        { id: 'two', name: 'Two' },
        { id: 'three', name: 'Three' },
      ],
      hasSearch: true,
    },
    global: {
      stubs: ['router-link'],
    },
  });

  const search = wrapper.get('.lx-value-picker-search input');
  const items = wrapper.findAll('.lx-tag');
  expect(items[0].classes()).not.toContain('lx-value-hidden');
  expect(items[1].classes()).not.toContain('lx-value-hidden');
  expect(items[2].classes()).not.toContain('lx-value-hidden');
  await search.setValue('o');
  expect(items[0].classes()).not.toContain('lx-value-hidden');
  expect(items[1].classes()).not.toContain('lx-value-hidden');
  expect(items[2].classes()).toContain('lx-value-hidden');
});

test('LxValuePicker tiles search', async () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'tiles',
      items: [
        { id: 'one', name: 'One' },
        { id: 'two', name: 'Two' },
        { id: 'three', name: 'Three' },
      ],
      hasSearch: true,
    },
    global: {
      stubs: ['router-link'],
    },
  });

  const search = wrapper.get('.lx-value-picker-search input');
  let items = wrapper.findAll('.lx-value-picker-tile');
  expect(items.length).toBe(3);
  await search.setValue('o');
  items = wrapper.findAll('.lx-value-picker-tile');
  expect(items.length).toBe(2);
});

// searchAttributes

test('LxValuePicker default searchAttributes', async () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'default',
      items: [
        { id: 'one', name: 'One', description: 'OneDescription', value: 'OneValue' },
        { id: 'two', name: 'Two', description: 'TwoDescription', value: 'TwoValue' },
        { id: 'three', name: 'Three', description: 'ThreeDescription', value: 'ThreeValue' },
      ],
      hasSearch: true,
      searchAttributes: ['description', 'value'],
    },
    global: {
      stubs: ['router-link'],
    },
  });

  const search = wrapper.get('.lx-value-picker-search input');
  const items = wrapper.findAll('.lx-value-picker-default-item');
  expect(items[0].classes()).not.toContain('lx-value-hidden');
  expect(items[1].classes()).not.toContain('lx-value-hidden');
  expect(items[2].classes()).not.toContain('lx-value-hidden');
  await search.setValue('ThreeDescription');
  expect(items[0].classes()).toContain('lx-value-hidden');
  expect(items[1].classes()).toContain('lx-value-hidden');
  expect(items[2].classes()).not.toContain('lx-value-hidden');
  await search.setValue('TwoValue');
  expect(items[0].classes()).toContain('lx-value-hidden');
  expect(items[1].classes()).not.toContain('lx-value-hidden');
  expect(items[2].classes()).toContain('lx-value-hidden');
});

test('LxValuePicker tags searchAttributes', async () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'tags',
      items: [
        { id: 'one', name: 'One', description: 'OneDescription', value: 'OneValue' },
        { id: 'two', name: 'Two', description: 'TwoDescription', value: 'TwoValue' },
        { id: 'three', name: 'Three', description: 'ThreeDescription', value: 'ThreeValue' },
      ],
      hasSearch: true,
      searchAttributes: ['description', 'value'],
    },
    global: {
      stubs: ['router-link'],
    },
  });
  const search = wrapper.get('.lx-value-picker-search input');
  const items = wrapper.findAll('.lx-tag');
  expect(items[0].classes()).not.toContain('lx-value-hidden');
  expect(items[1].classes()).not.toContain('lx-value-hidden');
  expect(items[2].classes()).not.toContain('lx-value-hidden');
  await search.setValue('ThreeDescription');
  expect(items[0].classes()).toContain('lx-value-hidden');
  expect(items[1].classes()).toContain('lx-value-hidden');
  expect(items[2].classes()).not.toContain('lx-value-hidden');
  await search.setValue('TwoValue');
  expect(items[0].classes()).toContain('lx-value-hidden');
  expect(items[1].classes()).not.toContain('lx-value-hidden');
  expect(items[2].classes()).toContain('lx-value-hidden');
});

test('LxValuePicker tiles searchAttributes', async () => {
  expect(LxValuePicker).toBeTruthy();

  const wrapper = mount(LxValuePicker, {
    props: {
      variant: 'tiles',
      items: [
        { id: 'one', name: 'One', description: 'OneDescription', value: 'OneValue' },
        { id: 'two', name: 'Two', description: 'TwoDescription', value: 'TwoValue' },
        { id: 'three', name: 'Three', description: 'ThreeDescription', value: 'ThreeValue' },
      ],
      hasSearch: true,
      searchAttributes: ['description', 'value'],
    },
    global: {
      stubs: ['router-link'],
    },
  });

  const search = wrapper.get('.lx-value-picker-search input');
  let items = wrapper.findAll('.lx-value-picker-tile');
  expect(items.length).toBe(3);
  await search.setValue('ThreeDescription');
  items = wrapper.findAll('.lx-value-picker-tile');
  expect(items.length).toBe(1);
  expect(items[0].find('.lx-value-picker-tile-name').text()).toBe('Three');
  await search.setValue('TwoValue');
  items = wrapper.findAll('.lx-value-picker-tile');
  expect(items.length).toBe(1);
  expect(items[0].find('.lx-value-picker-tile-name').text()).toBe('Two');
});
