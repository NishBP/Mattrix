<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAdminDataStore } from '@/stores/adminDataStore';
import { useAuthStore } from '@/stores/authStore';
import { debounce } from 'lodash-es';

// Import child components
import CompanyColumn from '@/components/admin/CompanyColumn.vue';
// *** REMOVE AdminNav import ***
// import AdminNav from '@/components/admin/AdminNav.vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination } from 'swiper/modules';
import { useRouter } from 'vue-router';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const adminStore = useAdminDataStore();
const authStore = useAuthStore();
const router = useRouter();

// --- State for Search and Filters ---
const searchTerm = ref('');
const userRoleFilter = ref('All');
const createdDateFilter = ref('All');

// --- Computed Properties ---
const adminDisplayName = computed(() => {
  return authStore.userInfo?.displayName?.split(' ')[0] ||
         authStore.userInfo?.email ||
         'Admin';
});

// Computed property for filtered data
const filteredCompanies = computed(() => {
    let companies = [...adminStore.companies];
    let users = [...adminStore.users];

    // Apply search filter
    if (searchTerm.value.trim()) {
        const lowerSearchTerm = searchTerm.value.toLowerCase().trim();
        const matchingUserIds = new Set(
            users
                .filter(user =>
                    user.displayName?.toLowerCase().includes(lowerSearchTerm) ||
                    user.email?.toLowerCase().includes(lowerSearchTerm) ||
                    user.phoneNumber?.includes(lowerSearchTerm) ||
                    user.id?.toLowerCase().includes(lowerSearchTerm)
                )
                .map(user => user.id)
        );
         companies = companies.filter(company => {
            const companyMatches = company.companyName?.toLowerCase().includes(lowerSearchTerm);
            const companyUsers = users.filter(u => u.companyId === company.id);
            const hasMatchingUser = companyUsers.some(user => matchingUserIds.has(user.id));
            return companyMatches || hasMatchingUser;
        });
         users = users.filter(user => matchingUserIds.has(user.id) || companies.some(c => c.id === user.companyId));
    }

    // Apply role filter
    if (userRoleFilter.value !== 'All') {
        const roleFilteredUserIds = new Set(users.filter(u => u.role === userRoleFilter.value).map(u => u.id));
        companies = companies.filter(company => {
            const companyUsers = users.filter(u => u.companyId === company.id);
            return companyUsers.some(user => roleFilteredUserIds.has(user.id));
        });
        users = users.filter(user => roleFilteredUserIds.has(user.id));
    }

    // Map users to their companies for display
    return companies.map(company => ({
        ...company,
        users: users.filter(user => user.companyId === company.id)
    })).sort((a, b) => a.companyName.localeCompare(b.companyName));
});

// Determine if we should use carousel
const useCarousel = computed(() => {
    return filteredCompanies.value.length > 2;
});

// --- Lifecycle Hooks ---
onMounted(async () => {
  await Promise.all([
      adminStore.fetchCompanies(),
      adminStore.fetchUsers()
  ]);
});

// --- Watchers ---
const debouncedSearch = debounce(() => {
    console.log("Searching for:", searchTerm.value);
}, 500);
watch(searchTerm, debouncedSearch);

watch([userRoleFilter, createdDateFilter], () => {
     console.log("Filters changed", {
        role: userRoleFilter.value,
        date: createdDateFilter.value
    });
});

// --- Methods ---
const applyFilters = () => {
    console.log("Applying filters");
};

// Handler for user deletion
const handleDeleteUser = (user) => {
    adminStore.openConfirmDialog({
        title: 'Delete User',
        message: `Are you sure you want to delete ${user.displayName || user.email}? This action cannot be undone.`,
        confirmText: 'Delete User',
        onConfirm: () => adminStore.deleteUser(user.id)
    });
};

// Logout method
const handleLogout = () => {
    authStore.logout(router);
}
</script>

