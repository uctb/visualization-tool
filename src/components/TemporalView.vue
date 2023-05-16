<template>
  <div ref="pd_gt" class="echarts"></div>
</template>

<script>


export default {
  name: 'TemporalBadCase',
  props:{

    temp_bad_case_param: Array,
  },
  mounted () {
    this.initChart()
  },
  watch: {
    temp_bad_case_param: {
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
      let pd = this.temp_bad_case_param[0]
      let gt = this.temp_bad_case_param[1]
      let ts = this.temp_bad_case_param[2]
      let startIndex = this.temp_bad_case_param[3]
      let endIndex = this.temp_bad_case_param[4]
      return {
        legend: {orient: 'horizontal', left: '2%', top: '5%', textStyle: {color: '#fff'}},
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
          },
          position: function (pt) {
            return [pt[0], '10%'];
          }
        },
        axisPointer: {
          label: {
            backgroundColor: '#1177',
            precision: 2
          }
        },
        xAxis: {
          type: 'category',
          data: ts,
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
        series: function (gt, pd) {
          var Myseries = [];
          var item1 =
              {
                name: "Ground Truth",
                data: gt,
                type: 'line',
                symbol: 'triangle',
                symbolSize: 8,
                itemStyle: {
                  borderColor: "#111AAA",
                  color: '#fff',
                  shadowColor: 'rgba(0, 0, 0, 0.5)',
                  shadowBlur: 10
                },
                lineStyle: {
                  width: 3
                },
                // markArea:{
                //   slient: true,
                //   itemStyle:{
                //     color: '#f8aba6',
                //     opacity: 0.3
                //   },
                //   data: markArea
                // },
              }
          Myseries.push(item1);

          var item2 = {
            name: "prediction",
            data: pd,
            type: 'line',
            color: '#FF8C00',
            showSymbol: false,
            // showAllSymbol : true,
          }
          Myseries.push(item2);

          return Myseries;
        }(gt, pd),

        dataZoom: [
          {
            type: 'slider',
            show: true,
            xAxisIndex: 0,
            //filterMode: 'empty',   //这句话加上的话，不会随着数据改变轴
            startValue: ts[startIndex],
            endValue: ts[endIndex],
            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '60%',
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
            startValue: ts[startIndex],
            endValue: ts[endIndex],
          },
          {
            type: 'slider',
            yAxisIndex: 0,
            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '80%',
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
      let chart = this.$echarts.init(this.$refs.pd_gt)
      chart.setOption(this.options)
    }
  }
}
</script>

<style>
.echarts {
  width: 100%;
  height: 500px;
}
</style>
