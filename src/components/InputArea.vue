<script setup lang="ts">
import 'mathlive/static.css'
import { convertLatexToMarkup } from 'mathlive'
import { ref } from 'vue'
import type { AssignValue } from '@cortex-js/compute-engine'
import {
  breakpointsTailwind,
  onClickOutside,
  onKeyDown,
  onKeyUp,
  onLongPress,
  useBreakpoints,
} from '@vueuse/core'
import type { Ref } from 'vue'

const breakpoints = useBreakpoints(breakpointsTailwind)

const shift = ref(false)

const unshift = () => {
  if (!shift.value) return
  shift.value = false
}

const panel = ref(false)
const panelRef = ref()

onClickOutside(panelRef, () => {
  panel.value = false
})

const emit = defineEmits<{
  input: [value: string]
  commit: []
  convert: []
  backspace: []
  allClear: []
  assign: [id: string, value: AssignValue]
  memoryAdd: []
  cursorLeft: []
  cursorRight: []
}>()

const input = (value: string) => {
  emit('input', value)
}

const memoryReset = () => {
  emit('assign', 'M', 0)
}

onKeyDown('Shift', () => {
  shift.value = true
})

onKeyUp('Shift', () => {
  shift.value = false
})

const handleLongPress = (flag: Ref, action: () => any) => {
  if (flag.value) {
    action()
    setTimeout(handleLongPress, 70, flag, action)
  }
}

const leftRef = ref()
const leftLongPress = ref(false)
onLongPress(leftRef, () => {
  leftLongPress.value = true
  handleLongPress(leftLongPress, () => emit('cursorLeft'))
})

