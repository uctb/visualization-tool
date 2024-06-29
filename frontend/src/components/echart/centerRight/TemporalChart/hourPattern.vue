<template>
    <div ref="hourlyEffect" class="echarts"></div>
</template>

<script>
import * as echarts from 'echarts';

export default {
    props: { model: Object },
    data() {
        return {
            global_hourly_mae: [], 
            local_hourly_mae: [], 
            mychart: null, 
            hourIndexMap: [] // 用于存储时间索引映射
        }
    },
    mounted() {
        this.mychart = echarts.init(this.$refs.hourlyEffect);

        // 确定第一个数据对应的时间，计算每个时间点的列索引
        const firstDataTime = this.model.hs[0];
        const firstDataHour = new Date(firstDataTime).getHours();
        this.hourIndexMap = new Array(this.model.time_length).fill(0).map((_, i) => (i + firstDataHour) % 24);

        // 将 mae_for_each_station 数组转换为字典并按值降序排序
        const maeDict = new Map(); 
        for (let i = 0; i < this.model.mae_for_each_station.length; i++) {
            maeDict.set(i, this.model.mae_for_each_station[i]);
        }
        // 将字典转换为数组并按MAE值降序排序
        const sortedMaeArray = Array.from(maeDict).sort((a, b) => b[1] - a[1]);
        // console.log("降序", sortedMaeArray);
        // 计算 Top 百分比站点的数量
        const topPercentCount = Math.ceil(sortedMaeArray.length * ((100 - this.$store.getters.getData.mae) / 100));

        // 计算所有站点每小时的MAE均值
        this.global_hourly_mae = this.calculateHourlyMae(this.model.mae_for_each_station.length);

        // 计算前 topPercentCount 站点每小时的MAE均值
        const topStations = sortedMaeArray.slice(0, topPercentCount).map(item => item[0]);
        this.local_hourly_mae = this.calculateHourlyMae(topPercentCount, topStations);
        // console.log("Local MAE Hourly:", this.local_hourly_mae);
        this.initChart();
    },
    watch: {
        'model.hs': function () {
            const maeDict = new Map();
            for (let i = 0; i < this.model.mae_for_each_station.length; i++) {
                maeDict.set(i, this.model.mae_for_each_station[i]);
            }
            const sortedMaeArray = Array.from(maeDict).sort((a, b) => b[1] - a[1]);

            const topPercentCount = Math.ceil(sortedMaeArray.length * ((100 - this.$store.getters.getData.mae) / 100));

            this.global_hourly_mae = this.calculateHourlyMae(this.model.mae_for_each_station.length);

            const topStations = sortedMaeArray.slice(0, topPercentCount).map(item => item[0]);
            this.local_hourly_mae = this.calculateHourlyMae(topPercentCount, topStations);

            this.initChart();
        },
        '$store.getters.getData.mae': function (newValue) {
            const maeDict = new Map();
            for (let i = 0; i < this.model.mae_for_each_station.length; i++) {
                maeDict.set(i, this.model.mae_for_each_station[i]);
            }
            const sortedMaeArray = Array.from(maeDict).sort((a, b) => b[1] - a[1]);
            const topPercentCount = Math.ceil(sortedMaeArray.length * ((100 - newValue) / 100));
            const topStations = sortedMaeArray.slice(0, topPercentCount).map(item => item[0]);
            this.local_hourly_mae = this.calculateHourlyMae(topPercentCount, topStations);
            this.initChart();
        }
    },
    computed: {
        options() {
            return {
                legend: {
                    data: [
                        { name: 'Global MAE', textStyle: { color: 'white' } },
                        { name: 'Local MAE', textStyle: { color: 'white' } }
                    ],
                },
                xAxis: {
                    type: 'category',
                    data: Array.from({ length: 24 }, (_, i) => i),
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
                dataZoom: [
                {
                    type: 'inside', 
                    start: 0,
                    end: 100,
                },
                {
                    type: 'slider', 
                    start: 0,
                    end: 100,
                }
            ],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                series: [
                    {
                        name: 'Global MAE',
                        type: 'bar',
                        emphasis: {
                            focus: 'series'
                        },
                        data: this.global_hourly_mae.map(mae => mae.toFixed(2)),
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
                        data: this.local_hourly_mae.map(mae => mae.toFixed(2))
                    }
                ]
            }
        }
    },
    methods: {
        initChart() {
            this.mychart.setOption(this.options);
        },
        calculateHourlyMae(stationCount, stationIndices = null) {
            const hourlyMae = new Array(this.model.time_length).fill(0).map(() => []);

            // console.log("Calculating MAE for stations:", stationCount);

            for (let i = 0; i < stationCount; i++) {
                const index = stationIndices ? stationIndices[i] : i;

                for (let j = 0; j < this.model.time_length; j++) {
                    const hourIndex = this.hourIndexMap[j];
                    const error = this.model.st_raster_pred[index][hourIndex] - this.model.st_raster_gt[index][hourIndex];
                    hourlyMae[j].push(Math.abs(error));
                }
            }

            hourlyMae.forEach((hour, index) => {
                // console.log(`Hour ${index}, Errors:`, hour);
            });

            const hourlyAverageMae = hourlyMae.map(hour => hour.reduce((acc, cur) => acc + cur, 0) / hour.length);

            hourlyAverageMae.forEach((mae, index) => {
                // console.log(`Hour ${index}, Average MAE: ${mae}`);
            });

            return hourlyAverageMae;
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
