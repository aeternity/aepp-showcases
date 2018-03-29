<template>
  <div class="contracts">
    <h1>ÆNS</h1>
    <div class="register-name-panel">
      <form @submit.prevent="onRegister" id="register-name">
        <ae-input v-model="name" placeholder="Please enter a name that you would like to claim"/>
      </form>
      <div id="register-control">
        <div id="register-name-display">Push the button to reserve <span class="monospace"><strong>{{name ? name : '&lt;your name&gt;'}}.aet</strong></span></div>
        <ae-button form="register-name" :type="name ? 'exciting': 'boring'" :inactive="name === '<your name>' || name.length < 2" id="register-button">Register</ae-button>
      </div>
    </div>
    <div class="claim-table-panel" v-if="Object.keys(openPreclaims).length > 0">
      <h2>Open preclaims</h2>
      <aens-list :nameTransactions="openPreclaims"></aens-list>
    </div>
    <div class="claim-table-panel" v-if="Object.keys(openClaims).length > 0">
      <h2>Open Claims</h2>
      <aens-list :nameTransactions="openClaims"></aens-list>
    </div>
  </div>
</template>

<script>
  import {AeInput, AeButton, AePanel} from '@aeternity/aepp-components'
  import {mapGetters} from 'vuex'
  import AensList from '../components/AensList'

  export default {
    name: 'AENS',
    components: {
      AensList,
      AeInput, AeButton, AePanel},
    data () {
      return {
        name: '',
        preclaimFetchInterval: undefined,
        claimFetchInterval: undefined
      }
    },
    computed: {
      ...mapGetters(['openPreclaims', 'openClaims', 'transactions'])
    },
    methods: {
      onRegister () {
        this.$store.dispatch('preclaimName', `${this.name}.aet`).then(
          (data) => {
            const msg = {
              message: `Sent preclaim transaction for name '${this.name}.aet'. You can only preceed with the claiming process after this transaction has been mined`,
              link: data['tx_hash']
            }
            this.$store.commit('ADD_LOG', msg)
          }
        )
      },
      fetchPreclaims () {
        Object.keys(this.openPreclaims).forEach(
        tx => {
          this.$store.dispatch('fetchTx', tx)
            .then(
              transaction => {
                const blockHeight = transaction['block_height']
                const status = blockHeight === -1 ? 'Not mined': 'Mined'
                const claimObj = this.openPreclaims[tx]
                if (blockHeight !== -1 && status !== claimObj.status) {
                  this.$store.commit('ADD_LOG', {message: `Your name '${claimObj.name}' was successfully preclaimed in block ${blockHeight}`})
                }
                this.$store.commit('UPDATE_PRECLAIM_STATUS', {tx, status})
              }
            )
            .catch(
              error => {
                let status = 'Not mined'
                if (error.response && error.response.status === 500) {
                  status = 'Error'
                }
                this.$store.commit('UPDATE_PRECLAIM_STATUS', {tx, status})
              }
            )
        }
        )
      },
      fetchClaims () {
        Object.keys(this.openClaims).forEach(
          tx => {
            this.$store.dispatch('fetchTx', tx)
              .then(
                transaction => {
                  const blockHeight = transaction['block_height']
                  const status = blockHeight === -1 ? 'Not mined': 'Mined'
                  const claimObj = this.openClaims[tx]
                  if (status !== claimObj.status) {
                    this.$store.commit('ADD_LOG', {message: `Your name '${claimObj.name}' was successfully claimed in block ${blockHeight}`})
                  }
                  this.$store.commit('UPDATE_CLAIM_STATUS', {tx, status})
                }
              )
              .catch(
                error => {
                  const status = 'Error'
                  this.$store.commit('UPDATE_CLAIM_STATUS', {tx, status})
                }
              )
          }
        )
      }
    },
    mounted () {
      if (this.preclaimFetchInterval) {
        clearInterval(this.preclaimFetchInterval)
      } else {
        this.fetchPreclaims()
      }
      if (this.claimFetchInterval) {
        clearInterval(this.claimFetchInterval)
      } else {
        this.fetchClaims()
      }

      this.preclaimFetchInterval = setInterval(
        () => this.fetchPreclaims(),
        30000
      )

      this.claimFetchInterval = setInterval(
        () => this.fetchClaims(),
        30000
      )

    }
  }
</script>

<style lang="scss">
  #register-button {
    float: right;
  }
  #register-control {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  #register-name-display {
    padding-left: 16px;
    font-size: 18px;
  }
  .monospace {
    font-family: monospace;
  }
  .register-name-panel {
    margin-bottom: 48px;
  }
  .claim-table-panel {
    display: flex;
    flex-direction: column;
    margin-bottom: 36px;
  }
</style>