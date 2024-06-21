import { test, expect, describe } from 'vitest';
import LxDateTimePicker from '@/components/DateTimePicker.vue';
import { mount } from '@vue/test-utils';

// Simple single tests

test('LxDateTimePicker placeholder', () => {
  expect(LxDateTimePicker).toBeTruthy();

  const wrapper = mount(LxDateTimePicker, {
    props: {
      placeholder: '02.02.2022',
    },
  });
  const inputElement = wrapper.find('.lx-date-time-picker').element;
  expect(inputElement.placeholder).toBe('02.02.2022');
});

test('LxDateTimePicker tooltip', () => {
  expect(LxDateTimePicker).toBeTruthy();

  const wrapper = mount(LxDateTimePicker, {
    props: {
      tooltip: 'Tooltip text',
    },
  });

  expect(wrapper.find('.lx-date-time-picker-wrapper').attributes('title')).toBe('Tooltip text');
});

describe.each([
  ['date', [true, false, false]],
  ['time', [false, true, false]],
  ['dateTime', [false, false, true]],
])('LxDateTimePicker kind %s', (kind, expectedResults) => {
  test(`LxDateTimePicker kind ${kind}`, () => {
    expect(LxDateTimePicker).toBeTruthy();

    const wrapper = mount(LxDateTimePicker, {
      props: {
        kind,
      },
      global: {
        stubs: ['router-link'],
      },
    });

    expect(wrapper.find('.lx-date-time-picker-wrapper.lx-date').exists()).toBe(expectedResults[0]);
    expect(wrapper.find('.lx-date-time-picker-wrapper.lx-time').exists()).toBe(expectedResults[1]);
    expect(wrapper.find('.lx-date-time-picker-wrapper.lx-date-time').exists()).toBe(
      expectedResults[2]
    );
  });
});

function readOnlyTest(wrapper) {
  expect(wrapper.find('.lx-date-time-picker-wrapper').exists()).toBe(false);
  expect(wrapper.find('.lx-data').exists()).toBe(true);
  expect(wrapper.find('.lx-data time').exists()).toBe(true);
}

test('LxDateTimePicker readOnly', () => {
  expect(LxDateTimePicker).toBeTruthy();

  const wrapper = mount(LxDateTimePicker, {
    props: {
      readOnly: true,
      modelValue: '2002-02-18',
    },
  });

  readOnlyTest(wrapper);
});

function disabledTest(wrapper) {
  expect(wrapper.find('.lx-date-time-picker').attributes('disabled')).toBeDefined();
  expect(wrapper.find('.lx-date-time-picker-wrapper').attributes('data-disabled')).toBeDefined();
}
test('LxDateTimePicker disabled', () => {
  expect(LxDateTimePicker).toBeTruthy();

  const wrapper = mount(LxDateTimePicker, {
    props: {
      disabled: true,
    },
  });

  disabledTest(wrapper);
});

function invalidTest(wrapper) {
  expect(wrapper.find('.lx-date-time-picker.lx-invalid').isVisible()).toBe(true);
  expect(wrapper.find('.lx-invalidation-icon').isVisible()).toBe(true);
  const invalidationMessageElement = wrapper
    .find('.lx-field-wrapper')
    .find('.lx-invalidation-message');
  expect(invalidationMessageElement.isVisible()).toBe(true);
  expect(invalidationMessageElement.text()).toBe('Invalid input');
}
test('LxDateTimePicker invalid', () => {
  expect(LxDateTimePicker).toBeTruthy();

  const wrapper = mount(LxDateTimePicker, {
    props: {
      invalid: true,
      invalidationMessage: 'Invalid input',
      modelValue: '2002-02-18',
    },
  });

  invalidTest(wrapper);
});

test('LxDateTimePicker modelValue', async () => {
  expect(LxDateTimePicker).toBeTruthy();

  const wrapper = mount(LxDateTimePicker, {
    props: {
      modelValue: '2002-02-18',
    },
  });
  await wrapper.trigger('');
  expect(wrapper.find('input').element.value).toBe('18.02.2002.');
});

