<template>
  <div ref="global_heatmap_distribution" class="echarts"></div>
</template>

<script>
export default {
  name: "BasicBadcaseCalenderDistribution",
  props: {
    basic_badcase_calender_distribution_param: Object,
  },
  data() {
    return {
      mychart: null
    }
  },
  mounted() {
    this.mychart = this.$echarts.init(this.$refs.global_heatmap_distribution)
    this.initChart()
  },
  watch: {
    basic_badcase_calender_distribution_param: {
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

      let range = this.basic_badcase_calender_distribution_param['range']
      let data = this.basic_badcase_calender_distribution_param['distribution']
      let min = this.basic_badcase_calender_distribution_param['min'];
      let max = this.basic_badcase_calender_distribution_param['max'];
      return {
        tooltip: {
          position: 'top',
        },
        visualMap: {
          min: min,
          max: max,
          type: 'piecewise',
          orient: 'vertical',
          right: '5%',
          // top: 65,
          textStyle: {
            color: '#fff'
          },
          inRange: {
            color: ['#feedde', '#fdbe85', '#fd8d3c', '#e6550d', '#a63603'] // 蓝色调渐变配色方案
          },
        },
        calendar: {
          orient: 'vertical',
          top: '40%',
          left: '10%',
          right: '30%',
          cellSize: ['auto', 'auto'],
          range: range,
          itemStyle: {
            borderWidth: 0.5,
            borderColor: '#fff',
          },
          yearLabel: { show: false },
          dayLabel: {
            color: '#fff',
            nameMap: 'EN'
          },
          monthLabel: {
            color: '#fff',
            nameMap: 'EN'
          },
        },
        series: {
          type: 'heatmap',
          coordinateSystem: 'calendar',
          data: data
        }
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
  height: 14.5rem;background-repeat: no-repeat;background-position: 50% 50%;  position: relative;width: 100%;
}
</style>