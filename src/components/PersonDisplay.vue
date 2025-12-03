<script setup>
import { computed } from 'vue';
import { safeString } from '@/utils/stringUtils';
import LxInfoWrapper from '@/components/InfoWrapper.vue';
import LxAvatar from '@/components/Avatar.vue';
import LxIcon from '@/components/Icon.vue';
import LxRow from '@/components/forms/Row.vue';
import { getDisplayTexts } from '@/utils/generalUtils';

const props = defineProps({
  value: {
    type: [String, Object],
    default: null,
  },
  name: {
    type: String,
    default: null,
  },
  size: {
    type: String,
    default: 'm' /* 's', 'm', 'l' */,
  },
  variant: {
    type: String,
    default: 'full' /* 'full', 'icon-only'  */,
  },
  description: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    default: null,
  },
  institution: {
    type: String,
    default: null,
  },
  icon: {
    type: String,
    default: null,
  },
  iconSet: {
    type: String,
    default: null,
  },
  idAttribute: {
    type: String,
    default: 'id',
  },
  nameAttribute: {
    type: String,
    default: 'name',
  },
  firstNameAttribute: {
    type: String,
    default: 'firstName',
  },
  lastNameAttribute: {
    type: String,
    default: 'lastName',
  },
  descriptionAttribute: {
    type: String,
    default: 'description',
  },
  roleAttribute: {
    type: String,
    default: 'role',
  },
  institutionAttribute: {
    type: String,
    default: 'institution',
  },
  iconAttribute: {
    type: String,
    default: 'icon',
  },
  iconSetAttribute: {
    type: String,
    default: 'iconSet',
  },
  maxLength: {
    type: Number,
    default: 3,
  },
  customAttributes: {
    type: Array,
    default: () => [],
  },
  customRole: {
    type: String,
    default: null,
  },
  texts: { type: Object, default: () => ({}) },
});

const textsDefault = {
  name: 'Vārds, uzvārds',
  description: 'Apraksts',
  role: 'Loma',
  institution: 'Iestāde',
};

const displayTexts = computed(() => getDisplayTexts(props.texts, textsDefault));

function formatName(val) {
  if (Array.isArray(val) && val.length > 0) {
    return formatName(val[0]);
  }
  if (val === null || val === undefined) {
    return null;
  }
  if (typeof val === 'string') {
    return val;
  }
  if (typeof val === 'object') {
    if (!val[props.nameAttribute]) {
      if (!val[props.firstNameAttribute] || !val[props.lastNameAttribute]) {
        return null;
      }
      return `${val[props.firstNameAttribute]} ${val[props.lastNameAttribute]}`;
    }
    return val[props.nameAttribute];
  }
  return null;
}

const name = computed(() =>
  props.name && typeof props.value !== 'object' ? props.name : formatName(props.value)
);

const showMultiple = computed(() => {
  if (Array.isArray(props.value)) {
    if (props.value.length > 1) {
      return true;
    }
  }
  return false;
});

const description = computed(() => {
  if (props.description) return props.description;
  if (props.value && typeof props.value === 'object') {
    return props.value[props.descriptionAttribute] ? props.value[props.descriptionAttribute] : '';
  }
  if (props.value && props.size === 'l' && !props.description) {
    return '—';
  }
  return '';
});

const role = computed(() => {
  if (props.role) return props.role;
  if (props.value && typeof props.value === 'object') {
    return props.value[props.roleAttribute] ? props.value[props.roleAttribute] : '';
  }
  return '';
});

const institution = computed(() => {
  if (props.institution) return props.institution;
  if (props.value && typeof props.value === 'object') {
    return props.value[props.institutionAttribute] ? props.value[props.institutionAttribute] : '';
  }
  return '';
});

const icon = computed(() => {
  if (props.icon) return props.icon;
  if (props.value && typeof props.value === 'object') {
    return props.value[props.iconAttribute] ? props.value[props.iconAttribute] : '';
  }
  return '';
});

const iconSet = computed(() => {
  if (props.iconSet) return props.iconSet;
  if (props.value && typeof props.value === 'object') {
    return props.value[props.iconSetAttribute] ? props.value[props.iconSetAttribute] : '';
  }
  return '';
});

const filteredValues = computed(() => {
  if (!Array.isArray(props.value) || props.value.length === 0) return '';
  const filteredItems = props.value.filter(
    (item) =>
      (item[props.firstNameAttribute] && item[props.lastNameAttribute]) ||
      item[props.nameAttribute] ||
      item[props.description]
  );
  return filteredItems;
});

const displayItems = computed(() => {
  if (!Array.isArray(filteredValues.value) || filteredValues.value.length === 0) return '';
  if (filteredValues.value.length <= props.maxLength) {
    return filteredValues.value;
  }
  return filteredValues.value.slice(0, props.maxLength - 1);
});

const tooltipItems = computed(() => {
  if (!Array.isArray(props.value) || props.value.length === 0) return '';
  return filteredValues.value;
});

