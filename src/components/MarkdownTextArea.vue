<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, inject } from 'vue';
import { Editor, EditorContent } from '@tiptap/vue-3';
import { Heading } from '@tiptap/extension-heading';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';

import CharacterCount from '@tiptap/extension-character-count';
import PlaceholderData from '@/components/markdownExtensions/PlaceholderData';

import ImageComponent from '@/components/markdownExtensions/Image';
import HiddenIdNode from '@/components/markdownExtensions/Node';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Markdown } from 'tiptap-markdown';
import { isUrl, generateUUID } from '@/utils/stringUtils';
import { checkArrayObjectProperty } from '@/utils/arrayUtils';
import { useElementSize } from '@vueuse/core';

import LxButton from '@/components/Button.vue';
import LxModal from '@/components/Modal.vue';
import LxIcon from '@/components/Icon.vue';
import LxTextInput from '@/components/TextInput.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import LxFileUploader from '@/components/fileUploader/FileUploader.vue';
import { formatValue, formatUrl } from '@/utils/formatUtils';
import LxForm from '@/components/forms/Form.vue';
import LxRow from '@/components/forms/Row.vue';
import LxToolbar from '@/components/Toolbar.vue';
import LxContentSwitcher from '@/components/ContentSwitcher.vue';
import LxToolbarGroup from '@/components/ToolbarGroup.vue';
import LxRichTextDisplay from '@/components/RichTextDisplay.vue';
import LxLoader from '@/components/Loader.vue';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  modelValue: { type: String, default: null },
  placeholder: { type: String, default: null },
  rows: { type: Number, default: 3 },
  maxlength: { type: Number, default: null },
  disabled: { type: Boolean, default: false },
  showColorPicker: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  invalidationMessage: { type: String, default: null },
  readOnly: { type: Boolean, default: false },
  showLinkEditor: { type: Boolean, default: true },
  tooltip: { type: String, default: null },
  showPlaceholderPicker: { type: Boolean, default: false },
  showImagePicker: { type: Boolean, default: false },
  showUnderlineToggle: { type: Boolean, default: false },
  showHeadingPicker: { type: Boolean, default: false },
  imageMaxSize: { type: Number, default: 3000000 }, // 3MB
  dictionary: { type: Object, default: null },
  labelId: { type: String, default: null },
  texts: {
    type: Object,
    default: () => ({
      undo: 'Atcelt pēdējo darbību',
      redo: 'Atgriezt atcelto darbību',
      bold: 'Treknraksts',
      italic: 'Slīpraksts',
      underline: 'Pasvītrojums',
      strikethrough: 'Pārsvītrojums',
      color: 'Krāsas izvēle',
      clear: 'Notīrīt krāsu',
      heading: 'Virsraksta izmēra izvēle',
      headingH1: 'Virsraksts 1',
      headingH2: 'Virsraksts 2',
      headingH3: 'Virsraksts 3',
      headingH4: 'Virsraksts 4',
      headingH5: 'Virsraksts 5',
      headingH6: 'Virsraksts 6',
      bulleted: 'Saraksts bez numerācijas',
      numbered: 'Saraksts ar numerāciju',
      link: 'Saite',
      image: 'Attēls',
      templatePicker: 'Vietturi',
      modalLabel: 'Saites izveidošana',
      modalDescription: 'Pievienot saiti uz:',
      save: 'Saglabāt',
      close: 'Aizvērt',
      imageModalLabel: 'Attēla pievienošana',
      imageModalLinkDescription: 'Pievienot attēlu no URL:',
      imageModalAltDescription: 'Attēla alternatīvais nosaukums',
      imageModalTitleDescription: 'Attēla virsraksts',
      invalidImageLink: 'Ievadītais URL nav derīgs',
      chooseFile: 'Izvēlēties attēlu',
      imageModalFileDescription: 'Pievienot attēla datni',
      inputTypeUrl: 'Saite',
      inputTypeFile: 'Datne',
    }),
  },
});
const emits = defineEmits(['update:modelValue', 'notification', 'preparedImage']);

