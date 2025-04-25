<script setup>
import { defineProps, defineEmits } from 'vue';
import UserCard from './UserCard.vue'; // Import UserCard component

const props = defineProps({
  company: {
    type: Object,
    required: true,
  },
  // Pass users specific to this company if not already nested in company object
  // users: {
  //   type: Array,
  //   required: true,
  // }
});

const emit = defineEmits(['editCompany', 'deleteCompany', 'toggleStatus', 'editUser']);

const getStatusClass = (status) => {
    switch (status) {
        case 'Active': return 'bg-success';
        case 'Setting up': return 'bg-info text-dark';
        case 'Services Paused': return 'bg-warning text-dark';
        default: return 'bg-secondary';
    }
};

const handleEditCompany = () => {
    emit('editCompany', props.company);
};

const handleDeleteCompany = () => {
    emit('deleteCompany', props.company); // Pass full company for context if needed
};

const handleToggleStatus = () => {
    emit('toggleStatus', props.company); // Pass full company
};

// Forward the editUser event from UserCard
const handleEditUser = (user) => {
    emit('editUser', user);
};

</script>

<template>
  <div class="company-column">
    <div class="card shadow-sm h-100">
      <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h5 class="mb-0 text-truncate" :title="company.companyName">
            {{ company.companyName }}
            <span class="text-muted fw-normal">({{ company.users?.length || 0 }})</span>
        </h5>
        <span :class="['badge', getStatusClass(company.subscriptionStatus)]">
          {{ company.subscriptionStatus }}
        </span>
      </div>

      <div class="card-body user-cards-container">
        <div v-if="!company.users || company.users.length === 0" class="text-center text-muted py-3">
          <small>No users assigned to this company.</small>
        </div>
        <UserCard
          v-for="user in company.users"
          :key="user.id"
          :user="user"
          @edit-user="handleEditUser"
        />
      </div>

      <div class="card-footer d-flex justify-content-end gap-2">
        <button class="btn btn-sm btn-outline-secondary" title="Edit Company" @click="handleEditCompany">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16"><path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/><path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/></svg>
        </button>
        <button
          class="btn btn-sm"
          :class="company.subscriptionStatus === 'Active' ? 'btn-outline-warning' : 'btn-outline-success'"
          :title="company.subscriptionStatus === 'Active' ? 'Pause Services' : 'Resume Services'"
          @click="handleToggleStatus"
        >
          <svg v-if="company.subscriptionStatus === 'Active'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M5 6.25a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0v-3.5zm3.5 0a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0v-3.5z"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/></svg>
        </button>
        <button class="btn btn-sm btn-outline-danger" title="Delete Company" @click="handleDeleteCompany">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16"><path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.company-column {
    display: inline-block; /* Align columns horizontally */
    width: 320px; /* Fixed width for columns */
    max-width: 90vw; /* Prevent excessive width on small screens */
    vertical-align: top; /* Align columns at the top */
    white-space: normal; /* Allow content inside to wrap */
    height: calc(100% - 1px); /* Fill height minus border allowance */
    margin-right: 1rem; /* Space between columns */
}
.company-column:last-child {
    margin-right: 0;
}

.card {
    background-color: var(--bs-secondary-bg);
    border-color: var(--bs-border-color);
    display: flex; /* Enable flex for footer alignment */
    flex-direction: column;
}
.card-header {
     background-color: var(--bs-tertiary-bg);
     border-bottom: 1px solid var(--bs-border-color);
     font-size: 0.95rem;
     padding: 0.75rem 1rem; /* Adjust padding */
}
.card-header h5 {
    font-size: 1.05rem; /* Slightly smaller heading */
    font-weight: var(--font-weight-medium);
    color: var(--bs-emphasis-color);
}
.user-cards-container {
    flex-grow: 1; /* Allow body to take available space */
    overflow-y: auto; /* Enable scrolling for user cards */
    max-height: 450px; /* Adjust max height as needed */
    padding: 0.75rem; /* Padding inside the scrollable area */
}
.card-footer {
    background-color: var(--bs-tertiary-bg);
    border-top: 1px solid var(--bs-border-color);
    padding: 0.5rem 0.75rem; /* Smaller footer padding */
}
.badge {
    font-size: 0.75rem;
    padding: 0.3em 0.5em;
}
.badge.bg-success { background-color: #198754 !important; }
.badge.bg-warning { background-color: #ffc107 !important; color: #000 !important; }
.badge.bg-info { background-color: #0dcaf0 !important; }
.badge.bg-secondary { background-color: #6c757d !important; }

.btn-sm {
    padding: 0.2rem 0.5rem; /* Smaller buttons */
    font-size: 0.8rem;
}

/* Custom scrollbar for user cards container */
.user-cards-container::-webkit-scrollbar {
    width: 6px;
}
.user-cards-container::-webkit-scrollbar-track {
  background: var(--bs-secondary-bg); /* Match card body */
}
.user-cards-container::-webkit-scrollbar-thumb {
  background-color: var(--bs-border-color); /* Use border color */
  border-radius: 3px;
}
.user-cards-container::-webkit-scrollbar-thumb:hover {
  background-color: var(--bs-light-emphasis);
}
</style>
