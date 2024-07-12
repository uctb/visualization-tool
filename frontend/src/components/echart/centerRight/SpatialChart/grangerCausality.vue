<template>
  <div class="box">
    <el-table :data="tableData" class="styleTable">
      <el-table-column prop="id" label="StationID" width="120">
      </el-table-column>
      <el-table-column prop="mae" label="MAE" width="120">
      </el-table-column>
      <el-table-column prop="cluster" label="Cluster" width="100">
      </el-table-column>
      <el-table-column prop="F_value" label="F_value">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  props: { model: Object },
  data() {
    return {
      tableData: []
    }
  },
  mounted() {
    this.updateTableData(this.$store.getters.getData.currentstation);
  },
  watch: {
    '$store.getters.getData.currentstation': function (newStation) {
      this.updateTableData(newStation);
    },
    'model.ws': {
      handler() {
        this.updateTableData(0);
      },
      deep: true
    }
  },
  methods: {
    updateTableData(currentStation) {
      this.tableData = []
      for (let i = 0; i < this.model.ip.granger[currentStation].length; i++) {
        let station = this.model.ip.granger[currentStation][i][1];
        this.tableData.push({
          id: 'station' + station,
          mae: this.model.PointMAE[station],
          cluster: this.model.temporal_cluster[station],
          F_value: this.model.ip.granger[currentStation][i][0].toFixed(2)
        });
      }

    }
  }
}
</script>
<style scoped>
.box {
  overflow: auto;
  height: 20.5rem;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: 50% 50%;
}

.styleTable {
  background-color: transparent !important;
}

.styleTable ::v-deep .el-table th.el-table_cell,
::v-deep .el-table th,
::v-deep .el-table tr,
::v-deep .el-table tbody tr:hover>td {
  background-color: transparent !important;
  color: #fff !important;
  font-size: bold !important;
}

::-webkit-scrollbar {
  width: 1px;
  height: 1px;
  position: absolute
}

::-webkit-scrollbar-thumb {
  background-color: #5bc0de
}

::-webkit-scrollbar-track {
  background-color: #ddd
}

::-webkit-scrollbar {
  width: 1px;
  height: 1px;
  position: absolute;
}

::-webkit-scrollbar-thumb {
  background-color: #5bc0de;
}

::-webkit-scrollbar-track {
  background-color: #ddd;
}
</style>
