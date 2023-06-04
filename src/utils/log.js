const chalk = require('chalk')

function info (message) {
  console.log(chalk.bold.blue('[INFO]') + ' - ' + message)
}

function success (message) {
  console.log(chalk.bold.bgGreen('[SUCCESS]') + ' - ' + message)
}

module.exports = {
  info,
  success
}