test('LxDateTimePicker texts.todayButton', () => {
  expect(LxDateTimePicker).toBeTruthy();

  const wrapper = mount(LxDateTimePicker, {
    props: {
      modelValue: '2002-02-18',
      variant: 'picker',
      kind: 'date',
      texts: {
        todayButton: 'Today',
      },
    },
    global: {
      stubs: ['router-link'],
    },
  });

  expect(wrapper.find('.lx-button.lx-button-ghost.lx-button-icon-only').attributes('title')).toBe(
    'Today'
  );
});

test('LxDateTimePicker texts.clearButton', () => {
  expect(LxDateTimePicker).toBeTruthy();

  const wrapper = mount(LxDateTimePicker, {
    props: {
      modelValue: '2002-02-18',
      variant: 'picker',
      kind: 'date',
      texts: {
        clearButton: 'Clear',
      },
    },
    global: {
      stubs: ['router-link'],
    },
  });

  expect(
    wrapper
      .find('.lx-button.lx-button-ghost.lx-button-icon-only.lx-destructive')
      .attributes('title')
  ).toBe('Clear');
});

test('LxDateTimePicker texts.clear', () => {
  expect(LxDateTimePicker).toBeTruthy();

  const wrapper = mount(LxDateTimePicker, {
    props: {
      modelValue: '00:00',
      variant: 'default',
      kind: 'time',
      texts: {
        clear: 'Clear',
      },
    },
    global: {
      stubs: ['router-link'],
    },
  });

  // setTimeout(() => {
  //   expect(
  //     wrapper
  //       .find('.lx-button.lx-button-ghost.lx-button-icon-only.lx-destructive')
  //       .attributes('title')
  //   ).toBe('Clear');
  // }, 100);
});

describe.each([
  ['default', 1, ''],
  ['picker', 1, ''],
  ['full', 4, ''],
  ['full-rows', 2, 'grid-template-columns: repeat(1, 1fr);'],
  ['full-columns', 2, 'grid-template-columns: repeat(2, 1fr);'],
])('LxDateTimePicker variant: %s, kind: date', (variant, expectedChildCount, expectedStyle) => {
  test(`LxDateTimePicker variant ${variant}`, () => {
    expect(LxDateTimePicker).toBeTruthy();

    const wrapper = mount(LxDateTimePicker, {
      props: {
        kind: 'date',
        variant,
        modelValue: '2002-02-18',
      },
      global: {
        stubs: ['router-link'],
      },
    });

    expect(wrapper.find('.lx-date-time-picker-wrapper').exists()).toBe(true);
    expect(wrapper.find('.lx-date-time-picker').exists()).toBe(variant === 'default');

    const vcContainer = wrapper.find('.vc-container');
    expect(vcContainer.exists()).toBe(variant !== 'default');

    if (vcContainer.exists()) {
      const paneLayout = vcContainer.find('.vc-pane-layout');
      expect(paneLayout.exists()).toBe(true);

      const childCount = paneLayout.element.children.length;
      expect(childCount).toBe(expectedChildCount);

      if (expectedStyle) {
        expect(paneLayout.attributes('style')).toContain(expectedStyle);
      }
    }
  });
});

test('LxDateTimePicker max/min', async () => {
  expect(LxDateTimePicker).toBeTruthy();

  const wrapper = mount(LxDateTimePicker, {
    props: {
      modelValue: '2002-02-18',
      minDate: '2002-02-01',
      maxDate: '2002-02-28',
    },
  });

  await wrapper.setProps({ modelValue: '2002-02-20' });
  expect(wrapper.find('input').element.value).toBe('20.02.2002.');

  //   Set prop higher than maxDate
  wrapper.setProps({ modelValue: '2002-03-20' });
  expect(wrapper.find('input').element.value).toBe('20.02.2002.');

  //   Set prop below than minDate
  wrapper.setProps({ modelValue: '2002-01-20' });
  expect(wrapper.find('input').element.value).toBe('20.02.2002.');
});

// TODO: tests for kind time, (probably need to fix component first)

