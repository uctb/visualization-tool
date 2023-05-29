<template>
  <div ref="sort_metric" @click="initChart" class="echarts"></div>
</template>

<script>
export default {
  name: "SortMetric",
  props:{
    sort_metric_param: Object,
  },
  data (){
    return {
      mychart:null
    }
  },
  mounted () {
    this.mychart = this.$echarts.init(this.$refs.sort_metric)
    console.log(this.sort_metric_param['rmse'])
    console.log(this.sort_metric_param['mae'])
    console.log(this.sort_metric_param['y_data'])
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
      let rmse = this.sort_metric_param['rmse']
      let mae = this.sort_metric_param['mae']
      let y_data = this.sort_metric_param['y_data']
      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // Use axis to trigger tooltip
            type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
          }
        },
        legend : {
          left: '2%',
          top: '5%',
          textStyle:{color:'#fff'}
        },
        grid: {
          // left: '3%',
          // right: '4%',
          // bottom: '3%',
          // containLabel: true
          show: false
        },
        xAxis: {
          type: 'value',
          axisLabel: {
                color: '#fff'
          },

        },
        yAxis: {
          name: 'station ID',
          nameLocation: 'center',
          nameTextStyle: {
            color: '#fff',
            fontSize: 15,
            fontWeight: 'bold'
          },
          nameGap: 40,
          type: 'category',
          data: y_data,
          axisLabel: {
            color: '#fff'
          },
        },
        series: [
          {
            name: 'RMSE',
            type: 'bar',
            stack: 'total',
            // label: {
            //   show: true
            // },
            emphasis: {
              focus: 'series'
            },
            itemStyle: {
              normal: {
                color: '#FFB6C1'
              }
            },
            data: rmse
          },
          {
            name: 'MAE',
            type: 'bar',
            stack: 'total',
            // label: {
            //   show: true
            // },
            emphasis: {
              focus: 'series'
            },
            itemStyle: {
              normal: {
                color: 'yellow'
              }
            },
            data: mae
          },
        ],
        dataZoom: [
          {
            type: 'slider',
            show: true,
            xAxisIndex: 0,
            //filterMode: 'empty',   //这句话加上的话，不会随着数据改变轴
            end: 90,
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
            startValue: 0,
            endValue: 30,
            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '60%',
            width: 20,
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
      let xValue = 0
      this.mychart.setOption(this.options);
      this.mychart.on('click', params => {
        xValue = params.name;
        this.$emit('bar-click', xValue);
      })
    },
  }
}
</script>

<style scoped>
.echarts {
  height: 10rem;background-size: contain;background-repeat: no-repeat;background-position: 50% 50%;  position: relative;
}
</style>
