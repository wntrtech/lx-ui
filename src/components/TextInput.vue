<script setup lang="ts">
import { shallowRef, computed, onMounted, watch, ref, inject } from 'vue';
import { IMaskDirective as vImask } from 'vue-imask';
import { Money3Component } from 'v-money3';
import LxIcon from '@/components/Icon.vue';
import LxButton from '@/components/Button.vue';
import { generateUUID, isEmail } from '@/utils/stringUtils';
import { flagMap } from '@/utils/flagUtils';
import LxFlag from '@/components/Flag.vue';

import { sanitizeUrl } from '@braintree/sanitize-url';

const props = defineProps({
  id: { type: String, default: () => generateUUID() },
  modelValue: { type: [Number, String], default: null },
  placeholder: { type: String, default: null },
  readOnly: { type: Boolean, default: false },
  convertToString: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  uppercase: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  invalidationMessage: { type: String, default: null },
  maxlength: { type: [Number, String], default: null },
  tooltip: { type: String, default: null },
  mask: {
    type: String,
    default: null,
    validator(value) {
      return value
        ? // @ts-ignore next line
          [
            'default',
            'integer',
            'decimal',
            'gpslat',
            'time',
            'gpslon',
            'personCodeLv',
            'person-code-lv',
            'newbornId',
            'newborn-id',
            'currency',
            'email',
            'numeric',
            'custom',
          ].includes(value)
        : true;
    },
  },
  customMaskValue: {
    type: RegExp,
    default: /./,
  },
  scale: { type: [Number, String], default: 2 },
  signed: { type: Boolean, default: false },
  kind: { type: String, default: 'default' }, // default, password, search, phone
  labelId: { type: String, default: null },
  autocomplete: { type: String, default: 'off' },
  options: {
    type: Object,
    default: () => ({ phone: 'lv' }),
  },
  texts: {
    type: Object,
    default: () => ({
      showPassword: 'Rādīt paroli',
      hidePassword: 'Paslēpt paroli',
    }),
  },
});

// Russia (+7) and Kazakhstan (+7) share the same country code
// The United States (+1) shares its code with Canada and many Caribbean nations.

const flags = flagMap;

const input = shallowRef();
const valueRaw = ref();

function focus() {
  if (input.value !== null && input.value !== undefined) input.value.focus();
}

const emits = defineEmits(['update:modelValue']);

defineExpose({ focus });

const minValueComp = computed(() => 10 ** Number(props.maxlength || 20) - 1);
const maxLengthValue = computed(() => {
  if (!props.maxlength) return null;
  return (props.mask === 'decimal' || props.mask === 'integer') && props.signed
    ? null
    : Number(props.maxlength);
});

const inputMask = computed(() => {
  if (props.kind === 'phone')
    return {
      mask: /^[\d()+-]+$/,
    };

  switch (props.mask) {
    case 'integer':
      return {
        mask: Number,
        scale: 0,
        lazy: false,
        min: props.signed ? 0 - minValueComp.value : 0,
        max: Number.MAX_SAFE_INTEGER,
        format: () => '',
      };
    case 'decimal':
      return {
        mask: Number,
        scale: props.scale,
        min: props.signed ? 0 - minValueComp.value : 0,
        radix: ',',
        mapToRadix: [',', '.'],
        format: () => '',
      };
    case 'personCodeLv':
    case 'person-code-lv':
      return {
        mask: '000000-00000',
        lazy: true,
      };
    case 'newbornId':
    case 'newborn-id':
      return {
        mask: '00000000000/000000000000',
        lazy: true,
      };
    case 'gpslat':
      return {
        mask: Number,
        scale: 5,
        lazy: false,
        max: 90,
        min: -90,
        format: () => '',
      };
    case 'gpslon':
      return {
        mask: Number,
        scale: 5,
        lazy: false,
        max: 180,
        min: -180,
        format: () => '',
      };
    case 'time':
      return {
        mask: '00:00',
        scale: 0,
        lazy: false,
      };
    case 'email':
      return {
        mask: /^\S*@?\S*$/,
      };
    case 'numeric':
      return {
        mask: /^\d+$/,
      };
    case 'custom':
      return {
        mask: props.customMaskValue,
      };
    default:
      return {
        mask: /./,
      };
  }
});

function convertValue(v) {
  if (!props.convertToString) {
    if (
      props.mask === 'integer' ||
      props.mask === 'decimal' ||
      props.mask === 'gpslat' ||
      props.mask === 'gpslon'
    ) {
      return v?.length ? Number(v) : null;
    }
  }
  return v;
}

const model = computed({
  get() {
    return props.modelValue;
  },
  set(valueVal) {
    emits('update:modelValue', valueVal);
  },
});

const lastVal = ref();

function rewriteValue(regEx, oldVal, newVal) {
  if (!regEx.test(newVal[newVal.length - 1])) {
    if (lastVal.value !== oldVal) {
      lastVal.value = newVal;
      model.value = oldVal;
    }
  }
}

