import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import CalculatorView from '../CalculatorView.vue'

function mountCalculator(fetchImpl) {
  vi.stubGlobal('fetch', vi.fn(fetchImpl))
  const wrapper = mount(CalculatorView)
  return {
    wrapper,
    display: () => wrapper.find('.display').element.value,
    result: () => wrapper.find('.result'),
    error: () => wrapper.find('.error'),
    async press(...labels) {
      for (const label of labels) {
        await wrapper
          .findAll('button')
          .find((b) => b.text() === label)
          .trigger('click')
      }
      await flushPromises()
    },
    async type(expression) {
      await wrapper.find('.display').setValue(expression)
    },
  }
}

const ok = (result) => async () => ({ ok: true, json: async () => ({ result }) })
const failure = (status, body) => async () => ({ ok: false, status, text: async () => body })

afterEach(() => vi.unstubAllGlobals())

describe('CalculatorView', () => {
  it('appends digits and operators in order', async () => {
    const calc = mountCalculator(ok(0))
    await calc.press('1', '+', '2')
    expect(calc.display()).toBe('1+2')
  })

  it('sends ASCII operators, not the displayed glyphs', async () => {
    const calc = mountCalculator(ok(0))
    await calc.press('7', '÷', '8', '×', '9', '-', '0', '+')
    expect(calc.display()).toBe('7/8*9-0+')
  })

  it('clears the expression, result and error', async () => {
    const calc = mountCalculator(ok(3))
    await calc.type('1+2')
    await calc.press('=')
    expect(calc.result().exists()).toBe(true)

    await calc.press('C')
    expect(calc.display()).toBe('')
    expect(calc.result().exists()).toBe(false)
    expect(calc.error().exists()).toBe(false)
  })

  it('posts the expression and renders the result', async () => {
    const calc = mountCalculator(ok(3))
    await calc.type('1+2')
    await calc.press('=')

    expect(fetch).toHaveBeenCalledWith('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression: '1+2' }),
    })
    expect(calc.result().text()).toBe('= 3')
  })

  it('renders a zero result rather than treating it as empty', async () => {
    const calc = mountCalculator(ok(0))
    await calc.type('1-1')
    await calc.press('=')
    expect(calc.result().text()).toBe('= 0')
  })

  it('calculates on Enter in the display', async () => {
    const calc = mountCalculator(ok(3))
    await calc.type('1+2')
    await calc.wrapper.find('.display').trigger('keyup.enter')
    await flushPromises()
    expect(calc.result().text()).toBe('= 3')
  })

  it('shows the backend error message when the request fails', async () => {
    const calc = mountCalculator(failure(400, '  division by zero\n'))
    await calc.type('1/0')
    await calc.press('=')
    expect(calc.error().text()).toBe('division by zero')
    expect(calc.result().exists()).toBe(false)
  })

  it('falls back to the status code when the error body is empty', async () => {
    const calc = mountCalculator(failure(500, '   '))
    await calc.type('1+2')
    await calc.press('=')
    expect(calc.error().text()).toBe('Request failed (500)')
  })

  it('reports an unreachable backend', async () => {
    const calc = mountCalculator(() => Promise.reject(new TypeError('network')))
    await calc.type('1+2')
    await calc.press('=')
    expect(calc.error().text()).toBe('Could not reach calculator backend')
  })

  it('drops a stale result or error as soon as a new digit is typed', async () => {
    const calc = mountCalculator(ok(3))
    await calc.type('1+2')
    await calc.press('=')
    expect(calc.result().exists()).toBe(true)

    await calc.press('4')
    expect(calc.result().exists()).toBe(false)
    expect(calc.display()).toBe('1+24')
  })
})
