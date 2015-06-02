exports.config = {
    framework: 'jasmine2',
    specs: ['spec.js'],
}

if (process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY) {
    exports.config.sauceSeleniumAddress = 'localhost:4445/wd/hub'
    exports.config.sauceUser = process.env.SAUCE_USERNAME
    exports.config.sauceKey = process.env.SAUCE_ACCESS_KEY
}
