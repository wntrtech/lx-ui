<script setup lang="ts">
import { computed, onMounted, watch, ref, inject } from 'vue';
import { IMaskDirective as vImask } from 'vue-imask';
import { Money3Component } from 'v-money3';
import LxIcon from '@/components/Icon.vue';
import LxButton from '@/components/Button.vue';
import { generateUUID, isEmail } from '@/utils/stringUtils';
import { flagMap } from '@/utils/flagUtils';
import LxFlag from '@/components/Flag.vue';
import { getDisplayTexts, isDefined } from '@/utils/generalUtils';
import { PHONE_MAX_LENGTH_BY_PREFIX } from '@/constants';
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
    default: () => ({ phone: 'lv', locale: null }),
  },
  texts: { type: Object, default: () => ({}) },
});

const textsDefault = {
  showPassword: 'Rādīt paroli',
  hidePassword: 'Paslēpt paroli',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

const emits = defineEmits(['update:modelValue']);

// Russia (+7) and Kazakhstan (+7) share the same country code
// The United States (+1) shares its code with Canada and many Caribbean nations.

const flags = flagMap;

const input = ref();
const valueRaw = ref();

function focus() {
  if (input.value !== null && input.value !== undefined) input.value.focus();
}

const minValueComp = computed(() => 10 ** Number(props.maxlength || 20) - 1);

function findBestPrefix(value) {
  const prefixes = Array.from(PHONE_MAX_LENGTH_BY_PREFIX.keys()).sort(
    (a, b) => b.length - a.length
  );
  return prefixes.find((p) => value?.startsWith(p)) ?? null;
}

const maxLengthValue = computed(() => {
  const baseMax = isDefined(props.maxlength) ? Number(props.maxlength) : null;
  if (props.kind === 'phone') {
    if (isDefined(baseMax)) {
      return baseMax;
    }
    const resultingLength = PHONE_MAX_LENGTH_BY_PREFIX.get(findBestPrefix(valueRaw.value));
    return resultingLength ?? null;
  }
  if ((props.mask === 'integer' || props.mask === 'decimal') && props.signed) {
    if (baseMax == null) {
      return null;
    }
    return baseMax + 1;
  }
  if (isDefined(baseMax)) {
    return baseMax;
  }

  return null;
});

const inputMask = computed(() => {
  if (props.kind === 'phone')
    return {
      mask: /^(?:\(\+|\+)?[\d()-]*$/,
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
        radix: ',',
        mapToRadix: [',', '.'],
        format: () => '',
      };
    case 'gpslon':
      return {
        mask: Number,
        scale: 5,
        lazy: false,
        max: 180,
        min: -180,
        radix: ',',
        mapToRadix: [',', '.'],
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

const isDecimalLikeMask = computed(() => ['decimal', 'gpslat', 'gpslon'].includes(props.mask));

function convertValue(v) {
  if (!props.convertToString) {
    if (
      props.mask === 'integer' ||
      props.mask === 'decimal' ||
      props.mask === 'gpslat' ||
      props.mask === 'gpslon' ||
      props.mask === 'numeric'
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
  if (isDecimalLikeMask.value || maskRef.value.slice(-1) !== ',') {
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
  allowBlank: false,
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
  if (props.mask === 'decimal' && model.value === '-0') {
    model.value = '0';
  } else if (props.mask === 'decimal' && model.value === 0 && valueRaw.value === '-0') {
    valueRaw.value = '0';
  }
}

function isReadOnlyEmail() {
  return props.mask === 'email' && props.readOnly && isEmail(model.value);
}

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

function isDecimalOrInteger() {
  return props.mask === 'decimal' || props.mask === 'integer';
}

function isInvalidSignedLength(newValue) {
  return (
    isDecimalOrInteger() &&
    props.maxlength &&
    props.signed &&
    ((newValue?.toString()?.charAt(0) === '-' &&
      newValue?.toString().length > Number(props.maxlength) + 1) ||
      (newValue?.toString()?.charAt(0) !== '-' &&
        newValue?.toString().length > Number(props.maxlength)))
  );
}

function revertToOldValue(oldValue) {
  model.value = oldValue;
  valueRaw.value = oldValue?.toString().replace('.', ',');
}

function isExceedingMaxLength(newValue) {
  return maxLengthValue.value && newValue?.toString().length > Number(maxLengthValue.value);
}

function formatTimeValue(newValue) {
  let res = '';
  const strValue = newValue?.toString();
  if (strValue?.length === 1) res = `${strValue}_:__`;
  else if (strValue?.length === 2) res = `${strValue}:__`;
  else if (strValue?.length === 3) res = `${strValue.slice(0, 2)}:${strValue.slice(2)}_`;

  return res !== valueRaw.value ? model.value : valueRaw.value;
}

function formatCurrencyValue(newValue) {
  const res = `${newValue} €`;
  return res?.replace('.', ',') !== valueRaw.value ? model.value?.toString() : valueRaw.value;
}

function formatPhoneValue(newValue) {
  const res = newValue?.toString()?.replace(/[()-]/g, '');
  return res !== valueRaw.value ? model.value?.toString() : valueRaw.value;
}

function updateValueRaw(newValue) {
  if (isDecimalLikeMask.value) {
    valueRaw.value = model.value?.toString().replace('.', ',');
  } else if (props.mask === 'time') {
    valueRaw.value = formatTimeValue(newValue);
  } else if (props.mask === 'currency') {
    valueRaw.value = formatCurrencyValue(newValue);
  } else if (props.kind === 'phone') {
    valueRaw.value = formatPhoneValue(newValue);
  } else {
    valueRaw.value = model.value?.toString();
  }
}

watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    if (isInvalidSignedLength(newValue)) {
      revertToOldValue(oldValue);
      return;
    }

    if (isExceedingMaxLength(newValue)) {
      model.value = oldValue;
      return;
    }

    if (convertValue(newValue) !== convertValue(oldValue)) {
      updateValueRaw(newValue);
    } else {
      valueRaw.value =
        props.mask === 'decimal' ? newValue?.toString()?.replace('.', ',') : newValue?.toString();
    }
  },
  { immediate: true }
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
      }
    }
  },
  { immediate: true }
);

onMounted(() => {
  maskUpdate();
  if (isDecimalLikeMask.value) {
    valueRaw.value = props.modelValue?.toString()?.replace('.', ',');
  } else {
    valueRaw.value = props.modelValue?.toString();
  }

  if (
    model.value &&
    maxLengthValue.value &&
    model.value.toString().length > Number(maxLengthValue.value)
  ) {
    model.value = model.value.toString().substring(0, Number(maxLengthValue.value));
  }
});

defineExpose({ focus });
</script>
<template>
  <div class="lx-field-wrapper">
    <p v-if="readOnly && props.kind !== 'password'" class="lx-data" :aria-labelledby="labelledBy">
      <a v-if="isReadOnlyEmail()" class="lx-text-input-link" :href="sanitizedEmail">{{ model }}</a>
      <template v-else>
        {{ forcedMaskedValue }}
        <span
          v-if="
            model === null ||
            model === undefined ||
            (typeof model === 'string' && model?.trim() === '')
          "
          >—</span
        >
      </template>
    </p>
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
          <LxFlag
            v-for="flag in matchedFlags"
            :key="flag"
            :value="flag"
            :locale="options?.locale"
          />
        </div>
        <div v-else>
          <LxFlag :value="options?.phone" :locale="options?.locale" />
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
        :label="hidePassword ? displayTexts.showPassword : displayTexts.hidePassword"
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