<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <div class="d-flex justify-content-between align-items-center flex-wrap">
        <h1 class="page-title">Administration</h1>
        <div class="header-actions d-flex align-items-center">
            <span class="hello-message me-3">Hello, {{ adminDisplayName }}!</span>
          <button class="btn btn-outline-light logout-btn" @click="handleLogout">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-right me-1" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/><path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/></svg>
            Logout
          </button>
        </div>
      </div>
      <p class="page-subtitle">Manage users and companies here.</p>
    </div>

    <div class="filter-section">
      <div class="filter-container">
        <div class="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search search-icon" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>
          <input type="search" class="search-input" placeholder="Search" v-model="searchTerm"/>
        </div>
        <div class="filter-item">
          <select v-model="userRoleFilter" class="filter-select">
            <option value="All">User Role</option>
            <option value="CategoryManager">Category Manager</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <div class="filter-item">
          <select v-model="createdDateFilter" class="filter-select" disabled>
            <option value="All">Accounts created</option>
          </select>
        </div>
        <button class="btn btn-filter" @click="applyFilters">Filter</button>
      </div>
    </div>

    <div v-if="adminStore.isLoading" class="text-center my-5">...Loading...</div>
    <div v-else-if="adminStore.error" class="alert alert-danger">Error: {{ adminStore.error }}</div>
    <div v-else-if="filteredCompanies.length === 0" class="text-center text-muted my-5">No companies found.</div>

    <div v-else class="companies-display">
      <swiper v-if="useCarousel" :modules="[Navigation, Pagination]" :slides-per-view="2" :space-between="15" :navigation="true" :pagination="{ clickable: true }" :breakpoints="{ '320': { slidesPerView: 1, spaceBetween: 10 }, '768': { slidesPerView: 2, spaceBetween: 15 } }" class="company-carousel">
        <swiper-slide v-for="company in filteredCompanies" :key="company.id" class="company-slide">
          <CompanyColumn :company="company" @edit-company="adminStore.openEditCompanyModal" @delete-company="companyToDelete => adminStore.openConfirmDialog({ title: 'Delete Company', message: `Delete ${companyToDelete.companyName}? This deletes the company AND all associated users. This action cannot be undone.`, confirmText: 'Delete Company', onConfirm: () => adminStore.deleteCompany(companyToDelete.id) })" @toggle-status="companyToToggle => adminStore.openConfirmDialog({ title: 'Toggle Status', message: `Set ${companyToToggle.companyName} status to ${companyToToggle.subscriptionStatus === 'Active' ? 'Paused' : 'Active'}? ${companyToToggle.subscriptionStatus === 'Active' ? 'This will affect user login.' : ''}`, confirmText: `${companyToToggle.subscriptionStatus === 'Active' ? 'Pause Services' : 'Resume Services'}`, onConfirm: () => adminStore.toggleCompanyStatus(companyToToggle.id, companyToToggle.subscriptionStatus) })" @edit-user="adminStore.openEditUserModal" @delete-user="handleDeleteUser"/>
        </swiper-slide>
      </swiper>
      <div v-else class="company-grid">
        <CompanyColumn v-for="company in filteredCompanies" :key="company.id" :company="company" @edit-company="adminStore.openEditCompanyModal" @delete-company="companyToDelete => adminStore.openConfirmDialog({ title: 'Delete Company', message: `Delete ${companyToDelete.companyName}? This deletes the company AND all associated users. This action cannot be undone.`, confirmText: 'Delete Company', onConfirm: () => adminStore.deleteCompany(companyToDelete.id) })" @toggle-status="companyToToggle => adminStore.openConfirmDialog({ title: 'Toggle Status', message: `Set ${companyToToggle.companyName} status to ${companyToToggle.subscriptionStatus === 'Active' ? 'Paused' : 'Active'}? ${companyToToggle.subscriptionStatus === 'Active' ? 'This will affect user login.' : ''}`, confirmText: `${companyToToggle.subscriptionStatus === 'Active' ? 'Pause Services' : 'Resume Services'}`, onConfirm: () => adminStore.toggleCompanyStatus(companyToToggle.id, companyToToggle.subscriptionStatus) })" @edit-user="adminStore.openEditUserModal" @delete-user="handleDeleteUser"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles remain largely the same, ensure variables from base.css are used */
.admin-dashboard {
  /* Padding is now handled by the wrapper in AdminLayout */
  /* padding: 1.5rem; */
  background-color: #111315; /* Match body background */
  min-height: 100vh;
  color: var(--text-primary); /* Default text color */
}

