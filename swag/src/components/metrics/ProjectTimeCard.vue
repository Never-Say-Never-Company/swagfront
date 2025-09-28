<template>
  <v-card 
    outlined 
    elevation="2" 
    rounded="lg" 
    class="pa-4 mt-4" 
    style="position: relative;"
    min-height="300px"
  >
    
    <v-overlay :model-value="loading" class="align-center justify-center" contained>
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>

    <div
      v-if="overlay"
      style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(64, 1, 1, 0.96);
        z-index: 10;
        padding: 32px;
        display: flex;
        flex-direction: column;
      "
    >
      <v-container style="flex-grow: 1; overflow-y: auto;">
        <v-row no-gutters class="text-white">
          <v-col cols="12" class="d-flex flex-column">
            
            <v-row no-gutters align="center" class="mt-2">
                <v-col cols="9">
                    <v-text-field
                        v-model="externalSearchQuery"
                        label="Pesquisar Desenvolvedor"
                        theme="dark"
                        hide-details
                        @keyup.enter="restrictUsers" 
                    ></v-text-field>
                </v-col>
                <v-col cols="3" class="d-flex justify-end">
                    <v-btn @click="restrictUsers" color="secondary" variant="flat" class="ml-2" icon>
                        <v-icon>mdi-magnify</v-icon>
                    </v-btn>
                </v-col>
            </v-row>
            <v-select
              v-model="trip.values"
              :items="filteredUsers"
              label="Desenvolvedores"
              chips
              multiple
              theme="dark"
              class="mt-2"
              item-title="displayName"
              item-value="accountId"
              :loading="usersSearching"
              return-object
              clearable
              :search-input.sync="selectSearchInput" 
              :menu-props="{ closeOnContentClick: false }" 
            ></v-select>
            
            <v-row no-gutters class="mt-2">
                Intervalo de datas buscado
            </v-row>
            
            <v-text-field
              v-model="trip.start"
              label="Data Inicial"
              type="date"
              theme="dark"
              class="mt-2"
            ></v-text-field>
            <v-text-field
              v-model="trip.end"
              label="Data Final"
              type="date"
              theme="dark"
              class="mt-2"
            ></v-text-field>
            
          </v-col>
        </v-row>
      </v-container>
      
      <div class="d-flex justify-center mt-4">
       <v-btn @click="overlay = false" color="secondary" class="ma-2" variant="flat">
            <v-icon start>mdi-close</v-icon>
            Cancelar
        </v-btn>

        <v-btn @click="applyFilter" color="primary" class="ma-2" variant="flat">
          <v-icon left>mdi-filter</v-icon>
          Filtrar
        </v-btn>
      </div>
    </div>

    <v-card-title class="text-h6 d-flex align-center">
      Gráfico de Tempo de Projeto
      <v-spacer></v-spacer>
      <v-btn icon @click="overlay = !overlay">
        <v-icon>mdi-filter</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text>
      <GraficoTempoProjetos v-if="chartData" :chart-data="chartData" />
    </v-card-text>
  </v-card>
</template>

<script>
import axios from 'axios';
import GraficoTempoProjetos from './GraficoTempoProjetos.vue';

