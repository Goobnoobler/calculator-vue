import { test as base, expect } from '@playwright/test'

class Calculator {
  constructor(page) {
    this.page = page
    this.display = page.locator('.display')
    this.result = page.locator('.result')
    this.error = page.locator('.error')
  }

  async press(...labels) {
    for (const label of labels) {
      await this.page.getByRole('button', { name: label, exact: true }).click()
    }
  }

  type(expression) {
    return this.display.fill(expression)
  }

  submit() {
    return this.display.press('Enter')
  }
}

export const test = base.extend({
  calculator: async ({ page }, use) => {
    await page.goto('/')
    await use(new Calculator(page))
  },
})

export { expect }