.dashboard-header {
  margin-bottom: 1.5rem; /* Space below header */
}

.page-title {
  font-size: 1.5rem; /* Slightly smaller title */
  font-weight: 600;
  color: white;
  margin: 0;
}
.header-actions {
    gap: 1rem;
}
.hello-message {
    color: var(--text-primary); /* Use primary text color */
    font-size: 0.9rem;
}
.page-subtitle {
  color: var(--grey-border); /* Use grey border color for subtitle */
  font-size: 0.9rem;
  margin-top: 0.25rem;
  margin-bottom: 0;
}

.logout-btn {
  border-color: var(--grey-border);
  color: var(--text-primary);
  padding: 0.4rem 1rem;
  border-radius: 50px;
  transition: all 0.2s;
  font-size: 0.85rem;
  background-color: transparent;
}
.logout-btn:hover {
  background-color: var(--bs-secondary-bg);
  color: white;
  border-color: var(--bs-secondary-bg);
}

/* Filter Section stays the same */
.filter-section { margin-bottom: 2rem; }
.filter-container { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; background-color: #1a1a1a; border: 1px solid #a1a1a1; padding: 1rem; border-radius: 10px; }
.search-box { position: relative; flex: 1; min-width: 200px; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #a1a1a1; } /* Adjusted icon color */
.search-input { width: 100%; background-color: #1a1a1a; border: 1px solid #a1a1a1; border-radius: 20px; color: white; padding: 0.5rem 1rem 0.5rem 2.5rem; font-size: 0.9rem; }
.search-input::placeholder { color: #a1a1a1; opacity: 0.7; } /* Adjusted placeholder color */
.search-input:focus { outline: none; border-color: #5271ff; box-shadow: 0 0 0 2px rgba(82, 113, 255, 0.25); } /* Adjusted focus */
.filter-item { min-width: 150px; }
.filter-select { width: 100%; background-color: #1a1a1a; border: 1px solid #a1a1a1; color: #d9d9d9; border-radius: 20px; padding: 0.5rem 1rem; appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23a1a1a1' class='bi bi-chevron-down' viewBox='0 0 16 16'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 1rem center; background-size: 12px; font-size: 0.9rem; }
.filter-select:disabled { opacity: 0.5; background-color: #2a2a2a; }
.filter-select:focus { outline: none; border-color: #5271ff; box-shadow: 0 0 0 2px rgba(82, 113, 255, 0.25); }
.btn-filter { background-color: #26475d; color: white; border: none; border-radius: 20px; padding: 0.5rem 1.5rem; transition: all 0.2s; font-size: 0.9rem; }
.btn-filter:hover { background-color: #1a3a4f; transform: translateY(-1px); }

/* Companies Display stays the same */
.companies-display { margin-top: 2rem; }
.company-carousel { padding-bottom: 3rem; }
.company-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; } /* Use grid for non-carousel */
.company-slide { height: auto; } /* Allow slides to define height */
.company-slide > div { height: 100%; } /* Ensure CompanyColumn fills slide height */


/* Swiper customization stays the same */
:deep(.swiper-button-next), :deep(.swiper-button-prev) { color: white; background-color: rgba(42, 42, 42, 0.7); width: 35px; height: 35px; border-radius: 50%; transition: background-color 0.2s; }
:deep(.swiper-button-next:hover), :deep(.swiper-button-prev:hover) { background-color: rgba(60, 60, 60, 0.9); }
:deep(.swiper-button-next::after), :deep(.swiper-button-prev::after) { font-size: 1rem; font-weight: bold; }
:deep(.swiper-pagination-bullet) { background: #a1a1a1; opacity: 0.7; }
:deep(.swiper-pagination-bullet-active) { background: #5271ff; opacity: 1; }

/* Responsive adjustments */
@media (max-width: 767.98px) {
  /* .admin-dashboard { padding: 1rem; } */ /* Padding handled by wrapper in layout */
  .filter-container { flex-direction: column; align-items: stretch; }
  .search-box, .filter-item, .btn-filter { width: 100%; }
  .dashboard-header { text-align: center; }
  .header-actions { justify-content: center; margin-top: 0.5rem; }
  .company-grid { grid-template-columns: 1fr; } /* Single column on small screens */
}
</style>
