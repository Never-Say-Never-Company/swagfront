<template>
  <v-app>
    <v-container class="mt-4">
      <v-row justify="start">
        <v-col cols="12" md="6">
          <ProjectTimeCard />
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import ProjectTimeCard from './components/metrics/ProjectTimeCard.vue'; // Ajuste o caminho conforme a sua estrutura de pastas

export default {
  name: 'App',
  components: {
    ProjectTimeCard
  }
}
</script>