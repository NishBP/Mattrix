<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAdminDataStore } from '@/stores/adminDataStore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/config';

const adminStore = useAdminDataStore();

const formData = reactive({
  displayName: '',
  email: '',
  password: '',
  phoneNumber: '',
  dob: '',
  role: 'CategoryManager', // Default role
  companyId: '',
});

const isLoading = ref(false);
const error = ref(null);
const successMessage = ref('');

onMounted(() => {
    if (adminStore.companies.length === 0) {
        adminStore.fetchCompanies();
    }
});

const handleSubmit = async () => {
  isLoading.value = true;
  error.value = null;
  successMessage.value = '';

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
    // 1. Create Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
    const authUser = userCredential.user;
    console.log('Firebase Auth user created:', authUser.uid);

    // 2. Prepare Firestore data
    const firestoreData = {
      displayName: formData.displayName,
      phoneNumber: formData.phoneNumber || null,
      dob: formData.dob || null,
      role: formData.role,
      companyId: formData.companyId,
    };

    // 3. Add user profile to Firestore
    const success = await adminStore.addUser({ uid: authUser.uid, email: authUser.email }, firestoreData);

    if (success) {
      successMessage.value = `User ${formData.displayName} (${formData.email}) created successfully!`;
      Object.assign(formData, {
        displayName: '', email: '', password: '', phoneNumber: '', dob: '',
        role: 'CategoryManager', companyId: ''
      });
    } else {
      error.value = adminStore.error || 'Failed to save user profile to database. Auth user might still exist.';
      console.warn(`Firestore failed for Auth user ${authUser.uid}. Manual cleanup might be needed.`);
    }

  } catch (err) {
    console.error("Add User Error:", err);
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
                            <option value="Admin">Admin (Company)</option>
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

                <div v-if="isLoading" class="text-center mb-3">...Creating user...</div>
                <div v-if="error && !isLoading" class="alert alert-danger">{{ error }}</div>
                <div v-if="successMessage && !isLoading" class="alert alert-success">{{ successMessage }}</div>

                <div class="d-grid d-md-flex justify-content-md-end">
                    <button type="submit" class="btn btn-primary px-5" :disabled="isLoading">Create User</button>
                </div>
            </form>
        </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles remain largely the same */
.admin-add-user {}
.card { background-color: var(--bs-secondary-bg); border-color: var(--bs-border-color); }
.form-label { font-weight: var(--font-weight-medium); }
.form-text { color: var(--bs-light-emphasis); font-size: 0.85rem; }
.form-text.text-warning { color: var(--bs-warning) !important; }
.form-control, .form-select { background-color: var(--bs-body-bg); color: var(--bs-body-color); border: 1px solid var(--bs-border-color); }
.form-control:focus, .form-select:focus { background-color: var(--bs-body-bg); color: var(--bs-body-color); border-color: var(--bs-link-color); box-shadow: 0 0 0 0.2rem rgba(var(--bs-link-color-rgb), 0.2); }
.form-control::placeholder { color: var(--bs-form-control-placeholder-color); }
.btn-primary { /* Styles defined in base.css or specific component */ }
.alert-danger { /* Styles defined in base.css or specific component */ }
.alert-success { /* Styles defined in base.css or specific component */ }
</style>
