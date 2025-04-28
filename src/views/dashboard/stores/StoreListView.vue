<script setup>
import { ref, onMounted, computed } from 'vue';
import { useDashboardStore } from '@/stores/dashboardStore';
import AddEditStoreModal from '@/components/dashboard/stores/AddEditStoreModal.vue';
import ConfirmationDialog from '@/components/admin/ConfirmationDialog.vue'; // Reusing admin confirmation

const dashboardStore = useDashboardStore();

// State for modals
const isAddEditModalVisible = ref(false);
const storeToEdit = ref(null);
const isConfirmModalVisible = ref(false);
const storeToDelete = ref(null);

onMounted(() => {
    dashboardStore.fetchStores();
});

// --- Methods ---
const openAddModal = () => {
    storeToEdit.value = null;
    isAddEditModalVisible.value = true;
};

const openEditModal = (store) => {
    storeToEdit.value = { ...store };
    isAddEditModalVisible.value = true;
};

const closeAddEditModal = () => {
    isAddEditModalVisible.value = false;
    storeToEdit.value = null;
};

const openDeleteConfirm = (store) => {
    storeToDelete.value = store;
    isConfirmModalVisible.value = true;
};

const closeDeleteConfirm = () => {
    isConfirmModalVisible.value = false;
    storeToDelete.value = null;
};

const handleSaveStore = async (storeData, managerData) => {
    let success = false;
    if (storeToEdit.value) { // Edit mode
        console.log("Updating store:", storeToEdit.value.id, storeData);
        success = await dashboardStore.updateStore(storeToEdit.value.id, storeData);
        // TODO: Handle store manager update/creation during edit if needed
    } else { // Add mode
        console.log("Adding store:", storeData, "Manager:", managerData);
        success = await dashboardStore.addStore(storeData, managerData);
    }
    if (success) {
        closeAddEditModal();
    } // Error is handled in store and displayed below
};

const handleConfirmDelete = async () => {
    if (storeToDelete.value) {
        console.log("Deleting store:", storeToDelete.value.id);
        const success = await dashboardStore.deleteStore(storeToDelete.value.id);
        if (success) {
            closeDeleteConfirm();
        }
    }
};

// Search/Filter
const searchTerm = ref('');
const filteredStores = computed(() => {
    if (!searchTerm.value.trim()) {
        return dashboardStore.stores;
    }
    const lowerSearch = searchTerm.value.toLowerCase();
    return dashboardStore.stores.filter(store =>
        store.name?.toLowerCase().includes(lowerSearch) ||
        store.address?.toLowerCase().includes(lowerSearch) ||
        store.managerName?.toLowerCase().includes(lowerSearch) // Search manager name
    );
});

</script>

<template>
  <div class="store-list-view">
    <h1 class="h3 mb-4 fw-semibold">Stores</h1>

    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
       <div class="input-group" style="max-width: 400px;">
            <span class="input-group-text bg-secondary border-secondary-subtle">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>
            </span>
            <input type="search" class="form-control bg-secondary border-secondary-subtle text-white" placeholder="Search stores by name, address, manager..." v-model="searchTerm">
       </div>
       <button class="btn btn-primary btn-purple" @click="openAddModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg me-1" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/></svg>
            Add New Store
        </button>
    </div>

     <div v-if="dashboardStore.isLoading.stores" class="text-center my-5">
        <div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>
     </div>
      <div v-else-if="dashboardStore.error" class="alert alert-danger">
          Error: {{ dashboardStore.error }}
      </div>

    <div v-else class="row g-4">
        <div v-if="filteredStores.length === 0" class="col-12 text-center text-muted">
            No stores found{{ searchTerm ? ' matching your search' : '' }}.
        </div>
         <div v-for="store in filteredStores" :key="store.id" class="col-sm-6 col-md-4 col-lg-3">
             <div class="card h-100 store-card">
                 <div class="card-body d-flex flex-column">
                     <h5 class="card-title fw-medium mb-2">{{ store.name }}</h5>
                     <p class="card-text text-muted small flex-grow-1">
                         {{ store.address || 'No address provided' }} <br>
                         Manager: {{ store.managerName || 'None' }}
                     </p>
                     <div class="mt-auto d-flex justify-content-end gap-2">
                          <button class="btn btn-sm btn-outline-light" @click="openEditModal(store)">Edit</button>
                          <button class="btn btn-sm btn-outline-danger" @click="openDeleteConfirm(store)">Delete</button>
                     </div>
                 </div>
             </div>
         </div>
    </div>

    <AddEditStoreModal
        :is-visible="isAddEditModalVisible"
        :store="storeToEdit"
        @close="closeAddEditModal"
        @save="handleSaveStore"
    />

     <ConfirmationDialog
        v-if="isConfirmModalVisible"
        title="Confirm Deletion"
        :message="`Are you sure you want to delete store '${storeToDelete?.name}'?`"
        confirm-text="Delete Store"
        @confirm="handleConfirmDelete"
        @cancel="closeDeleteConfirm"
     />

  </div>
</template>

<style scoped>
/* Styles from previous example */
.store-card { background-color: var(--card-fill); border-color: var(--grey-border); color: var(--text-primary); transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out; }
.store-card:hover { transform: translateY(-3px); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); }
.card-title { color: var(--text-white); }
.btn-purple { background-color: var(--medium-slate-blue); border-color: var(--medium-slate-blue); color: var(--text-white); }
.btn-purple:hover { background-color: var(--tropical-indigo); border-color: var(--tropical-indigo); }
.input-group-text { background-color: var(--bs-secondary-bg); border-color: var(--grey-border); color: var(--grey-border); }
.form-control { background-color: var(--bs-secondary-bg); border-color: var(--grey-border); color: var(--text-white); }
.form-control::placeholder { color: var(--grey-border); }
.form-control:focus { background-color: var(--bs-secondary-bg); border-color: var(--medium-slate-blue); box-shadow: 0 0 0 0.2rem rgba(115, 113, 252, 0.25); color: var(--text-white); }
.text-muted { color: var(--grey-border) !important; } /* Ensure muted text is visible */
</style>
