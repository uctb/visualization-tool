<template>
   <el-upload
                id="predload"
                class="upload-demo"
                :before-upload="beforeUpload"
                :limit="3"
                :show-file-list="false">
          <!--                    <el-button slot="trigger" size="small" type="primary">点击上传</el-button>-->
          <div style="width: 120%; float: left; text-align: right;">
            <el-button circle icon="el-icon-circle-check" size="mini">{{type}}</el-button>
          </div>
   </el-upload>
</template>

<script>
export default {
  name: 'HelloWorld',
  props:{
    type:String
  },
  data() {
      return {
        information:null
      };
    },
    methods: {
      beforeUpload(file) {
        console.log("here");
        console.log(this.type);
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
</style>
