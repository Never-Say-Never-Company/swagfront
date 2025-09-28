<template>
  <v-card :loading="loading">
    <v-card-title class="d-flex justify-space-between align-center pb-0">
      <div class="text-h6">Quantidade de Issues por Projeto</div>
    </v-card-title>
    <v-card-subtitle class="pt-0">Última atualização: {{ lastUpdated }}</v-card-subtitle>
    <v-card-text>
      <div v-if="chartData">
        <Bar
          :data="chartData"
          :options="chartOptions"
          style="max-height: 250px;" 
        />
      </div>
      <div v-else-if="!loading" class="text-center text-caption grey--text">
        Nenhum dado disponível.
      </div>
      <v-alert
        v-if="error"
        type="error"
        dense
        text
        class="mt-4"
      >
        {{ error }}
      </v-alert>
    </v-card-text>
    
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text small color="#D97F77" @click="fetchChartData">
        <v-icon left>mdi-refresh</v-icon>
        Atualizar Dados
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import axios from 'axios';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default {
  name: 'IssuesPerProjectChart',
  components: {
    Bar,
  },
  data() {
    return {
      chartData: null,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.raw}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      },
      loading: false,
      error: null,
      lastUpdated: 'Nunca',
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL, 
    };
  },
  mounted() {
    this.fetchChartData();
  },
  methods: {
    // FUNÇÃO PARA GERAR CORES ALEATÓRIAS
    getRandomColor() {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      // Retorna a cor no formato RGB
      return `rgb(${r}, ${g}, ${b})`; 
    },
    
    async fetchChartData() {
      this.loading = true;
      this.error = null;
      this.chartData = null; 

      const apiUrl = `${this.apiBaseUrl || 'http://localhost:8000'}/project/count_issues_grouped_by_project`;

      try {
        const response = await axios.get(apiUrl); 
        
        const apiList = response.data;

        if (Array.isArray(apiList) && apiList.length > 0) {
          const labels = apiList.map(item => item.projeto);
          const data = apiList.map(item => item.quantidade_issues);
          
          // GERA UM ARRAY DE CORES: uma cor aleatória para cada item
          const backgroundColors = data.map(() => this.getRandomColor());
          
          this.chartData = {
            labels: labels,
            datasets: [
              {
                label: 'Número de Issues',
                // Usa o array de cores aleatórias para as barras
                backgroundColor: backgroundColors, 
                data: data,
              },
            ],
          };
          this.lastUpdated = new Date().toLocaleTimeString();
        } else {
          this.error = 'Nenhum dado de issues por projeto foi retornado.';
        }

      } catch (err) {
        console.error('Erro ao buscar dados do gráfico:', err);
        this.error = 'Não foi possível carregar os dados. Verifique o servidor e o endpoint.';
        if (err.response) {
            this.error = `Erro da API: ${err.response.data.detail || err.response.statusText || err.response.status}`;
        } else if (err.request) {
            this.error = 'Erro de rede: Não foi possível conectar ao servidor (verifique CORS/URL).';
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
/* O estilo 'height: 100%;' foi removido para evitar problemas de layout */
</style>