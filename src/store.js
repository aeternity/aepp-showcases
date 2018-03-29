import Vue from 'vue'
import Vuex from 'vuex'
import VueAxios from 'vue-axios'
import { VueAuthenticate } from 'vue-authenticate'
import axios from 'axios'
import AeternityClient from 'aepp-sdk'
import appConfig from './config'

Vue.use(Vuex)
Vue.use(VueAxios, axios)

const vueAuth = new VueAuthenticate(Vue.prototype.$http, {
  baseUrl: appConfig.apiUrl, // API domain
  providers: {
    github: {
      url: '/auth/github/',
      scope: null,
      clientId: appConfig.githubClientId,
      redirectUri: appConfig.githubCallbackUrl // Your client app URL
    }
  }
})

Vue.use(Vuex)

const provider = new AeternityClient.providers.HttpProvider(
  appConfig.epochHost,
  appConfig.epochPort
)

const client = new AeternityClient(provider)

export default new Vuex.Store({
  state: {
    keypair: undefined,
    isAuthenticated: false,
    authToken: undefined,
    log: [],
    balance: 0,
    topic: undefined,
    openPreclaims: {},
    openClaims: {},
    transactions: {},
    contracts: {}
  },
  mutations: {
    'SET_HOST': (state, host) => {
      provider.host = host
    },
    'SET_EXTERNAL_PORT': (state, port) => {
      provider.port = port
    },
    'SET_KEYPAIR': (state, {pub, priv}) => {
      state.keypair = {pub, priv}
    },
    'SET_AUTH_TOKEN': (state, token) => {
      state.authToken = token
      localStorage.setItem('authToken', token)
    },
    'ADD_LOG': (state, payload) => {
      if (!payload.timestamp) {
        payload.timestamp = new Date()
      }
      state.log.unshift(payload)
    },
    'SET_BALANCE': (state, balance) => {
      state.balance = balance
    },
    'SET_TOPIC': (state, topic) => {
      state.topic = topic
    },
    'ADD_PRECLAIM_TX': (state, payload) => {
      state.openPreclaims[payload['tx']] = payload
      state.openPreclaims = Object.assign({}, state.openPreclaims)
    },
    'ADD_CLAIM_TX': (state, payload) => {
      state.openClaims[payload['tx']] = payload
      state.openClaims = Object.assign({}, state.openClaims)
    },
    'SET_PRECLAIMS': (state, preclaims) => {
      state.openPreclaims = preclaims
    },
    'SET_CLAIMS': (state, claims) => {
      state.openClaims = claims
    },
    'PUT_TX': (state, {txHash, transaction}) => {
      state.transactions[txHash] = transaction
    },
    'UPDATE_PRECLAIM_STATUS': (state, {tx, status}) => {
      state.openPreclaims[tx].status = status
      state.openPreclaims = Object.assign({}, state.openPreclaims)
    },
    'UPDATE_CLAIM_STATUS': (state, {tx, status}) => {
      state.openClaims[tx].status = status
      state.openClaims = Object.assign({}, state.openClaims)
    },
    'REMOVE_PRECLAIM': (state, {tx}) => {
      delete state.openPreclaims[tx]
      localStorage.setItem('openPreclaims', JSON.stringify(state.openPreclaims))
    },
    'REMOVE_CLAIM': (state, {tx}) => {
      delete state.openClaims[tx]
      localStorage.setItem('openClaims', JSON.stringify(state.openClaims))
    },
    'ADD_CONTRACT': (state, data) => {
      const {contractAddress} = data
      if (typeof contractAddress === 'undefined') {
        throw new Error("'contractAddress' must be specified")
      }
      const contract = state.contracts[contractAddress]
      if (contract) {
        console.warn(`Overwriting contract ${contractAddress}`)
      }

      const newContract = {}
      newContract[contractAddress] = data
      state.contracts = Object.assign(state.contracts, newContract)
    },
    'UPDATE_CONTRACT': (state, {contractAddress, data}) => {
      const contracts = state.contracts
      const currentContract = contracts[contractAddress]
      if (currentContract) {
        const updatedContract = Object.assign(currentContract, data)
        const updatedContractTuple = {}
        updatedContractTuple[contractAddress] = updatedContract
        state.contracts = Object.assign(state.contracts, updatedContractTuple)
      } else {
        throw new Error('You cant update a contract that has not been saved before.')
      }
    }
  },
  actions: {
    async authenticate (context, payload) {
      const response = await vueAuth.authenticate(payload.provider)
      context.commit('ADD_LOG', {message: 'Successfully logged in with Github'})
      context.commit('SET_AUTH_TOKEN', response.data['access_token'])
      return response.data['access_token']
    },
    async fetchBalance (context) {
      const publicKey = context.getters.storedKeys.pub
      const url = `${appConfig.apiUrl}/v2/account/balance/${publicKey}`
      const {data} = await axios.get(url)
      return data.balance
    },
    async requestCoins (context) {
      const url = `${appConfig.apiUrl}/faucet/`
      const payload = {
        amount: 10,
        key: context.getters.pubKey
      }
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-gh-token': context.state.authToken
        }
      }
      try {
        const {data} = await axios.post(url, payload, config)
        const interval = setInterval(
          async () => {
            const transaction = await client.tx.getTransaction(data['tx_hash'])
            if (transaction['block_height'] !== -1) {
              context.commit('ADD_LOG', {message: 'Found spend transaction in block ' + transaction['block_height']})
              clearInterval(interval)
            }
          },
          5000
        )
        return data
      } catch (e) {
        throw e
      }
    },
    async preclaimName (context, name) {
      const salt = Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER))
      const hash = await client.aens.getCommitmentHash(name, salt)
      const data = await client.aens.preClaim(hash, 1, context.getters.account)
      let preclaims = localStorage.getItem('openPreclaims')
      if (preclaims) {
        preclaims = JSON.parse(preclaims)
      } else {
        preclaims = {}
      }
      const preclaimInfo = {tx: data['tx_hash'], salt: salt, name: name}
      preclaims[data['tx_hash']] = preclaimInfo
      localStorage.setItem('openPreclaims', JSON.stringify(preclaims))
      context.commit('ADD_PRECLAIM_TX', preclaimInfo)
      return data
    },
    async claimName (context, {name, salt}) {
      const data = await client.aens.claim(name, salt, 1, context.getters.account)
      const txHash = {tx: data['tx_hash'], name: name}
      let claims = localStorage.getItem('openClaims')
      if (claims) {
        claims = JSON.parse(claims)
      } else {
        claims = []
      }
      claims.push(txHash)
      localStorage.setItem('openClaims', JSON.stringify(claims))
      context.commit('ADD_CLAIM_TX', txHash)
      return txHash
    },
    async fetchTx (context, tx) {
      const transaction = await client.tx.getTransaction(tx)
      context.commit('PUT_TX', {txHash: tx, transaction})
      return transaction
    },
    async spend (context, {amount, receiver}) {
      return await client.base.spend(receiver, parseInt(amount), context.getters.account)
    },
    async callContract (context, {byteCode, functionName, functionArgs, address}) {
      context.commit ('ADD_LOG', {message: `Call ${functionName}(${functionArgs.join(',')}) on contract ${address}`})
      context.commit ('ADD_LOG', {message: `Call Step 1 => Encode function call data`})
      const callData = await client.contracts.encodeCallData('ring',
        byteCode,
        functionName,
        functionArgs
      )
      context.commit ('ADD_LOG', {message: `Call Step 1 => function byte code: ${callData}`})

      const data = await client.contracts.getCallTx(
        address,
        callData,
        {caller: context.getters.pubKey, amount: 0}
      )
      context.commit ('ADD_LOG', {message: `Call Step 2 => Send call transaction on contract ${address}`, link: data['tx_hash']})
      await client.tx.sendSigned(data.tx, context.getters.privateKey)
      return data
    },
    async callStaticContract(context, {byteCode, functionName, functionArgs}) {
      return await client.contracts.callStatic(
        'ring',
        byteCode,
        functionName,
        functionArgs.join(',')
      )
    },
    async compileContract(context, contractCode) {
      const byteCode = await client.contracts.compile (contractCode, '')
      context.commit ('ADD_LOG', {
        message: 'Compiled successfully',
        level: 'info'
      })
      return byteCode
    },
    async deployContract(context, byteCode) {context.commit ('ADD_LOG', {message: 'Create transaction object'})
      const payload = {callData: '', amount: 0, fee: 1}
      const data = await client.contracts.getCreateTx (byteCode, context.getters.pubKey, payload)
      context.commit ('ADD_LOG', {message: 'Sign and send transaction'})
      client.tx.sendSigned (data.tx, context.getters.privateKey)
      context.commit ('ADD_LOG', {
        message: 'Waiting for contract creation transaction to be mined.',
        link: data['tx_hash']
      })
      const contractAddress = data['contract_address']
      context.commit('ADD_CONTRACT', {
        txHash: data['tx_hash'],
        contractAddress: contractAddress,
        byteCode: byteCode,
        status: 'pending'
      })
      const interval = setInterval (async () => {
        const transaction = await client.tx.getTransaction (data['tx_hash'])
        if (transaction['block_height'] !== -1) {
          context.commit(
            'ADD_LOG',
            {message: `The contract was deployed successfully in block ${transaction['block_height']}`}
          )
          context.commit('UPDATE_CONTRACT', {contractAddress, data: {status: 'deployed'}})
          clearInterval(interval)
        }
      }, 2000)
      return data
    }
  },
  getters: {
    storedKeys: (state) => state.keypair,
    pubKey: (state) => state.keypair && state.keypair.pub,
    privateKey: (state) => state.keypair && state.keypair.priv,
    isAuthenticated: (state) => state.authToken !== undefined,
    balance: (state) => state.balance,
    currentTopic: (state) => state.topic,
    log: (state) => state.log,
    openPreclaims: (state) => state.openPreclaims,
    openClaims: (state) => state.openClaims,
    transactions: (state) => state.transactions,
    account: (state, getters) => {
      return {
        pub: getters.pubKey,
        priv: getters.privateKey
      }
    },
    contracts: (state) => state.contracts
  }

})
