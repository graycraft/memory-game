import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  actions: {
    putPlayer: ({ commit, getters, state }, player) => {
      let index = getters.playerIndex(player.name)
      if (~index) {
        commit('updatePlayer', { ...player, index })
      } else {
        commit('createPlayer', player)
        index = state.players.length - 1
      }
      return {
        ...player,
        index
      }
    }
  },
  getters: {
    playerIndex: state => playerName => {
      return state.players.findIndex(p => p.name === playerName)
    },
    playersSorted: state => {
      return [...state.players].sort((p1, p2) => p2.score - p1.score)
    }
  },
  mutations: {
    createPlayer: (state, player) => {
      state.players.push(player)
    },
    deletePlayer: (state, playerIndex) => {
      state.players.splice(playerIndex, 1)
    },
    updatePlayer: (state, { index, name, score }) => {
      Object.assign(state.players[index], { name, score })
    }
  },
  state: {
    players: []
  },
  strict: process.env.NODE_ENV !== 'production'
})
