import { Node } from '@tiptap/core';

const HiddenIdNode = Node.create({
  name: 'hiddenIdNode',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  content: '',

  atom: true,

  parseHTML() {
    return [
      {
        tag: 'div',
      },
    ];
  },

  renderHTML({ node }) {
    const attrs = {
      'data-id': node.attrs.id,
      class: node.attrs.class,
    };
    if (node.attrs.aspect) {
      attrs.style = `width: ${node.attrs.width || 'auto'}; height: ${
        node.attrs.height
      }; aspect-ratio: ${node.attrs.aspect};`;
    }

    return ['div', attrs];
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => ({
          id: element.getAttribute('data-id'),
        }),
        renderHTML: (attributes) => {
          if (attributes.id) {
            return {
              'data-id': attributes.id,
            };
          }
          return {};
        },
      },
      class: {
        default: null,
        parseHTML: (element) => ({
          class: element.getAttribute('class'),
        }),
        renderHTML: (attributes) => {
          if (attributes.class) {
            return {
              class: attributes.class,
            };
          }
          return {};
        },
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
      aspect: {
        default: null,
      },
    };
  },
  addCommands() {
    return {
      createHiddenIdNode:
        (attributes) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: attributes,
          }),
      swapToImage:
        (attributes) =>
        ({ state, dispatch }) => {
          state.doc.descendants((node, pos) => {
            // Check if the node is a hiddenIdNode and has the matching param. data-id
            if (node.type.name === 'hiddenIdNode' && node.attrs.id === attributes.id) {
              // If it is, replace it with an provided image
              const imageNode = state.schema.nodes.image.create({
                src: attributes.src,
                alt: attributes.alt,
                title: attributes.title,
              });
              const transaction = state.tr.replaceWith(pos, pos + node.nodeSize, imageNode);
              // Adding meta, so the transaction won't be added to history (undo will not take this action back)
              transaction.setMeta('addToHistory', false);
              // Dispatch the transaction without setting the selection (need if user continues typing)
              dispatch(transaction);
            }
          });
        },
      removeNode:
        (id) =>
        ({ state, dispatch }) => {
          state.doc.descendants((node, pos) => {
            // Same thing as swapToImage, but instead of replacing, we delete node by id
            if (node.type.name === 'hiddenIdNode' && node.attrs.id === id) {
              const transaction = state.tr.delete(pos, pos + node.nodeSize);
              dispatch(transaction);
            }
          });
        },
      removeAllNodes:
        () =>
        ({ state, dispatch }) => {
          const positions = [];
          state.doc.descendants((node, pos) => {
            if (node.type.name === 'hiddenIdNode') {
              positions.push(pos);
            }
          });

          // Sort positions in descending order and delete nodes (without sorting, it would cause a bug with lost positions)
          positions
            .sort((a, b) => b - a)
            .forEach((pos) => {
              const transaction = state.tr.delete(pos, pos + state.doc.nodeAt(pos).nodeSize);
              dispatch(transaction);
            });
        },
    };
  },
});

export default HiddenIdNode;
