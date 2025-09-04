import { test, expect, afterEach } from 'vitest';
import LxDataVisualizer from '@/components/DataVisualizer.vue';
import { mount, RouterLinkStub } from '@vue/test-utils';

let wrapper;

afterEach(() => {
  if (wrapper) {
    wrapper.unmount();
  }
});

test('LxDataVisualizer items', () => {
  expect(LxDataVisualizer).toBeTruthy();

  wrapper = mount(LxDataVisualizer, {
    props: {
      items: [
        { id: 'one', name: 'one', value: 1 },
        { id: 'two', name: 'two', value: 2 },
        { id: 'three', name: 'three', value: 3 },
      ],
    },
  });

  // process.stdout.write(`${wrapper.html()}\n`);
  const bars = wrapper.findAll('.bar');
  expect(bars.length).toBe(3);
});

test('LxDataVisualizer nameAttribute, valueAttribute', () => {
  expect(LxDataVisualizer).toBeTruthy();

  wrapper = mount(LxDataVisualizer, {
    props: {
      items: [
        { id: 'one', realName: 'one', valueInt: 1 },
        { id: 'two', realName: 'two', valueInt: 2 },
        { id: 'three', realName: 'three', valueInt: 3 },
      ],
      nameAttribute: 'realName',
      valueAttribute: 'valueInt',
    },
  });

  const bars = wrapper.findAll('.bar-name');
  expect(bars[0].text()).toBe('one');
  expect(bars[1].text()).toBe('two');
  expect(bars[2].text()).toBe('three');
});

test('LxDataVisualizer colorAttribute', () => {
  expect(LxDataVisualizer).toBeTruthy();

  wrapper = mount(LxDataVisualizer, {
    props: {
      items: [
        { id: 'one', name: 'one', value: 1, colorValue: 'red' },
        { id: 'two', name: 'two', value: 2 },
        { id: 'three', name: 'three', value: 3, colorValue: 'good' },
      ],
      colorAttribute: 'colorValue',
    },
  });

  const bars = wrapper.findAll('.bar');
  expect(bars[0].attributes().style).toContain('--bar-color: var(--color-red)');
  expect(bars[1].attributes().style).toContain('--bar-color: var(--color-data)');
  expect(bars[2].attributes().style).toContain('--bar-color: var(--color-good)');
});

test('LxDataVisualizer showValues', async () => {
  expect(LxDataVisualizer).toBeTruthy();

  wrapper = mount(LxDataVisualizer, {
    props: {
      items: [
        { id: 'one', name: 'one', value: 1 },
        { id: 'two', name: 'two', value: 2 },
        { id: 'three', name: 'three', value: 3 },
      ],
      showValues: 'always',
    },
  });

  const bars = wrapper.findAll('.bar');
  expect(bars[0].text()).toBe('1');
  expect(bars[1].text()).toBe('2');
  expect(bars[2].text()).toBe('3');
  await wrapper.vm.$nextTick();
  await wrapper.setProps({ showValues: 'never' });
  expect(bars[0].text()).toBeFalsy();
  expect(bars[1].text()).toBeFalsy();
  expect(bars[2].text()).toBeFalsy();
});

test('LxDataVisualizer showLegend', async () => {
  expect(LxDataVisualizer).toBeTruthy();

  wrapper = mount(LxDataVisualizer, {
    props: {
      items: [
        { id: 'one', name: 'one', value: 1 },
        { id: 'two', name: 'two', value: 2 },
        { id: 'three', name: 'three', value: 3 },
      ],
      thresholds: [{ id: 'small', min: 1, max: 100 }],
      showLegend: true,
    },
  });

  let legend = wrapper.find('.lx-legend');
  expect(legend.exists()).toBe(true);
  await wrapper.vm.$nextTick();
  await wrapper.setProps({ showLegend: false });
  legend = wrapper.find('.lx-legend');
  expect(legend.exists()).toBe(false);
});

test('LxDataVisualizer legend content', () => {
  expect(LxDataVisualizer).toBeTruthy();

  wrapper = mount(LxDataVisualizer, {
    props: {
      items: [{ id: 'one', name: 'one', value: 1 }],
      thresholds: [
        { id: 'small', max: 100 },
        { id: 'medium', min: 101, max: 200 },
        { id: 'large', min: 201 },
      ],
      showLegend: true,
    },
  });

  const legend = wrapper.findAll('.legend-item');
  expect(legend.length).toBe(3);
  expect(legend[0].text()).toBe('līdz 100');
  expect(legend[1].text()).toBe('101 - 200');
  expect(legend[2].text()).toBe('no 201');
});

