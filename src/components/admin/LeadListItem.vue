<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  lead: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['viewDetails', 'updateStatus']);

// Functions to emit events would go here if this component had buttons
</script>

<template>
  <div class="lead-list-item mb-2 p-2 border rounded">
    <p><strong>{{ lead.companyName }}</strong> - {{ lead.contactPersonName }}</p>
    <p><small>{{ lead.status }} - Submitted: {{ lead.submissionTimestamp?.toDate().toLocaleDateString() }}</small></p>
    </div>
</template>

<style scoped>
.lead-list-item {
    background-color: var(--bs-tertiary-bg);
    border-color: var(--bs-border-color) !important;
}
</style>
