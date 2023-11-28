<template>
  <div ref="heatmap_distribution" class="echarts"></div>
</template>

<script>
export default {
  name: "BadCaseCalenderDistribution",
  props: {
    badcase_calender_distribution_param: Object,
  },
  data() {
    return {
      mychart: null
    }
  },
  mounted() {
    this.mychart = this.$echarts.init(this.$refs.heatmap_distribution)
    this.initChart()
  },
  watch: {
    badcase_calender_distribution_param: {
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

      let hours = this.badcase_calender_distribution_param['xAxis']
      let days = this.badcase_calender_distribution_param['yAxis']
      let data = this.badcase_calender_distribution_param['distribution']
      let min = this.badcase_calender_distribution_param['min']
      let max = this.badcase_calender_distribution_param['max']
      console.log(min, max)

      return {
        tooltip: {
          position: 'bottom'
        },
        grid: {
          // 调整这些值来使图表居中
          left: '8%', // 可以是百分比或者固定像素值
          top: '15%', // 可以是百分比或者固定像素值
          right: '8%', // 通常设置为 'auto'，但可以根据需要调整
          bottom: '1%', // 通常设置为 'auto'，但可以根据需要调整,
          height: '70%',
          containLabel: true // 确保标签完全显示而不被截断
        },
        xAxis: {
          type: 'category',
          data: hours,
          splitArea: {
            show: true
          },
          axisLabel: {
            color: '#FFFFFF'
          }
        },
        yAxis: {
          type: 'category',
          data: days,
          splitArea: {
            show: true
          },
          axisLabel: {
            color: '#FFFFFF'
          },
        },
        visualMap: {
          min: min,
          max: max,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '-10%',
          textStyle: {
            color: 'white'
          },
          inRange: {
            // color: ['#ffd1dc', '#ffadc6', '#ff88a2', '#ff6390', '#ff3d7f']
            color: ['#feedde', '#fdbe85', '#fd8d3c', '#e6550d', '#a63603']
          },
        },
        series: [
          {
            name: '# relative error',
            type: 'heatmap',
            data: data,
            label: {
              show: false
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
    }
  },
  methods: {
    initChart() {
      if (this.mychart === null) {
        console.log('ccc')
        return;
      }
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