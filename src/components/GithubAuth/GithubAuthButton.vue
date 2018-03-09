<template>
  <div>
    <ae-button @click="authenticate('github')" type="exciting">Github Auth</ae-button>
  </div>
</template>

<script>
  import { AeButton } from '@aeternity/aepp-components'

  export default {
    name: 'GithubAuthButton',
    components: {AeButton},
    methods: {
      authenticate: function (provider) {
        this.$store.dispatch('authenticate', {provider}).then(
          (token) => this.$emit('authenticated', token)
        )
      }
    }
  }
</script>
