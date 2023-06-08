<template>
 <div class="block">
  <el-date-picker
    v-model="timeRange"
    type="datetimerange"
    size="mini"
    start-placeholder="startTime"
    end-placeholder="endTime"
    format="yyyy/MM/dd HH:mm"
    value-format="yyyy/MM/dd HH:mm">
  </el-date-picker>
  <div class="flex center_spaceBetweeen">
    <ul class="Datasets">
      <el-input v-model="interval" size="mini" id="datasets" placeholder="Input Time Fitness/min" style="margin-left: .7rem; margin-top: 1rem"/>
    </ul>
    <div>
      <el-button type="warning" size="mini" id="el-button" @click="updateTime" style="margin-right: .7rem; margin-top: 1rem">setting<i class="el-icon-edit el-icon--right"></i></el-button>
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.el-date-editor.el-input__inner {
  width: 16.4rem;
  padding: 3px 0px;
  margin-bottom: .8rem;
}
.Datasets>ul>li{ float: left; padding: 0 .1rem;width: 25%}
.Datasets>ul>li:nth-child(2){ width: 50%;padding: 0}
.flex{
	display: flex;
	flex-wrap: nowrap;
}
.center_spaceBetweeen{
	align-items: center;
	justify-content: space-between;
}
</style>
