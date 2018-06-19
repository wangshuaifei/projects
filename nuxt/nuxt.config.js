module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: '%s - CGHome,游戏CG分享',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'CGHome,游戏CG分享' },
      { hid: 'keywords', name: 'keywords', content: 'CGHome,游戏CG分享' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  css: [
    '~/assets/fontawesome/css/fontawesome-all.css',
    '~/assets/style/vuetify.min.css',
    {
      src: '~/assets/style/app.less',
      lang: 'less'
    }
  ],
  cache: true,
  plugins: [
    {
      src: '~/plugins/vuetify.js',
      ssr: true
    }
  ],
  transition: {
    name: 'page',
    mode: 'out-in'
  },
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** Run ESLint on save
    */
    vendor: [
      '~/plugins/vuetify.js'
    ],
    extend (config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
