<script setup>
import { useRoute, RouterLink } from 'vue-router';

const route = useRoute();

// Function to check if a link is active
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
  <div class="admin-nav-horizontal">
    <ul class="nav-links">
      <li>
        <RouterLink
          class="nav-link"
          :class="{ 'active': isLinkActive('AdminDashboard') }"
          :to="{ name: 'AdminDashboard' }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house-door-fill me-1" viewBox="0 0 16 16"><path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5z"/></svg>
          Home
        </RouterLink>
      </li>
      <li>
        <RouterLink
          class="nav-link"
          :class="{ 'active': isLinkActive('AdminAddUser') }"
          :to="{ name: 'AdminAddUser' }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-plus-fill me-1" viewBox="0 0 16 16"><path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path fill-rule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z"/></svg>
          User
        </RouterLink>
      </li>
      <li>
        <RouterLink
          class="nav-link"
          :class="{ 'active': isLinkActive('AdminAddCompany') }"
          :to="{ name: 'AdminAddCompany' }"
        >
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-building-add me-1" viewBox="0 0 16 16"><path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0Z"/><path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6.5a.5.5 0 0 1-1 0V1H3v14h3v-2.5a.5.5 0 0 1 .5-.5H8v4H3a1 1 0 0 1-1-1V1Z"/><path d="M4.5 2a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm3 0a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm3 0a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm-6 3a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm3 0a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm3 0a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm-6 3a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Zm3 0a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1Z"/></svg>
          Company
        </RouterLink>
      </li>
       <li>
        <RouterLink
          class="nav-link"
          :class="{ 'active': isLinkActive('AdminRequests') }"
          :to="{ name: 'AdminRequests' }"
        >
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-card-list me-1" viewBox="0 0 16 16"><path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/><path d="M5 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 5 8zm0-2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-1-5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM4 8a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm0 2.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"/></svg>
          Requests
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* Styles based on Style Guide Page 2 */
.admin-nav-horizontal {
  background-color: var(--card-fill); /* #1a1a1a */
  border: 1px solid var(--grey-border); /* #a1a1a1 */
  border-radius: 10px; /* Rounded corners */
  padding: 0.5rem 1rem; /* Inner padding */
  margin-bottom: 1.5rem; /* Space below nav bar */
  width: 100%; /* Take full width */
  box-sizing: border-box;
}

.nav-links {
  list-style: none;
  padding-left: 0;
  margin-bottom: 0;
  display: flex; /* Arrange items horizontally */
  justify-content: flex-start; /* Align items to the start */
  align-items: center; /* Center items vertically */
  gap: 0.5rem; /* Space between links */
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
}

.nav-link {
  display: flex;
  align-items: center;
  color: var(--text-primary); /* #d9d9d9 */
  padding: 0.6rem 1.2rem; /* Adjust link padding */
  border-radius: 50px; /* Fully rounded */
  font-weight: var(--font-weight-medium);
  transition: background-color 0.2s ease, color 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
  border: 1px solid transparent; /* Placeholder for hover/active */
}

.nav-link svg {
    margin-right: 0.5rem; /* Space between icon and text */
    opacity: 0.8;
    width: 16px; /* Explicit icon size */
    height: 16px;
}

.nav-link:hover {
  background-color: var(--bs-secondary-bg); /* Lighter background on hover */
  color: var(--text-white);
  border-color: var(--grey-border); /* Add border on hover */
}
.nav-link:hover svg {
    opacity: 1;
}

.nav-link.active {
  background-color: var(--blue-action); /* #5271ff */
  color: var(--text-white);
  font-weight: var(--font-weight-semibold);
  border-color: var(--blue-action);
}
.nav-link.active svg {
    opacity: 1;
}

</style>
