<template>
    <div class="card">
      <div class="card-header">
        <h2 class="text-lg font-semibold text-gray-800">Data by Country</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th scope="col" class="table-header">
                Country
                <button @click="toggleSort('country')" class="ml-1 focus:outline-none">
                  {{ sortColumn === 'country' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
                </button>
              </th>
              <th scope="col" class="table-header">
                Records
                <button @click="toggleSort('count')" class="ml-1 focus:outline-none">
                  {{ sortColumn === 'count' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
                </button>
              </th>
              <th scope="col" class="table-header">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(country, index) in paginatedData" :key="country.country" :class="{ 'table-row-alt': index % 2 !== 0 }">
              <td class="table-cell font-medium text-gray-700">
                <div class="flex items-center">
                  {{ getCountryName(country.country) }}
                  <span v-if="!country.country" 
                        class="ml-1 text-gray-400 cursor-help"
                        title="Records where country information was not available">
                    <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                    </svg>
                  </span>
                </div>
              </td>
              <td class="table-cell">{{ formatNumber(country.count) }}</td>
              <td class="table-cell">
                <button 
                  @click="$emit('selectCountry', country)" 
                  class="btn btn-primary text-xs py-1 px-2"
                >
                  View Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
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
        
        <div class="mt-2 flex justify-end items-center text-sm text-gray-600">
          <span>Rows per page:</span>
          <select 
            v-model="itemsPerPage" 
            class="ml-2 border-gray-300 rounded-md text-gray-700 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue';
  
  const props = defineProps({
    countryData: {
      type: Array,
      required: true
    }
  });
  
  const emit = defineEmits(['selectCountry']);
  
  const countryCodeMap = {
    'US': 'United States',
    'GB': 'United Kingdom',
    'CA': 'Canada',
    'AU': 'Australia',
    'DE': 'Germany',
    'FR': 'France',
    'JP': 'Japan',
    'CN': 'China',
    'IN': 'India',
    'BR': 'Brazil',
  };
  
  const getCountryName = (countryCode) => {
    if (!countryCode) return 'Not Specified';
    
    if (countryCode.length > 2) return countryCode;
    
    return countryCodeMap[countryCode] || countryCode;
  };
  
  const sortColumn = ref('count');
  const sortDirection = ref('desc');
  
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  
  watch([sortColumn, sortDirection, itemsPerPage], () => {
    currentPage.value = 1;
  });
  
  const toggleSort = (column) => {
    if (sortColumn.value === column) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn.value = column;
      sortDirection.value = 'desc';
    }
  };
  
  const sortedCountryData = computed(() => {
    return [...props.countryData].sort((a, b) => {
      const aValue = a[sortColumn.value];
      const bValue = b[sortColumn.value];
      
      if (typeof aValue === 'string') {
        return sortDirection.value === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection.value === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }
    });
  });
  
  const paginatedData = computed(() => {
    const startIndex = (currentPage.value - 1) * itemsPerPage.value;
    const endIndex = startIndex + itemsPerPage.value;
    return sortedCountryData.value.slice(startIndex, endIndex);
  });
  
  const totalPages = computed(() => {
    return Math.ceil(sortedCountryData.value.length / itemsPerPage.value);
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
  
  const formatNumber = (num) => {
    if (num === undefined || num === null) {
      return '0';
    }
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  </script>