<script setup>
import { ref, reactive, watch, defineProps, defineEmits, nextTick } from 'vue';
import { useDashboardStore } from '@/stores/dashboardStore'; // Optional: for fetching existing managers

const props = defineProps({
    store: { // Pass store object for editing, null for adding
        type: Object,
        default: null
    },
    isVisible: {
        type: Boolean,
        required: true
    }
});

const emit = defineEmits(['close', 'save']);

const dashboardStore = useDashboardStore(); // If needed

// Form State
const formData = reactive({
    name: '',
    address: '',
    // Add other store fields if needed
});

const managerTab = ref('none'); // 'none', 'create', 'assign'
const managerData = reactive({
    create: {
        email: '',
        password: '',
        displayName: '',
        phoneNumber: '',
        dob: '',
    },
    assign: {
        managerId: '' // ID of existing Store Manager user
    }
});

// Error/Loading state specific to the modal
const localError = ref(null);
const localIsLoading = ref(false); // Use if save operation is complex

// Watch for prop changes to populate form for editing
watch(() => props.store, (newStore) => {
    if (newStore) {
        formData.name = newStore.name || '';
        formData.address = newStore.address || '';
        // Reset manager section for edit mode (manager assignment handled separately for now)
        managerTab.value = 'none';
        resetManagerForms();
    } else {
        // Reset form for add mode
        formData.name = '';
        formData.address = '';
        managerTab.value = 'none';
        resetManagerForms();
    }
    localError.value = null; // Clear errors when modal opens/changes mode
}, { immediate: true });

const resetManagerForms = () => {
     Object.assign(managerData.create, { email: '', password: '', displayName: '', phoneNumber: '', dob: '' });
     managerData.assign.managerId = '';
};

const handleSave = () => {
    localError.value = null;
    // Basic Validation
    if (!formData.name) {
        localError.value = "Store Name is required.";
        return;
    }

    let managerPayload = null;
    if (managerTab.value === 'create') {
        if (!managerData.create.email || !managerData.create.password || !managerData.create.displayName) {
            localError.value = "Manager Email, Password, and Name are required when creating a new manager.";
            return;
        }
         if (managerData.create.password.length < 6) {
             localError.value = "Manager Password must be at least 6 characters.";
             return;
         }
        managerPayload = { ...managerData.create };
    } else if (managerTab.value === 'assign') {
        // TODO: Add validation if assignment is implemented
        // managerPayload = { assignUserId: managerData.assign.managerId };
        localError.value = "Assigning existing managers is not yet implemented.";
        return;
    }

    // Emit data to parent (StoreListView) to handle actual save via store action
    emit('save', { ...formData }, managerPayload);
};

// Focus first input when modal becomes visible
const modalElement = ref(null);
const firstInput = ref(null);
watch(() => props.isVisible, (newValue) => {
    if (newValue) {
        nextTick(() => {
            firstInput.value?.focus();
        });
    }
});

</script>

