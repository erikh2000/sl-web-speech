import {IEmptyCallback} from "../types/callbacks";

import {Model} from 'vosk-browser';
import {loadModelAsNeeded} from "./languageModelUtil";
import {RecognizerMessage} from "vosk-browser/dist/interfaces";

async function _init():Promise<Model> {
  const ENGLISH_PATH = 'vosk-model-small-en-us-0.15.tar.gz';
  return loadModelAsNeeded(ENGLISH_PATH);
}

export type WordTiming = {
  word:string,
  startTime:number,
  endTime:number
}

export type WordTimeline = WordTiming[];


type VoskWordResult = {
  conf:number,
  start:number,
  end:number,
  word:string
}

function _secsToMsecs(secs:number) { return Math.round(secs * 1000); }

function _messageToWordTimeline(message:any):WordTimeline {
  const timings:WordTiming[] = [];
  const results = message?.result?.result ?? [];
  results.forEach((result:VoskWordResult) => {
    timings.push({word:result.word, startTime:_secsToMsecs(result.start), endTime:_secsToMsecs(result.end)});
  });
  return timings;
}

function _padSamples(samples:Float32Array, sampleRate:number, padMSecs:number):Float32Array {
  const padSampleCount = sampleRate * (padMSecs / 1000);
  const sampleCount = samples.length + padSampleCount;
  const paddedSamples:Float32Array = new Float32Array(sampleCount);
  for(let sampleI = 0; sampleI < sampleCount; ++sampleI) {
    paddedSamples[sampleI] = sampleI < samples.length ? samples[sampleI] : 0;
  }
  return paddedSamples;
}

class WordTimelineExtractor {
  private _model:Model|null;

  constructor(onReady?:IEmptyCallback) { 
    this._model = null;
    _init().then(model => {
      this._model = model;
      if (onReady) onReady();
    });
  }
  
  async extract(audioBuffer:AudioBuffer):Promise<WordTimeline> {
    const { sampleRate } = audioBuffer;
    
    if (!this._model) throw Error('Called decodeSamples() before onReady() called.');
    const recognizer = new this._model.KaldiRecognizer(sampleRate);
    recognizer.setWords(true);
    
    const samples = audioBuffer.getChannelData(0); // TODO: Could get both channels for stereo and average to one array.
    const paddedSamples = _padSamples(samples, sampleRate, 2000); // HACK: Adding silence at end will trigger the result callback. Look for an update post 0.0.7 in vosk-browser for a better fix. 
    
    return new Promise<WordTiming[]>((resolve, _reject) => {
      recognizer.on( "result", _onResult);
      recognizer.acceptWaveformFloat(paddedSamples, sampleRate); // TODO test a wave file with silence in the middle to see if Vosk passes multiple results rather than one.
  
      function _onResult(message:RecognizerMessage) {
        const resultText = (message as any)?.result?.text;
        recognizer.remove();
        if (!resultText || !resultText.length) return;
        resolve(_messageToWordTimeline(message));
      }
    });
  }
}

export default WordTimelineExtractor;