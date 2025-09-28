
<template>
  <v-app>
    <v-app-bar app color="#D97F77" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>SWAG</v-toolbar-title>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app>
      <v-list dense>
        <v-list-item link @click="openDialog">
          <v-list-item-icon>
            <v-icon color="#D97F77">mdi-tools</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class="#D97F77--text">Configurar Conexão</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container class="mt-4">
        <v-row justify="start">
          <v-col cols="12" md="6">
            <ProjectTimeCard />
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
          <v-btn color="grey" text @click="cancelar">Cancelar</v-btn>
          <v-btn color="#D97F77" dark @click="salvar">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <img 
      src="./assets/swag.png"  alt="Imagem Fixa" 
      class="fixed-bottom-image"
    >
  </v-app>
</template>

<script>
import ProjectTimeCard from './components/metrics/ProjectTimeCard.vue';

export default {
  name: 'App',
  components: {
    ProjectTimeCard
  },
  data() {
    return {
      drawer: false,
      dialogOpen: false,
      usuarioinput: '',
      tokeninput: '',  
      usuario: '',
      token: '',  
      showPassword: false 
    };
  },
  methods: {
    openDialog() {
      this.drawer = false;
      this.dialogOpen = true;
    },
    salvar() {
      this.dialogOpen = false; 
      this.usuario = this.usuarioinput;
      this.token = this.tokeninput;
    },
    cancelar() {
      this.usuarioinput = this.usuario;
      this.tokeninput = this.token;
      this.dialogOpen = false;
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
