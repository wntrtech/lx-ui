// @ts-nocheck
import { test, expect, describe, afterEach, beforeEach, it } from 'vitest';
import { mount } from '@vue/test-utils';
import LxDateTimePicker from '@/components/datePicker/DateTimePicker.vue';

let wrapper;

const dummyClickAway = {
  beforeMount() {},
  mounted() {},
  beforeUnmount() {},
  unmounted() {},
};

function readOnlyTest(wrp) {
  expect(wrp.find('.lx-date-time-picker-wrapper').exists()).toBe(false);
  expect(wrp.find('.lx-data').exists()).toBe(true);
  expect(wrp.find('.lx-data time').exists()).toBe(true);
}

function disabledTest(wrp) {
  expect(wrp.find('.lx-date-time-picker').attributes('disabled')).toBeDefined();
  expect(wrp.find('.lx-date-time-picker-wrapper').attributes('data-disabled')).toBeDefined();
}

function invalidTest(wrp) {
  expect(wrp.find('.lx-date-time-picker.lx-invalid').isVisible()).toBe(true);
  expect(wrp.find('.lx-invalidation-icon').isVisible()).toBe(true);
  const invalidationMessageElement = wrp.find('.lx-field-wrapper').find('.lx-invalidation-message');
  expect(invalidationMessageElement.isVisible()).toBe(true);
  expect(invalidationMessageElement.text()).toBe('Invalid input');
}

beforeEach(() => {
  const el = document.createElement('div');
  el.id = 'poppers';
  document.body.appendChild(el);
});

afterEach(() => {
  document.body.innerHTML = '';
  if (wrapper) {
    wrapper.unmount();
  }
});

