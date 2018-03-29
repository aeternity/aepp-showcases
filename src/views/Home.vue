<template>
  <div class="home">
    <h1>Welcome to the æpp SDK demos</h1>
    <ae-panel class="disclaimer" :title="'Disclaimer'">
      <p>This SDK is at an alpha stage where things easily can break. We aim to make our alpha releases as stable as possible.
        Neverless it should not be taken as production-ready.</p>
    </ae-panel>
    <h2>Contracts</h2>
    <p>Checkout <router-link :to="{name: 'contracts'}">Contracts</router-link> and deploy your first contract on æternity today.</p>
    <h2>ÆNS</h2>
    <p>Register a name on the <router-link :to="{name: 'aens'}">ÆNS</router-link> æternity name system.</p>
    <h2>Transfer</h2>
    <p><router-link :to="{name: 'transfer'}">Transfer</router-link> æon coins to someone.</p>
  </div>
</template>

<script>

  import {AePanel} from '@aeternity/aepp-components'

  export default {
    name: 'home',
    components: {AePanel}
  }

</script>

<style lang="scss">
  .home {
    text-align: left;
    width: 100%;
    max-width: 1200px;
    margin: auto;
    padding-bottom: 120px;
  }
  .disclaimer {
    .ae-button {
      visibility: hidden;
    }
    .content {
      padding: 8px 30px !important;
    }
  }
</style>
