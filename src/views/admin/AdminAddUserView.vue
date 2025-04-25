<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAdminDataStore } from '@/stores/adminDataStore';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Import Auth function
import { auth } from '@/firebase/config'; // Import auth instance

const adminStore = useAdminDataStore();

// Form state
const formData = reactive({
  displayName: '',
  email: '',
  password: '', // Add password field
  phoneNumber: '',
  dob: '', // Date of Birth
  role: 'CategoryManager', // Default role
  companyId: '', // Link to a company
});

// State for loading, errors, and success messages
const isLoading = ref(false);
const error = ref(null);
const successMessage = ref('');

// Fetch companies for the dropdown
onMounted(() => {
    if (adminStore.companies.length === 0) {
        adminStore.fetchCompanies();
    }
});

// Function to handle form submission
const handleSubmit = async () => {
  isLoading.value = true;
  error.value = null;
  successMessage.value = '';

  // Basic Validation
  if (!formData.email || !formData.password || !formData.displayName || !formData.role || !formData.companyId) {
    error.value = 'Please fill in all required fields (Name, Email, Password, Role, Company).';
    isLoading.value = false;
    return;
  }
   if (formData.password.length < 6) {
      error.value = 'Password must be at least 6 characters long.';
      isLoading.value = false;
      return;
   }

  try {
    // 1. Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
    const authUser = userCredential.user;
    console.log('Firebase Auth user created:', authUser.uid);

    // 2. Prepare Firestore data (exclude password)
    const firestoreData = {
      displayName: formData.displayName,
      // email: formData.email, // Email is already part of authUser, store adds it
      phoneNumber: formData.phoneNumber || null, // Store null if empty
      dob: formData.dob || null, // Store null if empty
      role: formData.role,
      companyId: formData.companyId,
      // Let the store handle createdAt, isActive, accountStatus defaults
    };

    // 3. Add user profile to Firestore via the store action
    const success = await adminStore.addUser({ uid: authUser.uid, email: authUser.email }, firestoreData);

    if (success) {
      successMessage.value = `User ${formData.displayName} (${formData.email}) created successfully!`;
      // Clear the form
      Object.assign(formData, {
        displayName: '', email: '', password: '', phoneNumber: '', dob: '',
        role: 'CategoryManager', companyId: ''
      });
    } else {
      // Error likely came from the store action (Firestore write)
      error.value = adminStore.error || 'Failed to save user profile to database. Auth user might still exist.';
      // IMPORTANT: Need a mechanism to delete the Auth user if Firestore fails (ideally Cloud Function)
      console.warn(`Firestore failed for Auth user ${authUser.uid}. Manual cleanup might be needed.`);
    }

  } catch (err) {
    console.error("Add User Error:", err);
    // Handle Firebase Auth errors specifically
    if (err.code === 'auth/email-already-in-use') {
        error.value = 'This email address is already registered.';
    } else if (err.code === 'auth/weak-password') {
        error.value = 'Password is too weak. It must be at least 6 characters.';
    } else {
        error.value = `An error occurred: ${err.message}`;
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="admin-add-user">
    <h1 class="h2 fw-semibold mb-4 pt-3">Add New User</h1>

    <div class="card shadow-sm">
        <div class="card-body p-4">
            <form @submit.prevent="handleSubmit">
                <div class="row g-3 mb-4">
                    <div class="col-md-6">
                        <label for="displayName" class="form-label">Full Name *</label>
                        <input type="text" class="form-control" id="displayName" v-model.trim="formData.displayName" required :disabled="isLoading">
                    </div>
                    <div class="col-md-6">
                        <label for="email" class="form-label">Email Address *</label>
                        <input type="email" class="form-control" id="email" v-model.trim="formData.email" required :disabled="isLoading">
                    </div>
                     <div class="col-md-6">
                        <label for="password" class="form-label">Password *</label>
                        <input type="password" class="form-control" id="password" v-model="formData.password" required :disabled="isLoading" autocomplete="new-password">
                         <div class="form-text">Must be at least 6 characters long.</div>
                    </div>
                    <div class="col-md-6">
                        <label for="phoneNumber" class="form-label">Phone Number</label>
                        <input type="tel" class="form-control" id="phoneNumber" v-model.trim="formData.phoneNumber" :disabled="isLoading">
                    </div>
                    <div class="col-md-6">
                        <label for="dob" class="form-label">Date of Birth</label>
                        <input type="date" class="form-control" id="dob" v-model="formData.dob" :disabled="isLoading">
                    </div>
                </div>

                <div class="row g-3 mb-4">
                     <div class="col-md-6">
                        <label for="role" class="form-label">Assign Role *</label>
                        <select id="role" class="form-select" v-model="formData.role" required :disabled="isLoading">
                            <option value="CategoryManager">Category Manager</option>
                            <option value="Admin">Admin</option>
                            </select>
                    </div>
                     <div class="col-md-6">
                        <label for="companyId" class="form-label">Assign to Company *</label>
                         <select id="companyId" class="form-select" v-model="formData.companyId" required :disabled="isLoading || adminStore.isLoadingCompanies">
                            <option value="" disabled>Select a company...</option>
                            <option v-if="adminStore.isLoadingCompanies" value="" disabled>Loading companies...</option>
                            <option v-for="company in adminStore.companies" :key="company.id" :value="company.id">
                                {{ company.companyName }}
                            </option>
                         </select>
                         <div v-if="!adminStore.isLoadingCompanies && adminStore.companies.length === 0" class="form-text text-warning">
                             No companies available. Please add a company first.
                         </div>
                    </div>
                 </div>


                <div v-if="isLoading" class="text-center mb-3">
                    <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Creating user...</span>
                    </div>
                    <span class="ms-2">Creating user...</span>
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
                        Create User
                    </button>
                </div>
            </form>
        </div>
    </div>
  </div>
</template>

<style scoped>
.admin-add-user {
  /* Add specific styles if needed */
}
.card {
    background-color: var(--bs-secondary-bg);
    border-color: var(--bs-border-color);
}
.form-label {
    font-weight: var(--font-weight-medium);
}
.form-text {
    color: var(--bs-light-emphasis);
    font-size: 0.85rem;
}
.form-text.text-warning {
    color: var(--bs-warning) !important;
}
.form-control, .form-select {
    background-color: var(--bs-body-bg);
    color: var(--bs-body-color);
    border: 1px solid var(--bs-border-color);
}
.form-control:focus, .form-select:focus {
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
</style>
