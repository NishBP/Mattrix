<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: 'Confirm Action',
  },
  message: {
    type: String,
    default: 'Are you sure?',
  },
  confirmText: {
    type: String,
    default: 'Confirm',
  },
  cancelText: {
    type: String,
    default: 'Cancel',
  },
  // Add props for button variants if needed (e.g., confirmVariant: 'danger')
});

const emit = defineEmits(['confirm', 'cancel']);

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<template>
  <div class="modal fade show d-block confirmation-dialog" tabindex="-1" style="background-color: rgba(0,0,0,0.7);">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="btn-close btn-close-white" @click="handleCancel" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>{{ message }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="handleCancel">
            {{ cancelText }}
          </button>
          <button type="button" class="btn btn-danger" @click="handleConfirm"> {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.confirmation-dialog .modal-content {
    background-color: var(--bs-secondary-bg);
    border: 1px solid var(--bs-border-color);
    color: var(--bs-body-color);
}
.confirmation-dialog .modal-header,
.confirmation-dialog .modal-footer {
    border-bottom-color: var(--bs-border-color);
    border-top-color: var(--bs-border-color);
}
.confirmation-dialog .modal-title {
    color: var(--bs-emphasis-color);
}
.btn-close-white {
    filter: invert(1) grayscale(100%) brightness(200%);
}

/* Ensure button colors are appropriate */
.btn-danger {
     --bs-btn-color: #fff;
     --bs-btn-bg: #dc3545;
     --bs-btn-border-color: #dc3545;
     --bs-btn-hover-bg: #bb2d3b;
     --bs-btn-hover-border-color: #b02a37;
}
.btn-secondary {
    --bs-btn-color: #fff;
    --bs-btn-bg: #6c757d;
    --bs-btn-border-color: #6c757d;
    --bs-btn-hover-bg: #5c636a;
    --bs-btn-hover-border-color: #565e64;
}

</style>