const loading = ref(true);

let headingCounter = 0;
const CustomHeadingWithAutoId = Heading.extend({
  levels: [1, 2, 3, 4, 5, 6],

  onCreate() {
    headingCounter = 0;
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
        parseHTML: (element) => {
          // When parsing existing content, maintain the counter
          const currentId = element.getAttribute('id');
          if (currentId && currentId.startsWith('markdown-section-')) {
            const num = parseInt(currentId.split('-').pop(), 10);
            headingCounter = Math.max(headingCounter, num);
          }
          return currentId;
        },

        renderHTML: (attributes) => {
          if (!attributes.id) {
            headingCounter += 1;
            return { id: `markdown-section-${props.id}-${headingCounter}` };
          }
          return { id: attributes.id };
        },
      },
    };
  },
});
const editor = ref(null);
const text = ref(null);
const maxlengthExceeded = ref(false);

const inputImage = ref();
const inputAlt = ref();
const inputTitle = ref();
const inputImageField = ref();

const imageLink = ref();

const editUrlModal = ref();
const inputLink = ref();
const inputLinkField = ref();
const markdownImageModal = ref();

const isNotLink = ref(false);
const isNotImage = ref(false);

const actionDefinitions = ref([
  {
    id: 'Heading1',
    label: props.texts.headingH1,
    level: 1,
  },
  {
    id: 'Heading2',
    label: props.texts.headingH2,
    level: 2,
  },
  {
    id: 'Heading3',
    label: props.texts.headingH3,
    level: 3,
  },
  {
    id: 'Heading4',
    label: props.texts.headingH4,
    level: 4,
  },
  {
    id: 'Heading5',
    label: props.texts.headingH5,
    level: 5,
  },
  {
    id: 'Heading6',
    label: props.texts.headingH6,
    level: 6,
  },
]);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

watch(inputImage, (n) => {
  const fn = formatUrl(n);
  imageLink.value = isUrl(fn) ? fn : null;
});

const isDisabled = computed(() => props.disabled);

const characterCount = computed(
  () => editor.value && editor.value.storage.characterCount.characters()
);

const isModalOpen = ref(false);

function focus() {
  if (!editor.value || isModalOpen.value) {
    return;
  }
  editor.value.commands.focus();
}

watch(model, (newText) => {
  const textInEditor = editor.value.storage.markdown.getMarkdown();
  if (newText !== textInEditor) {
    editor.value.commands.setContent(newText);
  }
  loading.value = false;
  if (props.maxlength) {
    const remainingCount = props.maxlength - (characterCount.value || 0);
    maxlengthExceeded.value = remainingCount < 0;
  }
});

watch(isDisabled, (disabled) => {
  editor.value.setEditable(!disabled);
});

