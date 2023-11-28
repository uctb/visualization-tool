<template>
    <div ref="distribution" class="echarts"></div>
</template>
<script>
export default {
    name: "FlowDistribution",
    props: {
        category: Object,
        invalid_station: Object,
        invalid_prediction_station: Object,
        full_time_bad_station: Object,
        normal_station: Object
    },
    data() {
        return {
            mychart: null,
        }
    },
    mounted() {
        this.mychart = this.$echarts.init(this.$refs.distribution)
    },
    watch: {
        normal_station: {
            handler(newVal) {
                this.initChart()
            },
            immediate: true,
            deep: true
        }
    },
    computed: {
        options() {
            return {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        // Use axis to trigger tooltip
                        type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
                    }
                },
                legend: {
                    textStyle: {
                        color: 'white'
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'value',
                    name: 'Count',
                    nameLocation: 'end',
                    nameGap: 30,
                    splitLine: {
                        show: false
                    },
                    axisLabel: {
                        color: 'white'
                    },
                    nameTextStyle: {
                        color: 'white',
                        top: '5%'
                    },
                },
                yAxis: {
                    type: 'category',
                    data: this.category,
                    name: 'Flow Range',
                    nameLocation: 'end',
                    nameGap: 15,
                    splitLine: {
                        show: false
                    },
                    axisLabel: {
                        color: 'white'
                    },
                    nameTextStyle: {
                        color: 'white',

                    },
                },
                series: [
                    {
                        name: 'Normal',
                        type: 'bar',
                        stack: 'total',
                        label: {
                            show: true
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: [320, 302, 301, 334, 390, 330, 320]
                    },
                    {
                        name: 'Full Time Bad',
                        type: 'bar',
                        stack: 'total',
                        label: {
                            show: true
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: [120, 132, 101, 134, 90, 230, 210]
                    },
                    {
                        name: 'Invalid Prediction',
                        type: 'bar',
                        stack: 'total',
                        label: {
                            show: true
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: [220, 182, 191, 234, 290, 330, 310]
                    },
                    {
                        name: 'Invalid',
                        type: 'bar',
                        stack: 'total',
                        label: {
                            show: true
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: [150, 212, 201, 154, 190, 330, 410]
                    },
                ]
            }
        }
    },
    methods: {
        initChart() {
            this.$nextTick(() => {
                this.mychart.setOption(this.options)
            })
        }
    }
}
</script>
<style scoped>
.echarts {
    height: 14.5rem;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    /* position: relative; */
    margin-top: 5%;
}
</style>