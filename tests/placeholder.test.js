import { test, expect } from 'vitest';
import LxForm from '@/components/forms/Form.vue';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import LxPlaceholder from '@/components/forms/Placeholder.vue';

test('LxPlaceholder id', () => {
  expect(LxPlaceholder).toBeTruthy();

  const wrapper = mount(LxForm, {
    slots: {
      default: h(LxPlaceholder, { id: 'placeholder' }),
    },
    global: {
      components: {
        LxPlaceholder,
      },
    },
  });
  // process.stdout.write(`${wrapper.html()}\n`);
  const placeholder = wrapper.find('.lx-placeholder');
  expect(placeholder.attributes('id')).toBe('placeholder');
});

test('LxPlaceholder columnSpan', () => {
  expect(LxPlaceholder).toBeTruthy();

  const wrapper = mount(LxForm, {
    slots: {
      default: h(LxPlaceholder, { columnSpan: 2 }),
    },
    global: {
      components: {
        LxPlaceholder,
      },
    },
  });

  const placeholder = wrapper.find('.lx-placeholder');
  expect(placeholder.classes()).toContain('lx-row-column-2');
});

test('LxPlaceholder columnSpan 2', () => {
  expect(LxPlaceholder).toBeTruthy();

  const wrapper = mount(LxForm, {
    slots: {
      default: [h(LxPlaceholder, { columnSpan: 2 }), h(LxPlaceholder, { columnSpan: '3' })],
    },
    global: {
      components: {
        LxPlaceholder,
      },
    },
  });

  const placeholder = wrapper.findAll('.lx-placeholder');
  expect(placeholder[0].classes()).toContain('lx-row-column-2');
  expect(placeholder[1].classes()).toContain('lx-row-column-3');
});

test('LxPlaceholder rowSpan', () => {
  expect(LxPlaceholder).toBeTruthy();

  const wrapper = mount(LxForm, {
    slots: {
      default: h(LxPlaceholder, { rowSpan: 4 }),
    },
    global: {
      components: {
        LxPlaceholder,
      },
    },
  });

  const placeholder = wrapper.find('.lx-placeholder');
  expect(placeholder.classes()).toContain('lx-row-row-4');
});

test('LxPlaceholder columnSpan, rowSpan', () => {
  expect(LxPlaceholder).toBeTruthy();

  const wrapper = mount(LxForm, {
    slots: {
      default: [
        h(LxPlaceholder, { columnSpan: 2, rowSpan: 3 }),
        h(LxPlaceholder, { columnSpan: '3', rowSpan: '4' }),
        h(LxPlaceholder, { columnSpan: 8, rowSpan: '4' }),
      ],
    },
    global: {
      components: {
        LxPlaceholder,
      },
    },
  });

  const placeholder = wrapper.findAll('.lx-placeholder');
  expect(placeholder[0].classes()).toContain('lx-row-column-2');
  expect(placeholder[0].classes()).toContain('lx-row-row-3');
  expect(placeholder[1].classes()).toContain('lx-row-column-3');
  expect(placeholder[1].classes()).toContain('lx-row-row-4');
  expect(placeholder[2].classes()).toContain('lx-row-column-8');
  expect(placeholder[2].classes()).toContain('lx-row-row-4');
});
