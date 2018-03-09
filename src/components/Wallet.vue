<template>
  <div class="wallet">
    <template v-if="!storedKeys">
      <ae-modal
          style="z-index: 100; text-align: center;"
          v-if="modalVisible && !storedKeys"
          @close="modalVisible = false"
          title="Security"
      >

        <template v-if="hasPrivateKey">
          <form id="pw-form" @submit.prevent="onUnlockWallet">
            <ae-input placeholder="Type in your password to unlock your wallet" type="password" v-model="password"/>
          </form>
          <ae-button form="pw-form" type="dramatic">Unlock</ae-button>
        </template>
        <template v-else>
          <ae-address v-if="publicKey" show-avatar size='short' :address="publicKey"></ae-address>Secure your wallet
          <form id="secure-form" @submit.prevent="onSecureWallet">
            <ae-input placeholder="Choose a password to select your wallet" type="password" v-model="password" />
          </form>
          <ae-button form="secure-form">Save</ae-button>
        </template>
      </ae-modal>
    </template>
    <template v-else>
      <!--<ae-identity :identity="identity"></ae-identity>-->
      <ae-address v-if="publicKey" show-avatar size='short' :address="publicKey"></ae-address>
      <!--<faucet></faucet>-->
    </template>
  </div>
</template>

<script>
  import {Crypto} from 'aepp-sdk'
  import {mapGetters} from 'vuex'
  import { AeButton, AeAddress, AeInput, AeIdentity, AeModal } from '@aeternity/aepp-components'
  import Faucet from './Faucet'

  export default {
    name: 'Wallet',
    components: {
      Faucet,
      AeButton,
      AeAddress,
      AeInput,
      AeIdentity,
      AeModal
    },
    data () {
      return {
        modalVisible: true,
        password: '',
        hasPrivateKey: false,
        rawKey: undefined,
        rawPublic: undefined,
        publicKey: undefined
      }
    },
    computed: {
      ...mapGetters(['storedKeys', 'pubKey', 'balance']),
      identity () {
        return {
          address: this.pubKey,
          balance: this.balance
        }
      }
    },
    methods: {
      onSecureWallet() {
        const password = this.password
        const encryptedPrivate = Crypto.encryptPrivateKey(password, this.rawKey)
        localStorage.setItem('privateKey', encryptedPrivate)
        localStorage.setItem('publicKey', this.publicKey)
        const keyPair = {
          priv: Buffer.from(this.rawKey).toString('hex'),
          pub: this.publicKey
        }
        this.$store.commit('SET_KEYPAIR', keyPair)
        this.$store.commit('ADD_LOG', {message: 'Securely stored your wallet', level: 'info'})
      },
      onUnlockWallet () {
        const password = this.password
        const privateBinary = localStorage.getItem('privateKey')
        const decrypted = Crypto.decryptPrivateKey(password, Buffer.from(privateBinary.split(',')))
        const publicKey = localStorage.getItem('publicKey')
        this.publicKey = publicKey
        this.$store.commit('SET_KEYPAIR', {pub: publicKey, priv: decrypted.toString('hex')})
        this.$store.commit('ADD_LOG', {message: 'You successfully unlocked your wallet', level: 'info'})
      }
    },
    mounted () {
      const privateKey = localStorage.getItem('privateKey')
      this.hasPrivateKey = privateKey !== null

      if (!this.hasPrivateKey) {
        const {pub, priv} = Crypto.generateKeyPair(true)
        this.rawKey = priv
        this.rawPublic = pub
        this.publicKey = Crypto.getReadablePublicKey(this.rawPublic)
        this.$store.commit('ADD_LOG', {message: 'Generated a new fresh key pair which you can securely store as your test wallet', level: 'info'})
      } else {
        this.$store.commit('ADD_LOG', {message: 'Found saved wallet. Please unlock with your password to proceed', level: 'info'})

      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .wallet {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 48px;
    input {
      height: 48px;
    }
  }
</style>
