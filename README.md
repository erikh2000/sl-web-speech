# sl-web-speech

This is a library for handling speech on web with a focus on covering interactive storytelling use cases. In particular, continuous realtime speech recognition that aims to match expected keywords.

## Features

* Stream audio from microphone to speech recognition (vosk-browser)
* Receive callbacks for recognized words, start of speech, and stop of speech
* Recognized word events are deduped
* Mute and unmute the microphone
* State management around waiting for browser permissions and enablements

## Licensing

My code is licensed with the MIT open source license.

But this project also contains a "models" directory which is separately licensed under Apache. See COPYING file in that directory and follow its terms before redistributing.

## Usage

Your web app will use 'sl-web-speech' as a dependency library. At time of writing, I've not published to NPM, so you'd need to `git clone` and use `npm link` or other solution to import into your web app. If anybody asks me to publish this on NPM, I'm willing to do that.

The files under "models" should be served from "/models" on your web server.

Example web app code is shown below.

### Listen for Speech
```javascript
import Recognizer from 'sl-web-speech';

/* Construct Recognizer *after* the user has performed some UI interaction in your web app. For security reasons, most 
   web browsers won't access microphone audio until there is a UI interaction happens. An easy way to accomplish this
   is to have a starting page that requires a button/link click to begin listening for speech. */
const recognizer = new Recognizer(onReady);

function onReady() {
  bindCallbacks(onPartial, onStartSpeaking, onStopSpeaking);
  recognizer.unmute();
}

function onPartial(speechText) {
  console.log(`User said "${speechText}".`);
}

function onStartSpeaking() {
  console.log('User started speaking.');
}

function onStopSpeaking() {
  console.log('User stopped speaking.');
}
```
