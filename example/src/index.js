import {bindOnClick, setInnerText, enableButton, disableButton} from "./domUtil";
import {startListening, stopListening, isListening} from './businessLogic';

const TOGGLE_LISTEN_BUTTON = 'toggleListenButton';

function _onNewStatus(text) {
  setInnerText('statusMessage', text);
}

function _onToggleListenButtonClick() {
  if (isListening()) {
    stopListening();
    setInnerText(TOGGLE_LISTEN_BUTTON, 'Start Listening');
  } else {
    disableButton(TOGGLE_LISTEN_BUTTON);
    startListening(_onNewStatus).then(() => {
      setInnerText(TOGGLE_LISTEN_BUTTON, 'Stop Listening');
      enableButton(TOGGLE_LISTEN_BUTTON);
    });
  }
}

function _bindEvents() {
  bindOnClick(TOGGLE_LISTEN_BUTTON, _onToggleListenButtonClick);
}

function _init() {
  _bindEvents();
}

_init();