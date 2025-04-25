<script setup>
import { useAuthStore } from '@/stores/authStore';
import { RouterLink, useRoute } from 'vue-router';

const authStore = useAuthStore();
const route = useRoute(); // Get current route information

const handleLogout = () => {
  authStore.logout();
};

// Function to check if a link is active
// Considers nested routes by checking if the current route path starts with the link's path
const isLinkActive = (routeName) => {
  // For the dashboard, check exact match or if it's the base '/admin' path
  if (routeName === 'AdminDashboard') {
     return route.name === routeName || route.path === '/admin';
  }
  // For other admin routes, check if the current route name matches
  return route.name === routeName;
};
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top admin-nav-border">
    <div class="container-fluid">
      <RouterLink class="navbar-brand fw-semibold" :to="{ name: 'AdminDashboard' }">
        Planogram Admin
      </RouterLink>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#adminNavbarContent"
        aria-controls="adminNavbarContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="adminNavbarContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <RouterLink
              class="nav-link"
              :class="{ 'active fw-medium': isLinkActive('AdminDashboard') }"
              :to="{ name: 'AdminDashboard' }"
              aria-current="page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house-door-fill me-1 align-text-bottom" viewBox="0 0 16 16">
                <path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5z"/>
              </svg>
              Home
            </RouterLink>
          </li>
           <li class="nav-item">
            <RouterLink
              class="nav-link"
              :class="{ 'active fw-medium': isLinkActive('AdminRequests') }"
              :to="{ name: 'AdminRequests' }"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-card-list me-1 align-text-bottom" viewBox="0 0 16 16">
                 <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
                 <path d="M5 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 5 8zm0-2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-1-5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM4 8a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm0 2.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"/>
               </svg>
              Requests
            </RouterLink>
          </li>
           <li class="nav-item">
            <RouterLink
              class="nav-link"
              :class="{ 'active fw-medium': isLinkActive('AdminAddUser') }"
              :to="{ name: 'AdminAddUser' }"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-plus-fill me-1 align-text-bottom" viewBox="0 0 16 16">
                <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                <path fill-rule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z"/>
              </svg>
              + User
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink
              class="nav-link"
              :class="{ 'active fw-medium': isLinkActive('AdminAddCompany') }"
              :to="{ name: 'AdminAddCompany' }"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-building-add me-1 align-text-bottom" viewBox="0 0 16 16">
                 <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0Z"/>
                 <path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6.5a.5.5 0 0 1-1 0V1H3v14h3v-2.5a.5.5 0 0 1 .5-.5H8v4H3a1 1 0 0 1-1-1V1Z"/>
                 <path d="M4.5 2a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm3 0a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm3 0a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm-6 3a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm3 0a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm3 0a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm-6 3a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm3 0a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Z"/>
               </svg>
              + Company
            </RouterLink>
          </li>
        </ul>

        <div class="d-flex align-items-center">
          <span class="navbar-text me-3" v-if="authStore.userInfo">
            Hello, {{ authStore.userInfo.displayName || authStore.userInfo.email }}
          </span>
          <button class="btn btn-outline-light btn-sm" @click="handleLogout">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-right me-1 align-text-bottom" viewBox="0 0 16 16">
               <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
               <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
             </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.admin-nav-border {
  border-bottom: 1px solid var(--bs-border-color); /* Subtle border */
}

.navbar-brand {
  color: var(--bs-emphasis-color);
}

.nav-link {
  color: var(--bs-body-color);
  opacity: 0.8;
  transition: opacity 0.2s ease-in-out, color 0.2s ease-in-out;
}

.nav-link:hover,
.nav-link:focus {
  color: var(--bs-emphasis-color);
  opacity: 1;
}

.nav-link.active {
  color: var(--bs-emphasis-color);
  opacity: 1;
  /* Optional: Add a subtle background or border */
  /* background-color: rgba(255, 255, 255, 0.05); */
  /* border-bottom: 2px solid var(--bs-link-color); */
}

.navbar-text {
    color: var(--bs-light-emphasis); /* Use lighter text color */
}

.btn-outline-light {
    --bs-btn-color: var(--bs-emphasis-color);
    --bs-btn-border-color: var(--bs-border-color);
    --bs-btn-hover-color: var(--bs-body-bg);
    --bs-btn-hover-bg: var(--bs-emphasis-color);
    --bs-btn-hover-border-color: var(--bs-emphasis-color);
}
</style>
