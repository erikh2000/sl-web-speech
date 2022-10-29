import {IEmptyCallback} from "../types/callbacks";

// Determines whether user is speaking or not.
class SpeechSignaller {
  _isSpeaking:boolean;
  onStartSpeaking:IEmptyCallback;
  onStopSpeaking:IEmptyCallback;

  constructor(onStartSpeaking:IEmptyCallback, onStopSpeaking:IEmptyCallback) {
    this._isSpeaking = false;
    this.onStartSpeaking = onStartSpeaking;
    this.onStopSpeaking = onStopSpeaking;
  }

  onPartial(text:string) {
    const wasSpeaking = this._isSpeaking;
    this._isSpeaking = text.length > 0;
    if (this._isSpeaking === wasSpeaking) return;

    if (this._isSpeaking) {
      this.onStartSpeaking();
    } else {
      this.onStopSpeaking();
    }
  }
}

export default SpeechSignaller;