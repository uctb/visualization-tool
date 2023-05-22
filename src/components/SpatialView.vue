 
<template>
  <el-table :data="publishedTableData" @row-click="getRowData">
    <el-table-column prop="lat" label="Latitude"></el-table-column>
    <el-table-column prop="lng" label="Longitude"></el-table-column>
    <el-table-column prop="error" label="Error"></el-table-column>
  </el-table>
</template>

<script>


export default {
    name: 'SpatialBadCase',
    props:{
        CasesError:Array,
        CasesLats:Array,
        CasesLngs:Array
    },
  data() {
    return {
    }
  },
  methods:{
    getRowData(row){
      this.$emit('station-change',row.id)
    }
  },
  computed: {
      publishedTableData(){
        console.log("=========draw table=========")
        console.log("casesError:", this.CasesError);
          var tableData = new Array();
          var n = this.CasesError.length;
          for(var i=0;i<n;i++)
          {
              tableData[i] = {'error':this.CasesError[i],'lat':this.CasesLats[i],'lng':this.CasesLngs[i],'id':i};
          }
          return tableData;
      }
      
  }

}
</script>
