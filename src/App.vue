<template>
  <div id="app">
    <div class="canvas" style="opacity: .2"></div>
    <div class="head">
      <div class="header_center">
        <h1>UCTB Web Tools</h1>
      </div>
    </div>
    <div class="mainbox">
      <ul class="clearfix">
        <!-- 左边部分 -->
        <li style="width: 18%">
          <div class="boxall">
            <div class="alltitle">gt</div>
              <HelloWorld @process-upload="inputprocess" type="gt"/>
             <div class="boxfoot"></div>
          </div>
          <div class="boxall">
            <div class="alltitle">pred</div>
              <HelloWorld @process-upload="inputprocess" type="pred"/>
             <div class="boxfoot"></div>
          </div>
          <div class="boxall">
            <div class="alltitle">StationInfo</div>
              <HelloWorld @process-upload="inputprocess" type="stationinfo"/>
             <div class="boxfoot"></div>
          </div>  
          <div class="boxall">
            <div class="alltitle">TimeSeries</div>
              <TimeSeries :model="this.model"/>
             <div class="boxfoot"></div>
          </div> 
          <div class="boxall">
            <div class="alltitle">StationInfo</div>
              <RefreshButton @click-refresh="refresh" diff_type="refresh"/>
              <FuncButton @click-confirm="confirm" diff_type="confirm"/>
             <div class="boxfoot"></div>
          </div> 
          <div class="boxall">
            <div class="alltitle">Info</div>
              <SpatialBadCase @station-change="changeTimeSeries" :CasesError="this.model.mae_for_each_station" :CasesLats="this.model.station_lats" :CasesLngs="this.model.station_lngs"/>
            <div class="boxfoot"></div>
          </div>
        </li>
        <!--中间部分-->
        <li style="width: 52%">
          <div class="bar">
            <div class="barbox2">
              <ul class="clearfix">
                <li class="pulll_left"> </li>
                <li class="pulll_left">RMSE</li>
                <li class="pulll_left">MAE </li>
                <li class="pulll_left">MAPE</li>
              </ul>
            </div>
            <div class="barbox">
              <ul class="clearfix">
                <li class="pulll_left counter" id="uv_name"
                  style="font-family:微软雅黑; font-size: .3rem; color: rgba(255,255,255,0.8)">location</li>
                <li class="pulll_left counter" id="rmse"> </li>
                <li class="pulll_left counter" id="mae"> </li>
                <li class="pulll_left counter" id="mape"> </li>
              </ul>
            </div>
          </div>
          <div class="map" id="map_1" >
            <div class="bmap" id="bmap" ref="bmap" style="width: 500px; height: 500px;"></div>
          </div>
        </li>
        <!--右边部分-->
      <li style="width: 30%">
        <!--Functional zone-->
        <div class="boxall" style="height:1.8rem">
          
        </div>

        <!--prediction et truth-->
        <div class="boxall" style="height:4rem">
          <div class="alltitle" id="line_graph">Groundtruth and Prediction (point 0)</div>
          <div class="chart_change_button" id="bad_case_button">
          </div>
          <div class="allnav" id="container_line"></div>
          <div class="boxfoot"></div>
        </div>

        <!--rmse-->
        <div class="boxall" style="height: 3.5rem">
          <div class="alltitle" id="rmse2">Global Error Analysis</div>
          <div class="chart_change_button" id="metrics_button">
            <el-select v-model="value" size="mini" id="MetricsDistributionButton" placeholder="Metrics Rank List"
              @change="MetricsDistribution">
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </div>
          <div class="allnav2" id="rmseline2"></div>
          <div class="boxfoot"></div>
        </div>
      </li>
        <TemporalBadCase :temp_bad_case_param="this.model.temp_bad_case_param"/>
        <SortMetric :sort_metric_param="this.model.sort_rmse_param"/>
        <MetricDistribution :metric_distribution_param="this.model.rmse_distribution_param"/>
      </ul>
    </div>
  </div>