function getAvatarKey(value) {
  if (typeof value === 'string') {
    if (value) return safeString(value);

    if (props.name) {
      return safeString(props.name);
    }
  }
  if (typeof value === 'object') {
    if (value[props.idAttribute]) {
      return safeString(value[props.idAttribute]);
    }
    if (value[props.nameAttribute]) {
      return safeString(value[props.nameAttribute]);
    }
    if (value[props.firstNameAttribute] && value[props.lastNameAttribute]) {
      return safeString(`${value[props.firstNameAttribute]} ${value[props.lastNameAttribute]}`);
    }
  }
  return null;
}

const showDescription = computed(() => description.value && props.size === 'l');
</script>
<template>
  <div class="lx-person-display-wrapper">
    <LxInfoWrapper :customRole>
      <div
        v-if="!showMultiple"
        class="lx-person-display"
        :class="[
          { 'lx-person-display-s': size === 's' },
          { 'lx-person-display-l': size === 'l' },
          { 'lx-icon-only': variant === 'icon-only' },
        ]"
      >
        <template v-if="!icon">
          <LxAvatar v-if="name" :value="getAvatarKey(value)" :size="size" />
          <div
            v-else-if="description"
            class="lx-user-icon-display"
            :class="[
              { 'lx-user-icon-display-s': size === 's' },
              { 'lx-user-icon-display-l': size === 'l' },
            ]"
            :size="size"
          >
            <LxIcon value="user" :size="size" />
          </div>
        </template>
        <div
          v-else-if="name || description"
          class="lx-person-icon-display"
          :class="[
            { 'lx-person-icon-display-s': size === 's' },
            { 'lx-person-icon-display-l': size === 'l' },
          ]"
          :size="size"
        >
          <LxIcon :value="icon" :iconSet="iconSet" :size="size" />
        </div>

        <template v-if="!name && description && size !== 'l' && variant !== 'icon-only'">
          {{ '—' }}
        </template>

        <template v-if="variant !== 'icon-only'">
          <p class="lx-data lx-person-display-name">
            {{ name }}
          </p>
          <p class="lx-description" v-if="showDescription">{{ description }}</p>
        </template>
        <template v-if="!name && !description">
          <span class="lx-empty-person-value">—</span>
        </template>
      </div>

      <div class="lx-person-display-multiple" v-if="showMultiple">
        <template v-for="(item, index) in displayItems" :key="index">
          <template v-if="!item[iconAttribute]">
            <LxAvatar
              v-if="(item[firstNameAttribute] && item[lastNameAttribute]) || item[nameAttribute]"
              :value="getAvatarKey(item)"
              :size="size"
            />
            <div
              v-else-if="item[descriptionAttribute]"
              class="lx-user-icon-display"
              :class="[
                { 'lx-user-icon-display-s': size === 's' },
                { 'lx-user-icon-display-l': size === 'l' },
              ]"
              :size="size"
            >
              <LxIcon value="user" />
            </div>
          </template>
          <div
            v-else-if="
              (item[firstNameAttribute] && item[lastNameAttribute]) ||
              item[nameAttribute] ||
              item[descriptionAttribute]
            "
            class="lx-person-icon-display"
            :class="[
              { 'lx-person-icon-display-s': size === 's' },
              { 'lx-person-icon-display-l': size === 'l' },
            ]"
            :size="size"
          >
            <LxIcon :value="item[iconAttribute]" :iconSet="item[iconSetAttribute]" :size="size" />
          </div>
        </template>
        <div class="overflow" v-if="displayItems.length < filteredValues.length">
          <p>
            <span :class="[{ plus: filteredValues.length - maxLength + 1 >= 10 }]">+</span
            >{{ filteredValues.length - maxLength + 1 }}
          </p>
        </div>
      </div>
      <template #panel>
        <template
          v-if="
            customAttributes?.length > 0 &&
            value &&
            typeof value === 'object' &&
            !Array.isArray(value)
          "
        >
          <LxRow
            v-for="(key, index) in customAttributes"
            :key="index"
            :label="key?.name"
            v-show="value?.[key?.attributeName]"
          >
            <p class="lx-data">{{ value?.[key?.attributeName] }}</p>
          </LxRow>
        </template>
        <template v-else-if="!showMultiple">
          <LxRow :label="displayTexts.name" v-if="name">
            <p class="lx-data">{{ name }}</p>
          </LxRow>
          <LxRow :label="displayTexts.description" v-if="description && description !== '—'">
            <p class="lx-data">{{ description }}</p>
          </LxRow>
          <LxRow :label="displayTexts.role" v-if="role && name">
            <p class="lx-data">{{ role }}</p>
          </LxRow>
          <LxRow :label="displayTexts.institution" v-if="institution && name">
            <p class="lx-data">{{ institution }}</p>
          </LxRow>
        </template>
        <template v-else>
          <LxRow v-for="i in tooltipItems.slice(0, 10)" :key="i" :hide-label="true">
            <p class="lx-data">
              {{ (i.firstName && i.lastName) || i.name ? formatName(i) : i.description }}
            </p>
          </LxRow>
          <LxRow v-if="filteredValues.length > 10">
            <p class="lx-data">+ {{ filteredValues.length - 10 }}</p>
          </LxRow>
        </template>
      </template>
    </LxInfoWrapper>
  </div>
</template>