// TODO: fix - regeneratorRuntime error
// test('LxDateTimePicker kind: default, variant: picker, specialDates, dictionary', async () => {
//   expect(LxDateTimePicker).toBeTruthy();

//   const wrapper = mount(LxDateTimePicker, {
//     props: {
//       modelValue: '2024-02-07',
//       variant: 'picker',
//       kind: 'default',
//       specialDates: [
//         { category: 'one', dates: ['2024-02-05'] },
//         { category: 'two', dates: ['2024-02-07'] },
//         { category: 'three', dates: ['2024-02-09'] },
//       ],
//       dictionary: [
//         { id: 'one', name: 'LX standup', displayType: 'blue' },
//         { id: 'two', name: 'LX/UI new release', displayType: 'red-full' },
//         { id: 'three', name: 'LX lecture', displayType: 'black' },
//       ],
//     },
//     global: {
//       stubs: ['router-link'],
//     },
//   });
//   // one
//   expect(wrapper.find('.id-2024-02-05').find('.vc-day-content').text()).toBe('5');
//   expect(wrapper.find('.id-2024-02-05').find('.vc-lx-blue').exists()).toBe(true);

//   // two
//   expect(wrapper.find('.id-2024-02-07').find('.vc-day-content').text()).toBe('7');
//   expect(wrapper.find('.id-2024-02-07').find('.vc-lx-red').exists()).toBe(true);

//   // three
//   expect(wrapper.find('.id-2024-02-09').find('.vc-day-content').text()).toBe('9');
//   expect(wrapper.find('.id-2024-02-09').find('.vc-lx-black').exists()).toBe(true);
// });

test('LxDateTimepicker locale.locale ENG', () => {
  expect(LxDateTimePicker).toBeTruthy();

  const wrapper = mount(LxDateTimePicker, {
    props: {
      modelValue: '2002-02-18',
      variant: 'picker',
      locale: {
        locale: 'en-EN',
      },
    },
    global: {
      stubs: ['router-link'],
    },
  });

  expect(wrapper.find('.vc-header .vc-title').text()).toBe('February 2002');
});

test('LxDateTimepicker locale.locale LV', () => {
  expect(LxDateTimePicker).toBeTruthy();

  const wrapper = mount(LxDateTimePicker, {
    props: {
      modelValue: '2002-02-18',
      variant: 'picker',
      locale: {
        locale: 'lv-LV',
      },
    },
    global: {
      stubs: ['router-link'],
    },
  });

  expect(wrapper.find('.vc-header .vc-title').text()).toBe('februāris 2002');
});

// Change tests

test('LxDateTimePicker modelValue change', async () => {
  expect(LxDateTimePicker).toBeTruthy();

  const wrapper = mount(LxDateTimePicker, {
    props: {
      modelValue: '2002-02-18',
    },
  });
  await wrapper.trigger('');
  expect(wrapper.find('input').element.value).toBe('18.02.2002.');
  await wrapper.setProps({ modelValue: '2002-02-19' });
  await wrapper.trigger('');
  expect(wrapper.find('input').element.value).toBe('19.02.2002.');
});

test('LxDateTimePicker modelValue change to null', async () => {
  expect(LxDateTimePicker).toBeTruthy();

  const wrapper = mount(LxDateTimePicker, {
    props: {
      modelValue: '2002-02-18',
    },
  });

  await wrapper.setProps({ modelValue: null });
  expect(wrapper.find('input').element.value).toBe('');
});

test('LxDateTimePicker modelValue change to empty string', async () => {
  expect(LxDateTimePicker).toBeTruthy();

  const wrapper = mount(LxDateTimePicker, {
    props: {
      modelValue: '2002-02-18',
    },
  });

  await wrapper.setProps({ modelValue: '' });
  expect(wrapper.find('input').element.value).toBe('');
});

test('LxDateTimePicker modelValue change to undefined', async () => {
  expect(LxDateTimePicker).toBeTruthy();

  const wrapper = mount(LxDateTimePicker, {
    props: {
      modelValue: '2002-02-18',
    },
  });

  await wrapper.setProps({ modelValue: undefined });
  expect(wrapper.find('input').element.value).toBe('');
});

