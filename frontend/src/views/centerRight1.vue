<template>
  <div id="centerRight1">
    <div class="bg-color-black">
      <div class="d-flex pt-2 pl-2">
        <div class="d-flex" style="margin: 0 auto;">
          <span style="
              font-weight: bold;
              font-size: 150%;
            ">Temporal Analysis</span>
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
import weekendEffect from '@/components/echart/centerRight/TemporalChart/weekendEffect.vue';
import temporalPattern from '@/components/echart/centerRight/TemporalChart/temporalPattern.vue';
import hourPattern from '@/components/echart/centerRight/TemporalChart/hourPattern.vue';
import temporalRelatedStation from '@/components/echart/centerRight/TemporalChart/temporalRelatedStation.vue';
import temporalCluster from '@/components/echart/centerRight/TemporalChart/temporalCluster.vue';
export default {
  components: {
    weekendEffect,
    temporalPattern,
    hourPattern,
    temporalRelatedStation,
    temporalCluster
  },
  data() {
    return {
      value: ['Global', 'Temporal Pattern'],
      selectedComponent: temporalPattern,
      options: [{
        value: 'Global',
        label: 'Global',
        children: [{
          value: 'Temporal Pattern',
          label: 'Temporal Pattern',
          component: 'temporalPattern'
        }, {
          value: 'Weekend Effect',
          label: 'Weekend Effect',
          component: 'weekendEffect'
        },{
          value: 'Hour Pattern',
          label: 'Hour Pattern',
          component: 'hourPattern'
        },{
          value: 'Temporal Distribution',
          label: 'Temporal Distribution',
          component: 'temporalCluster'
        }]
      }, {
        value: 'Instance',
        label: 'Instance',
        children: [{
          value: 'Related Station',
          label: 'Related Station',
          component: 'temporalRelatedStation'
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
