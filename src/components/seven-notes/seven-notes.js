import React, { useEffect, useRef } from 'react'
import SingleNote from './components/singleNote';

const SevenNotes = () => {
    const c = useRef(null);
    const d = useRef(null);
    const e = useRef(null);
    const f = useRef(null);
    const g = useRef(null);
    const a = useRef(null);
    const b = useRef(null);
    const c5 = useRef(null);
    useEffect(() => {

        const handleKeyPress = (key) => {
            switch(key) {
                case "a":
                    c.current.click();
                    return; 
                case "s":
                    d.current.click();
                    return; 
                case "d":
                    e.current.click();
                    return; 
                case "f":
                    f.current.click();
                    return; 
                case "j":
                    g.current.click();
                    return; 
                case "k":
                    a.current.click();
                    return; 
                case "l":
                    b.current.click();
                    return; 
                case ";":
                    c5.current.click();
                    return; 
                default:
                    return;
            }
            console.log(e);
            // switch() {

            // }
        }

        window.addEventListener("keydown", (e) => {handleKeyPress(e.key)});

    }, []);

    return (
        <div>
            <div>
                <SingleNote note="C" ref={c} />
                <SingleNote note="D" ref={d} />
                <SingleNote note="E" ref={e} />
                <SingleNote note="F" ref={f} />
                <SingleNote note="G" ref={g} />
                <SingleNote note="A" ref={a} />
                <SingleNote note="B" ref={b} />
                <SingleNote note="C5" ref={c5} />
            </div>
        </div>
    );
}

export default SevenNotes