import { Node, nodeInputRule, nodePasteRule } from '@tiptap/core';

function findPlaceholder(dictionary, word) {
  return dictionary.find((item) => item.value === word).displayType;
}

function chooseColor(color) {
  switch (color) {
    case 'draft':
    case 'new':
      return 'placeholder-new';
    case 'editing':
    case 'edited':
      return 'placeholder-edit';
    case 'disabling':
    case 'inactive':
      return 'placeholder-delete';
    case 'finishing':
    case 'finished':
      return 'placeholder-finished';
    case 'red':
      return 'placeholder-red';
    case 'green':
      return 'placeholder-green';
    case 'blue':
      return 'placeholder-blue';
    case 'purple':
      return 'placeholder-purple';
    case 'orange':
      return 'placeholder-orange';
    case 'yellow':
      return 'placeholder-yellow';
    default:
      return 'placeholder-label';
  }
}

function getPlaceholderClass(dictionary, word) {
  return chooseColor(findPlaceholder(dictionary, word));
}

const PlaceholderData = Node.create({
  name: 'placeholderData',

  addOptions() {
    return {
      inline: true,
      HTMLAttributes: {
        class: 'my-custom-class',
      },
      regexWords: '',

      dictionary: [{}],
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? 'inline' : 'block';
  },

  draggable: true,

  addAttributes() {
    return {
      class: {
        default: null,
      },
      content: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'data',
        getAttrs: (node) => ({
          content: node.firstChild.data,
        }),
      },
    ];
  },

  renderHTML({ node }) {
    return ['data', { class: node.attrs.class }, node.attrs?.content];
  },

  addCommands() {
    return {
      setPlaceholderData:
        (options) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              content: options.content,
              class: getPlaceholderClass(this.options.dictionary, options.content),
            },
          }),
    };
  },

  addInputRules() {
    const inputRegex = new RegExp(`(${this.options.regexWords})`);

    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: (match) => {
          const [, content] = match;
          const customClass = getPlaceholderClass(this.options.dictionary, content);

          return { content, class: customClass };
        },
      }),
    ];
  },

  addPasteRules() {
    const pasteRegex = new RegExp(`(${this.options.regexWords})`, 'g');
    return [
      nodePasteRule({
        find: pasteRegex,
        type: this.type,
        getAttributes: (match) => {
          const [, content] = match;
          const customClass = getPlaceholderClass(this.options.dictionary, content);

          return { content, class: customClass };
        },
      }),
    ];
  },
});

export default PlaceholderData;
