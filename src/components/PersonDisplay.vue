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
    return props.value[props.descriptionAttribute] ? props.value[props.descriptionAttribute] : '—';
  }
  if (props.role) return props.role;
  if (props.institution) return props.institution;
  return '—';
});

const role = computed(() => {
  if (props.role) return props.role;
  if (props.role && typeof props.value === 'object') {
    return props.value[props.roleAttribute] ? props.value[props.roleAttribute] : '—';
  }
  return '—';
});

const institution = computed(() => {
  if (props.institution) return props.institution;
  if (props.institution && typeof props.value === 'object') {
    return props.value[props.institution] ? props.value[props.institution] : '—';
  }
  return '—';
});

const displayItems = computed(() => {
  if (!Array.isArray(props.value) || props.value.length === 0) return '—';
  if (props.value.length <= props.maxLength) {
    return props.value;
  }
  return props.value.slice(0, props.maxLength - 1);
});
const tooltipItems = computed(() => {
  if (!Array.isArray(props.value) || props.value.length === 0) return '—';
  if (props.value.length <= 10) return props.value;
  return props.value.slice(0, 10);
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
        <LxIcon v-if="!showAvatar" value="user" />
        <template v-if="variant !== 'icon-only'">
          <p class="lx-data">{{ name }}</p>
          <p class="lx-description" v-if="showDescription">{{ description }}</p>
        </template>
      </div>
      <div class="lx-person-display-multiple" v-if="showMultiple">
        <LxAvatar
          v-for="i in displayItems"
          :key="i"
          :value="safeString(formatName(i))"
          :size="size"
        />
        <div class="overflow" v-if="displayItems.length < value.length">
          <p>
            <span :class="[{ plus: value.length - maxLength + 1 >= 10 }]">+</span
            >{{ value.length - maxLength + 1 }}
          </p>
        </div>
      </div>
      <template #panel>
        <template v-if="!showMultiple">
          <LxRow :label="texts.name"
            ><p class="lx-data">{{ name }}</p></LxRow
          >
          <LxRow :label="texts.description" v-if="description !== '—'"
            ><p class="lx-data">{{ description }}</p></LxRow
          >
          <LxRow :label="texts.role" v-if="role !== '—'"
            ><p class="lx-data">{{ role }}</p></LxRow
          >
          <LxRow :label="texts.institution" v-if="institution !== '—'"
            ><p class="lx-data">{{ institution }}</p></LxRow
          >
        </template>
        <template v-else>
          <LxRow v-for="i in tooltipItems" :key="i" :show-label="false"
            ><p class="lx-data">{{ formatName(i) }}</p></LxRow
          >
          <LxRow v-if="value.length > 10">
            <p class="lx-data">+ {{ value.length - tooltipItems.length }}</p>
          </LxRow>
        </template>
      </template>
    </LxInfoWrapper>
  </div>
</template>
