<template>
  <div v-if="storedKeys" class="balance">
    <template v-if="balanceLoading">
      <ae-loader></ae-loader>
    </template>
    <template v-else>
      <ae-amount :value="balance" :unit="unit"/>
    </template>
  </div>
</template>

<script>
  import GithubAuthButton from './GithubAuth/GithubAuthButton'
  import {mapGetters} from 'vuex'
  import GithubAuth from './GithubAuth'
  import {AeAmount, AeLoader} from '@aeternity/aepp-components'

  export default {
    components: {
      GithubAuth,
      GithubAuthButton,
      AeAmount,
      AeLoader,
    },
    name: 'Balance',
    data () {
      return {
        unit: 'Æ',
        balanceLoading: false
      }
    },
    watch: {
      pubKey (value) {
        this.balanceLoading = true
        this.fetchBalance()
        this.$store.commit('ADD_LOG', {message: `Fetching your balance ...`, level: 'info'})
        setInterval(
          () => this.fetchBalance(),
          10000
        )
      }
    },
    computed: {
      ...mapGetters(['isAuthenticated', 'storedKeys', 'balance', 'pubKey'])
    },
    methods: {
      fetchBalance () {
        this.$store.dispatch('fetchBalance')
          .then((balance) => {
            this.balanceLoading = false
            if (this.balance !== balance) {
              this.$store.commit('SET_BALANCE', balance)
              this.$store.commit('ADD_LOG', {message: `Your Balance is ${balance}`, level: 'info'})
            }
          })
          .catch((error) => {
            console.error(error)
            this.balanceLoading = false
            this.$store.commit('SET_BALANCE', 0)
          })
      }
    }
  }
</script>

<style>
  .balance {
    margin-left: auto;
  }
</style>