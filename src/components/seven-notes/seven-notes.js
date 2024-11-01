import React, { useEffect } from 'react'
import SingleNote from './components/singleNote';

const SevenNotes = () => {
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
                <SingleNote note="C" ref={null} />
                <SingleNote note="D" ref={null} />
                <SingleNote note="E" ref={null} />
                <SingleNote note="F" ref={null} />
                <SingleNote note="G" ref={null} />
                <SingleNote note="A" ref={null} />
                <SingleNote note="B" ref={null} />
                <SingleNote note="C5" ref={null} />
            </div>
        </div>
    );
}

export default SevenNotes