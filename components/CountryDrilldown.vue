<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="close"></div>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border-l-4 border-[#1A5F7A]">
        <div class="bg-[#1A5F7A] text-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 flex justify-between items-center">
          <h3 class="text-lg leading-6 font-medium" id="modal-title">
            Details for {{ country.country }}
          </h3>
          <button @click="close" class="bg-white/10 rounded-md p-2 hover:bg-white/20 focus:outline-none">
            <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-[#159895] text-white">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Product</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Headline</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Countrycode</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr 
                v-for="(item, index) in paginatedItems" 
                :key="index" 
                :class="[
                  'hover:bg-[#159895]/10', 
                  index % 2 === 0 ? 'bg-white' : 'bg-[#57C5B6]/5'
                ]"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1A5F7A]">
                  {{ item?.product || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ item?.headline || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {{ item?.countrycode || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {{ formatDate(item?.date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {{ formatTime(item?.date) }}
                </td>
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

        <div class="bg-[#57C5B6]/10 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button 
            type="button" 
            class="mt-3 w-full inline-flex justify-center rounded-md border border-[#1A5F7A] shadow-sm px-4 py-2 bg-white text-[#1A5F7A] hover:bg-[#159895]/10 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

const formatTime = (dateString) => {
  if (!dateString) {
    return 'N/A';
  }
  
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Time';
  }
};
</script>