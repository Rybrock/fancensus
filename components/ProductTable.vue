<!-- components/ProductTable.vue -->
<template>
  <div class="card">
    <div class="card-header">
      <h2 class="text-lg font-semibold text-gray-800">Data by Product</h2>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th scope="col" class="table-header">
              Product
              <button @click="toggleSort('product')" class="ml-1 focus:outline-none">
                {{ sortColumn === 'product' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
              </button>
            </th>
            <th scope="col" class="table-header">
              Records
              <button @click="toggleSort('count')" class="ml-1 focus:outline-none">
                {{ sortColumn === 'count' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
              </button>
            </th>
            <th scope="col" class="table-header">
              Activities
              <button @click="toggleSort('activities')" class="ml-1 focus:outline-none">
                {{ sortColumn === 'activities' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
              </button>
            </th>
            <th scope="col" class="table-header">
              Countries
              <button @click="toggleSort('countriesCount')" class="ml-1 focus:outline-none">
                {{ sortColumn === 'countriesCount' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
              </button>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(product, index) in sortedProductData" :key="product.product" :class="{ 'table-row-alt': index % 2 !== 0 }">
            <td class="table-cell font-medium text-gray-700">{{ product.product }}</td>
            <td class="table-cell">{{ formatNumber(product.count) }}</td>
            <td class="table-cell">{{ formatNumber(product.activities) }}</td>
            <td class="table-cell">
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="country in product.countries" 
                  :key="country" 
                  class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                >
                  {{ country }}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  productData: {
    type: Array,
    required: true
  }
});

// Sorting state
const sortColumn = ref('activities');
const sortDirection = ref('desc');

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
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return sortDirection.value === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    }
  });
});

const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
</script>