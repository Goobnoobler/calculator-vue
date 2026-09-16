<script setup>
import { ref } from 'vue'

const expression = ref('')
const result = ref(null)
const error = ref('')

function append(value) {
  result.value = null
  error.value = ''
  expression.value += value
}

function clear() {
  expression.value = ''
  result.value = null
  error.value = ''
}

async function calculate() {
  error.value = ''
  result.value = null
  try {
    const res = await fetch('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression: expression.value }),
    })
    if (!res.ok) {
      const message = (await res.text()).trim()
      error.value = message || `Request failed (${res.status})`
      return
    }
    const data = await res.json()
    result.value = data.result
  } catch {
    error.value = 'Could not reach calculator backend'
  }
}
</script>

<template>
  <div class="calculator-page">
    <div class="calculator">
      <input
        v-model="expression"
        class="display"
        type="text"
        placeholder="0"
        @keyup.enter="calculate"
      />
      <div class="feedback">
        <span v-if="result !== null" class="result">= {{ result }}</span>
        <span v-else-if="error" class="error">{{ error }}</span>
      </div>
      <div class="buttons">
        <button @click="append('7')">7</button>
        <button @click="append('8')">8</button>
        <button @click="append('9')">9</button>
        <button class="op" @click="append('/')">÷</button>

        <button @click="append('4')">4</button>
        <button @click="append('5')">5</button>
        <button @click="append('6')">6</button>
        <button class="op" @click="append('*')">×</button>

        <button @click="append('1')">1</button>
        <button @click="append('2')">2</button>
        <button @click="append('3')">3</button>
        <button class="op" @click="append('-')">-</button>

        <button class="clear" @click="clear">C</button>
        <button @click="append('0')">0</button>
        <button class="equals" @click="calculate">=</button>
        <button class="op" @click="append('+')">+</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calculator-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calculator {
  width: 280px;
  padding: 1.5rem;
  border-radius: 12px;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
}

.display {
  width: 100%;
  box-sizing: border-box;
  font-size: 1.5rem;
  text-align: right;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text);
}

.feedback {
  min-height: 1.5rem;
  text-align: right;
  font-size: 1rem;
  padding: 0.25rem 0.25rem 0.5rem;
}

.result {
  color: var(--color-heading);
}

.error {
  color: #e74c3c;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

button {
  padding: 0.75rem 0;
  font-size: 1.1rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
}

button:hover {
  background-color: var(--color-background-mute);
}

.op {
  color: hsla(160, 100%, 37%, 1);
}

.equals {
  background: hsla(160, 100%, 37%, 1);
  color: white;
  border-color: hsla(160, 100%, 37%, 1);
}

.clear {
  color: #e74c3c;
}
</style>
