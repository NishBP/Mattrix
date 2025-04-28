<script setup>
import { defineProps, defineEmits, ref } from 'vue';

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['editUser', 'deleteUser']);

const copySuccess = ref(false);
const copyTimeout = ref(null);

const handleEditUser = () => {
  emit('editUser', props.user);
};

const handleDeleteUser = (event) => {
  event.stopPropagation(); // Prevent opening the edit modal
  emit('deleteUser', props.user);
};

const copyEmail = async (event) => {
    event.stopPropagation(); // Prevent opening the edit modal
    if (!props.user.email) return;
    
    try {
        await navigator.clipboard.writeText(props.user.email);
        copySuccess.value = true;
        if (copyTimeout.value) clearTimeout(copyTimeout.value);
        copyTimeout.value = setTimeout(() => {
            copySuccess.value = false;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy email: ', err);
        alert('Failed to copy email.');
    }
};
</script>

<template>
  <div class="user-card" @click="handleEditUser" role="button">
    <div class="user-info">
      <div class="user-name">{{ user.displayName || '(No Name)' }}</div>
      <div class="user-email">{{ user.email }}</div>
      <div class="user-role">{{ user.role }}</div>
    </div>
    <div class="user-actions">
      <button 
        class="copy-btn"
        @click.stop="copyEmail"
        :title="copySuccess ? 'Email Copied!' : 'Copy Email'"
      >
        <svg v-if="!copySuccess" xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16">
          <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
          <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-clipboard-check-fill text-success" viewBox="0 0 16 16">
          <path d="M6.5 0A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3Zm3 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3Z"/>
          <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1A2.5 2.5 0 0 1 9.5 5h-3A2.5 2.5 0 0 1 4 2.5v-1Zm6.854 7.354-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L7.5 10.793l2.646-2.647a.5.5 0 0 1 .708.708Z"/>
        </svg>
      </button>
      <button class="delete-btn" title="Delete User" @click.stop="handleDeleteUser">
        Delete
      </button>
    </div>
  </div>
</template>

<style scoped>
.user-card {
  background-color: #1a1a1a;
  border: 1px solid #a1a1a1;
  border-radius: 6px;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.user-info {
  flex-grow: 1;
  margin-right: 0.5rem;
  overflow: hidden;
}

.user-name {
  color: white;
  font-size: 0.85rem;
  font-weight: 500;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email, .user-role {
  color: #d9d9d9;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.copy-btn {
  background: none;
  border: none;
  color: #d9d9d9;
  padding: 0.25rem;
  cursor: pointer;
  transition: color 0.2s;
  font-size: 0.75rem;
}

.copy-btn:hover {
  color: white;
}

.delete-btn {
  background-color: #c14748;
  border: none;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
}

.text-success {
  color: #198754 !important;
}
</style>