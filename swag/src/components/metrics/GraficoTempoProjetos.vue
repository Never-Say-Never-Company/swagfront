<template>
  <canvas ref="canvas"></canvas>
</template>

<script>
import { Chart } from 'chart.js/auto'

export default {
  name: 'StackedBarChart',
  props: {
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null // Armazena a instância do gráfico
    }
  },
  watch: {
    chartData: {
      handler(newData) {
        if (this.chart) {
          this.chart.data = newData
          this.chart.update()
        }
      },
      deep: true // Necessário para monitorar mudanças profundas no objeto
    }
  },
  mounted() {
    const ctx = this.$refs.canvas.getContext('2d')
    
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: this.chartData,
      options: {
        responsive: true,
        indexAxis: 'y',
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true
          }
        }
      }
    })
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy()
    }
  }
}
</script>