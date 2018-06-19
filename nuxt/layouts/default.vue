<template>
  <v-app id="my-app">
    <v-content>

      <v-toolbar dark color="blue">
        <v-toolbar-title>
          <nuxt-link to="/" class="logo">CGHome</nuxt-link>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <nuxt-link to="/">
          <v-btn flat>首页</v-btn>
        </nuxt-link>
        <nuxt-link to="/about">
          <v-btn flat>关于我们</v-btn>
        </nuxt-link>
        <nuxt-link to="/gc">
          <v-btn flat>广场</v-btn>
        </nuxt-link>
        <nuxt-link to="/login">
          <v-btn flat>注册/登录</v-btn>
        </nuxt-link>
      </v-toolbar>

      <v-container fluid>
        <nuxt/>
      </v-container>

    </v-content>
  </v-app>
</template>

<style>
html {
  font-family: "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}


#my-app{
  background: #eee;
}

.logo{
  position: relative;
  color: inherit;
  text-decoration: none;
}
</style>