function onAccept(e) {
  const maskRef = e.detail;
  let v = maskRef.unmaskedValue;

  v = convertValue(v);

  valueRaw.value = maskRef.value;
  if (props.mask !== 'decimal' || maskRef.value.slice(-1) !== ',') {
    model.value = v;
  }
}

function maskUpdate() {
  const mask = input?.value?.maskRef;
  if (mask) {
    mask.typedValue = model.value;
    // Ref: https://github.com/uNmAnNeR/imaskjs/issues/61#issuecomment-391050350
  }
}

const maxLengthComp = computed(() => 10 ** Number(props.maxlength) - 1);

const config = computed(() => ({
  prefix: '',
  suffix: ' €',
  thousands: '',
  decimal: ',',
  precision: 2,
  disableNegative: !props.signed,
  disabled: false,
  min: null,
  max: maxLengthComp.value,
  allowBlank: true,
  minimumNumberOfCharacters: 0,
  shouldRound: true,
  focusOnRight: false,
}));

// Workaround to show readonly values masked
const forcedMaskedValue = computed(() => {
  if (model.value === null || model.value === '') {
    return '';
  }

  const value = String(model.value);
  switch (props.mask) {
    case 'personCodeLv':
    case 'person-code-lv':
      return `${value.substring(0, 6)}-${value.substring(6)}`;
    case 'newbornId':
    case 'newborn-id':
      return value[11] !== '/' ? `${value.substring(0, 11)}/${value.substring(11)}` : value;
    case 'decimal':
      return value.replace('.', ',');
    case 'currency':
      return value.replace('.', ',') + config.value.suffix;
    case 'gpslat':
      return value.replace('.', ',');
    case 'gpslon':
      return value.replace('.', ',');
    case 'time':
      return value.length > 2 ? `${value.substring(0, 2)}:${value.substring(2)}` : value;
    default:
      return value;
  }
});

const hidePassword = ref(true);

function showPasswordChange() {
  hidePassword.value = !hidePassword.value;
}

function onBlur() {
  if (props.mask === 'decimal' && model.value === '-0') model.value = '0';
  else if (props.mask === 'decimal' && model.value === 0 && valueRaw.value === '-0')
    valueRaw.value = '0';
}

function isReadOnlyEmail() {
  return props.mask === 'email' && props.readOnly && isEmail(model.value);
}

const rowId = inject('rowId', ref(null));
const labelledBy = computed(() => props.labelId || rowId.value);

const sanitizedEmail = computed(() => {
  if (isEmail(model.value)) {
    return sanitizeUrl(`mailto:${model.value}`);
  }
  return '';
});

const inputMode = computed(() => {
  if (props.kind === 'phone') return 'tel';
  switch (props.mask) {
    case 'email':
      return 'email';
    case 'phone':
      return 'tel';
    case 'decimal':
    case 'currency':
      return 'decimal';
    case 'integer':
    case 'gpslat':
    case 'gpslon':
    case 'time':
    case 'personCodeLv':
    case 'person-code-lv':
    case 'newbornId':
    case 'newborn-id':
    case 'numeric':
      return 'numeric';
    default:
      return 'text';
  }
});

watch(
  () => model.value,
  (newVal, oldVal) => {
    if (props.mask === 'email' && newVal !== oldVal) {
      if (newVal?.length > oldVal?.length && !oldVal?.includes('@')) {
        rewriteValue(/[a-zA-Z0-9\u00C0-\u017E.!@#$%&'*+/=?^_`{|}~-]/, oldVal, newVal);
      } else if (
        newVal?.length > oldVal?.length &&
        oldVal?.includes('@') &&
        oldVal?.slice(-1) === '.' &&
        oldVal?.lastIndexOf('.') > oldVal?.indexOf('@')
      ) {
        rewriteValue(/[a-zA-Z0-9\u00C0-\u017E-]/, oldVal, newVal);
      } else if (newVal?.length > oldVal?.length && oldVal?.includes('@')) {
        rewriteValue(/[a-zA-Z0-9\u00C0-\u017E-.]/, oldVal, newVal);
      }
    }
  }
);

watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    if (
      ((props.mask === 'decimal' || props.mask === 'integer') &&
        props.maxlength &&
        props.signed &&
        newValue?.toString()?.charAt(0) === '-' &&
        newValue?.toString().length > Number(props.maxlength) + 1) ||
      ((props.mask === 'decimal' || props.mask === 'integer') &&
        props.maxlength &&
        props.signed &&
        newValue?.toString()?.charAt(0) !== '-' &&
        newValue?.toString().length > Number(props.maxlength))
    ) {
      model.value = oldValue;
      valueRaw.value = oldValue?.toString().replace('.', ',');
    }
    if (maxLengthValue.value && newValue?.toString().length > Number(maxLengthValue.value)) {
      model.value = oldValue;
    } else if (convertValue(newValue) !== convertValue(oldValue)) {
      if (props.mask === 'decimal') {
        valueRaw.value = model.value?.toString().replace('.', ',');
      } else if (props.mask === 'time') {
        let res = '';
        if (newValue?.toString()?.length === 1) res = `${newValue}_:__`;
        else if (newValue?.toString()?.length === 2) res = `${newValue}:__`;
        else if (newValue?.toString()?.length === 3)
          res = `${newValue?.toString().slice(0, 2)}:${newValue?.toString().slice(2)}_`;

        if (res !== valueRaw.value) {
          valueRaw.value = model.value;
        }
      } else if (props.mask === 'currency') {
        const res = `${newValue} €`;
        if (res?.replace('.', ',') !== valueRaw.value) {
          valueRaw.value = model.value;
        }
      } else if (props.kind === 'phone') {
        const res = newValue?.toString()?.replace(/[()-]/g, '');
        if (res !== valueRaw.value) {
          valueRaw.value = model.value;
        }
      } else valueRaw.value = model.value;
    }
  }
);

