import {loadModelAsNeeded} from "./languageModelUtil";
import SpeechSignaller from "./SpeechSignaller";
import {DEFAULT_LANGUAGE_CODE} from "../common/languages";
import {IEmptyCallback, IStringCallback} from "../types/callbacks";

import {KaldiRecognizer} from 'vosk-browser';
import {Microphone, createSilenceSamples} from 'sl-web-audio';

interface InitResult {
  kaldiRecognizer:KaldiRecognizer;
  microphone:Microphone;
  silenceSamples: Float32Array;
}

interface LastText {
  text:string,
  receivedTime:number
}

// Ideally, we get this from audioContext so that the microphone sample rate will match Kaldi. But for that you need some kind of popup that collects a user gesture.
// TODO - change constructor and callers to pass in a sample rate.
const DEFAULT_SAMPLE_RATE = 44100;

// Amount of silence to append to force Kaldi to flush its buffer and return a final result.
const FORCE_RESULT_SILENCE_MSECS = 2000;

async function _init(languageCode:string):Promise<InitResult> {
  
  const model = await loadModelAsNeeded(languageCode);

  const contextSampleRate = DEFAULT_SAMPLE_RATE;
  const kaldiRecognizer = new model.KaldiRecognizer(contextSampleRate);
  const silenceSamples = createSilenceSamples(contextSampleRate, FORCE_RESULT_SILENCE_MSECS);
  const _onReceiveAudio = (samples:Float32Array, sampleRate:number) => kaldiRecognizer.acceptWaveformFloat(samples, sampleRate);
  const microphone:Microphone = new Microphone(_onReceiveAudio);
  await microphone.init();
  microphone.disable();

  return { kaldiRecognizer, microphone, silenceSamples };
}

const TEXT_COOLDOWN_TIME = 500; // To allow for speaking the same text twice in succession.
function _dedupeText(text:string, lastText:LastText) {
  const now = Date.now();
  if (text === lastText.text && now - lastText.receivedTime < TEXT_COOLDOWN_TIME) {
    lastText.receivedTime = now;
    return true;
  }
  lastText.text = text;
  lastText.receivedTime = now;
  return false;
}

function _onPartial(partial:string, lastPartial:LastText, onPartial:IStringCallback, speechSignaller:SpeechSignaller) {
  speechSignaller.onPartial(partial);
  if (!onPartial || !partial.length || _dedupeText(partial, lastPartial)) return;
  onPartial(partial);
}

function _onFinal(final:string, onFinal:IStringCallback) {
  if (!onFinal || !final.length) return;
  onFinal(final);
}

class Recognizer {
  kaldiRecognizer?:KaldiRecognizer;
  microphone?:Microphone;
  lastPartial:LastText;
  speechSignaller:SpeechSignaller | null;
  silenceSamples:Float32Array;
  readyCount:number;

  constructor(onReady?:IEmptyCallback, languageCode = DEFAULT_LANGUAGE_CODE) {
    this.lastPartial = { text:'', receivedTime:-1 };
    this.speechSignaller = null;
    this.silenceSamples = new Float32Array();
    this.readyCount = 0;
    _init(languageCode).then(({kaldiRecognizer, microphone, silenceSamples}) => {
      this.kaldiRecognizer = kaldiRecognizer;
      this.microphone = microphone;
      this.silenceSamples = silenceSamples;
      if (onReady) onReady();
    });
  }

  bindCallbacks(onPartial:IStringCallback, onStartSpeaking:IEmptyCallback, onStopSpeaking:IEmptyCallback, onFinal?:IStringCallback) {
    if (!this.kaldiRecognizer) throw Error('Tried to bind callbacks before recognizer ready.');
    const nextSpeechSignaller = new SpeechSignaller(onStartSpeaking, onStopSpeaking);
    this.speechSignaller = nextSpeechSignaller;
    const onPartialCurried = (message:any) => _onPartial(message.result.partial, this.lastPartial, onPartial, nextSpeechSignaller);
    this.kaldiRecognizer.on( "partialresult", onPartialCurried);
    if (onFinal) {
      const onFinalCurried = (message:any) => _onFinal(message.result.text, onFinal);
      this.kaldiRecognizer.on( "result", onFinalCurried);
    }
  }

  unbindCallbacks() {
    this.kaldiRecognizer?.on('partialresult', () => { });
  }
  
  forceResult() {
    this.kaldiRecognizer?.acceptWaveformFloat(this.silenceSamples, DEFAULT_SAMPLE_RATE);
  }

  mute() {
    this.forceResult(); // This allows recognizing a new result immediately after unmute() is called.
    this.microphone?.disable(); 
  }
  unmute() { this.microphone?.enable(); }
  
  get isMuted() {
    return !this.microphone || !this.microphone.isRecording;
  }
}

export default Recognizer;