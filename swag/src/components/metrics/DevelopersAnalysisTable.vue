<template>
  <v-card :loading="loadingProjects" class="developers-analysis-table">
    <v-card-title class="text-h5">Análise de Desenvolvedores</v-card-title>
    
    <v-card-text>
      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <v-select
            label="Selecione o Projeto"
            :items="projects"
            item-title="name"
            item-value="id"
            v-model="selectedProjectId"
            :loading="loadingProjects"
            :disabled="loadingProjects"
            variant="outlined"
            density="compact"
            hide-details
          ></v-select>
        </v-col>
      </v-row>

      <div v-if="selectedProjectId">
        <v-data-table
          :headers="headers"
          :items="developersData"
          :sort-by="[{ key: 'custo_total', order: 'desc' }]"
          class="elevation-1"
          :loading="loadingData"
          loading-text="Carregando dados..."
          no-data-text="Nenhum dado de desenvolvedor encontrado para este projeto."
        >
          <template v-slot:item.total_horas="{ item }">
            {{ formatHours(item.total_horas * 3600) }}
          </template>
          
          <template v-slot:item.valor_por_hora="{ item }">
            {{ formatCurrency(item.valor_por_hora) }}
          </template>
          
          <template v-slot:item.custo_total="{ item }">
            {{ formatCurrency(item.custo_total) }}
          </template>
        </v-data-table>
        
        <v-row class="mt-4" align="center">
          <v-col cols="auto">
            <v-btn
              color="#D97F77"
              dark
              @click="fetchDevelopersData"
              :loading="loadingData"
              :disabled="loadingData"
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
      </div>

      <v-alert
        v-else-if="!loadingProjects"
        type="info"
        variant="tonal"
        class="mt-4"
        icon="mdi-information-outline"
      >
        Selecione um projeto para carregar a análise dos desenvolvedores.
      </v-alert>

    </v-card-text>
  </v-card>
</template>

<script>
import axios from 'axios';

export default {
  name: 'DevelopersAnalysisTable',
  data() {
    return {
      loadingData: false,
      loadingProjects: false,
      error: null,
      projects: [],
      selectedProjectId: null,
      developersData: [],
      lastUpdated: null,
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
      headers: [
        { title: 'Desenvolvedor', key: 'nome' },
        { title: 'Issues Resolvidas', key: 'quantidade_issues', align: 'end' },
        { title: 'Total de Horas', key: 'total_horas', align: 'end' },
        { title: 'Valor/Hora', key: 'valor_por_hora', align: 'end' },
        { title: 'Custo Total (R$)', key: 'custo_total', align: 'end' },
      ],
    };
  },
  watch: {
    selectedProjectId(newProjectId, oldProjectId) {
      if (newProjectId && newProjectId !== oldProjectId) {
        this.fetchDevelopersData();
      } else if (!newProjectId) {
        this.developersData = [];
        this.lastUpdated = null;
        this.error = null;
      }
    }
  },
  mounted() {
    this.fetchProjects();
  },
  methods: {
    async fetchProjects() {
      this.loadingProjects = true;
      this.error = null;
      try {
        const url = `${this.apiBaseUrl}/project/list_projects`;
        const response = await axios.get(url);
        this.projects = response.data;
      } catch (err) {
        console.error("Erro ao buscar a lista de projetos:", err);
        this.error = "Falha ao carregar a lista de projetos. Verifique a conexão com a API.";
      } finally {
        this.loadingProjects = false;
      }
    },
    async fetchDevelopersData() {
      if (!this.selectedProjectId) {
        this.developersData = [];
        this.lastUpdated = null;
        return;
      }

      this.loadingData = true;
      this.error = null;
      try {
        const url = `${this.apiBaseUrl}/project/count_issues_by_user_and_total_hours/${this.selectedProjectId}`;
        
        const response = await axios.get(url);
        
        this.developersData = response.data;
        
        this.updateLastUpdated();
        
      } catch (err) {
        console.error("Erro ao buscar dados dos desenvolvedores:", err);
        this.error = "Falha ao carregar os dados dos desenvolvedores. Verifique a conexão com a API.";
        this.developersData = [];
      } finally {
        this.loadingData = false;
      }
    },
    
    formatHours(seconds) {
      if (!seconds || seconds === 0) return '0h 0m';
      
      const totalHours = seconds / 3600;
      const hours = Math.floor(totalHours);
      const minutes = Math.round((totalHours - hours) * 60);
      
      return `${hours}h ${minutes}m`;
    },
    
    formatCurrency(value) {
        if (value === null || value === undefined) return '-';

        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
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