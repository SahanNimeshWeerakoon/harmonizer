const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MIN_FREQUENCY = 70;
const MAX_FREQUENCY = 1100;
const FRAME_SIZE = 2048;
const HOP_SIZE = 1024;
const MIN_SEGMENT_SECONDS = 0.09;

const fileInput = document.querySelector('#audio-file');
const analyzeButton = document.querySelector('#analyze-button');
const clearButton = document.querySelector('#clear-button');
const fileMeta = document.querySelector('#file-meta');
const statusText = document.querySelector('#status');
const melodyNotes = document.querySelector('#melody-notes');
const thirdNotes = document.querySelector('#third-notes');
const fifthNotes = document.querySelector('#fifth-notes');
const playMelodyButton = document.querySelector('#play-melody');
const playThirdButton = document.querySelector('#play-third');
const playFifthButton = document.querySelector('#play-fifth');
const noteCount = document.querySelector('#note-count');
const durationText = document.querySelector('#duration');
const confidenceText = document.querySelector('#confidence');

let selectedFile = null;
let resultNotes = {
  melody: [],
  third: [],
  fifth: [],
};
let playbackAudioContext = null;
let playbackToken = 0;

fileInput.addEventListener('change', () => {
  selectedFile = fileInput.files[0] || null;
  analyzeButton.disabled = !selectedFile;
  clearButton.disabled = !selectedFile;
  fileMeta.textContent = selectedFile
    ? `${selectedFile.name} · ${formatBytes(selectedFile.size)}`
    : 'No file selected';
  setStatus(selectedFile ? 'Ready to analyze.' : 'Waiting for an audio file.');
});

analyzeButton.addEventListener('click', analyzeSelectedFile);
clearButton.addEventListener('click', clearResults);
playMelodyButton.addEventListener('click', () => playNoteSequence('melody'));
playThirdButton.addEventListener('click', () => playNoteSequence('third'));
playFifthButton.addEventListener('click', () => playNoteSequence('fifth'));

async function analyzeSelectedFile() {
  if (!selectedFile) return;

  setLoading(true);
  setStatus('Decoding audio...');

  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await selectedFile.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const samples = mixToMono(audioBuffer);

    setStatus('Finding melody pitches...');
    const analysis = detectMelody(samples, audioBuffer.sampleRate);
    const melody = analysis.notes.map((note) => note.name);
    const thirds = melody.map((note) => transposeNoteName(note, 4));
    const fifths = melody.map((note) => transposeNoteName(note, 7));
    resultNotes = { melody, third: thirds, fifth: fifths };

    renderNoteStrip(melodyNotes, melody);
    renderNoteStrip(thirdNotes, thirds);
    renderNoteStrip(fifthNotes, fifths);
    setPlaybackControls();

    noteCount.textContent = melody.length;
    durationText.textContent = `${audioBuffer.duration.toFixed(1)}s`;
    confidenceText.textContent = `${Math.round(analysis.pitchFrameRatio * 100)}%`;
    setStatus(
      melody.length
        ? 'Analysis complete.'
        : 'No stable melody notes were found. Try a clearer single-note recording.'
    );

    await audioContext.close();
  } catch (error) {
    console.error(error);
    setStatus('Could not analyze this audio file. Try another browser-supported file.');
  } finally {
    setLoading(false);
  }
}

async function playNoteSequence(kind) {
  const notes = resultNotes[kind];
  if (!notes.length) return;

  stopPlayback();
  const token = playbackToken;
  const strip = getNoteStrip(kind);
  const noteSeconds = 0.42;
  const gapSeconds = 0.04;
  const context = getPlaybackAudioContext();

  await context.resume();
  setPlaybackControls(true);

  for (let index = 0; index < notes.length; index += 1) {
    if (token !== playbackToken) break;

    highlightNote(strip, index);
    playTone(context, noteNameToFrequency(notes[index]), noteSeconds);
    await wait((noteSeconds + gapSeconds) * 1000);
  }

  if (token === playbackToken) {
    clearHighlights();
    setPlaybackControls(false);
  }
}

function stopPlayback() {
  playbackToken += 1;
  clearHighlights();
  setPlaybackControls(false);
}

function getPlaybackAudioContext() {
  if (!playbackAudioContext) {
    playbackAudioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  return playbackAudioContext;
}

function playTone(context, frequency, durationSeconds) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + durationSeconds + 0.02);
}

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function detectMelody(samples, sampleRate) {
  const frames = [];
  let pitchedFrames = 0;
  let totalFrames = 0;

  for (let offset = 0; offset + FRAME_SIZE <= samples.length; offset += HOP_SIZE) {
    totalFrames += 1;
    const frame = samples.subarray(offset, offset + FRAME_SIZE);
    const frequency = autoCorrelate(frame, sampleRate);

    if (!frequency || frequency < MIN_FREQUENCY || frequency > MAX_FREQUENCY) {
      frames.push(null);
      continue;
    }

    pitchedFrames += 1;
    frames.push(frequencyToMidi(frequency));
  }

  return {
    notes: collapseFramesToNotes(frames, sampleRate),
    pitchFrameRatio: totalFrames ? pitchedFrames / totalFrames : 0,
  };
}

function collapseFramesToNotes(frames, sampleRate) {
  const notes = [];
  const minFrames = Math.max(1, Math.round(MIN_SEGMENT_SECONDS / (HOP_SIZE / sampleRate)));
  let currentMidi = null;
  let currentCount = 0;

  for (const midi of frames) {
    const roundedMidi = Number.isFinite(midi) ? Math.round(midi) : null;

    if (roundedMidi === currentMidi) {
      currentCount += 1;
      continue;
    }

    pushSegment(notes, currentMidi, currentCount, minFrames);
    currentMidi = roundedMidi;
    currentCount = roundedMidi === null ? 0 : 1;
  }

  pushSegment(notes, currentMidi, currentCount, minFrames);
  return notes;
}

