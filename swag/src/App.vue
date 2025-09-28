<template>
  <v-app>
    <v-app-bar app color="#D97F77" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>SWAG</v-toolbar-title>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app>
      <v-list dense>
        <v-list-item link @click="openDialog">
          <template v-slot:prepend>
            <v-icon color="#D97F77">mdi-tools</v-icon>
          </template>
          
          <v-list-item-title class="#D97F77--text">Configurar Conexão</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container class="mt-4">
        <v-row justify="start">
          <v-col cols="12" md="6">
            <ProjectTimeCard />
          </v-col>
          <v-col cols="12" md="6">
            <IssuesPerProjectChart />
          </v-col>
        </v-row>
        
        <v-row justify="start">
          <v-col cols="12">
            <DevelopersAnalysisTable />
          </v-col>
        </v-row>
        
      </v-container>
    </v-main>

    <v-dialog v-model="dialogOpen" max-width="500">
      <v-card>
        <v-card-title class="headline">Configurar Conexão</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field
              v-model="usuarioinput"
              label="Usuário do Jira (e-mail)"
              required
            ></v-text-field>

            <v-text-field
              v-model="tokeninput"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              :type="showPassword ? 'text' : 'password'"
              label="Token"
              @click:append="showPassword = !showPassword"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="cancelar" :disabled="loadingConnection">Cancelar</v-btn>
          <v-btn color="#D97F77" dark @click="salvar" :loading="loadingConnection" :disabled="!usuarioinput || !tokeninput">Salvar</v-btn>
        </v-card-actions>
        
        <v-alert
          v-if="connectionStatus"
          :type="connectionStatus.type"
          dense
          text
          class="mb-0"
        >
          {{ connectionStatus.message }}
        </v-alert>

      </v-card>
    </v-dialog>

    <img 
      src="./assets/swag.png"  alt="Imagem Fixa" 
      class="fixed-bottom-image"
    >
  </v-app>
</template>

<script>
import axios from 'axios';
import ProjectTimeCard from './components/metrics/ProjectTimeCard.vue';
import IssuesPerProjectChart from './components/metrics/IssuesPerProjectChart.vue';
import DevelopersAnalysisTable from './components/metrics/DevelopersAnalysisTable.vue'; // <-- NOVO

export default {
  name: 'App',
  components: {
    ProjectTimeCard,
    IssuesPerProjectChart, 
    DevelopersAnalysisTable, // <-- NOVO
  },
  data() {
    return {
      drawer: false,
      dialogOpen: false,
      usuarioinput: '',
      tokeninput: '',  
      usuario: '',
      token: '',
      showPassword: false,
      loadingConnection: false,
      connectionStatus: null,
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    };
  },
  methods: {
    openDialog() {
      this.usuarioinput = this.usuario;
      this.tokeninput = this.token;
      this.connectionStatus = null;
      this.dialogOpen = true;
    },
    async salvar() { 
      this.loadingConnection = true;
      this.connectionStatus = null;

      const payload = {
        user_name: this.usuarioinput,
        token: this.tokeninput
      };

      try {
        const response = await axios.post(`${this.apiBaseUrl}/base_update`, payload, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.status === 200 || response.status === 201) { 
          this.usuario = this.usuarioinput;
          this.token = this.tokeninput;
          this.connectionStatus = { type: 'success', message: 'Conexão configurada com sucesso!' };
          setTimeout(() => {
            this.dialogOpen = false;
          }, 1500); 
        } else {
          this.connectionStatus = { type: 'error', message: `Erro ao configurar: ${response.data.detail || response.statusText}` };
        }
      } catch (error) {
        console.error("Erro ao configurar conexão:", error);
        this.connectionStatus = { type: 'error', message: 'Falha na conexão. Verifique o console para mais detalhes.' };
        if (error.response) {
          this.connectionStatus.message = `Erro na API: ${error.response.data.detail || error.response.statusText}`;
        } else if (error.request) {
          this.connectionStatus.message = 'Não foi possível conectar ao servidor. Verifique a URL da API e o CORS.';
        } else {
          this.connectionStatus.message = 'Erro inesperado. Tente novamente.';
        }
      } finally {
        this.loadingConnection = false;
      }
    },
    cancelar() {
      this.usuarioinput = this.usuario;
      this.tokeninput = this.token;
      this.dialogOpen = false;
      this.connectionStatus = null;
    }
  }
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  overflow-x: hidden; 
}

.fixed-bottom-image {
  position: fixed; 
  bottom: 0;       
  right: 0;       
  width: 150px;   
  height: auto;    
  z-index: 1000;   
  padding: 0;      
  margin: 0;      
  display: block; 
}
</style>