<template>
  <div ref="temporalPattern" class="echarts"></div>
</template>

<script>


export default {
  props: { model: Object },
  data() {
    return {
      mychart: null
    }
  },
  mounted() {
    this.mychart = this.$echarts.init(this.$refs.temporalPattern)
    this.initChart()
  },
  watch: {
    'model.temp_bad_case_param': function () {
      this.initChart()
    }
  },
  computed: {
    options() {
      let gt = this.getColumnMean(this.model.st_raster_gt);
      let pd = this.getColumnMean(this.model.st_raster_pred);
      let ts = this.model.temp_bad_case_param['axisvalue']
      let startIndex = this.model.temp_bad_case_param['startInd']
      let endIndex = this.model.temp_bad_case_param['endInd']
      let score = this.dtwToPercentage(gt, pd)

      return {
        legend: { orient: 'horizontal', left: '2%', top: '5%', textStyle: { color: '#fff' } },
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
            name: "Groundtruth",
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
            name: "Prediction",
            data: pd,
            type: 'line',
            color: '#FF8C00',
            showSymbol: false
          }
          Myseries.push(item2);
          return Myseries;
        }(gt, pd),

        dataZoom: [
          {
            type: 'slider',
            show: true,
            xAxisIndex: 0,
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
          }
        ],
        graphic: {
          elements: [
            {
              type: 'text',
              right: '10%', // 根据需要调整位置
              top: '6%', // 根据需要调整位置
              style: {
                text: `Similarity Score: ${score.toFixed(2)}%`,
                fill: '#fff',
                font: '.8rem Arial'
              }
            }
          ]
        }
      };
    }
  },
  methods: {
    initChart() {
      this.mychart.setOption(this.options)
    },
    getColumnMean(matrix) {
      return matrix[0].map((col, i) => matrix.map(row => row[i]).reduce((acc, val) => acc + val, 0) / matrix.length);
    },
    dtw(gt, pd) {
      const n = gt.length;
      const m = pd.length;
      const dtwMatrix = Array.from({ length: n + 1 }, () => Array(m + 1).fill(Infinity));
      dtwMatrix[0][0] = 0;

      for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
          const cost = Math.abs(gt[i - 1] - pd[j - 1]);
          dtwMatrix[i][j] = cost + Math.min(dtwMatrix[i - 1][j], dtwMatrix[i][j - 1], dtwMatrix[i - 1][j - 1]);
        }
      }

      return dtwMatrix[n][m];
    },

    dtwToPercentage(gt, pd) {
      const distance = this.dtw(gt, pd);
      const maxPossibleDistance = Math.max(gt.length, pd.length) * Math.max(...gt, ...pd);
      const normalizedDistance = distance / maxPossibleDistance;

      // 将标准化的距离转换为百分制评分
      const percentageScore = (1 - normalizedDistance) * 100;
      return Math.max(0, Math.min(100, percentageScore)); // 确保分数在0到100之间
    }
  }
}
</script>

<style scoped>
.echarts {
  height: 20.5rem;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: 50% 50%;
}
</style>
