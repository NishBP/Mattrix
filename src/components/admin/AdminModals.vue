<script setup>
import { computed } from 'vue';
import { useAdminDataStore } from '@/stores/adminDataStore';
import ConfirmationDialog from './ConfirmationDialog.vue'; // Import confirmation dialog

const adminStore = useAdminDataStore();

// --- Computed properties to determine which modal should be visible ---
// This avoids multiple v-if/v-else chains in the template
const activeModal = computed(() => {
    if (adminStore.isConfirmDialogVisible) return 'confirm';
    if (adminStore.isEditUserModalVisible) return 'editUser';
    if (adminStore.isEditCompanyModalVisible) return 'editCompany';
    if (adminStore.isViewLeadModalVisible) return 'viewLead';
    return null; // No modal active
});

// --- Edit User Modal Logic ---
const userFormData = ref({}); // Holds data for the edit form
watch(() => adminStore.selectedUserForEdit, (newUser) => {
    if (newUser) {
        // Clone the selected user data into the form data ref
        userFormData.value = { ...newUser };
    } else {
        userFormData.value = {}; // Clear form when modal closes
    }
}, { immediate: true }); // Use immediate to initialize on component load

const handleUpdateUser = async () => {
    // TODO: Implement user update logic
    // Call adminStore.updateUser(userFormData.value.id, userFormData.value)
    console.log("Saving user:", userFormData.value);
     // Basic validation example
    if (!userFormData.value.displayName) {
        alert("Display name cannot be empty.");
        return;
    }
    await adminStore.updateUser(userFormData.value.id, userFormData.value);
    // Store action handles closing the modal on success
};
const handleDeleteUser = () => {
    // Open confirmation dialog before deleting
    adminStore.openConfirmDialog({
        title: 'Delete User',
        message: `Are you sure you want to delete user ${adminStore.selectedUserForEdit?.displayName || adminStore.selectedUserForEdit?.email}? This action cannot be undone.`,
        confirmText: 'Delete User',
        onConfirm: () => adminStore.deleteUser(adminStore.selectedUserForEdit.id),
        data: adminStore.selectedUserForEdit.id // Pass user ID if needed
    });
};


// --- Edit Company Modal Logic ---
const companyFormData = ref({});
watch(() => adminStore.selectedCompanyForEdit, (newCompany) => {
    if (newCompany) {
        companyFormData.value = { ...newCompany };
    } else {
        companyFormData.value = {};
    }
}, { immediate: true });

const handleUpdateCompany = async () => {
    // TODO: Implement company update logic
    console.log("Saving company:", companyFormData.value);
     if (!companyFormData.value.companyName) {
        alert("Company name cannot be empty.");
        return;
    }
    await adminStore.updateCompany(companyFormData.value.id, companyFormData.value);
};
// Delete company action is usually triggered from the column, not the edit modal directly


// --- View Lead Modal Logic ---
const leadStatus = ref('');
watch(() => adminStore.selectedLeadForView, (newLead) => {
    if (newLead) {
        leadStatus.value = newLead.status; // Initialize status for potential update
    } else {
        leadStatus.value = '';
    }
}, { immediate: true });

const handleUpdateLeadStatus = async () => {
    if (!adminStore.selectedLeadForView || !leadStatus.value) return;
    await adminStore.updateLeadStatus(adminStore.selectedLeadForView.id, leadStatus.value);
    // Optionally close modal after update, or let user close manually
    // adminStore.closeViewLeadModal();
};

</script>

