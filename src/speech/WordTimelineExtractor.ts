import {IEmptyCallback} from "../types/callbacks";
import {loadModelAsNeeded} from "./languageModelUtil";

import {appendSilenceSamples, combineChannelSamples} from 'sl-web-audio';
import {Model} from 'vosk-browser';
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
    
    const samples = audioBuffer.numberOfChannels === 1 
      ? audioBuffer.getChannelData(0)
      : combineChannelSamples([audioBuffer.getChannelData(0), audioBuffer.getChannelData(1)]);
    const paddedSamples = appendSilenceSamples(samples, sampleRate, 2000); // HACK: Adding silence at end will trigger the result callback. Look for an update post 0.0.7 in vosk-browser for a better fix. 
    
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