import React, { useState, useEffect, useCallback } from 'react';

// Colores para diferentes tipos de palabras - definido fuera del componente
const wordColors = {
  horizontal: 'text-red-600',
  vertical: 'text-blue-600',
  diagonal: 'text-green-600',
  bottomUp: 'text-purple-600',
  topDown: 'text-amber-600'
};

const WordSearchGenerator = () => {
  // Dimensiones del tablero
  const [rows, setRows] = useState(15);
  const [cols, setCols] = useState(15);
  
  // Categorías de palabras
  const [horizontalWords, setHorizontalWords] = useState(['FUERZA', 'CONFIANZA', 'SUPERACION', 'TEMPLANZA', 'VOLUNTAD']);
  const [verticalWords, setVerticalWords] = useState(['CORAJE', 'TENACIDAD', 'FIRMEZA', 'FORTALEZA', 'POTENCIAL']);
  const [diagonalWords, setDiagonalWords] = useState(['RESILIENCIA', 'PODER', 'CAPACIDAD', 'ESPERANZA', 'ANIMO']);
  const [bottomUpWords, setBottomUpWords] = useState(['VALOR', 'VIRTUD', 'ADAPTACION', 'CONSTANCIA', 'RENOVACION']);
  const [topDownWords, setTopDownWords] = useState(['PACIENCIA', 'ENTEREZA', 'OPTIMISMO', 'RESISTENCIA', 'TRANSFORMACION']);
  
  // Estado del tablero
  const [board, setBoard] = useState([]);
  const [placedWords, setPlacedWords] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('horizontal');
  const [currentWord, setCurrentWord] = useState('');
  const [error, setError] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  
  // Inicializar tablero vacío con useCallback para evitar recreaciones
  const initializeBoard = useCallback(() => {
    const newBoard = Array(rows).fill().map(() => Array(cols).fill(''));
    for(let i = 0; i < rows; i++) {
      for(let j = 0; j < cols; j++) {
        newBoard[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    }
    setBoard(newBoard);
    setPlacedWords([]);
  }, [rows, cols]);
  
  // Efecto para inicializar el tablero cuando el componente se monta
  useEffect(() => {
    generatePuzzle(); // Usamos generatePuzzle en lugar de initializeBoard para colocar palabras
  }, []); // Solo se ejecuta al montar el componente
  
  // Efecto para regenerar el tablero cuando cambian las dimensiones
  useEffect(() => {
    // Este efecto se ejecuta cuando cambian las dimensiones, no cuando se monta el componente
    if (board.length > 0) { // Evitar la primera ejecución
      generatePuzzle();
    }
  }, [rows, cols]);
  
  // Función removeWord con useCallback
  const removeWord = useCallback((category, index) => {
    switch(category) {
      case 'horizontal':
        setHorizontalWords(prev => prev.filter((_, i) => i !== index));
        break;
      case 'vertical':
        setVerticalWords(prev => prev.filter((_, i) => i !== index));
        break;
      case 'diagonal':
        setDiagonalWords(prev => prev.filter((_, i) => i !== index));
        break;
      case 'bottomUp':
        setBottomUpWords(prev => prev.filter((_, i) => i !== index));
        break;
      case 'topDown':
        setTopDownWords(prev => prev.filter((_, i) => i !== index));
        break;
      default:
        break;
    }
  }, []);
  
  // Función addWord con useCallback
  const addWord = useCallback(() => {
    if (!currentWord.trim()) {
      setError('Por favor, ingresa una palabra');
      return;
    }
    
    const word = currentWord.toUpperCase();
    
    if (word.length > Math.min(rows, cols)) {
      setError(`La palabra es demasiado larga para el tablero (máximo ${Math.min(rows, cols)} letras)`);
      return;
    }
    
    let currentCategory = [];
    if (selectedCategory === 'horizontal') currentCategory = horizontalWords;
    else if (selectedCategory === 'vertical') currentCategory = verticalWords;
    else if (selectedCategory === 'diagonal') currentCategory = diagonalWords;
    else if (selectedCategory === 'bottomUp') currentCategory = bottomUpWords;
    else if (selectedCategory === 'topDown') currentCategory = topDownWords;
    
    if (currentCategory.includes(word)) {
      setError('Esta palabra ya está en la lista');
      return;
    }
    
    // Actualizar la categoría seleccionada
    switch(selectedCategory) {
      case 'horizontal':
        setHorizontalWords(prev => [...prev, word]);
        break;
      case 'vertical':
        setVerticalWords(prev => [...prev, word]);
        break;
      case 'diagonal':
        setDiagonalWords(prev => [...prev, word]);
        break;
      case 'bottomUp':
        setBottomUpWords(prev => [...prev, word]);
        break;
      case 'topDown':
        setTopDownWords(prev => [...prev, word]);
        break;
      default:
        break;
    }
    
    setCurrentWord('');
    setError('');
  }, [
    currentWord,
    rows,
    cols,
    selectedCategory,
    horizontalWords,
    verticalWords,
    diagonalWords,
    bottomUpWords,
    topDownWords
  ]);

  // Nota: Ya no necesitamos las funciones de colocación de palabras anteriores
  // Ya que ahora usamos las nuevas funciones placeWord* que trabajan directamente 
  // sobre un tablero temporal sin usar setState

  // Función para generar el puzzle usando los callbacks memorizados
  const generatePuzzle = useCallback(() => {
    // Primero limpiamos el tablero y creamos uno vacío (sin letras aleatorias)
    const emptyBoard = Array(rows).fill().map(() => Array(cols).fill(''));
    setBoard(emptyBoard);
    
    const allWords = [
      ...horizontalWords, 
      ...verticalWords, 
      ...diagonalWords, 
      ...bottomUpWords, 
      ...topDownWords
    ];
    
    // Ordenamos las palabras por longitud (las más largas primero)
    // para facilitar su colocación
    const sortedWords = [...allWords].sort((a, b) => b.length - a.length);
    
    // Mapa para seguimiento de palabras colocadas
    const wordTypeMap = new Map();
    horizontalWords.forEach(word => wordTypeMap.set(word, 'horizontal'));
    verticalWords.forEach(word => wordTypeMap.set(word, 'vertical'));
    diagonalWords.forEach(word => wordTypeMap.set(word, 'diagonal'));
    bottomUpWords.forEach(word => wordTypeMap.set(word, 'bottomUp'));
    topDownWords.forEach(word => wordTypeMap.set(word, 'topDown'));
    
    const placed = [];
    const workingBoard = [...emptyBoard];
    
    // Colocar cada palabra según su tipo
    for (const word of sortedWords) {
      const type = wordTypeMap.get(word);
      let result = null;
      
      // Crear un nuevo tablero temporal para cada intento
      const currentBoard = workingBoard.map(row => [...row]);
      setBoard(currentBoard);
      
      // Intentar colocar la palabra según su tipo
      if (type === 'horizontal') {
        result = placeWordHorizontal(word, currentBoard);
      } else if (type === 'vertical') {
        result = placeWordVertical(word, currentBoard);
      } else if (type === 'diagonal') {
        result = placeWordDiagonal(word, currentBoard);
      } else if (type === 'bottomUp') {
        result = placeWordBottomUp(word, currentBoard);
      } else if (type === 'topDown') {
        result = placeWordTopDown(word, currentBoard);
      }
      
      // Si la palabra se pudo colocar, actualizar el tablero de trabajo
      if (result) {
        placed.push(result);
        // Actualizar el tablero de trabajo con la nueva palabra
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            if (currentBoard[i][j] !== '') {
              workingBoard[i][j] = currentBoard[i][j];
            }
          }
        }
      }
    }
    
    // Rellenar los espacios vacíos con letras aleatorias
    const finalBoard = workingBoard.map(row => 
      row.map(cell => cell === '' ? String.fromCharCode(65 + Math.floor(Math.random() * 26)) : cell)
    );
    
    setBoard(finalBoard);
    setPlacedWords(placed);
    
    // Mostrar estadísticas en consola para depuración
    console.log(`Palabras colocadas: ${placed.length} de ${allWords.length}`);
    const missingWords = allWords.filter(word => !placed.some(p => p.word === word));
    if (missingWords.length > 0) {
      console.log('Palabras que no se pudieron colocar:', missingWords);
    }
  }, [
    rows, 
    cols, 
    horizontalWords, 
    verticalWords, 
    diagonalWords, 
    bottomUpWords, 
    topDownWords
  ]);
  
  // Funciones auxiliares para colocar palabras (sin setState para permitir varios intentos)
  const placeWordHorizontal = (word, board) => {
    const maxTries = 100;
    let tries = 0;
    
    while (tries < maxTries) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * (cols - word.length + 1));
      
      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        if (board[row][col + i] !== '' && board[row][col + i] !== word[i]) {
          canPlace = false;
          break;
        }
      }
      
      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          board[row][col + i] = word[i];
        }
        return { word, direction: 'horizontal', position: { row, col }, length: word.length };
      }
      
      tries++;
    }
    
    return null;
  };

  const placeWordVertical = (word, board) => {
    const maxTries = 100;
    let tries = 0;
    
    while (tries < maxTries) {
      const row = Math.floor(Math.random() * (rows - word.length + 1));
      const col = Math.floor(Math.random() * cols);
      
      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        if (board[row + i][col] !== '' && board[row + i][col] !== word[i]) {
          canPlace = false;
          break;
        }
      }
      
      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          board[row + i][col] = word[i];
        }
        return { word, direction: 'vertical', position: { row, col }, length: word.length };
      }
      
      tries++;
    }
    
    return null;
  };

  const placeWordDiagonal = (word, board) => {
    const maxTries = 100;
    let tries = 0;
    
    while (tries < maxTries) {
      const row = Math.floor(Math.random() * (rows - word.length + 1));
      const col = Math.floor(Math.random() * (cols - word.length + 1));
      
      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        if (board[row + i][col + i] !== '' && board[row + i][col + i] !== word[i]) {
          canPlace = false;
          break;
        }
      }
      
      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          board[row + i][col + i] = word[i];
        }
        return { word, direction: 'diagonal', position: { row, col }, length: word.length };
      }
      
      tries++;
    }
    
    return null;
  };

  const placeWordBottomUp = (word, board) => {
    const maxTries = 100;
    let tries = 0;
    
    while (tries < maxTries) {
      const row = Math.floor(Math.random() * (rows - word.length + 1)) + word.length - 1;
      const col = Math.floor(Math.random() * cols);
      
      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        if (board[row - i][col] !== '' && board[row - i][col] !== word[i]) {
          canPlace = false;
          break;
        }
      }
      
      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          board[row - i][col] = word[i];
        }
        return { word, direction: 'bottomUp', position: { row, col }, length: word.length };
      }
      
      tries++;
    }
    
    return null;
  };

  const placeWordTopDown = (word, board) => {
    const maxTries = 100;
    let tries = 0;
    
    while (tries < maxTries) {
      const row = Math.floor(Math.random() * (rows - word.length + 1));
      const col = Math.floor(Math.random() * (cols - word.length + 1)) + word.length - 1;
      
      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        if (board[row + i][col - i] !== '' && board[row + i][col - i] !== word[i]) {
          canPlace = false;
          break;
        }
      }
      
      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          board[row + i][col - i] = word[i];
        }
        return { word, direction: 'topDown', position: { row, col }, length: word.length };
      }
      
      tries++;
    }
    
    return null;
  };

  // Función para verificar si una celda debe ser resaltada
  const isHighlighted = useCallback((row, col) => {
    // Caso 1: Hay una palabra seleccionada específicamente
    if (selectedWord && placedWords && placedWords.length > 0) {
      const foundWord = placedWords.find(placed => placed.word === selectedWord);
      if (foundWord) {
        const { direction, position, length } = foundWord;
        
        if (direction === 'horizontal') {
          if (row === position.row && col >= position.col && col < position.col + length) {
            return { isHighlighted: true, color: wordColors.horizontal, isSelected: true };
          }
        } else if (direction === 'vertical') {
          if (col === position.col && row >= position.row && row < position.row + length) {
            return { isHighlighted: true, color: wordColors.vertical, isSelected: true };
          }
        } else if (direction === 'diagonal') {
          if (row - position.row === col - position.col && row >= position.row && row < position.row + length) {
            return { isHighlighted: true, color: wordColors.diagonal, isSelected: true };
          }
        } else if (direction === 'bottomUp') {
          if (col === position.col && row <= position.row && row > position.row - length) {
            return { isHighlighted: true, color: wordColors.bottomUp, isSelected: true };
          }
        } else if (direction === 'topDown') {
          if (row - position.row === position.col - col && row >= position.row && row < position.row + length) {
            return { isHighlighted: true, color: wordColors.topDown, isSelected: true };
          }
        }
      }
      return { isHighlighted: false };
    }
    
    // Caso 2: Mostrar todas las soluciones
    if (!showSolution) return { isHighlighted: false };
    
    if (placedWords && placedWords.length > 0) {
      for (const placedWord of placedWords) {
        const { direction, position, length } = placedWord;
        
        if (direction === 'horizontal') {
          if (row === position.row && col >= position.col && col < position.col + length) {
            return { isHighlighted: true, color: wordColors.horizontal };
          }
        } else if (direction === 'vertical') {
          if (col === position.col && row >= position.row && row < position.row + length) {
            return { isHighlighted: true, color: wordColors.vertical };
          }
        } else if (direction === 'diagonal') {
          if (row - position.row === col - position.col && row >= position.row && row < position.row + length) {
            return { isHighlighted: true, color: wordColors.diagonal };
          }
        } else if (direction === 'bottomUp') {
          if (col === position.col && row <= position.row && row > position.row - length) {
            return { isHighlighted: true, color: wordColors.bottomUp };
          }
        } else if (direction === 'topDown') {
          if (row - position.row === position.col - col && row >= position.row && row < position.row + length) {
            return { isHighlighted: true, color: wordColors.topDown };
          }
        }
      }
    }
    
    return { isHighlighted: false };
  }, [showSolution, placedWords, selectedWord]);

  // Función para renderizar listas de palabras
  const renderWordList = useCallback((category, words, color) => {
    return (
      <div className="mb-4">
        <h3 className={`font-bold ${color}`}>{category}:</h3>
        <ul className="list-disc pl-5">
          {words.map((word, index) => (
            <li key={index} className="flex justify-between items-center">
              <button 
                onClick={() => setSelectedWord(selectedWord === word ? null : word)}
                className={`text-left hover:underline ${selectedWord === word ? 'font-bold bg-green-100 px-1 rounded' : ''}`}
                type="button"
              >
                {word}
              </button>
              <button 
                onClick={() => removeWord(category.toLowerCase().replace(' ', ''), index)}
                className="text-red-500 ml-2"
                type="button"
              >
                x
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }, [removeWord, selectedWord]);

  return (
    <div className="p-4 flex flex-col lg:flex-row gap-4">
      <div className="lg:w-1/2 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Sopa de Letras: Resiliencia y Poder</h2>
        
        <div className="mb-4">
          <label className="block mb-2">Tamaño del Tablero:</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={rows}
              onChange={(e) => setRows(Math.min(20, Math.max(5, parseInt(e.target.value) || 5)))}
              className="w-20 p-1 border rounded"
              min="5"
              max="20"
            />
            x
            <input
              type="number"
              value={cols}
              onChange={(e) => setCols(Math.min(20, Math.max(5, parseInt(e.target.value) || 5)))}
              className="w-20 p-1 border rounded"
              min="5"
              max="20"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-2 mb-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
            <option value="diagonal">Diagonal</option>
            <option value="bottomUp">De Abajo hacia Arriba</option>
            <option value="topDown">De Arriba hacia Abajo</option>
          </select>
          
          <div className="flex">
            <input
              type="text"
              value={currentWord}
              onChange={(e) => setCurrentWord(e.target.value)}
              placeholder="Ingresa una palabra"
              className="flex-1 p-2 border rounded-l"
            />
            <button
              onClick={addWord}
              className="bg-blue-500 text-white px-4 py-2 rounded-r"
              type="button"
            >
              Añadir
            </button>
          </div>
          
          {error && <p className="text-red-500">{error}</p>}
        </div>
        
        <div className="flex justify-between gap-2 mb-4">
          <button
            onClick={generatePuzzle}
            className="bg-green-500 text-white px-4 py-2 rounded w-full"
            type="button"
          >
            Generar Sopa de Letras
          </button>
          
          <button
            onClick={() => {
              setShowSolution(!showSolution);
              setSelectedWord(null);
            }}
            className={`${showSolution ? 'bg-red-500' : 'bg-purple-500'} text-white px-4 py-2 rounded w-full`}
            type="button"
          >
            {showSolution ? 'Ocultar Solución' : 'Mostrar Solución'}
          </button>
        </div>
        
        {placedWords && (
          <div className="mb-4 text-sm text-gray-700">
            <p>Palabras colocadas: {placedWords.length} de {horizontalWords.length + verticalWords.length + diagonalWords.length + bottomUpWords.length + topDownWords.length}</p>
          </div>
        )}
        
        <div className="overflow-auto">
          <table className="border-collapse">
            <tbody>
              {board.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => {
                    const highlight = isHighlighted(rowIndex, colIndex);
                    return (
                      <td 
                        key={colIndex}
                        className={`w-8 h-8 text-center border ${
                          highlight.isHighlighted 
                          ? `${highlight.color} font-bold ${highlight.isSelected ? 'bg-green-200 animate-pulse' : showSolution ? 'bg-yellow-100' : ''}` 
                          : ''
                        }`}
                      >
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="lg:w-1/2 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Palabras a encontrar</h2>
        <p className="mb-4 text-sm italic text-gray-600">Haz clic en una palabra para resaltarla en la sopa de letras</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            {renderWordList('Horizontal', horizontalWords, wordColors.horizontal)}
            {renderWordList('Vertical', verticalWords, wordColors.vertical)}
            {renderWordList('Diagonal', diagonalWords, wordColors.diagonal)}
          </div>
          <div>
            {renderWordList('De Abajo hacia Arriba', bottomUpWords, wordColors.bottomUp)}
            {renderWordList('De Arriba hacia Abajo', topDownWords, wordColors.topDown)}
          </div>
        </div>
        
        {selectedWord && placedWords && placedWords.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="font-medium">
              <span className="font-bold">{selectedWord}</span> - 
              {(() => {
                const foundWord = placedWords.find(placed => placed.word === selectedWord);
                if (foundWord) {
                  const { direction, position } = foundWord;
                  return direction === 'horizontal' 
                    ? ` Horizontal (fila ${position.row + 1}, columna ${position.col + 1})` 
                    : direction === 'vertical'
                    ? ` Vertical (fila ${position.row + 1}, columna ${position.col + 1})` 
                    : direction === 'diagonal'
                    ? ` Diagonal (fila ${position.row + 1}, columna ${position.col + 1})` 
                    : direction === 'bottomUp'
                    ? ` De Abajo hacia Arriba (fila ${position.row + 1}, columna ${position.col + 1})` 
                    : ` De Arriba hacia Abajo (fila ${position.row + 1}, columna ${position.col + 1})`;
                }
                return ' no encontrada en el tablero';
              })()}
            </p>
          </div>
        )}
        
        {showSolution && placedWords && placedWords.length > 0 && (
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-bold text-lg text-center mb-2">¡Solución!</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {placedWords.map((placed, index) => (
                <p key={index} className={`${wordColors[placed.direction]} p-1 rounded`}>
                  <strong>{placed.word}</strong>: {placed.direction === 'horizontal' 
                    ? `Horizontal (fila ${placed.position.row + 1}, columna ${placed.position.col + 1})` 
                    : placed.direction === 'vertical'
                    ? `Vertical (fila ${placed.position.row + 1}, columna ${placed.position.col + 1})` 
                    : placed.direction === 'diagonal'
                    ? `Diagonal (fila ${placed.position.row + 1}, columna ${placed.position.col + 1})` 
                    : placed.direction === 'bottomUp'
                    ? `De Abajo hacia Arriba (fila ${placed.position.row + 1}, columna ${placed.position.col + 1})` 
                    : `De Arriba hacia Abajo (fila ${placed.position.row + 1}, columna ${placed.position.col + 1})`}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordSearchGenerator;