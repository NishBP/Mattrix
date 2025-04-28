<script setup>
import { ref, computed, watch } from 'vue';
import { useAdminDataStore } from '@/stores/adminDataStore';
import ConfirmationDialog from './ConfirmationDialog.vue';

const adminStore = useAdminDataStore();

// --- Computed properties to determine which modal should be visible ---
const activeModal = computed(() => {
    if (adminStore.isConfirmDialogVisible) return 'confirm';
    if (adminStore.isEditUserModalVisible) return 'editUser';
    if (adminStore.isEditCompanyModalVisible) return 'editCompany';
    if (adminStore.isViewLeadModalVisible) return 'viewLead';
    return null; // No modal active
});

// --- Edit User Modal Logic ---
const userFormData = ref({});
watch(() => adminStore.selectedUserForEdit, (newUser) => {
    if (newUser) {
        userFormData.value = { ...newUser };
    } else {
        userFormData.value = {};
    }
}, { immediate: true });

const handleUpdateUser = async () => {
    if (!userFormData.value.displayName) {
        alert("Display name cannot be empty.");
        return;
    }
    await adminStore.updateUser(userFormData.value.id, userFormData.value);
};

const handleDeleteUser = () => {
    adminStore.openConfirmDialog({
        title: 'Delete User',
        message: `Are you sure you want to delete user ${adminStore.selectedUserForEdit?.displayName || adminStore.selectedUserForEdit?.email}? This action cannot be undone.`,
        confirmText: 'Delete User',
        onConfirm: () => adminStore.deleteUser(adminStore.selectedUserForEdit.id),
        data: adminStore.selectedUserForEdit.id
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
    if (!companyFormData.value.companyName) {
        alert("Company name cannot be empty.");
        return;
    }
    await adminStore.updateCompany(companyFormData.value.id, companyFormData.value);
};

// --- View Lead Modal Logic ---
const leadStatus = ref('');
watch(() => adminStore.selectedLeadForView, (newLead) => {
    if (newLead) {
        leadStatus.value = newLead.status;
    } else {
        leadStatus.value = '';
    }
}, { immediate: true });

const handleUpdateLeadStatus = async () => {
    if (!adminStore.selectedLeadForView || !leadStatus.value) return;
    await adminStore.updateLeadStatus(adminStore.selectedLeadForView.id, leadStatus.value);
};
</script>

<template>
  <div>
    <!-- Confirmation Dialog -->
    <ConfirmationDialog
        v-if="activeModal === 'confirm'"
        :title="adminStore.confirmDialogConfig.title"
        :message="adminStore.confirmDialogConfig.message"
        :confirm-text="adminStore.confirmDialogConfig.confirmText"
        :cancel-text="adminStore.confirmDialogConfig.cancelText"
        @confirm="adminStore.confirmDialogConfig.onConfirm"
        @cancel="adminStore.closeConfirmDialog"
    />

    <!-- Edit User Modal -->
    <div v-if="activeModal === 'editUser'" class="modal-overlay">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Edit User: {{ adminStore.selectedUserForEdit?.displayName }}</h5>
                    <button type="button" class="close-button" @click="adminStore.closeEditUserModal">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="handleUpdateUser">
                        <div class="form-group">
                            <label for="editUserName">Display Name</label>
                            <input type="text" id="editUserName" class="form-control" v-model="userFormData.displayName" required>
                        </div>
                        <div class="form-group">
                            <label for="editUserEmail">Email</label>
                            <input type="email" id="editUserEmail" class="form-control" v-model="userFormData.email" required disabled>
                        </div>
                        <div class="form-group">
                            <label for="editUserRole">Role</label>
                            <select id="editUserRole" class="form-select" v-model="userFormData.role" required>
                                <option value="CategoryManager">Category Manager</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="editUserIsActive" v-model="userFormData.isActive">
                            <label class="form-check-label" for="editUserIsActive">
                                Account Active
                            </label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-delete" @click="handleDeleteUser">Delete User</button>
                    <div>
                        <button type="button" class="btn-cancel" @click="adminStore.closeEditUserModal">Cancel</button>
                        <button type="button" class="btn-save" @click="handleUpdateUser">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Edit Company Modal -->
    <div v-if="activeModal === 'editCompany'" class="modal-overlay">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Edit Company: {{ adminStore.selectedCompanyForEdit?.companyName }}</h5>
                    <button type="button" class="close-button" @click="adminStore.closeEditCompanyModal">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="handleUpdateCompany">
                        <div class="form-group">
                            <label for="editCompanyName">Company Name</label>
                            <input type="text" id="editCompanyName" class="form-control" v-model="companyFormData.companyName" required>
                        </div>
                        <div class="form-group">
                            <label for="editSubscriptionStatus">Subscription Status</label>
                            <select id="editSubscriptionStatus" class="form-select" v-model="companyFormData.subscriptionStatus">
                                <option value="Active">Active</option>
                                <option value="Setting up">Setting up</option>
                                <option value="Services Paused">Services Paused</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editCompanyWebsite">Website</label>
                            <input type="url" id="editCompanyWebsite" class="form-control" v-model="companyFormData.companyWebsite">
                        </div>
                        <div class="form-group">
                            <label for="editBusinessReg">Business Registration Number</label>
                            <input type="text" id="editBusinessReg" class="form-control" v-model="companyFormData.businessRegistrationNumber">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-cancel" @click="adminStore.closeEditCompanyModal">Cancel</button>
                    <button type="button" class="btn-save" @click="handleUpdateCompany">Save Changes</button>
                </div>
            </div>
        </div>
    </div>

    <!-- View Lead Modal -->
    <div v-if="activeModal === 'viewLead'" class="modal-overlay">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Lead Details: {{ adminStore.selectedLeadForView?.companyName }}</h5>
                    <button type="button" class="close-button" @click="adminStore.closeViewLeadModal()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div v-if="adminStore.selectedLeadForView">
                        <div class="lead-details">
                            <div class="detail-item">
                                <div class="detail-label">Company Name</div>
                                <div class="detail-value">{{ adminStore.selectedLeadForView.companyName }}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Website</div>
                                <div class="detail-value">{{ adminStore.selectedLeadForView.companyWebsite || 'N/A' }}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Reg. Number</div>
                                <div class="detail-value">{{ adminStore.selectedLeadForView.businessRegistrationNumber || 'N/A' }}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Contact Name</div>
                                <div class="detail-value">{{ adminStore.selectedLeadForView.contactPersonName }}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Contact Email</div>
                                <div class="detail-value">{{ adminStore.selectedLeadForView.contactPersonEmail }}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Contact Phone</div>
                                <div class="detail-value">{{ adminStore.selectedLeadForView.contactPersonPhone || 'N/A' }}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Stores Operated</div>
                                <div class="detail-value">{{ adminStore.selectedLeadForView.numberOfStoresRange }}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Estimated Users</div>
                                <div class="detail-value">{{ adminStore.selectedLeadForView.estimatedUsersRange || 'N/A' }}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Current Method</div>
                                <div class="detail-value">{{ adminStore.selectedLeadForView.currentPlanogramMethod }}</div>
                            </div>
                            <div v-if="adminStore.selectedLeadForView.currentPlanogramMethod === 'Software'" class="detail-item">
                                <div class="detail-label">Existing Software</div>
                                <div class="detail-value">{{ adminStore.selectedLeadForView.existingSoftwareName }}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Challenges</div>
                                <div class="detail-value">{{ adminStore.selectedLeadForView.keyChallenges || 'N/A' }}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">How Heard</div>
                                <div class="detail-value">{{ adminStore.selectedLeadForView.howHeard || 'N/A' }}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Submitted</div>
                                <div class="detail-value">{{ adminStore.selectedLeadForView.submissionTimestamp?.toDate().toLocaleString() || 'N/A' }}</div>
                            </div>
                        </div>

                        <div class="status-update">
                            <div class="status-label">Update Status:</div>
                            <div class="status-controls">
                                <select class="status-select" v-model="leadStatus">
                                    <option value="New">New</option>
                                    <option value="Contacted">Contacted</option>
                                    <option value="Qualified">Qualified</option>
                                    <option value="Archived">Archived</option>
                                </select>
                                <button 
                                    class="btn-update" 
                                    @click="handleUpdateLeadStatus" 
                                    :disabled="leadStatus === adminStore.selectedLeadForView.status"
                                >
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
                    <button type="button" class="btn-close" @click="adminStore.closeViewLeadModal()">Close</button>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
}

.modal-dialog {
    width: 100%;
    max-width: 500px;
    margin: 1.75rem;
}

.modal-dialog.modal-lg {
    max-width: 800px;
}

.modal-content {
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    overflow: hidden;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
}

.modal-title {
    margin: 0;
    color: white;
    font-size: 1.25rem;
    font-weight: 600;
}

.close-button {
    background: none;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    padding: 0.25rem;
    transition: color 0.2s;
}

.close-button:hover {
    color: white;
}

.modal-body {
    padding: 1.5rem;
    color: var(--text-color);
    max-height: 70vh;
    overflow-y: auto;
}

.form-group {
    margin-bottom: 1.25rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: white;
}

.form-control, .form-select {
    width: 100%;
    padding: 0.5rem 0.75rem;
    background-color: var(--bs-body-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: white;
}

.form-control:focus, .form-select:focus {
    outline: none;
    border-color: var(--status-blue);
    box-shadow: 0 0 0 0.2rem rgba(82, 113, 255, 0.25);
}

.form-check {
    margin-top: 1rem;
    display: flex;
    align-items: center;
}

.form-check-input {
    margin-right: 0.5rem;
}

.form-check-label {
    color: var(--text-color);
}

.modal-footer {
    padding: 1rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.btn-delete, .btn-cancel, .btn-save, .btn-update, .btn-close {
    padding: 0.5rem 1.25rem;
    border: none;
    border-radius: 50px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-delete, .btn-cancel, .btn-save, .btn-update, .btn-close:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-delete {
    background-color: var(--status-red);
    color: white;
}

.btn-cancel {
    background-color: #6c757d;
    color: white;
    margin-right: 0.5rem;
}

.btn-save {
    background-color: var(--status-blue);
    color: white;
}

.btn-close {
    background-color: #6c757d;
    color: white;
}

.btn-update {
    background-color: var(--status-blue);
    color: white;
    border-radius: 50px;
    padding: 0.5rem 1.25rem;
}

.btn-update:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
}

/* Lead Details Styling */
.lead-details {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

.detail-item {
    margin-bottom: 0.75rem;
}

.detail-label {
    color: #9e9e9e;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
}

.detail-value {
    color: white;
}

.status-update {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.status-label {
    font-weight: 500;
    color: white;
}

.status-controls {
    display: flex;
    gap: 1rem;
}

.status-select {
    padding: 0.5rem 0.75rem;
    background-color: var(--bs-body-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: white;
    min-width: 150px;
}

@media (max-width: 768px) {
    .lead-details {
        grid-template-columns: 1fr;
    }

    .status-update {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .status-controls {
        width: 100%;
    }

    .status-select {
        flex-grow: 1;
    }
}
</style>