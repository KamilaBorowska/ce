var env = process.env

var config = exports.config = {
    framework: 'jasmine2',
    specs: ['spec.js'],
}

if (env.SAUCE_USERNAME && env.SAUCE_ACCESS_KEY) {
    config.sauceSeleniumAddress = 'localhost:4445/wd/hub'
    config.sauceUser = env.SAUCE_USERNAME
    config.sauceKey = env.SAUCE_ACCESS_KEY
}
if (env.TRAVIS_BUILD_NUMBER) {
    process.capabilities = {
        'browserName': 'chrome',
        'tunnel-identifier': env.TRAVIS_BUILD_NUBMER,
        'build': env.TRAVIS_BUILD_NUMBER
    }
}
