import React, { useState, useRef } from 'react';
import lamejs from 'lamejs';

function AudioPlayer() {
  const [audioContext, setAudioContext] = useState(null);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const audioSource = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && audioContext) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = await audioContext.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);
    }
  };

  const playFirstHarmony = () => {
    if (audioBuffer) {
      // Stop any previously playing audio
      if (audioSource.current) {
        audioSource.current.stop();
      }

      // Create an audio source
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;

      // Connect to the destination (speakers)
      source.connect(audioContext.destination);

      // Set the starting point and duration (first 3 seconds, as an example)
      source.start(0, 0, 3);
      
      // Save the source to stop it later if needed
      audioSource.current = source;
    }
  };

  const initializeAudioContext = () => {
    if (!audioContext) {
      setAudioContext(new (window.AudioContext || window.webkitAudioContext)());
    }
  };

  const downloadMP3 = () => {
    if (audioBuffer) {
      const mp3Encoder = new lamejs.Mp3Encoder(1, audioBuffer.sampleRate, 128);
      const samples = audioBuffer.getChannelData(0).slice(0, audioBuffer.sampleRate * 3); // First 3 seconds

      const mp3Data = [];
      let sampleBlockSize = 1152;
      for (let i = 0; i < samples.length; i += sampleBlockSize) {
        const sampleChunk = samples.subarray(i, i + sampleBlockSize);
        const mp3buf = mp3Encoder.encodeBuffer(sampleChunk);
        if (mp3buf.length > 0) {
          mp3Data.push(new Uint8Array(mp3buf));
        }
      }

      const mp3buf = mp3Encoder.flush();
      if (mp3buf.length > 0) {
        mp3Data.push(new Uint8Array(mp3buf));
      }

      // Convert MP3 data to a Blob and create a download link
      const blob = new Blob(mp3Data, { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'first_harmony.mp3';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div>
      <h1>Harmony Player</h1>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <button onClick={initializeAudioContext}>Initialize Audio</button>
      <button onClick={playFirstHarmony} disabled={!audioBuffer}>Play First Harmony</button>
      <button onClick={downloadMP3} disabled={!audioBuffer}>Download MP3</button>
    </div>
  );
}

export default AudioPlayer;