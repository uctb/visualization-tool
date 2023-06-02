<template>
  <div ref="bc_statistics" class="echarts"></div>
</template>

<script>
export default {
  name: "BadCaseStatistics",
  props:{
    badcase_statistics_param: Object,
  },
  data (){
    return {
      mychart:null
    }
  },
  mounted () {
    this.mychart = this.$echarts.init(this.$refs.bc_statistics)
  },
  watch: {
    badcase_statistics_param: {
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
      let x_data = this.badcase_distribution_param['axisvalue']
      let y_data = this.badcase_distribution_param['distribution']
      let name = this.badcase_distribution_param['name']
      let xAxisname = this.badcase_distribution_param['xAxisname']

      return {
        legend : {
          left: '2%',
          top: '5%',
          textStyle:{color:'#fff'}
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
            rotate: 30,
            formatter: function (value, index) {
              if (y_data[index] !== 0) {
                return value;
              } else {
                return '';
              }
            }
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
  height: 14.5rem;background-size: contain;background-repeat: no-repeat;background-position: 50% 50%;  position: relative;
}
</style>