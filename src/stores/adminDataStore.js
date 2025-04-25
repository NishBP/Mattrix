// src/stores/adminDataStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { db } from '@/firebase/config'; // Ensure this path is correct
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    setDoc, // Ensure setDoc is imported
    query,
    where,
    orderBy,
    writeBatch,
    serverTimestamp,
    getDoc // Import getDoc for checking company existence
} from 'firebase/firestore';
// Import auth store if needed for permissions or user context
// import { useAuthStore } from './authStore';

export const useAdminDataStore = defineStore('adminData', () => {
    // const authStore = useAuthStore(); // Get auth store instance if needed

    // --- State ---
    const companies = ref([]); // Array to hold company data
    const users = ref([]); // Array to hold user data (consider pagination for large sets)
    const leads = ref([]); // Array to hold lead data from interest forms

    const isLoadingCompanies = ref(false);
    const isLoadingUsers = ref(false);
    const isLoadingLeads = ref(false);
    const error = ref(null); // General error state for admin operations

    // Modal State
    const isEditUserModalVisible = ref(false);
    const selectedUserForEdit = ref(null); // Store the user object being edited

    const isEditCompanyModalVisible = ref(false);
    const selectedCompanyForEdit = ref(null); // Store the company object being edited

    const isConfirmDialogVisible = ref(false);
    const confirmDialogConfig = ref({ // Configuration for the confirmation dialog
        title: 'Confirm Action',
        message: 'Are you sure?',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: () => {}, // Callback function when confirmed
        data: null // Optional data to pass to onConfirm
    });

    const isViewLeadModalVisible = ref(false);
    const selectedLeadForView = ref(null);


    // --- Getters (Computed Properties) ---
    const hasAdminData = computed(() => companies.value.length > 0 || users.value.length > 0 || leads.value.length > 0);
    const isLoading = computed(() => isLoadingCompanies.value || isLoadingUsers.value || isLoadingLeads.value);

    // --- Actions ---

    // --- Company Actions ---
    async function fetchCompanies() {
        isLoadingCompanies.value = true;
        error.value = null;
        companies.value = []; // Clear previous data
        try {
            const companiesColRef = collection(db, 'companies');
            // Add ordering if needed, e.g., orderBy('companyName')
            const q = query(companiesColRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            companies.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (err) {
            console.error("Fetch Companies Error:", err);
            error.value = "Failed to load companies.";
        } finally {
            isLoadingCompanies.value = false;
        }
    }

    async function addCompany(companyData) {
        // Add validation as needed
        error.value = null;
        isLoadingCompanies.value = true; // Indicate loading
        console.log("Attempting to add company:", companyData);
        try {
            const companiesColRef = collection(db, 'companies');
            const docRef = await addDoc(companiesColRef, {
                ...companyData,
                createdAt: serverTimestamp(),
                subscriptionStatus: 'Setting up' // Default status
            });
            console.log("Company added with ID:", docRef.id);
            await fetchCompanies(); // Refresh list after adding
            return true; // Indicate success
        } catch (err) {
            console.error("Add Company Firestore Error:", err);
            error.value = `Failed to add company. Error: ${err.code} - ${err.message}`; // More specific error
            return false; // Indicate failure
        } finally {
             isLoadingCompanies.value = false;
        }
    }

     async function updateCompany(companyId, updateData) {
        error.value = null;
        isLoadingCompanies.value = true;
        try {
            const companyDocRef = doc(db, 'companies', companyId);
            await updateDoc(companyDocRef, updateData);
            await fetchCompanies(); // Refresh list
            closeEditCompanyModal();
            return true;
        } catch (err) {
            console.error("Update Company Error:", err);
            error.value = `Failed to update company. Error: ${err.code} - ${err.message}`;
            return false;
        } finally {
            isLoadingCompanies.value = false;
        }
    }

    async function deleteCompany(companyId) {
        // This is complex: requires deleting company doc, associated users in Firestore,
        // and potentially associated users in Firebase Auth.
        // Use a Cloud Function for atomicity and permissions, or a careful batch write.
        error.value = null;
        isLoadingCompanies.value = true; // Indicate loading during delete
        isLoadingUsers.value = true;
        const batch = writeBatch(db);
        try {
            console.log(`Attempting to delete company ${companyId} and associated users.`);
            // 1. Find users associated with the company
            const usersColRef = collection(db, 'users');
            const q = query(usersColRef, where('companyId', '==', companyId));
            const usersSnapshot = await getDocs(q);

            // 2. Delete associated user documents from Firestore
            usersSnapshot.forEach(userDoc => {
                console.log(`Batch deleting user document: ${userDoc.id}`);
                batch.delete(doc(db, 'users', userDoc.id));
                // TODO: Trigger Firebase Auth user deletion (requires backend/Cloud Function)
                // This cannot be done securely from the client-side SDK alone.
                console.warn(`Deletion of Auth user ${userDoc.id} needs to be handled server-side.`);
            });

            // 3. Delete the company document
            console.log(`Batch deleting company document: ${companyId}`);
            const companyDocRef = doc(db, 'companies', companyId);
            batch.delete(companyDocRef);

            // 4. Commit the batch
            await batch.commit();
            console.log(`Batch delete successful for company ${companyId}.`);

            // 5. Refresh local state
            await fetchCompanies();
            await fetchUsers(); // Also refresh users list

            closeConfirmDialog();
            return true;

        } catch (err) {
            console.error("Delete Company Error:", err);
            error.value = `Failed to delete company and associated users. Error: ${err.code} - ${err.message}`;
            closeConfirmDialog();
            return false;
        } finally {
             isLoadingCompanies.value = false;
             isLoadingUsers.value = false;
        }
    }

     async function toggleCompanyStatus(companyId, currentStatus) {
        error.value = null;
        isLoadingCompanies.value = true; // Indicate loading
        isLoadingUsers.value = true;
        const newStatus = currentStatus === 'Active' ? 'Services Paused' : 'Active';
        const makeUsersInactive = newStatus === 'Services Paused';
        const batch = writeBatch(db);

        try {
            console.log(`Toggling company ${companyId} status to ${newStatus}. Users active: ${!makeUsersInactive}`);
            // 1. Update company status
            const companyDocRef = doc(db, 'companies', companyId);
            batch.update(companyDocRef, { subscriptionStatus: newStatus });

            // 2. Find and update associated users' isActive status
            const usersColRef = collection(db, 'users');
            const q = query(usersColRef, where('companyId', '==', companyId));
            const usersSnapshot = await getDocs(q);
            usersSnapshot.forEach(userDoc => {
                 console.log(`Batch updating user ${userDoc.id} isActive to ${!makeUsersInactive}`);
                batch.update(doc(db, 'users', userDoc.id), { isActive: !makeUsersInactive });
            });

            // 3. Commit batch
            await batch.commit();
            console.log(`Batch status toggle successful for company ${companyId}.`);

            // 4. Refresh local state
            await fetchCompanies();
            await fetchUsers(); // Refresh users as their status changed

            closeConfirmDialog();
            return true;
        } catch (err) {
            console.error("Toggle Company Status Error:", err);
            error.value = `Failed to set company status to ${newStatus}. Error: ${err.code} - ${err.message}`;
            closeConfirmDialog();
            return false;
        } finally {
             isLoadingCompanies.value = false;
             isLoadingUsers.value = false;
        }
    }


    // --- User Actions ---
    async function fetchUsers() {
        isLoadingUsers.value = true;
        error.value = null;
        users.value = []; // Clear previous data
        try {
            const usersColRef = collection(db, 'users');
            // Add ordering if needed, e.g., orderBy('displayName')
            const q = query(usersColRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            // Fetch company names for display (consider optimizing this if many users)
            const usersData = await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
                 const userData = { id: docSnapshot.id, ...docSnapshot.data() };
                 if (userData.companyId) {
                     try {
                        const companyDoc = await getDoc(doc(db, 'companies', userData.companyId));
                        userData.companyName = companyDoc.exists() ? companyDoc.data().companyName : 'N/A (Company Deleted?)';
                     } catch (companyErr) {
                         console.warn(`Error fetching company ${userData.companyId} for user ${userData.id}:`, companyErr);
                         userData.companyName = 'Error Loading Company';
                     }
                 } else {
                    userData.companyName = 'N/A'; // Or handle users without company differently
                 }
                 return userData;
            }));
            users.value = usersData;

        } catch (err) {
            console.error("Fetch Users Error:", err);
            error.value = `Failed to load users. Error: ${err.code} - ${err.message}`;
        } finally {
            isLoadingUsers.value = false;
        }
    }

     async function addUser(authUserData, firestoreUserData) {
        // This function assumes Firebase Auth user creation happens *before* calling this,
        // likely in the AdminAddUserView.vue component or via a Cloud Function.
        // authUserData should contain the UID from the newly created Auth user.
        error.value = null;
        isLoadingUsers.value = true; // Indicate loading

        // *** START: Enhanced Logging and Pre-check ***
        console.log("addUser Action: Received Auth Data:", authUserData);
        console.log("addUser Action: Received Firestore Data:", firestoreUserData);

        if (!authUserData || !authUserData.uid) {
            error.value = "Internal Error: Missing Auth user data in addUser action.";
            console.error(error.value);
            isLoadingUsers.value = false;
            return false;
        }
        if (!firestoreUserData || !firestoreUserData.companyId) {
             error.value = "Internal Error: Missing Firestore data or companyId in addUser action.";
             console.error(error.value);
             isLoadingUsers.value = false;
             return false;
        }

        // Optional: Check if the selected company actually exists before trying to write the user
        try {
             const companyDocRef = doc(db, 'companies', firestoreUserData.companyId);
             const companySnap = await getDoc(companyDocRef);
             if (!companySnap.exists()) {
                 throw new Error(`Selected company (ID: ${firestoreUserData.companyId}) does not exist.`);
             }
             console.log("addUser Action: Company check passed for ID:", firestoreUserData.companyId);
        } catch (companyCheckError) {
            console.error("addUser Action: Company existence check failed:", companyCheckError);
            error.value = `Error verifying company: ${companyCheckError.message}`;
            isLoadingUsers.value = false;
            return false;
        }
        // *** END: Enhanced Logging and Pre-check ***


        console.log(`Attempting to add user document to Firestore with ID: ${authUserData.uid}`);
        try {
            const userDocRef = doc(db, 'users', authUserData.uid); // Use Auth UID as Firestore Doc ID
            const finalFirestoreData = {
                ...firestoreUserData,
                email: authUserData.email, // Ensure email consistency
                createdAt: serverTimestamp(),
                isActive: true, // Default to active
                accountStatus: 'Verified' // Or 'Not Verified' if email verification is needed
            };
            console.log("addUser Action: Data being sent to setDoc:", finalFirestoreData);

            await setDoc(userDocRef, finalFirestoreData);

            // *** ADDED LOGGING HERE ***
            console.log("addUser Action: setDoc operation completed (or at least didn't throw immediately).");

            // console.log("Firestore user document created successfully:", authUserData.uid); // Log moved
            await fetchUsers(); // Refresh list
            console.log("addUser Action: fetchUsers completed after setDoc."); // Log after refresh
            return true;
        } catch (err) {
            // *** ADDED LOGGING HERE ***
            console.error("addUser Action: CAUGHT ERROR during setDoc or fetchUsers:", err);
            console.error("addUser Action: Error Code:", err.code); // Log code specifically
            console.error("addUser Action: Error Message:", err.message); // Log message specifically

            error.value = `Failed to save user profile to database. Error Code: ${err.code}. Message: ${err.message}. Please check Firestore rules and data validity.`;
            console.warn(`Firestore write failed for Auth user ${authUserData.uid}. Manual Auth cleanup might be needed if user exists in Authentication but not Firestore.`);
            return false;
        } finally {
            // *** ADDED LOGGING HERE ***
            console.log("addUser Action: Exiting finally block.");
            isLoadingUsers.value = false;
        }
    }

    async function updateUser(userId, updateData) {
        error.value = null;
        isLoadingUsers.value = true;
        try {
            const userDocRef = doc(db, 'users', userId);
            // Remove id and companyName if they exist in updateData, as they shouldn't be directly updated here
            const { id, companyName, ...dataToUpdate } = updateData;
            await updateDoc(userDocRef, dataToUpdate);
            await fetchUsers(); // Refresh list
            closeEditUserModal();
            return true;
        } catch (err) {
            console.error("Update User Error:", err);
            error.value = `Failed to update user profile. Error: ${err.code} - ${err.message}`;
            return false;
        } finally {
            isLoadingUsers.value = false;
        }
    }

     async function deleteUser(userId) {
        // Similar to deleteCompany, deleting the Auth user requires backend/Cloud Function.
        error.value = null;
        isLoadingUsers.value = true;
        try {
            console.log(`Attempting to delete user document: ${userId}`);
            // 1. Delete Firestore document
            const userDocRef = doc(db, 'users', userId);
            await deleteDoc(userDocRef);
            console.log(`Firestore user document ${userId} deleted.`);

            // TODO: Trigger Firebase Auth user deletion (requires backend/Cloud Function)
            console.warn(`Deletion of Auth user ${userId} needs to be handled server-side.`);

            // 2. Refresh local state
            await fetchUsers();
            closeConfirmDialog(); // Assuming delete is triggered via confirmation
            closeEditUserModal(); // Close edit modal if open for this user
            return true;
        } catch (err) {
            console.error("Delete User Error:", err);
            error.value = `Failed to delete user profile. Error: ${err.code} - ${err.message}`;
             closeConfirmDialog();
            return false;
        } finally {
             isLoadingUsers.value = false;
        }
    }


    // --- Lead Actions ---
    async function fetchLeads() {
        isLoadingLeads.value = true;
        error.value = null;
        leads.value = []; // Clear previous data
        try {
            const leadsColRef = collection(db, 'leads');
            const q = query(leadsColRef, orderBy('submissionTimestamp', 'desc'));
            const querySnapshot = await getDocs(q);
            leads.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (err) {
            console.error("Fetch Leads Error:", err);
            error.value = `Failed to load leads. Error: ${err.code} - ${err.message}`;
        } finally {
            isLoadingLeads.value = false;
        }
    }

     async function updateLeadStatus(leadId, newStatus) {
        error.value = null;
        isLoadingLeads.value = true; // Indicate loading
        try {
            const leadDocRef = doc(db, 'leads', leadId);
            await updateDoc(leadDocRef, { status: newStatus });
            await fetchLeads(); // Refresh list
            // Optionally close view modal if open
             if (selectedLeadForView.value?.id === leadId) {
                selectedLeadForView.value.status = newStatus; // Update status in modal view directly
             }
            return true;
        } catch (err) {
            console.error("Update Lead Status Error:", err);
            error.value = `Failed to update lead status. Error: ${err.code} - ${err.message}`;
            return false;
        } finally {
            isLoadingLeads.value = false;
        }
    }

     // Action to add a lead (typically called from SignupView)
    async function addLead(leadData) {
        error.value = null;
        // No loading indicator needed here typically, as it's a quick operation on signup
        console.log("Attempting to add lead:", leadData);
        try {
            const leadsColRef = collection(db, 'leads');
            const docRef = await addDoc(leadsColRef, {
                ...leadData,
                submissionTimestamp: serverTimestamp(),
                status: 'New' // Default status
            });
             console.log("Lead added with ID:", docRef.id);
            // No need to fetchLeads here unless the admin is viewing leads simultaneously
            return true; // Indicate success
        } catch (err) {
            console.error("Add Lead Firestore Error:", err);
            error.value = `Failed to submit interest form. Error: ${err.code} - ${err.message}`;
            return false; // Indicate failure
        }
    }


    // --- Modal Actions ---
    function openEditUserModal(user) {
        selectedUserForEdit.value = { ...user }; // Clone user data to avoid direct mutation
        isEditUserModalVisible.value = true;
    }
    function closeEditUserModal() {
        isEditUserModalVisible.value = false;
        selectedUserForEdit.value = null;
    }

    function openEditCompanyModal(company) {
        selectedCompanyForEdit.value = { ...company }; // Clone
        isEditCompanyModalVisible.value = true;
    }
    function closeEditCompanyModal() {
        isEditCompanyModalVisible.value = false;
        selectedCompanyForEdit.value = null;
    }

     function openConfirmDialog({ title = 'Confirm Action', message = 'Are you sure?', confirmText = 'Confirm', cancelText = 'Cancel', onConfirm = () => {}, data = null }) {
        confirmDialogConfig.value = { title, message, confirmText, cancelText, onConfirm, data };
        isConfirmDialogVisible.value = true;
    }

    function closeConfirmDialog() {
        isConfirmDialogVisible.value = false;
        // Reset config slightly later to avoid visual glitch if reused quickly
        setTimeout(() => {
             confirmDialogConfig.value = { title: 'Confirm Action', message: 'Are you sure?', confirmText: 'Confirm', cancelText: 'Cancel', onConfirm: () => {}, data: null };
        }, 200); // Adjust timing if needed
    }

     function openViewLeadModal(lead) {
        selectedLeadForView.value = { ...lead }; // Clone
        isViewLeadModalVisible.value = true;
    }
    function closeViewLeadModal() {
        isViewLeadModalVisible.value = false;
        selectedLeadForView.value = null;
    }


    // --- Return Store Interface ---
    return {
        companies,
        users,
        leads,
        isLoadingCompanies,
        isLoadingUsers,
        isLoadingLeads,
        error,
        isEditUserModalVisible,
        selectedUserForEdit,
        isEditCompanyModalVisible,
        selectedCompanyForEdit,
        isConfirmDialogVisible,
        confirmDialogConfig,
        isViewLeadModalVisible,
        selectedLeadForView,
        hasAdminData,
        isLoading,

        fetchCompanies,
        addCompany,
        updateCompany,
        deleteCompany,
        toggleCompanyStatus,

        fetchUsers,
        addUser, // Note: Requires Auth user UID
        updateUser,
        deleteUser,

        fetchLeads,
        updateLeadStatus,
        addLead, // Expose for Signup form

        openEditUserModal,
        closeEditUserModal,
        openEditCompanyModal,
        closeEditCompanyModal,
        openConfirmDialog,
        closeConfirmDialog,
        openViewLeadModal,
        closeViewLeadModal,
    };
});
