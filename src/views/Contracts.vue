<template>
  <div class="contracts">
    <h1>Contracts</h1>
    <contracts-editor></contracts-editor>
  </div>
</template>

<script>
  import ContractsEditor from '../components/ContractsEditor'

  export default {
    components: {ContractsEditor},
    name: 'Contracts'
  }
</script>

<style>
  .contracts {
    width: 100%;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
  }
</style>
