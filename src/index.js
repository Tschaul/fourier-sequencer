import * as Tone from "Tone"
import * as teoria from "teoria"

console.log("Hello from TypeScript")

document.querySelector('button').addEventListener('click', async () => {
  await Tone.start()
  console.log('audio is ready aaa')

  const melodyAmps = [0.5, 0, 1, 0]
  const melodyPhases = [0, 0, 1, 0]

  const rythmAmps = [0, 1, 1, 0]
  const rythmPhases = [0, 0, 0, 0]

  const melodyUnits = [saw16, saw8, saw4, saw2]

  const melodySeries = buildSeries(melodyAmps, melodyPhases, melodyUnits)
  const rythmSeries = buildSeries(rythmAmps, rythmPhases, melodyUnits)

  const rootKey = teoria.note('a3')

  const scale = rootKey.scale('aeolian').notes()

  console.log({melodySeries, rythmSeries})
  console.log(scale.map(it => it.key()))

  const melody = melodySeries.map(it => scale[Math.round(it)].toString())

  const synth = new Tone.FMSynth().toMaster()

  const velocities = mul(rythmSeries, 1/(Math.max(...rythmSeries)))

  console.log(velocities)

  for (let index = 0; index <= melody.length; index++) {

    synth.triggerAttackRelease(melody[index], "8n", undefined, velocities[index]);

    await sleep(500)
  }



  var part = new Tone.Part(function(time, value){
    //the value is an object which contains both the note and the velocity
    synth.triggerAttackRelease(value.note, "8n", time, value.velocity);
  }, [{"time" : 0, "note" : "C3", "velocity": 0.9},
       {"time" : "0:2", "note" : "C4", "velocity": 0.5}
  ]).start(0);

})

function sleep(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
  })
}

function buildSeries(amps, phases, units) {

  let res = zeroes

  for (let unitIndex = 0; unitIndex < amps.length; unitIndex++) {

    const unit = units[unitIndex]
    const amp = amps[unitIndex]
    const phase = phases[unitIndex]

    // console.log({unit, amp, phase})
    const shiftedUnit = shift(unit, phase)
    // console.log({shiftedUnit})
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
  if (integer = 0) {
    return vec
  } else {
    return [...Array(5).keys()].reduce((prev, _) => {
      return arrayRotate(prev, integer < 0)
    }, vec)
  }
}

function arrayRotate(arr, reverse) {
  if (reverse) arr.unshift(arr.pop());
  else arr.push(arr.shift());
  return arr;
}

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