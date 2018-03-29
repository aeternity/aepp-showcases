<template>
  <div>
    <span>In order to get test token to play with, please login with your Github account</span>
    <github-auth-button @authenticated="$emit('authenticated')"></github-auth-button>
  </div>
</template>

<script>
  import GithubAuthButton from './GithubAuth/GithubAuthButton'

  export default {
    components: {GithubAuthButton},
    name: 'GithubAuth'
  }
</script>