// Simple single tests
describe('LxDateTimePicker', () => {
  it('placeholder', () => {
    expect(LxDateTimePicker).toBeTruthy();

    wrapper = mount(LxDateTimePicker, {
      props: {
        placeholder: '02.02.2022',
      },
      global: {
        stubs: ['router-link'],
        directives: {
          ClickAway: dummyClickAway,
        },
      },
    });
    const inputElement = wrapper.find('.lx-date-time-picker').element;
    expect(inputElement.placeholder).toBe('02.02.2022');
  });

  it('tooltip', () => {
    expect(LxDateTimePicker).toBeTruthy();

    wrapper = mount(LxDateTimePicker, {
      props: {
        tooltip: 'Tooltip text',
      },
      global: {
        stubs: ['router-link'],
        directives: {
          ClickAway: dummyClickAway,
        },
      },
    });

    expect(wrapper.find('.lx-date-time-picker-wrapper').attributes('title')).toBe('Tooltip text');
  });

  describe('kind', () => {
    describe.each([
      ['date', '.lx-calendar-container', '.lx-calendar-day-content', /\d+/],
      ['time', '.lx-calendar-container', '.lx-time-list-item', /\d+/],
      ['date-time', '.lx-calendar-container', '.lx-calendar-day-content', /\d+/],
      ['month', '.lx-calendar-container', '.lx-calendar-month', /Janv\./i],
      ['year', '.lx-calendar-container', '.lx-calendar-year', /\d+/],
      ['month-year', '.lx-calendar-container', '.lx-calendar-month', /Janv\./i],
      ['quarters', '.lx-calendar-container', '.lx-calendar-quarter', /^Q1$/],
    ])('%s', (kind, container, unit, regEx) => {
      test('calendar container renders and there is item to select', async () => {
        expect(LxDateTimePicker).toBeTruthy();

        wrapper = mount(LxDateTimePicker, {
          props: {
            modelValue: '2025-05-14',
            variant: 'default',
            kind,
          },
          global: {
            stubs: ['router-link'],
            directives: {
              ClickAway: dummyClickAway,
            },
          },
        });

        const pickerInput = wrapper.find('.lx-date-time-picker.lx-input-area');
        expect(pickerInput.exists()).toBe(true);

        await pickerInput.trigger('keydown', { key: 'ArrowDown' });

        const calendarContainer = document.body.querySelector(container);
        expect(calendarContainer).toBeTruthy();

        const unitContent = calendarContainer.querySelector(unit);
        expect(unitContent).toBeTruthy();
        expect(unitContent.textContent).toMatch(regEx);
      });
    });
  });

  it('readOnly', () => {
    expect(LxDateTimePicker).toBeTruthy();

    wrapper = mount(LxDateTimePicker, {
      props: {
        readOnly: true,
        modelValue: '2002-02-18',
      },
      global: {
        stubs: ['router-link'],
        directives: {
          ClickAway: dummyClickAway,
        },
      },
    });

    readOnlyTest(wrapper);
  });

  it('disabled', () => {
    expect(LxDateTimePicker).toBeTruthy();

    wrapper = mount(LxDateTimePicker, {
      props: {
        disabled: true,
      },
      global: {
        stubs: ['router-link'],
        directives: {
          ClickAway: dummyClickAway,
        },
      },
    });

    disabledTest(wrapper);
  });

  it('invalid', () => {
    expect(LxDateTimePicker).toBeTruthy();

    wrapper = mount(LxDateTimePicker, {
      props: {
        invalid: true,
        invalidationMessage: 'Invalid input',
        modelValue: '2002-02-18',
      },
      global: {
        stubs: ['router-link'],
        directives: {
          ClickAway: dummyClickAway,
        },
      },
    });

    invalidTest(wrapper);
  });

  it('modelValue', async () => {
    expect(LxDateTimePicker).toBeTruthy();

    wrapper = mount(LxDateTimePicker, {
      props: {
        modelValue: '2002-02-18',
      },
      global: {
        stubs: ['router-link'],
        directives: {
          ClickAway: dummyClickAway,
        },
      },
    });
    await wrapper.trigger('');
    expect(wrapper.find('input').element.value).toBe('18.02.2002.');
  });

  describe('texts', () => {
    it('todayButton', () => {
      expect(LxDateTimePicker).toBeTruthy();

      wrapper = mount(LxDateTimePicker, {
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
          directives: {
            ClickAway: dummyClickAway,
          },
        },
      });

      expect(
        wrapper.find('.lx-button.lx-button-ghost.lx-button-icon-only').attributes('title')
      ).toBe('Today');
    });

    it('clearButton', () => {
      expect(LxDateTimePicker).toBeTruthy();

      wrapper = mount(LxDateTimePicker, {
        props: {
          modelValue: '2002-02-18',
          variant: 'picker',
          kind: 'date',
          texts: {
            clearButton: 'Attīrīt vērtību',
          },
        },
        global: {
          stubs: ['router-link'],
          directives: {
            ClickAway: dummyClickAway,
          },
        },
      });

      const clearButtons = wrapper.findAll('.lx-button.lx-button-ghost');
      const clearButton = clearButtons.find((btn) => btn.attributes('title') === 'Attīrīt vērtību');
      expect(clearButton).toBeTruthy();
    });

    it('clear', () => {
      expect(LxDateTimePicker).toBeTruthy();

      wrapper = mount(LxDateTimePicker, {
        props: {
          modelValue: '00:00',
          variant: 'picker',
          kind: 'time',
          texts: {
            clear: 'Attīrīt',
          },
        },
        global: {
          stubs: ['router-link'],
          directives: {
            ClickAway: dummyClickAway,
          },
        },
      });

      const clearButtons = wrapper.findAll('.lx-button.lx-button-ghost');
      const clearButton = clearButtons.find((btn) => btn.text('Attīrīt'));
      expect(clearButton).toBeTruthy();
    });
  });

  it('min/max', async () => {
    expect(LxDateTimePicker).toBeTruthy();

    wrapper = mount(LxDateTimePicker, {
      props: {
        modelValue: '2002-02-18',
        minDate: new Date('2002-02-01'),
        maxDate: new Date('2002-02-28'),
      },
      global: {
        stubs: ['router-link'],
        directives: {
          ClickAway: dummyClickAway,
        },
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

  it('min/max outside of today in future', async () => {
    expect(LxDateTimePicker).toBeTruthy();

    wrapper = mount(LxDateTimePicker, {
      props: {
        modelValue: '2030-05-14',
        variant: 'picker',
        kind: 'date',
        minDate: new Date('2030-06-01'),
        maxDate: new Date('2030-07-28'),
      },
      global: {
        stubs: ['router-link'],
        directives: {
          ClickAway: dummyClickAway,
        },
      },
    });

    const monthSelectButton = wrapper.find('.lx-button.lx-calendar-months-select-button');
    expect(monthSelectButton).toBeTruthy();
    expect(monthSelectButton.attributes('aria-label')).toBe('Jūnijs');
  });

  it('min/max outside of today in future different year', async () => {
    expect(LxDateTimePicker).toBeTruthy();

    wrapper = mount(LxDateTimePicker, {
      props: {
        modelValue: '2025-05-14',
        variant: 'picker',
        kind: 'date',
        minDate: new Date('2026-06-01'),
        maxDate: new Date('2026-07-28'),
      },
      global: {
        stubs: ['router-link'],
        directives: {
          ClickAway: dummyClickAway,
        },
      },
    });

    const monthSelectButton = wrapper.find('.lx-button.lx-calendar-months-select-button');
    expect(monthSelectButton).toBeTruthy();
    expect(monthSelectButton.attributes('aria-label')).toBe('Jūnijs');

    const yearSelectButton = wrapper.find('.lx-button.lx-calendar-years-select-button');
    expect(yearSelectButton).toBeTruthy();
    expect(yearSelectButton.attributes('aria-label')).toBe('2026');
  });

  it('min/max outside of today in future different year', async () => {
    expect(LxDateTimePicker).toBeTruthy();

    wrapper = mount(LxDateTimePicker, {
      props: {
        modelValue: '2025-05-14',
        variant: 'picker',
        kind: 'date',
        minDate: new Date('2030-06-01'),
        maxDate: new Date('2030-07-28'),
      },
      global: {
        stubs: ['router-link'],
        directives: {
          ClickAway: dummyClickAway,
        },
      },
    });

    const monthSelectButton = wrapper.find('.lx-button.lx-calendar-months-select-button');
    expect(monthSelectButton).toBeTruthy();
    expect(monthSelectButton.attributes('aria-label')).toBe('Jūnijs');

    const yearSelectButton = wrapper.find('.lx-button.lx-calendar-years-select-button');
    expect(yearSelectButton).toBeTruthy();
    expect(yearSelectButton.attributes('aria-label')).toBe('2030');
  });

  it('min outside of today in future, max in not provided', async () => {
    expect(LxDateTimePicker).toBeTruthy();

    wrapper = mount(LxDateTimePicker, {
      props: {
        modelValue: '2025-05-14',
        variant: 'default',
        kind: 'date',
        minDate: new Date('2030-06-01'),
      },
      global: {
        stubs: ['router-link'],
        directives: {
          ClickAway: dummyClickAway,
        },
      },
    });

    const pickerInput = wrapper.find('.lx-date-time-picker.lx-input-area');
    expect(pickerInput.exists()).toBe(true);

    await pickerInput.trigger('keydown', { key: 'ArrowDown' });

    const calendarContainer = document.body.querySelector('.lx-calendar-container');
    expect(calendarContainer).toBeTruthy();

    const monthSelectButton = calendarContainer.querySelector(
      '.lx-button.lx-calendar-months-select-button'
    );
    expect(monthSelectButton).toBeTruthy();
    expect(monthSelectButton.getAttribute('aria-label')).toBe('Jūnijs');
  });

  it('it max outside of today in past, min in not provided', async () => {
    expect(LxDateTimePicker).toBeTruthy();

    wrapper = mount(LxDateTimePicker, {
      props: {
        modelValue: '2025-05-14',
        variant: 'default',
        kind: 'date',
        maxDate: new Date('2025-04-01'),
      },
      global: {
        stubs: ['router-link'],
        directives: {
          ClickAway: dummyClickAway,
        },
      },
    });

    const pickerInput = wrapper.find('.lx-date-time-picker.lx-input-area');
    expect(pickerInput.exists()).toBe(true);

    await pickerInput.trigger('keydown', { key: 'ArrowDown' });

    const calendarContainer = document.body.querySelector('.lx-calendar-container');
    expect(calendarContainer).toBeTruthy();

    const monthSelectButton = calendarContainer.querySelector(
      '.lx-button.lx-calendar-months-select-button'
    );
    expect(monthSelectButton).toBeTruthy();
    expect(monthSelectButton.getAttribute('aria-label')).toBe('Aprīlis');
  });

  it('kind: default, variant: picker, specialDates, dictionary', async () => {
    expect(LxDateTimePicker).toBeTruthy();

    wrapper = mount(LxDateTimePicker, {
      props: {
        modelValue: '2025-05-07',
        kind: 'date',
        variant: 'picker',
        specialDates: [
          { category: 'one', dates: ['2025-05-02', '2025-05-05', '2025-05-07'] },
          { category: 'two', dates: ['2025-05-05', '2025-05-07'] },
          { category: 'three', dates: ['2025-05-01', '2025-05-07'] },
        ],
        dictionary: [
          { id: 'one', name: 'LX standup', displayType: 'blue' },
          { id: 'two', name: 'LX/UI new release', displayType: 'red-full' },
          { id: 'three', name: 'LX lecture', displayType: 'black' },
        ],
      },
      global: {
        stubs: ['router-link'],
        directives: {
          ClickAway: dummyClickAway,
        },
      },
    });

    // 'one'
    const specialDayOne = wrapper.findAll('.lx-calendar-day').find((day) => {
      const content = day.find('.lx-calendar-day-content');
      return content.exists() && content.text().trim() === '7';
    });
    expect(specialDayOne).toBeTruthy();
    const barsWrapperOne = specialDayOne.find('.lx-day-layer-bars');
    expect(barsWrapperOne.exists()).toBe(true);

    const barsOne = barsWrapperOne.findAll('.lx-day-layer-bar');
    expect(barsOne.length).toBe(3);

    const blueBarsOne = barsOne.filter((bar) => bar.classes().includes('bar-lx-blue'));
    const redBarsOne = barsOne.filter((bar) => bar.classes().includes('bar-lx-red'));
    const blackBarsOne = barsOne.filter((bar) => bar.classes().includes('bar-lx-black'));
    expect(blueBarsOne.length).toBe(1);
    expect(redBarsOne.length).toBe(1);
    expect(blackBarsOne.length).toBe(1);

    // 'two'
    const specialDayTwo = wrapper.findAll('.lx-calendar-day').find((day) => {
      const content = day.find('.lx-calendar-day-content');
      return content.exists() && content.text().trim() === '5';
    });
    expect(specialDayTwo).toBeTruthy();
    const barsWrapperTwo = specialDayTwo.find('.lx-day-layer-bars');
    expect(barsWrapperTwo.exists()).toBe(true);

    const barsTwo = barsWrapperTwo.findAll('.lx-day-layer-bar');
    expect(barsTwo.length).toBe(2);

    const blueBarsTwo = barsTwo.filter((bar) => bar.classes().includes('bar-lx-blue'));
    const redBarsTwo = barsTwo.filter((bar) => bar.classes().includes('bar-lx-red'));
    expect(blueBarsTwo.length).toBe(1);
    expect(redBarsTwo.length).toBe(1);

    // 'three'
    const specialDayThree = wrapper.findAll('.lx-calendar-day').find((day) => {
      const content = day.find('.lx-calendar-day-content');
      return content.exists() && content.text().trim() === '1';
    });
    expect(specialDayThree).toBeTruthy();
    const barsWrapperThree = specialDayThree.find('.lx-day-layer-bars');
    expect(barsWrapperThree.exists()).toBe(true);

    const barsThree = barsWrapperThree.findAll('.lx-day-layer-bar');
    expect(barsThree.length).toBe(1);

    const blackBarsThree = barsThree.filter((bar) => bar.classes().includes('bar-lx-black'));
    expect(blackBarsThree.length).toBe(1);
  });

  describe('locale', () => {
    it('ENG', () => {
      expect(LxDateTimePicker).toBeTruthy();

      wrapper = mount(LxDateTimePicker, {
        props: {
          modelValue: '2025-05-02',
          variant: 'picker',
          locale: {
            locale: 'en-EN',
          },
        },
        global: {
          stubs: ['router-link'],
          directives: {
            ClickAway: dummyClickAway,
          },
        },
      });

      const targetDay = wrapper
        .findAll('.lx-calendar-day-content')
        .find((el) => el.attributes('aria-label')?.includes('Friday, May 2, 2025'));
      expect(targetDay).toBeTruthy();
    });

    it('LV', () => {
      expect(LxDateTimePicker).toBeTruthy();

      wrapper = mount(LxDateTimePicker, {
        props: {
          modelValue: '2025-05-02',
          variant: 'picker',
          locale: {
            locale: 'lv-LV',
          },
        },
        global: {
          stubs: ['router-link'],
          directives: {
            ClickAway: dummyClickAway,
          },
        },
      });

      const targetDay = wrapper
        .findAll('.lx-calendar-day-content')
        .find((el) => el.attributes('aria-label')?.includes('Piektdiena, 2025. gada 2. maijs'));
      expect(targetDay).toBeTruthy();
    });
  });

  // Change tests
  it('modelValue change', async () => {
    expect(LxDateTimePicker).toBeTruthy();

    wrapper = mount(LxDateTimePicker, {
      props: {
        modelValue: '2002-02-18',
      },
      global: {
        stubs: ['router-link'],
        directives: {
          ClickAway: dummyClickAway,
        },
      },
    });
    await wrapper.trigger('');
    expect(wrapper.find('input').element.value).toBe('18.02.2002.');
    await wrapper.setProps({ modelValue: '2002-02-19' });
    await wrapper.trigger('');
    expect(wrapper.find('input').element.value).toBe('19.02.2002.');
  });

  it('modelValue change to null', async () => {
    expect(LxDateTimePicker).toBeTruthy();

    wrapper = mount(LxDateTimePicker, {
      props: {
        modelValue: '2002-02-18',
      },
      global: {
        stubs: ['router-link'],
        directives: {
          ClickAway: dummyClickAway,
        },
      },
    });

    await wrapper.setProps({ modelValue: null });
    expect(wrapper.find('input').element.value).toBe('');
  });

  it('modelValue change to empty string', async () => {
    expect(LxDateTimePicker).toBeTruthy();

    wrapper = mount(LxDateTimePicker, {
      props: {
        modelValue: '2002-02-18',
      },
      global: {
        stubs: ['router-link'],
        directives: {
          ClickAway: dummyClickAway,
        },
      },
    });

    await wrapper.setProps({ modelValue: '' });
    expect(wrapper.find('input').element.value).toBe('');
  });

  it('modelValue change to undefined', async () => {
    expect(LxDateTimePicker).toBeTruthy();

    wrapper = mount(LxDateTimePicker, {
      props: {
        modelValue: '2002-02-18',
      },
      global: {
        stubs: ['router-link'],
        directives: {
          ClickAway: dummyClickAway,
        },
      },
    });

    await wrapper.setProps({ modelValue: undefined });
    expect(wrapper.find('input').element.value).toBe('');
  });

  it('modelValue change to undefined and back to date', async () => {
    expect(LxDateTimePicker).toBeTruthy();

    wrapper = mount(LxDateTimePicker, {
      props: {
        modelValue: '2002-02-18',
      },
      global: {
        stubs: ['router-link'],
        directives: {
          ClickAway: dummyClickAway,
        },
      },
    });

    await wrapper.setProps({ modelValue: undefined });
    expect(wrapper.find('input').element.value).toBe('');
    await wrapper.setProps({ modelValue: '2002-02-18' });
    expect(wrapper.find('input').element.value).toBe('18.02.2002.');
  });

  it('modelValue change to null and back to date', async () => {
    expect(LxDateTimePicker).toBeTruthy();

    wrapper = mount(LxDateTimePicker, {
      props: {
        modelValue: '2002-02-18',
      },
      global: {
        stubs: ['router-link'],
        directives: {
          ClickAway: dummyClickAway,
        },
      },
    });

    await wrapper.setProps({ modelValue: null });
    expect(wrapper.find('input').element.value).toBe('');
    await wrapper.setProps({ modelValue: '2002-02-18' });
    expect(wrapper.find('input').element.value).toBe('18.02.2002.');
  });

  it('modelValue change to empty string and back to empty string', async () => {
    expect(LxDateTimePicker).toBeTruthy();

    wrapper = mount(LxDateTimePicker, {
      props: {
        modelValue: '',
      },
      global: {
        stubs: ['router-link'],
        directives: {
          ClickAway: dummyClickAway,
        },
      },
    });

    await wrapper.trigger('');
    expect(wrapper.find('input').element.value).toBe('');
    await wrapper.setProps({ modelValue: '' });
    await wrapper.trigger('');
    expect(wrapper.find('input').element.value).toBe('');
  });

  it('kind: date, variant: picker', async () => {
    expect(LxDateTimePicker).toBeTruthy();

    wrapper = mount(LxDateTimePicker, {
      props: {
        modelValue: '2002-02-18',
        kind: 'date',
        variant: 'picker',
      },
      global: {
        stubs: ['router-link'],
        directives: {
          ClickAway: dummyClickAway,
        },
      },
    });

    expect(wrapper.find('.lx-calendar-container').exists()).toBe(true);
    expect(wrapper.find('.lx-calendar-header').exists()).toBe(true);
    expect(wrapper.find('.lx-calendar-main').exists()).toBe(true);
    expect(wrapper.find('.lx-calendar-footer').exists()).toBe(true);
    expect(wrapper.find('.lx-calendar-weekdays').exists()).toBe(true);
    expect(wrapper.find('.lx-calendar-weeks').exists()).toBe(true);
  });

  it('date click', async () => {
    expect(LxDateTimePicker).toBeTruthy();

    wrapper = mount(LxDateTimePicker, {
      props: {
        modelValue: '2025-05-13',
        kind: 'date',
        variant: 'picker',
      },
      global: {
        stubs: ['router-link'],
        directives: {
          ClickAway: dummyClickAway,
        },
      },
    });

    const selectedDate = wrapper.findAll('.lx-calendar-day').find((day) => {
      const content = day.find('.lx-calendar-day-content');
      return content.exists() && content.text().trim() === '13';
    });

    expect(selectedDate).toBeTruthy();
    expect(selectedDate.classes()).toContain('lx-selected-day');

    await wrapper
      .findAll('.lx-calendar-day')
      .find((day) => {
        const content = day.find('.lx-calendar-day-content');
        return content.exists() && content.text().trim() === '7';
      })
      .trigger('click');

    const oldSelected = wrapper.findAll('.lx-calendar-day').find((day) => {
      const content = day.find('.lx-calendar-day-content');
      return content.exists() && content.text().trim() === '13';
    });

    expect(oldSelected.classes()).not.toContain('lx-selected-day');

    const newSelected = wrapper.findAll('.lx-calendar-day').find((day) => {
      const content = day.find('.lx-calendar-day-content');
      return content.exists() && content.text().trim() === '7';
    });

    expect(newSelected.classes()).toContain('lx-selected-day');
  });

  it('clear click', async () => {
    expect(LxDateTimePicker).toBeTruthy();

    wrapper = mount(LxDateTimePicker, {
      props: {
        modelValue: '2025-05-13',
        kind: 'date',
        variant: 'picker',
      },
      global: {
        stubs: ['router-link'],
        directives: {
          ClickAway: dummyClickAway,
        },
      },
    });
    const selectedDate = wrapper.findAll('.lx-calendar-day').find((day) => {
      const content = day.find('.lx-calendar-day-content');
      return content.exists() && content.text().trim() === '13';
    });

    expect(selectedDate).toBeTruthy();
    expect(selectedDate.classes()).toContain('lx-selected-day');

    // Find and click clear button
    const clearButtons = wrapper.findAll('.lx-button.lx-button-ghost');
    const clearButton = clearButtons.find(
      (btn) =>
        btn.attributes('title') === 'Attīrīt vērtību' && btn.attributes('aria-label') === 'Attīrīt'
    );
    expect(clearButton).toBeTruthy();
    await clearButton.trigger('click');

    const stillSelected = wrapper
      .findAll('.lx-calendar-day')
      .find((day) => day.classes().includes('lx-selected-day'));
    expect(stillSelected).toBeFalsy();

    const emits = wrapper.emitted('update:modelValue');
    expect(emits).toBeTruthy();
    expect(emits[emits.length - 1][0]).toBe(null);
  });

  it('today click', async () => {
    expect(LxDateTimePicker).toBeTruthy();

    wrapper = mount(LxDateTimePicker, {
      props: {
        modelValue: '2025-04-18',
        variant: 'picker',
        kind: 'date',
      },
      global: {
        stubs: ['router-link'],
        directives: {
          ClickAway: dummyClickAway,
        },
      },
    });

    const monthSelectButton = wrapper.find('.lx-button.lx-calendar-months-select-button');
    expect(monthSelectButton).toBeTruthy();
    expect(monthSelectButton.attributes('aria-label')).toBe('Aprīlis');

    // Find and click today button
    const todayButton = wrapper.find('.lx-button.lx-calendar-return-to-today-button');
    expect(todayButton).toBeTruthy();
    await todayButton.trigger('click');

    const currentMonthName = new Intl.DateTimeFormat('lv-LV', {
      month: 'long',
    }).format(new Date());

    const capitalizedMonthName =
      currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

    expect(monthSelectButton.attributes('aria-label')).toBe(capitalizedMonthName);
  });

  describe('kind time input value normalization', () => {
    function mountTimePicker() {
      return mount(LxDateTimePicker, {
        props: {
          modelValue: null,
          kind: 'time',
          'onUpdate:modelValue': (v) => {
            wrapper.setProps({ modelValue: v });
          },
        },
        global: {
          stubs: ['router-link'],
          directives: { ClickAway: {} },
        },
      });
    }

    const normalizeCases = [
      ['5', '05:00'],
      ['17', '17:00'],
      ['830', '08:30'],
      ['1730', '17:30'],
      ['2:50', '02:50'],
      ['11.11', '11:11'],
      ['11,11', '11:11'],
    ];

    normalizeCases.forEach(([input, expected]) => {
      it(`"${input}" → "${expected}"`, async () => {
        wrapper = mountTimePicker();
        const pickerInput = wrapper.find('.lx-date-time-picker.lx-input-area');
        expect(pickerInput.exists()).toBe(true);

        await pickerInput.setValue(input);
        await pickerInput.trigger('change');

        expect(pickerInput.element.value).toBe(expected);
      });
    });
  });

  describe('kind time-full input value normalization', () => {
    function mountTimePicker() {
      return mount(LxDateTimePicker, {
        props: {
          modelValue: null,
          kind: 'time-full',
          'onUpdate:modelValue': (v) => {
            wrapper.setProps({ modelValue: v });
          },
        },
        global: {
          stubs: ['router-link'],
          directives: { ClickAway: {} },
        },
      });
    }

    const normalizeCases = [
      ['5', '05:00:00'],
      ['17', '17:00:00'],
      ['830', '08:30:00'],
      ['1730', '17:30:00'],
      ['2:50', '02:50:00'],
      ['11.11', '11:11:00'],
      ['11,11', '11:11:00'],
    ];

    normalizeCases.forEach(([input, expected]) => {
      it(`"${input}" → "${expected}"`, async () => {
        wrapper = mountTimePicker();
        const pickerInput = wrapper.find('.lx-date-time-picker.lx-input-area');
        expect(pickerInput.exists()).toBe(true);

        await pickerInput.setValue(input);
        await pickerInput.trigger('change');

        expect(pickerInput.element.value).toBe(expected);
      });
    });
  });

  describe('kind date input value normalization', () => {
    function mountTimePicker() {
      return mount(LxDateTimePicker, {
        props: {
          modelValue: null,
          kind: 'date',
          'onUpdate:modelValue': (v) => {
            wrapper.setProps({ modelValue: v });
          },
        },
        global: {
          stubs: ['router-link'],
          directives: { ClickAway: {} },
        },
      });
    }

    const normalizeCases = [
      ['24112025', '24.11.2025.'],
      ['241125', '24.11.2025.'],
      ['1.1.25 ', '01.01.2025.'],
      ['1.1.5', '01.01.2005.'],
      ['1.1.55', '01.01.2055.'],
      ['1/1/25', '01.01.2025.'],
      ['01-01-25', '01.01.2025.'],
    ];

    normalizeCases.forEach(([input, expected]) => {
      it(`"${input}" → "${expected}"`, async () => {
        wrapper = mountTimePicker();
        const pickerInput = wrapper.find('.lx-date-time-picker.lx-input-area');
        expect(pickerInput.exists()).toBe(true);

        await pickerInput.setValue(input);
        await pickerInput.trigger('change');

        expect(pickerInput.element.value).toBe(expected);
      });
    });
  });

  describe('kind date-time input value normalization', () => {
    function mountTimePicker() {
      return mount(LxDateTimePicker, {
        props: {
          modelValue: null,
          kind: 'date-time',
          'onUpdate:modelValue': (v) => {
            wrapper.setProps({ modelValue: v });
          },
        },
        global: {
          stubs: ['router-link'],
          directives: { ClickAway: {} },
        },
      });
    }

    const normalizeCases = [
      ['24112025 5', '24.11.2025. 05:00'],
      ['241125 17', '24.11.2025. 17:00'],
      ['1.1.25 830', '01.01.2025. 08:30'],
      ['1.1.5 1730', '01.01.2005. 17:30'],
      ['1.1.55 2:50', '01.01.2055. 02:50'],
      ['1/1/25 11.11', '01.01.2025. 11:11'],
      ['01-01-25 11,11', '01.01.2025. 11:11'],
    ];

    normalizeCases.forEach(([input, expected]) => {
      it(`"${input}" → "${expected}"`, async () => {
        wrapper = mountTimePicker();
        const pickerInput = wrapper.find('.lx-date-time-picker.lx-input-area');
        expect(pickerInput.exists()).toBe(true);

        await pickerInput.setValue(input);
        await pickerInput.trigger('change');

        expect(pickerInput.element.value).toBe(expected);
      });
    });
  });

  describe('kind date-time-full input value normalization', () => {
    function mountTimePicker() {
      return mount(LxDateTimePicker, {
        props: {
          modelValue: null,
          kind: 'date-time-full',
          'onUpdate:modelValue': (v) => {
            wrapper.setProps({ modelValue: v });
          },
        },
        global: {
          stubs: ['router-link'],
          directives: { ClickAway: {} },
        },
      });
    }

    const normalizeCases = [
      ['24112025 5', '24.11.2025. 05:00:00'],
      ['241125 17', '24.11.2025. 17:00:00'],
      ['1.1.25 83025', '01.01.2025. 08:30:25'],
      ['1.1.5 173015', '01.01.2005. 17:30:15'],
      ['1.1.55 2:50:5', '01.01.2055. 02:50:05'],
      ['1/1/25 11.11.11', '01.01.2025. 11:11:11'],
      ['01-01-25 11,11,11', '01.01.2025. 11:11:11'],
    ];

    normalizeCases.forEach(([input, expected]) => {
      it(`"${input}" → "${expected}"`, async () => {
        wrapper = mountTimePicker();
        const pickerInput = wrapper.find('.lx-date-time-picker.lx-input-area');
        expect(pickerInput.exists()).toBe(true);

        await pickerInput.setValue(input);
        await pickerInput.trigger('change');

        expect(pickerInput.element.value).toBe(expected);
      });
    });
  });

  describe('kind date input value normalization in curr or pre century when max-date', () => {
    function mountTimePicker() {
      return mount(LxDateTimePicker, {
        props: {
          modelValue: null,
          kind: 'date',
          maxDate: new Date('2030-12-12'),
          'onUpdate:modelValue': (v) => {
            wrapper.setProps({ modelValue: v });
          },
        },
        global: {
          stubs: ['router-link'],
          directives: { ClickAway: {} },
        },
      });
    }

    const normalizeCases = [
      ['241125', '24.11.2025.'],
      ['241130', '24.11.2030.'],
      ['241131', '24.11.1931.'],
    ];

    normalizeCases.forEach(([input, expected]) => {
      it(`"${input}" → "${expected}"`, async () => {
        wrapper = mountTimePicker();
        const pickerInput = wrapper.find('.lx-date-time-picker.lx-input-area');
        expect(pickerInput.exists()).toBe(true);

        await pickerInput.setValue(input);
        await pickerInput.trigger('change');

        expect(pickerInput.element.value).toBe(expected);
      });
    });
  });

  describe('kind date-time input value normalization in curr or pre century when max-date', () => {
    function mountTimePicker() {
      return mount(LxDateTimePicker, {
        props: {
          modelValue: null,
          kind: 'date-time',
          maxDate: new Date('2030-12-12'),
          'onUpdate:modelValue': (v) => {
            wrapper.setProps({ modelValue: v });
          },
        },
        global: {
          stubs: ['router-link'],
          directives: { ClickAway: {} },
        },
      });
    }

    const normalizeCases = [
      ['241125 5', '24.11.2025. 05:00'],
      ['241130 17', '24.11.2030. 17:00'],
      ['241131 830', '24.11.1931. 08:30'],
    ];

    normalizeCases.forEach(([input, expected]) => {
      it(`"${input}" → "${expected}"`, async () => {
        wrapper = mountTimePicker();
        const pickerInput = wrapper.find('.lx-date-time-picker.lx-input-area');
        expect(pickerInput.exists()).toBe(true);

        await pickerInput.setValue(input);
        await pickerInput.trigger('change');

        expect(pickerInput.element.value).toBe(expected);
      });
    });
  });

  describe('kind date-time-full input value normalization in curr or pre century when max-date', () => {
    function mountTimePicker() {
      return mount(LxDateTimePicker, {
        props: {
          modelValue: null,
          kind: 'date-time-full',
          maxDate: new Date('2030-12-12'),
          'onUpdate:modelValue': (v) => {
            wrapper.setProps({ modelValue: v });
          },
        },
        global: {
          stubs: ['router-link'],
          directives: { ClickAway: {} },
        },
      });
    }

    const normalizeCases = [
      ['241125 5', '24.11.2025. 05:00:00'],
      ['241130 17', '24.11.2030. 17:00:00'],
      ['241131 83050', '24.11.1931. 08:30:50'],
    ];

    normalizeCases.forEach(([input, expected]) => {
      it(`"${input}" → "${expected}"`, async () => {
        wrapper = mountTimePicker();
        const pickerInput = wrapper.find('.lx-date-time-picker.lx-input-area');
        expect(pickerInput.exists()).toBe(true);

        await pickerInput.setValue(input);
        await pickerInput.trigger('change');

        expect(pickerInput.element.value).toBe(expected);
      });
    });
  });

  describe('kind date-time pre unix and historical date handling', () => {
    function mountTimePicker() {
      return mount(LxDateTimePicker, {
        props: {
          modelValue: null,
          kind: 'date-time',
          'onUpdate:modelValue': (v) => {
            wrapper.setProps({ modelValue: v });
          },
        },
        global: {
          stubs: ['router-link'],
          directives: { ClickAway: {} },
        },
      });
    }

    const normalizeCases = [
      ['01011965 5', '01.01.1965. 05:00'],
      ['02051935 17', '02.05.1935. 17:00'],
      ['15051920 830', '15.05.1920. 08:30'],
      ['07091820 0000', '07.09.1820. 00:00'],
      ['23111215 00', '23.11.1215. 00:00'],
    ];

    normalizeCases.forEach(([input, expected]) => {
      it(`"${input}" → "${expected}"`, async () => {
        wrapper = mountTimePicker();
        const pickerInput = wrapper.find('.lx-date-time-picker.lx-input-area');
        expect(pickerInput.exists()).toBe(true);

        await pickerInput.setValue(input);
        await pickerInput.trigger('change');

        expect(pickerInput.element.value).toBe(expected);
      });
    });
  });
});
