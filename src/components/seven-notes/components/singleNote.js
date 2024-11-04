import { forwardRef } from 'react'

import NotesFreequencies from '../../../lib/notes-freequencies'

const SingleNote = forwardRef(({note}, ref) => {
    const play = () => {
        const frequency = NotesFreequencies[note];
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        oscillator.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);   
    }
    return (
        <button ref={ref} onClick={() => {play()}}>{note}</button>
    );
})

export default SingleNote;