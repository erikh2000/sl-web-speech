import IIterableEvent from "./IIterableEvent";

const CURSOR_START_POS = -1;
const PAST_END = 999999;

function _sortEvents(events:IIterableEvent[]) {
  events.sort((a:IIterableEvent, b:IIterableEvent) => a.getTime() - b.getTime());
}

// Class for retrieving events based on elapsed time. It is optimized for linear access of events from earliest
// to latest, but supports seeking to specific time offsets.
class EventIterator<T extends IIterableEvent> {
  private _intervalEvents:T[];
  private _intervalEndTime:number;
  private _events:T[];
  private _cursorI:number;

  // Events should not remove or modify time of event items after passing. Okay to add more events.
  constructor(events:T[]) {
    this._events = [...events];
    _sortEvents(this._events);
    this._intervalEvents = [];
    this._cursorI = CURSOR_START_POS;
    this._intervalEndTime = 0;
  }

  // Call if list has been cleared or items removed. This forces a search from beginning of events on next call to Next().
  private _reset():void {
    this._cursorI = CURSOR_START_POS;
    this._intervalEvents = [];
    this._intervalEndTime = 0;
  }

  addEvent(event:T) {
    this._events.push(event);
    _sortEvents(this._events);
    this._reset();
  }
  
  clear() {
    this._events = [];
    this._reset();
  }

  // Advance to a new event if enough time has elapsed. Returns null if no new event is available in the elapsed interval.
  next(offsetTime:number):T|null {
    const _isOffsetEarlierThanPreviousCall = () => this._cursorI > CURSOR_START_POS && 
        (this._cursorI >= this._events.length || this._events[this._cursorI].getTime() > offsetTime);
    const _isPastEnd = (f:number) => f + 1 > PAST_END;
    
    // cursorI will be at CURSOR_START_POS or the last event that was returned in a call to Next().
    if (_isOffsetEarlierThanPreviousCall()) this._reset();
    
    // A prior call may have left more events to return.
    if (offsetTime < this._intervalEndTime) {
      const event = this._intervalEvents.pop();
      return event ? event : null;
    }
    this._intervalEvents = [];
    
    // Find all events in the interval between previously returned event and the offset time, exclusive. 
    while (this._cursorI < this._events.length) {
      this._intervalEndTime = this._cursorI === this._events.length - 1 ? PAST_END : this._events[this._cursorI + 1].getTime();
      if (this._intervalEndTime > offsetTime) break;
      ++this._cursorI;
      this._intervalEvents.push(this._events[this._cursorI]);
    }
    if (_isPastEnd(this._intervalEndTime) && !this._intervalEvents.length) this._intervalEndTime = 0;
    
    const event = this._intervalEvents.pop();
    return event ? event : null;
  }
  
  get isAtEnd() {
    return this._cursorI === this._events.length - 1;
  }
}

export default EventIterator;