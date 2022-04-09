module.exports = {

    // Port to listen on
    port: 3000,

    // URL path prefix (https://domain.com/api/)
    path: '/api',

    // Connection string for MongoDB database
    database: 'mongodb://localhost:27017/',

    // Name of the database
    databaseName: 'ScamAway',

    // URL to API documentation
    docs: 'https://scamaway.xenorio.xyz',

    // Discord webhook for reports
    reporthook: 'https://discord.com/api/webhooks/...',

    // API key for authorizing admin actions
    // Do NOT give this to anyone!
    key: 'changeme',

    // API for external domain checking
    // Do not change if you don't know what you're doing
    external: 'https://phish.sinking.yachts/v2',

    // How often the external domain list should be refreshed (minutes)
    refreshInterval: 5,

    // Whether or not clients should be forced to identify themselves (User-Agent Header)
    forceIdentification: false,

    // Character limit for identification
    identifierLimit: 64,

    // In order to use report forwarding, you need to be a member of the Fish Fish project and put your API key here
    // If you don't know what that is, just leave this alone
    reportForwardKey: ""

}