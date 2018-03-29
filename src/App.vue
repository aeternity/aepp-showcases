<template>
  <div id="app">
    <ae-header name="æpp SDK demo" class="showcase-header">
      <div class="header-content">
        <div id="nav">
          <router-link to="contracts">Contracts</router-link>
          <router-link to="aens">ÆNS</router-link>
          <router-link to="transfer">Transfer</router-link>
        </div>
        <div class="identity">
          <wallet></wallet>
          <balance></balance>
        </div>
      </div>
    </ae-header>
    <router-view/>
    <div class="bottom">
      <faucet></faucet>
      <event-log></event-log>
    </div>
  </div>
</template>

<script>
  import Wallet from './components/Wallet'
  import Balance from './components/Balance'
  import EventLog from './components/EventLog'
  import Faucet from './components/Faucet'
  import {AeHeader} from '@aeternity/aepp-components'

  export default {
    components: {
      Faucet,
      EventLog,
      Balance,
      Wallet,
      AeHeader
    },
    mounted () {
      const token = localStorage.getItem ('authToken')
      if (token) {
        this.$http.get (`https://api.github.com/user?=access_token=${token}`)
          .then ((data) => {
            this.$store.commit ('SET_AUTH_TOKEN', token)
          })
          .catch ((error) => {
            // User token is not valid anymore. Reset localStorage
            localStorage.removeItem ('authToken')
          })
      }
      let claims = localStorage.getItem('openClaims')
      if (claims) {
        claims = JSON.parse(claims)
      } else {
        claims = []
      }
      this.$store.commit('SET_CLAIMS', claims)

      let preclaims = localStorage.getItem('openPreclaims')
      if (preclaims) {
        preclaims = JSON.parse(preclaims)
      } else {
        preclaims = []
      }
      this.$store.commit('SET_PRECLAIMS', preclaims)

    }
  }
</script>

<style lang="scss">
  #app {
    font-family: Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /*text-align: center;*/
    /*color: #2c3e50;*/
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  #nav {
    padding: 30px;
    margin-right: 60px;
    height: 32px;
    line-height: 32px;
    a {
      font-weight: bold;
      color: #fff;
      opacity: 0.6;
      text-decoration: none;
      position: relative;
      margin-left: 16px;
      &.router-link-exact-active {
        opacity: 1;
        &:after {
          content: "";
          display: block;
          position: absolute;
          width: calc(100% - 20px);
          left: 10px;
          border-top: 3px solid #f7296e;
          bottom: -8px;
        }
      }
      &:first-child {
        margin-left: 0;
      }
    }
  }
  .bottom {
    position: fixed;
    right: 0;
    bottom: 0;
    width: 100%;
    .faucet {
      position: absolute;
      right: 16px;
      bottom: 16px;
    }

  }
  .identity {
    padding: 8px;
    margin-top: 28px;
    width: 280px;
    /*position: absolute;*/
    /*right: 0;*/
    display: flex;
    /*top: 0;*/
    flex-direction: row;
    background-color: #fff;
    border-radius: 8px;
    .balance {
      margin-top: auto;
      margin-bottom: auto;
    }
  }
  .showcase-header {
    height: 66px;
    margin-bottom: 16px;
    header {
      max-width: 1200px !important;
    }
  }
  .header-content {
    display: flex;
  }
</style>
