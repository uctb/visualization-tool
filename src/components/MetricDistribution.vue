<template>
  <div ref="metric_distribution" class="echarts"></div>
</template>

<script>
export default {
  name: "MetricDistribution",
  props:{
    metric_distribution_param: Array,
  },
  mounted () {
    this.initChart()
  },
  watch: {
    sort_metric_param: {
      handler(newVal) {
        console.log(newVal)
        this.initChart()
      },
      immediate: true,
      deep: true
    }
  },
  computed: {
    options() {
      let x_data = this.metric_distribution_param[0]
      let y_data = this.metric_distribution_param[1]

      return {
        legend : {
          left: '2%',
          top: '5%',
          textStyle:{color:'#fff'}
        },
        xAxis: {
          type: 'category',
          data: x_data,
          axisLabel: {
            color: '#fff',
            interval: 0,
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#fff'
          }
        },
        tooltip: {
          show: true,
          trigger: 'axis'
        },
        series: {
          name: 'point amount',
          type: 'bar',
          itemStyle: {
            normal: {
              color: '#FFB6C1'
            }
          },
          data: y_data
        },
        dataZoom: {
          type: 'slider',
          show: true,
          start: 0,
          end: 70,
          height: 20,
          handleStyle: {
            color: '#fff',
            shadowBlur: 3,
            shadowColor: 'rgba(0, 0, 0, 0.6)',
            shadowOffsetX: 2,
            shadowOffsetY: 2
          }
        }
      };
    }
  },
  methods: {
    initChart() {
      let chart = this.$echarts.init(this.$refs.metric_distribution)
      chart.setOption(this.options)
    }
  }
}
</script>

<style scoped>
.echarts {
  width: 100%;
  height: 500px;
}
</style>