import Vue from 'vue'
import Vuex from 'vuex'
import Model from '../utils/Model';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    data: {
      model: new Model(),
      currentstation: 0,
      mae: 0,
      temporalCluster: -1,
      spatialCluster: -1
    }
  },
  mutations: {
    setData(state, payload) {
      state.data = payload
    },
    setModelTemporalCluster(state, temporal_cluster, spatial_cluster){
      state.data.model.temporal_cluster = temporal_cluster
      state.data.model.spatial_cluster = spatial_cluster
    }
  },
  actions: {
    updateCurrentStation({ commit, state }, payload) {
      commit('setData', {
        ...state.data,
        currentstation: payload
      });
    },
    updateMAE({ commit, state }, payload) {
      commit('setData', {
        ...state.data,
        mae: payload
      });
    },
    updateTemporalCluster({ commit, state }, payload) {
      commit('setData', {
        ...state.data,
        temporalCluster: payload
      });
    },
    updateSpatialCluster({ commit, state }, payload) {
      commit('setData', {
        ...state.data,
        spatialCluster: payload
      });
    },
  },
  getters: {
    getData: state => state.data
  }
})
