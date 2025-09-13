<template>
  <v-app>
    <v-container class="mt-4">
      <v-row justify="start">
        <v-col cols="12" md="6">
          <ProjectTimeCard />
        </v-col>
      </v-row>
    </v-container>

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