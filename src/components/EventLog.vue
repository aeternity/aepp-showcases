<template>
  <div class="event-log">
    <template v-for="item in log">
      <div class="event-log__message" v-if="!topic || item.topic">
        {{formatTimestamp(item.timestamp)}} | {{item.message}}
        <div v-if="item.link">
          You can track the transaction <a :href="`${apiUrl}/v2/tx/${item.link}?tx_encoding=json`" target="_blank">here.</a>
          <span>&nbsp;<em>block_height:-1</em> means that the transaction not has been mined.</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import config from '../config'

  export default {
    name: 'EventLog',
    data () {
      return {
        apiUrl: config.apiUrl
      }
    },
    props: {
      topic: String
    },
    computed: {
      ...mapGetters(['log', 'currentTopic'])
    },
    methods: {
      formatTimestamp (date) {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
      }
    }
  }
</script>

<style lang="scss">
  .event-log {
    /*position: fixed;*/
    /*bottom: 0;*/
    /*width: 100%;*/
    border: 2px solid #fff;
    border-radius: 8px;
    margin-top: auto;
    max-height: 150px;
    min-height: 56px;
    background-color: #311b58;
    color: white;
    font-family: monospace;
    overflow-y: scroll;
    overflow-x: hidden;
    &__message {
      padding: 4px 16px;
      text-align: left;
      a {
        color: #f7296e;
      }
    }
  }
</style>
