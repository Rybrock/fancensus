<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-[#1A5F7A] text-white p-4">
      <div class="container mx-auto flex justify-between items-center">
        <div class="text-xl font-bold flex items-center">
          <!-- <img src="/fancensus-logo.png" alt="Fancensus" class="h-8 mr-2" v-if="false" /> -->
          Fancensus
        </div>
        <div class="flex items-center space-x-4">
          <button @click="fetchDataFromAPI" class="btn bg-[#159895] hover:bg-[#2EC4B6] text-white px-4 py-2 rounded-md transition-colors">
            Refresh Data
          </button>
          <div class="bg-[#57C5B6] rounded-full h-8 w-8 flex items-center justify-center">
            <span>👤</span>
          </div>
        </div>
      </div>
    </nav>

    <main class="container mx-auto px-4 py-8">
      <div class="bg-white p-4 rounded-lg shadow-md mb-6 border-l-4 border-[#1A5F7A]">
        <h1 class="text-2xl font-bold text-[#1A5F7A]">Data Visualization Dashboard</h1>
      </div>

      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="text-center">
          <svg class="animate-spin h-10 w-10 text-[#159895] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <svg class="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p>{{ error }}</p>
        </div>
        <button @click="fetchDataFromAPI" class="mt-2 btn bg-[#159895] hover:bg-[#2EC4B6] text-white px-4 py-2 rounded-md transition-colors">
          Try Again
        </button>
      </div>

      <div v-else>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CountryTable 
            :countryData="countrySummary" 
            @selectCountry="selectCountry" 
          />

          <client-only>
            <CountryChart :countryData="countrySummary" />
          </client-only>
        </div>

        <div class="grid grid-cols-1 gap-6">
          <ProductTable :productData="productSummary" />
        </div>

        <CountryDrilldown 
          v-if="selectedCountry" 
          :country="selectedCountry" 
          :isOpen="!!selectedCountry" 
          @close="selectedCountry = null" 
        />
      </div>
    </main>

    <footer class="bg-[#1A5F7A] text-white p-4">
      <div class="container mx-auto text-center text-sm">
        &copy; {{ new Date().getFullYear() }} Fancensus Data Dashboard
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  fetchData, 
  getCountrySummary, 
  getProductSummary, 
} from '~/services/dataService';

const data = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedCountry = ref(null);

const countrySummary = computed(() => getCountrySummary(data.value));
const productSummary = computed(() => getProductSummary(data.value));

const fetchDataFromAPI = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    data.value = await fetchData();
  } catch (err) {
    error.value = err.message || 'Failed to load data. Please try again later.';
    console.error('Error fetching data:', err);
  } finally {
    loading.value = false;
  }
};

const selectCountry = (country) => {
  selectedCountry.value = country;
};

onMounted(() => {
  fetchDataFromAPI();
});
</script>