test('LxDateTimePicker modelValue change to undefined and back to date', async () => {
  expect(LxDateTimePicker).toBeTruthy();

  const wrapper = mount(LxDateTimePicker, {
    props: {
      modelValue: '2002-02-18',
    },
  });

  await wrapper.setProps({ modelValue: undefined });
  expect(wrapper.find('input').element.value).toBe('');
  await wrapper.setProps({ modelValue: '2002-02-18' });
  expect(wrapper.find('input').element.value).toBe('18.02.2002.');
});

test('LxDateTimePicker modelValue change to null and back to date', async () => {
  expect(LxDateTimePicker).toBeTruthy();

  const wrapper = mount(LxDateTimePicker, {
    props: {
      modelValue: '2002-02-18',
    },
  });

  await wrapper.setProps({ modelValue: null });
  expect(wrapper.find('input').element.value).toBe('');
  await wrapper.setProps({ modelValue: '2002-02-18' });
  expect(wrapper.find('input').element.value).toBe('18.02.2002.');
});

test('LxDateTimePicker modelValue change to empty string and back to empty string', async () => {
  expect(LxDateTimePicker).toBeTruthy();

  const wrapper = mount(LxDateTimePicker, {
    props: {
      modelValue: '',
    },
  });

  await wrapper.trigger('');
  expect(wrapper.find('input').element.value).toBe('');
  await wrapper.setProps({ modelValue: '' });
  await wrapper.trigger('');
  expect(wrapper.find('input').element.value).toBe('');
});
// TODO: tests for v-calendar popper
// https://github.com/nathanreyes/v-calendar/issues/338

test('LxDateTimePicker kind: date, variant: picker', async () => {
  expect(LxDateTimePicker).toBeTruthy();

  const wrapper = mount(LxDateTimePicker, {
    props: {
      modelValue: '2002-02-18',
      variant: 'picker',
      kind: 'date',
    },
    global: {
      stubs: ['router-link'],
    },
  });

  expect(wrapper.find('.vc-container').exists()).toBe(true);
  expect(wrapper.find('.vc-header').exists()).toBe(true);
  expect(wrapper.find('.vc-weeks').exists()).toBe(true);
});

test('LxDateTimePicker date click', async () => {
  expect(LxDateTimePicker).toBeTruthy();

  const wrapper = mount(LxDateTimePicker, {
    props: {
      modelValue: '2002-02-18',
      variant: 'picker',
      kind: 'date',
    },
    global: {
      stubs: ['router-link'],
    },
  });

  await wrapper.find('.id-2002-02-05 .vc-day-content').trigger('click');

  expect(wrapper.find('.vc-highlight-content-solid').text()).toBe('5');
});

test('LxDateTimePicker clear click', async () => {
  expect(LxDateTimePicker).toBeTruthy();

  const wrapper = mount(LxDateTimePicker, {
    props: {
      modelValue: '2002-02-18',
      variant: 'picker',
      kind: 'date',
    },
    global: {
      stubs: ['router-link'],
    },
  });
  await wrapper.find('.id-2002-02-05 .vc-day-content').trigger('click');

  await wrapper
    .find('.footer-buttons .lx-button.lx-button-ghost.lx-button-icon-only.lx-destructive')
    .trigger('click');

  expect(wrapper.find('.vc-highlight-content-solid').exists()).toBe(false);
});
// TODO: somehow this test is not working
// test('LxDateTimePicker today click', async () => {
//   expect(LxDateTimePicker).toBeTruthy();

//   const wrapper = mount(LxDateTimePicker, {
//     props: {
//       modelValue: '2002-02-18',
//       variant: 'picker',
//       kind: 'date',
//     },
//     global: {
//       stubs: ['router-link'],
//     },
//   });

//   await wrapper
//     .find('.footer-buttons .lx-button.lx-button-ghost.lx-button-icon-only')
//     .trigger('click');

//   expect(wrapper.find('.vc-highlight-content-solid').text()).toBe('18');
// });
