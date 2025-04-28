<script setup>
import { defineProps, defineEmits } from 'vue';
import UserCard from './UserCard.vue'; // Import UserCard component

const props = defineProps({
  company: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['editCompany', 'deleteCompany', 'toggleStatus', 'editUser']);

const getStatusClass = (status) => {
    switch (status) {
        case 'Active': return 'status-active';
        case 'Setting up': return 'status-setting-up';
        case 'Services Paused': return 'status-paused';
        default: return 'status-default';
    }
};

const handleEditCompany = () => {
    emit('editCompany', props.company);
};

const handleDeleteCompany = () => {
    emit('deleteCompany', props.company);
};

const handleToggleStatus = () => {
    emit('toggleStatus', props.company);
};

// Forward the editUser event from UserCard
const handleEditUser = (user) => {
    emit('editUser', user);
};
</script>

<template>
  <div class="company-column">
    <div class="company-card">
      <!-- Top Section with Company Name and Status/Users tags side by side -->
      <div class="company-header">
        <div class="company-name-container">
          <h5 class="company-name">{{ company.companyName }}</h5>
        </div>
        <div class="tags-container">
          <div :class="['status-badge', getStatusClass(company.subscriptionStatus)]">
            {{ company.subscriptionStatus }}
          </div>
          <div class="user-count">
            {{ company.users?.length || 0 }} users
          </div>
        </div>
      </div>

      <!-- Buttons right beneath the company name -->
      <div class="button-section">
        <button class="btn-delete" title="Delete Company" @click="handleDeleteCompany">
          Delete company
        </button>
        <button
          v-if="company.subscriptionStatus === 'Active'"
          class="btn-pause"
          title="Pause Services"
          @click="handleToggleStatus"
        >
          Pause services
        </button>
        <button
          v-else
          class="btn-resume"
          title="Resume Services"
          @click="handleToggleStatus"
        >
          Resume Services
        </button>
        <button class="btn-edit" title="Edit Company" @click="handleEditCompany">
          Edit
        </button>
      </div>

      <!-- User Cards Area -->
      <div class="user-cards-container">
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
    </div>
  </div>
</template>

<style scoped>
.company-column {
    display: inline-block;
    width: 98%; /* Changed from 380px to 48% for 2 columns per row */
    max-width: 90vw;
    vertical-align: top;
    white-space: normal;
    height: 100%;
    margin-right: 0.75rem; /* Reduced margin to match the gap */
}

.company-column:last-child {
    margin-right: 0;
}

.company-card {
    background-color: #1a1a1a;
    border: 1px solid #a1a1a1;
    border-radius: 15px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 100%;
}

/* Top section with company name and tags side by side */
.company-header {
    padding: 1rem 1rem 0.5rem;
    display: flex;
    gap: 1rem;
}

.company-name-container {
    flex: 2;
    background-color: #1a1a1a;
    border: 1px solid #a1a1a1;
    border-radius: 50px;
    padding: 0.5rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
}

.company-name {
    margin: 0;
    color: white;
    font-size: 1rem;
    font-weight: 500;
}

.tags-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.status-badge {
    width: 100%;
    border-radius: 50px;
    padding: 0.4rem 0.5rem;
    font-weight: 500;
    text-align: center;
    font-size: 0.8rem;
}

.status-active {
    background-color: #4CAF50;
    color: black;
}

.status-setting-up {
    background-color: #26475d;
    color: white;
}

.status-paused {
    background-color: #ffde59;
    color: black;
}

.status-default {
    background-color: #6c757d;
    color: white;
}

.user-count {
    width: 100%;
    background-color: #a1a1a1;
    color: black;
    border-radius: 50px;
    padding: 0.4rem 0.5rem;
    font-weight: 500;
    text-align: center;
    font-size: 0.8rem;
}

/* Button section right below company name */
.button-section {
    padding: 0.5rem 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    border-bottom: 1px solid #a1a1a1;
}

.btn-delete, .btn-pause, .btn-resume, .btn-edit {
    flex: 1;
    min-width: 80px;
    border-radius: 50px;
    padding: 0.35rem 0.5rem;
    font-weight: 500;
    text-align: center;
    border: 1px solid;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.75rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.btn-delete {
    background-color: transparent;
    border-color: #c14748;
    color: #d9d9d9;
}

.btn-delete:hover {
    background-color: #c14748;
    color: white;
}

.btn-pause {
    background-color: transparent;
    border-color: #5271ff;
    color: #d9d9d9;
}

.btn-pause:hover {
    background-color: #5271ff;
    color: white;
}

.btn-resume {
    background-color: transparent;
    border-color: #5271ff;
    color: #d9d9d9;
}

.btn-resume:hover {
    background-color: #5271ff;
    color: white;
}

.btn-edit {
    background-color: transparent;
    border-color: #a1a1a1;
    color: #d9d9d9;
}

.btn-edit:hover {
    background-color: #a1a1a1;
    color: #1a1a1a;
}

/* User cards area */
.user-cards-container {
    flex-grow: 1;
    overflow-y: auto;
    padding: 0.75rem;
    background-color: #1a1a1a;
    min-height: 100px;
}

/* Custom scrollbar for user cards area */
.user-cards-container::-webkit-scrollbar {
    width: 6px;
}
.user-cards-container::-webkit-scrollbar-track {
    background: #1a1a1a;
}
.user-cards-container::-webkit-scrollbar-thumb {
    background-color: #a1a1a1;
    border-radius: 3px;
}
.user-cards-container::-webkit-scrollbar-thumb:hover {
    background-color: #d9d9d9;
}
</style>