<template>
  <v-container fluid>
    <v-layout justify-center>
      <v-card class="mb-3 ml-3" min-width="116">
        <v-card-title class="font-weight-bold subheading">Top players</v-card-title>
        <v-divider />
        <v-list dense>
          <v-list-tile :key="index" v-for="(player, index) in playersSorted">
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
import { mapActions, mapGetters, mapMutations } from 'vuex'
export default {
  computed: { ...mapGetters(['playersSorted']) },
  data () {
    return {
      card: {}, // First pair's card position and icon
      cardTimeout: 0, // First pair's card timeout id
      cards: [ // Cards available
        'alarm', 'android', 'brightness_2', 'bug_report', 'build', 'done_outline',
        'extension', 'face', 'favorite', 'fingerprint', 'home', 'language',
        'near_me', 'pets', 'settings', 'star', 'thumb_up', 'wb_sunny'
      ],
      countdown: '', // String representation of game time left with fraction of a second
      countdownInterval: 0, // Interval id of countdown
      countdownTimeout: 0, // Timeout id of countdown
      gameState: 0, // 0 - ended; 1 - begun; 2 - won; 3 - losed
      gameTime: 6e4, // Game time in seconds
      gameTimestamp: 0, // Unix timestamp indicating when game ends
      grid: [], // Paired cards position on grid
      gridState: [], // 0 - closed; 1 - opened; 2 - pair hit
      pairHit: 0, // Total number of pairs hit
      pairState: 0, // 0 - hidden; 1 - one card opened; 2 - both cards opened
      player: { // Current player
        index: 0,
        name: 'player',
        score: 0
      }
    }
  },
  methods: {
    ...mapActions(['putPlayer']),
    ...mapMutations(['updatePlayer']),
    clearInterval (name) {
      window.clearInterval(this[name + 'Interval'])
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
            this.setGridState(0, rowIndex, colIndex)
            this.clearTimeout('card')
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
              this.setScore()
              this.updatePlayer(this.player)
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
      this.pairHit = 0
    },
    setGridState (state, rowIndex, colIndex) {
      this.gridState[rowIndex][colIndex] = state
      this.$set(this.gridState, rowIndex, this.gridState[rowIndex])
    },
    setScore () {
      this.player.score += Math.round((this.gameTimestamp - Date.now()) / 1e3)
    },
    startGame () {
      const timestamp = this.gameTimestamp = Date.now() + this.gameTime
      this.putPlayer({ name: this.player.name, score: 0 })
        .then(player => { this.player = player })
      this.initGrid()
      this.countdownInterval = window.setInterval(() => {
        this.countdown = (new Date(timestamp - Date.now())).toISOString().slice(17, -3)
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
  transition opacity .25s
</style>
