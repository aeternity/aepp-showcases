<template>
  <table class="aens-list">
    <tr v-for="tx in Object.keys(nameTransactions)">
      <td class="aens-list-name">{{nameTransactions[tx].name}}</td>
      <td><a
          :href="`${apiUrl}/v2/tx/${tx}?tx_encoding=json`"
          target="_blank">{{tx}}</a>
      </td>
      <template v-if="nameTransactions[tx].salt">
        <td>
          <ae-button
              @click="claim(nameTransactions[tx].name, nameTransactions[tx].salt)"
              size="smaller" v-if="nameTransactions[tx].status === 'Mined'">Claim now
          </ae-button>
        </td>
        <td class="aens-list-button">
          <ae-button size="small" @click="onCancelPreclaim(nameTransactions[tx])">
            Cancel
          </ae-button>
        </td>
      </template>
    </tr>
  </table>
</template>

<script>

  import {AeButton} from '@aeternity/aepp-components'
  import config from '../config'

  export default {
    name: 'AensList',
    components: {AeButton},
    props: ['nameTransactions'],
    data () {
      return {
        apiUrl: config.apiUrl
      }
    },
    methods: {
      onCancelPreclaim (preclaimItem) {
        this.$store.commit('REMOVE_PRECLAIM', preclaimItem)
      },
      claim (name, salt) {
        this.$store.dispatch('claimName', {name, salt}).then(
          txHash => {
            this.$store.commit('ADD_LOG', {message: `Sent claim transaction for name '${name}'.`, link: txHash})
          }
        )
      }
    }
  }
</script>

<style lang="scss">
  .aens-list {
    width: 100%;
    text-align: left;
    /*&-name {*/
      /*margin-right: 12px;*/
      /*!*min-width: 100px;*!*/
    /*}*/
    &-button {
      float: right;
    }
  }
</style>