<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import CharacterCount from '@tiptap/extension-character-count';
import PlaceholderData from '@/components/markdownExtensions/PlaceholderData';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Markdown } from 'tiptap-markdown';
import { isUrl } from '@/utils/stringUtils';
import { checkArrayObjectProperty } from '@/utils/arrayUtils';

import { buildVueDompurifyHTMLDirective } from 'vue-dompurify-html';

import LxButton from '@/components/Button.vue';
import LxModal from '@/components/Modal.vue';
import LxIcon from '@/components/Icon.vue';
import LxTextInput from '@/components/TextInput.vue';
import LxDropDownMenu from '@/components/DropDownMenu.vue';
import { formatValue } from '@/utils/formatUtils';
import LxToolbar from '@/components/Toolbar.vue';
import LxToolbarGroup from '@/components/ToolbarGroup.vue';

const vCleanHtml = buildVueDompurifyHTMLDirective();
const props = defineProps({
  id: { type: String, default: null },
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
  dictionary: { type: Object, default: null },
  texts: {
    type: Object,
    default: () => ({
      undo: 'Atcelt pēdējo darbību',
      redo: 'Atgriezt atcelto darbību',
      bold: 'Treknrakts',
      italic: 'Slīpraksts',
      strikethrough: 'Pārsvītrojums',
      color: 'Krāsas izvēle',
      clear: 'Notīrīt krāsu',
      bulleted: 'Saraksts bez numerācijas',
      numbered: 'Saraksts ar numerāciju',
      link: 'Saite',
      templatePicker: 'Vietturi',
      modalLabel: 'Saites izveidošana',
      modalDescription: 'Pievienot saiti uz:',
      save: 'Saglabāt',
      close: 'Aizvērt',
    }),
  },
});
const emits = defineEmits(['update:modelValue']);

const editor = ref(null);
const text = ref(null);
const maxlengthExceeded = ref(false);

const editUrlModal = ref();
const inputLink = ref();
const inputLinkField = ref();

const outputHtmlText = ref();
const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits('update:modelValue', value);
  },
});

const isDisabled = computed(() => props.disabled);

const characterCount = computed(
  () => editor.value && editor.value.storage.characterCount.characters()
);

const isOpen = ref(false);
function focus() {
  if (!editor.value || isOpen.value) {
    return;
  }
  editor.value.commands.focus();
}
function getHTML() {
  return editor.value.getHTML();
}

function updateHtml() {
  outputHtmlText.value = getHTML();
}

watch(model, (newText) => {
  const textInEditor = editor.value.storage.markdown.getMarkdown();
  if (newText !== textInEditor) {
    editor.value.commands.setContent(newText);
  }

  if (props.maxlength) {
    const remainingCount = props.maxlength - (characterCount.value || 0);
    maxlengthExceeded.value = remainingCount < 0;
  }
  if (props.readOnly) {
    updateHtml();
  }
});
watch(
  () => props.readOnly,
  (newValue) => {
    if (newValue) updateHtml();
  }
);

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
  });

  editor.value.on('update', () => {
    text.value = editor.value.storage.markdown.getMarkdown();
    emits('update:modelValue', text.value);
  });
}

onMounted(() => {
  createEditorExtensions();
});

onBeforeUnmount(() => {
  editor.value.destroy();
});

function updateEditorExtensions() {
  editor.value.destroy();
  createEditorExtensions();
}

watch(
  () => [props.dictionary, props.maxlength],
  () => {
    updateEditorExtensions();
  }
);

function setHTML(html) {
  editor.value.commands.setContent(html);
}
const isSelectionEmpty = computed(() => editor.value?.state?.selection?.empty);
const InvalidMessage = ref('Saite tika ievadīta nekorektā formā!');
const isNotLink = ref(false);
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
  if (!isOpen.value) {
    isOpen.value = !isOpen.value;
    editUrlModal.value.open();
    nextTick(() => {
      inputLinkField.value.focus();
    });
  } else {
    editUrlModal.value.close();
  }
}
function onClosing() {
  isOpen.value = false;
}

defineExpose({ getHTML, setHTML });

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
</script>

