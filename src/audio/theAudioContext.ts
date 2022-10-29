let sourceId = 0;

const windowAny = window as any;

// TODO refactor to sl-web-audio library later.

// Reuse one AudioContext instance for browsers like Safari that cap how many instances can be created.
export function theAudioContext():AudioContext | null {
  try {
    if (!windowAny.__theAudioContext) {
      const AC = windowAny.AudioContext // Default
        || windowAny.webkitAudioContext // Safari and old versions of Chrome
        || null;
      windowAny.__theAudioContext = new AC();
    }
    // If the AudioContext isn't running that almost certainly means that the browser is waiting for 
    // a user gesture.
    if (windowAny.__theAudioContext.state !== 'running') {
      windowAny.__theAudioContext.resume();
    }
  
    return windowAny.__theAudioContext.state === 'running' ? windowAny.__theAudioContext : null;
  } catch {
    return null;
  }
}

// Call this instead of theAudioContext() if it's possible that a user has not yet made a UI gesture that
// would cause the browser to allow audio. This will also wait indefinitely if audio is not enabled for the
// website or is unavailable in the browser for some other reason.
export function waitForTheAudioContext():Promise<AudioContext> {
  return new Promise(resolve => {
    let ac = theAudioContext();
    if (ac) {
      resolve(ac);
      return;
    }
    
    const timer = setInterval(() => {
      ac = theAudioContext();
      if (ac) {
        clearInterval(timer);
        resolve(ac);
        return;
      }
    }, 100);
  });
}

export function createOfflineAudioContext(channelCount:number, sampleCount:number, sampleRate:number):OfflineAudioContext {
  const AC = window.OfflineAudioContext // Default
    || windowAny.webkitOfflineAudioContext // Safari and old versions of Chrome
    || null;
  return new AC(channelCount, sampleCount, sampleRate);
}

export function getSources():AudioBufferSourceNode[] {
  const ac = theAudioContext() as any;
  if (!ac) return [];
  if (!ac.sources) ac.sources = [];
  return ac.sources;
}

export function attachSource(source:AudioBufferSourceNode) {
  (source as any).id = ++sourceId;
  const sources = getSources();
  sources?.push(source);
  return sourceId;
}

export function releaseSource(source:AudioBufferSourceNode) {
  const ac = theAudioContext() as any;
  if (!ac) return;
  if (!ac.sources) ac.sources = [];
  ac.sources = ac.sources.filter((attachedSource:AudioBufferSourceNode) => attachedSource !== source);
}

export function clearSources() {
  const ac = theAudioContext() as any;
  if (!ac) return;
  ac.sources = [];
}

export function isAnythingPlaying() {
  const sources = getSources();
  return sources && sources.length;
}