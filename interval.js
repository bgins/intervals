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
voiceZeroControl.onclick = function(event) {
    const frequency = voiceZeroInput.value | 0;
    if (voices[0].osc === null) {
        play(0, frequency);
        voiceZeroControl.className = "fa fa-stop button"
        voiceZeroDisplay.textContent = `Voice zero at ${frequency}Hz`;
    } else {
        stop(0);
        voiceZeroControl.className = "fa fa-play button"
        voiceZeroDisplay.textContent = "Voice zero off";
    }
    showCents();
};

voiceOneControl.onclick = function(event) {
    const frequency = voiceOneInput.value | 0;
    if (voices[1].osc === null) {
        play(1, frequency);
        voiceOneControl.className = "fa fa-stop button"
        voiceOneDisplay.textContent = `Voice one at ${frequency}Hz`;
    } else {
        stop(1);
        voiceOneControl.className = "fa fa-play button"
        voiceOneDisplay.textContent = "Voice one off";
    }
    showCents();
};

// update when inputs lose focus and a voice is playing
voiceZeroInput.onblur = function(event) {
    const frequency = voiceZeroInput.value | 0;
    if (voices[0].osc !== null) {
        stop(0);
        play(0, frequency);
        voiceZeroDisplay.textContent = `Voice zero at ${frequency}Hz`;
    }
    showCents();
}

voiceOneInput.onblur = function(event) {
    const frequency = voiceOneInput.value | 0;
    if (voices[1].osc !== null) {
        stop(1);
        play(1, frequency);
        voiceOneDisplay.textContent = `Voice one at ${frequency}Hz`;
    }
    showCents();
}

// calculate and display cents distance between voices
const showCents = function() {
    const frequencyOne = voices[0].frequency;
    const frequencyTwo = voices[1].frequency;
    if (frequencyOne > 0 && frequencyTwo > 0) {
        const centsDistance = Math.abs(1200 * Math.log2(frequencyOne / frequencyTwo));
        centsDisplay.textContent =  `Cents distance ${centsDistance}`;
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

// get a web audio context
const audioContext = new window.AudioContext();

// set up a gain node to output device
const masterGain = audioContext.createGain();
masterGain.gain.setValueAtTime(0.2, audioContext.currentTime); 
masterGain.connect(audioContext.destination);


// instanatiate a voice, route it, and play it
const play = function(i, frequency) {
    voices[i] = {osc: osc(frequency), frequency: frequency};
    voices[i].osc.connect(masterGain);
    voices[i].osc.start();
}

// stop a voice
const stop = function(i) {
    voices[i].osc.stop();
    voices[i] = {osc: null, frequency: 0};
}

// set up and return an oscillator
const osc = function(frequency) {
    let osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
    return osc;
}