<template>
    <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.6);" ref="modalElement">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                 <form @submit.prevent="handleSave">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ store ? 'Edit Store' : 'Add New Store' }}</h5>
                        <button type="button" class="btn-close btn-close-white" @click="$emit('close')" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-4">
                            <h6 class="mb-3 fw-medium">Store Details</h6>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label for="storeName" class="form-label">Store Name *</label>
                                    <input type="text" id="storeName" class="form-control" v-model.trim="formData.name" required ref="firstInput">
                                </div>
                                <div class="col-md-6">
                                    <label for="storeAddress" class="form-label">Address</label>
                                    <input type="text" id="storeAddress" class="form-control" v-model.trim="formData.address">
                                </div>
                                </div>
                        </div>

                        <hr>

                        <div class="mb-3" v-if="!store"> <h6 class="mb-3 fw-medium">Store Manager</h6>
                             <ul class="nav nav-tabs mb-3" id="managerTab" role="tablist">
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" :class="{active: managerTab === 'none'}" @click="managerTab = 'none'" type="button">No Manager</button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" :class="{active: managerTab === 'create'}" @click="managerTab = 'create'" type="button">Create New</button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link disabled" :class="{active: managerTab === 'assign'}" @click="managerTab = 'assign'" type="button" title="Not implemented yet">Assign Existing</button>
                                </li>
                             </ul>

                             <div class="tab-content pt-2" id="managerTabContent">
                                 <div class="tab-pane fade" :class="{ 'show active': managerTab === 'create' }" role="tabpanel">
                                    <p class="text-muted small">Create a new user account for the Store Manager.</p>
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <label for="managerName" class="form-label">Manager Name *</label>
                                            <input type="text" id="managerName" class="form-control" v-model.trim="managerData.create.displayName" :required="managerTab === 'create'">
                                        </div>
                                        <div class="col-md-6">
                                            <label for="managerEmail" class="form-label">Manager Email *</label>
                                            <input type="email" id="managerEmail" class="form-control" v-model.trim="managerData.create.email" :required="managerTab === 'create'">
                                        </div>
                                        <div class="col-md-6">
                                            <label for="managerPassword" class="form-label">Password *</label>
                                            <input type="password" id="managerPassword" class="form-control" v-model="managerData.create.password" :required="managerTab === 'create'" autocomplete="new-password">
                                            <div class="form-text">Min. 6 characters.</div>
                                        </div>
                                        <div class="col-md-6">
                                             <label for="managerPhone" class="form-label">Manager Phone</label>
                                             <input type="tel" id="managerPhone" class="form-control" v-model.trim="managerData.create.phoneNumber">
                                         </div>
                                         </div>
                                </div>
                                <div class="tab-pane fade" :class="{ 'show active': managerTab === 'assign' }" role="tabpanel">
                                    <p class="text-muted">Assign an existing Store Manager user (Not implemented).</p>
                                     </div>
                             </div>
                        </div>

                         <div v-if="localError" class="alert alert-danger mt-3">
                             {{ localError }}
                         </div>

                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancel</button>
                        <button type="submit" class="btn btn-primary btn-purple" :disabled="localIsLoading">
                             {{ store ? 'Update Store' : 'Save Store' }}
                        </button>
                    </div>
                 </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Modal Styles from previous examples */
.modal-content { background-color: var(--bs-secondary-bg); color: var(--text-primary); border-color: var(--grey-border); }
.modal-header { border-bottom-color: var(--grey-border); }
.modal-footer { border-top-color: var(--grey-border); }
.modal-title { color: var(--text-white); }
.btn-close-white { filter: invert(1) grayscale(100%) brightness(200%); }

/* Form styling */
.form-label { font-weight: var(--font-weight-medium); font-size: 0.9rem; margin-bottom: 0.3rem; }
.form-control, .form-select { background-color: var(--bs-body-bg); color: var(--text-primary); border: 1px solid var(--grey-border); border-radius: var(--bs-border-radius); }
.form-control:focus, .form-select:focus { background-color: var(--bs-body-bg); color: var(--text-primary); border-color: var(--medium-slate-blue); box-shadow: 0 0 0 0.2rem rgba(115, 113, 252, 0.25); }
.form-text { font-size: 0.8rem; color: var(--bs-secondary-color); }

/* Tab styling */
.nav-tabs { border-bottom-color: var(--grey-border); }
.nav-tabs .nav-link {
    color: var(--text-primary);
    border-color: transparent transparent var(--grey-border) transparent;
    margin-bottom: -1px; /* Overlap border */
    border-top-left-radius: var(--bs-border-radius);
    border-top-right-radius: var(--bs-border-radius);
}
.nav-tabs .nav-link:hover, .nav-tabs .nav-link:focus {
    border-color: transparent transparent var(--medium-slate-blue) transparent;
    color: var(--medium-slate-blue);
    isolation: isolate;
}
.nav-tabs .nav-link.active {
    color: var(--medium-slate-blue);
    background-color: var(--bs-body-bg); /* Match input background */
    border-color: var(--grey-border) var(--grey-border) var(--bs-body-bg) var(--grey-border);
    font-weight: var(--font-weight-semibold);
}
.nav-tabs .nav-link.disabled {
    color: var(--bs-secondary-color);
    background-color: transparent;
    border-color: transparent;
}

.btn-purple {
    background-color: var(--medium-slate-blue);
    border-color: var(--medium-slate-blue);
    color: var(--text-white);
}
.btn-purple:hover {
    background-color: var(--tropical-indigo);
    border-color: var(--tropical-indigo);
}
</style>
