<template>
  <div class="faucet">
      <ae-button size="small" invert @click="onRequestTestCoins" type="exciting">Get Test Coins</ae-button>
      <ae-modal style="z-index: 100;" v-if="!isAuthenticated && showModal"
                @close="showModal = false"
                title="Github Login"
                class="github-modal"
      >
        <github-auth @authenticated="onAuthenticated"></github-auth>
      </ae-modal>
  </div>
</template>

<script>
  import { AeButton, AeModal } from '@aeternity/aepp-components'
  import GithubAuth from './GithubAuth'
  import {mapGetters} from 'vuex'

  export default {
    name: 'Faucet',
    components: {
      GithubAuth,
      AeButton,
      AeModal
    },
    data () {
      return {
        showModal: false
      }
    },
    computed: {
      ...mapGetters(['isAuthenticated'])
    },
    methods: {
      requestCoins () {
        this.$store.dispatch('requestCoins')
          .then(
            (data) => {
              this.$store.commit('ADD_LOG', {message: `Faucet will transfer ${data['spent']} coins to your account.`, link: data.tx_hash, level: 'info'})
            }
          )
          .catch(
            error => {
              console.error(error)
              this.$store.commit('ADD_LOG', {message: `Hourly or daily limit is reached. Please try again later.`, level: 'info'})
            }
          )
      },
      onRequestTestCoins () {
        if (!this.isAuthenticated) {
          this.showModal = true
        } else {
          this.requestCoins()
        }
      },
      onAuthenticated () {
        this.requestCoins()
      }
    }
  }
</script>

<style>
  .github-modal {
    text-align: center;
  }
</style>