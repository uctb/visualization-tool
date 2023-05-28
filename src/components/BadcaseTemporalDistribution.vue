<template>
  <div ref="pp_distribution" class="echarts"></div>
</template>

<script>
export default {
  name: "BadCaseTemporalDistributionRules",
  props: {
    badcase_temp_distribution_param: Object,
  },
  data() {
    return {
      mychart: null
    }
  },
  mounted() {
    this.mychart = this.$echarts.init(this.$refs.pp_distribution)
  },
  watch: {
    badcase_temp_distribution_param: {
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
      let x_data = this.badcase_temp_distribution_param['axisvalue']
      let y_data = this.badcase_temp_distribution_param['distribution']
      let name = this.badcase_temp_distribution_param['name']
      let xAxisname = this.badcase_temp_distribution_param['xAxisname']

      return {
        legend: {
          left: '2%',
          top: '5%',
          textStyle: {color: '#fff'}
        },
        xAxis: {
          name: xAxisname,
          nameTextStyle: {
            color: '#fff',
          },
          type: 'category',
          data: x_data,
          axisLabel: {
            interval: 0,
            color: '#fff',
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
          name: name,
          type: 'bar',
          itemStyle: {
            normal: {
              color: '#FFB6C1'
            }
          },
          data: y_data
        },
      };
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
  height: 14.5rem;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  position: relative;
}
</style>
