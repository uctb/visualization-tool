<template>
<el-button type="primary" size="mini" @click="$emit('click-confirm')">{{diff_type}}<i class="el-icon-check el-icon--right"></i></el-button>
</template>

<script>
export default {
  name: 'ConfirmButton',
  props:{
    diff_type:String
  },
  data() {
      return {
      };
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