function concateEscapedWords(words) {
  const escapedWords = words.map((word) => word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'));
  const joinedWords = escapedWords.join('|');
  return joinedWords;
}

function createEditorExtensions() {
  const ext = [
    Markdown,
    StarterKit,
    TextStyle,
    Color,
    ImageComponent,
    CustomHeadingWithAutoId,
    HiddenIdNode,
    Underline,

    Link.configure({
      autolink: false,
      validate: (href) => /^https?:\/\//.test(href),
    }),

    Placeholder.configure({
      placeholder: props.placeholder,
    }),

    CharacterCount.configure({
      limit: props.maxlength,
    }),
  ];

  if (checkArrayObjectProperty(props.dictionary, 'value')) {
    const words = props.dictionary.map((item) => item.value);
    const joinedWords = concateEscapedWords(words);

    ext.push(
      PlaceholderData.configure({
        regexWords: joinedWords,
        dictionary: props.dictionary,
      })
    );
  }

  editor.value = new Editor({
    content: model.value,
    editable: !isDisabled.value,
    extensions: ext,
    injectCSS: false,
  });

  loading.value = false;

  editor.value.on('update', () => {
    text.value = editor.value.storage.markdown.getMarkdown();
    emits('update:modelValue', text.value);
  });
}

const uploadedImage = ref();
const fileUploader = ref();
const allowedFileExtensions = ref(['image/*']);

function clearModalVariables() {
  inputImage.value = null;
  inputAlt.value = null;
  inputTitle.value = null;
  uploadedImage.value = null;
}

function closeImageModal() {
  markdownImageModal.value.close();
  clearModalVariables();
}

function openImage() {
  markdownImageModal.value.open();
  isModalOpen.value = true;
}
const markdownWrapper = ref();

function getImageSource() {
  let src = null;
  let alt = '';
  let title = '';
  let width = null;
  let height = null;
  let isBase64 = false;

  const file = fileUploader.value?.getFiles()[0];
  if (file) {
    if (file.meta?.exif?.['Image Height']?.description) {
      height = file.meta.exif['Image Height'].description;
    }
    if (file.meta?.exif?.['Image Width']?.description) {
      width = file.meta.exif['Image Width'].description;
    }
  }

  if (imageLink.value) {
    src = imageLink.value;
  } else if (uploadedImage.value) {
    src = uploadedImage.value[0].content;
    alt = uploadedImage.value[0].name;
    title = uploadedImage.value[0].name;
    isBase64 = true;
  }

  return { src, alt, title, width, height, isBase64 };
}

function emitNotification(message) {
  emits('notification', message);
}

function createImageLoader(base64, width, height, loaderClass, alt, title, aspect) {
  const id = generateUUID();
  editor.value
    .chain()
    .focus()
    .createHiddenIdNode({ class: loaderClass, id, width, height, aspect })
    .run();
  emits('preparedImage', base64, id, alt, title);
}

function repleaceImageLoader(src, id, alt, title) {
  editor.value
    .chain()
    .swapToImage({
      id,
      src,
      alt,
      title,
    })
    .run();
}
function removeImageLoader(id) {
  editor.value.chain().focus().removeNode(id).run();
}
function removeAllImageLoaders() {
  editor.value.chain().focus().removeAllNodes().run();
}

function formatSize(size) {
  return Number(size?.replace('px', ''));
}

defineExpose({ removeImageLoader, removeAllImageLoaders, repleaceImageLoader });

function setImage() {
  let { src, alt, title, width, height } = getImageSource();
  const { isBase64 } = getImageSource();
  const containerElementSize = useElementSize(markdownWrapper);
  let loaderClass = 'image-loader default';
  const aspect = formatSize(width) / formatSize(height) || 4 / 3;

  if (!src) {
    emitNotification('noImageGiven');
    return;
  }

  if (alt === '' || (isBase64 && inputAlt.value)) {
    alt = inputAlt.value;
  }
  if (title === '' || (isBase64 && inputTitle.value)) {
    title = inputTitle.value;
  }

  if ((height && formatSize(height) < 30) || (width && formatSize(width) < 30)) {
    loaderClass = 'image-loader no-loader';
  } else if ((height && formatSize(height) < 100) || (width && formatSize(width) < 100)) {
    loaderClass = 'image-loader small';
  } else if (width && formatSize(width) > containerElementSize.width.value) {
    width = `${containerElementSize.width.value - 35}px`;
    height = 'auto';
    loaderClass = 'image-loader large';
  }
  const idx = src.indexOf('?');
  const fUrl = formatUrl(src.slice(0, idx === -1 ? undefined : idx));
  if (/^data:image\/.{0,11};base64,/.test(src)) {
    createImageLoader(src, width, height, loaderClass, alt, title, aspect);
    closeImageModal();
    return;
  }
  if (isNotImage.value) {
    emitNotification('imageNotFound');
    return;
  }
  if (isUrl(fUrl)) {
    src = fUrl;
  } else {
    emitNotification('invalidAdress');
    return;
  }

  editor.value.chain().focus().setImage({ src, alt, title }).run();
  closeImageModal();
}

function updateEditorExtensions() {
  editor.value.destroy();
  createEditorExtensions();
}

watch(
  [
    () => [props.dictionary, props.maxlength],
    () => props.imageAllowBase64,
    () => props.imageAllowInline,
    () => props.imageResizable,
  ],
  () => {
    updateEditorExtensions();
  }
);

const isSelectionEmpty = computed(() => editor.value?.state?.selection?.empty);
const InvalidMessage = ref('Saite tika ievadīta nekorektā formā!');

function setLink() {
  isNotLink.value = false;
  const url = inputLink;
  const formatedUrl = formatValue(url.value, 'link');
  // empty
  if (url.value === '' || url.value === undefined || url.value === null) {
    editUrlModal.value.close();
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run();
    inputLink.value = '';
    return;
  }

  if (!isUrl(formatedUrl)) {
    isNotLink.value = true;
    return;
  }
  // update link
  editUrlModal.value.close();
  editor.value.chain().focus().extendMarkRange('link').setLink({ href: formatedUrl }).run();
  inputLink.value = '';
}
function checkIfOpen() {
  if (!isModalOpen.value) {
    isModalOpen.value = !isModalOpen.value;
    editUrlModal.value.open();
    nextTick(() => {
      inputLinkField.value.focus();
    });
  } else {
    editUrlModal.value.close();
  }
}
function onClosing() {
  isModalOpen.value = false;
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

function postPlaceholder(content) {
  editor.value.chain().focus().deleteSelection().setPlaceholderData({ content }).run();
}

function onError(id, error) {
  emitNotification(error);
}

const imageModalInputType = ref('url');

const imageInputTypes = [
  { id: 'url', name: props.texts.inputTypeUrl },
  { id: 'fileUploader', name: props.texts.inputTypeFile },
];

const rowId = inject('rowId', ref(null));
const labelledBy = computed(() => props.labelId || rowId.value);

onMounted(() => {
  createEditorExtensions();
});

onBeforeUnmount(() => {
  editor.value.destroy();
});
</script>

<template>
  <div :id="props.id" class="lx-field-wrapper" ref="markdownWrapper">
    <div
      v-if="!readOnly"
      class="lx-markdown-text-area-wrapper"
      @click="focus()"
      @keydown="focus()"
      :data-disabled="isDisabled ? '' : null"
      :data-invalid="invalid ? '' : null"
    >
      <LxToolbar v-if="editor">
        <template #leftArea>
          <LxToolbarGroup class="left-group">
            <LxButton
              icon="undo"
              kind="ghost"
              variant="icon-only"
              :label="texts.undo"
              @click="editor.chain().focus().undo().run()"
              :disabled="!editor.can().undo() || isDisabled"
            />
            <LxButton
              icon="redo"
              kind="ghost"
              variant="icon-only"
              :label="texts.redo"
              @click="editor.chain().focus().redo().run()"
              :disabled="!editor.can().redo() || isDisabled"
            />
          </LxToolbarGroup>

          <LxToolbarGroup class="left-group">
            <LxButton
              icon="text-bold"
              kind="ghost"
              variant="icon-only"
              :label="texts.bold"
              @click="editor.chain().focus().toggleBold().run()"
              :disabled="isSelectionEmpty || isDisabled"
              :active="editor.isActive('bold')"
            />
            <LxButton
              icon="text-italic"
              kind="ghost"
              variant="icon-only"
              :label="texts.italic"
              @click="editor.chain().focus().toggleItalic().run()"
              :disabled="isSelectionEmpty || isDisabled"
              :active="editor.isActive('italic')"
            />
            <LxButton
              v-if="showUnderlineToggle"
              icon="text-underline"
              kind="ghost"
              variant="icon-only"
              :label="texts.underline"
              @click="editor.chain().focus().toggleUnderline().run()"
              :disabled="isSelectionEmpty || isDisabled"
              :active="editor.isActive('underline')"
            />
            <LxButton
              icon="text-strikethrough"
              kind="ghost"
              variant="icon-only"
              :label="texts.strikethrough"
              @click="editor.chain().focus().toggleStrike().run()"
              :disabled="isSelectionEmpty || isDisabled"
              :active="editor.isActive('strike')"
            />

            <LxDropDownMenu v-if="showColorPicker">
              <LxButton
                icon="color"
                kind="ghost"
                variant="icon-only"
                :label="texts.color"
                :disabled="isSelectionEmpty || isDisabled"
                :active="editor.isActive('textStyle')"
              />
              <template #panel>
                <ul class="lx-color-list">
                  <li
                    class="lx-color-item black"
                    :class="[
                      {
                        'lx-selected': editor.isActive('textStyle', {
                          color: 'var(--color-data)',
                        }),
                      },
                    ]"
                  >
                    <div
                      @click="editor.chain().focus().setColor('var(--color-data)').run()"
                      @keydown.enter="editor.chain().focus().setColor('var(--color-data)').run()"
                    ></div>
                  </li>
                  <li
                    class="lx-color-item red"
                    :class="[
                      {
                        'lx-selected': editor.isActive('textStyle', { color: 'var(--color-red)' }),
                      },
                    ]"
                  >
                    <div
                      @click="editor.chain().focus().setColor('var(--color-red)').run()"
                      @keydown.enter="editor.chain().focus().setColor('var(--color-red)').run()"
                    ></div>
                  </li>
                  <li
                    class="lx-color-item orange"
                    :class="[
                      {
                        'lx-selected': editor.isActive('textStyle', {
                          color: 'var(--color-orange)',
                        }),
                      },
                    ]"
                  >
                    <div
                      @click="editor.chain().focus().setColor('var(--color-orange)').run()"
                      @keydown.enter="editor.chain().focus().setColor('var(--color-orange)').run()"
                    ></div>
                  </li>
                  <li
                    class="lx-color-item yellow"
                    :class="[
                      {
                        'lx-selected': editor.isActive('textStyle', {
                          color: 'var(--color-yellow)',
                        }),
                      },
                    ]"
                  >
                    <div
                      @click="editor.chain().focus().setColor('var(--color-yellow)').run()"
                      @keydown.enter="editor.chain().focus().setColor('var(--color-yellow)').run()"
                    ></div>
                  </li>
                  <li
                    class="lx-color-item green"
                    :class="[
                      {
                        'lx-selected': editor.isActive('textStyle', {
                          color: 'var(--color-green)',
                        }),
                      },
                    ]"
                  >
                    <div
                      @click="editor.chain().focus().setColor('var(--color-green)').run()"
                      @keydown.enter="editor.chain().focus().setColor('var(--color-green)').run()"
                    ></div>
                  </li>
                  <li
                    class="lx-color-item teal"
                    :class="[
                      {
                        'lx-selected': editor.isActive('textStyle', { color: 'var(--color-teal)' }),
                      },
                    ]"
                  >
                    <div
                      @click="editor.chain().focus().setColor('var(--color-teal)').run()"
                      @keydown.enter="editor.chain().focus().setColor('var(--color-teal)').run()"
                    ></div>
                  </li>
                  <li
                    class="lx-color-item blue"
                    :class="[
                      {
                        'lx-selected': editor.isActive('textStyle', { color: 'var(--color-blue)' }),
                      },
                    ]"
                  >
                    <div
                      @click="editor.chain().focus().setColor('var(--color-blue)').run()"
                      @keydown.enter="editor.chain().focus().setColor('var(--color-blue)').run()"
                    ></div>
                  </li>
                  <li
                    class="lx-color-item purple"
                    :class="[
                      {
                        'lx-selected': editor.isActive('textStyle', {
                          color: 'var(--color-purple)',
                        }),
                      },
                    ]"
                  >
                    <div
                      @click="editor.chain().focus().setColor('var(--color-purple)').run()"
                      @keydown.enter="editor.chain().focus().setColor('var(--color-purple)').run()"
                    ></div>
                  </li>
                  <li
                    class="lx-color-item label"
                    :class="[
                      {
                        'lx-selected': editor.isActive('textStyle', {
                          color: 'var(--color-label)',
                        }),
                      },
                    ]"
                  >
                    <div
                      @click="editor.chain().focus().setColor('var(--color-label)').run()"
                      @keydown.enter="editor.chain().focus().setColor('var(--color-label)').run()"
                    ></div>
                  </li>
                </ul>
              </template>
            </LxDropDownMenu>
          </LxToolbarGroup>

          <LxToolbarGroup class="left-group">
            <LxDropDownMenu v-if="showHeadingPicker">
              <LxButton
                icon="text-heading"
                kind="ghost"
                variant="icon-only"
                :label="texts.heading"
                :disabled="isSelectionEmpty || isDisabled"
                :active="editor.isActive('heading')"
              />
              <template #panel>
                <div class="lx-button-set">
                  <LxButton
                    v-for="action in actionDefinitions"
                    :key="action.id"
                    :label="action.label"
                    tabindex="0"
                    :active="editor.isActive('heading', { level: action.level })"
                    @click="
                      editor
                        .chain()
                        .focus()
                        .unsetLink()
                        .toggleHeading({ level: action.level })
                        .run()
                    "
                  />
                </div>
              </template>
            </LxDropDownMenu>

            <LxButton
              icon="list-bulleted"
              kind="ghost"
              variant="icon-only"
              :label="texts.bulleted"
              @click="editor.chain().focus().toggleBulletList().run()"
              :disabled="isDisabled"
              :active="editor.isActive('bulletList')"
            />
            <LxButton
              icon="list-numbered"
              kind="ghost"
              variant="icon-only"
              :label="texts.numbered"
              @click="editor.chain().focus().toggleOrderedList().run()"
              :disabled="isDisabled"
              :active="editor.isActive('orderedList')"
            />
          </LxToolbarGroup>

          <LxToolbarGroup v-if="props.showLinkEditor || props.showImagePicker" class="left-group">
            <LxButton
              v-if="props.showLinkEditor"
              icon="link"
              kind="ghost"
              variant="icon-only"
              :label="texts.link"
              @click="checkIfOpen()"
              :disabled="isSelectionEmpty || isDisabled"
              :active="editor.isActive('link')"
            />
            <LxModal
              ref="editUrlModal"
              :label="texts.modalLabel"
              size="s"
              kind="native"
              :button-secondary-visible="true"
              :button-primary-visible="true"
              @secondary-action="checkIfOpen()"
              @primary-action="setLink()"
              @closed="onClosing"
              :button-secondary-label="texts.close"
              :button-primary-label="texts.save"
              :button-secondary-is-cancel="false"
            >
              <p class="lx-description">{{ texts.modalDescription }}</p>
              <LxTextInput
                ref="inputLinkField"
                v-model="inputLink"
                :invalid="isNotLink"
                :invalidation-message="InvalidMessage"
              >
              </LxTextInput>
            </LxModal>

            <div v-if="props.showImagePicker" class="lx-toolbar-group">
              <LxButton
                icon="image"
                kind="ghost"
                variant="icon-only"
                :label="texts.image"
                :disabled="isDisabled || !isSelectionEmpty"
                :active="editor.isActive('image')"
                @click="openImage()"
              />
              <LxModal
                id="imageModal"
                ref="markdownImageModal"
                :label="texts.imageModalLabel"
                size="s"
                :button-primary-visible="true"
                :button-primary-label="texts.save"
                @primary-action="setImage()"
                :button-secondary-visible="true"
                :button-secondary-label="texts.close"
                :button-secondary-is-cancel="false"
                @secondary-action="closeImageModal()"
                @closed="clearModalVariables()"
              >
                <LxContentSwitcher :items="imageInputTypes" v-model="imageModalInputType" />
                <LxForm :show-header="false" :show-footer="false">
                  <LxRow
                    :label="texts.imageModalLinkDescription"
                    v-if="imageModalInputType === 'url'"
                  >
                    <LxTextInput
                      id="inputImageField"
                      ref="inputImageField"
                      v-model="inputImage"
                      :invalid="isNotImage"
                      :invalidation-message="texts.invalidImageLink"
                    >
                    </LxTextInput>
                  </LxRow>

                  <LxRow
                    :label="texts.imageModalFileDescription"
                    v-if="imageModalInputType === 'fileUploader'"
                  >
                    <LxFileUploader
                      ref="fileUploader"
                      v-model="uploadedImage"
                      data-type="content"
                      :disabled="isDisabled"
                      :draggable="true"
                      :allowedFileExtensions="allowedFileExtensions"
                      :maxFileSize="imageMaxSize"
                      @onError="onError"
                    />
                  </LxRow>

                  <LxRow :label="texts.imageModalAltDescription">
                    <LxTextInput id="inputAltField" v-model="inputAlt" />
                  </LxRow>

                  <LxRow :label="texts.imageModalTitleDescription">
                    <LxTextInput id="inputTitleField" v-model="inputTitle" />
                  </LxRow>
                </LxForm>
              </LxModal>
            </div>
          </LxToolbarGroup>

          <LxToolbarGroup v-if="props.showPlaceholderPicker" class="left-group">
            <LxDropDownMenu>
              <LxButton
                icon="tag"
                kind="ghost"
                variant="icon-only"
                :label="texts.templatePicker"
                :disabled="isDisabled || !checkArrayObjectProperty(dictionary, 'value')"
                :active="editor.isActive('backgroundColor')"
              />
              <template #panel>
                <div
                  class="lx-markdown-tag-item"
                  v-for="item in dictionary"
                  :key="item.id"
                  :title="item?.description"
                  @click="postPlaceholder(item.value)"
                  @keydown.enter="postPlaceholder(item.value)"
                >
                  <p class="lx-data">{{ item?.name }}</p>
                  <div>
                    <p :class="`${chooseColor(item.displayType)}`" class="lx-data">
                      {{ item?.value }}
                    </p>
                  </div>
                </div>
              </template>
            </LxDropDownMenu>
          </LxToolbarGroup>
        </template>
      </LxToolbar>

      <div
        class="lx-input-wrapper"
        :class="[{ 'lx-invalid': invalid }, { 'lx-disabled': disabled }]"
      >
        <div class="pseudo-input" />
        <editor-content
          class="lx-markdown-text-area lx-input-area"
          :style="{ 'min-height': rows * 2.2 + 'rem' }"
          :editor="editor"
          :title="tooltip"
          role="textbox"
          :aria-invalid="invalid"
          :aria-labelledby="labelledBy"
        />

        <div v-if="invalid" class="lx-invalidation-icon-wrapper">
          <LxIcon customClass="lx-invalidation-icon" value="invalid" />
        </div>
      </div>

      <div
        v-if="editor && maxlength"
        class="lx-text-length"
        :class="[{ 'lx-exceeded': maxlengthExceeded }]"
      >
        {{ characterCount }}/{{ maxlength }}
      </div>
      <div class="lx-invalidation-message" v-if="invalid && !readOnly">
        {{ invalidationMessage }}
      </div>
    </div>

    <article id="test-id-loader" v-if="loading" class="lx-article">
      <LxLoader :loading="loading" />
    </article>

    <LxRichTextDisplay v-if="readOnly" :id="props.id" :value="model" />
  </div>
</template>
