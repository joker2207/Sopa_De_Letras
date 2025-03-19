import React from 'react';
import './App.css';
import WordSearchGenerator from './components/WordSearchGenerator';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Generador de Sopa de Letras</h1>
      </header>
      <main>
        <WordSearchGenerator />
      </main>
    </div>
  );
}

export default App;