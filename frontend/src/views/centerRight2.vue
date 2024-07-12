<template>
  <div id="centerRight1">
    <div class="bg-color-black">
      <div class="d-flex pt-2 pl-2">
        <div class="d-flex" style="margin: 0 auto;">
          <span style="
              font-weight: bold;
              font-size: 150%;
            ">Spatial Analysis</span>
        </div>
      </div>
      <div class="block">
        <el-cascader v-model="value" :options="options" :props="{ expandTrigger: 'hover' }" @change="handleChange"
          size="mini"></el-cascader>
      </div>
      <component :is="selectedComponent" :model="this.model"></component>
    </div>
  </div>
</template>

<script>
import pearson from '@/components/echart/centerRight/SpatialChart/pearson.vue';
import grangerCausality from '@/components/echart/centerRight/SpatialChart/grangerCausality.vue';
import relatedStation from '@/components/echart/centerRight/SpatialChart/relatedStation.vue';
import spatialCluster from '@/components/echart/centerRight/SpatialChart/spatialCluster.vue';
export default {
  components: {
    pearson,
    grangerCausality,
    relatedStation,
    spatialCluster
  },
  data() {
    return {
      value: ['Global', 'Pearson Correlation'],
      selectedComponent: pearson,
      options: [{
        value: 'Global',
        label: 'Global',
        children: [
        {
          value: 'Pearson Correlation',
          label: 'Pearson Correlation',
          component: 'pearson'
        },
        {
          value: 'Spatial Distribution',
          label: 'Spatial Distribution',
          component: 'spatialCluster'
        }
        ]
      }, {
        value: 'Instance',
        label: 'Instance',
        children: [{
          value: 'Related Station',
          label: 'Related Station',
          component: 'relatedStation'
        },{
          value: 'Granger Causality',
          label: 'Granger Causality',
          component: 'grangerCausality'
        }]
      }]
    }
  },
  computed: {
    model() {
      return this.$store.getters.getData.model;
    }
  },
  methods: {
    handleChange(value) {
      if (value && value.length > 1) {
        const selectedOption = this.findOption(this.options, value[1]);
        this.selectedComponent = selectedOption ? selectedOption.component : null;
      } else {
        this.selectedComponent = null;
      }
    },
    findOption(options, value) {
      for (const option of options) {
        if (option.value === value) {
          return option;
        } else if (option.children) {
          const childOption = this.findOption(option.children, value);
          if (childOption) {
            return childOption;
          }
        }
      }
      return null;
    }
  }
};
</script>

<style lang="scss" scoped>
#centerRight1 {
  padding: 16px;
  padding-top: 20px;

  border-radius: 5px;

  .bg-color-black {

    border-radius: 10px;
  }

  .text {
    color: #c3cbde;
  }

  .body-box {
    border-radius: 10px;
    overflow: hidden;

    .dv-scr-board {
      width: 270px;
      height: 340px;
    }
  }

  .block {
    width: 12rem;
    margin: 1rem auto;
  }

}
</style>
