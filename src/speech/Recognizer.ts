import {loadModelAsNeeded} from "./languageModelUtil";
import SpeechSignaller from "./SpeechSignaller";
import {IEmptyCallback, IStringCallback} from "../types/callbacks";

import {KaldiRecognizer} from 'vosk-browser';
import {Microphone} from 'sl-web-audio';

interface InitResult {
  kaldiRecognizer:KaldiRecognizer;
  microphone:Microphone;
}

interface LastText {
  text:string,
  receivedTime:number
}

async function _init():Promise<InitResult> {

  const ENGLISH_PATH = 'vosk-model-small-en-us-0.15.tar.gz';
  const model = await loadModelAsNeeded(ENGLISH_PATH);

  const contextSampleRate = 44100; // Ideally, we get this from audioContext so that the microphone sample rate will match Kaldi. But for that you need some kind of popup that collects a user gesture.
  const kaldiRecognizer = new model.KaldiRecognizer(contextSampleRate);

  const _onReceiveAudio = (samples:Float32Array, sampleRate:number) => kaldiRecognizer.acceptWaveformFloat(samples, sampleRate);
  const microphone:Microphone = new Microphone(_onReceiveAudio);
  await microphone.init();
  microphone.disable();

  return { kaldiRecognizer, microphone };
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
  readyCount:number;

  constructor(onReady?:IEmptyCallback) {
    this.lastPartial = { text:'', receivedTime:-1 };
    this.speechSignaller = null;
    this.readyCount = 0;
    _init().then(({kaldiRecognizer, microphone}) => {
      this.kaldiRecognizer = kaldiRecognizer;
      this.microphone = microphone;
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

  mute() { this.microphone?.disable(); }
  unmute() { this.microphone?.enable(); }
  
  get isMuted() {
    return !this.microphone || !this.microphone.isRecording;
  }
}

export default Recognizer;