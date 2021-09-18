import * as Tone from "Tone"
import * as teoria from "teoria"


const zeroes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
const ones = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]

const saw16 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1]
const saw8 = [0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2, 1]
const saw4 = [0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1]
const saw2 = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,]

const step16 = [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0]
const step8 = [1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0]
const step4 = [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0,]
const step2 = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,]

const periods = [2, 4, 8, 16];

let melodyAmps = [0, 0, 0, 0]
let melodyPhases = [0, 0, 0, 0]

let rythmAmps = [0, 0, 0, 0]
let rythmPhases = [0, 0, 0, 0]

let melodyUnits

let melodySeries
let rythmSeries

let melody
let synth
let velocities

let rootKey
let scale

async function ready() {
  await Tone.start()
  synth = new Tone.FMSynth().toMaster()

  console.log('audio is ready aaa')

  rootKey = teoria.note('a3')

  scale = rootKey.scale('aeolian').notes()

  calculateSequence()
}

function calculateSequence() {

  melodyUnits = [saw16, saw8, saw4, saw2]

  melodySeries = buildSeries(melodyAmps, melodyPhases, melodyUnits)
  rythmSeries = buildSeries(rythmAmps, rythmPhases, melodyUnits)

  melody = melodySeries.map(it => scale[Math.round(it)].toString())

  velocities = mul(rythmSeries, 1 / (Math.max(...rythmSeries)))

  for (const i of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]) {

    const elem = document.querySelector('#note_'+i)

    elem.style.transform = `translate(0, ${-1 * melodySeries[i] * 50}px)`
    elem.style.opacity = `${velocities[i]}`

  }

}

ready();

let interval
let bars
let index

document.querySelector('#play').addEventListener('click', async (event) => {

  console.log(event.target.id);


  bars = 0;
  index = 0;
  interval = setInterval(() => {
    console.log({ index, bars })
    synth.triggerAttackRelease(melody[index], "8n", undefined, velocities[index])
    index++;
    if (index >= melody.length) {
      index = 0;
      bars++;
    }
    document.querySelector('#index').textContent = '' + (index + 1)
  }, 300)

})

document.querySelector('#stop').addEventListener('click', async (event) => {

  console.log(event.target.id);
  clearInterval(interval);
  bars = 0;
  index = 0;
  document.querySelector('#index').textContent = '' + (index + 1)
})

function bindSeries(name, values) {
  for (const i of [0, 1, 2, 3]) {
    const s = periods[i]
    document.querySelector('#' + name + '_' + s).addEventListener('input', (event) => {

      values[i] = parseFloat(event.target.value);
      calculateSequence()
    })
  }
}

bindSeries('melodyAmps', melodyAmps)
bindSeries('melodyPhases', melodyPhases)
bindSeries('rythmAmps', rythmAmps)
bindSeries('rythmPhases', rythmPhases)

function buildSeries(amps, phases, units) {

  let res = zeroes

  for (let unitIndex = 0; unitIndex < amps.length; unitIndex++) {

    const unit = units[unitIndex]
    const amp = amps[unitIndex]
    const phase = Math.round(phases[unitIndex] / periods[unitIndex] * 16)

    if (phase != 0){
      console.log({unit, amp, phase})
    }
    const shiftedUnit = shift(unit, phase)
    if (phase != 0){
      console.log({shiftedUnit})
    }
    const ampedShiftedUnit = mul(shiftedUnit, amp)

    res = add(res, ampedShiftedUnit)
  }

  return res
}

function add(vec1, vec2) {
  return vec1.map((it, index) => it + vec2[index])
}

function mul(vec1, scalar) {
  return vec1.map((it, index) => it * scalar)
}

function shift(vec, integer) {
  if (integer == 0) {
    return vec
  } else {
    let result = [...vec];
    for (const i of [...Array(Math.abs(integer)).keys()]) {
      result = arrayRotate(result, integer < 0)
    }
    // console.log( integer, [...Array.of({length: integer})])
    // return [...Array.of({length: integer})].reduce((prev, _) => {
    //   return arrayRotate(prev, integer < 0)
    // }, vec)
    return result;
  }
}

window.shift = shift;

function arrayRotate(arr, reverse) {
  if (reverse) arr.unshift(arr.pop());
  else arr.push(arr.shift());
  return arr;
}