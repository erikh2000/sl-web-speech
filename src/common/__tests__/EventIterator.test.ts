import EventIterator from "../EventIterator";
import IIterableEvent from "../IIterableEvent";

class BasicEvent implements IIterableEvent {
  time:number;
  type:string;
  constructor(time:number, type:string) {
    this.time = time;
    this.type = type;
  }
  
  getTime(): number {
    return this.time;
  }
}

describe("EventIterator", () => {
  it('constructs', () => {
    const iterator = new EventIterator<BasicEvent>([]);
    expect(iterator).toBeTruthy();
  });

  it('is at end after constructing with no events', () => {
    const iterator = new EventIterator<BasicEvent>([]);
    expect(iterator.isAtEnd).toBeTruthy();
  });
  
  it('constructs with events', () => {
    const events:BasicEvent[] = [new BasicEvent(0, "foo"), new BasicEvent(1, "bar"), new BasicEvent(2, "baz")];
    const iterator = new EventIterator<BasicEvent>(events);
    expect(iterator).toBeTruthy();
  });

  it('has more events immediately after construction with events', () => {
    const events:BasicEvent[] = [new BasicEvent(0, "foo"), new BasicEvent(1, "bar"), new BasicEvent(2, "baz")];
    const iterator = new EventIterator<BasicEvent>(events);
    expect(iterator.isAtEnd).toBeFalsy();
  });
  
  it("returns events seeking in order", () => {
    const events:BasicEvent[] = [new BasicEvent(0, "foo"), new BasicEvent(1, "bar"), new BasicEvent(2, "baz")];
    const iterator = new EventIterator<BasicEvent>(events);
    expect(iterator.next(0)).toEqual(events[0]);
    expect(iterator.next(1)).toEqual(events[1]);
    expect(iterator.next(2)).toEqual(events[2]);
  });

  it("returns no event when seeking at a point before any have occurred", () => {
    const events:BasicEvent[] = [new BasicEvent(1, "bar"), new BasicEvent(2, "baz")];
    const iterator = new EventIterator<BasicEvent>(events);
    expect(iterator.next(0)).toBeNull();
  });

  it("returns multiple events within an interval between previous and current seek position", () => {
    const events:BasicEvent[] = [new BasicEvent(1, "bar"), new BasicEvent(2, "baz")];
    const iterator = new EventIterator<BasicEvent>(events);
    expect(iterator.next(3)).toEqual(events[0]);
    expect(iterator.next(3)).toEqual(events[1]);
  });

  it("returns null after all events within an interval have been returned", () => {
    const events:BasicEvent[] = [new BasicEvent(1, "bar"), new BasicEvent(2, "baz")];
    const iterator = new EventIterator<BasicEvent>(events);
    iterator.next(3); // Fetches 0
    iterator.next(3); // Fetches 1
    expect(iterator.next(3)).toEqual(null);
  });
  
  it('adds events via the addEvent() method', () => {
    const fooEvent:BasicEvent = new BasicEvent(0, "foo");
    const iterator = new EventIterator<BasicEvent>([]);
    iterator.addEvent(fooEvent);
    expect(iterator.next(3)).toEqual(fooEvent);
  });
  
  it('clears events', () => {
    const fooEvent:BasicEvent = new BasicEvent(0, "foo");
    const iterator = new EventIterator<BasicEvent>([fooEvent]);
    iterator.clear();
    expect(iterator.next(3)).toEqual(null);
  });
  
  it('when seeking to an earlier position, returns the first event after that position', () => {
    const events:BasicEvent[] = [new BasicEvent(0, 'foo'), new BasicEvent(1, "bar"), new BasicEvent(2, "baz")];
    const iterator = new EventIterator<BasicEvent>(events);
    expect(iterator.next(0)).toEqual(events[0]);
    expect(iterator.next(2)).toEqual(events[1]);
    expect(iterator.next(0)).toEqual(events[0]);
  });
});