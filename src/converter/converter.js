import React from 'react'

const Converter = () => {
    const play = (frequency) => {
        // Create a new audio context
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Create an oscillator node
        const oscillator = audioContext.createOscillator();

        // Set frequency for the C note (261.63 Hz)
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

        // Set the waveform type (sine is the most common for a smooth tone)
        oscillator.type = 'sine';

        // Connect oscillator to the audio context destination (speakers)
        oscillator.connect(audioContext.destination);

        // Start the oscillator
        oscillator.start();

        // Stop the oscillator after 1 second
        oscillator.stop(audioContext.currentTime + 1);   
    }
    return (
        <div>
            <button onClick={() => {play(261.63)}}>Play C</button>
            <button onClick={() => {play(293.66)}}>Play D</button>
            <button onClick={() => {play(326)}}>Play D</button>
            <button onClick={() => {play(261.63)}}>Play D</button>
            <button onClick={() => {play(261.63)}}>Play D</button>
            <button onClick={() => {play(261.63)}}>Play D</button>
            <button onClick={() => {play(261.63)}}>Play D</button>
        </div>
    );
}

export default Converter