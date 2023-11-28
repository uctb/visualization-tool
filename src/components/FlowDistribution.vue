<template>
    <div ref="distribution" class="echarts"></div>
</template>
<script>
export default {
    name: "FlowDistribution",
    props: {
      model: Object,
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
        model: {
            handler(newVal) {
              console.log(this.model)
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
                    data: this.model.gtDistribution.interval_name,
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
                        data: this.model.NormalStationGtRange
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
                        data: this.model.FullTimeBadStationGtRange
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
                        data: this.model.InvalidPredStationGtRange
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
                        data: this.model.InvalidStationGtRange
                    },
                ]
            }
        }
    },
    methods: {
        initChart() {
          console.log(this.model.gtDistribution)
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