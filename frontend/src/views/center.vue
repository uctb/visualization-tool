<template>
  <div id="center">
    <div class="bar">
      <div class="barbox2">
        <ul class="clearfix">
          <li class="pulll_left">StationID</li>
          <li class="pulll_left">RMSE</li>
          <li class="pulll_left">MAE </li>
          <li class="pulll_left">MAPE</li>
        </ul>
      </div>
      <div class="barbox" style="height: 3.5rem">
        <ul class="clearfix">
          <li class="pulll_left counter" id="point_name"
            style="font-family:微软雅黑; font-size: 1.2rem; color: rgba(255,255,255,0.8)">station<span>{{
              currentStation
              }}</span></li>
          <li class="pulll_left counter" id="point_rmse"> </li>
          <li class="pulll_left counter" id="point_mae"> </li>
          <li class="pulll_left counter" id="point_mape"> </li>
        </ul>
      </div>
    </div>
    <MapChart></MapChart>
    <div class="boxall">
      <div class="alltitle">Groundtruth and Prediction({{ currentStation }})</div>
      <TemporalBadCase :temp_bad_case_param="this.model.temp_bad_case_param" />
    </div>
  </div>
</template>

<script>
import MapChart from "@/components/echart/center/map.vue";
import TemporalBadCase from "@/components/echart/center/TemporalView.vue";

export default {
  components: {
    MapChart,
    TemporalBadCase
  },
  data() {
    return {
      model: this.$store.getters.getData.model,
    }
  },
  computed: {
    currentStation() {
      if (this.$store.getters.getData.currentstation === null){
        return 0;
      }else{
        return this.$store.getters.getData.currentstation;
      }
    }
  },
}
</script>

<style lang="scss" scoped>
#center {
  display: flex;
  flex-direction: column;

  .up {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;

    .item {
      border-radius: 6px;
      padding-top: 8px;
      margin-top: 8px;
      width: 32%;
      height: 70px;

      .dv-dig-flop {
        width: 150px;
        height: 30px;
      }
    }
  }

  .down {
    padding: 6px 4px;
    padding-bottom: 0;
    width: 100%;
    display: flex;
    height: 255px;
    justify-content: space-between;

    .bg-color-black {
      border-radius: 5px;
    }

    .ranking {
      padding: 10px;
      width: 100%;

      .dv-scr-rank-board {
        height: 225px;
      }
    }

    .percent {
      width: 40%;
      display: flex;
      flex-wrap: wrap;

      .item {
        width: 50%;
        height: 120px;

        span {
          margin-top: 8px;
          font-size: 14px;
          display: flex;
          justify-content: center;
        }
      }

      .water {
        width: 100%;

        .dv-wa-le-po {
          height: 120px;
        }
      }
    }
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
    font-size: 1.5rem;
  }

  .clearfix {
    display: flex;
    padding-top: 1rem;
    margin-bottom: .5rem;
  }

  .boxall {
    border: 1px solid rgba(25, 186, 139, 0.17);
    padding: 0.4rem;
    background: rgba(255, 255, 255, 0.04) url("../assets/line.png");
    background-size: 100% auto;
  }

  .alltitle {
    width: 21rem;
    margin: 0 auto;
    font-weight: bold;
    font-size: 1.3rem !important;
  }
}
</style>
