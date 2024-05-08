import { test, expect } from 'vitest';
import LxTextInput from '@/components/TextInput.vue';
import { mount } from '@vue/test-utils';

// Simple single tests

test('LxTextInput placeholder', () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
    props: {
      placeholder: 'Test text',
    },
  });

  const inputElement = wrapper.find('.lx-text-input').element;
  expect(inputElement.placeholder).toBe('Test text');
});

test('LxTextInput default', () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
    props: {
      kind: 'default',
      modelValue: 'one',
    },
  });

  expect(wrapper.find('.lx-input-wrapper').exists()).toBe(true);
});

test('LxTextInput search', () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
    props: {
      kind: 'search',
      modelValue: 'one',
    },
  });

  expect(wrapper.find('.lx-text-input.lx-search-input').exists()).toBe(true);
});

test('LxTextInput password', () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
    props: {
      kind: 'password',
      modelValue: 'one',
    },
    global: {
      stubs: ['router-link'],
    },
  });

  const inputElement = wrapper.find('.lx-text-input').element;
  expect(inputElement.type).toBe('password');
  expect(wrapper.find('.lx-button.lx-button-ghost.lx-button-icon-only').exists()).toBe(true);
});

test('LxTextInput mask: default', () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
    props: {
      mask: 'default',
      modelValue: 'One',
    },
  });

  const inputElement = wrapper.find('.lx-text-input').element;
  expect(inputElement.value).toBe('One');
});
// TODO integer, gpslat, gpslon and decimal mask tests
// test('LxTextInput mask: integer', () => {
//   expect(LxTextInput).toBeTruthy();

//   const wrapper = mount(LxTextInput, {
//     props: {
//       mask: 'integer',
//       modelValue: 11,
//     },
//   });

//   const inputElement = wrapper.find('.lx-text-input').element;
//   // console.log(inputElement);
//   expect(inputElement.value).toBe('11');
// });
test('LxTextInput mask: time', () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
    props: {
      mask: 'time',
      modelValue: '1455',
    },
  });

  const inputElement = wrapper.find('.lx-text-input').element;
  expect(inputElement.value).toBe('14:55');
});

test('LxTextInput mask: personCodeLv', () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
    props: {
      mask: 'personCodeLv',
      modelValue: '12345612345',
    },
  });

  const inputElement = wrapper.find('.lx-text-input').element;
  expect(inputElement.value).toBe('123456-12345');
});

test('LxTextInput mask: newbornId', () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
    props: {
      mask: 'newbornId',
      modelValue: '1122334455612345678',
    },
  });

  const inputElement = wrapper.find('.lx-text-input').element;
  expect(inputElement.value).toBe('11223344556/12345678');
});

test('LxTextInput mask: currency', () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
    props: {
      mask: 'currency',
      modelValue: '1234',
    },
  });

  const inputElement = wrapper.find('.lx-text-input').element;
  expect(inputElement.value).toBe('12,34 €');
});

function readOnlyTest(wrapper) {
  expect(wrapper.find('.lx-text-input-wrapper').attributes('style')).toContain('display: none');
  expect(wrapper.find('.lx-data').exists()).toBe(true);
  expect(wrapper.find('.lx-data').text()).toBe('one');

  expect(wrapper.find('.lx-data .lx-text-input-wrapper .password-mask').exists()).toBe(false);
}

test('LxTextInput readOnly', () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
    props: {
      readOnly: true,
      modelValue: 'one',
    },
  });

  readOnlyTest(wrapper);
});

// TODO: fix this test and add more modelValue tests
// test('LxTextInput maxlength', async () => {
//   expect(LxTextInput).toBeTruthy();

//   let wrapper;

//   wrapper = mount(LxTextInput, {
//     props: {
//       maxlength: 3,
//       modelValue: '12345',
//       'onUpdate:modelValue': (e) => {
//         if (wrapper) {
//           wrapper.setProps({ modelValue: e });
//         }
//       },
//     },
//   });

//   const inputElement = wrapper.find('input');

//   // Set the value of the input element
//   await inputElement.setValue('12345');

//   // Manually trigger the input event
//   await inputElement.trigger('input');

//   // Wait for Vue to update the DOM
//   await wrapper.vm.$nextTick();

//   expect(inputElement.element.value).toBe('123');
// });

test('LxTextInput tooltip', () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
    props: {
      tooltip: 'Tooltip text',
    },
  });

  expect(wrapper.find('.lx-text-input').attributes('title')).toBe('Tooltip text');
});

// TODO scale and signed tests

/* disabled */
function disabledTest(wrapper) {
  expect(wrapper.find('.lx-text-input').attributes('disabled')).toBeDefined();
}
test('LxTextInput disabled', () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
    props: {
      disabled: true,
      modelValue: 'one',
    },
  });

  disabledTest(wrapper);
});

// TODO: test for uppercase
// TODO: fix this test (Error: value should be string)
// test('LxTextInput does not convert to string', () => {
//   expect(LxTextInput).toBeTruthy();

