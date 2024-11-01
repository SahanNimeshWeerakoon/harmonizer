import React, { useState } from "react";
import { extractNotesFromBuffer } from '../../common'
import * as Tone from 'tone'

function AudioNoteExtractor() {

    const [notesList, setNotesList] = useState([]);

    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const notesArray = await extractNotesFromBuffer(audioBuffer);
        console.log({ notesArray });
        playHarmony(notesArray);
    };

    const playHarmony = (notes) => {
        const now = Tone.now();
        const synth = new Tone.Synth().toDestination();
        notes.forEach((note, index) => {
            synth.triggerAttackRelease(note, "8n", now+(0.4143094841930116*index));
        });
    }

    return (
        <div>
        <h1>Upload an Audio File to Extract Notes</h1>
        <input type="file" accept="audio/*" onChange={handleFileUpload} />
        <button onClick={playHarmony}>Play</button>
        <div>
            <h2>Extracted Notes:</h2>
        </div>
        </div>
    );
}

export default AudioNoteExtractor;