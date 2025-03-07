<template>
  <div class="card border-l-4 border-[#1A5F7A] bg-white rounded-lg shadow-md">
    <div class="card-header bg-[#1A5F7A] text-white p-4 rounded-t-lg">
      <h2 class="text-lg font-semibold">Data by Product</h2>
    </div>
    <div class="overflow-auto max-h-[500px]">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-[#159895] text-white sticky top-0 z-10">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Product
              <button 
                @click="toggleSort('product')" 
                class="ml-1 focus:outline-none text-white hover:text-[#57C5B6]"
              >
                {{ sortColumn === 'product' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
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
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Headline
              <button 
                @click="toggleSort('headline')" 
                class="ml-1 focus:outline-none text-white hover:text-[#57C5B6]"
              >
                {{ sortColumn === 'headline' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
              </button>
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Countries
              <button 
                @click="toggleSort('countriesCount')" 
                class="ml-1 focus:outline-none text-white hover:text-[#57C5B6]"
              >
                {{ sortColumn === 'countriesCount' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(product, index) in paginatedProductData" 
            :key="product.product" 
            :class="[
              'hover:bg-[#159895]/10', 
              index % 2 === 0 ? 'bg-white' : 'bg-[#57C5B6]/5'
            ]"
          >
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1A5F7A]">
              {{ product.product }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {{ formatNumber(product.count) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
              {{ product.headline || 'N/A' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="country in product.countries" 
                  :key="country" 
                  class="px-2 py-1 text-xs font-medium bg-[#159895]/10 text-[#1A5F7A] rounded-full"
                >
                  {{ country }}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Pagination -->
    <div class="mt-4 flex justify-between items-center px-6 pb-4">
      <div class="text-sm text-gray-600">
        Page {{ currentPage }} of {{ totalPages }}
      </div>
      <div class="flex items-center space-x-2">
        <select 
          v-model="itemsPerPage" 
          class="border rounded-md px-2 py-1 text-sm text-[#1A5F7A]"
        >
          <option value="5">5 rows</option>
          <option value="10">10 rows</option>
          <option value="20">20 rows</option>
          <option value="50">50 rows</option>
        </select>
        
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="px-3 py-1 rounded-md bg-[#159895] text-white disabled:opacity-50"
        >
          Previous
        </button>
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="px-3 py-1 rounded-md bg-[#159895] text-white disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  productData: {
    type: Array,
    required: true
  }
});

const sortColumn = ref('count');
const sortDirection = ref('desc');
const currentPage = ref(1);
const itemsPerPage = ref(10);

watch([() => props.productData, sortColumn, sortDirection], () => {
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

const sortedProductData = computed(() => {
  return [...props.productData].sort((a, b) => {
    const aValue = a[sortColumn.value];
    const bValue = b[sortColumn.value];
    
    if (typeof aValue === 'string') {
      return sortDirection.value === 'asc'
        ? (aValue || '').localeCompare(bValue || '')
        : (bValue || '').localeCompare(aValue || '');
    } else {
      return sortDirection.value === 'asc'
        ? (aValue || 0) - (bValue || 0)
        : (bValue || 0) - (aValue || 0);
    }
  });
});

const totalPages = computed(() => {
  return Math.ceil(sortedProductData.value.length / itemsPerPage.value);
});

const paginatedProductData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sortedProductData.value.slice(start, end);
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

const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
</script>