export default {
  name: 'ProjectTimeCard',
  components: {
    GraficoTempoProjetos
  },
  data() {
    return {
      overlay: false,
      loading: true,
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL, 
      
      trip: {
        values: [], 
        itens: [],  
        start: null,
        end: null
      },
      chartData: null,

      selectSearchInput: null, 
      externalSearchQuery: null, 
      filteredUsers: [], 
      usersSearching: false,
      searchTimeout: null,
    }
  },
  mounted() {
    this.fetchUsers();
    this.fetchChartData(); 
  },
  watch: {
    selectSearchInput(val) {
      if (val) {
        // Se houver texto no campo, chame a função de busca imediatamente.
        // O debounce (atraso) será usado apenas se houver uma chamada à API.
        this.searchUsers(val);
      } else {
        // Se a pesquisa interna foi limpa (ex: pelo X), restaurar a lista completa
        this.filteredUsers = [...this.trip.itens];
        this.usersSearching = false;
        this.externalSearchQuery = null; 
      }
    },
  },
  methods: {
    restrictUsers() {
      // 1. O botão RESTRICT apenas força o valor externo para o campo interno.
      // 2. O watch(selectSearchInput) então dispara a função searchUsers.
      this.selectSearchInput = this.externalSearchQuery;
      
      // Se a pesquisa externa estiver vazia, garante que a lista seja restaurada imediatamente
      if (!this.externalSearchQuery) {
         this.filteredUsers = [...this.trip.itens];
      }
    },
    async fetchUsers() {
      try {
        const response = await axios.get(`${this.apiBaseUrl}/users/list_users`);
        const users = response.data; 

        this.trip.itens = users;
        this.filteredUsers = [...users];

        const selectedDisplayNames = []; 
        this.trip.values = users
          .filter(user => selectedDisplayNames.includes(user.displayName))
          .map(user => user.accountId); 

      } catch (error) {
        console.error("Erro ao buscar a lista de usuários:", error);
        this.trip.itens = []; 
        this.filteredUsers = [];
      }
    },
    // CORREÇÃO APLICADA AQUI: Garantir que a filtragem local ocorra
    async searchUsers(query) {
      if (!query) {
        this.filteredUsers = [...this.trip.itens];
        this.usersSearching = false;
        return;
      }
      
      // *** MUDANÇA CRUCIAL: FILTRAGEM LOCAL IMEDIATA ***
      // Filtra a lista já carregada (`this.trip.itens`) para restringir o v-select.
      const localFiltered = this.trip.itens.filter(user => 
        user.displayName.toLowerCase().includes(query.toLowerCase())
      );
      
      // Inicia a lista exibida com o resultado da filtragem local
      this.filteredUsers = localFiltered;
      this.usersSearching = true; // Inicia o loading, se a API for chamada
      
      
      // *** PARTE OPCIONAL: BUSCA NA API COM DEBOUNCE ***
      // Se você quer que a lista `filteredUsers` seja substituída por uma busca na API, 
      // mantenha a lógica de debounce. Se não quiser API, remova o bloco abaixo.

      if (this.searchTimeout) clearTimeout(this.searchTimeout);

      this.searchTimeout = setTimeout(async () => {
        try {
          const response = await axios.get(`${this.apiBaseUrl}/users/search_users`, {
            params: { query }
          });
          // Se a API retornar a lista, substitua a filtragem local pela busca API
          this.filteredUsers = response.data; 
        } catch (error) {
          console.error("Erro ao buscar usuários:", error);
          // Em caso de erro, mantém a lista filtrada localmente ou a esvazia
          this.filteredUsers = localFiltered; 
        } finally {
          this.usersSearching = false;
        }
      }, 300); // Debounce de 300ms
    },
    transformDataForChart(apiResponse) {
      const consolidatedProjects = {};
      const colors = {}; 

      [...apiResponse.toda_equipe, ...apiResponse.pessoas_selecionadas].forEach(item => {
        if (!consolidatedProjects[item.nome_projeto]) {
          consolidatedProjects[item.nome_projeto] = {
            toda_equipe: 0,
            pessoas_selecionadas: 0
          };
          colors[item.nome_projeto] = this.getRandomColor(); 
        }
      });

      apiResponse.toda_equipe.forEach(item => {
        consolidatedProjects[item.nome_projeto].toda_equipe = item.minutos_projeto;
      });

      apiResponse.pessoas_selecionadas.forEach(item => {
        consolidatedProjects[item.nome_projeto].pessoas_selecionadas = item.minutos_projeto;
      });

      const sortedProjectNames = Object.keys(consolidatedProjects).sort();

      const datasets = [];

      sortedProjectNames.forEach(projectName => {
        const projectData = consolidatedProjects[projectName];
        datasets.push({
          label: projectName, 
          data: [
            projectData.toda_equipe,        
            projectData.pessoas_selecionadas  
          ],
          backgroundColor: colors[projectName], 
        });
      });

      return {
        labels: ['Toda Equipe', 'Pessoas Selecionadas'], 
        datasets: datasets
      };
    },
    getRandomColor() {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },
    async fetchChartData() { 
      this.loading = true; 

      const beginDate = this.trip.start; 
      const endDate = this.trip.end;

      const authorsPayload = this.trip.values.map(user => ({ 
        account_id: user.accountId
      }));

      const payload = {
        begin: beginDate,
        end: endDate,
        authors: authorsPayload
      };
      
      if (!beginDate || !endDate || authorsPayload.length === 0) {
        console.warn("Faltam dados para buscar o gráfico (datas ou autores).");
        this.loading = false;
        this.chartData = null; 
        return; 
      }

      try {
        const response = await axios.post(`${this.apiBaseUrl}/project/project_per_period_and_author`, payload, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        this.chartData = this.transformDataForChart(response.data);
      } catch (error) {
        console.error("Erro ao buscar dados do gráfico:", error);
        this.chartData = null; 
      } finally {
        this.loading = false; 
      }
    },
    applyFilter() {
      this.overlay = false;
      this.fetchChartData();
    }
  }
}
</script>

<style scoped>
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #300000;
}

::-webkit-scrollbar-thumb {
  background: #7a4d44;
  border-radius: 4px;
}
</style>