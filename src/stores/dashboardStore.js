// src/stores/dashboardStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { db, auth as mainAuthInstance } from '@/firebase/config'; // Rename imported auth
import { useAuthStore } from './authStore'; // To get companyId
import {
    collection, query, where, getDocs, addDoc, updateDoc, deleteDoc,
    doc, writeBatch, serverTimestamp, Timestamp, orderBy, getDoc, setDoc
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export const useDashboardStore = defineStore('dashboard', () => {
    const authStore = useAuthStore();

    // --- State ---
    const stores = ref([]);
    const fixtures = ref([]);
    const products = ref([]);
    const categories = ref([]);
    const brands = ref([]);
    const suppliers = ref([]);
    const planograms = ref([]);
    const storeManagers = ref([]); // Optional: Cache available managers for assignment

    const isLoading = ref({
        stores: false, fixtures: false, products: false, categories: false,
        brands: false, suppliers: false, planograms: false, storeManagers: false,
    });
    const error = ref(null);

    // --- Computed ---
    const currentCompanyId = computed(() => authStore.userCompanyId);

    // --- Helper to get scoped collection ref ---
    const getScopedCollection = (collectionName) => {
        if (!currentCompanyId.value) {
            console.error(`Cannot get collection ${collectionName}: User companyId is missing.`);
            return null;
        }
        return collection(db, 'companies', currentCompanyId.value, collectionName);
    }

    // --- Actions ---

    // == Store Management ==
    async function fetchStores() {
        if (!currentCompanyId.value) return;
        isLoading.value.stores = true;
        error.value = null;
        stores.value = [];
        try {
            const storesColRef = getScopedCollection('stores');
            if (!storesColRef) throw new Error("Stores collection path error.");
            const q = query(storesColRef, orderBy('name'));
            const snapshot = await getDocs(q);
            // Fetch manager names concurrently
            stores.value = await Promise.all(snapshot.docs.map(async (d) => {
                const storeData = { id: d.id, ...d.data() };
                if (storeData.storeManagerUid) {
                    try {
                        const userDoc = await getDoc(doc(db, 'users', storeData.storeManagerUid));
                        storeData.managerName = userDoc.exists() ? userDoc.data().displayName : 'N/A';
                    } catch { storeData.managerName = 'Error'; }
                } else {
                    storeData.managerName = 'None';
                }
                return storeData;
            }));
            console.log("Fetched stores:", stores.value);
        } catch (err) {
            console.error("Fetch Stores Error:", err);
            error.value = `Failed to load stores: ${err.message}`;
        } finally {
            isLoading.value.stores = false;
        }
    }

    async function addStore(storeData, storeManagerData = null) {
        if (!currentCompanyId.value) return false;
        isLoading.value.stores = true;
        error.value = null;
        let newStoreManagerUid = null;

        try {
            // 1. Create Store Manager Auth user if data provided
            if (storeManagerData && storeManagerData.email && storeManagerData.password) {
                console.log("Creating Store Manager Auth user...");
                const userCredential = await createUserWithEmailAndPassword(
                    mainAuthInstance, // Use the imported auth instance
                    storeManagerData.email,
                    storeManagerData.password
                );
                newStoreManagerUid = userCredential.user.uid;
                console.log("Store Manager Auth user created:", newStoreManagerUid);
            }
            // TODO: Handle "Assign Existing" manager logic here if needed

            // 2. Prepare Store data
            const finalStoreData = {
                ...storeData,
                companyId: currentCompanyId.value,
                createdAt: serverTimestamp(),
                storeManagerUid: newStoreManagerUid, // Link to manager if created
            };

            // 3. Add Store document
            const storesColRef = getScopedCollection('stores');
            if (!storesColRef) throw new Error("Stores collection path error.");
            const storeDocRef = await addDoc(storesColRef, finalStoreData);
            console.log("Store document added:", storeDocRef.id);

            // 4. Create Store Manager Firestore user document if Auth user was created
            if (newStoreManagerUid) {
                console.log("Creating Store Manager Firestore document...");
                const userDocRef = doc(db, 'users', newStoreManagerUid);
                await setDoc(userDocRef, {
                    email: storeManagerData.email,
                    displayName: storeManagerData.displayName || storeManagerData.email,
                    role: 'StoreManager',
                    companyId: currentCompanyId.value,
                    assignedStoreId: storeDocRef.id, // Link manager to the store
                    isActive: true,
                    accountStatus: 'Verified',
                    createdAt: serverTimestamp(),
                    phoneNumber: storeManagerData.phoneNumber || null,
                    dob: storeManagerData.dob || null,
                });
                console.log("Store Manager Firestore document created.");
            }

            await fetchStores(); // Refresh list
            return true;
        } catch (err) {
            console.error("Add Store Error:", err);
            if (err.code === 'auth/email-already-in-use') {
                 error.value = "Store Manager email is already registered.";
            } else {
                 error.value = `Failed to add store: ${err.message}`;
            }
            if (newStoreManagerUid) {
                console.warn("Store added, but Store Manager creation failed. Manual cleanup of Auth user needed:", newStoreManagerUid);
                 // Attempt to delete the created Auth user - requires admin privileges, might fail from client
                 // Consider using a Cloud Function for atomicity
            }
            return false;
        } finally {
            isLoading.value.stores = false;
        }
    }

    async function updateStore(storeId, storeData) {
        if (!currentCompanyId.value) return false;
        isLoading.value.stores = true;
        error.value = null;
        try {
             const storeDocRef = doc(db, 'companies', currentCompanyId.value, 'stores', storeId);
             const { id, companyId, createdAt, managerName, ...dataToUpdate } = storeData; // Exclude derived/fixed fields
             // TODO: Handle assigning/creating/removing store manager during update
             await updateDoc(storeDocRef, dataToUpdate);
             await fetchStores();
             return true;
        } catch (err) {
             console.error("Update Store Error:", err);
             error.value = `Failed to update store: ${err.message}`;
             return false;
        } finally {
             isLoading.value.stores = false;
        }
    }

     async function deleteStore(storeId) {
        if (!currentCompanyId.value) return false;
        isLoading.value.stores = true;
        error.value = null;
        try {
             // TODO: Find associated Store Manager (if any) based on storeId in users collection
             // Decide whether to delete the manager user or just unassign them (set assignedStoreId to null)
             console.warn("Store Manager deletion/unassignment logic not implemented yet for store deletion.");
             const storeDocRef = doc(db, 'companies', currentCompanyId.value, 'stores', storeId);
             await deleteDoc(storeDocRef);
             await fetchStores();
             return true;
        } catch (err) {
             console.error("Delete Store Error:", err);
             error.value = `Failed to delete store: ${err.message}`;
             return false;
        } finally {
             isLoading.value.stores = false;
        }
    }

    // == Fixture Management ==
    async function fetchFixtures() {
        if (!currentCompanyId.value) return;
        isLoading.value.fixtures = true; error.value = null; fixtures.value = [];
        try {
            const colRef = getScopedCollection('fixtures');
            if (!colRef) throw new Error("Fixtures collection path error.");
            const q = query(colRef, orderBy('name'));
            const snapshot = await getDocs(q);
            fixtures.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (err) { console.error("Fetch Fixtures Error:", err); error.value = `Failed to load fixtures: ${err.message}`; }
        finally { isLoading.value.fixtures = false; }
    }
    // Add addFixture, updateFixture, deleteFixture actions...

    // == Product Management ==
    async function fetchProducts() {
        if (!currentCompanyId.value) return;
        isLoading.value.products = true; error.value = null; products.value = [];
        try {
            const colRef = getScopedCollection('products');
            if (!colRef) throw new Error("Products collection path error.");
            // Implement pagination here for real app
            const q = query(colRef, orderBy('name'));
            const snapshot = await getDocs(q);
            products.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (err) { console.error("Fetch Products Error:", err); error.value = `Failed to load products: ${err.message}`; }
        finally { isLoading.value.products = false; }
    }
     // Add addProduct, updateProduct, deleteProduct, uploadProductsCSV actions...

    // == Category, Brand, Supplier Management ==
    async function fetchSimpleData(collectionName, stateRef, loadingFlag) {
        if (!currentCompanyId.value) return;
        isLoading.value[loadingFlag] = true; error.value = null; stateRef.value = [];
        try {
            const colRef = getScopedCollection(collectionName);
            if (!colRef) throw new Error(`${collectionName} collection path error.`);
            const q = query(colRef, orderBy('name'));
            const snapshot = await getDocs(q);
            stateRef.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (err) { console.error(`Fetch ${collectionName} Error:`, err); error.value = `Failed to load ${collectionName}: ${err.message}`; }
        finally { isLoading.value[loadingFlag] = false; }
    }
    const fetchCategories = () => fetchSimpleData('categories', categories, 'categories');
    const fetchBrands = () => fetchSimpleData('brands', brands, 'brands');
    const fetchSuppliers = () => fetchSimpleData('suppliers', suppliers, 'suppliers');
    // Add CRUD actions for these simple entities...

    // == Planogram Management ==
    async function fetchPlanograms() {
         if (!currentCompanyId.value) return;
         isLoading.value.planograms = true; error.value = null; planograms.value = [];
         // TODO: Implement fetch logic, potentially with filters/sorting
         isLoading.value.planograms = false;
    }
     // Add CRUD actions for planograms...

    // --- Return Store Interface ---
    return {
        stores, fixtures, products, categories, brands, suppliers, planograms,
        isLoading, error, currentCompanyId,
        fetchStores, addStore, updateStore, deleteStore,
        fetchFixtures, // addFixture, updateFixture, deleteFixture,
        fetchProducts, // addProduct, updateProduct, deleteProduct, uploadProductsCSV,
        fetchCategories, // addCategory, updateCategory, deleteCategory,
        fetchBrands, // addBrand, updateBrand, deleteBrand,
        fetchSuppliers, // addSupplier, updateSupplier, deleteSupplier,
        fetchPlanograms, // addPlanogram, updatePlanogram, deletePlanogram,
    };
});