//   const wrapper = mount(LxTextInput, {
//     props: {
//       convertToString: false,
//       modelValue: 123,
//     },
//   });

//   expect(typeof wrapper.props().modelValue).toBe('number');
// });

/* invalid and invalidationMessage */

function invalidTest(wrapper) {
  expect(wrapper.find('.lx-text-input.lx-invalid').isVisible()).toBe(true);
  expect(wrapper.find('.lx-invalidation-icon').isVisible()).toBe(true);
  const invalidationMessageElement = wrapper
    .find('.lx-field-wrapper')
    .find('.lx-invalidation-message');
  expect(invalidationMessageElement.isVisible()).toBe(true);
  expect(invalidationMessageElement.text()).toBe('Invalid input');
}
test('LxTextInput invalid', () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
    props: {
      invalid: true,
      invalidationMessage: 'Invalid input',
      modelValue: 'one',
    },
  });

  invalidTest(wrapper);
});

// Combo testss

test('LxTextInput disabled invalid', () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
    props: {
      invalid: true,
      invalidationMessage: 'Invalid input',
      disabled: true,
      modelValue: 'one',
    },
  });
  invalidTest(wrapper);
  disabledTest(wrapper);
});

test('LxTextInput readOnly disabled invalid', () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
    props: {
      invalid: true,
      invalidationMessage: 'Invalid input',
      disabled: true,
      readOnly: true,
      modelValue: 'one',
    },
  });

  readOnlyTest(wrapper);
  invalidTest(wrapper);
  disabledTest(wrapper);
});

test('LxTextInput disabled new text', async () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
    props: {
      disabled: true,
      modelValue: 'one',
    },
  });
  disabledTest(wrapper);
  await wrapper.get('.lx-text-input').setValue('two');
  expect(wrapper.find('.lx-text-input').element.value).toBe('one');
});

test('LxTextInput readOnly password', async () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
    props: {
      readOnly: true,
      kind: 'password',
      modelValue: 'one',
    },
    global: {
      stubs: ['router-link'],
    },
  });

  expect(wrapper.find('.lx-data').attributes('style')).toContain('display: none');
  expect(wrapper.find('.lx-text-input-wrapper.password-mask').attributes('style')).toContain(
    'display: none'
  );
});

test('LxTextInput readOnly password invalid', async () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
    props: {
      readOnly: true,
      kind: 'password',
      modelValue: 'one',
    },
    global: {
      stubs: ['router-link'],
    },
  });

  expect(wrapper.find('.lx-data').attributes('style')).toContain('display: none');
  expect(wrapper.find('.lx-text-input-wrapper.password-mask').attributes('style')).toContain(
    'display: none'
  );
  expect(wrapper.find('.lx-invalidation-message').attributes('style')).toContain('display: none');
});

test('LxTextInput readOnly default invalid', async () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
    props: {
      readOnly: true,
      kind: 'default',
      modelValue: 'one',
    },
    global: {
      stubs: ['router-link'],
    },
  });

  expect(wrapper.find('.lx-data').exists()).toBe(true);

  expect(wrapper.find('.lx-invalidation-message').attributes('style')).toContain('display: none');
});

test('LxTextInput placeholder new text', async () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
    props: {
      placeholder: 'Test text',
    },
  });

  const inputElement = wrapper.find('.lx-text-input').element;
  expect(inputElement.placeholder).toBe('Test text');
  await wrapper.setProps({ placeholder: 'New text' });
  expect(inputElement.placeholder).toBe('New text');
});

test('LxTextInput tooltip new text', async () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
    props: {
      tooltip: 'Tooltip text',
    },
  });

  expect(wrapper.find('.lx-text-input').attributes('title')).toBe('Tooltip text');
  await wrapper.setProps({ tooltip: 'New tooltip text' });
  expect(wrapper.find('.lx-text-input').attributes('title')).toBe('New tooltip text');
});
// Props change tests
test('LxTextInput mask default > time', async () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
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

test('LxTextInput mask time > default', async () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
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

test('LxTextInput mask time > personCodeLv', async () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
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

test('LxTextInput mask personCodeLv > time', async () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
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

test('LxTextInput mask personCodeLv > default', async () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
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

test('LxTextInput mask default > personCodeLv', async () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
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

test('LxTextInput mask default > integer', async () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
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

test('LxTextInput mask default > decimal', async () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
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
test('LxTextInput mask default > newbornId', async () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
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
// TODO fix currecncy test
// test('LxTextInput mask default > currency', async () => {
//   expect(LxTextInput).toBeTruthy();

//   const wrapper = mount(LxTextInput, {
//     props: {
//       mask: 'default',
//       modelValue: 'one1234',
//     },
//   });

//   const inputElement = wrapper.find('.lx-text-input').element;
//   expect(inputElement.value).toBe('one1234');
//   await wrapper.setProps({ mask: 'currency' });
//   expect(inputElement.value).toBe('12,34 €');
// });

test('LxTextInput mask default > gpslat', async () => {
  expect(LxTextInput).toBeTruthy();

  const wrapper = mount(LxTextInput, {
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
