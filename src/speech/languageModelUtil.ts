import {createModel, Model} from "vosk-browser";

/*
 With the CORS allowances I've set up, you'll be able to use this URL while developing if your web app is hosted from 
 localhost:3000. (Just don't over-request like a freak, or I'll drop the allowance.) But when you deploy 
 your app to production, you'll need to host the model yourself. In this case, you can call setModelsBaseUrl() to set 
 the URL to your hosted model. The models are OSS-licensed from the Vosk project. Details at https://alphacephei.com/ 
 */
let modelsBaseUrl = 'https://shared.wisp.studio/vosk-models/';

type LanguageCodeToModelName = {
  [code:string]:string
};
const LANGUAGE_CODE_TO_MODEL_NAME:LanguageCodeToModelName = {
  'ca': 'vosk-model-small-ca-0.4.tar.gz',
  'cn': 'vosk-model-small-cn-0.3.tar.gz',
  'de': 'vosk-model-small-de-0.15.tar.gz',
  'en-us': 'vosk-model-small-en-us-0.15.tar.gz',
  'en-in': 'vosk-model-small-en-in-0.4.tar.gz',
  'es': 'vosk-model-small-es-0.3.tar.gz',
  'fa': 'vosk-model-small-fa-0.4.tar.gz',
  'fr': 'vosk-model-small-fr-pguyot-0.3.tar.gz',
  'it': 'vosk-model-small-it-0.4.tar.gz',
  'pt': 'vosk-model-small-pt-0.3.tar.gz',
  'ru': 'vosk-model-small-ru-0.4.tar.gz',
  'tr': 'vosk-model-small-tr-0.3.tar.gz',
  'vn': 'vosk-model-small-vn-0.3.tar.gz'
};

export async function setModelsBaseUrl(url:string) {
  modelsBaseUrl = url;  
}

export async function loadModelAsNeeded(languageCode:string):Promise<Model> {
  const modelProperty = `__kaldiModel-${languageCode}`;
  const modelFilename = LANGUAGE_CODE_TO_MODEL_NAME[languageCode];
  if (!modelFilename) throw new Error(`No model defined for language code ${languageCode}`); // LANGUAGE_CODE_TO_MODEL_NAME is probably out of sync with LANGUAGE_CODES.
  const modelUrl = `${modelsBaseUrl}${modelFilename}`;
  const windowUnknown:any = window;
  if (!windowUnknown[modelProperty]) windowUnknown[modelProperty] = await createModel(modelUrl);
  return windowUnknown[modelProperty] as Model;
}