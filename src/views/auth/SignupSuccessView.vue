<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { RouterLink, useRouter, onBeforeRouteLeave } from 'vue-router';

// Hardcoded contact email (replace with actual or fetch if needed)
const contactEmail = ref('contact@planogramapp.example.com'); // <-- REPLACE WITH ACTUAL EMAIL
const copySuccess = ref(false); // State for copy success feedback
const copyTimeout = ref(null); // Timeout reference for clearing feedback

const router = useRouter();

// Function to copy email to clipboard
const copyEmailToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(contactEmail.value);
    copySuccess.value = true;
    // Clear the success message after a few seconds
    if (copyTimeout.value) clearTimeout(copyTimeout.value); // Clear existing timeout
    copyTimeout.value = setTimeout(() => {
      copySuccess.value = false;
    }, 2500);
  } catch (err) {
    console.error('Failed to copy email: ', err);
    // Optionally show an error message to the user
    alert('Failed to copy email.');
  }
};

// --- Prevent Back Navigation ---
// This is a simple approach. More robust solutions might involve history manipulation
// or checking navigation type, but this covers the common case.
const preventBack = (event) => {
  // This forces navigation forward to the same page if 'back' is attempted
  router.push({ name: 'SignupSuccess' });
};

onMounted(() => {
  // Push a state entry that we can detect on 'popstate' (back/forward button)
  history.pushState(null, '', location.href);
  // Listen for the browser's back/forward navigation
  window.addEventListener('popstate', preventBack);
});

onBeforeUnmount(() => {
  // Clean up the listener when the component is destroyed
  window.removeEventListener('popstate', preventBack);
  // Clear any pending timeout for the copy feedback
  if (copyTimeout.value) clearTimeout(copyTimeout.value);
});

// Another way using router guard (might be cleaner)
onBeforeRouteLeave((to, from, next) => {
    // Allow navigation only if going to 'Login'
    if (to.name === 'Login') {
        next();
    } else {
        // Prevent leaving to other routes (including back)
        console.log("Navigation away from success page blocked.");
        next(false); // Block navigation
    }
});


</script>

<template>
  <div class="container vh-100 d-flex justify-content-center align-items-center">
    <div class="card text-center p-4 p-md-5" style="width: 100%; max-width: 550px;">
      <div class="card-body">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-check-circle-fill text-success mb-3" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
        </svg>

        <h2 class="card-title fw-semibold mb-3">Thank you, we'll reach out soon!</h2>
        <p class="text-light-emphasis mb-4">
          If you wish to make any changes to the form or have additional enquiries, please send us an email.
        </p>

        <div class="input-group mb-4 mx-auto" style="max-width: 350px;">
          <input type="text" class="form-control" :value="contactEmail" readonly aria-label="Contact Email">
          <button class="btn btn-outline-secondary" type="button" @click="copyEmailToClipboard" title="Copy email">
            <svg v-if="!copySuccess" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16">
                <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
            </svg>
             <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard-check" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
                <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
            </svg>
            <span class="ms-1" v-if="copySuccess">Copied!</span>
          </button>
        </div>

        <p class="text-light-emphasis small mb-4">
          Make sure to include your business registration number in your message if you have further enquiries.
        </p>

        <RouterLink :to="{ name: 'Login' }" class="btn btn-light px-4 fw-medium">
          Back to Login
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles specific to SignupSuccessView */
.card {
  background-color: var(--bs-secondary-bg); /* Use a slightly lighter dark shade */
  border: 1px solid var(--bs-border-color);
   border-radius: 0.75rem;
}

.input-group .form-control {
    background-color: var(--bs-body-bg); /* Darker background for readonly input */
    border-right: 0; /* Remove border between input and button */
}
.input-group .form-control:focus {
     box-shadow: none; /* Remove focus glow */
}

.input-group .btn-outline-secondary {
    /* Style copy button */
    color: var(--bs-body-color);
    border-color: var(--bs-border-color);
    background-color: var(--bs-tertiary-bg);
}
.input-group .btn-outline-secondary:hover {
    background-color: var(--bs-secondary-bg);
    color: var(--bs-emphasis-color);
}
.input-group .btn-outline-secondary:focus {
     box-shadow: 0 0 0 0.2rem rgba(var(--bs-link-color-rgb), 0.2);
}

.btn-light {
    /* Style the primary button */
     --bs-btn-color: var(--bs-body-bg);
     --bs-btn-bg: var(--bs-emphasis-color);
     --bs-btn-border-color: var(--bs-emphasis-color);
     --bs-btn-hover-color: var(--bs-body-bg);
     --bs-btn-hover-bg: #f0f0f0;
     --bs-btn-hover-border-color: #f0f0f0;
     opacity: 0.85;
}

.text-success {
    color: #198754 !important; /* Ensure success color stands out */
}
</style>
