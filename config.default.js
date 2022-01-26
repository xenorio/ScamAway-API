module.exports = {

    // Port to listen on
    port: 3000,

    // URL path prefix (https://domain.com/api/)
    path: '/api',

    // Connection string for MongoDB database
    database: 'mongodb://localhost:27017/',

    // URL to API documentation
    docs: 'https://github.com/Xenorio/ScamAway-API/wiki',

    // Discord webhook for reports
    reporthook: 'https://discord.com/api/webhooks/...',

    // API key for authorizing admin actions
    // Do NOT give this to anyone!
    key: 'changeme',

    // API for external domain checking
    // Do not change if you don't know what you're doing
    external: 'https://phish.sinking.yachts/v2/all',

    // How often the external domain list should be refreshed (minutes)
    // Please keep this as high as possible. No reason to go lower than default, just puts unnecessary strain on the API.
    refreshInterval: 60

}