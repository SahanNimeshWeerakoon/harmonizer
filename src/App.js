import './App.css';
import AudioNoteExtractor from './components/extract-notes-from-file';
import Converter from './converter/converter';

function App() {
  return (
    <div className="App">
      <AudioNoteExtractor />
    </div>
  );
}

export default App;
