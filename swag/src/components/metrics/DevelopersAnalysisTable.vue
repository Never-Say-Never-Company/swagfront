<template>
  <v-card :loading="loading" class="developers-analysis-table">
    <v-card-title class="text-h5">Análise de Desenvolvedores</v-card-title>
    
    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="developersData"
        :sort-by="[{ key: 'total_horas', order: 'desc' }]"
        class="elevation-1"
        :loading="loading"
        loading-text="Carregando dados..."
        no-data-text="Nenhum dado de desenvolvedor encontrado."
      >
        <template v-slot:item.total_horas="{ item }">
          {{ formatHours(item.total_horas) }}
        </template>
      </v-data-table>
      
      <v-row class="mt-4" align="center">
        <v-col cols="auto">
          <v-btn
            color="#D97F77"
            dark
            @click="fetchData"
            :loading="loading"
            :disabled="loading"
            prepend-icon="mdi-refresh"
          >
            Atualizar Dados
          </v-btn>
        </v-col>
        
        <v-col v-if="lastUpdated">
          <v-chip size="small" color="grey-lighten-4" class="text-grey-darken-3">
            Última atualização: **{{ lastUpdated }}**
          </v-chip>
        </v-col>
      </v-row>
      
      <v-alert v-if="error" type="error" dense class="mt-4">{{ error }}</v-alert>

    </v-card-text>
  </v-card>
</template>

<script>
import axios from 'axios';

export default {
  name: 'DevelopersAnalysisTable',
  data() {
    return {
      loading: false,
      error: null,
      developersData: [],
      lastUpdated: null,
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
      headers: [
        { title: 'Desenvolvedor', key: 'nome' },
        { title: 'Issues Resolvidas', key: 'quantidade_issues', align: 'end' },
        { title: 'Total de Horas', key: 'total_horas', align: 'end' },
      ],
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      this.error = null;
      try {
        const url = `${this.apiBaseUrl}/project/count_issues_by_user_and_total_hours`;
        
        const response = await axios.get(url);
        
        this.developersData = response.data;
        
        this.updateLastUpdated();
        
      } catch (err) {
        console.error("Erro ao buscar dados dos desenvolvedores:", err);
        this.error = "Falha ao carregar os dados. Verifique a conexão com a API.";
        this.developersData = [];
      } finally {
        this.loading = false;
      }
    },
    
    formatHours(seconds) {
      if (!seconds || seconds === 0) return '0h 0m';
      
      const totalHours = seconds / 3600;
      const hours = Math.floor(totalHours);
      const minutes = Math.round((totalHours - hours) * 60);
      
      return `${hours}h ${minutes}m`;
    },
    
    updateLastUpdated() {
      const now = new Date();
      this.lastUpdated = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
  }
};
</script>

<style scoped>
.developers-analysis-table {
  min-height: 200px;
}
</style>