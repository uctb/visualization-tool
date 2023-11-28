<template>
  <div id="app" >
    <!-- <div class="canvas" style="opacity: 0.2"></div> -->
    <div class="head">
      <div class="header_center">
        <h1>ErrorDiagnosisTool</h1>
      </div>
    </div>
    <div class="mainbox">
      <ul class="clearfix">
        <!-- 左边部分 -->
        <li style="width: 24%">
          <div class="head1" style="font-weight: bold; font-size: 1.5rem; color: rgba(255,255,255,.7)">Data Loader</div>
          <div class="option">
            <el-tabs type="border-card" style="background-color: #000d4a">
              <el-tab-pane>
                <span slot="label"><i class="el-icon-date"></i>Predefined</span>
                <div class="option" style="margin-top: 1rem">
                  <div class="alltitle">Select Dataset</div>
                  <el-select v-model="value1" placeholder="violation_XM_ARIMA" size="mini" @change="TransferData">
                    <el-option v-for="item in dataset" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                </div>
                <div class="option" style="margin-top: 1rem">
                  <div class="alltitle">Select Station</div>
                  <div style="display: flex;justify-content: space-around;">
                    <el-input v-model="stationInd" placeholder="请输入内容" style="width: 40%;margin-left: 5%;"></el-input>
                    <el-button type="primary" icon="el-icon-setting" @click="LocateStation">setting</el-button>
                  </div>

                </div>
              </el-tab-pane>
              <el-tab-pane>
                <span slot="label"><i class="el-icon-edit el-icon--right">Upload</i></span>
                <div class="option" style="margin-bottom: 2rem;">
                  <div class="alltitle">Groundtruth</div>
                  <el-popover placement="top-start" width="480" trigger="hover" close-delay=50>
                    <div>
                      <span>Example of ground truth: <br>
                        time series of 3 stations with 4 time slots:</span>
                    </div>
                    <div>
                      <p>
                        0.1<span style="color: #823935; font-weight: bold">\t</span>0.2<span
                          style="color: #823935; font-weight: bold">\t</span>0.3<span
                          style="color: #823935; font-weight: bold">\t</span>0.4<br />0.2<span
                          style="color: #823935; font-weight: bold">\t</span>0.1<span
                          style="color: #823935; font-weight: bold">\t</span>5.0<span
                          style="color: #823935; font-weight: bold">\t</span>0.2<br />0.1<span
                          style="color: #823935; font-weight: bold">\t</span>0.1<span
                          style="color: #823935; font-weight: bold">\t</span>7.0<span
                          style="color: #823935; font-weight: bold">\t</span>0.8
                      </p>
                    </div>
                    <UploadButton @process-upload="inputprocess" type="gt" ref="gt" slot="reference" />
                  </el-popover>
                </div>
                <div class="boxfoot"></div>

                <div class="option" style="margin-bottom: 2rem;">
                  <div class="alltitle">Prediction</div>
                  <el-popover placement="top-start" width="460" trigger="hover" close-delay=50>
                    <div>
                      <span>Example of prediction: <br> time series of 3 stations with 4 time slots:</span>
                    </div>
                    <div>
                      <p>
                        0.1<span style="color: #823935; font-weight: bold">\t</span>0.2<span
                          style="color: #823935; font-weight: bold">\t</span>0.3<span
                          style="color: #823935; font-weight: bold">\t</span>0.4<br />0.2<span
                          style="color: #823935; font-weight: bold">\t</span>0.1<span
                          style="color: #823935; font-weight: bold">\t</span>5.0<span
                          style="color: #823935; font-weight: bold">\t</span>0.2<br />0.1<span
                          style="color: #823935; font-weight: bold">\t</span>0.1<span
                          style="color: #823935; font-weight: bold">\t</span>7.0<span
                          style="color: #823935; font-weight: bold">\t</span>0.8
                      </p>
                    </div>
                    <UploadButton @process-upload="inputprocess" type="pred" ref="pred" slot="reference" />
                  </el-popover>
                </div>
                <div class="option" style="margin-bottom: 2rem;">
                  <div class="alltitle">Geographical Coordinates<span class="optional" style="color:#6d9eeb">
                      (optional)</span></div>
                  <el-popover placement="top-start" width="535" trigger="hover" close-delay=50>
                    <div><span>Example of geographical coordinates of 3 stations<br>(latitude
                        first, longitude second):</span></div>
                    <div>
                      <span>30.1<span style="color: #823935; font-weight: bold">\t</span>120.3<br />30.15<span
                          style="color: #823935; font-weight: bold">\t</span>120.28<br />30.2<span
                          style="color: #823935; font-weight: bold">\t</span>120.2</span>
                    </div>
                    <UploadButton @process-upload="inputprocess" type="stationinfo" ref="stationinfo" slot="reference" />
                  </el-popover>
                </div>
                <div class="option" style="margin-bottom: 2rem;">
                  <div class="alltitle">TimeRange & TimeFitness<span class="optional" style="color:#6d9eeb">
                      (optional)</span></div>
                  <TimeSeries :TimeInfoProcessor="this.TimeInfoProcessor" ref="time" />
                </div>
              </el-tab-pane>
            </el-tabs>
            <RefreshButton style="margin-top: 10%;" @click-refresh="refresh" diff_type="refresh" />
            <ConfirmButton style="margin-bottom: 10%;" @click-confirm="confirm" diff_type="confirm" />
            <div class="boxfoot"></div>
          </div>
        </li>

        <!--中间部分-->
        <li style="width: 45%">
          <div class="head1" style="font-weight: bold;font-size: 1.5rem; color: rgba(255,255,255,.7)">Error Visualization
          </div>
          <div class="bar">
            <div class="barbox2">
              <ul class="clearfix">
                <li class="pulll_left"> </li>
                <li class="pulll_left">RMSE</li>
                <li class="pulll_left">MAE </li>
                <li class="pulll_left">MAPE</li>
              </ul>
            </div>
            <!--              <div class="barbox" style="height: 2.5rem">-->
            <!--                <ul class="clearfix">-->
            <!--                  <li class="pulll_left counter" id="uv_name" style="font-family:微软雅黑; font-size: 1rem; color: rgba(255,255,255,0.8)">Model</li>-->
            <!--                  <li class="pulll_left counter" id="rmse"> </li>-->
            <!--                  <li class="pulll_left counter" id="mae"> </li>-->
            <!--                  <li class="pulll_left counter" id="mape"> </li>-->
            <!--                </ul>-->
            <!--              </div>-->
            <div class="barbox" style="height: 2.5rem">
              <ul class="clearfix">
                <li class="pulll_left counter" id="point_name"
                  style="font-family:微软雅黑; font-size: 1.2rem; color: rgba(255,255,255,0.8)">{{ currentstation }}</li>
                <li class="pulll_left counter" id="point_rmse"> </li>
                <li class="pulll_left counter" id="point_mae"> </li>
                <li class="pulll_left counter" id="point_mape"> </li>
              </ul>
            </div>
          </div>
          <div v-if="this.isShow && this.flag" class="boxall" style="height: 20rem; margin-bottom: .6rem" id="bmap"
            ref="bmap"></div>
          <SortMetric class="boxall" style="height: 20rem; margin-bottom: .6rem" v-if="this.isShow && !this.flag"
            @bar-click="changeTimeSeries" :sort_metric_param="this.model.sort_rmse_param" />
          <div class="boxall" style="height:16rem;">
            <div class="alltitle" style="font-weight: bold;font-size: 1rem">Groundtruth and Prediction
              ({{ currentstation }})</div>
            <TemporalBadCase v-if="this.isShow" :temp_bad_case_param="this.model.temp_bad_case_param" />
            <div class="boxfoot"></div>
          </div>
        </li>

        <!--右边部分-->
        <li style="width: 31%">
          <div class="head1" style="font-weight: bold;font-size: 1.5rem; color: rgba(255,255,255,.7)">Error Diagnosis
          </div>
          <!--时空数据/评价指标的分布-->
          <div class="boxall" style="height:20rem; margin-bottom: .6rem">
            <div class="alltitle"></div>
            <el-cascader v-model="value" placeholder="Overall Analysis" size="mini" :disabled="false"
              :options="statistics_option" :props="{ expandTrigger: 'hover' }" @change="Statistics"></el-cascader>

            <QualitativeAnalysis v-if="this.isShow && this.isSwitch && this.isAnalysis===1" :model="this.model"></QualitativeAnalysis>
            <FlowDistribution v-if="this.isShow && !this.isSwitch && this.isAnalysis===1" :model="this.model"/>
            <BasicBadcaseCalenderDistribution v-if="this.isShow && this.isSwitch && this.isOverallCalendar===1"
                                              :basic_badcase_calender_distribution_param="this.basic_badcase_calender_param" />
            <!--            <BasicStatistics v-if="this.isShow && this.isSwitch && this.isflow" :statistics_param="this.statistics_param" />-->
            <!--            <BadCaseFlowScatter v-if="this.isShow && this.isSwitch && !this.isflow" :flow_data = "this.flow_data" :name="this.value[1]"/>-->
            <div class="boxfoot"></div>
          </div>

          <!--站点级别bad case时间分布规律-->
          <div class="boxall" style="height: 20rem">
            <div class="alltitle"></div>
            <el-cascader v-model="value_bc" placeholder="Detailed Analysis" size="mini" :disabled="false"
              :options="statistics_bc_option" :props="{ expandTrigger: 'hover' }"
              @change="BadcaseDistribution"></el-cascader>
            <BadcaseTemporalDistributionRules v-if="this.isShow && this.isSwitch2 && this.isRes && this.isPeriod===1"
              :badcase_temp_distribution_param="this.badcase_distribution_param" />
            <BadCaseCalenderDistribution v-if="this.isShow && this.isSwitch2 && this.isRes && this.isCalendar===1"
              :badcase_calender_distribution_param="this.badcase_calender_param"/>
            <ResidualAnalysis :temp_bad_case_param="this.model.temp_bad_case_param" v-if="this.isShow && this.isSwitch2 && !this.isRes"/>
            <div class="boxfoot"></div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import "echarts/extension/bmap/bmap";
