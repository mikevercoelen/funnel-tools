async function waitForSelector (selector, interval = 100, maxAttempts = 10) {
  let attempts = 0

  return new Promise((resolve, reject) => {
    const checkSelector = () => {
      const element = document.querySelector(selector)
      attempts++

      if (element) {
        resolve(element)
      } else if (attempts < maxAttempts) {
        setTimeout(checkSelector, interval)
      } else {
        reject(new Error(`Failed to find selector: ${selector}`))
      }
    }

    checkSelector()
  })
}

async function pollUntilTrue (fn, interval = 250, maxAttempts = 100) {
  let attempts = 0

  return new Promise((resolve, reject) => {
    const checkFn = async () => {
      attempts++

      try {
        const result = await fn()
        if (result) {
          resolve()
        } else if (attempts < maxAttempts) {
          setTimeout(checkFn, interval)
        } else {
          reject(new Error(`Failed to resolve function: ${fn.toString()}`))
        }
      } catch (error) {
        reject(error)
      }
    }

    checkFn()
  })
}

module.exports = {
  waitForSelector,
  pollUntilTrue
}
