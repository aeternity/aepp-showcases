
const epochHost = process.env.VUE_APP_EPOCH_HOST || 'localhost'
const epochPort = process.env.VUE_APP_EPOCH_PORT || '3013'
const githubCallbackUrl = process.env.VUE_APP_AUTH_CALLBACK_URL || 'http://localhost:8080'
const githubClientId = process.env.VUE_APP_GITHUB_CLIENT_ID || 'deaf7192f036a43732f9'

const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:8000'

const config = {
  epochHost,
  epochPort,
  githubCallbackUrl,
  githubClientId,
  apiUrl
}

module.exports = config
