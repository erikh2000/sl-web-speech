import Recognizer from 'sl-web-speech';

let recognizer = null;
let onNewStatus = null;

function _onPartial(speechText) {
  if (onNewStatus) onNewStatus(`You said "${speechText}".`);
}

function _onStartSpeaking() {
  if (onNewStatus) onNewStatus('You started speaking.');
}

function _onStopSpeaking() {
  if (onNewStatus) onNewStatus('You stopped speaking.');
}

export function startListening(newStatusCallback) {
  onNewStatus = newStatusCallback;
  return new Promise((resolve) => {
    if (recognizer) {
      recognizer.unmute();
      resolve();
    }
    
    function _onReady() {
      recognizer.bindCallbacks(_onPartial, _onStartSpeaking, _onStopSpeaking);
      recognizer.unmute();
      resolve();
    }
    recognizer = new Recognizer(_onReady);
  });
}

export function isListening() {
  if (recognizer) console.log(recognizer.isMuted);
  return recognizer ? !recognizer.isMuted : false;
}

export function stopListening() {
  if (recognizer) recognizer.mute();
}