</template>

<script>
import 'echarts/extension/bmap/bmap'
import HelloWorld from './components/HelloWorld.vue'
import TimeSeries from './components/TimeSeries.vue'
import FuncButton from './components/FunctionalButton.vue'
import RefreshButton from './components/RefreshButton.vue'
import Model from './Model.js'
import SpatialBadCase from './components/SpatialView.vue'
import TemporalBadCase from './components/TemporalView.vue'
import SortMetric from './components/SortMetric'
import MetricDistribution from './components/MetricDistribution'
// import ErrorHotspot from './components/ErrorHotspot'
// import BadcaseTemporalDistribution from './components/BadcaseTemporalDistribution'

export default {
  name: 'App',
  components: {
    HelloWorld,
    TimeSeries,
    FuncButton,
    RefreshButton,
    SpatialBadCase,
    TemporalBadCase,
    SortMetric,
    MetricDistribution,
    // ErrorHotspot,
    // BadcaseTemporalDistribution,
  },
  data(){
    return{
      model:new Model(),
      starttime:'2000-01-01T00:00:00',
      endtime:'2001-01-01T00:00:00',
      StandardofRMSE:2,
      ispoint:0,
      maps:[],
      options:{},
      center:[],
      flag:false
    }
  },
  mounted () {
    this.model.getTemporalBadCaseParam()
    this.options = {
      bmap: {
        key: 'uAEIuqTqw9WoIIjwKIGCeaprkb0ZQvyK&s=1',
        center: [104.114129, 37.550339],
        zoom: 600,
        roam: false
      }
    }
  },
  methods:{
    inputprocess(file,type){
      this.model.setSTRaster(file,type);
      if(type=='stationinfo')
        this.flag=true;
      else
        this.flag=false;
    },
    refresh(){

    },
    confirm(){
      console.log('here',this.flag);
      this.model.testupdate();
      // this.model.getTemporalBadCaseParam(0);
      // this.model.getMetricRankListParam();
      // this.model.getMetricDistributionParam();
      // this.model.getErrorHotspotParam('error', 0);
      // this.model.getBadcaseTemporalDistributionParam();
      if(this.flag)
        this.show();
      else
        this.model.getMetricRankListParam();
      // this.model.getTemporalBadCaseParam(0);
      // this.model.getMetricDistributionParam();
      // this.model.this.model.emitErrorHotspotIndex();
    },
    changeTimeSeries(id){
      console.log(id)
      this.model.getTemporalBadCaseParam(id);
      console.log(this.model.temp_bad_case_param)

    },
    show(){
      this.$data.center.push(this.model.station_lngs[0])
      this.$data.center.push(this.model.station_lats[0])
      console.log("center",this.$data.center)
      for(let i=0;i<this.model.mae_for_each_station.length;i++){
        this.$data.maps.push({
          name:"station"+(i+1),
          value:[],
        })
        this.$data.maps[i].value.push(this.model.station_lngs[i])
        this.$data.maps[i].value.push(this.model.station_lats[i])
        this.$data.maps[i].value.push(this.model.mae_for_each_station[i].toFixed(2))
      }
      console.log("111",this.$data.maps)
      this.initCharts();
    },
    //地图初始化
    initCharts() {
      const myChart = this.$echarts.init(this.$refs.bmap)
      myChart.setOption({
        bmap: {
          key: 'uAEIuqTqw9WoIIjwKIGCeaprkb0ZQvyK&s=1',
          center: this.$data.center, // 当前视角中心位置的坐标,
          roam: true,
          zoom: 10,
        },
        //标点
        series: [    
          {
            type: "effectScatter",
            coordinateSystem: 'bmap',//结合百度地图
            effectType: "ripple",
            showEffectOn: "render",
            rippleEffect: {
              period: 5,
              scale: 5,
              brushType: "fill",
            },
            label: {
              show:true,
              formatter: function(val) {
                            return `


    ${val.name} - ${val.data.value[2]}`
                        },
              textStyle:{
                color: "rgb(128,128,128)",
                fontSize: 15, // 标签字体大小
              },
            },
            hoverAnimation: true,
            itemStyle: {
              normal: {
                color:function (params) {
                  console.log(params)
                  // 我这里是用数值value判断，也可用params.name判断
                  if (params.value[2]>0.1) {
                      return "#d71345"
                    } else {
                      return "#45b97c"
                  }
                },
                shadowBlur: 10,
                shadowColor: "#333",
              },
            },
            zlevel: 1,
            data:this.$data.maps,
          },
      ],
      })
    },
  },
}
</script>

