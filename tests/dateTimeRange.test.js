// @ts-nocheck
import { test, expect, describe, afterEach } from 'vitest';
import LxDateTimeRange from '@/components/datePicker/DateTimeRange.vue';
import { mount } from '@vue/test-utils';
import { directive } from 'vue3-click-away';

let wrapper;

afterEach(() => {
  if (wrapper) {
    wrapper.unmount();
  }
});

describe.each([
  ['date', '.lx-calendar-container', '.lx-calendar-day-content', /\d+/],
  ['month', '.lx-calendar-container', '.lx-calendar-month', /Janv\./i],
  ['year', '.lx-calendar-container', '.lx-calendar-year', /\d+/],
  ['month-year', '.lx-calendar-container', '.lx-calendar-month', /Janv\./i],
  ['quarters', '.lx-calendar-container', '.lx-calendar-quarter', /^Q1$/],
  ['legacy', '.lx-calendar-container', '.lx-calendar-day-content', /\d+/],
])('LxDateTimePicker kind %s', (kind, container, unit, regEx) => {
  test('LxDateTimePicker test  container renders and there is item to select', async () => {
    expect(LxDateTimeRange).toBeTruthy();

    wrapper = mount(LxDateTimeRange, {
      props: {
        kind,
      },
      global: {
        stubs: ['router-link'],
        directives: {
          ClickAway: directive,
        },
      },
    });

    const pickerInput = wrapper.find('.lx-date-time-picker.lx-input-area');
    expect(pickerInput.exists()).toBe(true);

    await pickerInput.trigger('keydown', { key: 'ArrowDown' });

    const calendarContainer = wrapper.find(container);
    expect(calendarContainer.exists()).toBe(true);

    const unitContent = calendarContainer.find(unit);
    expect(unitContent.exists()).toBe(true);
    expect(unitContent.text()).toMatch(regEx);
  });
});
