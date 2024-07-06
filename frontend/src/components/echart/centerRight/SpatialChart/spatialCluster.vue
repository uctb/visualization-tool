<template>
    <div ref="spatialCluster" class="echarts"></div>
</template>

<script>
export default {
    props: { model: Object },
    data() {
        return {
            mychart: null,
            data_pos: [],
            spatial_cluster: [],
            spatial_data: [],
        }
    },
    mounted() {
        this.data_pos = this.$store.getters.getData.model.station_info;
        this.spatial_cluster = this.$store.getters.getData.model.spatial_cluster;

        for (var i = 0; i < this.data_pos.length; i++) {
            var pos = this.data_pos[i]
            var sp_cluster = this.spatial_cluster[i]
            var sp_data = []

            sp_data.push(pos[1])
            sp_data.push(pos[0])
            sp_data.push(sp_cluster)
            sp_data.push(i)

            this.spatial_data.push(sp_data)
        }
        this.mychart = this.$echarts.init(this.$refs.spatialCluster)
        this.initChart()
    },
    watch: {
        'model.spatial_cluster': function () {
            this.initChart()
        },
        'model.station_info': function () {
            this.initChart()
        }
    },
    computed: {
        options() {
            const data = this.spatial_data;
            const CLUSTER_COUNT = Math.max(...data.map(item => item[2])) + 1
            const COLOR_ALL = [
                '#37A2DA', '#e06343', '#37a354', '#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#8E44AD', '#2980B9', '#16A085'
            ];
            const pieces = [];
            for (let i = 0; i < CLUSTER_COUNT; i++) {
                pieces.push({
                    value: i,
                    label: 'cluster ' + i,
                    color: COLOR_ALL[i]
                });
            }
            const xValues = data.map(item => item[0]);
            const yValues = data.map(item => item[1]);
            const xMin = Math.min(...xValues);
            const xMax = Math.max(...xValues);
            const yMin = Math.min(...yValues);
            const yMax = Math.max(...yValues);
            return {
                dataset: {
                    source: data
                },
                tooltip: {
                    position: 'top',
                    backgroundColor: 'rgba(50, 50, 50, 0.7)', // 浅灰色背景
                    textStyle: {
                        color: '#FFFF'
                    }
                },
                visualMap: {
                    type: 'piecewise',
                    top: 'middle',
                    left: 0,
                    min: 0,
                    max: CLUSTER_COUNT,
                    splitNumber: CLUSTER_COUNT,
                    dimension: 2,
                    pieces: pieces,
                    textStyle: {
                        color: '#FFFFFF'
                    },
                    align: 'left'
                },
                grid: {
                    left: 150,
                },
                dataZoom: [
                    {
                        type: 'inside',
                        xAxisIndex: 0,
                        startValue: xMin,
                        endValue: xMax,
                        filterMode: 'filter'
                    }
                ],
                xAxis: {
                    min: xMin, // 设置 x 轴的最小值
                    max: xMax, // 设置 x 轴的最大值
                    axisLabel: {
                        color: '#FFFF'
                    }
                },
                yAxis: {
                    min: yMin.toFixed(2), // 设置 y 轴的最小值
                    max: yMax.toFixed(2),  // 设置 y 轴的最大值
                    axisLabel: {
                        color: '#FFFF'
                    }
                },
                series: {
                    type: 'scatter',
                    encode: { tooltip: [0, 1] },
                    symbolSize: 5,
                    itemStyle: {
                        borderColor: '#555'
                    }
                },
                tooltip: {
                    formatter: function (param) {
                        var data = param.data;
                        return 'station' + data[3];
                    }
                },
            };
        }
    },
    methods: {
        initChart() {
            this.mychart.setOption(this.options)
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