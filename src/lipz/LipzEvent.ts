import IIterableEvent from "../common/IIterableEvent";
import Viseme from "./visemes";

class LipzEvent implements IIterableEvent {
  private _time:number;
  private _viseme:Viseme;
  private _phoneme:string;

  constructor(time:number, viseme:Viseme, phoneme:string = '') {
    this._time = time;
    this._viseme = viseme;
    this._phoneme = phoneme;
  }

  getTime() { return this._time; }
  
  get viseme() { return this._viseme; }
  
  get phoneme()  { return this._phoneme; }
}

export default LipzEvent;