<template>
  <div> <ConfirmationDialog
        v-if="activeModal === 'confirm'"
        :title="adminStore.confirmDialogConfig.title"
        :message="adminStore.confirmDialogConfig.message"
        :confirm-text="adminStore.confirmDialogConfig.confirmText"
        :cancel-text="adminStore.confirmDialogConfig.cancelText"
        @confirm="adminStore.confirmDialogConfig.onConfirm"
        @cancel="adminStore.closeConfirmDialog"
    />

    <div v-if="activeModal === 'editUser'" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.6);">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Edit User: {{ adminStore.selectedUserForEdit?.displayName }}</h5>
                    <button type="button" class="btn-close btn-close-white" @click="adminStore.closeEditUserModal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p class="text-muted">Edit User Form fields will go here.</p>
                     <form @submit.prevent="handleUpdateUser">
                        <div class="mb-3">
                            <label for="editUserName" class="form-label">Display Name</label>
                            <input type="text" id="editUserName" class="form-control" v-model="userFormData.displayName" required>
                        </div>
                         <div class="mb-3">
                            <label for="editUserEmail" class="form-label">Email</label>
                            <input type="email" id="editUserEmail" class="form-control" v-model="userFormData.email" required disabled> </div>
                         <div class="mb-3">
                            <label for="editUserRole" class="form-label">Role</label>
                             <select id="editUserRole" class="form-select" v-model="userFormData.role" required>
                                <option value="CategoryManager">Category Manager</option>
                                <option value="Admin">Admin</option>
                                </select>
                        </div>
                         <div class="form-check mb-3">
                            <input class="form-check-input" type="checkbox" id="editUserIsActive" v-model="userFormData.isActive">
                            <label class="form-check-label" for="editUserIsActive">
                                Account Active
                            </label>
                        </div>
                         </form>
                </div>
                <div class="modal-footer justify-content-between">
                    <button type="button" class="btn btn-outline-danger" @click="handleDeleteUser">Delete User</button>
                    <div>
                        <button type="button" class="btn btn-secondary me-2" @click="adminStore.closeEditUserModal">Cancel</button>
                        <button type="button" class="btn btn-primary" @click="handleUpdateUser">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-if="activeModal === 'editCompany'" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.6);">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Edit Company: {{ adminStore.selectedCompanyForEdit?.companyName }}</h5>
                    <button type="button" class="btn-close btn-close-white" @click="adminStore.closeEditCompanyModal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                     <p class="text-muted">Edit Company Form fields will go here.</p>
                     <form @submit.prevent="handleUpdateCompany">
                         <div class="mb-3">
                            <label for="editCompanyName" class="form-label">Company Name</label>
                            <input type="text" id="editCompanyName" class="form-control" v-model="companyFormData.companyName" required>
                        </div>
                         </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="adminStore.closeEditCompanyModal">Cancel</button>
                    <button type="button" class="btn btn-primary" @click="handleUpdateCompany">Save Changes</button>
                </div>
            </div>
        </div>
    </div>


    <div v-if="activeModal === 'viewLead'" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.6);">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Lead Details: {{ adminStore.selectedLeadForView?.companyName }}</h5>
                    <button type="button" class="btn-close btn-close-white" @click="adminStore.closeViewLeadModal()" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div v-if="adminStore.selectedLeadForView">
                         <dl class="row">
                            <dt class="col-sm-4">Company Name</dt><dd class="col-sm-8">{{ adminStore.selectedLeadForView.companyName }}</dd>
                            <dt class="col-sm-4">Website</dt><dd class="col-sm-8">{{ adminStore.selectedLeadForView.companyWebsite || 'N/A' }}</dd>
                            <dt class="col-sm-4">Reg. Number</dt><dd class="col-sm-8">{{ adminStore.selectedLeadForView.businessRegistrationNumber || 'N/A' }}</dd>
                            <dt class="col-sm-4">Contact Name</dt><dd class="col-sm-8">{{ adminStore.selectedLeadForView.contactPersonName }}</dd>
                            <dt class="col-sm-4">Contact Email</dt><dd class="col-sm-8">{{ adminStore.selectedLeadForView.contactPersonEmail }}</dd>
                            <dt class="col-sm-4">Contact Phone</dt><dd class="col-sm-8">{{ adminStore.selectedLeadForView.contactPersonPhone || 'N/A' }}</dd>
                            <dt class="col-sm-4">Stores Operated</dt><dd class="col-sm-8">{{ adminStore.selectedLeadForView.numberOfStoresRange }}</dd>
                            <dt class="col-sm-4">Estimated Users</dt><dd class="col-sm-8">{{ adminStore.selectedLeadForView.estimatedUsersRange || 'N/A' }}</dd>
                            <dt class="col-sm-4">Current Method</dt><dd class="col-sm-8">{{ adminStore.selectedLeadForView.currentPlanogramMethod }}</dd>
                            <template v-if="adminStore.selectedLeadForView.currentPlanogramMethod === 'Software'">
                                <dt class="col-sm-4">Existing Software</dt><dd class="col-sm-8">{{ adminStore.selectedLeadForView.existingSoftwareName }}</dd>
                            </template>
                            <dt class="col-sm-4">Challenges</dt><dd class="col-sm-8">{{ adminStore.selectedLeadForView.keyChallenges || 'N/A' }}</dd>
                            <dt class="col-sm-4">How Heard</dt><dd class="col-sm-8">{{ adminStore.selectedLeadForView.howHeard || 'N/A' }}</dd>
                            <dt class="col-sm-4">Submitted</dt><dd class="col-sm-8">{{ adminStore.selectedLeadForView.submissionTimestamp?.toDate().toLocaleString() || 'N/A' }}</dd>
                         </dl>
                         <hr>
                         <div class="row align-items-center">
                             <div class="col-md-4">
                                 <label for="leadStatusUpdate" class="form-label fw-medium">Update Status:</label>
                             </div>
                              <div class="col-md-5">
                                 <select id="leadStatusUpdate" class="form-select" v-model="leadStatus">
                                     <option value="New">New</option>
                                     <option value="Contacted">Contacted</option>
                                     <option value="Qualified">Qualified</option>
                                     <option value="Archived">Archived</option>
                                 </select>
                             </div>
                              <div class="col-md-3 d-grid">
                                 <button class="btn btn-primary" @click="handleUpdateLeadStatus" :disabled="leadStatus === adminStore.selectedLeadForView.status">
                                     Update
                                 </button>
                             </div>
                         </div>

                     </div>
                     <div v-else>
                         <p>Loading lead details...</p>
                     </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="adminStore.closeViewLeadModal()">Close</button>
                </div>
            </div>
        </div>
    </div>

  </div> </template>

