<template>
  <div ref="weekendEffect" class="echarts"></div>
</template>

<script>
import * as echarts from 'echarts';
export default {
  props: { model: Object },
  data() {
    return {
      global_mean_workday: 0,
      global_mean_weekends: 0,
      local_mean_workday: 0,
      local_mean_weekends: 0,
      mychart: null,
    }
  },
  mounted() {
    this.mychart = echarts.init(this.$refs.weekendEffect);

    // 转换数组为字典并排序
    const maeDict = new Map();
    for (let i = 0; i < this.model.mae_for_each_station.length; i++) {
      maeDict.set(i, this.model.mae_for_each_station[i]);
    }
    const sortedMaeArray = Array.from(maeDict).sort((a, b) => b[1] - a[1]);

    // 计算前topPercentCount的值
    const topPercentCount = Math.ceil(sortedMaeArray.length * ((100 - this.$store.getters.getData.mae) / 100));

    // 计算所有站点的工作日和周末的MAE均值
    const { maeForWorkdays: globalMaeWorkdays, maeForWeekends: globalMaeWeekends } =
      this.calculateMaeForDays(this.model.mae_for_each_station.length);

    // 计算前topPercentCount站点的工作日和周末的MAE均值
    const topStations = sortedMaeArray.slice(0, topPercentCount).map(item => item[0]);
    const { maeForWorkdays: localMaeWorkdays, maeForWeekends: localMaeWeekends } =
      this.calculateMaeForDays(topPercentCount, topStations);

    // 全局均值
    this.global_mean_workday = globalMaeWorkdays.reduce(
      (acc, cur) => acc + cur, 0) / this.model.mae_for_each_station.length;
    this.global_mean_weekends = globalMaeWeekends.reduce(
      (acc, cur) => acc + cur, 0) / this.model.mae_for_each_station.length;

    // 局部均值
    this.local_mean_workday = localMaeWorkdays.reduce(
      (acc, cur) => acc + cur, 0) / topPercentCount;
    this.local_mean_weekends = localMaeWeekends.reduce(
      (acc, cur) => acc + cur, 0) / topPercentCount;

    this.initChart();
  },
  watch: {
    'model.ws': function () {
      const maeDict = new Map();
      for (let i = 0; i < this.model.mae_for_each_station.length; i++) {
        maeDict.set(i, this.model.mae_for_each_station[i]);
      }
      const sortedMaeArray = Array.from(maeDict).sort((a, b) => b[1] - a[1]);

      const topPercentCount = Math.ceil(sortedMaeArray.length * ((100 - this.$store.getters.getData.mae) / 100));

      const { maeForWorkdays: globalMaeWorkdays, maeForWeekends: globalMaeWeekends } =
        this.calculateMaeForDays(this.model.mae_for_each_station.length);

      const topStations = sortedMaeArray.slice(0, topPercentCount).map(item => item[0]);
      const { maeForWorkdays: localMaeWorkdays, maeForWeekends: localMaeWeekends } =
        this.calculateMaeForDays(topPercentCount, topStations);

      this.global_mean_workday = globalMaeWorkdays.reduce(
        (acc, cur) => acc + cur, 0) / this.model.mae_for_each_station.length;
      this.global_mean_weekends = globalMaeWeekends.reduce(
        (acc, cur) => acc + cur, 0) / this.model.mae_for_each_station.length;

      this.local_mean_workday = localMaeWorkdays.reduce(
        (acc, cur) => acc + cur, 0) / topPercentCount;
      this.local_mean_weekends = localMaeWeekends.reduce(
        (acc, cur) => acc + cur, 0) / topPercentCount;

      this.initChart()
    },
    '$store.getters.getData.mae': function (newValue) {
      const maeDict = new Map();
      for (let i = 0; i < this.model.mae_for_each_station.length; i++) {
        maeDict.set(i, this.model.mae_for_each_station[i]);
      }
      const sortedMaeArray = Array.from(maeDict).sort((a, b) => b[1] - a[1]);
      const topPercentCount = Math.ceil(sortedMaeArray.length * ((100 - newValue) / 100));
      const topStations = sortedMaeArray.slice(0, topPercentCount).map(item => item[0]);
      const { maeForWorkdays: localMaeWorkdays, maeForWeekends: localMaeWeekends } =
        this.calculateMaeForDays(topPercentCount, topStations);
      this.local_mean_workday = localMaeWorkdays.reduce(
        (acc, cur) => acc + cur, 0) / topPercentCount;
      this.local_mean_weekends = localMaeWeekends.reduce(
        (acc, cur) => acc + cur, 0) / topPercentCount;
      this.initChart()
    }
  },
  computed: {
    options() {
      return {
        legend: {
          data: [{ name: 'Global MAE', textStyle: { color: 'white' } }, { name: 'Local MAE', textStyle: { color: 'white' } }],

        },
        xAxis: {
          type: 'category',
          data: ['Workday', 'Weekend'],
          axisLine: {
            lineStyle: {
              color: 'white'
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: 'white'
            }
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        series: [{
          name: 'Global MAE',
          type: 'bar',
          emphasis: {
            focus: 'series'
          },
          data: [this.global_mean_workday.toFixed(2), this.global_mean_weekends.toFixed(2)],
          itemStyle: {
            color: '#009688'
          }
        },
        {
          name: 'Local MAE',
          type: 'bar',
          emphasis: {
            focus: 'series'
          },
          data: [this.local_mean_workday.toFixed(2), this.local_mean_weekends.toFixed(2)]
        }]
      }
    }
  },
  methods: {
    initChart() {
      this.mychart.setOption(this.options)
    },
    calculateMaeForDays(stationCount, stationIndices = null) {
      const maeForWorkdays = [];
      const maeForWeekends = [];
      const numOfWeekends = this.model.weekdaynum['SAT'] + this.model.weekdaynum['SUN'];

      for (let i = 0; i < stationCount; i++) {
        const index = stationIndices ? stationIndices[i] : i;
        let workdayMae = 0;
        let weekendMae = 0;

        for (let j = 0; j < this.model.time_length; j++) {
          const error = this.model.st_raster_pred[index][j] - this.model.st_raster_gt[index][j];
          if (this.model.ws[j] === 'SUN' || this.model.ws[j] === 'SAT') {
            weekendMae += Math.abs(error);
          } else {
            workdayMae += Math.abs(error);
          }
        }

        maeForWorkdays.push(workdayMae / (this.model.time_length - numOfWeekends));
        maeForWeekends.push(weekendMae / numOfWeekends);
      }

      return { maeForWorkdays, maeForWeekends };
    },
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