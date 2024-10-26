import React from 'react'
import * as Tone from 'tone'

const Converter = () => {
    
    const play7 = () => {
        const now = Tone.now();
        // console.log({now})
        const synth = new Tone.Synth().toDestination();
        // synth.triggerAttackRelease("C4", "8n");
        // synth.triggerAttackRelease("C4", "8n", now);
        // synth.triggerAttackRelease("E4", "8n", now+1);
        synth.triggerAttackRelease("C4", "8n", now);
        synth.triggerAttackRelease(getFirstHarmonyNote("C4"), "8n", now+0.5);

    }

    const getFirstHarmonyNote = (note) => {
        const noteFrequency = Tone.Frequency(note);
        // Add a major third interval (4 semitones) to get the harmony
        const harmonyFrequency = noteFrequency.transpose(4);
        
        // Convert back to note notation
        const harmonyNote = harmonyFrequency.toNote();
        return harmonyNote;
    }
 
    return (
        <div>
            <div>
                <button onClick={() => { play7(); }}>Play 7</button>
            </div>
        </div>
    );
}

export default Converter