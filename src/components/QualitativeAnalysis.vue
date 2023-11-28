<template>
    <div ref="analysis" class="echarts"></div>
</template>
<script>
export default {
    name: "QualitativeAnalysis",
    props: {
        model: Object,
    },
    data() {
        return {
            mychart: null,
            invalid_station: [],
            invalid_prediction_station: [],
            full_time_bad_station: [],
            normal_station: []
        }
    },
    mounted() {
        this.mychart = this.$echarts.init(this.$refs.analysis)
    },
    watch: {
        model: {
            handler(newVal) {
                this.invalid_station = [],
                this.invalid_prediction_station = [],
                this.full_time_bad_station = [],
                this.normal_station = []
                this.initChart()
            },
            immediate: true,
            deep: true
        }
    },
    computed: {
        options() {
            const itemStyle = {
                opacity: 0.8,
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowColor: 'rgba(0,0,0,0.3)'
            };
            return {
                xAxis: {
                    type: 'value',
                    name: 'Flow Range',
                    nameGap: 16,
                    splitLine: {
                        show: false
                    },
                    axisLabel: {
                        color: 'white'
                    },
                    nameTextStyle: {
                        color: 'white'

                    },
                },
                yAxis: {
                    type: 'value',
                    name: 'Influence Time',
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
                            + 'station' + '：' + value[3] + '<br>'
                            + 'flow' + '：' + value[0].toFixed(2) + '<br>'
                            + "Influence Time" + '：' + value[1] + '<br>'
                            + "RMSE" + '：' + value[2].toFixed(2) + '<br>';
                    }
                },
                color: ['#dd4444', '#fec42c', '#800080','#80F1BE'],
                legend: {
                    top: 10,
                    data: ['Invalid', 'Invalid Prediction', 'Full Time Bad', 'Normal'],
                    textStyle: {
                        color: 'white'
                    }
                },
                grid: {
                    left: '10%',
                    right: 150,
                    top: '18%',
                    bottom: '10%'
                },
                visualMap: [
                    {
                        left: 'right',
                        top: '15%',
                        dimension: 2,
                        // min: 0,
                        // max: 150,
                        itemWidth: 20,
                        itemHeight: 120,
                        calculable: true,
                        precision: 0.1,
                        text: ['Area：RMSE'],
                        // textGap: 30,
                        inRange: {
                            symbolSize: [10, 40]
                        },
                        outOfRange: {
                            symbolSize: [10, 40],
                            color: ['rgba(255,255,255,0.4)']
                        },
                        controller: {
                            inRange: {
                                color: ['#c23531']
                            },
                            outOfRange: {
                                color: ['#999']
                            }
                        },
                        textStyle: {
                            color: 'white'
                        }
                    },
                ],
                series: [
                    {
                        name: 'Invalid',
                        type: 'scatter',
                        itemStyle: itemStyle,
                        data: this.invalid_station
                    },
                    {
                        name: 'Invalid Prediction',
                        type: 'scatter',
                        itemStyle: itemStyle,
                        data: this.invalid_prediction_station
                    },
                    {
                        name: 'Full Time Bad',
                        type: 'scatter',
                        itemStyle: itemStyle,
                        data: this.full_time_bad_station
                    },
                    {
                        name: 'Normal',
                        type: 'scatter',
                        itemStyle: itemStyle,
                        data: this.normal_station
                    },
                ]
            }
        }
    },
    methods: {
        initChart() {
            this.$nextTick(() => {
                for (let i = 0; i < this.model.station_num; i++) {
                    if (this.model.invalid_station_index.includes(i)) {
                        this.invalid_station.push([
                            this.model.mean_gt_for_each_station[i],
                            this.model.InfluenceTimeRatio[i],
                            this.model.rmse_for_each_station[i],
                            i
                        ])
                    } else if (this.model.invalid_prediciton_stations.includes(i)) {
                        this.invalid_prediction_station.push([
                            this.model.mean_gt_for_each_station[i],
                            this.model.InfluenceTimeRatio[i],
                            this.model.rmse_for_each_station[i],
                            i
                        ])
                    } else if (this.model.FullTimeBadStation.includes(i)) {
                        console.log(this.model.InfluenceTimeRatio[i])
                        this.full_time_bad_station.push([
                            this.model.mean_gt_for_each_station[i],
                            this.model.InfluenceTimeRatio[i],
                            this.model.rmse_for_each_station[i],
                            i
                        ])
                    } else{
                        this.normal_station.push([
                            this.model.mean_gt_for_each_station[i],
                            this.model.InfluenceTimeRatio[i],
                            this.model.rmse_for_each_station[i],
                            i
                        ])
                    }
                }
                console.log(this.invalid_station)
                console.log(this.invalid_prediction_station)
                console.log(this.full_time_bad_station)
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