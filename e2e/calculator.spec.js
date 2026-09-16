import { test, expect } from './fixtures'

// These specs run against the real Go API, so they assert the backend's own
// results and error strings rather than the mocked ones the unit tests use.

test('renders the calculator at the app root', async ({ page, calculator }) => {
  await expect(page).toHaveTitle('Calculator')
  await expect(calculator.display).toBeVisible()
})

test('evaluates a button-entered expression', async ({ calculator }) => {
  await calculator.press('7', '+', '8', '=')
  await expect(calculator.result).toHaveText('= 15')
})

test('applies operator precedence', async ({ calculator }) => {
  await calculator.press('2', '+', '3', '×', '4', '=')
  await expect(calculator.display).toHaveValue('2+3*4')
  await expect(calculator.result).toHaveText('= 14')
})

test('returns a fractional result for division', async ({ calculator }) => {
  await calculator.press('7', '÷', '2', '=')
  await expect(calculator.result).toHaveText('= 3.5')
})

test('evaluates parentheses typed into the display', async ({ calculator }) => {
  await calculator.type('2*(4+3)')
  await calculator.submit()
  await expect(calculator.result).toHaveText('= 14')
})

test('surfaces the divide-by-zero error', async ({ calculator }) => {
  await calculator.press('5', '÷', '0', '=')
  await expect(calculator.error).toHaveText('cannot divide by zero')
  await expect(calculator.result).toBeHidden()
})

test('surfaces the rejected-character error', async ({ calculator }) => {
  await calculator.type('2+$')
  await calculator.submit()
  await expect(calculator.error).toHaveText('calculator only accepts digits and +-*/')
  await expect(calculator.result).toBeHidden()
})

test('clears the expression and the last result', async ({ calculator }) => {
  await calculator.press('9', '+', '1', '=')
  await expect(calculator.result).toHaveText('= 10')

  await calculator.press('C')
  await expect(calculator.display).toHaveValue('')
  await expect(calculator.result).toBeHidden()
})
