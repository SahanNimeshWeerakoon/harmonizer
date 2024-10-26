import React from 'react'

const SevenNotes = () => {
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

    const play7 = () => {
        const octane = [
            261.63,     // C
            293.66,     // D
            326,        // E
            342.015,    // F
            386,        // G
            440,        // A
            493.883,    // B
            523.251,    //C^
        ]

        octane.forEach((note, index) => {
            const interval = 500 * index
            setTimeout(() => {
                play(note);
            }, interval);
        });
    }

    return (
        <div>
            <div>
                <button onClick={() => {play(261.63)}}>Play C</button>
                <button onClick={() => {play(293.66)}}>Play D</button>
                <button onClick={() => {play(326)}}>Play E</button>
                <button onClick={() => {play(342.015)}}>Play F</button>
                <button onClick={() => {play(386)}}>Play G</button>
                <button onClick={() => {play(420)}}>Play A</button>
                <button onClick={() => {play(406.075)}}>Play B</button>
            </div>
            <div>
                <button onClick={() => { play7(); }}>Play 7</button>
            </div>
        </div>
    );
}

export default SevenNotes