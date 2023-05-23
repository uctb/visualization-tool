<template>
  <div ref="bc_temp_distribution" class="echarts"></div>
</template>

<script>
export default {
  name: "BadcaseTemporalDistribution",
  props:{
    badcase_temp_distribution_param: Object,
  },
  data (){
    return {
      mychart:null
    }
  },
  mounted () {
    this.mychart = this.$echarts.init(this.$refs.bc_temp_distribution)
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
      let y_data = this.badcase_temp_distribution_param['badcase_num']
      let name = this.badcase_temp_distribution_param['name']

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
            color: '#fff'
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
  height: 13rem;background-size: contain;background-repeat: no-repeat;background-position: 50% 50%;  position: relative;
}
</style>