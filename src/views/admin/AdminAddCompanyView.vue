<script setup>
import { ref, reactive } from 'vue';
import { useAdminDataStore } from '@/stores/adminDataStore';

const adminStore = useAdminDataStore();

// Form state
const formData = reactive({
  companyName: '',
  businessRegistrationNumber: '',
  companyWebsite: '',
  primaryContactName: '',
  primaryContactEmail: '',
  primaryContactPhone: '',
  // subscriptionStatus will be set to 'Setting up' by the store action
});

// State for loading, errors, and success messages
const isLoading = ref(false);
const error = ref(null);
const successMessage = ref('');

// Function to handle form submission
const handleSubmit = async () => {
  isLoading.value = true;
  error.value = null;
  successMessage.value = '';

  // Basic Validation
  if (!formData.companyName) {
    error.value = 'Company Name is required.';
    isLoading.value = false;
    return;
  }

  try {
    // Prepare data (exclude fields not needed for add)
     const companyData = {
        companyName: formData.companyName,
        businessRegistrationNumber: formData.businessRegistrationNumber || null,
        companyWebsite: formData.companyWebsite || null,
        primaryContactName: formData.primaryContactName || null,
        primaryContactEmail: formData.primaryContactEmail || null,
        primaryContactPhone: formData.primaryContactPhone || null,
        // The store action adds createdAt and sets initial subscriptionStatus
    };

    // Call the addCompany action from the store
    const success = await adminStore.addCompany(companyData);

    if (success) {
      successMessage.value = `Company ${formData.companyName} created successfully!`;
      // Clear the form
      Object.assign(formData, {
         companyName: '', businessRegistrationNumber: '', companyWebsite: '',
         primaryContactName: '', primaryContactEmail: '', primaryContactPhone: ''
      });
    } else {
      // Use error from the store if available
      error.value = adminStore.error || 'Failed to add company.';
    }

  } catch (err) {
    console.error("Add Company Error:", err);
    error.value = `An unexpected error occurred: ${err.message}`;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="admin-add-company">
    <h1 class="h2 fw-semibold mb-4 pt-3">Add New Company</h1>

     <div class="card shadow-sm">
        <div class="card-body p-4">
            <form @submit.prevent="handleSubmit">
                 <h5 class="mb-3 fw-medium">Company Information</h5>
                <div class="row g-3 mb-4">
                    <div class="col-md-6">
                        <label for="companyName" class="form-label">Company Name *</label>
                        <input type="text" class="form-control" id="companyName" v-model.trim="formData.companyName" required :disabled="isLoading">
                    </div>
                    <div class="col-md-6">
                        <label for="companyWebsite" class="form-label">Company Website</label>
                        <input type="url" class="form-control" id="companyWebsite" placeholder="https://example.com" v-model.trim="formData.companyWebsite" :disabled="isLoading">
                    </div>
                    <div class="col-md-6">
                        <label for="businessReg" class="form-label">Business Registration Number</label>
                        <input type="text" class="form-control" id="businessReg" v-model.trim="formData.businessRegistrationNumber" :disabled="isLoading">
                    </div>
                </div>

                 <h5 class="mb-3 fw-medium">Primary Contact (Optional)</h5>
                 <div class="row g-3 mb-4">
                    <div class="col-md-6">
                        <label for="primaryContactName" class="form-label">Contact Name</label>
                        <input type="text" class="form-control" id="primaryContactName" v-model.trim="formData.primaryContactName" :disabled="isLoading">
                    </div>
                    <div class="col-md-6">
                        <label for="primaryContactEmail" class="form-label">Contact Email</label>
                        <input type="email" class="form-control" id="primaryContactEmail" v-model.trim="formData.primaryContactEmail" :disabled="isLoading">
                    </div>
                    <div class="col-md-6">
                        <label for="primaryContactPhone" class="form-label">Contact Phone</label>
                        <input type="tel" class="form-control" id="primaryContactPhone" v-model.trim="formData.primaryContactPhone" :disabled="isLoading">
                    </div>
                 </div>

                 <div v-if="isLoading" class="text-center mb-3">
                    <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Creating company...</span>
                    </div>
                    <span class="ms-2">Creating company...</span>
                </div>

                <div v-if="error && !isLoading" class="alert alert-danger alert-dismissible fade show" role="alert">
                    <small>{{ error }}</small>
                    <button type="button" class="btn-close btn-sm" @click="error = null" aria-label="Close"></button>
                </div>

                 <div v-if="successMessage && !isLoading" class="alert alert-success" role="alert">
                    <small>{{ successMessage }}</small>
                </div>

                 <div class="d-grid d-md-flex justify-content-md-end">
                    <button type="submit" class="btn btn-primary px-5" :disabled="isLoading">
                        Create Company
                    </button>
                </div>

            </form>
        </div>
     </div>
  </div>
</template>

<style scoped>
/* Reusing styles similar to Add User form */
.admin-add-company {
  /* Add specific styles if needed */
}
.card {
    background-color: var(--bs-secondary-bg);
    border-color: var(--bs-border-color);
}
.form-label {
    font-weight: var(--font-weight-medium);
}
.form-control {
    background-color: var(--bs-body-bg);
    color: var(--bs-body-color);
    border: 1px solid var(--bs-border-color);
}
.form-control:focus {
    background-color: var(--bs-body-bg);
    color: var(--bs-body-color);
    border-color: var(--bs-link-color);
    box-shadow: 0 0 0 0.2rem rgba(var(--bs-link-color-rgb), 0.2);
}
.form-control::placeholder {
    color: var(--bs-form-control-placeholder-color);
}
.btn-primary {
     --bs-btn-color: #fff;
     --bs-btn-bg: var(--bs-link-color);
     --bs-btn-border-color: var(--bs-link-color);
     --bs-btn-hover-bg: #5a8ced;
     --bs-btn-hover-border-color: #5a8ced;
     --bs-btn-active-bg: #4e7fe1;
     --bs-btn-active-border-color: #4e7fe1;
     --bs-btn-disabled-bg: var(--bs-link-color);
     --bs-btn-disabled-border-color: var(--bs-link-color);
}
.alert-danger {
    --bs-alert-color: #f8d7da;
    --bs-alert-bg: #842029;
    --bs-alert-border-color: #f5c2c7;
}
.alert-danger .btn-close {
    filter: invert(1) grayscale(100%) brightness(200%);
}
.alert-success {
    --bs-alert-color: #d1e7dd;
    --bs-alert-bg: #0f5132;
    --bs-alert-border-color: #badbcc;
}
h5 {
    color: var(--bs-emphasis-color);
    border-bottom: 1px solid var(--bs-border-color);
    padding-bottom: 0.5rem;
    margin-bottom: 1.5rem !important;
}
</style>