test('LxDataVisualizer threshold coloring 1', () => {
  expect(LxDataVisualizer).toBeTruthy();

  wrapper = mount(LxDataVisualizer, {
    props: {
      items: [
        { id: 'one', name: 'one', value: 10 },
        { id: 'two', name: 'two', value: 300 },
        { id: 'three', name: 'three', value: 500 },
      ],
      thresholds: [
        { id: 'small', max: 100, color: 'red' },
        { id: 'medium', min: 101, max: 400, color: 'purple' },
        { id: 'large', min: 400, color: 'teal' },
      ],
    },
  });

  const bars = wrapper.findAll('.bar');
  expect(bars[0].attributes().style).toContain('--bar-color: var(--color-red)');
  expect(bars[1].attributes().style).toContain('--bar-color: var(--color-purple)');
  expect(bars[2].attributes().style).toContain('--bar-color: var(--color-teal)');
});

test('LxDataVisualizer threshold coloring 2', () => {
  expect(LxDataVisualizer).toBeTruthy();

  wrapper = mount(LxDataVisualizer, {
    props: {
      items: [
        { id: 'one', name: 'one', value: 200 },
        { id: 'two', name: 'two', value: 300 },
        { id: 'three', name: 'three', value: 500 },
      ],
      thresholds: [
        { id: 'small', max: 250, color: 'red' },
        { id: 'medium', min: 101, max: 500, color: 'purple' },
        { id: 'large', min: 300, color: 'teal' },
      ],
    },
  });

  const bars = wrapper.findAll('.bar');
  expect(bars[0].attributes().style).toContain('--bar-color: var(--color-purple)');
  expect(bars[1].attributes().style).toContain('--bar-color: var(--color-teal)');
  expect(bars[2].attributes().style).toContain('--bar-color: var(--color-teal)');
});

test('LxDataVisualizer threshold coloring 3', () => {
  expect(LxDataVisualizer).toBeTruthy();

  wrapper = mount(LxDataVisualizer, {
    props: {
      items: [
        { id: 'one', name: 'one', value: 200 },
        { id: 'two', name: 'two', value: 250 },
        { id: 'three', name: 'three', value: 1000 },
      ],
      thresholds: [
        { id: 'small', max: 250, color: 'red' },
        { id: 'medium', min: 250, max: 500, color: 'good', excludes: 'min' },
        { id: 'medium', min: 600, max: 1000, color: 'good', excludes: 'max' },
      ],
    },
  });

  const bars = wrapper.findAll('.bar');
  expect(bars[0].attributes().style).toContain('--bar-color: var(--color-red)');
  expect(bars[1].attributes().style).toContain('--bar-color: var(--color-red)');
  expect(bars[2].attributes().style).toContain('--bar-color: var(--color-data)');
});

test('LxDataVisualizer texts', () => {
  expect(LxDataVisualizer).toBeTruthy();

  wrapper = mount(LxDataVisualizer, {
    props: {
      items: [
        { id: 'one', name: 'one', value: 200 },
        { id: 'two', name: 'two', value: 250 },
        { id: 'three', name: 'three', value: 1000 },
      ],
      texts: { graph: 'Graph', table: 'Table' },
    },
  });

  const items = wrapper.findAll('.lx-content-switcher-item');
  expect(items[0].text()).toBe('Graph');
  expect(items[1].text()).toBe('Table');
});

test('LxDataVisualizer contentSwitcher', async () => {
  expect(LxDataVisualizer).toBeTruthy();

  wrapper = mount(LxDataVisualizer, {
    props: {
      items: [
        { id: 'one', name: 'one', value: 200 },
        { id: 'two', name: 'two', value: 250 },
        { id: 'three', name: 'three', value: 1000 },
      ],
    },
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });

  const items = wrapper.findAll('.lx-content-switcher-item');
  let dataGrid = wrapper.find('.lx-data-grid');
  expect(dataGrid.exists()).toBe(false);

  await items[1].trigger('click');

  dataGrid = wrapper.find('.lx-data-grid');
  expect(dataGrid.exists()).toBe(true);
});
