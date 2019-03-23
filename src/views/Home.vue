<template>
  <v-container fluid>
    <v-layout justify-center>
      <v-card class="mb-3 ml-3" min-width="116">
        <v-card-title class="font-weight-bold subheading">Top players</v-card-title>
        <v-divider />
        <v-list dense>
          <v-list-tile :key="index" v-for="(player, index) in players">
            <v-list-tile-content v-text="player.name" />
            <v-list-tile-content class="align-end" v-text="player.score" />
          </v-list-tile>
        </v-list>
      </v-card>
      <v-flex class="pl-3 shrink">
        <v-layout :key="rowIndex" v-for="(row, rowIndex) in grid">
          <v-sheet :class="'d-inline-block mb-3 mr-3 pa-2' + (gridState[rowIndex][colIndex] === 2 ? ' transparent' : '')" :elevation="gridState[rowIndex][colIndex] < 2 ? 2 : 0" :key="colIndex" @click="openCard(rowIndex, colIndex)" height="116" v-for="(col, colIndex) in row" width="116">
            <transition mode="out-in" name="fade">
              <v-icon size="100" v-if="gridState[rowIndex][colIndex] === 1">{{ col }}</v-icon>
            </transition>
          </v-sheet>
        </v-layout>
      </v-flex>
    </v-layout>
    <v-layout justify-center>{{ countdown }}</v-layout>
    <v-dialog :value="gameState === 0" max-width="240px" persistent>
      <v-card>
        <v-card-title>
          <span class="headline">New game</span>
        </v-card-title>
        <v-card-text>
          <v-text-field label="Enter player name" required v-model="player.name" />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="startGame" flat>Start!</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog :value="gameState === 3" persistent max-width="240px">
      <v-card>
        <v-card-title>
          <span class="headline">You lose!</span>
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="startGame" flat>Try again</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog :value="gameState === 2" persistent max-width="240px">
      <v-card>
        <v-card-title>
          <span class="headline">You win!</span>
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="gameState = 0" flat>Ok</v-btn>
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
      cardTimeout: 0,
      cards: [
        'alarm', 'android', 'brightness_2', 'bug_report', 'build', 'done_outline',
        'extension', 'face', 'favorite', 'fingerprint', 'home', 'language',
        'near_me', 'pets', 'settings', 'star', 'thumb_up', 'wb_sunny'
      ],
      countdown: '',
      countdownInterval: 0,
      countdownTimeout: 0,
      gameState: 0,
      gameTime: 6e4,
      gameTimeLeft: 0,
      grid: [],
      gridState: [],
      pairHit: 0,
      pairState: 0,
      player: {
        name: 'player',
        score: 0
      },
      players: []
    }
  },
  methods: {
    clearInterval (name) {
      window.clearTimeout(this[name + 'Interval'])
      this[name + 'Interval'] = null
    },
    clearTimeout (name) {
      window.clearTimeout(this[name + 'Timeout'])
      this[name + 'Timeout'] = null
    },
    getGridSize () {
      return Math.round(Math.sqrt(this.cards.length * 2))
    },
    getPairs () {
      return this.cards.concat(this.cards)
    },
    getRandomIndex (pairs) {
      return Math.round(Math.random() * (pairs.length - 1))
    },
    openCard (rowIndex, colIndex) {
      if (this.gridState[rowIndex][colIndex] === 0) {
        if (this.pairState === 0) {
          this.setGridState(1, rowIndex, colIndex)
          this.cardTimeout = window.setTimeout(() => {
            this.setGridState(2, rowIndex, colIndex)
            this.clearTimeout()
            this.pairState = 0
          }, 5e3)
          this.card = { colIndex, icon: this.grid[rowIndex][colIndex], rowIndex }
          this.pairState = 1
        } else if (this.pairState === 1) {
          this.setGridState(1, rowIndex, colIndex)
          this.clearTimeout('card')
          this.cardTimeout = window.setTimeout(() => {
            if (this.card.icon === this.grid[rowIndex][colIndex]) {
              this.setGridState(2, this.card.rowIndex, this.card.colIndex)
              this.setGridState(2, rowIndex, colIndex)
              this.player.score += Math.round((this.gameTimeLeft - Date.now()) / 1e3)
              this.players.sort((item1, item2) => item2.score - item1.score)
              this.pairHit++
              if (this.pairHit === this.cards.length) {
                this.clearInterval('countdown')
                this.clearTimeout('countdown')
                this.gameState = 2
              }
            } else {
              this.setGridState(0, this.card.rowIndex, this.card.colIndex)
              this.setGridState(0, rowIndex, colIndex)
            }
            this.clearTimeout('card')
            this.pairState = 0
            this.card = {}
          }, 5e2)
          this.pairState = 2
        }
      }
    },
    initGrid () {
      const pairs = this.getPairs()
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
          this.gridState[rowIndex][colIndex] = 0
          pairs.splice(index, 1)
        }
      }
    },
    setGridState (state, rowIndex, colIndex) {
      this.gridState[rowIndex][colIndex] = state
      this.$set(this.gridState, rowIndex, this.gridState[rowIndex])
    },
    startGame () {
      let timeLeft = this.gameTimeLeft = Date.now() + this.gameTime
      this.initGrid()
      if (this.players.some(player => player.name === this.player.name)) {
        this.players[this.player.index].score = 0
      } else {
        this.player.index = this.players.length
        this.$set(this.players, this.players.length, this.player)
      }
      this.countdownInterval = window.setInterval(() => {
        this.countdown = (new Date(timeLeft - Date.now())).toISOString().slice(17, -3)
      }, 1e2)
      this.countdownTimeout = window.setTimeout(() => {
        this.gameState = this.pairHit === this.cards.length ? 2 : 3
        this.clearInterval('countdown')
        this.clearTimeout('countdown')
      }, this.gameTime)
      this.gameState = 1
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
