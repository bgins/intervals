'use strict';


// INIT 

// initialize voices for null checks
let voices = [
    {osc: null, frequency: 0}, 
    {osc: null, frequency: 0}
];

// get handles to ui elements
const voiceZeroInput = document.getElementById('voiceZeroInput');
const voiceOneInput = document.getElementById('voiceOneInput');
const voiceZeroControl = document.getElementById('voiceZeroControl')
const voiceOneControl = document.getElementById('voiceOneControl')
const voiceZeroDisplay = document.getElementById('voiceZeroDisplay')
const voiceOneDisplay = document.getElementById('voiceOneDisplay')
const centsDisplay = document.getElementById('centsDisplay')


// EVENTS

// set up play and pause event handlers
function makeOnclick(voice, input, control, display) {
    return function(event) {
        const frequency = input.value | 0;
        if (voices[voice].osc === null && frequency > 0) {
            play(voice, frequency);
            control.className = "fa fa-stop button"
        } else {
            if (voices[voice].osc !== null) {
                stop(voice);
            }
            control.className = "fa fa-play button"
        }
        showFreq(display, voice, frequency);
        showCents();
    };
}

voiceZeroControl.onclick = makeOnclick(
    0, voiceZeroInput, voiceZeroControl, voiceZeroDisplay);
voiceOneControl.onclick = makeOnclick(
    1, voiceOneInput, voiceOneControl, voiceOneDisplay);

// update when inputs lose focus and a voice is playing
function makeOnblur(voice, input, display) {
    return function(event) {
        const frequency = input.value | 0;
        if (voices[voice].osc !== null && frequency > 0) {
            stop(voice);
            play(voice, frequency);
            showFreq(display, voice, frequency);
        }
        showCents();
    };
}

voiceZeroInput.onblur = makeOnblur(0, voiceZeroInput, voiceZeroDisplay);
voiceOneInput.onblur = makeOnblur(1, voiceOneInput, voiceOneDisplay);

// display frequency information
const notes = [
    "A", "B♭", "B", "C", "D♭", "D",
    "E♭", "E", "F", "F♯", "G", "A♭",
];

function frequencyToKey(frequency) {
    return 69 + 12 * Math.log2(frequency / 440);
}

function keyToFrequency(key) {
    return 440 * Math.pow(2, (key - 69) / 12);
}

function ratioToCents(frequencyOne, frequencyTwo) {
    return 1200 * Math.log2(frequencyOne / frequencyTwo);
}

function showFreq(display, voice, frequency) {
    if (voices[voice].osc === null || frequency <= 0) {
        display.textContent = `Voice ${voice} off`;
    } else {
        const key = Math.floor(frequencyToKey(frequency) + 0.5);
        const note = notes[(key + 3) % 12];
        const octave = Math.floor((key + 3) / 12) - 2
        const key_frequency = keyToFrequency(key);
        var adjust = "";
        if (frequency != key_frequency) {
            const cents = ratioToCents(frequency, key_frequency);
            if (frequency > key_frequency) {
                adjust += "+";
            }
            adjust += `${cents.toFixed(2)}¢`;
        }
        display.textContent =
            `Voice ${voice} at ${frequency.toFixed(2)}Hz` +
            ` (${note}${octave}${adjust})`;
    }
}

// calculate and display cents distance between voices
const showCents = function() {
    const frequencyOne = voices[0].frequency;
    const frequencyTwo = voices[1].frequency;
    if (frequencyOne > 0 && frequencyTwo > 0) {
        const centsDistance =
              ratioToCents(frequencyTwo, frequencyOne);
        centsDisplay.textContent =
            `Cents distance ${centsDistance.toFixed(2)}`;
    } else {
        centsDisplay.textContent =  "";
    }
}


// AUDIO

//
// voices[0].osc ---
//                  \          
//                  masterGain --> destination
//                  /
// voices[1].osc ---
//

// must only start audio after a user gesture
var audioContext = null;
var masterGain = null;
function startAudio() {
    // only has to be done once
    if (audioContext !== null)
        return;

    // get a web audio context
    audioContext = new window.AudioContext();

    // set up a gain node to output device
    masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0.2, audioContext.currentTime); 
    masterGain.connect(audioContext.destination);
}

// instanatiate a voice, route it, and play it
function play(i, frequency) {
    startAudio();
    voices[i] = {osc: osc(frequency), frequency: frequency};
    voices[i].osc.connect(masterGain);
    voices[i].osc.start();
}

// stop a voice
function stop(i) {
    startAudio();
    voices[i].osc.stop();
    voices[i] = {osc: null, frequency: 0};
}

// set up and return an oscillator
function osc(frequency) {
    let osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
    return osc;
}
