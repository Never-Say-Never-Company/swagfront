<template>
  <div>
    <Bar
      id="stacked-bar-chart"
      :options="chartOptions"
      :data="chartData"
    />
  </div>
</template>

<script>
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { Bar } from 'vue-chartjs'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
)

export default {
  name: 'GraficoTempoProjetos',
  components: { Bar },
  props: {
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            barPercentage: 0.8, 
            categoryPercentage: 0.7
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.x !== null) {
                  label += new Intl.NumberFormat('pt-BR', { style: 'decimal' }).format(context.parsed.x) + ' min';
                }
                return label;
              }
            }
          },
          legend: {
            position: 'bottom',
          }
        }
      }
    }
  }
}
</script>