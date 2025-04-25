<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAdminDataStore } from '@/stores/adminDataStore';
import { useAuthStore } from '@/stores/authStore';
import { debounce } from 'lodash-es'; // Using lodash for debouncing search input

// Import child components
import CompanyColumn from '@/components/admin/CompanyColumn.vue'; // Import the component
// import LoadingSpinner from '@/components/common/LoadingSpinner.vue'; // Optional

const adminStore = useAdminDataStore();
const authStore = useAuthStore();

// --- State for Search and Filters ---
const searchTerm = ref('');
const filters = ref({
  // Define filter properties, e.g.:
  // status: 'All', // 'All', 'Active', 'Paused'
  // userRole: 'All', // 'All', 'Admin', 'CategoryManager'
  // dateFrom: null,
  // dateTo: null,
});

// --- Computed Properties ---
// Computed property to get the display name, falling back to email
const adminDisplayName = computed(() => {
  return authStore.userInfo?.displayName || authStore.userInfo?.email || 'Admin';
});

// Computed property for filtered data (initially just returns all data)
// This will be expanded when filters are implemented
const filteredCompanies = computed(() => {
    let companies = adminStore.companies;
    let users = adminStore.users;

    // --- Search Logic ---
    // Basic search across company name and user name/email
    if (searchTerm.value.trim()) {
        const lowerSearchTerm = searchTerm.value.toLowerCase().trim();

        // Filter users first based on search term
        const matchingUserIds = new Set(
            users
                .filter(user =>
                    user.displayName?.toLowerCase().includes(lowerSearchTerm) ||
                    user.email?.toLowerCase().includes(lowerSearchTerm) ||
                    user.phoneNumber?.includes(lowerSearchTerm) || // Add phone if searchable
                    user.id?.toLowerCase().includes(lowerSearchTerm) // Add ID if searchable
                )
                .map(user => user.id)
        );

        // Filter companies based on name OR if they have matching users
         companies = companies.filter(company => {
            const companyMatches = company.companyName?.toLowerCase().includes(lowerSearchTerm);
            // Ensure company.users exists before checking
            const companyUsers = adminStore.users.filter(u => u.companyId === company.id);
            const hasMatchingUser = companyUsers.some(user => matchingUserIds.has(user.id));
            return companyMatches || hasMatchingUser;
        });

         // Further filter users to only include those belonging to the filtered companies OR matching directly
         users = users.filter(user => matchingUserIds.has(user.id) || companies.some(c => c.id === user.companyId));

    }


    // --- Filter Logic (Placeholders) ---
    // TODO: Implement filtering based on filters.value
    // e.g., filter by company status, user role, date range


    // --- Combine Data for Display ---
    // Map users to their companies
    return companies.map(company => ({
        ...company,
        // Filter users associated with *this* company based on the overall filtered user list
        users: users.filter(user => user.companyId === company.id)
    }));
});

// --- Lifecycle Hooks ---
onMounted(async () => {
  // Fetch initial data when the component mounts
  // Use Promise.all to fetch concurrently
  await Promise.all([
      adminStore.fetchCompanies(),
      adminStore.fetchUsers()
      // adminStore.fetchLeads() // Fetch leads if needed on dashboard, or fetch on Requests page
  ]);
});

// --- Watchers ---
// Watch search term and apply debouncing to avoid excessive filtering/API calls
const debouncedSearch = debounce(() => {
    // The computed property `filteredCompanies` will react automatically
    // If search required an API call, trigger it here.
    console.log("Searching for:", searchTerm.value);
}, 500); // 500ms delay

watch(searchTerm, debouncedSearch);

// Watch filters object for changes (example)
// watch(filters, () => {
//   console.log("Filters changed:", filters.value);
//   // The computed property `filteredCompanies` will react automatically
//   // If filtering required an API call, trigger it here.
// }, { deep: true }); // Use deep watch for nested filter properties


// --- Methods ---
const applyFilters = () => {
    // Placeholder function for explicit filter application if needed
    console.log("Applying filters:", filters.value);
     // Computed property will update automatically if filters ref is used directly
};

const clearFilters = () => {
    // Reset filter values to defaults
    filters.value = { /* Reset state */ };
    searchTerm.value = ''; // Also clear search
    console.log("Filters cleared");
};

</script>