<style scoped>
/* Scoped styles for modals */
.modal {
    /* Ensure modals are displayed correctly */
    display: block;
}
.modal-content {
    background-color: var(--bs-secondary-bg);
    border: 1px solid var(--bs-border-color);
    color: var(--bs-body-color);
}
.modal-header, .modal-footer {
    border-bottom-color: var(--bs-border-color);
    border-top-color: var(--bs-border-color);
}
.modal-title {
    color: var(--bs-emphasis-color);
}
.btn-close-white {
    filter: invert(1) grayscale(100%) brightness(200%);
}

/* Form styling within modals */
.modal-body .form-label {
    font-weight: var(--font-weight-medium);
    font-size: 0.9rem;
}
.modal-body .form-control,
.modal-body .form-select {
    background-color: var(--bs-body-bg);
    color: var(--bs-body-color);
    border: 1px solid var(--bs-border-color);
}
.modal-body .form-control:focus,
.modal-body .form-select:focus {
    background-color: var(--bs-body-bg);
    color: var(--bs-body-color);
    border-color: var(--bs-link-color);
    box-shadow: 0 0 0 0.2rem rgba(var(--bs-link-color-rgb), 0.2);
}
.modal-body .form-check-input {
     background-color: var(--bs-body-bg);
     border: 1px solid var(--bs-border-color);
}
.modal-body .form-check-input:checked {
    background-color: var(--bs-link-color);
    border-color: var(--bs-link-color);
}

/* Lead details styling */
dl dt {
    font-weight: var(--font-weight-medium);
    color: var(--bs-light-emphasis);
}
dl dd {
    color: var(--bs-body-color);
}

</style>
