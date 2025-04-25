<script setup>
import { ref, reactive, computed } from 'vue';
import { useAdminDataStore } from '@/stores/adminDataStore';
import { useRouter, RouterLink } from 'vue-router';

// Use the admin data store (for adding leads)
const adminStore = useAdminDataStore();
// Get the router instance
const router = useRouter();

// Reactive state for the form data
const formData = reactive({
  companyName: '',
  companyWebsite: '',
  businessRegistrationNumber: '',
  contactPersonName: '',
  contactPersonEmail: '',
  contactPersonPhone: '',
  numberOfStoresRange: '', // e.g., '1-10', '11-50', '50+'
  estimatedUsersRange: '', // e.g., '1-5', '6-20', '21+' (Define appropriate ranges)
  currentPlanogramMethod: '', // e.g., 'Manual spreadsheet', 'Software'
  existingSoftwareName: '',
  keyChallenges: '',
  howHeard: '', // Optional: How they heard about the service
});

// Loading and error state specific to this form
const isLoading = ref(false);
const error = ref(null);

// Computed property to check if the "Existing Software" field should be shown
const showExistingSoftwareField = computed(() => formData.currentPlanogramMethod === 'Software');

// Function to handle form submission
const handleSubmit = async () => {
  isLoading.value = true;
  error.value = null;

  // Basic Validation (can be expanded significantly)
  if (!formData.companyName || !formData.contactPersonName || !formData.contactPersonEmail || !formData.numberOfStoresRange || !formData.currentPlanogramMethod) {
      error.value = "Please fill in all required fields.";
      isLoading.value = false;
      return;
  }
  if (formData.currentPlanogramMethod === 'Software' && !formData.existingSoftwareName) {
       error.value = "Please specify the name of the existing software.";
       isLoading.value = false;
       return;
  }

  try {
    // Call the addLead action from the admin store
    const success = await adminStore.addLead(formData);
    if (success) {
      // Redirect to the success page on successful submission
      router.replace({ name: 'SignupSuccess' }); // Use replace to prevent back navigation to the form
    } else {
      // Use the error from the store if available, otherwise show a generic message
      error.value = adminStore.error || 'An unexpected error occurred. Please try again.';
    }
  } catch (err) {
    console.error("Signup Form Submission Error:", err);
    error.value = 'An unexpected error occurred. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-lg-10 col-xl-8">
        <div class="card p-4 p-md-5">
          <div class="card-body">
            <div class="text-center mb-4">
              <h2 class="card-title fw-semibold mb-2">Company Information Form</h2>
              <p class="text-light-emphasis">
                Interested in Our Planogram Solution? Please take some time to fill this form so we can find the best way to serve your needs.
              </p>
            </div>

            <form @submit.prevent="handleSubmit">
              <h5 class="mb-3 fw-medium">Company Details</h5>
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
                 <div class="col-md-6">
                    <label for="numberOfStores" class="form-label mb-2 d-block">Number of Stores Operated *</label>
                    <div class="btn-group w-100" role="group" aria-label="Number of stores operated">
                        <input type="radio" class="btn-check" name="numberOfStoresRange" id="stores1-10" value="1-10" v-model="formData.numberOfStoresRange" autocomplete="off" required :disabled="isLoading">
                        <label class="btn btn-outline-secondary" for="stores1-10">1-10</label>

                        <input type="radio" class="btn-check" name="numberOfStoresRange" id="stores11-50" value="11-50" v-model="formData.numberOfStoresRange" autocomplete="off" :disabled="isLoading">
                        <label class="btn btn-outline-secondary" for="stores11-50">11-50</label>

                        <input type="radio" class="btn-check" name="numberOfStoresRange" id="stores50plus" value="50+" v-model="formData.numberOfStoresRange" autocomplete="off" :disabled="isLoading">
                        <label class="btn btn-outline-secondary" for="stores50plus">50+</label>
                    </div>
                </div>
              </div>

              <h5 class="mb-3 fw-medium">Primary Contact</h5>
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label for="contactName" class="form-label">Contact Person Name *</label>
                  <input type="text" class="form-control" id="contactName" v-model.trim="formData.contactPersonName" required :disabled="isLoading">
                </div>
                <div class="col-md-6">
                  <label for="contactEmail" class="form-label">Contact Person Email *</label>
                  <input type="email" class="form-control" id="contactEmail" v-model.trim="formData.contactPersonEmail" required :disabled="isLoading">
                </div>
                <div class="col-md-6">
                  <label for="contactPhone" class="form-label">Contact Person Phone</label>
                  <input type="tel" class="form-control" id="contactPhone" v-model.trim="formData.contactPersonPhone" :disabled="isLoading">
                </div>
                 <div class="col-md-6">
                    <label for="estimatedUsers" class="form-label">Estimated Number of Users</label>
                     <input type="text" class="form-control" id="estimatedUsers" placeholder="e.g., 1-5, 6-20, 21+" v-model.trim="formData.estimatedUsersRange" :disabled="isLoading">
                     </div>
              </div>

              <h5 class="mb-3 fw-medium">Current Planogram Process</h5>
               <div class="row g-3 mb-4">
                 <div class="col-md-6">
                    <label class="form-label mb-2 d-block">Current Planogram Method *</label>
                    <div class="btn-group w-100" role="group" aria-label="Current Planogram Method">
                        <input type="radio" class="btn-check" name="planogramMethod" id="methodManual" value="Manual spreadsheet" v-model="formData.currentPlanogramMethod" autocomplete="off" required :disabled="isLoading">
                        <label class="btn btn-outline-secondary" for="methodManual">Manual spreadsheet</label>

                        <input type="radio" class="btn-check" name="planogramMethod" id="methodSoftware" value="Software" v-model="formData.currentPlanogramMethod" autocomplete="off" :disabled="isLoading">
                        <label class="btn btn-outline-secondary" for="methodSoftware">Software</label>
                    </div>
                 </div>
                 <div class="col-md-6" v-if="showExistingSoftwareField">
                    <label for="existingSoftware" class="form-label">Using software, which one? *</label>
                    <input type="text" class="form-control" id="existingSoftware" v-model.trim="formData.existingSoftwareName" :required="showExistingSoftwareField" :disabled="isLoading">
                </div>

                 <div class="col-12">
                    <label for="keyChallenges" class="form-label">Key Challenges with Current Method</label>
                    <textarea class="form-control" id="keyChallenges" rows="3" v-model.trim="formData.keyChallenges" :disabled="isLoading"></textarea>
                </div>
                 <div class="col-12">
                    <label for="howHeard" class="form-label">How did you hear about us? (Optional)</label>
                    <input type="text" class="form-control" id="howHeard" v-model.trim="formData.howHeard" :disabled="isLoading">
                </div>
               </div>


              <div v-if="isLoading" class="text-center mb-3">
                <div class="spinner-border spinner-border-sm" role="status">
                  <span class="visually-hidden">Submitting...</span>
                </div>
              </div>

              <div v-if="error && !isLoading" class="alert alert-danger alert-dismissible fade show" role="alert">
                 <small>{{ error }}</small>
                 <button type="button" class="btn-close btn-sm" @click="error = null" aria-label="Close"></button>
              </div>

              <div class="d-grid gap-2 d-sm-flex justify-content-sm-end mt-4">
                 <RouterLink :to="{ name: 'Login' }" class="btn btn-outline-secondary px-4 me-sm-2" :class="{ 'disabled': isLoading }">
                    Back to Login
                 </RouterLink>
                <button type="submit" class="btn btn-light px-5 fw-medium" :disabled="isLoading">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles specific to SignupView */
.card {
  background-color: var(--bs-secondary-bg); /* Slightly lighter dark for card */
  border: 1px solid var(--bs-border-color);
  border-radius: 0.75rem;
}

.form-label {
    font-weight: var(--font-weight-medium);
    margin-bottom: 0.3rem; /* Smaller margin */
    font-size: 0.9rem;
}

.form-control, .form-select, .form-check-input {
    background-color: var(--bs-body-bg); /* Darker input background */
    color: var(--bs-body-color);
    border: 1px solid var(--bs-border-color);
}
.form-control:focus, .form-select:focus, .form-check-input:focus {
    background-color: var(--bs-body-bg);
    color: var(--bs-body-color);
    border-color: var(--bs-link-color);
    box-shadow: 0 0 0 0.2rem rgba(var(--bs-link-color-rgb), 0.2);
}
.form-control::placeholder {
    color: var(--bs-form-control-placeholder-color);
    font-weight: var(--font-weight-light);
}
textarea.form-control {
    min-height: 80px;
}

/* Button Group Styling for Radio Buttons */
.btn-group .btn-check:checked + .btn-outline-secondary {
    /* Style for selected button */
    background-color: var(--bs-link-color);
    border-color: var(--bs-link-color);
    color: var(--bs-emphasis-color);
    box-shadow: none; /* Remove default focus shadow on selected */
}
.btn-group .btn-outline-secondary {
     /* Style for unselected button */
    color: var(--bs-body-color);
    border-color: var(--bs-border-color);
    background-color: var(--bs-tertiary-bg);
}
.btn-group .btn-outline-secondary:hover {
    background-color: var(--bs-secondary-bg); /* Slightly lighter on hover */
    color: var(--bs-emphasis-color);
}
.btn-group .btn-check:focus + .btn-outline-secondary {
     /* Optional: style for focused but not selected */
     border-color: var(--bs-link-color);
     box-shadow: 0 0 0 0.2rem rgba(var(--bs-link-color-rgb), 0.2);
}


.btn-light {
    /* Style the primary submit button */
     --bs-btn-color: var(--bs-body-bg);
     --bs-btn-bg: var(--bs-emphasis-color);
     --bs-btn-border-color: var(--bs-emphasis-color);
     --bs-btn-hover-color: var(--bs-body-bg);
     --bs-btn-hover-bg: #f0f0f0;
     --bs-btn-hover-border-color: #f0f0f0;
     --bs-btn-active-color: var(--bs-body-bg);
     --bs-btn-active-bg: #e0e0e0;
     --bs-btn-active-border-color: #e0e0e0;
     --bs-btn-disabled-color: #6c757d;
     --bs-btn-disabled-bg: var(--bs-emphasis-color);
     --bs-btn-disabled-border-color: var(--bs-emphasis-color);
     opacity: 0.85;
}
.btn-light:disabled {
     opacity: 0.65;
}

.btn-outline-secondary {
    /* Back button */
    --bs-btn-color: var(--bs-body-color);
    --bs-btn-border-color: var(--bs-border-color);
    --bs-btn-hover-color: var(--bs-emphasis-color);
    --bs-btn-hover-bg: var(--bs-secondary-bg);
    --bs-btn-hover-border-color: var(--bs-border-color);
}

.alert-danger {
    --bs-alert-color: #f8d7da;
    --bs-alert-bg: #842029;
    --bs-alert-border-color: #f5c2c7;
}
.alert-danger .btn-close {
    filter: invert(1) grayscale(100%) brightness(200%);
}

h5 {
    color: var(--bs-emphasis-color);
    border-bottom: 1px solid var(--bs-border-color);
    padding-bottom: 0.5rem;
    margin-bottom: 1.5rem !important;
}
</style>

