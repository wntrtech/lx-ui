<script setup>
import { computed } from 'vue';
import { safeString } from '@/utils/stringUtils';
import LxInfoWrapper from '@/components/InfoWrapper.vue';
import LxAvatar from '@/components/Avatar.vue';
import LxIcon from '@/components/Icon.vue';
import LxRow from '@/components/forms/Row.vue';

const props = defineProps({
  value: {
    type: [String, Object],
    default: null,
  },
  size: {
    type: String,
    default: 'm' /* 's', 'm', 'l' */,
  },
  kind: {
    type: String,
    default: 'default' /* 'default', 'icon' */,
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
  maxLength: {
    type: Number,
    default: 3,
  },
  texts: {
    type: Object,
    required: false,
    default: () => ({
      name: 'Vārds, uzvārds',
      description: 'Apraksts',
      role: 'Loma',
      institution: 'Iestāde',
    }),
  },
});

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
    if (!val[props.firstNameAttribute] || !val[props.lastNameAttribute]) {
      return null;
    }
    return `${val[props.firstNameAttribute]} ${val[props.lastNameAttribute]}`;
  }

  return null;
}

const name = computed(() => formatName(props.value));

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

const filteredValues = computed(() => {
  if (!Array.isArray(props.value) || props.value.length === 0) return '';
  const filteredItems = props.value.filter(
    (item) => (item.firstName && item.lastName) || item.description
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

const nameKey = computed(() => safeString(name.value));

const showAvatar = computed(() => nameKey.value && props.kind === 'default');
const showDescription = computed(() => description.value && props.size === 'l');
</script>
<template>
  <div class="lx-person-display-wrapper">
    <LxInfoWrapper>
      <div
        v-if="!showMultiple"
        class="lx-person-display"
        :class="[{ 'lx-person-display-s': size === 's' }, { 'lx-person-display-l': size === 'l' }]"
      >
        <LxAvatar v-if="showAvatar" :value="nameKey" :size="size" />

        <template v-if="!showAvatar">
          <template v-if="description && size !== 'l'">
            <div
              class="lx-user-icon-display"
              :class="[
                { 'lx-user-icon-display-s': size === 's' },
                { 'lx-user-icon-display-l': size === 'l' },
              ]"
              :size="size"
            >
              <LxIcon value="user" />
            </div>
            {{ '—' }}
          </template>
          <template v-else-if="showDescription">
            <LxIcon value="user" />
          </template>
          <template v-else>
            {{ '—' }}
          </template>
        </template>

        <template v-if="variant !== 'icon-only'">
          <p class="lx-data lx-person-display-name">{{ name }}</p>
          <p class="lx-description" v-if="showDescription">{{ description }}</p>
        </template>
      </div>
      <div class="lx-person-display-multiple" v-if="showMultiple">
        <template v-for="(item, index) in displayItems" :key="index">
          <LxAvatar
            v-if="item.firstName && item.lastName"
            :value="safeString(formatName(item))"
            :size="size"
          />
          <div
            v-else-if="item.description"
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
        <div class="overflow" v-if="displayItems.length < filteredValues.length">
          <p>
            <span :class="[{ plus: filteredValues.length - maxLength + 1 >= 10 }]">+</span
            >{{ filteredValues.length - maxLength + 1 }}
          </p>
        </div>
      </div>
      <template #panel>
        <template v-if="!showMultiple">
          <LxRow :label="texts.name" v-if="name"
            ><p class="lx-data">{{ name }}</p></LxRow
          >
          <LxRow :label="texts.description" v-if="description && description !== '—'"
            ><p class="lx-data">{{ description }}</p></LxRow
          >
          <LxRow :label="texts.role" v-if="role && name"
            ><p class="lx-data">{{ role }}</p></LxRow
          >
          <LxRow :label="texts.institution" v-if="institution && name"
            ><p class="lx-data">{{ institution }}</p></LxRow
          >
        </template>
        <template v-else>
          <LxRow v-for="i in tooltipItems.slice(0, 10)" :key="i" :show-label="false">
            <p class="lx-data">
              {{ i.firstName && i.lastName ? formatName(i) : i.description }}
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
