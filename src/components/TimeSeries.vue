<template>
 <div class="block">
  <el-date-picker
    v-model="timeRange"
    type="daterange"
    size="mini"
    start-placeholder="startTime"
    end-placeholder="endTime">
  </el-date-picker>
  <div class="flex center_spaceBetweeen">
    <ul class="Datasets">
         <el-input v-model="interval" size="mini" id="datasets" />
    </ul>
    <el-select v-model="value" placeholder="option" size="mini">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.label">
    </el-option>
  </el-select>
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
      model:Object
    },
  data() {
      return {
        timeRange:"",
        interval:"",
        value:"",
        options: [{
          value: '选项1',
          label: 'min'
        }, {
          value: '选项2',
          label: 'hour'
        }, {
          value: '选项3',
          label: 'day'
        }, {
          value: '选项4',
          label: 'week'
        }, {
          value: '选项5',
          label: 'month'
        }]
      };
    },
  methods:{
    updateTime(){
        console.log('model',this.model)
        this.model.updateTime(this.timeRange[0],this.timeRange[1],this.interval,this.value)
        console.log('model',this.model)
    },
    clear(){
        this.timeRange = ""
        this.interval = ""
        this.value = ""
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.el-date-editor.el-input__inner {
  width: 15rem;
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
<<< .el-button{
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
