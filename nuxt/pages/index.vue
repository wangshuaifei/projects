<template>
  <div class="wrapper">
    <v-layout row wrap pt-4>
      <v-flex lg3 md3 sm6 xs12 order-md1 order-sm2 px-1 py-1>
        <v-card>
          <v-toolbar color="blue" dark>
            <v-icon>fas fa-user-secret</v-icon>
            <v-toolbar-title>用户积分排名</v-toolbar-title>
          </v-toolbar>
          <v-list two-line>
            <template v-for="(item, index) in items">
              <v-subheader v-if="item.header" :key="item.header">{{ item.header }}</v-subheader>
              <v-divider v-else-if="item.divider" :inset="item.inset" :key="index"></v-divider>
              <v-list-tile v-else :key="item.title" avatar @click="">
                <v-list-tile-avatar>
                  <img :src="item.avatar">
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title v-html="item.title"></v-list-tile-title>
                  <v-list-tile-sub-title v-html="item.subtitle"></v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </v-list>
        </v-card>
      </v-flex>
      <v-flex lg6 md6 sm12 xs12 order-md2 order-sm1 px-1 py-1>
        <v-card>
          <v-carousel id="my-slide" dark delimiter-icon="far fa-circle" prev-icon="fas fa-angle-left" next-icon="fas fa-angle-right">
            <v-carousel-item v-for="(item,i) in imgs" :src="item.src" :key="i"></v-carousel-item>
          </v-carousel>
        </v-card>
        <v-card class="mt-3">
          <v-toolbar color="blue" dark>
            <v-icon>fas fa-align-left</v-icon>
            <v-toolbar-title>最新文章展示</v-toolbar-title>
          </v-toolbar>
          <v-list three-line>
            <template v-for="(aItem,i) in articles">
              <v-list-tile :key="aItem.title" avatar @click="">
                <v-list-tile-avatar>
                  <img :src="aItem.avatar" >
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title v-html="aItem.title"></v-list-tile-title>
                  <v-list-tile-sub-title v-html="aItem.subtitle"></v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </v-list>
        </v-card>
      </v-flex>
      <v-flex lg3 md3 sm6 xs12 order-md3 order-sm3 px-1 py-1>
        <v-card>
          <v-toolbar color="blue" dark>
            <v-icon>fab fa-hotjar</v-icon>
            <v-toolbar-title>关键热词搜索</v-toolbar-title>
          </v-toolbar>
          <v-divider></v-divider>
          <v-flex py-3>
            <v-btn small flat outline color="error">热点1</v-btn>
            <v-btn small flat outline color="primary">热点2</v-btn>
            <v-btn small flat outline color="green">热点3</v-btn>
            <v-btn small flat outline>热点4</v-btn>
            <v-btn small flat outline color="warning">热点5</v-btn>
            <v-btn small flat outline color="pink">热点6</v-btn>
            <v-btn small flat outline>热点7</v-btn>
          </v-flex>
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>

export default {
  name: 'Home',
  data () {
    return {
      items: [
        {
          header: '排行'
        },
        {
          divider: true
        },
        {
          avatar: '/head.jpg',
          title: '鲁迅',
          subtitle: '我认识他们，他们都是一群吃人的人'
        },
        {
          avatar: '/head.jpg',
          title: '鲁迅',
          subtitle: '我认识他们，他们都是一群吃人的人'
        },
        {
          avatar: '/head.jpg',
          title: '鲁迅',
          subtitle: '我认识他们，他们都是一群吃人的人'
        },
        {
          avatar: '/head.jpg',
          title: '鲁迅',
          subtitle: '我认识他们，他们都是一群吃人的人'
        },
        {
          avatar: '/head.jpg',
          title: '鲁迅',
          subtitle: '我认识他们，他们都是一群吃人的人'
        },
        {
          avatar: '/head.jpg',
          title: '鲁迅',
          subtitle: '我认识他们，他们都是一群吃人的人'
        },
        {
          avatar: '/head.jpg',
          title: '鲁迅',
          subtitle: '我认识他们，他们都是一群吃人的人'
        },
        {
          avatar: '/head.jpg',
          title: '鲁迅',
          subtitle: '我认识他们，他们都是一群吃人的人'
        },
        {
          avatar: '/head.jpg',
          title: '无fuck说',
          subtitle: '无fuck说'
        },
        {
          avatar: '/head.jpg',
          title: '无fuck说asdasdsad',
          subtitle: '无fuck说asdsd'
        }
      ],
      imgs: [
        {
          src: '/bg.jpg'
        },
        {
          src: '/bg2.jpg'
        }
      ],
      articles: [
        {
          title: '我本将心照明月',
          subtitle: '李白乘舟将欲行，忽闻岸上踏歌声，桃花潭水深千尺，不及汪伦送我情',
          avatar: '/head.jpg'
        },
        {
          title: '奈何明月照沟渠',
          subtitle: '海客谈瀛洲，烟涛微茫信难求；越人语天姥，云霞明灭或可睹。天姥连天向天横，势拔五岳掩赤城，天台四万八千丈',
          avatar: '/head.jpg'
        },
        {
          title: '鲁迅：我没有说过',
          subtitle: 'do you like van 游戏？ oh,yes! I\'m fucking coming!',
          avatar: '/head.jpg'
        }
      ]
    }
  },
  head () {
    return {
      title: '首页'
    }
  }
}
</script>

<style>
#my-slide{
  height: 300px;
}

#my-slide img{
  max-width: 100%;
}
</style>
