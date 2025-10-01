<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, inject } from 'vue';
import { useElementSize } from '@vueuse/core';

import { Editor, EditorContent } from '@tiptap/vue-3';
import { Heading } from '@tiptap/extension-heading';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import CharacterCount from '@tiptap/extension-character-count';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Markdown } from 'tiptap-markdown';

import PlaceholderData from '@/components/markdownExtensions/PlaceholderData';
import ImageComponent from '@/components/markdownExtensions/Image';
import HiddenIdNode from '@/components/markdownExtensions/Node';

import LxButton from '@/components/Button.vue';
import LxModal from '@/components/Modal.vue';
import LxIcon from '@/components/Icon.vue';
import LxTextInput from '@/components/TextInput.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import LxFileUploader from '@/components/fileUploader/FileUploader.vue';
import LxForm from '@/components/forms/Form.vue';
import LxRow from '@/components/forms/Row.vue';
import LxToolbar from '@/components/Toolbar.vue';
import LxContentSwitcher from '@/components/ContentSwitcher.vue';
import LxToolbarGroup from '@/components/ToolbarGroup.vue';
import LxRichTextDisplay from '@/components/RichTextDisplay.vue';
import LxLoader from '@/components/Loader.vue';

import { isUrl, generateUUID } from '@/utils/stringUtils';
import { checkArrayObjectProperty } from '@/utils/arrayUtils';
import { getDisplayTexts } from '@/utils/generalUtils';
import { formatValue, formatUrl } from '@/utils/formatUtils';

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
  texts: { type: Object, default: () => ({}) },
});
const emits = defineEmits(['update:modelValue', 'notification', 'preparedImage']);

