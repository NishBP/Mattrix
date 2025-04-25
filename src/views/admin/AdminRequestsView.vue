<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAdminDataStore } from '@/stores/adminDataStore';
import { formatDistanceToNow } from 'date-fns'; // For user-friendly dates

// Import child components later when created
// import LeadListItem from '@/components/admin/LeadListItem.vue';
// import ViewLeadModal from '@/components/admin/ViewLeadModal.vue'; // Assuming modal is separate

const adminStore = useAdminDataStore();

// State for potential filtering/sorting on this page
const sortBy = ref('submissionTimestamp');
const sortDesc = ref(true);
const filterStatus = ref('All'); // 'All', 'New', 'Contacted', etc.

// Fetch leads when the component mounts
onMounted(() => {
  if (adminStore.leads.length === 0) { // Fetch only if not already loaded
      adminStore.fetchLeads();
  }
});

// Computed property for filtered and sorted leads
const displayedLeads = computed(() => {
  let leads = [...adminStore.leads]; // Create a shallow copy for sorting

  // Filter by status
  if (filterStatus.value !== 'All') {
    leads = leads.filter(lead => lead.status === filterStatus.value);
  }

  // Sort
  leads.sort((a, b) => {
    let valA = a[sortBy.value];
    let valB = b[sortBy.value];

    // Handle timestamp sorting (assuming Firestore Timestamps)
    if (sortBy.value === 'submissionTimestamp' && valA?.toDate && valB?.toDate) {
        valA = valA.toDate();
        valB = valB.toDate();
    }

    let comparison = 0;
    if (valA > valB) {
      comparison = 1;
    } else if (valA < valB) {
      comparison = -1;
    }
    return sortDesc.value ? comparison * -1 : comparison;
  });

  return leads;
});

// Function to format Firestore Timestamps
const formatTimestamp = (timestamp) => {
  if (timestamp && typeof timestamp.toDate === 'function') {
    // Format date more conventionally and add relative time
    const date = timestamp.toDate();
    const formattedDate = date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    const relativeTime = formatDistanceToNow(date, { addSuffix: true });
    return `${formattedDate} (${relativeTime})`;
  }
  return 'Invalid Date';
};

// --- Methods for Interacting with Leads ---
const viewLeadDetails = (lead) => {
    console.log("Opening view modal for:", lead);
    adminStore.openViewLeadModal(lead);
};

const getStatusClass = (status) => {
    switch (status) {
        case 'New': return 'bg-primary';
        case 'Contacted': return 'bg-info text-dark';
        case 'Qualified': return 'bg-success';
        case 'Archived': return 'bg-secondary';
        default: return 'bg-light text-dark';
    }
};

// Placeholder for status update UI (likely in a modal or dropdown)
// const updateStatus = (leadId, newStatus) => {
//   adminStore.updateLeadStatus(leadId, newStatus);
// };

</script>

<template>
  <div class="admin-requests">
    <h1 class="h2 fw-semibold mb-4 pt-3">Interest Form Requests</h1>

    <div class="card bg-secondary-subtle mb-4 shadow-sm">
        <div class="card-body p-3">
             <div class="row g-2 align-items-center">
                 <div class="col-md-3">
                     <label for="filterStatus" class="form-label visually-hidden">Filter by Status</label>
                     <select id="filterStatus" class="form-select form-select-sm" v-model="filterStatus">
                         <option value="All">All Statuses</option>
                         <option value="New">New</option>
                         <option value="Contacted">Contacted</option>
                         <option value="Qualified">Qualified</option>
                         <option value="Archived">Archived</option>
                     </select>
                 </div>
                 </div>
        </div>
    </div>


    <div v-if="adminStore.isLoadingLeads" class="text-center my-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading leads...</span>
      </div>
      <p class="mt-2">Loading leads...</p>
    </div>

    <div v-else-if="adminStore.error && !adminStore.isLoadingLeads" class="alert alert-danger" role="alert">
      Error loading leads: {{ adminStore.error }}
    </div>

    <div v-else>
        <div v-if="displayedLeads.length === 0" class="text-center text-muted my-5">
            <p>No leads found matching your criteria.</p>
        </div>
        <div v-else class="table-responsive">
            <table class="table table-dark table-striped table-hover align-middle">
                <thead>
                    <tr>
                        <th scope="col">Company Name</th>
                        <th scope="col">Contact Person</th>
                        <th scope="col">Contact Email</th>
                        <th scope="col">Submitted</th>
                        <th scope="col">Status</th>
                        <th scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="lead in displayedLeads" :key="lead.id">
                        <td>{{ lead.companyName }}</td>
                        <td>{{ lead.contactPersonName }}</td>
                        <td>
                            <a :href="'mailto:' + lead.contactPersonEmail">{{ lead.contactPersonEmail }}</a>
                        </td>
                        <td class="text-nowrap">{{ formatTimestamp(lead.submissionTimestamp) }}</td>
                        <td>
                            <span :class="['badge', getStatusClass(lead.status)]">{{ lead.status }}</span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-outline-light" @click="viewLeadDetails(lead)">
                                View Details
                            </button>
                            </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

     <div v-if="adminStore.isViewLeadModalVisible" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Lead Details: {{ adminStore.selectedLeadForView?.companyName }}</h5>
                    <button type="button" class="btn-close btn-close-white" @click="adminStore.closeViewLeadModal()" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p><strong>Placeholder:</strong> Full lead details will be shown here.</p>
                    <pre>{{ adminStore.selectedLeadForView }}</pre>
                     </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="adminStore.closeViewLeadModal()">Close</button>
                    </div>
            </div>
        </div>
    </div>

  </div>
</template>

<style scoped>
.admin-requests {
  /* Add specific requests page styles if needed */
}

.table {
    /* Ensure table text is readable */
    color: var(--bs-body-color);
}

.table-hover tbody tr:hover {
    color: var(--bs-emphasis-color); /* Make text white on hover */
    background-color: var(--bs-secondary-bg); /* Use a slightly lighter dark for hover */
}

th {
    font-weight: var(--font-weight-semibold);
}

.badge {
    font-size: 0.8rem;
    padding: 0.4em 0.6em;
}

/* Ensure modal content uses dark theme */
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
</style>
