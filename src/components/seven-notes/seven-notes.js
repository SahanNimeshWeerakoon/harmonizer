import React, { useEffect } from 'react'

const SevenNotes = () => {
    const play = (frequency) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        oscillator.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 1);   
    }

    useEffect(() => {
        const handleKeyPress = (e) => {
            console.log("key pressed", e);
        }

        window.addEventListener("keydown", handleKeyPress);

        return window.removeEventListener("keydown", handleKeyPress)
    }, []);

    return (
        <div>
            <div>
                <button onClick={() => {play(261.63)}}>Play C</button>
                <button onClick={() => {play(293.66)}}>Play D</button>
                <button onClick={() => {play(326)}}>Play E</button>
                <button onClick={() => {play(342.015)}}>Play F</button>
                <button onClick={() => {play(386)}}>Play G</button>
                <button onClick={() => {play(440)}}>Play A</button>
                <button onClick={() => {play(493.88)}}>Play B</button>
                <button onClick={() => {play(523.251)}}>Play C</button>
            </div>
        </div>
    );
}

export default SevenNotes