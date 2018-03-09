<template>
  <div class="contracts-editor">
    <div class="contracts-panel">
      <div id="compile-form-panel">
        <form id="compile-form" class="compile-form"
              @submit.prevent="onCompile">
          <ae-textarea @change="onSourceInput" monospace
                       placeholder="Paste your contract source code"
                       v-model="contractCode" required/>
        </form>
      </div>
      <div id="contract-control-area">
        <ae-switch
            class="switch"
            :choices="[
                { label: 'Compile/Deploy', value: 'compile' },
                { label: 'Call', value: 'call' }
              ]"
            v-model="interactionType"
        ></ae-switch>
        <template v-if="interactionType === 'compile'">
          <div id="deploy-form-panel">
            <form class="deploy-form" id="deploy-form"
                  @submit.prevent="onDeploy">
              <ae-label>Byte code</ae-label>
              <ae-textarea :readonly="true" monospace placeholder="Paste your contract byte code"
                           v-model="byteCode" required/>
            </form>
          </div>
          <div class="control-bar">
            <div class="buttons">
              <ae-button class="btn" form="compile-form" type="exciting"
                         value="Compile">Compile
              </ae-button>
              <ae-button class="btn" form="deploy-form"
                         :inactive="!pubKey || !byteCode || balance <= 0"
                         :type="pubKey ? 'dramatic': 'boring'" value="Deploy">
                Deploy
              </ae-button>
            </div>
          </div>
        </template>
        <template v-else-if="interactionType === 'call'">
          <form id="call-data-form" class="call-data-form"
                @submit.prevent="onComputeCallData">
            <select v-model="selectedContractAddress">
              <option v-for="contractAddress in Object.keys(contracts)" :value="contractAddress">
                Contract {{contractAddress}} ({{contracts[contractAddress].status}})
              </option>
            </select>
            <div class="d-flex d-row w-100 function-args">
              <ae-input placeholder="Enter function name" v-model="functionName"
                        required></ae-input>
              <ae-input placeholder="Enter comma separated function arguments"
                        v-model="functionArgs" required></ae-input>
            </div>
          </form>
          <div v-if="callResult">{{callResult}}</div>
          <div class="control-bar">
            <div class="buttons">
              <ae-button class="btn" form="call-data-form" :type="'dramatic'">Call function
              </ae-button>
            </div>
            <div v-if="!selectedContract && !byteCode">Please select or compile a contract</div>
            <div v-else-if="selectedContract && selectedContract.status === 'pending' || byteCode">
              You can only do static calls to a contract with status pending.
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
  import AeternityClient from 'aepp-sdk'
  import {
    AeButton,
    AeTextarea,
    AeSwitch,
    AeLabel,
    AeInput
  } from '@aeternity/aepp-components'
  import {mapGetters} from 'vuex'
  import config from '../config'

  const exampleContract = `
contract Identity =
  function main (x:int) = x`

  export default {
    name: 'ContractsEditor',
    components: {AeButton, AeTextarea, AeSwitch, AeLabel, AeInput},
    data() {
      return {
        contractCode: exampleContract,
        byteCode: '',
        status: '',
        client: undefined,
        initialised: false,
        interactionType: 'compile',
        contractAddress: '',
        functionArgs: '',
        functionName: '',
        selectedContractAddress: '',
        callResult: ''
      }
    },
    computed: {
      ...mapGetters (['pubKey', 'privateKey', 'balance', 'contracts']),
      selectedContract () {
        return this.contracts[this.selectedContractAddress]
      }
    },
    methods: {
      async onCompile() {
        this.$store.commit ('ADD_LOG', {
          message: 'Compiling Smart Contract',
          level: 'info'
        })
        try {
          this.byteCode = await this.$store.dispatch ('compileContract', this.contractCode)
        } catch (e) {
          this.$store.commit ('ADD_LOG', {
            message: `Something went wrong with the compilation. Reason ${e.data.reason}`,
            level: 'info'
          })
        }
      },
      async onDeploy() {
        const data = await this.$store.dispatch ('deployContract', this.byteCode)
        this.contractAddress = data['contract_address']
        this.selectedContractAddress = data['contract_address']
      },
      onSourceInput(e) {
        console.log (e.target)
      },
      async onComputeCallData() {
        if (this.selectedContract && this.selectedContract.status === 'pending' || this.byteCode) {
          this.callResult = await this.$store.dispatch ('callStaticContract', {
            byteCode: this.selectedContract && this.selectedContract.byteCode || this.byteCode,
            functionName: this.functionName,
            functionArgs: this.functionArgs.split (',')
          })
        } else {
          this.$store.dispatch ('callContract', {
            byteCode: this.selectedContract && this.selectedContract.byteCode,
            functionName: this.functionName,
            functionArgs: this.functionArgs.split (','),
            address: this.contractAddress
          })
        }
      }
    }
  }
</script>

<style lang="scss">
  .contracts-editor {
    padding-bottom: 175px;
    form {
      display: flex;
      flex-direction: column;
      textarea {
        width: 100%;
      }
    }
  }

  .contracts-panel {
    width: 100%;
    display: flex;
    justify-content: space-between;
    flex-direction: row;
  }

  .deploy-form {
    textarea {
      height: 68px;
      min-height: 0px !important;
      width: 100%;
    }
    input {
      margin: 16px;
    }
  }

  .compile-form {
    textarea {
      height: 360px;
      width: 100%;
      background-color: black;
      color: #fff !important;
      font-size: 18px;
    }
    input {
      margin: 16px;
    }
  }

  .server-form {
    input {
      margin: 2px;
    }
  }

  #deploy-form-panel {
    width: 100%;
    position: relative;
    .btn {
      position: absolute;
      right: 14px;
      top: 22px;
    }
  }

  #compile-form-panel {
    width: 100%;
    position: relative;
    .btn {
      position: absolute;
      right: 14px;
      top: 22px;
    }
  }

  #contract-control-area {
    margin-left: 16px;
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .switch {
    margin-right: auto;
  }

  .control-bar {
    margin-top: auto;
    padding: 16px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    button {
      margin-left: 8px;
    }
    button:first-child {
      margin-left: inherit;
    }
  }

  .call-data-form {
    padding: 8px;
    select {
      height: 45px;
    }
  }

  .function-args {
      input {
        width: 50%;
      }
    }
  .buttons {
    margin-right: 16px;
  }
</style>
