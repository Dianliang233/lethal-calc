<script setup lang="ts">
import { MathfieldElement, convertLatexToMarkup } from 'mathlive'
import { ComputeEngine, type AssignValue } from '@cortex-js/compute-engine'
import { onMounted, onBeforeMount, ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'

const ce = new ComputeEngine()

ce.latexOptions.precision = 25
ce.declare('e', {
  domain: 'RealNumbers',
  constant: true,
  value: 'ExponentialE',
})
ce.declare('Ans', {
  domain: 'Anything',
})
ce.declare('M', {
  domain: 'Anything',
  value: 0,
})

onBeforeMount(() => {
  MathfieldElement.fontsDirectory = null
})

interface HistoryItem {
  id: string
  input: string
  result: string
  resultHtml: string
  time: number
  approx: boolean
}

const history = useLocalStorage<HistoryItem[]>('history', [])

const sidebar = ref(false)
const mfe = ref<MathfieldElement>()
const res = ref('')

const approx = ref(false)

onMounted(() => {
  if (mfe.value) {
    const mf = mfe.value

    mf.menuItems = []
    mf.applyStyle({
      fontFamily: 'none',
    })
    mf.focus()
  }
})

const handleInsert = (value: string) => {
  if (mfe.value) {
    mfe.value.insert(value)
    mfe.value.focus()
  }
}

const handleCommit = () => {
  if (mfe.value) {
    const mf = mfe.value

    let evaluated = ce.box(JSON.parse(mf.getValue('math-json'))!).evaluate()
    approx.value = false

    const latex = evaluated.latex.replace(/\\operatorname\{d\}/g, '\\mathrm{d}')

    // console.log(latex)

    res.value = convertLatexToMarkup(latex)

    history.value.unshift({
      id: crypto.randomUUID(),
      input: mf.value,
      result: latex,
      resultHtml: res.value,
      time: Date.now(),
      approx: false,
    })

    ce.assign('Ans', evaluated)
  }
}

const handleConvert = () => {
  if (mfe.value) {
    const mf = mfe.value
    approx.value = !approx.value

    const { latex } = approx.value ? ce.parse(mf.value).N() : ce.parse(mf.value).evaluate()

    res.value = convertLatexToMarkup(latex)
    history.value[0].result = latex
    history.value[0].resultHtml = res.value
    history.value[0].approx = approx.value
  }
}

const handleBackspace = () => {
  if (mfe.value) {
    const mf = mfe.value

    mf.executeCommand('deleteBackward')
  }
}

const handleAllClear = () => {
  if (mfe.value) {
    const mf = mfe.value

    mf.executeCommand('deleteAll')
  }

  res.value = ' '
}

const handleHistoryClick = (item: HistoryItem) => {
  if (mfe.value) {
    const mf = mfe.value

    mf.value = item.input
  }
}

const handleAssign = (id: string, value: AssignValue) => {
  ce.assign(id, value)
}

const handleMemoryAdd = () => {
  handleCommit()

  console.log(ce.parse('M').evaluate().latex)
  ce.assign('M', ce.box(['Add', 'M', 'Ans']).evaluate())
  console.log(ce.parse('M').evaluate().latex)
}
</script>

<template>
  <main
    class="grid transition w-screen h-screen"
    :style="{
      gridTemplateColumns: '1fr min-content',
    }"
  >
    <div class="transition grid grid-rows-10">
      <div class="row-span-3 grid grid-rows-5 p-3 relative">
        <RndBtn class="absolute bottom-1 right-1" @click="sidebar = !sidebar">
          <span
            class="i-mdi:chevron-left transition transition-all"
            :style="{
              transform: sidebar ? 'rotate(180deg)' : 'rotate(0deg)',
            }"
          />
        </RndBtn>

        <math-field
          @input="
            (e: InputEvent) => {
              if (e.inputType === 'insertLineBreak') handleCommit()
            }
          "
          class="row-span-4 w-full h-full bg-transparent border-none focus:outline-none text-5xl text-right"
          math-virtual-keyboard-policy="manual"
          ref="mfe"
        />

        <div
          class="row-span-1 w-full h-full bg-transparent border-none focus:outline-none text-3xl text-right"
          v-html="res"
        />
      </div>
      <InputArea
        class="row-span-7"
        @input="handleInsert"
        @convert="handleConvert"
        @commit="handleCommit"
        @all-clear="handleAllClear"
        @backspace="handleBackspace"
        @assign="handleAssign"
        @memory-add="handleMemoryAdd"
      />
    </div>

    <TransitionGroup
      tag="ul"
      name="history"
      :class="{
        'transition transition-all list-none h-screen p-0 m-0 flex flex-col-reverse overflow-y-auto border-l-solid border-zinc-200 dark:border-zinc-800': true,
        'w-[25vw]': sidebar,
        'w-0': !sidebar,
      }"
    >
      <li
        @click="() => handleHistoryClick(item)"
        class="border-t-solid px-3 py-2 border-zinc-200 dark:border-zinc-800"
        v-for="(item, index) in history"
        :key="item.id"
      >
        <div
          class="text-xl overflow-auto color-zinc-600 dark:color-zinc-300"
          v-html="convertLatexToMarkup(`${item.input}${item.approx ? '\\approx' : '='}`)"
        />
        <div class="text-right text-2xl overflow-auto" v-html="item.resultHtml" />

        <div class="mt-2 flex items-center justify-between">
          <div class="text-xs color-zinc-600 dark:color-zinc-300">
            {{ new Date(item.time).toLocaleString() }}
          </div>
          <button @click="history.splice(index, 1)" class="p-0 border-none">
            <span class="i-mdi:delete" />
          </button>
        </div>
      </li>
    </TransitionGroup>
  </main>
</template>

<style>
.history-move,
.history-enter-active,
.history-leave-active {
  transition: all 0.5s ease;
}

.history-enter-from,
.history-leave-to {
  opacity: 0;
  transform: translateX(1000px);
}

.history-leave-active {
  position: absolute;
}

math-field {
  --caret-color: theme('colors.indigo.600');
}

@media (prefers-color-scheme: dark) {
  math-field {
    --caret-color: theme('colors.indigo.400');
    --selection-background-color: theme('colors.indigo.300');
    --latex-color: theme('colors.indigo.300');
    --contains-highlight-background-color: theme('colors.indigo.800');
  }
}

math-field::part(menu-toggle) {
  display: none;
}

math-field::part(virtual-keyboard-toggle) {
  display: none;
}

math-field::part(content) {
  justify-content: end;
}
</style>
