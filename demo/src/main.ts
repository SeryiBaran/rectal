import { effect, ref } from '../../src/index'

window.addEventListener('DOMContentLoaded', () => {
  const countHeader = document.querySelector('#count')! as HTMLElement
  const countBtn = document.querySelector('#countBtn')! as HTMLButtonElement

  const count = ref(0)

  effect(() => {
    countHeader.textContent = `Counter: ${count.value}`
  })

  countBtn.addEventListener('click', () => {
    count.value++
  })
})
