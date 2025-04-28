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
  <div class="modal-overlay">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="close-button" @click="handleCancel">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p>{{ message }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn cancel-btn" @click="handleCancel">
            {{ cancelText }}
          </button>
          <button type="button" class="btn confirm-btn" @click="handleConfirm">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-dialog {
  width: 100%;
  max-width: 500px;
  margin: 1.75rem;
}

.modal-content {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  margin: 0;
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
}

.close-button:hover {
  color: white;
}

.modal-body {
  padding: 1rem;
  color: var(--text-color);
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn {
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 50px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
}

.confirm-btn {
  background-color: var(--status-red);
  color: white;
}
</style>