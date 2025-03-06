<template>
    <div class="card">
      <div class="card-header">
        <h2 class="text-lg font-semibold text-gray-800">Country Visualization</h2>
        
        <div class="flex mt-2 space-x-2">
          <button 
            @click="chartType = 'bar'" 
            :class="[
              'px-3 py-1 text-sm rounded-md', 
              chartType === 'bar' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            ]"
          >
            Bar Chart
          </button>
          <button 
            @click="chartType = 'line'" 
            :class="[
              'px-3 py-1 text-sm rounded-md', 
              chartType === 'line' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            ]"
          >
            Line Chart
          </button>
          <button 
            @click="chartType = 'pie'" 
            :class="[
              'px-3 py-1 text-sm rounded-md', 
              chartType === 'pie' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            ]"
          >
            Pie Chart
          </button>
        </div>
      </div>
      
      <div class="p-4">
        <div class="h-80 w-full">
          <canvas ref="chartRef"></canvas>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
  import { Chart, registerables } from 'chart.js';
  import { fetchData, getCountrySummary } from '@/services/dataService';
  
  Chart.register(...registerables);
  
  const countryData = ref([]);
  
  const chartType = ref('bar');
  const chartRef = ref(null);
  let chartInstance = null;
  
  const generateColors = (count) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = (i * 360) / count;
      colors.push(`hsla(${hue}, 70%, 60%, 0.7)`);
    }
    return colors;
  };
  
  const updateChart = () => {
    if (!chartRef.value || countryData.value.length === 0) return;
    
    if (chartInstance) {
      chartInstance.destroy();
    }
  
    const ctx = chartRef.value.getContext('2d');
    const labels = countryData.value.map(item => item.country);
    
    if (chartType.value === 'bar' || chartType.value === 'line') {
      const activityData = countryData.value.map(item => item.totalActivities);
      const recordCounts = countryData.value.map(item => item.count);
      
      const config = {
        type: chartType.value,
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Total Activities',
              data: activityData,
              backgroundColor: chartType.value === 'line' ? 'rgba(54, 162, 235, 0.2)' : 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
              tension: chartType.value === 'line' ? 0.1 : 0,
              fill: chartType.value === 'line'
            },
            {
              label: 'Number of Records',
              data: recordCounts,
              backgroundColor: chartType.value === 'line' ? 'rgba(255, 99, 132, 0.2)' : 'rgba(255, 99, 132, 0.5)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
              tension: chartType.value === 'line' ? 0.1 : 0,
              fill: chartType.value === 'line'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      };
      
      chartInstance = new Chart(ctx, config);
    } 
    else if (chartType.value === 'pie') {
      const activityData = countryData.value.map(item => item.totalActivities);
      const backgroundColors = generateColors(labels.length);
      
      const config = {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [
            {
              data: activityData,
              backgroundColor: backgroundColors,
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      };
      
      chartInstance = new Chart(ctx, config);
    }
  };
  
  watch(countryData, updateChart, { deep: true });
  watch(() => chartType.value, updateChart);
  
  onMounted(async () => {
    try {
      const rawData = await fetchData();
      console.log('Raw API Data:', rawData);
      
      const processedData = getCountrySummary(rawData);
      console.log('Processed Country Data:', processedData);
      
      countryData.value = processedData;
    } catch (error) {
      console.error('Error loading country data:', error);
    }
  });
  
  onBeforeUnmount(() => {
    if (chartInstance) {
      chartInstance.destroy();
    }
  });
  </script>