import wgs842gcj022bd09 from "./utils.js";
import Model from "./Model.js";
import TimeInfoProcessor from "./TimeInfoProcessor";
import xm_arima from "./data/violation_XM_ARIMA.json";
import xm_hm from "./data/violation_XM_HM.json";
import UploadButton from "./components/UploadButton.vue";
import TimeSeries from "./components/TimeSeries.vue";
import ConfirmButton from "./components/ConfirmButton.vue";
import RefreshButton from "./components/RefreshButton.vue";
import TemporalBadCase from "./components/TemporalView.vue";   // 时间序列图
import SortMetric from "./components/SortMetric";
import BadcaseTemporalDistributionRules from "./components/BadcaseTemporalDistribution";
// import BasicStatistics from "./components/Statistics";
// import BadCaseFlowScatter from "./components/BadCaseFlowScatter.vue";
// import BadcaseDistributionRules from './components/BadCaseDistributionRules'
import BadCaseCalenderDistribution from "@/components/BadCaseCalenderDistribution";
import BasicBadcaseCalenderDistribution from "@/components/BasicBadcaseCalenderDistribution";
import QualitativeAnalysis from "./components/QualitativeAnalysis.vue";
import FlowDistribution from "./components/FlowDistribution.vue";
import ResidualAnalysis from "./components/ResidualAnalysis.vue";


