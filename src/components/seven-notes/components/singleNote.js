import { useRef, forwardRef } from 'react'

const SingleNote = forwardRef(({frequency}, ref) => {
    const buttonRef = useRef(null);
    const play = (frequency) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        oscillator.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 1);   
    }
    return (
        <button ref={buttonRef} onClick={() => {play(frequency)}}>Play C</button>
    );
})

export default SingleNote;