<template>
  <div class="admin-dashboard">
    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
      <h1 class="h2 fw-semibold">Hello, {{ adminDisplayName }}</h1>
      </div>

    <div class="card bg-secondary-subtle mb-4 shadow-sm">
       <div class="card-body p-3">
            <div class="row g-2 align-items-end">
                <div class="col-md-4 col-lg-4">
                    <label for="searchInput" class="form-label visually-hidden">Search</label>
                    <input
                        type="search"
                        class="form-control"
                        id="searchInput"
                        placeholder="Search by name, email, phone, ID..."
                        v-model="searchTerm"
                    />
                </div>

                <div class="col-md col-lg-2">
                    <label for="filterCompany" class="form-label visually-hidden">Company Status</label>
                    <select id="filterCompany" class="form-select" disabled>
                        <option selected>Company (Filter)</option>
                        </select>
                </div>
                 <div class="col-md col-lg-2">
                    <label for="filterRole" class="form-label visually-hidden">User Role</label>
                    <select id="filterRole" class="form-select" disabled>
                        <option selected>User Role (Filter)</option>
                         </select>
                </div>
                 <div class="col-md col-lg-3">
                     <label class="form-label visually-hidden">Date Range</label>
                     <div class="input-group">
                        <input type="date" class="form-control" placeholder="From" aria-label="Date From" disabled>
                        <span class="input-group-text">-</span>
                        <input type="date" class="form-control" placeholder="To" aria-label="Date To" disabled>
                     </div>
                 </div>


                <div class="col-md-auto col-lg-1 d-grid">
                    <button class="btn btn-primary" @click="applyFilters" disabled>Filter</button>
                     </div>
            </div>
       </div>
    </div>

    <div v-if="adminStore.isLoading" class="text-center my-5">
        <div class="spinner-border" role="status" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">Loading data...</span>
        </div>
        <p class="mt-2">Loading data...</p>
     </div>

    <div v-else-if="adminStore.error" class="alert alert-danger" role="alert">
       Error loading data: {{ adminStore.error }}
     </div>

    <div v-else class="company-columns-container horizontal-scroll-container">
        <div v-if="filteredCompanies.length === 0" class="text-center text-muted my-5">
            <p>No companies found matching your criteria.</p>
        </div>
         <div v-else class="d-flex flex-nowrap pb-3">
             <CompanyColumn
                v-for="company in filteredCompanies"
                :key="company.id"
                :company="company"
                @edit-company="adminStore.openEditCompanyModal"
                @delete-company="companyToDelete => adminStore.openConfirmDialog({ title: 'Delete Company', message: `Delete ${companyToDelete.companyName}? This deletes the company AND all associated users. This action cannot be undone.`, confirmText: 'Delete Company', onConfirm: () => adminStore.deleteCompany(companyToDelete.id) })"
                @toggle-status="companyToToggle => adminStore.openConfirmDialog({ title: 'Toggle Status', message: `Set ${companyToToggle.companyName} status to ${companyToToggle.subscriptionStatus === 'Active' ? 'Paused' : 'Active'}? This affects user login.`, confirmText: `Set to ${companyToToggle.subscriptionStatus === 'Active' ? 'Paused' : 'Active'}`, onConfirm: () => adminStore.toggleCompanyStatus(companyToToggle.id, companyToToggle.subscriptionStatus) })"
                @edit-user="adminStore.openEditUserModal"
             />
         </div>
    </div>

  </div>
</template>

<style scoped>
.admin-dashboard {
  /* Add specific dashboard styles if needed */
}

.card.bg-secondary-subtle {
    /* Custom background for filter card */
    background-color: var(--bs-tertiary-bg) !important; /* Use tertiary dark */
    border: none;
}

.form-control, .form-select {
    background-color: var(--bs-body-bg); /* Darker input background */
    color: var(--bs-body-color);
    border: 1px solid var(--bs-border-color);
}
.form-control:focus, .form-select:focus {
    background-color: var(--bs-body-bg);
    color: var(--bs-body-color);
    border-color: var(--bs-link-color);
    box-shadow: 0 0 0 0.2rem rgba(var(--bs-link-color-rgb), 0.2);
}
.form-control::placeholder {
    color: var(--bs-form-control-placeholder-color);
    font-weight: var(--font-weight-light);
}
.input-group-text {
     background-color: var(--bs-secondary-bg);
     border: 1px solid var(--bs-border-color);
     color: var(--bs-body-color);
}

.btn-primary {
     --bs-btn-color: #fff;
     --bs-btn-bg: var(--bs-link-color); /* Use link color for primary */
     --bs-btn-border-color: var(--bs-link-color);
     --bs-btn-hover-bg: #5a8ced; /* Slightly lighter blue */
     --bs-btn-hover-border-color: #5a8ced;
     --bs-btn-active-bg: #4e7fe1;
     --bs-btn-active-border-color: #4e7fe1;
     --bs-btn-disabled-bg: var(--bs-link-color);
     --bs-btn-disabled-border-color: var(--bs-link-color);
}

/* --- Company Columns Styling --- */
.company-columns-container {
    overflow-x: auto; /* Enable horizontal scrolling */
    overflow-y: hidden;
    white-space: nowrap; /* Prevent columns from wrapping */
    padding-bottom: 1rem; /* Space for scrollbar */
}

/* Styles applied by CompanyColumn component now */

/* Add custom scrollbar styling for the container */
.horizontal-scroll-container::-webkit-scrollbar {
    height: 10px;
}
.horizontal-scroll-container::-webkit-scrollbar-track {
  background: var(--bs-body-bg);
}
.horizontal-scroll-container::-webkit-scrollbar-thumb {
  background-color: var(--bs-tertiary-bg);
  border-radius: 5px;
  border: 2px solid var(--bs-body-bg);
}
.horizontal-scroll-container::-webkit-scrollbar-thumb:hover {
  background-color: var(--bs-secondary-bg);
}
</style>
