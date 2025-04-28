<script setup>
import { computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const handleLogout = () => {
    authStore.logout(router);
}

// Example: Get company name if available
const companyName = computed(() => {
    // This assumes company details might be loaded elsewhere or fetched based on userInfo.companyId
    // For now, just a placeholder
    return authStore.userInfo?.companyName || 'My Company';
});

const userInitials = computed(() => {
    const name = authStore.userInfo?.displayName || authStore.userInfo?.email || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
});

// Define navigation links based on roles (example)
const navLinks = computed(() => {
    const links = [
        { name: 'DashboardStores', label: 'Stores', requires: ['Admin', 'CategoryManager'] },
        { name: 'DashboardPlanograms', label: 'Planograms', requires: ['Admin', 'CategoryManager', 'StoreManager'] },
        { name: 'DashboardFixtures', label: 'Fixtures', requires: ['Admin', 'CategoryManager'] },
        { name: 'DashboardProducts', label: 'Products', requires: ['Admin', 'CategoryManager'] },
        { name: 'DashboardCategories', label: 'Categories', requires: ['Admin', 'CategoryManager'] },
        { name: 'DashboardBrands', label: 'Brands', requires: ['Admin', 'CategoryManager'] },
        { name: 'DashboardSuppliers', label: 'Suppliers', requires: ['Admin', 'CategoryManager'] },
    ];
    // Filter links based on the current user's role
    const userRole = authStore.userInfo?.role;
    if (!userRole) return []; // No links if role unknown
    return links.filter(link => link.requires.includes(userRole));
});

const isNavLinkActive = (routeName) => {
    // Simple check based on route name startsWith might be needed for nested routes
    return route.name === routeName;
}

</script>

<template>
  <div class="dashboard-layout">
    <header class="app-header">
      <nav class="navbar navbar-expand navbar-dark">
        <div class="container-fluid">
          <RouterLink class="navbar-brand fw-bold" :to="{ name: 'DashboardStores' }">
            MATRIX <span class="fw-light">Planogram</span>
          </RouterLink>

          <ul class="navbar-nav mx-auto">
             <li class="nav-item" v-for="link in navLinks" :key="link.name">
               <RouterLink class="nav-link" :class="{active: isNavLinkActive(link.name)}" :to="{ name: link.name }">
                 {{ link.label }}
               </RouterLink>
             </li>
          </ul>

          <div class="dropdown user-menu">
            <button class="btn dropdown-toggle d-flex align-items-center" type="button" id="userMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
              <div class="user-avatar me-2">
                {{ userInitials }}
              </div>
              <span class="d-none d-md-inline">{{ authStore.userInfo?.displayName || authStore.userInfo?.email }}</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark" aria-labelledby="userMenuButton">
              <li><RouterLink class="dropdown-item" to="#">Account Settings</RouterLink></li>
              <li><hr class="dropdown-divider"></li>
              <li><button class="dropdown-item" @click="handleLogout">Logout</button></li>
            </ul>
          </div>
        </div>
      </nav>
    </header>

    <main class="main-content container-fluid py-4">
      <RouterView />
    </main>

    </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--bs-body-bg); /* Dark background */
}

.app-header {
  background-color: #1e1e1e; /* Slightly lighter dark */
  border-bottom: 1px solid var(--grey-border);
  position: sticky; /* Make header sticky */
  top: 0;
  z-index: 1030;
}

.navbar {
    padding: 0.5rem 1.5rem; /* Adjust padding */
}

.navbar-brand {
    color: var(--text-white);
}
.navbar-brand .fw-light {
    opacity: 0.8;
}

.navbar-nav .nav-link {
    color: var(--text-primary);
    padding: 0.5rem 1rem;
    margin: 0 0.25rem;
    border-radius: var(--bs-border-radius);
    font-weight: var(--font-weight-medium);
    transition: background-color 0.2s ease, color 0.2s ease;
}
.navbar-nav .nav-link:hover {
    background-color: var(--bs-tertiary-bg);
    color: var(--text-white);
}
.navbar-nav .nav-link.active {
    background-color: var(--medium-slate-blue); /* Use primary purple */
    color: var(--text-white);
    font-weight: var(--font-weight-semibold);
}

.user-menu .btn {
    color: var(--text-primary);
    border: none;
    box-shadow: none;
    padding: 0.25rem 0.5rem;
}
.user-menu .btn:hover, .user-menu .btn:focus {
    color: var(--text-white);
    background-color: var(--bs-tertiary-bg);
}

.user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: var(--medium-slate-blue); /* Use primary purple */
    color: var(--text-white);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: var(--font-weight-semibold);
    font-size: 0.9rem;
}

.dropdown-menu {
    background-color: var(--bs-secondary-bg);
    border-color: var(--grey-border);
}
.dropdown-item {
    color: var(--text-primary);
    padding: 0.5rem 1rem;
}
.dropdown-item:hover, .dropdown-item:focus {
    background-color: var(--bs-tertiary-bg);
    color: var(--text-white);
}
.dropdown-divider {
    border-top-color: var(--grey-border);
}


.main-content {
  flex-grow: 1;
}
</style>
