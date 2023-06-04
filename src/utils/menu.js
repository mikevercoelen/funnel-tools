const inquirer = require('inquirer')
const { Task } = require('../constants/Task')
const { createEmail } = require('./generator')
const { info } = require('./log')

async function promptCreateApplicant () {
  const selectedOption = await inquirer.prompt([
    {
      type: 'list',
      name: 'woodhouseUrl',
      message: 'Woodhouse URL',
      choices: [{
        name: 'Mirror',
        value: 'mirror'
      }, {
        name: 'Staging',
        value: 'staging'
      }, {
        name: 'Production',
        value: 'production'
      }]
    }
  ])

  let url

  switch (selectedOption.woodhouseUrl) {
    case 'mirror':
      url = 'http://woodhouse-mirror-resapp-a.nestiostaging.com/6/welcome'
      break
    case 'production':
      url = 'https://apply.funnelleasing.com/6/welcome'
      break
    case 'staging':
      // eslint-disable-next-line no-case-declarations
      const { prId } = await inquirer.prompt([
        {
          type: 'input',
          name: 'prId',
          message: 'Please enter the PR ID (i.e. 123 NOT pr123)'
        }
      ])

      url = `http://woodhouse-pr${prId}.nestiostaging.com/6/welcome`
      break
  }

  info(`✅ Using URL: ${url}`)

  const options = await inquirer.prompt([
    {
      type: 'boolean',
      name: 'isHeadless',
      message: 'Hide browser?',
      default: true
    },
    {
      type: 'input',
      name: 'firstName',
      message: 'First Name',
      default: 'John'
    },
    {
      type: 'input',
      name: 'lastName',
      message: 'Last Name',
      default: 'Doe'
    },
    {
      type: 'email',
      name: 'email',
      message: 'Email',
      default: 'auto-generate'
    },
    {
      type: 'input',
      name: 'unit',
      message: 'Unit',
      default: 'auto-select'
    },
    {
      type: 'input',
      name: 'terms',
      message: 'Terms (in months)',
      default: '12'
    }
  ])

  if (options.email === 'auto-generate') {
    options.email = `${createEmail(options.firstName, options.lastName)}`
  }

  if (options.unit === 'auto-select') {
    options.unit = ''
  }

  if (options.woodhouseUrl === 'mirror') {
    options.woodhouseUrl = 'http://woodhouse-mirror-resapp-a.nestiostaging.com/6/welcome'
  }

  return {
    task: Task.CREATE_APPLICANT,
    options: {
      ...options,
      woodhouseUrl: url
    }
  }
}

async function promptApproveApplicant () {
  const options = await inquirer.prompt([
    {
      type: 'boolean',
      name: 'isHeadless',
      message: 'Hide browser?',
      default: false // TODO: set me to true
    },
    {
      type: 'input',
      name: 'chuckUrl',
      message: 'Chuck URL',
      default: 'https://chuck-pr22205.nestiostaging.com/' // TODO: strip me out
    },
    {
      type: 'email',
      name: 'email',
      message: 'Email',
      default: 'john.doe+e2o@funnelleasing.com' // TODO: strip me out
    }
  ])

  return {
    task: Task.APPROVE_APPLICANT,
    options
  }
}

async function promptMenu () {
  const task = await inquirer.prompt([
    {
      type: 'list',
      name: 'task',
      message: 'What would you like to do?',
      choices: [
        {
          name: 'Create Applicant',
          value: Task.CREATE_APPLICANT
        },
        {
          name: 'Approve Applicant',
          value: Task.APPROVE_APPLICANT
        }
      ]
    }
  ])

  switch (task.task) {
    case Task.CREATE_APPLICANT:
      return promptCreateApplicant()
    case Task.APPROVE_APPLICANT:
      return promptApproveApplicant()
  }
}

module.exports = {
  promptMenu
}