watch(
  () => props.readOnly,
  (newValue) => {
    if (!newValue) maskUpdate();
  }
);

watch(
  () => [props.mask, input.value],
  (newValue) => {
    const [newMask, newInputValue] = newValue;

    if (newMask && newInputValue?.value) {
      if (newMask !== 'currency') {
        maskUpdate();
        model.value = newInputValue?.value;
      }
    }
  }
);

const matchedFlags = computed(() => {
  const result = [];
  Object.entries(flags)?.forEach(([key, value]) => {
    if (valueRaw.value?.toString()?.startsWith(key)) {
      if (!Array.isArray(value)) result.push(value);
      else value.forEach((val) => result.push(val));
    }
  });
  return result;
});

onMounted(() => {
  maskUpdate();
  if (props.mask === 'decimal') valueRaw.value = props.modelValue?.toString()?.replace('.', ',');
  else valueRaw.value = props.modelValue;

  if (
    model.value &&
    maxLengthValue.value &&
    model.value.toString().length > Number(maxLengthValue.value)
  ) {
    model.value = model.value.toString().substring(0, Number(maxLengthValue.value));
  }
});
</script>
<template>
  <div class="lx-field-wrapper">
    <p
      v-if="readOnly && props.kind !== 'password' && !isReadOnlyEmail()"
      class="lx-data"
      :aria-labelledby="labelledBy"
    >
      {{ forcedMaskedValue }}
      <span
        v-if="
          model === null ||
          model === undefined ||
          (typeof model === 'string' && model?.trim() === '')
        "
        >—</span
      >
    </p>
    <a v-if="isReadOnlyEmail()" :href="sanitizedEmail" :aria-labelledby="labelledBy">{{ model }}</a>
    <div
      class="lx-text-input-wrapper lx-input-wrapper"
      :class="[
        { 'password-mask': kind === 'password' },
        { 'lx-invalid': invalid },
        { 'lx-disabled': disabled },
      ]"
      :data-invalid="invalid ? '' : null"
      v-if="!readOnly"
    >
      <div v-if="invalid" class="lx-invalidation-icon-wrapper">
        <LxIcon customClass="lx-invalidation-icon" value="invalid" />
      </div>
      <div v-if="kind === 'search'" class="lx-input-icon-wrapper">
        <LxIcon customClass="lx-modifier-icon" value="search" />
      </div>
      <div v-if="kind === 'phone'" class="lx-input-flag-wrapper">
        <div
          v-if="matchedFlags?.length > 0"
          :class="[{ 'multiple-flags': matchedFlags?.length > 1 }]"
        >
          <LxFlag v-for="flag in matchedFlags" :key="flag" :value="flag" />
        </div>
        <div v-else>
          <LxFlag :value="options?.phone" />
        </div>
      </div>

      <div class="pseudo-input" />
      <input
        v-if="mask !== 'currency'"
        v-imask="inputMask"
        ref="input"
        :type="props.kind === 'password' && hidePassword ? 'password' : 'text'"
        :autocomplete="autocomplete"
        class="lx-text-input lx-input-area"
        :class="[
          { 'lx-invalid': invalid },
          { 'lx-search-input': kind === 'search' },
          { 'lx-phone-input': kind === 'phone' },
          { 'lx-uppercase': uppercase },
        ]"
        :id="id"
        :value="valueRaw"
        :placeholder="placeholder"
        :aria-invalid="invalid"
        :aria-label="placeholder"
        :disabled="disabled"
        :maxlength="maxLengthValue"
        :title="tooltip"
        :aria-labelledby="labelledBy"
        :inputmode="inputMode"
        @accept="onAccept"
        @blur="onBlur"
      />
      <LxButton
        variant="icon-only"
        kind="ghost"
        :icon="hidePassword ? 'visible' : 'hidden'"
        :disabled="disabled"
        :title="hidePassword ? props.texts.showPassword : props.texts.hidePassword"
        v-if="props.kind === 'password'"
        @click="showPasswordChange()"
      />
      <Money3Component
        v-if="mask === 'currency'"
        v-model="model"
        v-bind="config"
        :disabled="disabled"
        :title="tooltip"
        :placeholder="placeholder"
        class="lx-text-input lx-input-area"
        :class="[{ 'lx-invalid': invalid }, { 'lx-search-input': props.kind === 'search' }]"
      />
    </div>
    <div class="lx-invalidation-message" v-if="invalid && !readOnly">{{ invalidationMessage }}</div>
  </div>
</template>
