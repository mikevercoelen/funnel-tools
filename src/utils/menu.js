const inquirer = require('inquirer')
const { Task } = require('../constants/Task')

async function promptCreateApplicant () {
  const options = await inquirer.prompt([
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
      message: 'Terms',
      default: '12 Months'
    }
  ])

  return {
    task: Task.CREATE_APPLICANT,
    options
  }
}

async function promptApproveApplicant () {
  const options = await inquirer.prompt([
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
