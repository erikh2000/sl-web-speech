import {createModel, Model} from "vosk-browser";

let modelsBaseUrl = '/models/';

export async function setModelsBaseUrl(url:string) {
  modelsBaseUrl = url;  
}

export async function loadModelAsNeeded(filename:string):Promise<Model> {
  const windowUnknown:any = window;
  if (!windowUnknown.__kaldiModel) windowUnknown.__kaldiModel = await createModel(`${modelsBaseUrl}${filename}`);
  return windowUnknown.__kaldiModel as Model;
}