const rightRef = ref()
const rightLongPress = ref(false)
onLongPress(rightRef, () => {
  rightLongPress.value = true
  handleLongPress(rightLongPress, () => emit('cursorRight'))
})
const gtSm = breakpoints.greater('sm')
</script>
<template>
  <div
    class="md:grid md:grid-cols-9 pb-6 px-6 md:gap-6 flex relative"
    :class="{
      panel: 'panel-transition',
    }"
  >
    <TransitionGroup name="panel">
      <div
        v-if="panel || gtSm"
        @click="unshift"
        ref="panelRef"
        class="md:col-span-4 grid grid-rows-6 grid-cols-4 w-full gap-2 grid-auto-rows-[1fr] font-size-3xl"
      >
        <RndBtn :gray="!shift" :secondary="shift" @click.stop="shift = !shift">
          <span :class="{ 'i-mdi:arrow-up-bold': shift, 'i-mdi:arrow-up-bold-outline': !shift }" />
        </RndBtn>
        <template v-if="!shift">
          <RndBtn class="font-math italic" @click="input('x')">x</RndBtn>
          <RndBtn class="font-math italic" @click="input('y')">y</RndBtn>
          <RndBtn class="font-math italic" @click="input('\\pi')">&pi;</RndBtn>

          <RndBtn class="text-2xl" @click="input('\\frac{#@}{#?}')">
            <span v-html="convertLatexToMarkup('\\frac{\\square}{\\square}')" />
          </RndBtn>
          <RndBtn @click="input('\\sqrt{#@}')">
            <span v-html="convertLatexToMarkup('\\sqrt{\\square}')" />
          </RndBtn>
          <RndBtn @click="input('#@^2')">
            <span v-html="convertLatexToMarkup('\\square^2')" />
          </RndBtn>
          <RndBtn @click="input('#@^#?')">
            <span v-html="convertLatexToMarkup('\\square^\\square')" />
          </RndBtn>

          <RndBtn @click="input('\\ln #@')">
            <span v-html="convertLatexToMarkup('\\ln')" />
          </RndBtn>
          <RndBtn @click="input('\\log_#? #@')" class="text-xl">
            <span v-html="convertLatexToMarkup('\\log_\\square \\square')" />
          </RndBtn>
          <RndBtn class="text-2xl" @click="input('\\sin^{-1}(#@)')">
            <span v-html="convertLatexToMarkup('\\sin^{-1}')" />
          </RndBtn>
          <RndBtn @click="input('\\sin(#@)')">
            <span v-html="convertLatexToMarkup('\\sin')" />
          </RndBtn>

          <RndBtn @click="input('#@^{-1}')">
            <span v-html="convertLatexToMarkup('\\square^{-1}')" />
          </RndBtn>
          <RndBtn @click="input('#@!')">
            <span v-html="convertLatexToMarkup('\\square!')" />
          </RndBtn>
          <RndBtn class="text-2xl" @click="input('\\cos^{-1}(#@)')">
            <span v-html="convertLatexToMarkup('\\cos^{-1}')" />
          </RndBtn>
          <RndBtn @click="input('\\cos(#@)')">
            <span v-html="convertLatexToMarkup('\\cos')" />
          </RndBtn>

          <RndBtn @click="input('|#@|')">
            <span v-html="convertLatexToMarkup('|\\square|')" />
          </RndBtn>
          <RndBtn @click="input('#@\\degree')">
            <span v-html="convertLatexToMarkup('\\square\\degree')" />
          </RndBtn>
          <RndBtn class="text-2xl" @click="input('\\tan^{-1}(#@)')">
            <span v-html="convertLatexToMarkup('\\tan^{-1}')" />
          </RndBtn>
          <RndBtn @click="input('\\tan(#@)')">
            <span v-html="convertLatexToMarkup('\\tan')" />
          </RndBtn>

          <RndBtn class="text-2xl" @click="input('\\int_{#?}^{#?} #? \\,\\mathrm{d}x')">
            <span
              v-html="
                convertLatexToMarkup('\\int_{\\square}^{\\square} \\square', {
                  mathstyle: 'textstyle',
                })
              "
            />
          </RndBtn>
          <RndBtn class="text-2xl" @click="input('\\frac{\\mathrm{d}}{\\mathrm{d}x} #@ |_{x=#?}')">
            <span v-html="convertLatexToMarkup('\\frac{\\mathrm{d}}{\\mathrm{d}x}')" />
          </RndBtn>
          <RndBtn class="text-2xl" @click="input('\\times 10^#?')">
            <span v-html="convertLatexToMarkup('\\times 10^\\square')" />
          </RndBtn>
          <RndBtn class="font-math" @click="input('\\%')">%</RndBtn>
        </template>
        <template v-else>
          <RndBtn class="font-math" @click="input('A')">A</RndBtn>
          <RndBtn class="font-math" @click="input('B')">B</RndBtn>
          <RndBtn class="font-math" @click="input('e')">e</RndBtn>

          <RndBtn class="text-2xl" @click="input('{#@}\\frac{#?}{#?}')">
            <span v-html="convertLatexToMarkup('\\square\\frac{\\square}{\\square}')" />
          </RndBtn>
          <RndBtn @click="input('\\sqrt[3]{#@}')">
            <span v-html="convertLatexToMarkup('\\sqrt[3]{\\square}')" />
          </RndBtn>
          <RndBtn @click="input('#@^3')">
            <span v-html="convertLatexToMarkup('\\square^3')" />
          </RndBtn>
          <RndBtn @click="input('\\sqrt[#?]{#@}')">
            <span v-html="convertLatexToMarkup('\\sqrt[\\square]{\\square}')" />
          </RndBtn>

          <RndBtn @click="input('e^#1')">
            <span v-html="convertLatexToMarkup('e^\\square')" />
          </RndBtn>
          <RndBtn @click="input('\\log#@')">
            <span v-html="convertLatexToMarkup('\\log')" />
          </RndBtn>
          <RndBtn class="text-2xl" @click="input('\\sec^{-1}(#@)')">
            <span v-html="convertLatexToMarkup('\\sec^{-1}')" />
          </RndBtn>
          <RndBtn @click="input('\\sec(#@)')">
            <span v-html="convertLatexToMarkup('\\sec')" />
          </RndBtn>

          <RndBtn>7</RndBtn> <RndBtn>7</RndBtn>
          <RndBtn class="text-2xl" @click="input('\\csc^{-1}(#@)')">
            <span v-html="convertLatexToMarkup('\\csc^{-1}')" />
          </RndBtn>
          <RndBtn @click="input('\\csc(#@)')">
            <span v-html="convertLatexToMarkup('\\csc')" />
          </RndBtn>

          <RndBtn class="text-xl" @click="input('\\sum_{#?=#?}^{#?} #?')">
            <span
              v-html="
                convertLatexToMarkup('\\sum_{\\square=\\square}^{\\square} \\square', {
                  mathstyle: 'textstyle',
                })
              "
            />
          </RndBtn>
          <RndBtn class="text-xl" @click="input('\\prod_{#?=#?}^{#?} #?')">
            <span
              v-html="
                convertLatexToMarkup('\\prod_{\\square=\\square}^{\\square} \\square', {
                  mathstyle: 'textstyle',
                })
              "
            />
          </RndBtn>
          <RndBtn class="text-2xl" @click="input('\\cot^{-1}(#@)')">
            <span v-html="convertLatexToMarkup('\\cot^{-1}')" />
          </RndBtn>
          <RndBtn @click="input('\\cot(#@)')">
            <span v-html="convertLatexToMarkup('\\cot')" />
          </RndBtn>

          <RndBtn @click="input('\\lim_{#? \\to #?} #@')">
            <span
              class="text-xl"
              v-html="convertLatexToMarkup('\\lim_{\\square\\to\\square}\\square')"
            />
          </RndBtn>
          <RndBtn @click="input('\\infty')"
            ><span v-html="convertLatexToMarkup('\\infty')"
          /></RndBtn>
          <RndBtn @click="input('\\mathrm{d}#@')"
            ><span v-html="convertLatexToMarkup('\\mathrm{d}\\square')"
          /></RndBtn>
          <RndBtn>7</RndBtn>
        </template>
      </div>

      <div
        v-if="!panel || gtSm"
        class="md:col-span-5 w-full gap-2 font-size-4xl font-medium flex flex-col"
      >
        <div class="grid <md:grid-cols-8 grid-cols-7 gap-2">
          <RndBtn class="md:hidden font-size-5xl" @click="panel = true">
            <span class="i-mdi:calculator-variant" />
          </RndBtn>
          <RndBtn class="font-size-5xl" @click="input('#?\\coloneqq#@')">
            <span v-html="convertLatexToMarkup('\\coloneqq')" />
          </RndBtn>
          <RndBtn class="font-size-2xl md:font-size-3xl" @click="emit('memoryAdd')">M+</RndBtn>
          <RndBtn class="font-size-2xl md:font-size-3xl" @click="memoryReset">MR</RndBtn>
          <RndBtn @click="input('(')">(</RndBtn>
          <RndBtn @click="input(')')">)</RndBtn>
          <RndBtn ref="leftRef" @click="emit('cursorLeft')" @mouseup="leftLongPress = false">
            <span class="text-4xl i-mdi:chevron-left" />
          </RndBtn>
          <RndBtn ref="rightRef" @click="emit('cursorRight')" @mouseup="rightLongPress = false">
            <span class="text-4xl i-mdi:chevron-right" />
          </RndBtn>
        </div>

        <div class="grid grid-cols-5 gap-2 flex-auto grid-auto-rows-[1fr]">
          <RndBtn gray @click="input('7')">7</RndBtn>
          <RndBtn gray @click="input('8')">8</RndBtn>
          <RndBtn gray @click="input('9')">9</RndBtn>
          <RndBtn @click="emit('backspace')">
            <span class="i-mdi:backspace color-red-600 dark:color-red-500" />
          </RndBtn>
          <RndBtn @click="emit('allClear')">
            <span class="color-red-600 dark:color-red-500">AC</span>
          </RndBtn>

          <RndBtn gray @click="input('4')">4</RndBtn>
          <RndBtn gray @click="input('5')">5</RndBtn>
          <RndBtn gray @click="input('6')">6</RndBtn>
          <RndBtn class="font-size-5xl" secondary @click="input('×')">&times;</RndBtn>
          <RndBtn class="font-size-5xl" secondary @click="input('÷')">&div;</RndBtn>

          <RndBtn gray @click="input('1')">1</RndBtn>
          <RndBtn gray @click="input('2')">2</RndBtn>
          <RndBtn gray @click="input('3')">3</RndBtn>
          <RndBtn class="font-size-5xl" secondary @click="input('+')">&plus;</RndBtn>
          <RndBtn class="font-size-5xl" secondary @click="input('−')">&minus;</RndBtn>

          <RndBtn class="font-size-5xl font-bold" @click="input('.')">&centerdot;</RndBtn>
          <RndBtn gray @click="input('0')">0</RndBtn>
          <RndBtn class="font-size-5xl" @click="emit('convert')">
            <div class="i-mdi:compare-horizontal" />
          </RndBtn>
          <RndBtn @click="input('\\mathrm{Ans}')">Ans</RndBtn>
          <RndBtn primary class="font-size-5xl" @click="emit('commit')">=</RndBtn>
        </div>
      </div></TransitionGroup
    >
  </div>
</template>
<style>
.panel-move,
.panel-enter-active,
.panel-leave-active {
  transition: all 0.5s ease;
}

.panel-transition .panel-leave-to,
.panel-enter-from {
  opacity: 0;
  transform: translateX(50vw);
}

.panel-transition .panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateX(-50vw);
}

.panel-leave-active {
  position: absolute;
  top: 0;
  @apply bottom-6;
}
</style>
