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
         <el-input v-model="interval" size="mini" id="datasets" placeholder="Input Time Fitness /min"/>
    </ul>
    <div>
      <el-button  type="warning" size="mini" id="el-button" @click="updateTime">setting</el-button>
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
  width: 18rem;
}
.Datasets>ul>li{ float: left; padding: 0 .1rem;width: 25%}
.Datasets>ul>li:nth-child(2){ width: 50%;padding: 0}
.datasets{
	float: left;
	color: rgba(255,255,255,0.8);
	font-size: .15rem;
	width: 10%;
	height: .5rem;
	text-align: left;
	margin-left: .2rem;
}
<<<.el-button{
	width: .1rem;
}
.flex{
	display: flex;
	flex-wrap: nowrap;
}
.center_spaceBetweeen{
	align-items: center;
	justify-content: space-between;
}
</style>
