const configDevelopment = require('./evn/development')
const configProduction = require('./evn/production')

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