<template>
  <div class="lx-field-wrapper">
    <div
      v-show="!readOnly"
      class="lx-markdown-text-area-wrapper"
      @click="focus()"
      @keydown="focus()"
      :data-disabled="isDisabled ? '' : null"
      :data-invalid="invalid ? '' : null"
    >
      <LxToolbar v-if="editor">
        <template #leftArea>
          <LxToolbarGroup class="left-group">
            <lx-button
              icon="undo"
              kind="ghost"
              variant="icon-only"
              :title="texts.undo"
              @click="editor.chain().focus().undo().run()"
              :disabled="!editor.can().undo() || isDisabled"
            />
            <lx-button
              icon="redo"
              kind="ghost"
              variant="icon-only"
              :title="texts.redo"
              @click="editor.chain().focus().redo().run()"
              :disabled="!editor.can().redo() || isDisabled"
            />
          </LxToolbarGroup>
          <LxToolbarGroup class="left-group">
            <lx-button
              icon="text-bold"
              kind="ghost"
              variant="icon-only"
              :title="texts.bold"
              @click="editor.chain().focus().toggleBold().run()"
              :disabled="isSelectionEmpty || isDisabled"
              :active="editor.isActive('bold')"
            />
            <lx-button
              icon="text-italic"
              kind="ghost"
              variant="icon-only"
              :title="texts.italic"
              @click="editor.chain().focus().toggleItalic().run()"
              :disabled="isSelectionEmpty || isDisabled"
              :active="editor.isActive('italic')"
            />
            <lx-button
              icon="text-strikethrough"
              kind="ghost"
              variant="icon-only"
              :title="texts.strikethrough"
              @click="editor.chain().focus().toggleStrike().run()"
              :disabled="isSelectionEmpty || isDisabled"
              :active="editor.isActive('strike')"
            />
            <LxDropDownMenu v-if="showColorPicker">
              <lx-button
                icon="color"
                kind="ghost"
                variant="icon-only"
                :title="texts.color"
                :disabled="isSelectionEmpty || isDisabled"
                :active="editor.isActive('textStyle')"
              />
              <template #panel>
                <ul>
                  <li
                    class="lx-color-item red"
                    :class="[
                      {
                        'lx-selected': editor.isActive('textStyle', { color: 'var(--color-red)' }),
                      },
                    ]"
                  >
                    <div @click="editor.chain().focus().setColor('var(--color-red)').run()"></div>
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
                    <div @click="editor.chain().focus().setColor('var(--color-green)').run()"></div>
                  </li>
                  <li
                    class="lx-color-item teal"
                    :class="[
                      {
                        'lx-selected': editor.isActive('textStyle', { color: 'var(--color-teal)' }),
                      },
                    ]"
                  >
                    <div @click="editor.chain().focus().setColor('var(--color-teal)').run()"></div>
                  </li>
                  <li
                    class="lx-color-item blue"
                    :class="[
                      {
                        'lx-selected': editor.isActive('textStyle', { color: 'var(--color-blue)' }),
                      },
                    ]"
                  >
                    <div @click="editor.chain().focus().setColor('var(--color-blue)').run()"></div>
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
                    <div @click="editor.chain().focus().setColor('var(--color-label)').run()"></div>
                  </li>
                  <li>
                    <LxButton
                      icon="clear"
                      variant="icon-only"
                      kind="ghost"
                      :title="texts.clear"
                      @click="editor.chain().focus().unsetColor().run()"
                    />
                  </li>
                </ul>
              </template>
            </LxDropDownMenu>
          </LxToolbarGroup>
          <LxToolbarGroup class="left-group">
            <lx-button
              icon="list-bulleted"
              kind="ghost"
              variant="icon-only"
              :title="texts.bulleted"
              @click="editor.chain().focus().toggleBulletList().run()"
              :disabled="isDisabled"
              :active="editor.isActive('bulletList')"
            />
            <lx-button
              icon="list-numbered"
              kind="ghost"
              variant="icon-only"
              :title="texts.numbered"
              @click="editor.chain().focus().toggleOrderedList().run()"
              :disabled="isDisabled"
              :active="editor.isActive('orderedList')"
            />
          </LxToolbarGroup>
          <LxToolbarGroup v-if="props.showLinkEditor" class="left-group">
            <lx-button
              icon="link"
              kind="ghost"
              variant="icon-only"
              :title="texts.link"
              @click="checkIfOpen()"
              :disabled="isSelectionEmpty || isDisabled"
              :active="editor.isActive('link')"
            />
            <lx-modal
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
              <lx-text-input
                ref="inputLinkField"
                v-model="inputLink"
                :invalid="isNotLink"
                :invalidation-message="InvalidMessage"
              >
              </lx-text-input>
            </lx-modal>
          </LxToolbarGroup>
          <LxToolbarGroup v-if="props.showPlaceholderPicker" class="left-group">
            <LxDropDownMenu>
              <LxButton
                icon="tag"
                kind="ghost"
                variant="icon-only"
                :title="texts.templatePicker"
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
      <lx-icon v-show="invalid" customClass="lx-invalidation-icon" value="invalid" />
      <editor-content
        class="lx-markdown-text-area"
        :class="{ 'lx-invalid': invalid }"
        :style="{ 'min-height': rows * 2.2 + 'rem' }"
        :editor="editor"
        :title="tooltip"
      />
      <div
        v-if="editor && maxlength"
        class="lx-text-length"
        :class="[{ 'lx-exceeded': maxlengthExceeded }]"
      >
        {{ characterCount }}/{{ maxlength }}
      </div>
    </div>
    <div v-if="readOnly" v-clean-html="outputHtmlText"></div>
    <div class="lx-invalidation-message" v-if="readOnly === false">{{ invalidationMessage }}</div>
  </div>
</template>
