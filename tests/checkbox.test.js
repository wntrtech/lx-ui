// @ts-nocheck
import { mount } from '@vue/test-utils';
import { describe, test, expect } from 'vitest';
import LxCheckbox from '@/components/Checkbox.vue';

describe('LxCheckbox', () => {
  test('should be a valid component', () => {
    expect(LxCheckbox).toBeTruthy();
  });

  describe('Props', () => {
    test('should have the correct default props', () => {
      const wrapper = mount(LxCheckbox);
      const props = wrapper.props();

      expect(props.id).toBe(null);
      expect(props.groupId).toBe(null);
      expect(props.modelValue).toBe(false);
      expect(props.label).toBe(null);
      expect(props.disabled).toBe(false);
      expect(props.value).toBe('none');
    });

    test('should accept provided prop values', () => {
      const wrapper = mount(LxCheckbox, {
        props: {
          id: 'custom-id',
          groupId: 'custom-group-id',
          modelValue: true,
          label: 'custom-label',
          disabled: true,
          value: 'custom-value',
        },
      });
      const props = wrapper.props();

      expect(props.id).toBe('custom-id');
      expect(props.id).toBeTypeOf('string');
      expect(props.groupId).toBe('custom-group-id');
      expect(props.groupId).toBeTypeOf('string');
      expect(props.modelValue).toBe(true);
      expect(props.modelValue).toBeTypeOf('boolean');
      expect(props.label).toBe('custom-label');
      expect(props.label).toBeTypeOf('string');
      expect(props.disabled).toBe(true);
      expect(props.disabled).toBeTypeOf('boolean');
      expect(props.value).toBe('custom-value');
      expect(props.value).toBeTypeOf('string');
    });
  });

  describe('Emits', () => {
    test('should emit event after modelValue changes', async () => {
      const wrapper = mount(LxCheckbox, {
        props: {
          modelValue: false,
        },
      });

      const inputElement = wrapper.find('.lx-checkbox');
      await inputElement.setChecked(true);
      expect(wrapper.emitted()['update:modelValue']).toBeTruthy();

      const emitted = wrapper.emitted()['update:modelValue'];
      const lastEmittedValue = emitted[emitted.length - 1];
      expect(lastEmittedValue).toEqual([true]);
    });
  });
});
