const configDevelopment = require('./env/development')
const configProduction = require('./env/production')

function ConfigApp() {
    switch (process.env.NODE_ENV) {
        case 'development':
            return configDevelopment;

        case 'production':
            return configProduction;

        default:
            return configDevelopment;
    }

}

module.exports = new ConfigApp();

