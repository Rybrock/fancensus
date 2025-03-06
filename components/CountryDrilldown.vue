<template>
    <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="close"></div>
  
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Details for {{ country.country }}
              </h3>
              <button @click="close" class="bg-white rounded-md p-2 hover:bg-gray-100 focus:outline-none">
                <svg class="h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
  
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="table-header">Product</th>
                    <th scope="col" class="table-header">Activities</th>
                    <th scope="col" class="table-header">Countrycode</th>
                    <th scope="col" class="table-header">Date</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(item, index) in paginatedItems" :key="index" :class="{ 'table-row-alt': index % 2 !== 0 }">
                    <td class="table-cell font-medium text-gray-700">{{ item?.product || 'N/A' }}</td>
                    <td class="table-cell">{{ formatNumber(item?.activities) }}</td>
                    <td class="table-cell">{{ item?.countrycode || 'N/A' }}</td>
                    <td class="table-cell">{{ formatDate(item?.date) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
  
            <div v-if="totalPages > 1" class="mt-4 flex justify-center">
              <nav class="flex items-center space-x-1">
                <button
                  @click="prevPage"
                  :disabled="currentPage === 1"
                  :class="[
                    'px-3 py-1 rounded-md text-sm',
                    currentPage === 1 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  Previous
                </button>
                <button
                  v-for="page in displayedPages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="[
                    'px-3 py-1 rounded-md text-sm',
                    page === currentPage 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  {{ page }}
                </button>
                <button
                  @click="nextPage"
                  :disabled="currentPage === totalPages"
                  :class="[
                    'px-3 py-1 rounded-md text-sm',
                    currentPage === totalPages 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              @click="close"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue';
  
  const props = defineProps({
    country: {
      type: Object,
      required: true
    },
    isOpen: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['close']);
  
  const itemsPerPage = 5;
  const currentPage = ref(1);
  
  watch(() => props.country, () => {
    currentPage.value = 1;
  });
  
  const totalPages = computed(() => {
    return Math.ceil((props.country?.items?.length || 0) / itemsPerPage);
  });
  
  const paginatedItems = computed(() => {
    if (!props.country?.items || !Array.isArray(props.country.items)) {
      return [];
    }
    
    const startIndex = (currentPage.value - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return props.country.items.slice(startIndex, endIndex);
  });
  
  const displayedPages = computed(() => {
    if (totalPages.value <= 5) {
      return Array.from({ length: totalPages.value }, (_, i) => i + 1);
    }
    
    let start = Math.max(currentPage.value - 2, 1);
    let end = start + 4;
    
    if (end > totalPages.value) {
      end = totalPages.value;
      start = Math.max(end - 4, 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });
  
  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  };
  
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  };
  
  const goToPage = (page) => {
    currentPage.value = page;
  };
  
  const close = () => {
    emit('close');
  };
  
  const formatNumber = (num) => {
    if (num === undefined || num === null) {
      return '0';
    }
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  const formatDate = (dateString) => {
    if (!dateString) {
      return 'N/A';
    }
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };
  </script>