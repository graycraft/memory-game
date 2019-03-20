module.exports = {
  baseUrl: process.env.NODE_ENV === 'production'
    ? '/memory-game/dist/'
    : process.env.BASE_URL
}
