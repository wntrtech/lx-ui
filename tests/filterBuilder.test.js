import { test, expect } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import LxFilterBuilder from '@/components/FilterBuilder.vue';
import { objectClone } from '@/utils/formatUtils';

test('LxFilterBuilder with one row', () => {
  const schema = { type: 'object', properties: { name: { type: 'string' } } };
  const wrapper = mount(LxFilterBuilder, {
    props: {
      schema,
    },
    global: {
      components: {
        LxFilterBuilder,
      },
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });
  expect(wrapper.find('.lx-row').exists()).toBe(true);
});

const testSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
    isActive: { type: 'boolean' },
    birthDate: { type: 'string', format: 'date' },
    dateRange: {
      type: 'object',
      format: 'date',
      lx: {
        displayType: 'dateTimeRange',
      },
    },
  },
};

test('LxFilterBuilder schema with various inputs', () => {
  const modelValue = { dateRange: {} };
  const wrapper = mount(LxFilterBuilder, {
    props: {
      schema: testSchema,
      modelValue,
    },
    global: {
      components: {
        LxFilterBuilder,
      },
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });

  expect(wrapper.find('.lx-row').exists()).toBe(true);
  const rows = wrapper.findAll('.lx-row');
  expect(rows.length).toBe(5);
  // name
  expect(rows[0].find('.lx-text-input-wrapper').exists()).toBe(true);
  // age
  expect(rows[1].find('.lx-text-input-wrapper').exists()).toBe(true);
  expect(rows[1].find('input').exists()).toBe(true);
  expect(rows[1].find('input').attributes('inputmode')).toBe('decimal');
  // isActive
  expect(rows[2].find('.lx-toggle').exists()).toBe(true);
  // birthDate
  expect(
    rows[3].find('.lx-date-time-picker-wrapper').exists() && rows[3].find('.lx-date').exists()
  ).toBe(true);
  // dateRange
  expect(rows[4].find('.lx-date-time-range-wrapper').exists()).toBe(true);
});

test('LxFilterBuilder input values description', async () => {
  const modelValue = { dateRange: {} };
  const wrapper = mount(LxFilterBuilder, {
    props: {
      schema: testSchema,
      modelValue,
    },
    global: {
      components: {
        LxFilterBuilder,
      },
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });

  await wrapper.setProps({ modelValue: { ...modelValue, name: 'John Doe' } });
  const expanderDescription = wrapper.find('.lx-filter-wrapper').find('.lx-description');
  expect(expanderDescription.exists()).toBe(true);
  expect(expanderDescription.text()).toBe('John Doe');
});

test('LxFilterBuilder input values description 2', async () => {
  const modelValue = { dateRange: {} };
  const wrapper = mount(LxFilterBuilder, {
    props: {
      schema: testSchema,
      modelValue,
    },
    global: {
      components: {
        LxFilterBuilder,
      },
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });

  await wrapper.setProps({
    modelValue: {
      ...modelValue,
      name: 'John Doe',
      age: 30,
      isActive: true,
      birthDate: '1990-01-01',
    },
  });

  const expanderDescription = wrapper.find('.lx-filter-wrapper').find('.lx-description');
  expect(expanderDescription.exists()).toBe(true);
  expect(expanderDescription.text()).toBe('John Doe, 30, isActive: Jā, 01.01.1990.');
});

test('LxFilterBuilder input values description 3', async () => {
  const modelValue = { dateRange: {} };
  const schema = objectClone(testSchema);
  schema.properties.isActive.title = 'Is user active?';

  const wrapper = mount(LxFilterBuilder, {
    props: {
      schema,
      modelValue,
    },
    global: {
      components: {
        LxFilterBuilder,
      },
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });

  await wrapper.setProps({
    modelValue: {
      ...modelValue,
      name: 'John Doe',
      age: 30,
      isActive: true,
      birthDate: '1990-01-01',
    },
  });

  const expanderDescription = wrapper.find('.lx-filter-wrapper').find('.lx-description');
  expect(expanderDescription.exists()).toBe(true);
  expect(expanderDescription.text()).toBe('John Doe, 30, Is user active?: Jā, 01.01.1990.');
});

test('LxFilterBuilder input values description 4: override', () => {
  const modelValue = { dateRange: {} };
  const schema = objectClone(testSchema);
  schema.properties.isActive.title = 'Is user active?';

  const wrapper = mount(LxFilterBuilder, {
    props: {
      schema,
      modelValue,
      description: 'Description override',
    },
    global: {
      components: {
        LxFilterBuilder,
      },
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });

  const expanderDescription = wrapper.find('.lx-filter-wrapper').find('.lx-description');
  expect(expanderDescription.exists()).toBe(true);
  expect(expanderDescription.text()).toBe('Description override');
});

test('LxFilterBuilder input values description 5: expanded/collapsed description', async () => {
  const modelValue = { dateRange: {} };
  const schema = objectClone(testSchema);

  const wrapper = mount(LxFilterBuilder, {
    props: {
      schema,
      modelValue,
      expanded: undefined,
    },
    global: {
      components: {
        LxFilterBuilder,
      },
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });

  let expanderDescription = wrapper.find('.lx-filter-wrapper').find('.lx-description');
  expect(expanderDescription.exists()).toBe(false);

  await wrapper.setProps({ modelValue: { ...modelValue, name: 'John Doe' } });

  expanderDescription = wrapper.find('.lx-filter-wrapper').find('.lx-description');
  expect(expanderDescription.exists()).toBe(true);

  const filterClick = wrapper.find('.lx-expander').find('.lx-head');
  await filterClick.trigger('click');

  expanderDescription = wrapper.find('.lx-filter-wrapper').find('.lx-description');
  expect(expanderDescription.exists()).toBe(false);
});

test('LxFilterBuilder input values description 6: filterDescription', async () => {
  const modelValue = { dateRange: {} };
  const schema = objectClone(testSchema);
  schema.properties.name.lx = {
    filterDescription: 'User name: ',
  };
  schema.properties.isActive.lx = {
    filterDescription: 'Is user really active: ',
  };

  const wrapper = mount(LxFilterBuilder, {
    props: {
      schema,
      modelValue,
    },
    global: {
      components: {
        LxFilterBuilder,
      },
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });

  await wrapper.setProps({
    modelValue: {
      ...modelValue,
      name: 'John Doe',
      age: 30,
      isActive: true,
      birthDate: '1990-01-01',
    },
  });

  const expanderDescription = wrapper.find('.lx-filter-wrapper').find('.lx-description');
  expect(expanderDescription.exists()).toBe(true);
  expect(expanderDescription.text()).toBe(
    'User name: John Doe, 30, Is user really active: Jā, 01.01.1990.'
  );
});

test('LxFilterBuilder input values description 7: dateTimeRange', async () => {
  const modelValue = { dateRange: {} };
  const schema = objectClone(testSchema);

  const wrapper = mount(LxFilterBuilder, {
    props: {
      schema,
      modelValue,
    },
    global: {
      components: {
        LxFilterBuilder,
      },
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });

  await wrapper.setProps({
    modelValue: {
      ...modelValue,
      name: 'John Doe',
      age: 30,
      isActive: true,
      birthDate: '1990-01-01',
      dateRange: { startDate: '2023-01-01', endDate: '2023-12-31' },
    },
  });

  const expanderDescription = wrapper.find('.lx-filter-wrapper').find('.lx-description');
  expect(expanderDescription.exists()).toBe(true);
  expect(expanderDescription.text()).toBe(
    'John Doe, 30, isActive: Jā, 01.01.1990., 01.01.2023. - 31.12.2023.'
  );

  await wrapper.setProps({
    modelValue: {
      ...modelValue,
      name: 'John Doe',
      age: 30,
      isActive: true,
      birthDate: '1990-01-01',
      dateRange: { startDate: '2023-01-01', endDate: null },
    },
  });

  expect(expanderDescription.text()).toBe('John Doe, 30, isActive: Jā, 01.01.1990., 01.01.2023. -');

  await wrapper.setProps({
    modelValue: {
      ...modelValue,
      name: 'John Doe',
      age: 30,
      isActive: true,
      birthDate: '1990-01-01',
      dateRange: { startDate: null, endDate: '2023-12-31' },
    },
  });

  expect(expanderDescription.text()).toBe(
    'John Doe, 30, isActive: Jā, 01.01.1990.,  - 31.12.2023.'
  );

  await wrapper.setProps({
    modelValue: {
      ...modelValue,
      name: 'John Doe',
      age: 30,
      isActive: true,
      birthDate: '1990-01-01',
      dateRange: { startDate: null, endDate: null },
    },
  });

  expect(expanderDescription.text()).toBe('John Doe, 30, isActive: Jā, 01.01.1990.');
});

test('LxFilterBuilder input values description 8: valuePicker', async () => {
  const modelValue = { dateRange: {} };
  const schema = objectClone(testSchema);
  schema.properties.languages = {
    type: 'array',
    enum: ['en', 'fr', 'de', 'it', 'es'],
  };

  const wrapper = mount(LxFilterBuilder, {
    props: {
      schema,
      modelValue,
    },
    global: {
      components: {
        LxFilterBuilder,
      },
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });

  await wrapper.setProps({
    modelValue: {
      ...modelValue,
      languages: ['en', 'fr'],
    },
  });

  let expanderDescription = wrapper.find('.lx-filter-wrapper').find('.lx-description');
  expect(expanderDescription.exists()).toBe(true);
  expect(expanderDescription.text()).toBe('languages: 2');

  const modifiedSchema = objectClone(schema);
  modifiedSchema.properties.languages.title = 'Languages';

  await wrapper.setProps({
    schema: {
      ...modifiedSchema,
    },
  });

  expanderDescription = wrapper.find('.lx-filter-wrapper').find('.lx-description');
  expect(expanderDescription.text()).toBe('Languages: 2');
});

test('LxFilterBuilder input values description 9: valuePicker', async () => {
  const modelValue = { dateRange: {} };
  const schema = objectClone(testSchema);
  schema.properties.languages = {
    type: 'string',
    lx: {
      variant: 'default',
      items: [
        {
          id: 'en',
          name: 'English',
        },
        {
          id: 'fr',
          name: 'French',
        },
        {
          id: 'de',
          name: 'German',
        },
        {
          id: 'it',
          name: 'Italian',
        },
      ],
    },
  };

  const wrapper = mount(LxFilterBuilder, {
    props: {
      schema,
      modelValue,
    },
    global: {
      components: {
        LxFilterBuilder,
      },
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });

  await wrapper.setProps({
    modelValue: {
      ...modelValue,
      languages: 'fr',
    },
  });

  let expanderDescription = wrapper.find('.lx-filter-wrapper').find('.lx-description');
  expect(expanderDescription.exists()).toBe(true);
  expect(expanderDescription.text()).toBe('French');

  await wrapper.setProps({
    modelValue: {
      ...modelValue,
      languages: 'it',
    },
  });

  expanderDescription = wrapper.find('.lx-filter-wrapper').find('.lx-description');
  expect(expanderDescription.text()).toBe('Italian');
});

test('LxFilterBuilder usesFilters', async () => {
  const modelValue = { dateRange: {} };
  const schema = objectClone(testSchema);

  const wrapper = mount(LxFilterBuilder, {
    props: {
      schema,
      modelValue,
    },
    global: {
      components: {
        LxFilterBuilder,
      },
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });

  expect(wrapper.find('.lx-filter-wrapper').find('.lx-expander-highlighted').exists()).toBe(false);

  await wrapper.setProps({
    modelValue: {
      ...modelValue,
      name: 'John Doe',
    },
  });

  expect(wrapper.find('.lx-filter-wrapper').find('.lx-expander-highlighted').exists()).toBe(true);

  const filterClick = wrapper.find('.lx-expander').find('.lx-head');
  await filterClick.trigger('click');

  expect(wrapper.find('.lx-filter-wrapper').find('.lx-expander-highlighted').exists()).toBe(false);

  await wrapper.setProps({
    usesFilters: true,
  });

  expect(wrapper.find('.lx-filter-wrapper').find('.lx-expander-highlighted').exists()).toBe(true);
});

test('LxFilterBuilder useDefaults', async () => {
  const modelValue = { dateRange: {} };
  const schema = objectClone(testSchema);

  const wrapper = mount(LxFilterBuilder, {
    props: {
      schema,
      modelValue,
    },
    global: {
      components: {
        LxFilterBuilder,
      },
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });

  let expanderDescription = wrapper.find('.lx-filter-wrapper').find('.lx-description');
  expect(expanderDescription.exists()).toBe(false);

  await wrapper.setProps({
    modelValue: {
      ...modelValue,
      name: 'John Doe',
    },
  });

  expanderDescription = wrapper.find('.lx-filter-wrapper').find('.lx-description');
  expect(expanderDescription.text()).toBe('John Doe');

  await wrapper.setProps({
    useDefaults: false,
  });

  expanderDescription = wrapper.find('.lx-filter-wrapper').find('.lx-description');
  expect(expanderDescription.exists()).toBe(false);
});

test('LxFilterBuilder defaultValues', async () => {
  const modelValue = { dateRange: {} };
  const schema = objectClone(testSchema);

  const wrapper = mount(LxFilterBuilder, {
    props: {
      schema,
      modelValue,
    },
    global: {
      components: {
        LxFilterBuilder,
      },
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });

  let expanderDescription = wrapper.find('.lx-filter-wrapper').find('.lx-description');
  expect(expanderDescription.exists()).toBe(false);

  await wrapper.setProps({
    modelValue: {
      ...modelValue,
      name: 'John Doe',
    },
  });

  expanderDescription = wrapper.find('.lx-filter-wrapper').find('.lx-description');
  expect(expanderDescription.text()).toBe('John Doe');

  await wrapper.setProps({
    defaultValues: { name: 'John Doe' },
  });

  expanderDescription = wrapper.find('.lx-filter-wrapper').find('.lx-description');
  expect(expanderDescription.exists()).toBe(false);

  await wrapper.setProps({
    modelValue: {
      ...modelValue,
      name: 'John Doe',
      isActive: true,
    },
    defaultValues: { name: 'John Doe', isActive: false },
  });

  expanderDescription = wrapper.find('.lx-filter-wrapper').find('.lx-description');
  expect(expanderDescription.text()).toBe('isActive: Jā');
});
