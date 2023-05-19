<template>
  <div ref="sort_metric" class="echarts"></div>
</template>

<script>
export default {
  name: "SortMetric",
  props:{
    sort_metric_param: Array,
  },
  data (){
    return {
      mychart:null
    }
  },
  mounted () {
    this.mychart = this.$echarts.init(this.$refs.sort_metric)
    console.log(this.sort_metric_param[1])
    console.log(this.sort_metric_param[0])
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
      let x_data = this.sort_metric_param[0]
      let y_data = this.sort_metric_param[1]

      return {
        legend : {
          left: '2%',
          top: '5%',
          textStyle:{color:'#fff'}
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            color: '#fff'
          }
        },
        yAxis: {
          type: 'category',
          axisLabel: {
            color: '#fff'
          },
          data: x_data,
        },
        tooltip: {
          show: true,
          trigger: 'axis'
        },
        series: {
          name: 'RMSE',
          type: 'bar',
          itemStyle: {
            normal: {
              color: '#FFB6C1'
            }
          },
          data: y_data
        },
        dataZoom: [
          {
            type: 'slider',
            show: true,
            xAxisIndex: 0,
            //filterMode: 'empty',   //这句话加上的话，不会随着数据改变轴
            startValue: 0,
            endValue: 30,
            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '80%',
            height: 20,
            handleStyle: {
              color: '#fff',
              shadowBlur: 3,
              shadowColor: 'rgba(0, 0, 0, 0.6)',
              shadowOffsetX: 2,
              shadowOffsetY: 2
            }
          },
          {
            type: 'inside',
            show: true,
            xAxisIndex: 0,
          },
          {
            type: 'slider',
            yAxisIndex: 0,
            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '80%',
            width: 40,
            handleStyle: {
              color: '#fff',
              shadowBlur: 3,
              shadowColor: 'rgba(0, 0, 0, 0.6)',
              shadowOffsetX: 2,
              shadowOffsetY: 2
            }
          }
        ]
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
  width: 100%;
  height: 500px;
}
</style>
