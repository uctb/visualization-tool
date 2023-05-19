<template>
  <div ref="hotspot" class="echarts"></div>
</template>

<script>
export default {
  name: "ErrorHotspot",
  props:{
    error_hotspot_param: Array,
  },
  data (){
    return {
      mychart:null
    }
  },
  mounted () {
    this.mychart = this.$echarts.init(this.$refs.hotspot)
  },
  watch: {
    error_hotspot_param: {
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
      let pd = this.error_hotspot_param['prediction']
      let gt = this.error_hotspot_param['groundtruth']
      let ts = this.error_hotspot_param['axisvalue']

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
                }
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