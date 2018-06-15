<template>
    <div class="hello">
      hello,world
      <nuxt-link to="/">回到首页</nuxt-link>
    </div>
</template>

<script>
export default {
  name: 'AboutPage',
  data () {
    return {

    }
  }
}
</script>

<style scoped lang='less'>
@color: #6cf;
.hello{
  color: @color;
}
</style>
