<template>
  <div id="app">
<!--    <img alt="Vue logo" src="./assets/logo.png">-->
    <HelloWorld @process-upload="inputprocess" type="gt"/>
    <HelloWorld @process-upload="inputprocess" type="pred"/>
    <HelloWorld @process-upload="inputprocess" type="stationinfo"/>
    <FuncButton @click-confirm="confirm" diff_type="confirm"/>
    <SpatialBadCase :CasesError="this.model.mae_for_each_station" :CasesLats="this.model.station_lats" :CasesLngs="this.model.station_lngs"/>
    <TemporalBadCase :temp_bad_case_param="this.model.temp_bad_case_param"/>

  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import FuncButton from './components/FunctionalButton.vue'
import Model from './Model.js'
import SpatialBadCase from './components/SpatialView.vue'
import TemporalBadCase from './components/TemporalView.vue'
export default {
  name: 'App',
  components: {
    HelloWorld,
    FuncButton,
    SpatialBadCase,
    TemporalBadCase,
  },
  data(){
    return{
      model:new Model(),
    }
  },
  mounted () {
    this.model.getTemporalBadCaseParam();
  },
  methods:{
    inputprocess(file,type){
      this.model.setSTRaster(file,type);
    },
    confirm(){
      console.log('here');
      this.model.testupdate();
      this.model.getTemporalBadCaseParam(0);
    }
    
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
