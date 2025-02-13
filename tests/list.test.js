import { test, expect, afterEach } from 'vitest';
import LxList from '@/components/list/List.vue';
import { mount, RouterLinkStub } from '@vue/test-utils';

let wrapper;

afterEach(() => {
  if (wrapper) {
    wrapper.unmount();
  }
});

test('LxList default elements', () => {
  expect(LxList).toBeTruthy();

  wrapper = mount(LxList, {
    props: {
      items: [
        {
          id: 1,
          name: 'Test 1',
          group: 1,
          description: 'Test description 1',
        },
        {
          id: 2,
          name: 'Test 2',
          group: 1,
          description: 'Test description 2',
        },
        {
          id: 3,
          name: 'Test 3',
          group: 2,
          description: 'Test description 3',
        },
      ],
      listType: '1',
      kind: 'default',
      idAttribute: 'id',
      primaryAttribute: 'name',
      groupAttribute: 'group',
    },
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });

  // Check the number of items
  const draggableElements = wrapper.findAll('ul.lx-list > li');
  expect(draggableElements.length).toBe(3);

  // Check the labels of the items
  const labels = wrapper.findAll('.lx-primary');
  expect(labels.length).toBe(3);
  expect(labels[0].text()).toBe('Test 1');
  expect(labels[1].text()).toBe('Test 2');
  expect(labels[2].text()).toBe('Test 3');

  // Check the descriptions of the items
  const descriptions = wrapper.findAll('.lx-secondary');
  expect(descriptions.length).toBe(3);
  expect(descriptions[0].text()).toBe('Test description 1');
  expect(descriptions[1].text()).toBe('Test description 2');
  expect(descriptions[2].text()).toBe('Test description 3');
});
