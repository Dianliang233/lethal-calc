<script setup lang="ts">
import { MathfieldElement, convertLatexToMarkup } from 'mathlive'
import { ComputeEngine, type AssignValue } from '@cortex-js/compute-engine'
import { onMounted, onBeforeMount, ref } from 'vue'
import {
  breakpointsTailwind,
  onClickOutside,
  onStartTyping,
  useBreakpoints,
  useLocalStorage,
} from '@vueuse/core'
import { UseTimeAgo } from '@vueuse/components'

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

const breakpoints = useBreakpoints(breakpointsTailwind)

const history = useLocalStorage<HistoryItem[]>('history', [])

const sidebar = useLocalStorage('sidebar', false)
const sidebarRef = ref()
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

onStartTyping(() => {
  mfe.value?.focus()
})

onClickOutside(sidebarRef, () => {
  console.log(breakpoints.isSmaller('md'))
  if (sidebar.value && breakpoints.isSmaller('lg')) {
    sidebar.value = false
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
  <main class="lg:container lg:mx-auto transition h-screen flex">
    <div class="flex-1 transition grid grid-rows-10">
      <div class="row-span-4 p-6 relative">
        <math-field
          @input="
            (e: InputEvent) => {
              if (e.inputType === 'insertLineBreak') handleCommit()
            }
          "
          class="overflow-auto w-full h-full p-1 bg-transparent border-none focus:outline-none text-5xl text-right"
          math-virtual-keyboard-policy="manual"
          ref="mfe"
        />

        <div
          class="absolute max-w-full px-7 pb-8 overflow-auto right-0 bottom-0 bg-transparent border-none focus:outline-none text-4xl text-right"
          v-html="res"
        />

        <RndBtn class="absolute bottom-0 right-1" @click="sidebar = !sidebar">
          <span
            class="i-mdi:chevron-left transition transition-all"
            :style="{
              transform: sidebar ? 'rotate(180deg)' : 'rotate(0deg)',
            }"
          />
        </RndBtn>
      </div>
      <InputArea
        class="row-span-6"
        @input="handleInsert"
        @convert="handleConvert"
        @commit="handleCommit"
        @all-clear="handleAllClear"
        @backspace="handleBackspace"
        @assign="handleAssign"
        @memory-add="handleMemoryAdd"
        @cursor-left="
          () => {
            mfe?.executeCommand('moveToPreviousChar')
            mfe?.focus()
          }
        "
        @cursor-right="
          () => {
            mfe?.executeCommand('moveToNextChar')
            mfe?.focus()
          }
        "
      />
    </div>

    <TransitionGroup
      tag="ul"
      name="sidebar"
      ref="sidebarRef"
      :class="{
        'bg-white dark:bg-black break-anywhere w-3/4 md:w-2/5 <lg:absolute <lg:right-0 flex transition transition-all list-none h-screen p-0 m-0 flex-col-reverse overflow-y-auto border-zinc-200 dark:border-zinc-800': true,
        '<lg-translate-x-0 <lg-shadow-xl border-l-solid lg:w-1/4': sidebar,
        '<lg-translate-x-[100%] lg:w-0 lg:border-none': !sidebar,
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
            <UseTimeAgo v-slot="{ timeAgo }" :time="new Date(item.time)">
              {{ timeAgo }}
            </UseTimeAgo>
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
.sidebar-move,
.sidebar-enter-active,
.sidebar-leave-active {
  transition: all 0.5s ease;
}

.sidebar-enter-from,
.sidebar-leave-to {
  opacity: 0;
  transform: translateX(1000px);
}

.sidebar-leave-active {
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
