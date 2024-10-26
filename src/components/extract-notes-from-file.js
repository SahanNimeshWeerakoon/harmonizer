import React from "react";
import { extractNotesFromBuffer } from '../common'
import * as Tone from 'tone'

function AudioNoteExtractor() {

  const handleFileUpload = async (event) => {
    console.log("event", event.target.files[0], event);
    const file = event.target.files[0];
    if (!file) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const notesArray = await extractNotesFromBuffer(audioBuffer);
    console.log({notesArray});
    playHarmony(notesArray);
  };

  const playHarmony = (notesArray) => {
    const now = Tone.now();
    const synth = new Tone.Synth().toDestination();
    // synth.triggerAttackRelease("C4", "8n");
    // synth.triggerAttackRelease("C4", "8n", now);
    // synth.triggerAttackRelease("E4", "8n", now+1);
    // synth.triggerAttackRelease("C4", "8n", now);
    notesArray.forEach((note, index) => {
        // synth.triggerAttackRelease(getFirstHarmonyNote("C4"), "8n", now+0.5);
        synth.triggerAttackRelease(note, "8n", now+(0.0286006128702758*index));
    });
  }

  return (
    <div>
      <h1>Upload an Audio File to Extract Notes</h1>
      <input type="file" accept="audio/*" onChange={handleFileUpload} />
      <div>
        <h2>Extracted Notes:</h2>
      </div>
    </div>
  );
}

export default AudioNoteExtractor;