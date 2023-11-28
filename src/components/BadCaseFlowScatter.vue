<template>
    <div ref="flowScatter" class="echarts"></div>
</template>
<script>
export default {
    name: 'BadCaseFlowScatter',
    props: {
        flow_data: Array,
        name: Object
    },
    data() {
        return {
            mychart: null,
        }
    },
    mounted() {
        this.mychart = this.$echarts.init(this.$refs.flowScatter)
    },
    watch: {
        flow_data: {
            handler(newVal) {
                console.log('new', newVal)
                this.initChart()
            },
            immediate: true,
            deep: true
        }
    },
    computed: {
        options() {
            return {
                xAxis: {
                    type: 'value',
                    name: 'Flow',
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
                    type: 'value',
                    name: this.name,
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
                tooltip: {
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    formatter: function (param) {
                        var value = param.value;
                        // prettier-ignore
                        return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 18px;padding-bottom: 7px;margin-bottom: 7px">'
                            + 'flow' + '：' + value[0].toFixed(2) + '<br>'
                            + 'attribute' + '：' + value[1] + '<br>'
                    }
                },
                series: [
                    {
                        symbolSize: 10,
                        data: this.flow_data,
                        type: 'scatter'
                    }
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
    height: 85%;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    /* position: relative; */
    margin-top: 5%;
}</style>