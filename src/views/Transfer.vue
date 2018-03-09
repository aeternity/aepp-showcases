<template>
  <div class="contracts">
    <h1>Transfer</h1>
    <form @submit.prevent="onSpend" id="spend-form">
      <ae-label>Receiver</ae-label>
      <ae-input placeholder="Please enter a valid account address or name" v-model="receiver"></ae-input>
      <ae-label>Amount</ae-label>
      <ae-input type="number" v-model="amount"></ae-input>
    </form>
    <ae-button type="dramatic" :inactive="amount < 1 || receiver === ''" form="spend-form">Transfer</ae-button>
  </div>
</template>

<script>
  import {AeInput, AeLabel, AeButton} from '@aeternity/aepp-components'

  export default {
    name: 'Transfer',
    components: {AeInput, AeLabel, AeButton},
    data () {
      return {
        receiver: '',
        amount: 0
      }
    },
    methods: {
      onSpend() {
        const payload = {amount: this.amount, receiver: this.receiver}
        this.$store.dispatch('spend', payload)
          .then(data => {
            this.$store.commit('ADD_LOG', {message: `Sending ${this.amount} tokens to receipient ${this.receiver}`, link: data['tx_hash']})
          })
          // .catch(error => this.$store.commit('ADD_LOG', {message: 'Something is wrong with the request'}))
      }
    }
  }
</script>
