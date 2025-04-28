<script setup>
// *** Import AdminNav HERE ***
import AdminNav from '@/components/admin/AdminNav.vue';
import AdminModals from '@/components/admin/AdminModals.vue';
import { useAdminDataStore } from '@/stores/adminDataStore';

const adminStore = useAdminDataStore();
</script>

<template>
  <div class="admin-layout">
    <main class="admin-content-area">
      <div class="p-3 p-md-4"> <AdminNav />
            <RouterView />
       </div>
    </main>

    <AdminModals v-if="adminStore.isEditUserModalVisible || adminStore.isEditCompanyModalVisible || adminStore.isConfirmDialogVisible || adminStore.isViewLeadModalVisible" />

  </div>
</template>

<style scoped>
.admin-layout {
  background-color: var(--bs-body-bg); /* e.g., #111315 */
  min-height: 100vh;
}
.admin-content-area {
  padding: 0; /* Layout itself has no padding */
  width: 100%;
}
/* The p-3/p-md-4 wrapper provides padding for the content */

</style>
