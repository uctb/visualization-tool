<template>
    <div>
        <div class="boxall" id="bmap" ref="bmap">
        </div>
    </div>
</template>

<script>
import "echarts/extension/bmap/bmap";

export default {
    data() {
        return {
            model: this.$store.getters.getData.model,
            stationInd: this.$store.getters.getData.currentstation,
            maps: [],
            maps_filered: [],
            center: [],
        }
    },
    watch: {
        'model.station_info': function () {
            this.$data.maps = [];
                this.$data.center = [this.model.station_lngs[0], this.model.station_lats[0]];
                for (let i = 0; i < this.$data.model.station_num; i++) {
                    this.$data.maps.push({
                        name: 'station' + i,
                        value: []
                    });

                    this.$data.maps[i].value.push(this.$data.model.station_lngs[i]);
                    this.$data.maps[i].value.push(this.$data.model.station_lats[i]);
                    this.$data.maps[i].value.push(this.$data.model.mae_for_each_station[i]);
                }
                this.$data.center = [this.$data.model.station_lngs[0], this.$data.model.station_lats[0]];
                this.maps_filered = this.maps;
                var sorted = this.maps.slice().sort((a, b) => b.value[2] - a.value[2]);
                var topPercentCount = Math.ceil(sorted.length * ((100 - this.$store.getters.getData.mae) / 100));
                this.maps_filered = sorted.slice(0, topPercentCount);
                if (this.$store.getters.getData.temporalCluster != -1) {
                    this.maps_filered = this.maps_filered.filter(item =>
                        this.model.temporal_cluster[item.name.slice(7, item.name.length)] == this.$store.getters.getData.temporalCluster);
                }
                if (this.$store.getters.getData.spatialCluster != -1) {
                    this.maps_filered = this.maps_filered.filter(item =>
                        this.model.spatial_cluster[item.name.slice(7, item.name.length)] == this.$store.getters.getData.spatialCluster);
                }
                this.initCharts();
        },
        "model.ws": {
            handler() {
                this.$data.maps = [];
                this.$data.center = [this.model.station_lngs[0], this.model.station_lats[0]];
                for (let i = 0; i < this.$data.model.station_num; i++) {
                    this.$data.maps.push({
                        name: 'station' + i,
                        value: []
                    });

                    this.$data.maps[i].value.push(this.$data.model.station_lngs[i]);
                    this.$data.maps[i].value.push(this.$data.model.station_lats[i]);
                    this.$data.maps[i].value.push(this.$data.model.mae_for_each_station[i]);
                }
                this.$data.center = [this.$data.model.station_lngs[0], this.$data.model.station_lats[0]];
                this.maps_filered = this.maps;
                var sorted = this.maps.slice().sort((a, b) => b.value[2] - a.value[2]);
                var topPercentCount = Math.ceil(sorted.length * ((100 - this.$store.getters.getData.mae) / 100));
                this.maps_filered = sorted.slice(0, topPercentCount);
                if (this.$store.getters.getData.temporalCluster != -1) {
                    this.maps_filered = this.maps_filered.filter(item =>
                        this.model.temporal_cluster[item.name.slice(7, item.name.length)] == this.$store.getters.getData.temporalCluster);
                }
                if (this.$store.getters.getData.spatialCluster != -1) {
                    this.maps_filered = this.maps_filered.filter(item =>
                        this.model.spatial_cluster[item.name.slice(7, item.name.length)] == this.$store.getters.getData.spatialCluster);
                }
                this.initCharts();
            },
        },
        '$store.getters.getData.currentstation': function (newStation) {
            this.stationInd = newStation;
            this.LocateStation();
        },
        '$store.getters.getData.mae': function (newValue) {
            var sorted = this.maps.slice().sort((a, b) => b.value[2] - a.value[2]);
            var topPercentCount = Math.ceil(sorted.length * ((100 - newValue) / 100));
            this.maps_filered = sorted.slice(0, topPercentCount);
            if (this.$store.getters.getData.temporalCluster != -1) {
                this.maps_filered = this.maps_filered.filter(item =>
                    this.model.temporal_cluster[item.name.slice(7, item.name.length)] == this.$store.getters.getData.temporalCluster);
            }
            if (this.$store.getters.getData.spatialCluster != -1) {
                this.maps_filered = this.maps_filered.filter(item =>
                    this.model.spatial_cluster[item.name.slice(7, item.name.length)] == this.$store.getters.getData.spatialCluster);
            }
            this.initCharts();
        },
        '$store.getters.getData.temporalCluster': function (newValue) {
            var sorted = this.maps.slice().sort((a, b) => b.value[2] - a.value[2]);
            var topPercentCount = Math.ceil(sorted.length * ((100 - this.$store.getters.getData.mae) / 100));
            this.maps_filered = sorted.slice(0, topPercentCount);
            if (newValue != -1) {
                this.maps_filered = this.maps_filered.filter(item =>
                    this.model.temporal_cluster[item.name.slice(7, item.name.length)] == newValue);
            }
            if (this.$store.getters.getData.spatialCluster != -1) {
                this.maps_filered = this.maps_filered.filter(item =>
                    this.model.spatial_cluster[item.name.slice(7, item.name.length)] == this.$store.getters.getData.spatialCluster);
            }
            this.initCharts();
        },
        '$store.getters.getData.spatialCluster': function (newValue) {
            var sorted = this.maps.slice().sort((a, b) => b.value[2] - a.value[2]);
            var topPercentCount = Math.ceil(sorted.length * ((100 - this.$store.getters.getData.mae) / 100));
            this.maps_filered = sorted.slice(0, topPercentCount);
            if (newValue != -1) {
                this.maps_filered = this.maps_filered.filter(item =>
                    this.model.spatial_cluster[item.name.slice(7, item.name.length)] == newValue);
            }
            if (this.$store.getters.getData.temporalCluster != -1) {
                this.maps_filered = this.maps_filered.filter(item =>
                    this.model.temporal_cluster[item.name.slice(7, item.name.length)] == this.$store.getters.getData.temporalCluster);
            }
            this.initCharts();
        },

    },
    methods: {
        initCharts() {
            let _this = this;
            const myChart = this.$echarts.init(this.$refs.bmap);
            myChart.setOption({
                bmap: {
                    key: "uAEIuqTqw9WoIIjwKIGCeaprkb0ZQvyK&s=1",
                    center: this.$data.center, // 当前视角中心位置的坐标,
                    roam: true,
                    zoom: 12,
                },
                tooltip: {
                    trigger: 'item', // 触发类型，设置为'item'表示触发在数据项上
                    formatter: function (params) {
                        if (params.dataType === 'edge') {
                            return 'edge: ' + params.data.source + ' - ' + params.data.target;
                        } else {
                            // 您可以在这里处理其他情况，例如悬浮在节点上时的信息
                            console.log(params.name.slice(7, params.name.length))
                            return `
                                <div>
                                <div>Id: ${params.name}</div>
                                <div>Temporal Cluster: ${_this.model.temporal_cluster[params.name.slice(7, params.name.length)]}</div>
                                <div>Spatial Cluster: ${_this.model.spatial_cluster[params.name.slice(7, params.name.length)]}</div>
                            </div>
                        `;
                        }
                    }
                },
                //标点
                series: [
                    {
                        type: "effectScatter",
                        coordinateSystem: "bmap", //结合百度地图
                        effectType: "ripple",
                        showEffectOn: "render",
                        rippleEffect: {
                            period: 5,
                            scale: 3,
                            brushType: "fill",
                        },
                        label: {
                            show: true,
                            formatter: function (val) {
                                return `${val.name}`;
                            },
                            textStyle: {
                                color: "rgb(128,128,128)",
                                fontSize: 10, // 标签字体大小
                            },
                        },
                        hoverAnimation: true,
                        zlevel: 1,
                        data: this.$data.maps_filered,
                        emphasis: {
                            itemStyle: {
                                color: "#FFFACD",
                                shadowBlur: 20,
                                shadowColor: "rgba(0, 0, 0, 0.5)",
                            },
                        },
                        itemStyle: {
                            color: "#009688", // 设置点的颜色为绿色
                        },
                    },
                ],
            });
            myChart.on("click", function (params) {
                console.log(params)
                if (params.dataType == 'edge') {
                    console.log('Edge clicked:', params);
                } else {
                    let id = "";
                    let length = params.data.name.length;
                    id = params.data.name.slice(7, length);
                    console.log(id);
                    _this.$store.dispatch('updateCurrentStation', id);
                    _this.model.getTemporalBadCaseParam(id);
                    _this.currentstation = params.data.name;
                }
                // document.getElementById('point_rmse').innerText = _this.model.PointRMSE[id] + '/' + _this.model.rmse;
                // document.getElementById('point_mae').innerText = _this.model.PointMAE[id] + '/' + _this.model.mae;
                // document.getElementById('point_mape').innerText = _this.model.PointMAPE[id] + '%' + '/' + _this.model.mape;
            });
        },
        LocateStation() {
            console.log('=======checkout station=======')
            let current_param = this.$data.maps[Number(this.stationInd)];
            let center = new Array()
            center.push(current_param.value[0]);
            center.push(current_param.value[1]);
            console.log("center", center)
            const myChart = this.$echarts.init(this.$refs.bmap);
            if (center) {
                // 更新地图中心至该站点的经纬度
                myChart.setOption({
                    bmap: {
                        key: "uAEIuqTqw9WoIIjwKIGCeaprkb0ZQvyK&s=1",
                        center: center,
                        roam: true,
                        zoom: 15
                    }
                });
            }
            this.currentstation = "station" + this.stationInd
            this.model.getTemporalBadCaseParam(this.stationInd);  // 时间bad case
            document.getElementById('point_rmse').innerText = this.model.PointRMSE[this.stationInd] + '/' + this.model.rmse;
            document.getElementById('point_mae').innerText = this.model.PointMAE[this.stationInd] + '/' + this.model.mae;
            document.getElementById('point_mape').innerText = this.model.PointMAPE[this.stationInd] + '%' + '/' + this.model.mape;
        },
    }
}
</script>

<style scoped>
.boxall {
    border: 1px solid rgba(25, 186, 139, 0.17);
    padding: 0.4rem;
    background-size: 100% auto;
    position: relative;
    margin-bottom: 1.5rem;
    z-index: 10;
    height: 30rem;
}
</style>