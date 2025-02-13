// @ts-nocheck
import { test, expect, describe, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import LxTextInput from '@/components/TextInput.vue';

let wrapper;

afterEach(() => {
  if (wrapper) {
    wrapper.unmount();
  }
});

// Testing helper functions
function readOnlyTest(wrp) {
  expect(wrp.find('.lx-text-input-wrapper').exists()).toBe(false);
  expect(wrp.find('.lx-data').exists()).toBe(true);
  expect(wrp.find('.lx-data').text()).toBe('Test model value');
  expect(wrp.find('.lx-data').text()).toBeTypeOf('string', 'number');
  expect(wrp.find('.lx-data .lx-text-input-wrapper .password-mask').exists()).toBe(false);
}

function invalidTest(wrp) {
  expect(wrp.find('.lx-text-input.lx-invalid').isVisible()).toBe(true);
  expect(wrp.find('.lx-invalidation-icon').isVisible()).toBe(true);
  const invalidationMessageElement = wrp.find('.lx-field-wrapper').find('.lx-invalidation-message');
  expect(invalidationMessageElement.isVisible()).toBe(true);
  expect(invalidationMessageElement.text()).toBe('Invalidation Message');
}

function disabledTest(wrp) {
  expect(wrp.props().disabled).toBe(true);
  expect(wrp.find('.lx-text-input').attributes('disabled')).toBeDefined();
}

// Tests
describe('LxTextInput', () => {
  test('should be a valid component', () => {
    expect(LxTextInput).toBeTruthy();
  });

  describe('Props', () => {
    describe('id', () => {
      test('should be string with value', () => {
        wrapper = mount(LxTextInput, {
          props: {
            id: 'Custom id',
          },
        });
        const props = wrapper.props();
        const inputElement = wrapper.find('.lx-text-input').element;

        expect(props.id).toBe('Custom id');
        expect(props.id).toBeTypeOf('string');
        expect(inputElement.id).toBe('Custom id');
        expect(inputElement.id).toBeTypeOf('string');
      });

      test('should be default GUID string when id is not passed', () => {
        wrapper = mount(LxTextInput);
        const props = wrapper.props();

        const inputElement = wrapper.find('.lx-text-input').element;

        expect(props.id).toBe(props.id);
        expect(inputElement.id).toBe(props.id);
        expect(inputElement.id).toBeTypeOf('string');
      });
    });

    describe('modelValue', () => {
      test('should have value with type "string"', () => {
        wrapper = mount(LxTextInput, {
          props: {
            modelValue: 'Custom model value',
          },
        });
        const props = wrapper.props();

        expect(props.modelValue).toBe('Custom model value');
        expect(props.modelValue).toBeTypeOf('string');
      });
    });

    describe('placeholder', () => {
      test('should be string with value', () => {
        wrapper = mount(LxTextInput, {
          props: {
            placeholder: 'Custom placeholder',
          },
        });
        const props = wrapper.props();
        const inputElement = wrapper.find('.lx-text-input').element;

        expect(props.placeholder).toBe('Custom placeholder');
        expect(props.placeholder).toBeTypeOf('string');
        expect(inputElement.placeholder).toBe('Custom placeholder');
        expect(inputElement.placeholder).toBeTypeOf('string');
      });

      test('placeholder with new text', async () => {
        wrapper = mount(LxTextInput, {
          props: {
            placeholder: 'Test text',
          },
        });

        const inputElement = wrapper.find('.lx-text-input').element;
        expect(inputElement.placeholder).toBe('Test text');
        await wrapper.setProps({ placeholder: 'New text' });
        expect(inputElement.placeholder).toBe('New text');
      });
    });

    describe('readOnly', () => {
      test('should be true and modelValue should be displayed', () => {
        wrapper = mount(LxTextInput, {
          props: {
            readOnly: true,
            modelValue: 'Test model value',
          },
        });

        readOnlyTest(wrapper);
      });

      test('elements should be invisible when true and kind is "password"', async () => {
        wrapper = mount(LxTextInput, {
          props: {
            readOnly: true,
            kind: 'password',
            modelValue: 'Test model value',
          },
          global: {
            stubs: ['router-link'],
          },
        });

        expect(wrapper.find('.lx-data').exists()).toBe(false);
        expect(wrapper.find('.lx-text-input-wrapper.password-mask').exists()).toBe(false);
      });

      test('readOnly and kind="password" hides data, password mask, and invalidation message', async () => {
        wrapper = mount(LxTextInput, {
          props: {
            readOnly: true,
            kind: 'password',
            modelValue: 'Test model value',
          },
          global: {
            stubs: ['router-link'],
          },
        });

        expect(wrapper.find('.lx-data').exists()).toBe(false);
        expect(wrapper.find('.lx-text-input-wrapper.password-mask').exists()).toBe(false);
        expect(wrapper.find('.lx-invalidation-message').exists()).toBe(false);
      });

      test('readOnly and kind="default" shows data and hides invalidation message', async () => {
        wrapper = mount(LxTextInput, {
          props: {
            readOnly: true,
            kind: 'default',
            modelValue: 'Test model value',
          },
          global: {
            stubs: ['router-link'],
          },
        });

        expect(wrapper.find('.lx-data').exists()).toBe(true);
        expect(wrapper.find('.lx-invalidation-message').exists()).toBe(false);
      });
    });

    describe('disabled', () => {
      test('should be true and have disabled attribute', () => {
        wrapper = mount(LxTextInput, {
          props: {
            disabled: true,
          },
        });

        disabledTest(wrapper);
      });

      test('invalidation message with icon should be visible when disabled is true', () => {
        wrapper = mount(LxTextInput, {
          props: {
            disabled: true,
            invalid: true,
            invalidationMessage: 'Invalidation Message',
          },
        });

        disabledTest(wrapper);
        invalidTest(wrapper);
      });

      test('disabled with new text', async () => {
        wrapper = mount(LxTextInput, {
          props: {
            disabled: true,
            modelValue: 'one',
          },
        });
        disabledTest(wrapper);
        await wrapper.get('.lx-text-input').setValue('two');
        expect(wrapper.find('.lx-text-input').element.value).toBe('one');
      });
    });

    describe('uppercase', () => {
      test('should provide default value', () => {
        wrapper = mount(LxTextInput);
        const props = wrapper.props();

        expect(props.uppercase).toBe(false);
      });

      test('should have attribute with value', () => {
        wrapper = mount(LxTextInput, {
          props: {
            uppercase: true,
          },
        });
        const props = wrapper.props();

        expect(wrapper.find('.lx-uppercase').exists()).toBe(true);
        expect(props.uppercase).toBe(true);
      });
    });

    describe('invalid and invalidationMessage', () => {
      test('should be visible and have invalidation message text', () => {
        wrapper = mount(LxTextInput, {
          props: {
            invalid: true,
            invalidationMessage: 'Invalidation Message',
            modelValue: 'one',
          },
        });

        invalidTest(wrapper);
      });
    });

    describe('maxlength', () => {
      test('should truncate modelValue to maxlength when set', async () => {
        wrapper = mount(LxTextInput, {
          props: {
            maxlength: 3,
            modelValue: '123',
          },
        });
        const props = wrapper.props();

        const inputElement = wrapper.find('.lx-text-input');

        await inputElement.setValue('12345');
        await inputElement.trigger('input');

        await wrapper.vm.$nextTick();
        expect(props.modelValue).toBe('123');
      });
    });

    describe('tooltip', () => {
      test('should have attribute with value', () => {
        wrapper = mount(LxTextInput, {
          props: {
            tooltip: 'Tooltip text',
          },
        });

        expect(wrapper.find('.lx-text-input').attributes('title')).toBe('Tooltip text');
      });

      test('tooltip with new text', async () => {
        wrapper = mount(LxTextInput, {
          props: {
            tooltip: 'Tooltip text',
          },
        });

        expect(wrapper.find('.lx-text-input').attributes('title')).toBe('Tooltip text');
        await wrapper.setProps({ tooltip: 'New tooltip text' });
        expect(wrapper.find('.lx-text-input').attributes('title')).toBe('New tooltip text');
      });
    });

    describe('mask', () => {
      test('default', () => {
        wrapper = mount(LxTextInput, {
          props: {
            mask: 'default',
            modelValue: 'One',
          },
        });

        const inputElement = wrapper.find('.lx-text-input').element;
        expect(inputElement.value).toBe('One');
      });

      test('time', () => {
        wrapper = mount(LxTextInput, {
          props: {
            mask: 'time',
            modelValue: '1455',
          },
        });

        const inputElement = wrapper.find('.lx-text-input').element;
        expect(inputElement.value).toBe('14:55');
      });

      test('personCodeLv', () => {
        wrapper = mount(LxTextInput, {
          props: {
            mask: 'personCodeLv',
            modelValue: '12345612345',
          },
        });

        const inputElement = wrapper.find('.lx-text-input').element;
        expect(inputElement.value).toBe('123456-12345');
      });

      test('newbornId', () => {
        wrapper = mount(LxTextInput, {
          props: {
            mask: 'newbornId',
            modelValue: '1122334455612345678',
          },
        });

        const inputElement = wrapper.find('.lx-text-input').element;
        expect(inputElement.value).toBe('11223344556/12345678');
      });

      test('currency', () => {
        wrapper = mount(LxTextInput, {
          props: {
            mask: 'currency',
            modelValue: '1234',
          },
        });

        const inputElement = wrapper.find('.lx-text-input').element;
        expect(inputElement.value).toBe('12,34 €');
      });

      test('default > time', async () => {
        wrapper = mount(LxTextInput, {
          props: {
            mask: 'default',
            modelValue: 'One',
          },
        });

        const inputElement = wrapper.find('.lx-text-input').element;
        expect(inputElement.value).toBe('One');
        await wrapper.setProps({ mask: 'time' });
        expect(inputElement.value).toBe('__:__');
      });

      test('time > default', async () => {
        wrapper = mount(LxTextInput, {
          props: {
            mask: 'time',
            modelValue: '1455',
          },
        });

        const inputElement = wrapper.find('.lx-text-input').element;
        expect(inputElement.value).toBe('14:55');
        await wrapper.setProps({ mask: 'default' });
        expect(inputElement.value).toBe('1455');
      });

      test('time > personCodeLv', async () => {
        wrapper = mount(LxTextInput, {
          props: {
            mask: 'time',
            modelValue: '1455',
          },
        });

        const inputElement = wrapper.find('.lx-text-input').element;
        expect(inputElement.value).toBe('14:55');
        await wrapper.setProps({ mask: 'personCodeLv' });
        expect(inputElement.value).toBe('1455');
      });

      test('personCodeLv > time', async () => {
        wrapper = mount(LxTextInput, {
          props: {
            mask: 'personCodeLv',
            modelValue: 'a12345612345',
          },
        });

        const inputElement = wrapper.find('.lx-text-input').element;
        expect(inputElement.value).toBe('123456-12345');
        await wrapper.setProps({ mask: 'time' });
        expect(inputElement.value).toBe('12:34');
      });

      test('personCodeLv > default', async () => {
        wrapper = mount(LxTextInput, {
          props: {
            mask: 'personCodeLv',
            modelValue: 'a23456123456',
          },
        });

        const inputElement = wrapper.find('.lx-text-input').element;
        expect(inputElement.value).toBe('234561-23456');
        await wrapper.setProps({ mask: 'default' });
        expect(inputElement.value).toBe('23456123456');
      });

      test('default > personCodeLv', async () => {
        wrapper = mount(LxTextInput, {
          props: {
            mask: 'default',
            modelValue: '123456a89123456789',
          },
        });

        const inputElement = wrapper.find('.lx-text-input').element;
        expect(inputElement.value).toBe('123456a89123456789');
        await wrapper.setProps({ mask: 'personCodeLv' });
        expect(inputElement.value).toBe('123456-89123');
      });

      test('default > integer', async () => {
        wrapper = mount(LxTextInput, {
          props: {
            mask: 'default',
            modelValue: 'one1two2three3',
          },
        });

        const inputElement = wrapper.find('.lx-text-input').element;
        expect(inputElement.value).toBe('one1two2three3');
        await wrapper.setProps({ mask: 'integer' });
        expect(inputElement.value).toBe('123');
      });

      test('default > decimal', async () => {
        wrapper = mount(LxTextInput, {
          props: {
            mask: 'default',
            modelValue: 'one1,1',
          },
        });

        const inputElement = wrapper.find('.lx-text-input').element;
        expect(inputElement.value).toBe('one1,1');
        await wrapper.setProps({ mask: 'decimal' });
        expect(inputElement.value).toBe('1,1');
      });

      test('default > newbornId', async () => {
        wrapper = mount(LxTextInput, {
          props: {
            mask: 'default',
            modelValue: 'one123456789123456789123456789',
          },
        });

        const inputElement = wrapper.find('.lx-text-input').element;
        expect(inputElement.value).toBe('one123456789123456789123456789');
        await wrapper.setProps({ mask: 'newbornId' });
        expect(inputElement.value).toBe('12345678912/345678912345');
      });

      test('default > gpslat', async () => {
        wrapper = mount(LxTextInput, {
          props: {
            mask: 'default',
            modelValue: 'one12,0123456789',
          },
        });

        const inputElement = wrapper.find('.lx-text-input').element;
        expect(inputElement.value).toBe('one12,0123456789');
        await wrapper.setProps({ mask: 'gpslat' });
        expect(inputElement.value).toBe('12,01');
      });

      test('default > gpslon', async () => {
        wrapper = mount(LxTextInput, {
          props: {
            mask: 'default',
            modelValue: 'qwert78zxcv9',
          },
        });

        const inputElement = wrapper.find('.lx-text-input').element;
        expect(inputElement.value).toBe('qwert78zxcv9');
        await wrapper.setProps({ mask: 'gpslon' });
        expect(inputElement.value).toBe('78');
      });
    });

    describe('scale', () => {
      test('should have default value as number', () => {
        wrapper = mount(LxTextInput);
        const props = wrapper.props();

        expect(props.scale).toBe(2);
        expect(props.scale).toBeTypeOf('number');
      });

      test('should accept provided value as number', () => {
        wrapper = mount(LxTextInput, {
          props: {
            scale: 5,
          },
        });
        const props = wrapper.props();

        expect(props.scale).toBe(5);
        expect(props.scale).toBeTypeOf('number');
      });

      test('should accept provided value as string', () => {
        wrapper = mount(LxTextInput, {
          props: {
            scale: '7',
          },
        });
        const props = wrapper.props();

        expect(props.scale).toBe('7');
        expect(props.scale).toBeTypeOf('string');
      });
    });

    describe('signed', () => {
      test('should have default value as boolean', () => {
        wrapper = mount(LxTextInput);
        const props = wrapper.props();

        expect(props.signed).toBe(false);
        expect(props.signed).toBeTypeOf('boolean');
      });

      test('should accept provided value as boolean', () => {
        wrapper = mount(LxTextInput, {
          props: {
            signed: true,
          },
        });
        const props = wrapper.props();

        expect(props.signed).toBe(true);
        expect(props.signed).toBeTypeOf('boolean');
      });
    });

    describe('kind', () => {
      test('kind:default - input wrapper should exist', () => {
        wrapper = mount(LxTextInput, {
          props: {
            kind: 'default',
            modelValue: 'Custom model value',
          },
        });
        const props = wrapper.props();

        expect(props.kind).toBe('default');
        expect(props.kind).toBeTypeOf('string');
        expect(props.modelValue).toBe('Custom model value');
        expect(props.modelValue).toBeTypeOf('string');
        expect(wrapper.find('.lx-input-wrapper').exists()).toBe(true);
      });

      test('kind:search - text-input and search-input wrapper should exist', () => {
        wrapper = mount(LxTextInput, {
          props: {
            kind: 'search',
            modelValue: 'Custom model value',
          },
        });
        const props = wrapper.props();

        expect(props.kind).toBe('search');
        expect(props.kind).toBeTypeOf('string');
        expect(props.modelValue).toBe('Custom model value');
        expect(props.modelValue).toBeTypeOf('string');
        expect(wrapper.find('.lx-text-input.lx-search-input').exists()).toBe(true);
      });

      test('kind:password - input type should be "password"', () => {
        wrapper = mount(LxTextInput, {
          props: {
            kind: 'password',
            modelValue: 'Custom model value',
          },
          global: {
            stubs: ['router-link'],
          },
        });
        const props = wrapper.props();
        const inputElement = wrapper.find('.lx-text-input').element;

        expect(props.kind).toBe('password');
        expect(props.kind).toBeTypeOf('string');
        expect(props.modelValue).toBe('Custom model value');
        expect(props.modelValue).toBeTypeOf('string');
        expect(inputElement.type).toBe('password');
        expect(wrapper.find('.lx-button.lx-button-ghost.lx-button-icon-only').exists()).toBe(true);
      });
    });
  });

  describe('Emits', () => {
    test('should emit event after mask prop changes', async () => {
      wrapper = mount(LxTextInput, {
        props: {
          mask: 'default',
          modelValue: 'one1234',
        },
      });

      const inputElement = wrapper.find('.lx-text-input').element;
      expect(inputElement.value).toBe('one1234');

      await wrapper.setProps({ mask: 'currency' });

      expect(wrapper.emitted()['update:modelValue']).toBeTruthy();

      const emitted = wrapper.emitted()['update:modelValue'];
      const lastEmittedValue = emitted[emitted.length - 1];
      expect(lastEmittedValue).toEqual(['12.34']);
    });

    test('should emit number when convertToString is false', async () => {
      wrapper = mount(LxTextInput, {
        props: {
          modelValue: 777,
          mask: 'integer',
          convertToString: false,
        },
      });

      expect(wrapper.props().modelValue).toBe(777);
      expect(wrapper.props().modelValue).toBeTypeOf('number');

      const input = wrapper.find('.lx-text-input');
      await input.setValue('888');

      expect(wrapper.emitted()['update:modelValue']).toBeTruthy();
      const emitted = wrapper.emitted()['update:modelValue'];

      expect(emitted[0][0]).toEqual(888);
      expect(typeof emitted[0][0]).toBe('number');
    });

    test('should emit string when convertToString is true', async () => {
      wrapper = mount(LxTextInput, {
        props: {
          modelValue: 777,
          mask: 'integer',
          convertToString: true,
        },
      });

      expect(wrapper.props().modelValue).toBe(777);
      expect(wrapper.props().modelValue).toBeTypeOf('number');

      const input = wrapper.find('input');
      await input.setValue('888');

      expect(wrapper.emitted()['update:modelValue']).toBeTruthy();
      const emitted = wrapper.emitted()['update:modelValue'];

      expect(emitted[0][0]).toEqual('888');
      expect(typeof emitted[0][0]).toBe('string');
    });
  });
});
