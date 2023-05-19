<template>
  <div class="flex center_spaceBetweeen">
    <ul class="Datasets">
      <el-input v-model="url" disabled="true" size="mini" id="dataset">
      </el-input>
    </ul>
    <el-upload id="predload" class="upload-demo" :before-upload="beforeUpload" :limit="1" :show-file-list="false">
      <div>
        <el-button  type="warning" size="mini" id="el-button">上传<i class="el-icon-upload el-icon--right"></i>
        </el-button>
      </div>
    </el-upload>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props:{
    type:String
  },
  data() {
      return {
        url:"",
        information:null
      };
    },
    methods: {
      beforeUpload(file) {
        console.log("here");
        console.log(this.type);
        this.$data.url=file.name;
        this.$emit('process-upload',file,this.type);
        return false;
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
.Datasets{
	margin-right: .1rem;
}

.Datasets>ul>li{ float: left; padding: 0 .1rem;width: 25%}
.Datasets>ul>li:nth-child(2){ width: 50%;padding: 0}
.datasets{
	float: left;
	color: rgba(255,255,255,0.8);
	font-size: .15rem;
	width: 35%;
	height: .5rem;
	text-align: left;
	margin-left: .2rem;
}
.el-button{
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