export default {
  name: "App",
  components: {
    UploadButton,
    TimeSeries,
    ConfirmButton,
    RefreshButton,
    TemporalBadCase,
    SortMetric,
    // BadcaseDistributionRules,
    // BasicStatistics,
    // BadCaseFlowScatter,
    BadcaseTemporalDistributionRules,
    BadCaseCalenderDistribution,
    BasicBadcaseCalenderDistribution,
    QualitativeAnalysis,
    FlowDistribution,
    ResidualAnalysis
  },

  data() {
    return {
      model: new Model(),
      TimeInfoProcessor: new TimeInfoProcessor(),
      ispoint: 0,
      flag: false,
      timeflag: false,
      isShow: true,

      // 右上角选择器
      isSwitch: true,
      isSwitch2: true,
      isRes: true,
      isPeriod: 1,
      isCalendar: 1,
      // isflow: true,
      isAnalysis: 1,
      isOverallCalendar: 1,

      maps: [],
      options: {},
      center: [],
      currentstation: "",
      badcase_distribution_param: null,
      badcase_calender_param: null,
      statistics_param: null,
      basic_badcase_calender_param: null,
      flow_data: [],
      value: [],
      value_bc: [],
      value1: [],
      stationInd: '0',
      statistics_option: [
        {
          value: "Qualitative Analysis",
          label: "Qualitative Analysis",
          disabled: false,
          children: [
            {
              value: "Overall Trend",
              label: "Overall Trend",
            },
            {
              value: "Time Distribution",
              label: "Time Distribution",
            }
          ],
        },
        {
          value: "Quantitative Analysis",
          label: "Quantitative Analysis",
          disabled: false,
          children: [
            {
              value: "Station Type Distribution",
              label: "Station Type Distribution",
            },
          ],
        }
      ],
      statistics_bc_option: [
        {
          value: "Time Characteristics",
          label: "Time Characteristics",
          disabled: false,
          children: [
            // {
            //   value: "Weekday or Weekends?",
            //   label: "Weekday or Weekends?",
            // },
            // {
            //   value: "Morning/Evening Peak?",
            //   label: "Morning/Evening Peak?",
            // },
            {
              value: "On what day of the week?",
              label: "On what day of the week?",
            },
            {
              value: "On which hour of the 24?",
              label: "On which hour of the 24?",
            },
            {
              value: 'Calendar Heatmap',
              label: 'Calendar Heatmap',
            }
          ],
        },{
          value: "Residual Characteristics",
          label: "Residual Characteristics",
          disabled: false,
          children: [
            {
              value: 'Residual Analysis',
              label: 'Residual Analysis',
            }
          ],
        }
      ],
      dataset: [
        {
          value: "violation_XM_HM",
          label: "violation_XM_HM",
        },
        {
          value: "violation_XM_ARIMA",
          label: "violation_XM_ARIMA",
        },
      ],
    };
  },
  computed: {
    dynamicStyle() {
      return {
        height: "46rem",
        width: "40.1rem",
      };
    },
  },
  mounted() {
    this.options = {
      bmap: {
        key: "uAEIuqTqw9WoIIjwKIGCeaprkb0ZQvyK&s=1",
        center: [104.114129, 37.550339],
        zoom: 600,
        roam: false,
      },
    };
    this.TimeInfoProcessor.updateParam(
      xm_hm["start_time"],
      xm_hm["end_time"],
      xm_hm["time_fitness"], 'min'
    );
    this.flag = true;
    this.isShow = true;
    this.isSwitch = true;
    this.isSwitch2 = true;
    this.isRes = true;
    this.isAnalysis = 1;
    this.isOverallCalendar = 1;
    this.isPeriod = 1;
    this.isCalendar = 1;
    // this.isflow = true;
    this.TimeInfoProcessor.emitTimeSeries()
    setTimeout(() => {
      this.model.update(
        xm_hm["pred"],
        xm_hm["gt"],
        xm_hm["stationinfo"]
      );
    }, 400)
    setTimeout(() => {
      if (this.flag)
        //// 最小系统判断
        this.show();
      else this.model.getMetricRankListParam();
    }, 1000);
    setTimeout(() => {
      this.model.getTemporalBadCaseParam(0); // 时间bad case定位

      /* 时空数据分布 */
      this.model.getStationAttributesDistributionParam(); // 站点属性分布
      this.model.getMetricDistributionParam(); // 评价指标分布
      /* bad case分布 */
      this.model.getBadcaseSpatialDistributionRulseParam(); //空间bad case分布

      // 分布图表初始化
      this.statistics_param = this.model.badcase_spatial_distribution_rules_param;
      this.badcase_distribution_param = this.model.badcase_weekday_statistic_param;

      this.$data.currentstation = "station0";
    }, 600)
  },
  watch: {
    "TimeInfoProcessor.flag": function (newValue) {
      if (newValue) {
        console.log("=====set time series======")
        const Success = this.model.setTimeseries(
          this.TimeInfoProcessor.TimeSeries,
          this.TimeInfoProcessor.WeekSeries,
          this.TimeInfoProcessor.PeakSeries,
          this.TimeInfoProcessor.HourSeries,
          this.TimeInfoProcessor.WeekdayNum,
          this.TimeInfoProcessor.WeeksumNum,
          this.TimeInfoProcessor.PeakNum,
        );
        if (!Success) {
          alert("Time Range or Time fitness is false! Please select again.");
        } else {
          this.timeflag = true;
          this.updateOptionDisabled(this.timeflag);
        }
      }
    },
  },
  methods: {
    inputprocess(file, type) {
      this.model.setSTRaster(file, type);
      if (type == "stationinfo") this.flag = true;
      this.isShow = true;
      this.isSwitch = true;
      this.isSwitch2 = true;
      this.isRes = true;
      this.isAnalysis = 1;
      this.isOverallCalendar = 1;
      this.isPeriod = 1;
      this.isCalendar = 1;
      // this.isflow = true;
    },
    // predefined
    TransferData(e) {
      this.maps = [];
      this.options = {};
      this.center = [];
      this.flag = false;
      this.isShow = false;
      this.model.refresh();
      this.value = "On what day of the week?";
      this.badcase_distribution_param = null;
      this.basic_badcase_calender_param = null;
      this.badcase_calender_param = null;
      this.TimeInfoProcessor.refresh();
      if (e == "violation_XM_ARIMA") {

        this.TimeInfoProcessor.updateParam(
          xm_hm["start_time"],
          xm_hm["end_time"],
          xm_hm["time_fitness"], 'min'
        );

        this.flag = true;
        this.isShow = true;
        this.isSwitch = true;
        this.isSwitch2 = true;
        this.isRes = true;
        this.isAnalysis = 1;
        this.isOverallCalendar = 1;
        this.isPeriod = 1;
        this.isCalendar = 1;
        // this.isflow = true;
        this.TimeInfoProcessor.emitTimeSeries()
        setTimeout(() => {
          this.model.update(
            xm_hm["pred"],
            xm_hm["gt"],
            xm_hm["stationinfo"]
          );
        }, 400)

        setTimeout(() => {
          if (this.flag)
            //// 最小系统判断
            this.show();
          else this.model.getMetricRankListParam();
        }, 1000);
        console.log('show!');
        setTimeout(() => {
          this.model.getTemporalBadCaseParam(0); // 时间bad case定位

          /* 时空数据分布 */
          this.model.getStationAttributesDistributionParam(); // 站点属性分布
          this.model.getMetricDistributionParam(); // 评价指标分布
          /* bad case分布 */
          this.model.getBadcaseSpatialDistributionRulseParam(); //空间bad case分布

          // 分布图表初始化
          this.statistics_param = this.model.badcase_spatial_distribution_rules_param;
          this.badcase_distribution_param = this.model.badcase_weekday_statistic_param;

          this.$data.f = "station0";
        }, 600)

      } else if (e === "violation_XM_HM") {
        this.TimeInfoProcessor.updateParam(
          xm_arima["start_time"],
          xm_arima["end_time"],
          xm_arima["time_fitness"], 'min'
        );

        this.flag = true;
        this.isShow = true;
        this.isSwitch = true;
        this.isSwitch2 = true;
        this.isRes = true;
        this.isAnalysis = 1;
        this.isOverallCalendar = 1;
        this.isPeriod = 1;
        this.isCalendar = 1;
        // this.isflow = true;
        this.TimeInfoProcessor.emitTimeSeries()
        setTimeout(() => {
          this.model.update(
            xm_arima["pred"],
            xm_arima["gt"],
            xm_arima["stationinfo"]
          );
        }, 400)

        setTimeout(() => {
          if (this.flag)
            //// 最小系统判断
            this.show();
          else this.model.getMetricRankListParam();
        }, 1000);
        console.log('show!');
        setTimeout(() => {
          this.model.getTemporalBadCaseParam(0); // 时间bad case定位

          /* 时空数据分布 */
          this.model.getStationAttributesDistributionParam(); // 站点属性分布
          this.model.getMetricDistributionParam(); // 评价指标分布
          /* bad case分布 */
          this.model.getBadcaseSpatialDistributionRulseParam(); //空间bad case分布

          // 分布图表初始化
          this.statistics_param = this.model.badcase_spatial_distribution_rules_param;
          this.badcase_distribution_param = this.model.badcase_weekday_statistic_param;

          this.$data.currentstation = "station0";
        }, 600)

      }
    },

    refresh() {
      this.maps = [];
      this.options = {};
      this.center = [];
      this.flag = false;
      this.isShow = false;
      this.model.refresh();
      this.value = "On what day of the week?";
      this.badcase_distribution_param = null;
      this.TimeInfoProcessor.refresh();
      this.$refs.gt.clear();
      this.$refs.pred.clear();
      this.$refs.stationinfo.clear();
      this.$refs.time.clear();
      document.getElementById('rmse').innerText = '';
      document.getElementById('mape').innerText = '';
      document.getElementById('mae').innerText = '';
    },

    confirm() {
      // 设置时间
      console.log("=====set time series======")
      const Success = this.model.setTimeseries(
        this.TimeInfoProcessor.TimeSeries,
        this.TimeInfoProcessor.WeekSeries,
        this.TimeInfoProcessor.PeakSeries,
        this.TimeInfoProcessor.HourSeries,
        this.TimeInfoProcessor.WeekdayNum,
        this.TimeInfoProcessor.WeeksumNum,
        this.TimeInfoProcessor.PeakNum
      );
      if (!Success) {
        alert("Time Range or Time fitness is false! Please select again.");
      } else {
        this.timeflag = true;
        this.updateOptionDisabled(this.timeflag);
      }

      this.model.testupdate();

      /*
        绘图
      */

      /* bad case定位 */

      //// 最小系统判断
      if (this.flag)
        this.show();
      else this.model.getMetricRankListParam();

      this.model.getTemporalBadCaseParam(0); // 时间bad case定位

      /* 时空数据分布 */
      this.model.getStationAttributesDistributionParam(); // 站点属性分布
      this.model.getMetricDistributionParam(); // 评价指标分布
      /* bad case分布 */
      this.model.getBadcaseSpatialDistributionRulseParam(); //空间bad case分布

      // 分布图表初始化
      this.statistics_param = this.model.badcase_spatial_distribution_rules_param;
      this.badcase_distribution_param = this.model.badcase_weekday_statistic_param;

      this.$data.currentstation = "station0";
    },

    changeTimeSeries(id) {
      console.log(id);
      this.model.getTemporalBadCaseParam(id);
      console.log("aaaa", this.model.PointRMSE);
      document.getElementById('point_rmse').innerText = this.model.PointRMSE[id];
      document.getElementById('point_mae').innerText = this.model.PointMAE[id];
      document.getElementById('point_mape').innerText = this.model.PointMAPE[id] + '%';
    },

    show() {
      console.log("======show=======")
      let maxNum = Math.max(...this.model.mre_for_each_station);
      let minNum = Math.min(...this.model.mre_for_each_station);
      // console.log("max",maxNum)
      this.$data.center = new Array()
      this.$data.center.push(this.model.station_lngs[0]);
      this.$data.center.push(this.model.station_lats[0]);
      console.log("center", this.$data.center)
      for (let i = 0; i < this.model.station_num; i++) {
        this.$data.maps.push({
          name: "station" + i,
          value: [],
        });

        var bdlnglat = wgs842gcj022bd09(this.model.station_lngs[i], this.model.station_lats[i])
        
        this.$data.maps[i].value.push(bdlnglat[0]);
        this.$data.maps[i].value.push(bdlnglat[1]);
        this.$data.maps[i].value.push(this.model.mre_for_each_station[i])
        if (!this.model.invalid_station_index.includes(i)) {
          this.$data.maps[i].value.push(
            (this.model.mre_for_each_station[i]) / (maxNum - minNum)
            // this.model.mre_for_filter_station[i]
          );
          if(this.model.FullTimeBadStation.includes(i)){
            this.$data.maps[i] = { ...this.$data.maps[i], itemStyle: { color: "#E91E63" } };
          }else if(this.model.invalid_prediciton_stations.includes(i)){
            this.$data.maps[i] = { ...this.$data.maps[i], itemStyle: { color: 'grey' } };
          }
        } else {
          this.$data.maps[i].value.push(Infinity);
          this.$data.maps[i] = { ...this.$data.maps[i], itemStyle: { color: 'black' } };
        }
      }
      console.log('index',this.model.invalid_station_index);
      this.initCharts();
    },

    // 级联选择器禁用选项
    updateOptionDisabled(timeflag) {
      const targetBcOption = this.statistics_bc_option.find(
        (option) => option.value === "Time Characteristics"
      );
      if (timeflag) {
        targetBcOption.disabled = false;
      }
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
      if (_this.TimeInfoProcessor.flag) {
        this.model.getBadcaseDistributionRulesParam(this.stationInd);  //时间bad case分布
        this.model.getBadcaseCalenderDistributionRulesParam(this.stationInd);
        this.model.getBasicBadcaseCalenderDistributionParam();
      }
      document.getElementById('point_rmse').innerText = _this.model.PointRMSE[id];
      document.getElementById('point_mae').innerText = _this.model.PointMAE[id];
      document.getElementById('point_mape').innerText = _this.model.PointMAPE[id] + '%';
    },

    //地图初始化
    initCharts() {
      console.log('go into initCharts')
      console.log(this.$data.maps)
      let _this = this;
      const myChart = this.$echarts.init(this.$refs.bmap);
      myChart.setOption({
        bmap: {
          key: "uAEIuqTqw9WoIIjwKIGCeaprkb0ZQvyK&s=1",
          center: this.$data.center, // 当前视角中心位置的坐标,
          roam: true,
          zoom: 12,
        },
        visualMap: [
          {
            type: "continuous",
            orient: "vertical",
            right: 0,
            min: 0,
            max: 1,
            text: ["HIGH", "LOW"],
            inRange: {
              color: ["#00ff00", "#FF0000"],
            },
          },
        ],
        tooltip: {
          trigger: 'item', // 触发类型，设置为'item'表示触发在数据项上
          formatter: function (params) {
            if (params.dataType === 'edge') {
              return 'edge: ' + params.data.source + ' - ' + params.data.target;
            } else {
              // 您可以在这里处理其他情况，例如悬浮在节点上时的信息
              return 'station: ' + params.name;
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
            data: this.$data.maps,
            emphasis: {
              itemStyle: {
                color: "#FFFACD",
                shadowBlur: 20,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
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
          _this.model.getTemporalBadCaseParam(id);  // 时间bad case
          if (_this.TimeInfoProcessor.flag) {
            _this.model.getBadcaseDistributionRulesParam(id);  //时间bad case分布
            _this.model.getBadcaseCalenderDistributionRulesParam(id);
            _this.model.getBasicBadcaseCalenderDistributionParam();
          }
          _this.currentstation = params.data.name;
          document.getElementById('point_rmse').innerText = _this.model.PointRMSE[id];
          document.getElementById('point_mae').innerText = _this.model.PointMAE[id];
          document.getElementById('point_mape').innerText = _this.model.PointMAPE[id] + '%';
        }

      });
    },

    BadcaseDistribution(value) {
      switch (value[1]) {
        // case "Weekday or Weekends?":
        //   this.badcase_distribution_param =
        //     this.model.badcase_weekday_statistic_param;
        //   this.badcase_show = 'bar';
        //   break;
        // case "Morning/Evening Peak?":
        //   this.badcase_distribution_param =
        //     this.model.badcase_peak_statistic_param;
        //   this.badcase_show = 'bar';
        //   break;
        case "On what day of the week?":
          this.isSwitch2 = true;
          this.isRes = true;
          this.badcase_distribution_param =
            this.model.badcase_week_distribution_rules_param;
          this.isPeriod = 1;
          break;
        case "On which hour of the 24?":
          this.badcase_distribution_param =
            this.model.badcase_hour_distribution_rules_param;
          this.isRes = true;
          this.isPeriod = 1;
          this.isCalendar = 0;
          break;
        case "Calendar Heatmap":
          this.badcase_calender_param = this.model.badcase_hour_calender_param;
          this.isCalendar = 1;
          this.isPeriod = 0;
          this.isRes = true;
          break;
        case "Residual Analysis":
          this.isRes = false;
          break;
      }
    },

    Statistics() {
      switch (this.value[1]) {
        // 定性分析
        case "Overall Trend":
          this.isSwitch = true;
          this.isAnalysis = 1;
          this.isOverallCalendar = 0;
          break;
        case "Time Distribution":
          this.isSwitch = true;
          this.isOverallCalendar = 1;
          this.isAnalysis = 0;
          this.basic_badcase_calender_param = this.model.badcase_month_calender_param;
          break;
        case "Station Type Distribution":
          this.isSwitch = false;
          this.isAnalysis = 1;
          break;
      }
      console.log(this.isSwitch)
    },

  },
};
</script>

<style>
* {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}

*,
body {
  padding: 0px;
  margin: 0px;
  color: #222;
  font-family: "微软雅黑";
}

@font-face {
  font-family: electronicFont;
  src: url("./font/DS-DIGIT.TTF");
}

body {
  background: #000d4a center top;
  background-size: cover;
  color: #666;
  font-size: 0.1rem;
  height: 50rem;
  overflow: auto;
  background-repeat: no-repeat;

}

li {
  list-style-type: none;
}

table {}

i {
  margin: 0px;
  padding: 0px;
  text-indent: 0px;
}

img {
  border: none;
  max-width: 100%;
}

a {
  text-decoration: none;
  color: #399bff;
}

a.active,
a:focus {
  outline: none !important;
  text-decoration: none;
}

ol,
ul,
p,
h1,
h2,
h3,
h4,
h5,
h6 {
  padding: 0;
  margin: 0;
}

a:hover {
  color: #06c;
  text-decoration: none !important;
}

.clearfix:after,
.clearfix:before {
  display: table;
  content: " ";
}

.clearfix:after {
  clear: both;
}

/*谷歌滚动条样式*/
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
  position: absolute
}

::-webkit-scrollbar-thumb {
  background-color: #5bc0de
}

::-webkit-scrollbar-track {
  background-color: #ddd
}

::-webkit-scrollbar {
  width: 5px;
  height: 5px;
  position: absolute;
}

::-webkit-scrollbar-thumb {
  background-color: #5bc0de;
}

::-webkit-scrollbar-track {
  background-color: #ddd;
}

.li_ul li {
  line-height: 40px !important;
}

.li_ul li:hover {
  background-color: #4b8df8;
}

.li_ul li a {
  color: #ffffff;
  font-size: 13px;
}

.pulll_left {
  float: left;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.canvas {
  position: absolute;
  width: 100%;
  left: 0;
  top: 0;
  height: 99%;
  z-index: 1;
}

/*标题*/
.header_center {
  width: 30%;
  margin: 0px auto;
  color: #FFFFff;
  text-align: left;
  /*height: 80px;*/
  height: 3.05rem;
  background-size: 100% 100%;
  font-family: "微软雅黑" !important;
}

.header_center h1 {
  margin-top: 2px !important;
  margin-bottom: 20px !important;
  font-size: .4rem !important;
  text-align: left;
}

.head {
  height: 4rem;
  background: url(data:image/png;base64,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) no-repeat center center;
  background-size: 100% 100%;
  position: absolute;
  z-index: 100;
  top: 0;
  width: 100%;
}

.head h1 {
  color: #fff;
  text-align: center;
  font-size: 2rem !important;
}

.head h1 img {
  width: 1.5rem;
  display: inline-block;
  vertical-align: middle;
  margin-right: .2rem
}

.head1 {
  background: url(data:image/png;base64,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) no-repeat center center;
  background-size: 100% 100%;
  text-align: center;
  margin-bottom: 0.4rem;
  height: 2.5rem;
}



/*主体*/
.mainbox {
  padding: 0.1rem 0.1rem 0rem 0.1rem;
  position: absolute;
  width: 100%;
  height: 80%;
  top: 5.4rem;
}

.mainbox>ul {}

.mainbox>ul>li {
  float: left;
  padding: 0 0.1rem;
}

.mainbox>ul>li {
  width: 25%;
}

.mainbox>ul>li:nth-child(2) {
  width: 50%;
  padding: 0;
}

.boxall {
  border: 1px solid rgba(25, 186, 139, 0.17);
  padding: 0.4rem;
  background: rgba(255, 255, 255, 0.04) url("./images/line.png");
  background-size: 100% auto;
  position: relative;
  margin-bottom: 1.5rem;
  z-index: 10;
}

.boxall:before,
.boxall:after {
  position: absolute;
  width: 0.4rem;
  height: 0.4rem;
  content: "";
  border-top: 2px solid #02a6b5;
  top: 0;
}

.boxall:before,
.boxfoot:before {
  border-left: 2px solid #02a6b5;
  left: 0;
}

.boxall:after,
.boxfoot:after {
  border-right: 2px solid #02a6b5;
  right: 0;
}

.alltitle {
  font-size: 1rem;
  color: #fff;
  text-align: center;
  margin-bottom: 0.4rem;
}

.boxfoot {
  position: absolute;
  bottom: 0;
  width: 100%;
  left: 0;
}

.boxfoot:before,
.boxfoot:after {
  position: absolute;
  width: 0.4rem;
  height: 0.4rem;
  content: "";
  border-bottom: 2px solid #02a6b5;
  bottom: 0;
}

.bar {
  background: rgba(101, 132, 226, 0.1);
  padding: 0.15rem;
}

.barbox li,
.barbox2 li {
  width: 25%;
  text-align: center;
  position: relative;
  z-index: 100;
}

.barbox:before,
.barbox:after {
  position: absolute;
  width: 0.3rem;
  height: 0.1rem;
  content: "";
}

.barbox:before {
  border-left: 2px solid #02a6b5;
  left: 0;
  border-top: 2px solid #02a6b5;
}

.barbox:after {
  border-right: 2px solid #02a6b5;
  right: 0;
  bottom: 0;
  border-bottom: 2px solid #02a6b5;
}

.barbox li:first-child:before {
  position: absolute;
  content: "";
  height: 50%;
  width: 1px;
  background: rgba(255, 255, 255, 0.2);
  right: 0;
  top: 25%;
}

.barbox {
  border: 1px solid rgba(25, 186, 139, .17);
  position: relative;
}

.barbox li {
  font-size: 2rem;
  color: #ffeb7b;
  padding: .05rem 0;
  font-family: electronicFont;
  font-weight: bold;
}

.barbox2 li {
  font-size: .8rem;
  color: rgba(255, 255, 255, .7);
  padding-top: .1rem;
}

.long {
  position: relative;
  z-index: 9;
  /*width: 39rem;*/
  height: 18rem;
  /*height: 14.5rem;*/
}

.short {
  position: relative;
  z-index: 9;
  width: 39rem;
  /*height: 31.5rem;*/
  height: 14.5rem;
}

.blong {
  position: relative;
  z-index: 9;
}

.bshort {
  height: 14.5rem;
  width: 39rem;
}

.el-tabs--border-card>.el-tabs__content {
  padding: 0px;
}

.ec-extension-bmap {
  width: 98% !important;
}

.option {
  border: 1px solid rgba(25, 186, 139, .17);
  padding: 0.4rem;
  background: rgba(255, 255, 255, .04) url("./images/line.png");
  background-size: 100% auto;
  position: relative;
  margin-bottom: .8rem;
  z-index: 10;
}
</style>