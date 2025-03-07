<template>
  <div class="card border-l-4 border-[#1A5F7A] bg-white rounded-lg shadow-md">
    <div class="card-header bg-[#1A5F7A] text-white p-4 rounded-t-lg">
      <h2 class="text-lg font-semibold">Data by Country</h2>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-[#159895] text-white">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Country
              <button 
                @click="toggleSort('country')" 
                class="ml-1 focus:outline-none text-white hover:text-[#57C5B6]"
              >
                {{ sortColumn === 'country' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
              </button>
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Records
              <button 
                @click="toggleSort('count')" 
                class="ml-1 focus:outline-none text-white hover:text-[#57C5B6]"
              >
                {{ sortColumn === 'count' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
              </button>
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr 
            v-for="(country, index) in paginatedData" 
            :key="country.country" 
            :class="[
              'hover:bg-[#159895]/10', 
              index % 2 === 0 ? 'bg-white' : 'bg-[#57C5B6]/5'
            ]"
          >
            <td class="table-cell font-medium text-gray-700">
              <div class="flex items-center">
                <span 
                  :style="{ backgroundColor: getCountryColor(country.country) }" 
                  class="inline-block px-2 py-1 mr-2 rounded-full text-white text-xs font-bold"
                >
                  {{ getCountryCode(country.country) }}
                </span>
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
                class="btn btn-primary text-xs py-1 px-2 bg-[#1A5F7A] text-white hover:bg-[#159895]"
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
                : 'text-[#1A5F7A] hover:bg-[#159895]/10'
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
                ? 'bg-[#1A5F7A] text-white' 
                : 'text-[#1A5F7A] hover:bg-[#159895]/10'
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
                : 'text-[#1A5F7A] hover:bg-[#159895]/10'
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
          class="ml-2 border-[#1A5F7A] rounded-md text-[#1A5F7A] text-sm focus:ring-[#159895] focus:border-[#159895]"
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

const countryColors = {
  'US': '#1A5F7A',
  'GB': '#159895',
  'CA': '#57C5B6',
  'AU': '#2EC4B6',
  'DE': '#0088FE',
  'FR': '#00C49F',
  'JP': '#FFBB28',
  'CN': '#FF8042',
  'IN': '#8884D8',
  'BR': '#82CA9D'
};

const getCountryName = (countryCode) => {
  if (!countryCode) return 'Not Specified';
  
  if (countryCode.length > 2) return countryCode;
  
  return countryCodeMap[countryCode] || countryCode;
};

const getCountryCode = (countryCode) => {
  if (!countryCode) return 'N/A';
  
  return countryCode.length > 2 ? countryCode.substring(0, 2) : countryCode;
};

const getCountryColor = (countryCode) => {
  if (!countryCode) return '#1A5F7A';
  
  const code = countryCode.length > 2 ? countryCode.substring(0, 2) : countryCode;
  return countryColors[code] || '#1A5F7A';
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