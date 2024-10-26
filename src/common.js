import * as Tone from 'tone'
import Pitchfinder from "pitchfinder";

export const getFirstHarmonyNote = (note) => {
    const noteFrequency = Tone.Frequency(note);
    // Add a major third interval (4 semitones) to get the harmony
    const harmonyFrequency = noteFrequency.transpose(4);
    
    // Convert back to note notation
    const harmonyNote = harmonyFrequency.toNote();
    return harmonyNote;
}

export const extractNotesFromBuffer = (audioBuffer) => {
    const detectPitch = Pitchfinder.AMDF();
    const float32Array = audioBuffer.getChannelData(0); // get audio data from first channel
    const sampleRate = audioBuffer.sampleRate;
    const notesArray = [];

    // Process each frame for pitch detection (e.g., every 1024 samples)
    for (let i = 0; i < float32Array.length; i += 1024) {
      const sampleChunk = float32Array.slice(i, i + 1024);
      const pitch = detectPitch(sampleChunk, { sampleRate });

      if (pitch) {
        const note = Tone.Frequency(pitch).toNote();
        notesArray.push(note);
      }
    }
    return notesArray
  };