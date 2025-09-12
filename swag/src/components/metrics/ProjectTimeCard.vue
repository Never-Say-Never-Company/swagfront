<template>
  <v-card outlined elevation="2" rounded="lg" class="pa-4 mt-4" style="position: relative;">
    
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
        background-color: rgba(64, 1, 1, 0.9);
        z-index: 10;
        padding: 32px;
        display: flex;
        flex-direction: column;
      "
    >
      <v-container style="flex-grow: 1; overflow-y: auto;">
        <v-row no-gutters class="text-white">
          <v-col cols="12" class="d-flex flex-column">
            
            <v-select
              v-model="trip.values"
              :items="trip.itens"
              label="Desenvolvedores"
              chips
              multiple
              theme="dark"
              class="mt-2"
            ></v-select>
            
            <v-row no-gutters class="mt-2">
              <v-col class="d-flex justify-start" cols="4">
                Intervalo de datas buscado
              </v-col>
              <v-col class="text-grey-lighten-1" cols="8">
                <v-fade-transition leave-absolute>
                  <span v-if="expanded">Selecione um intervalo de datas</span>
                  <v-row v-else no-gutters>
                    <v-col class="d-flex justify-start" cols="6">
                        Data Inicial: {{ trip.start || 'Não Selecionado' }}
                    </v-col>
                    <v-col class="d-flex justify-start" cols="6">
                      Data Final: {{ trip.end || 'Não Selecionado' }}
                    </v-col>
                  </v-row>
                </v-fade-transition>
              </v-col>
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
      expanded: false,
      apiEndpoint: 'https://mockdashmetricas.free.beeceptor.com',
      trip: {
        values: ['Paloma', 'Ricardo', 'Cristiane'],
        itens: ['Paloma', 'Ricardo', 'Cristiane', 'Iraque'],
        start: null,
        end: null
      },
      chartData: null
    }
  },
  mounted() {
    this.fetchChartData();
  },
  methods: {
    transformDataForChart(apiResponse) {
      const allProjects = {};
      const datasets = [];

      apiResponse.toda_equipe.forEach(p => {
        allProjects[p.nome_projeto] = {
          label: p.nome_projeto,
          toda_equipe: p.minutos_projeto,
          pessoas_selecionadas: 0,
          backgroundColor: this.getRandomColor()
        };
      });

      apiResponse.pessoas_selecionadas.forEach(p => {
        if (!allProjects[p.nome_projeto]) {
          allProjects[p.nome_projeto] = {
            label: p.nome_projeto,
            toda_equipe: 0,
            pessoas_selecionadas: p.minutos_projeto,
            backgroundColor: this.getRandomColor()
          };
        } else {
          allProjects[p.nome_projeto].pessoas_selecionadas = p.minutos_projeto;
        }
      });

      for (const projectName in allProjects) {
        datasets.push({
          label: allProjects[projectName].label,
          data: [allProjects[projectName].toda_equipe, allProjects[projectName].pessoas_selecionadas],
          backgroundColor: allProjects[projectName].backgroundColor
        });
      }

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
    fetchChartData() {
      this.loading = true;

      const payload = {
        data_inicial: this.trip.start,
        data_final: this.trip.end,
        pessoas_selecionadas: this.trip.values
      };

      axios.post(this.apiEndpoint, payload)
        .then(response => {
          this.chartData = this.transformDataForChart(response.data);
        })
        .catch(error => {
          console.error("Erro ao buscar dados do gráfico:", error);
        })
        .finally(() => {
          this.loading = false;
        });
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