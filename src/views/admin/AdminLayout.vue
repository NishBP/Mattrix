<script setup>
// *** THIS IS THE CORRECTED SCRIPT SETUP BLOCK ***
import AdminNav from '@/components/admin/AdminNav.vue';
import AdminModals from '@/components/admin/AdminModals.vue'; // Import AdminModals
import { useAdminDataStore } from '@/stores/adminDataStore';

const adminStore = useAdminDataStore();
</script>

<template>
  <div class="admin-layout d-flex flex-column min-vh-100">
    <AdminNav />
    <main class="container-fluid flex-grow-1 admin-content-area">
      <RouterView />
    </main>
    <AdminModals v-if="adminStore.isEditUserModalVisible || adminStore.isEditCompanyModalVisible || adminStore.isConfirmDialogVisible || adminStore.isViewLeadModalVisible" />
     </div>
</template>

<style scoped>
/* *** THIS IS THE CORRECTED STYLE BLOCK *** */
.admin-layout {
  background-color: var(--bs-body-bg); /* Ensure layout background is dark */
}
.admin-content-area {
  padding-top: 70px; /* Adjust based on fixed navbar height */
  padding-bottom: 2rem; /* Add some space at the bottom */
}

/* Adjust padding-top if your navbar height differs */
@media (max-width: 991.98px) {
  .admin-content-area {
     /* Navbar might wrap or change height on smaller screens */
     /* Adjust padding-top if necessary after testing */
     padding-top: 60px; /* Example adjustment */
  }
}
</style>