function pushSegment(notes, midi, count, minFrames) {
  if (midi === null || count < minFrames) return;

  const name = midiToNoteName(midi);
  const previous = notes[notes.length - 1];

  if (previous?.name === name) {
    previous.frames += count;
    return;
  }

  notes.push({ name, midi, frames: count });
}

function autoCorrelate(frame, sampleRate) {
  const rootMeanSquare = Math.sqrt(frame.reduce((sum, sample) => sum + sample * sample, 0) / frame.length);
  if (rootMeanSquare < 0.015) return null;

  const correlations = new Float32Array(frame.length);
  for (let lag = 0; lag < frame.length; lag += 1) {
    let correlation = 0;
    for (let index = 0; index < frame.length - lag; index += 1) {
      correlation += frame[index] * frame[index + lag];
    }
    correlations[lag] = correlation;
  }

  let bestLag = -1;
  let bestCorrelation = 0;
  const minLag = Math.floor(sampleRate / MAX_FREQUENCY);
  const maxLag = Math.ceil(sampleRate / MIN_FREQUENCY);

  for (let lag = minLag; lag <= maxLag && lag < correlations.length; lag += 1) {
    if (correlations[lag] > bestCorrelation) {
      bestCorrelation = correlations[lag];
      bestLag = lag;
    }
  }

  if (bestLag <= 0 || bestCorrelation < correlations[0] * 0.35) return null;
  return sampleRate / refineLag(correlations, bestLag);
}

function refineLag(correlations, lag) {
  const left = correlations[lag - 1] || correlations[lag];
  const center = correlations[lag];
  const right = correlations[lag + 1] || correlations[lag];
  const divisor = 2 * (2 * center - right - left);

  if (!divisor) return lag;
  return lag + (right - left) / divisor;
}

function mixToMono(audioBuffer) {
  const output = new Float32Array(audioBuffer.length);

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
    const channelData = audioBuffer.getChannelData(channel);
    for (let index = 0; index < channelData.length; index += 1) {
      output[index] += channelData[index] / audioBuffer.numberOfChannels;
    }
  }

  return output;
}

function frequencyToMidi(frequency) {
  return 69 + 12 * Math.log2(frequency / 440);
}

function midiToNoteName(midi) {
  const rounded = Math.round(midi);
  const octave = Math.floor(rounded / 12) - 1;
  const note = NOTE_NAMES[((rounded % 12) + 12) % 12];
  return `${note}${octave}`;
}

function transposeNoteName(noteName, semitones) {
  const match = noteName.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return noteName;

  const noteIndex = NOTE_NAMES.indexOf(match[1]);
  const octave = Number(match[2]);
  const midi = (octave + 1) * 12 + noteIndex + semitones;
  return midiToNoteName(midi);
}

function noteNameToFrequency(noteName) {
  const match = noteName.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return 440;

  const noteIndex = NOTE_NAMES.indexOf(match[1]);
  const octave = Number(match[2]);
  const midi = (octave + 1) * 12 + noteIndex;
  return 440 * 2 ** ((midi - 69) / 12);
}

function renderNoteStrip(element, notes) {
  element.classList.toggle('empty', notes.length === 0);
  element.textContent = '';

  if (!notes.length) {
    element.textContent = 'No notes yet';
    return;
  }

  const fragment = document.createDocumentFragment();
  notes.forEach((note, index) => {
    const chip = document.createElement('span');
    chip.className = 'note-chip';
    chip.dataset.noteIndex = String(index);
    chip.textContent = note;
    fragment.appendChild(chip);
  });
  element.appendChild(fragment);
}

function clearResults() {
  stopPlayback();
  selectedFile = null;
  resultNotes = {
    melody: [],
    third: [],
    fifth: [],
  };
  fileInput.value = '';
  fileMeta.textContent = 'No file selected';
  analyzeButton.disabled = true;
  clearButton.disabled = true;
  noteCount.textContent = '0';
  durationText.textContent = '0.0s';
  confidenceText.textContent = '0%';
  renderNoteStrip(melodyNotes, []);
  renderNoteStrip(thirdNotes, []);
  renderNoteStrip(fifthNotes, []);
  setPlaybackControls();
  setStatus('Waiting for an audio file.');
}

function setLoading(isLoading) {
  analyzeButton.disabled = isLoading || !selectedFile;
  analyzeButton.textContent = isLoading ? 'Analyzing...' : 'Analyze melody';
  setPlaybackControls(isLoading);
}

function setStatus(message) {
  statusText.textContent = message;
}

function setPlaybackControls(forceDisabled = false) {
  playMelodyButton.disabled = forceDisabled || !resultNotes.melody.length;
  playThirdButton.disabled = forceDisabled || !resultNotes.third.length;
  playFifthButton.disabled = forceDisabled || !resultNotes.fifth.length;
}

function getNoteStrip(kind) {
  return {
    melody: melodyNotes,
    third: thirdNotes,
    fifth: fifthNotes,
  }[kind];
}

function highlightNote(strip, activeIndex) {
  clearHighlights();
  strip
    .querySelector(`[data-note-index="${activeIndex}"]`)
    ?.classList.add('playing');
}

function clearHighlights() {
  document.querySelectorAll('.note-chip.playing').forEach((chip) => {
    chip.classList.remove('playing');
  });
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const sizeIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** sizeIndex).toFixed(sizeIndex ? 1 : 0)} ${units[sizeIndex]}`;
}
