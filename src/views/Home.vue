<template>
  <v-container fluid>
    <v-layout justify-center>
      <v-card class="mb-3" min-width="116">
        <v-card-title class="font-weight-bold subheading">Top players</v-card-title>
        <v-divider></v-divider>
        <v-list dense>
          <v-list-tile :key="index" v-for="(player, index) in players">
            <v-list-tile-content>{{ player.name }}</v-list-tile-content>
            <v-list-tile-content class="align-end">{{ player.score }}</v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-card>
      <v-flex class="pl-3 shrink">
        <v-layout :key="rowIndex" v-for="(row, rowIndex) in grid">
          <v-sheet :key="colIndex" @click="openCard(rowIndex, colIndex)" :class="'d-inline-block mb-3 mr-3 pa-2' + (gridState[rowIndex][colIndex] ? '' : ' transparent')" :elevation="gridState[rowIndex][colIndex] ? 2 : 0" height="116" v-for="(col, colIndex) in row" width="116">
            <transition name="fade" mode="out-in">
              <v-icon :key="colIndex" size="100" v-if="gridState[rowIndex][colIndex] === 1">{{ col }}</v-icon>
            </transition>
          </v-sheet>
        </v-layout>
      </v-flex>
    </v-layout>
    <v-layout justify-center>{{ timer }}</v-layout>
    <v-dialog v-model="dialog" persistent max-width="240px">
      <v-card>
        <v-card-title>
          <span class="headline">New game</span>
        </v-card-title>
        <v-card-text>
          <v-text-field label="Enter player name" required v-model="playerName" />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="startGame" color="blue darken-1" flat>Start!</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data () {
    return {
      card: {},
      cardState: 0,
      cardTimeout: 0,
      dialog: true,
      playerName: '',
      players: [],
      grid: [],
      gridState: [],
      icons: [
        'alarm', 'android', 'brightness_2', 'bug_report', 'build', 'done_outline',
        'extension', 'face', 'favorite', 'fingerprint', 'home', 'language',
        'near_me', 'pets', 'settings', 'star', 'thumb_up', 'wb_sunny'
      ],
      timer: '',
      timerInterval: 0
    }
  },
  methods: {
    clearTimeout () {
      window.clearTimeout(this.cardTimeout)
      this.cardTimeout = null
    },
    getIconPairs () {
      return this.icons.concat(this.icons)
    },
    getGridSize () {
      return Math.round(Math.sqrt(this.icons.length * 2))
    },
    getRandomIndex (pairs) {
      return Math.round(Math.random() * (pairs.length - 1))
    },
    openCard (rowIndex, colIndex) {
      if (this.gridState[rowIndex][colIndex]) {
        if (this.cardState === 0) {
          this.updateGridState(1, rowIndex, colIndex)
          this.cardTimeout = window.setTimeout(() => {
            this.updateGridState(2, rowIndex, colIndex)
            this.clearTimeout()
            this.cardState = 0
          }, 5e3)
          this.card = {
            colIndex,
            icon: this.grid[rowIndex][colIndex],
            rowIndex
          }
          this.cardState = 1
        } else if (this.cardState === 1) {
          this.updateGridState(1, rowIndex, colIndex)
          this.clearTimeout()
          this.cardTimeout = window.setTimeout(() => {
            if (this.card.icon === this.grid[rowIndex][colIndex]) {
              this.updateGridState(0, this.card.rowIndex, this.card.colIndex)
              this.updateGridState(0, rowIndex, colIndex)
            } else {
              this.updateGridState(2, this.card.rowIndex, this.card.colIndex)
              this.updateGridState(2, rowIndex, colIndex)
            }
            this.clearTimeout()
            this.cardState = 0
            this.card = {}
          }, 5e2)
          this.cardState = 2
        }
      }
    },
    initGrid () {
      const pairs = this.getIconPairs()
      let rowIndex = this.getGridSize()
      let colIndex, index
      this.grid = new Array(rowIndex)
      this.gridState = new Array(rowIndex)
      while (rowIndex) {
        rowIndex--
        colIndex = this.getGridSize()
        this.grid[rowIndex] = new Array(colIndex)
        this.gridState[rowIndex] = new Array(colIndex)
        while (colIndex) {
          colIndex--
          index = this.getRandomIndex(pairs)
          this.grid[rowIndex][colIndex] = pairs[index]
          this.gridState[rowIndex][colIndex] = 2
          pairs.splice(index, 1)
        }
      }
    },
    startGame () {
      let startTime = Date.now()
      let milliseconds, seconds, time
      // this.players = [...this.players.push(this.playerName)]
      this.$set(this.players, this.players.length, {
        name: this.playerName
      })
      this.dialog = false
      this.timerInterval = window.setInterval(() => {
        time = new Date(Date.now() - startTime)
        seconds = (time.getUTCSeconds() < 10 ? '0' : '') + time.getUTCSeconds()
        milliseconds = String(time.getMilliseconds()).slice(0, 1)
        this.timer = `${time.getUTCMinutes()}:${seconds}.${milliseconds}`
      }, 100)
    },
    updateGridState (state, rowIndex, colIndex) {
      this.gridState[rowIndex][colIndex] = state
      this.$set(this.gridState, rowIndex, this.gridState[rowIndex])
    }
  },
  mounted () {
    this.initGrid()
  }
}
</script>

<style lang="stylus" scoped>
  >>> .v-sheet
    cursor pointer
  >>> .fade-enter,
  >>> .fade-leave-to
    opacity 0
  >>> .fade-enter-active,
  >>> .fade-leave-active
    transition opacity .5s
</style>
