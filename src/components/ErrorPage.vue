<script setup lang="ts">
import { computed } from 'vue';
import LxIllustration from '@/components/Illustration.vue';
import LxButton from '@/components/Button.vue';

const props = defineProps({
  kind: { type: String, default: '400' },
  icon: { type: String, default: null },
  title: { type: String, default: null },
  description: { type: String, default: null },
  actionDefinitions: { type: Array, default: () => [] },
  texts: {
    type: Object,
    default: () => ({
      defaultError400: {
        title: 'Notika negaidīta kļūda',
        description:
          'Šķiet, ka pieprasījums bija nepareizs. Lūdzu, pārbaudiet ievadīto informāciju un mēģiniet vēlreiz.',
      },
      defaultError401: {
        title: 'Lapa pieejama tikai autorizētiem lietotājiem',
        description: 'Pieeja liegta! Lai piekļūtu šai lapai, jāautorizējas.',
      },
      defaultError403: {
        title: 'Pietrūkst tiesību, lai piekļūtu šai lapai',
        description: 'Pieeja liegta! Lai piekļūtu šai lapai, nepieciešamas papildu tiesības.',
      },
      defaultError404: {
        title: 'Lapa nav atrasta',
        description:
          'Jūsu meklētā lapa nav atrasta. Lūdzu, pārbaudiet ievadīto informāciju un mēģiniet vēlreiz!',
      },
      defaultError500: {
        title: 'Notika negaidīta servera kļūda',
        description: 'Nedaudz uzgaidiet un mēģiniet vēlreiz!',
      },
      defaultErrorSessionTimeout: {
        title: 'Iestājies sesijas noilgums',
        description:
          'Jūsu sesija ir beigusies. Lai turpinātu darbu, autorizējieties sistēmā vēlreiz!',
      },
    }),
  },
});

const pictogram = computed(() => {
  if (props.icon) {
    return props.icon;
  }
  switch (props.kind) {
    case '400':
      return 'error';
    case '401':
      return 'lock';
    case '403':
      return 'lock';
    case '404':
      return 'not-found';
    case '500':
      return 'error';
    case 'sessionTimeout':
      return 'timer';
    default:
      return 'error';
  }
});

const kindSanitized = computed(() => `${props.kind.charAt(0).toUpperCase()}${props.kind.slice(1)}`);

const emits = defineEmits(['actionClick']);
function actionClicked(actionName) {
  emits('actionClick', actionName);
}
const titleText = computed(() => {
  if (props.title !== null) {
    return props.title;
  }
  const name = `defaultError${kindSanitized.value}`;
  return props.texts[name].title;
});
const titleDescription = computed(() => {
  if (props.description !== null) {
    return props.description;
  }
  const name = `defaultError${kindSanitized.value}`;
  return props?.texts[name]?.description;
});
</script>
<template>
  <article class="lx-error-landing">
    <div class="lx-header lx-error">
      <LxIllustration class="lx-illustration" :value="pictogram" />
      <div class="heading-1">{{ titleText }}</div>
      <div class="lx-description">
        <p>{{ titleDescription }}</p>
      </div>
    </div>
    <div class="lx-button-set">
      <slot name="toolbar"></slot>
      <div class="lx-error-action-definitions" v-if="actionDefinitions.length >= 1">
        <LxButton
          v-for="action in actionDefinitions"
          :key="action.id"
          :label="action.name"
          :kind="action.kind"
          variant="default"
          tabindex="0"
          :icon="action.icon"
          :title="action.label"
          :destructive="action.destructive"
          :disabled="action.disabled"
          @click="actionClicked(action.id)"
        />
      </div>
    </div>
  </article>
</template>
