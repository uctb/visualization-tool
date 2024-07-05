<template>
  <div ref="pearsonCorrelation" class="echarts"></div>
</template>

<script>
import * as echarts from 'echarts';
export default {
  props: { model: Object },
  data() {
    return {
      mychart: null,
      pearson: []
    }
  },
  mounted() {
    this.mychart = echarts.init(this.$refs.pearsonCorrelation);
    this.pearson = this.model.ip.pearson.map(row => {
      const rowSum = row.reduce((sum, val) => sum + val, 0);
      return row.map(val => val / rowSum);
    });
    console.log(this.pearson)
    this.initChart();
  },
  watch: {
    'model.station_info': function () {
      this.pearson = this.model.ip.pearson.map(row => {
        const rowSum = row.reduce((sum, val) => sum + val, 0);
        return row.map(val => val / rowSum);
      });
      this.initChart();
    },
  },
  computed: {
    options() {
      return {
        legend: {
          data: [
            { name: 'GroudTruth Pearson Correlation', textStyle: { color: 'white' } },
            { name: 'Prediction Pearson Correlation', textStyle: { color: 'white' } }
          ],
        },
        xAxis: {
          type: 'category',
          data: Array.from({ length: 10 }, (_, i) => (i * 0.1).toFixed(1)),
          axisLine: {
            lineStyle: {
              color: 'white'
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: 'white'
            }
          }
        },
        dataZoom: [
          {
            type: 'inside',
            start: 0,
            end: 100,
          },
          {
            type: 'slider',
            start: 0,
            end: 100,
          }
        ],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        series: [
          {
            name: 'GroudTruth Pearson Correlation',
            type: 'bar',
            emphasis: {
              focus: 'series'
            },
            data: this.pearson[0].map(val => val.toFixed(2)),
            itemStyle: {
              color: '#009688'
            }
          },
          {
            name: 'Prediction Pearson Correlation',
            type: 'bar',
            emphasis: {
              focus: 'series'
            },
            data: this.pearson[1].map(val => val.toFixed(2)),
          }
        ]
      }
    }
  },
  methods: {
    initChart() {
      this.mychart.setOption(this.options)
    }
  }
}
</script>
<style scoped>
.echarts {
  height: 20.5rem;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: 50% 50%;
}
</style>