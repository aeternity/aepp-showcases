# aepp-showcases

This frontend application is meant to show the œternity showcases to the world and let users quickly become active users of the æternity blockchain.

## Configuration

In order to configure the app please create an `.env` file in the root directory with the following variables

```
VUE_APP_EPOCH_HOST=<YOUR EPOCH HOST>
VUE_APP_EPOCH_PORT=<YOUR EPOCH PORT>
VUE_APP_AUTH_CALLBACK_URL=<A FAUCET SERVER BASE URL>
VUE_APP_GITHUB_CLIENT_ID=<YOUR GITHUB OAUTH CLIENT ID>
VUE_APP_API_URL=<YOUR EPOCH API/MIDDLEWARE URL>
```

**Please make sure, that the endpoint `/v2/account/balance` is routed to the public epoch port.** The Faucet/middleware server does that by default so if you set up your server from https://github.com/aeternity/aepp-middleware you will not have to change anything. The feature request is addressed here https://www.pivotaltracker.com/story/show/156367049


## Install

```
npm install
```

## Build and copy files to your webserver root

```
npm run build
cp -R dist/* <YOUR WEBSERVER ROOT DIR>
```