const textsDefault = {
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
  invalidLinkMessage: 'Saite tika ievadīta nekorektā formā!',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

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

const isModalOpen = ref(false);

const uploadedImage = ref();
const fileUploader = ref();
const allowedFileExtensions = ref(['image/*']);
const markdownWrapper = ref();
const imageModalInputType = ref('url');

const rowId = inject('rowId', ref(null));

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

const isHeadingSelected = computed(() => editor.value.isActive('heading'));

const actionDefinitions = computed(() => [
  {
    id: 'Heading1',
    label: displayTexts.value.headingH1,
    active: editor.value.isActive('heading', { level: 1 }),
    level: 1,
  },
  {
    id: 'Heading2',
    label: displayTexts.value.headingH2,
    active: editor.value.isActive('heading', { level: 2 }),
    level: 2,
  },
  {
    id: 'Heading3',
    label: displayTexts.value.headingH3,
    active: editor.value.isActive('heading', { level: 3 }),
    level: 3,
  },
  {
    id: 'Heading4',
    label: displayTexts.value.headingH4,
    active: editor.value.isActive('heading', { level: 4 }),
    level: 4,
  },
  {
    id: 'Heading5',
    label: displayTexts.value.headingH5,
    active: editor.value.isActive('heading', { level: 5 }),
    level: 5,
  },
  {
    id: 'Heading6',
    label: displayTexts.value.headingH6,
    active: editor.value.isActive('heading', { level: 6 }),
    level: 6,
  },
]);

const isDisabled = computed(() => props.disabled);

const characterCount = computed(
  () => editor.value && editor.value.storage.characterCount.characters()
);

const isSelectionEmpty = computed(() => editor.value?.state?.selection?.empty);

const imageInputTypes = computed(() => [
  { id: 'url', name: displayTexts.value.inputTypeUrl },
  { id: 'fileUploader', name: displayTexts.value.inputTypeFile },
]);

const labelledBy = computed(() => props.labelId || rowId.value);

const formatActionsButtons = computed(() => {
  const baseActions = [
    { name: 'bold', icon: 'text-bold', command: 'toggleBold' },
    { name: 'italic', icon: 'text-italic', command: 'toggleItalic' },
    { name: 'underline', icon: 'text-underline', command: 'toggleUnderline' },
    { name: 'strike', icon: 'text-strikethrough', command: 'toggleStrike' },
  ];

  return baseActions.filter((action) => {
    if (action.name === 'underline' && !props.showUnderlineToggle) {
      return false;
    }
    return true;
  });
});

const listActionsButtons = computed(() => [
  {
    name: 'bulleted',
    icon: 'list-bulleted',
    command: 'toggleBulletList',
    isActiveCheck: 'bulletList',
  },
  {
    name: 'numbered',
    icon: 'list-numbered',
    command: 'toggleOrderedList',
    isActiveCheck: 'orderedList',
  },
]);

const colorPickerColors = [
  { name: 'black', var: 'var(--color-data)' },
  { name: 'red', var: 'var(--color-red)' },
  { name: 'orange', var: 'var(--color-orange)' },
  { name: 'yellow', var: 'var(--color-yellow)' },
  { name: 'green', var: 'var(--color-green)' },
  { name: 'teal', var: 'var(--color-teal)' },
  { name: 'blue', var: 'var(--color-blue)' },
  { name: 'purple', var: 'var(--color-purple)' },
  { name: 'label', var: 'var(--color-label)' },
];

function focus() {
  if (!editor.value || isModalOpen.value) {
    return;
  }
  editor.value.commands.focus();
}

function concatEscapedWords(words) {
  const escapedWords = words.map((word) => word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'));
  const joinedWords = escapedWords.join('|');
  return joinedWords;
}

function createEditorExtensions() {
  const ext = [
    Markdown,
    StarterKit.configure({
      heading: false,
    }),
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
    const joinedWords = concatEscapedWords(words);

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

function updateAltText(alt, isBase64) {
  return alt === '' || (isBase64 && inputAlt.value) ? inputAlt.value : alt;
}

function updateTitleText(title, isBase64) {
  return title === '' || (isBase64 && inputTitle.value) ? inputTitle.value : title;
}

function isBase64Image(src) {
  return /^data:image\/.{0,11};base64,/.test(src);
}

function formatImageUrl(src) {
  const idx = src.indexOf('?');
  const formattedUrl = formatUrl(src.slice(0, idx === -1 ? undefined : idx));
  return isUrl(formattedUrl) ? formattedUrl : null;
}

function calculateAspectRatio(width, height) {
  return formatSize(width) / formatSize(height) || 4 / 3;
}

function determineLoaderClass(width, height, containerElementSize) {
  if ((height && formatSize(height) < 30) || (width && formatSize(width) < 30)) {
    return { loaderClass: 'image-loader no-loader', height, width };
  }
  if ((height && formatSize(height) < 100) || (width && formatSize(width) < 100)) {
    return { loaderClass: 'image-loader small', height, width };
  }
  if (width && formatSize(width) > containerElementSize.width.value) {
    return {
      loaderClass: 'image-loader large',
      height: 'auto',
      width: `${containerElementSize.width.value - 35}px`,
    };
  }
  return { loaderClass: 'image-loader default', height, width };
}

function setImage() {
  const { src, alt, title, width, height, isBase64 } = getImageSource();
  const containerElementSize = useElementSize(markdownWrapper);
  const aspect = calculateAspectRatio(width, height);
  const loaderVisualData = determineLoaderClass(width, height, containerElementSize);

  if (!src) {
    emitNotification('noImageGiven');
    return;
  }

  const updatedAlt = updateAltText(alt, isBase64);
  const updatedTitle = updateTitleText(title, isBase64);

  if (isBase64Image(src)) {
    createImageLoader(
      src,
      loaderVisualData.width,
      loaderVisualData.height,
      loaderVisualData.loaderClass,
      updatedAlt,
      updatedTitle,
      aspect
    );
    closeImageModal();
    return;
  }

  if (isNotImage.value) {
    emitNotification('imageNotFound');
    return;
  }

  const formattedUrl = formatImageUrl(src);
  if (!formattedUrl) {
    emitNotification('invalidAdress');
    return;
  }

  editor.value
    .chain()
    .focus()
    .setImage({ src: formattedUrl, alt: updatedAlt, title: updatedTitle })
    .run();
  closeImageModal();
}

function updateEditorExtensions() {
  editor.value.destroy();
  createEditorExtensions();
}

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

watch(inputImage, (n) => {
  const fn = formatUrl(n);
  imageLink.value = isUrl(fn) ? fn : null;
});

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

onMounted(() => {
  createEditorExtensions();
});

onBeforeUnmount(() => {
  editor.value.destroy();
});

defineExpose({ removeImageLoader, removeAllImageLoaders, repleaceImageLoader });
</script>

<template>
  <div :id="props.id" class="lx-field-wrapper" ref="markdownWrapper">
    <!--eslint-disable-next-line vuejs-accessibility/click-events-have-key-events-->
    <div
      v-if="!readOnly"
      class="lx-markdown-text-area-wrapper"
      :data-disabled="isDisabled ? '' : null"
      :data-invalid="invalid ? '' : null"
      @click="focus()"
    >
      <LxToolbar v-if="editor">
        <template #leftArea>
          <LxToolbarGroup class="left-group">
            <LxButton
              icon="undo"
              kind="ghost"
              variant="icon-only"
              :label="displayTexts.undo"
              :disabled="!editor.can().undo() || isDisabled"
              @click="editor.chain().focus().undo().run()"
            />
            <LxButton
              icon="redo"
              kind="ghost"
              variant="icon-only"
              :label="displayTexts.redo"
              :disabled="!editor.can().redo() || isDisabled"
              @click="editor.chain().focus().redo().run()"
            />
          </LxToolbarGroup>

          <LxToolbarGroup class="left-group">
            <LxButton
              v-for="button in formatActionsButtons"
              :key="button.name"
              :icon="button.icon"
              kind="ghost"
              variant="icon-only"
              :label="displayTexts[button.name]"
              :disabled="isSelectionEmpty || isDisabled"
              :active="editor.isActive(button.name)"
              @click="editor.chain().focus()[button.command]().run()"
            />

            <LxDropDownMenu v-if="showColorPicker" :disabled="isSelectionEmpty || isDisabled">
              <LxButton
                icon="color"
                kind="ghost"
                variant="icon-only"
                tabindex="-1"
                :label="displayTexts.color"
                :disabled="isSelectionEmpty || isDisabled"
                :active="editor.isActive('textStyle')"
              />
              <template #panel>
                <ul class="lx-color-list">
                  <li
                    v-for="color in colorPickerColors"
                    :key="color.name"
                    :class="[
                      'lx-color-item',
                      color.name,
                      { 'lx-selected': editor.isActive('textStyle', { color: color.var }) },
                    ]"
                  >
                    <div
                      @click="editor.chain().focus().setColor(color.var).run()"
                      @keydown.enter="editor.chain().focus().setColor(color.var).run()"
                    />
                  </li>
                </ul>
              </template>
            </LxDropDownMenu>
          </LxToolbarGroup>

          <LxToolbarGroup class="left-group">
            <LxDropDownMenu v-if="showHeadingPicker" :disabled="isSelectionEmpty || isDisabled">
              <LxButton
                icon="text-heading"
                kind="ghost"
                variant="icon-only"
                tabindex="-1"
                :label="displayTexts.heading"
                :disabled="isSelectionEmpty || isDisabled"
                :active="isHeadingSelected"
              />
              <template #panel>
                <div class="lx-button-set">
                  <LxButton
                    v-for="action in actionDefinitions"
                    :key="action.id"
                    :label="action.label"
                    tabindex="0"
                    :active="action.active"
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
              v-for="button in listActionsButtons"
              :key="button.name"
              :icon="button.icon"
              kind="ghost"
              variant="icon-only"
              :label="displayTexts[button.name]"
              :disabled="isDisabled"
              :active="editor.isActive(button.isActiveCheck)"
              @click="editor.chain().focus()[button.command]().run()"
            />
          </LxToolbarGroup>

          <LxToolbarGroup v-if="props.showLinkEditor || props.showImagePicker" class="left-group">
            <LxButton
              v-if="props.showLinkEditor"
              icon="link"
              kind="ghost"
              variant="icon-only"
              :label="displayTexts.link"
              :disabled="isSelectionEmpty || isDisabled"
              :active="editor.isActive('link')"
              @click="checkIfOpen()"
            />
            <LxModal
              ref="editUrlModal"
              :label="displayTexts.modalLabel"
              size="s"
              kind="native"
              :button-secondary-visible="true"
              :button-primary-visible="true"
              :button-secondary-label="displayTexts.close"
              :button-primary-label="displayTexts.save"
              :button-secondary-is-cancel="false"
              @secondary-action="checkIfOpen()"
              @primary-action="setLink()"
              @closed="onClosing"
            >
              <p class="lx-description">{{ displayTexts.modalDescription }}</p>
              <LxTextInput
                ref="inputLinkField"
                v-model="inputLink"
                :invalid="isNotLink"
                :invalidation-message="displayTexts.invalidLinkMessage"
              />
            </LxModal>

            <div v-if="props.showImagePicker" class="lx-toolbar-group">
              <LxButton
                icon="image"
                kind="ghost"
                variant="icon-only"
                :label="displayTexts.image"
                :disabled="isDisabled || !isSelectionEmpty"
                :active="editor.isActive('image')"
                @click="openImage()"
              />
              <LxModal
                id="imageModal"
                ref="markdownImageModal"
                :label="displayTexts.imageModalLabel"
                size="s"
                :button-primary-visible="true"
                :button-primary-label="displayTexts.save"
                @primary-action="setImage()"
                :button-secondary-visible="true"
                :button-secondary-label="displayTexts.close"
                :button-secondary-is-cancel="false"
                @secondary-action="closeImageModal()"
                @closed="clearModalVariables()"
              >
                <LxContentSwitcher :items="imageInputTypes" v-model="imageModalInputType" />
                <LxForm :show-header="false" :show-footer="false">
                  <LxRow
                    :label="displayTexts.imageModalLinkDescription"
                    v-if="imageModalInputType === 'url'"
                  >
                    <LxTextInput
                      id="inputImageField"
                      ref="inputImageField"
                      v-model="inputImage"
                      :invalid="isNotImage"
                      :invalidation-message="displayTexts.invalidImageLink"
                    />
                  </LxRow>

                  <LxRow
                    :label="displayTexts.imageModalFileDescription"
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

                  <LxRow :label="displayTexts.imageModalAltDescription">
                    <LxTextInput id="inputAltField" v-model="inputAlt" />
                  </LxRow>

                  <LxRow :label="displayTexts.imageModalTitleDescription">
                    <LxTextInput id="inputTitleField" v-model="inputTitle" />
                  </LxRow>
                </LxForm>
              </LxModal>
            </div>
          </LxToolbarGroup>

          <LxToolbarGroup v-if="props.showPlaceholderPicker" class="left-group">
            <LxDropDownMenu
              :disabled="isDisabled || !checkArrayObjectProperty(dictionary, 'value')"
            >
              <LxButton
                icon="tag"
                kind="ghost"
                variant="icon-only"
                tabindex="-1"
                :label="displayTexts.templatePicker"
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
