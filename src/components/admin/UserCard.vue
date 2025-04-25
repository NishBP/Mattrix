<script setup>
import { defineProps, defineEmits, ref } from 'vue';

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['editUser']);

const copySuccess = ref(false);
const copyTimeout = ref(null);

const handleEditUser = () => {
  emit('editUser', props.user);
};

const copyEmail = async () => {
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
        alert('Failed to copy email.'); // Simple feedback
    }
};

const getAccountStatusClass = (status) => {
    return status === 'Verified' ? 'text-success' : 'text-warning';
};
const getAccountStatusText = (status) => {
    return status === 'Verified' ? 'Verified' : 'Not Verified';
};

</script>

<template>
  <div class="user-card card card-body mb-2 shadow-sm" @click="handleEditUser" role="button">
    <div class="d-flex justify-content-between align-items-start">
      <div class="me-2 text-truncate">
        <h6 class="mb-0 text-truncate fw-medium" :title="user.displayName">{{ user.displayName || '(No Name)' }}</h6>
        <small class="text-muted d-block text-truncate" :title="user.email">{{ user.email }}</small>
        <small class="text-muted d-block">{{ user.role }}</small>
      </div>
      <div class="text-end flex-shrink-0">
         <span :class="['badge', user.isActive ? 'bg-success-subtle text-success-emphasis' : 'bg-danger-subtle text-danger-emphasis']">
            {{ user.isActive ? 'Active' : 'Inactive' }}
         </span>
         <small :class="['d-block mt-1', getAccountStatusClass(user.accountStatus)]" :title="`Account Status: ${getAccountStatusText(user.accountStatus)}`">
             {{ getAccountStatusText(user.accountStatus) }}
         </small>
         <button
            class="btn btn-link btn-sm p-0 mt-1 text-decoration-none"
            @click.stop="copyEmail"
            :title="copySuccess ? 'Email Copied!' : 'Copy Email'">
             <svg v-if="!copySuccess" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-clipboard align-middle" viewBox="0 0 16 16">
                 <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                 <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
             </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-clipboard-check-fill text-success align-middle" viewBox="0 0 16 16">
                 <path d="M6.5 0A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3Zm3 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3Z"/>
                 <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1A2.5 2.5 0 0 1 9.5 5h-3A2.5 2.5 0 0 1 4 2.5v-1Zm6.854 7.354-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L7.5 10.793l2.646-2.647a.5.5 0 0 1 .708.708Z"/>
             </svg>
          </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-card {
  background-color: var(--bs-tertiary-bg);
  border: 1px solid var(--bs-border-color);
  padding: 0.75rem;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease-in-out;
  cursor: pointer;
}
.user-card:hover {
  background-color: var(--bs-secondary-bg); /* Slightly darker on hover */
   transform: translateY(-1px);
   box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}

.user-card h6 {
    color: var(--bs-emphasis-color);
    font-size: 0.9rem;
}
.user-card small {
    font-size: 0.8rem;
    color: var(--bs-light-emphasis) !important; /* Ensure muted color */
}
.user-card .badge {
    font-size: 0.7rem;
    padding: 0.25em 0.4em;
}
.text-success { color: #198754 !important; }
.text-warning { color: #ffc107 !important; }

.bg-success-subtle { background-color: rgba(25, 135, 84, 0.15) !important; }
.text-success-emphasis { color: #198754 !important; font-weight: var(--font-weight-medium); }
.bg-danger-subtle { background-color: rgba(220, 53, 69, 0.1) !important; }
.text-danger-emphasis { color: #dc3545 !important; font-weight: var(--font-weight-medium); }

.btn-link {
    color: var(--bs-light-emphasis);
}
.btn-link:hover {
    color: var(--bs-link-color);
}
</style>
