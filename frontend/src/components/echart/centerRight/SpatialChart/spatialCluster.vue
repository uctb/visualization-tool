<template>
    <div>
        <div class="selection">
            <el-select v-model="selectedCluster" placeholder="请选择" @change="updateChart" size="mini">
                <el-option v-for="item in clusterOptions" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
            </el-select>
        </div>
        <div ref="spatialCluster" class="echarts"></div>
    </div>
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
            selectedCluster: 0,
            clusterCount: 0,
            clusterOptions: []
        }
    },
    mounted() {
        this.data_pos = this.$store.getters.getData.model.station_info;
        this.spatial_cluster = this.$store.getters.getData.model.spatial_cluster;

        for (var i = 0; i < this.data_pos.length; i++) {
            var pos = this.data_pos[i];
            var sp_cluster = this.spatial_cluster[i];
            var sp_data = [];

            sp_data.push(pos[1]);
            sp_data.push(pos[0]);
            sp_data.push(sp_cluster);
            sp_data.push(i);

            this.spatial_data.push(sp_data);
        }
        this.clusterCount = Math.max(...this.spatial_cluster) + 1;
        this.clusterOptions = Array.from({ length: this.clusterCount }, (v, k) => ({
            value: k,
            label: `Cluster ${k}`
        }));
        this.mychart = this.$echarts.init(this.$refs.spatialCluster);
        this.initChart();
    },
    watch: {
        'model.spatial_cluster': function () {
            this.spatial_data = [];
            this.data_pos = this.$store.getters.getData.model.station_info;
            this.spatial_cluster = this.$store.getters.getData.model.spatial_cluster;

            for (var i = 0; i < this.data_pos.length; i++) {
                var pos = this.data_pos[i];
                var sp_cluster = this.spatial_cluster[i];
                var sp_data = [];

                sp_data.push(pos[1]);
                sp_data.push(pos[0]);
                sp_data.push(sp_cluster);
                sp_data.push(i);

                this.spatial_data.push(sp_data);
            }
            this.clusterCount = Math.max(...this.spatial_cluster) + 1;
            this.clusterOptions = Array.from({ length: this.clusterCount }, (v, k) => ({
                value: k,
                label: `Cluster ${k}`
            }));
            this.initChart();
        },
    },
    computed: {
        options() {
            const data = this.spatial_data.map(item => ({
                ...item,
                selected: item[2] === this.selectedCluster ? 'selected' : 'unselected'
            }));

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
                    },
                    formatter: function (param) {
                        var data = param.data;
                        return 'station ' + data[3];
                    }
                },
                visualMap: [
                    {
                        type: 'piecewise',
                        orient: 'horizontal',
                        categories: ['selected', 'unselected'],
                        dimension: 4,
                        pieces: [
                            { value: 'selected', label: 'Selected', color: '#FF0000' },
                            { value: 'unselected', label: 'Others', color: '#009688' }
                        ],
                        textStyle: {
                            color: '#FFFFFF'
                        },
                        top: 10,
                        right: 10,
                    }
                ],
                grid: {
                    left: 75,
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
                        borderColor: '#555',
                        color: function (param) {
                            return param.data[4] === 'selected' ? '#FFFF00' : '#FF0000';
                        }
                    }
                }
            };
        }
    },
    methods: {
        initChart() {
            this.mychart.setOption(this.options);
        },
        updateChart() {
            this.initChart();
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

.selection {
    position: absolute;
    top: 25%;
    left: 15%;
    z-index: 1000;
}
</style>
