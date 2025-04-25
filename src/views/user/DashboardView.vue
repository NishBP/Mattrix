<script setup>
import { useAuthStore } from '@/stores/authStore';
import { computed } from 'vue';

// Use the authentication store
const authStore = useAuthStore();

// Computed property for a welcome message
const welcomeMessage = computed(() => {
  if (authStore.userInfo) {
    return `Welcome, ${authStore.userInfo.displayName || authStore.userInfo.email}!`;
  }
  return 'Welcome!';
});

// Function to handle logout
const handleLogout = () => {
  authStore.logout();
};
</script>

<template>
  <div class="user-dashboard container py-5">
    <div class="card p-4 p-md-5 text-center shadow-sm">
        <div class="card-body">
            <h1 class="h3 fw-semibold mb-3">{{ welcomeMessage }}</h1>
            <p class="text-light-emphasis mb-4">
                This is your dashboard. Planogram management features will be available here in the future.
            </p>

            <button class="btn btn-outline-light px-4" @click="handleLogout" :disabled="authStore.isLoading">
                 <span v-if="authStore.isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                 <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-right me-1 align-text-bottom" viewBox="0 0 16 16">
                   <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                   <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                 </svg>
                {{ authStore.isLoading ? 'Logging out...' : 'Logout' }}
            </button>
        </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles specific to User Dashboard */
.user-dashboard {
  max-width: 700px; /* Limit width for better readability */
  margin-top: 5vh; /* Add some top margin */
}

.card {
  background-color: var(--bs-secondary-bg); /* Use a slightly lighter dark shade */
  border: 1px solid var(--bs-border-color);
  border-radius: 0.75rem;
}

.btn-outline-light {
    --bs-btn-color: var(--bs-emphasis-color);
    --bs-btn-border-color: var(--bs-border-color);
    --bs-btn-hover-color: var(--bs-body-bg);
    --bs-btn-hover-bg: var(--bs-emphasis-color);
    --bs-btn-hover-border-color: var(--bs-emphasis-color);
}
</style>