<style>
*{
	-webkit-box-sizing: border-box;
	-moz-box-sizing: border-box;
	box-sizing: border-box}
*,body{padding:0px;	margin:0px;color: #222;font-family: "微软雅黑";}
@font-face{font-family:electronicFont;src:url("./font/DS-DIGIT.TTF")}
body{ background:#000d4a url(./images/bg.jpg) center top; background-size:cover;color:#666;font-size: .1rem;}
li{ list-style-type:none;}
table{}
i{ margin:0px; padding:0px; text-indent:0px;}
img{ border:none; max-width: 100%;}
a{ text-decoration:none; color:#399bff;}
a.active,a:focus{ outline:none!important; text-decoration:none;}
ol,ul,p,h1,h2,h3,h4,h5,h6{ padding:0; margin:0}
a:hover{ color:#06c; text-decoration: none!important}

.clearfix:after, .clearfix:before {
	display: table;
	content: " "
}
.clearfix:after {
	clear: both
}

.pulll_left{float:left;}
.pulll_right{float:right;}
/*谷歌滚动条样式*/
  ::-webkit-scrollbar {width:5px;height:5px;position:absolute}
  ::-webkit-scrollbar-thumb {background-color:#5bc0de}
  ::-webkit-scrollbar-track {background-color:#ddd}
/*全局相关设置*/
.left{
	float: left;
}
/*导航栏的设置*/
.nav{
	width: 35%;
}
.nav>ul{

}
.nav>ul>li{
	display: inline-block;
	width: 120px;
	text-align: center;
	height: 50px;
	position: relative;
	line-height: 50px;
	box-sizing: border-box;
	border-radius: 5px;

}
.nav>ul>li:hover{
	box-shadow: -10px 0px 15px #034c6a inset, 
	0px -10px 15px #034c6a inset, 
	10px 0px 15px #034c6a inset, 
	0px 10px 15px #034c6a inset;

	box-sizing: border-box;
}
.nav>ul>li i{
	width: 16px;
	height: 16px;
	display: inline-block;
	position: relative;
	top:3px;
	margin-right: 5px;
}
.nav>ul>li>a{
	color: #ffffff;
	font-size: 14px;
}

.li_ul{
	position: absolute;
	background-color: #030829;
	width: 100%;
	/*border-top:4px solid #4b8df8;*/
	display: none;
	z-index: 999;

}
.li_ul li{
	line-height: 40px !important;
}
.li_ul li:hover{
	background-color: #4b8df8;
}
.li_ul li a{
	color: #ffffff;
	font-size: 13px;
}

.nav_1{
	background-image: url("./images/nav_1.png");
}
.nav_2{
	background-image: url("./images/nav_1.png");
}
.nav_active{
	border-bottom: 4px solid #4b8df8;
	box-shadow: -10px 0px 15px #034c6a inset, /*å·¦è¾¹é˜´å½±*/
	0px -10px 15px #034c6a inset, /*ä¸Šè¾¹é˜´å½±*/
	10px 0px 15px #034c6a inset, 
	0px 10px 15px #034c6a inset;

	box-sizing: border-box;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.canvas{position: absolute;
		width:100%;
		left: 0;
		top: 0;
		height: 99%;
		z-index: 1;}

/*标题*/
.header_center{
	width: 30%;
	margin: 0px auto;
	color: #FFFFff;
	text-align: center;
	/*height: 80px;*/
	height: 1.05rem;
	background-size: 100% 100%;
	font-family: "微软雅黑"!important;
}
.header_center h1{
	margin-top: 2px !important;
	margin-bottom: 20px !important;
	/*font-size: 32px !important;*/
	font-size: .5rem !important;
}
.head{ height: 5rem;
    background: url(data:image/png;base64,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) no-repeat center center;
    background-size: 100% 100%;
    position: absolute;
    z-index: 100;
    top: 0;
    width: 100%;}
.head h1{ color: #fff;
    text-align: center;
    font-size: 2.5rem !important;}
.head h1 img{ width:1.5rem; display: inline-block; vertical-align: middle; margin-right: .2rem}

/*主体*/
.mainbox{ padding: 0.1rem 0.1rem 0rem 0.1rem;
    position: absolute;
    width: 100%;
    height: 80%;
    top: 5.4rem;}
.mainbox>ul{}
.mainbox>ul>li{ float: left; padding: 0 .1rem}
.mainbox>ul>li{ width: 25%}
.mainbox>ul>li:nth-child(2){ width: 50%;padding: 0}
.boxall{ border: 1px solid rgba(25,186,139,.17); padding:0.1rem;  background: rgba(255,255,255,.04) url("./images/line.png"); background-size: 100% auto; position: relative; margin-bottom: .15rem; z-index: 10;}
.boxall:before,
.boxall:after{ position:absolute; width: .1rem; height: .1rem; content: "";  border-top: 2px solid #02a6b5; top: 0;}
.boxall:before,.boxfoot:before{border-left: 2px solid #02a6b5;left: 0;}
.boxall:after,.boxfoot:after{border-right: 2px solid #02a6b5; right: 0;}
.alltitle{ font-size:.2rem; color:#fff; text-align: center; margin-bottom: 0.1rem;}
.boxfoot{ position:absolute; bottom: 0; width: 100%; left: 0;}
.boxfoot:before,
.boxfoot:after{ position:absolute; width: .1rem; height: .1rem;  content: "";border-bottom: 2px solid #02a6b5; bottom: 0;}

.bar{background:rgba(101,132,226,.1); padding: .15rem;}
.barbox li,.barbox2 li{ width:25%; text-align: center; position: relative; z-index: 100;}
.barbox:before,
.barbox:after{ position:absolute; width: .3rem; height: .1rem; content: ""; }
.barbox:before{border-left: 2px solid #02a6b5;left: 0;border-top: 2px solid #02a6b5; }
.barbox:after{border-right: 2px solid #02a6b5; right: 0; bottom: 0;border-bottom: 2px solid #02a6b5; }

.barbox li:first-child:before{ position:absolute; content: ""; height:50%; width: 1px; background: rgba(255,255,255,.2); right: 0; top: 25%;}

.barbox{  border: 1px solid rgba(25,186,139,.17); position: relative;}
.barbox li{ font-size: .5rem; color: #ffeb7b; padding: .05rem 0;  font-family:electronicFont; font-weight: bold;}
.barbox2 li{ font-size: .19rem; color:rgba(255,255,255,.7); padding-top: .1rem;}

.map{  position:relative; height: 31.3rem; z-index: 9; width: 41.5rem;}
.map4{ width: 200%; height:7rem;  position: relative; left: -50%; top: 4%; margin-top: .2rem; z-index: 5;}
.map1,.map2,.map3{ position:absolute; opacity: .5}
.map1{ width:6.43rem; z-index: 2;top:.45rem; left: .7rem;  animation: myfirst2 15s infinite linear;}
.map2{ width:5.66rem; top:.85rem; left:1.2rem; z-index: 3; opacity: 0.2; animation: myfirst 10s infinite linear;}
.map3{ width:5.18rem; top:1.07rem; left: 1.4rem; z-index: 1;}
</style>
