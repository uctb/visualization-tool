<template>
 <div class="block">
  <el-date-picker
    v-model="timeRange"
    type="datetimerange"
    size="medium"
    start-placeholder="startTime"
    end-placeholder="endTime"
    format="yyyy/MM/dd HH:mm"
    value-format="yyyy/MM/dd HH:mm">
  </el-date-picker>
  <div class="center_spaceBetweeen">
    <ul class="Datasets">
      <el-input v-model="interval" size="medium" id="datasets" placeholder="Input Time Fitness/min" />
    </ul>
    <div>
      <el-button type="warning" size="medium" id="el-button" @click="updateTime">setting<i class="el-icon-edit el-icon--right"></i></el-button>
      <el-icon><EditPen /></el-icon>
    </div>
  </div>
 </div>
</template>

<script>
export default {
  name: 'TimeSeries',
  props:{
      TimeInfoProcessor:Object
    },
  data() {
    return {
      timeRange: "",
      interval: "",
    }
  },
  methods:{
    updateTime(){
        this.TimeInfoProcessor.updateParam(this.timeRange[0],this.timeRange[1],this.interval,"min")
        this.TimeInfoProcessor.emitTimeSeries()
    },
    clear(){
        this.timeRange = ""
        this.interval = ""
    }
  }
}
</script>

<style scoped>
.block{
  display: flex;
  flex-wrap: wrap;
}
.el-date-editor.el-input__inner {
  width: 100%;
  padding: 3px 0px;
  margin-bottom: .8rem;
}
.Datasets>ul>li{ float: left; padding: 0 .1rem;width: 25%}
.Datasets>ul>li:nth-child(2){ width: 50%;padding: 0}

.center_spaceBetweeen{
  display: flex;
  width: 100%;
	align-items: center;
	justify-content: space-between;
}
</style>
