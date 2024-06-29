<template>
  <div id="centerLeft1">
    <div class="bg-color-black">
      <div class="d-flex pt-2 pl-2">
        <span>
          <icon name="chart-bar" class="text-icon"></icon>
        </span>
        <div class="d-flex">
          <dv-decoration-3 class="dv-dec-3" />
        </div>
      </div>
      <div>
        <h1>Data Control</h1>
      </div>
      <!-- 中间组件 -->
      <ul class='mode'>
        <!-- DataControl -->
        <li>
          <span class="subheading">Data Loader</span>
          <div class="upload">
            <el-button type="primary" @click="dialogVisible = true"><span
                style='font-size: 135%;'>Upload</span></el-button>
            <el-button type="danger" @click="clear"><span
                style='font-size: 135%;'>Clear</span></el-button>
          </div>
          <!-- 上传窗口 -->
          <el-dialog :visible.sync="dialogVisible" width="30%" :before-close="handleClose"
            :modal-append-to-body="false">
            <el-collapse v-model="activeName" accordion>
              <el-collapse-item name="1">
                <template slot="title">
                  <span class="large-title">Experimental Information</span>
                </template>
                <el-popover placement="top-start" width="535">
                  <UploadButton @process-upload="inputprocess" type="experimental" ref="experimental" slot="reference" />
                </el-popover>
              </el-collapse-item>
              <el-collapse-item name="2">
                <template slot="title">
                  <span class="large-title">Auxiliary Information</span>
                </template>
                <el-popover placement="top-start" width="535">
                  <UploadButton @process-upload="inputprocess" type="auxiliary" ref="auxiliary" slot="reference" />
                </el-popover>
              </el-collapse-item>
              <el-collapse-item name="3">
                <template slot="title">
                  <span class="large-title">TimeRange & TimeFitness</span>
                </template>
                <TimeSeries :TimeInfoProcessor="this.TimeInfoProcessor" ref="time" />
              </el-collapse-item>
            </el-collapse>
            <span slot="footer" class="dialog-footer">
              <el-button @click="dialogVisible = false">Cancel</el-button>
              <el-button type="primary" @click="confirm">Confirm</el-button>
            </span>
          </el-dialog>
        </li>
        <li>
          <span class="subheading">MAE Filter</span>
          <div class="block">
            <span class="demonstration">MAE</span>
            <el-slider v-model="mae" :format-tooltip="formatTooltip"></el-slider>
          </div>
        </li>
        <li>
          <div>
            <span class="subheading">Station Selection</span>
            <el-input placeholder="select station" v-model="stationID" clearable></el-input>
          </div>
          <div>
            <span class="subheading">Temporal Cluster</span>
            <el-input placeholder="select cluster" v-model="temporalClusterID" clearable></el-input>
          </div>
          <div>
            <span class="subheading">Spatial Cluster</span>
            <el-input placeholder="select cluster" v-model="spatialClusterID" clearable></el-input>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import UploadButton from '../components/UploadButton.vue';
import TimeSeries from '../components/TimeSeries.vue';
import TimeInfoProcessor from '../utils/TimeInfoProcessor';
export default {
  components: {
    UploadButton,
    TimeSeries
  },
  data() {
    return {
      model: this.$store.getters.getData.model,
      TimeInfoProcessor: new TimeInfoProcessor(),
      stationID: 0,
      temporalClusterID: -1,
      spatialClusterID: -1,
      value: '',
      mae: this.$store.getters.getData.mae,
      dialogVisible: false,
      activeName: '1',
      options: [{
        value: "violation_XM_HM",
        label: "violation_XM_HM",
      }, {
        value: "violation_XM_ARIMA",
        label: "violation_XM_ARIMA",
      }],
    };
  },
  watch: {
    // 监听 stationID 的变化
    stationID: {
      handler(newVal) {
        if (newVal === '') {
          this.$store.dispatch('updateCurrentStation', 0);
        } else {
          this.$store.dispatch('updateCurrentStation', newVal);
        }
      },
      immediate: true // 是否立即执行
    },
    temporalClusterID: {
      handler(newVal) {
        if (newVal === '') {
          this.$store.dispatch('updateTemporalCluster', -1);
        } else {
          this.$store.dispatch('updateTemporalCluster', newVal);
        }
      },
      immediate: true // 是否立即执行
    },
    spatialClusterID: {
      handler(newVal) {
        if (newVal === '') {
          this.$store.dispatch('updateSpatialCluster', -1);
        } else {
          this.$store.dispatch('updateSpatialCluster', newVal);
        }
      },
      immediate: true // 是否立即执行
    },
    '$store.getters.getData.currentstation': {
      handler(newVal) {
        this.stationID = newVal;
      }
    },
  },
  methods: {
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done();
        })
        .catch(_ => { });
    },
    formatTooltip(value) {
      this.$store.dispatch('updateMAE', value);
      return value + '%';
    },
    inputprocess(file, type) {
      this.model.setSTRaster(file, type)
    },
    confirm() {
      this.dialogVisible = false;
      const formData = new FormData();
      this.model.setTimeseries(
        this.TimeInfoProcessor.TimeSeries,
        this.TimeInfoProcessor.WeekSeries,
        this.TimeInfoProcessor.PeakSeries,
        this.TimeInfoProcessor.HourSeries,
        this.TimeInfoProcessor.WeekdayNum,
        this.TimeInfoProcessor.WeeksumNum,
        this.TimeInfoProcessor.PeakNum
      )
      this.model.update(this.model.ip.gt_st_raster, this.model.ip.pred_st_raster,
        this.model.ip.station_info, this.model.ip.graph, this.model.ip.cluster);
      this.model.getTemporalBadCaseParam(this.$store.getters.getData.currentstation);
      formData.append('temporalSeries', JSON.stringify(this.model.ip.gt_st_raster));
      formData.append('AM', this.model.ip.graph);
      this.$store.dispatch('getCluster', formData);
    },
    clear(){
      this.mae=0
      this.stationID= 0
      this.temporalClusterID=-1
      this.spatialClusterID=-1
    }
  },
};
</script>

<style lang="scss" scoped>
#centerLeft1 {
  padding: 16px;
  border-radius: 10px;

  .bg-color-black {
    border-radius: 10px;
  }

  .text {
    color: #c3cbde;
  }

  .dv-dec-3 {
    position: relative;
    width: 100px;
    height: 20px;
    top: -3px;
  }

  h1 {
    text-align: center;
    color: #6ba7e3;
    font-family: "Arial Black";
    margin-top: 10%;
  }

  .mode {
    margin-top: 5%;
    padding: 5%;
    height: 60%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .mode li {
    margin-bottom: 1rem;

    .subheading {
      line-height: 2rem;
    }
  }

  .mode li:last-child {
    display: flex;
    justify-content: space-between;
  }

  .mode li:last-child div {
    width: 90%;
  }

  .large-title {
    font-size: 1.3rem;
  }

  .upload {
    display: flex;
    align-items: center;

    button {
      margin-left: 1rem;
      height: 2.6rem;
      width: 45%;
    }

  }

  .block {
    display: flex;
    align-items: center;

    .el-slider {
      margin-left: 5%;
      width: 85%;
    }
  }
}
</style>
