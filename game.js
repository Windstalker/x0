document.addEventListener("DOMContentLoaded", function() {
  'use strict';

  const CROSS = 1;
  const CIRCLE = 0;
  const EMPTY = -1;
  const MARKS = {
    [CROSS]: '\u2622',
    [CIRCLE]: '\u2623',
    [EMPTY]: ''
  };

  const game = {
    // pos: null,
    field: [],
    cellsDOM: [],
    fieldSize: 3,
    marksToWin: 3,
    playerTurn: undefined,
    winner: undefined,
    turnsCount: 0,
    winner: undefined,
    style: {
      cellSize: 100,
      marks: MARKS
    }
  }

  const body = document.body;
  const fieldEl = document.querySelector('.field');
  const gameFormEl = document.getElementById('gameoptions');
  const finishBox = document.querySelector('.finished');
  const reloadBtn = document.getElementById('reload');
  const winnerPlaceholder = finishBox.querySelector('.winner');

  init();

  function init() {
    gameFormEl.addEventListener('submit', startGame);
    reloadBtn.addEventListener('click', restartGame);

    toggle('start');
  }

  function startGame(e) {
    e.preventDefault();
    const formElements = this.elements;
    const size = +formElements.size.value;
    const marksToWin = +formElements.winCount.value;

    if (size < marksToWin) {
      return alert('Impossible to play with selected options. Please, change them');
    }

    game.fieldSize = !isNaN(size) ? size : game.fieldSize;
    game.marksToWin = !isNaN(marksToWin) ? marksToWin : game.marksToWin;

    createGameField();
    decideFirstTurn();

    toggle('game');
  }

  function endGame() {
    toggle('start');
  }

  function toggle(screenname) {
    const screens = {
      'start': gameFormEl,
      'game': fieldEl
    };

    Object.keys(screens).forEach(name => {
      screens[name].style.display = name === screenname ? 'block' : 'none'
    });
  }

  function handleFieldClick(event) {
    const target = event.target;
    const cellIndex = game.cellsDOM.indexOf(target);

    if (game.winner || cellIndex < 0) {
      return ;
    }

    if (game.field[cellIndex] !== EMPTY) {
      console.log('Forbidden: cell not empty');
      return ;
    }

    const coords = getXY(cellIndex);

    placeMark(game.playerTurn, cellIndex);
    game.turnsCount += 1;

    if (game.turnsCount >= game.field.length) {
      return announceDraw();
    }

    if (checkVictory(coords[0], coords[1], game.playerTurn)) {
      return announceVictory(game.playerTurn);
    }

    nextPlayerTurn();
  }

  // создаем игровое поле и одномерный array игры
  function createGameField() {
    const fieldWidth = game.fieldSize * game.style.cellSize;
    let fieldLength = game.fieldSize * game.fieldSize;

    fieldEl.removeEventListener('click', handleFieldClick, false);
    fieldEl.innerHTML = '';

    game.field = [];
    game.cellsDOM = [];

    while (fieldLength--) {
      const cell = createCell();

      game.field.push(EMPTY);
      game.cellsDOM.push(cell);
      fieldEl.appendChild(cell);
    }

    fieldEl.style.width = fieldWidth + 'px';
    fieldEl.addEventListener('click', handleFieldClick, false);

    return game.field;
  }

  function createCell(content) {
    const sizePx = game.style.cellSize + 'px';
    let cell = document.createElement('div');

    cell.classList.add('item');
    cell.style.width = sizePx;
    cell.style.height = sizePx;
    cell.style.lineHeight = sizePx;
    cell.style.fontSize = (game.style.cellSize / 2) + 'px';

    cell = fillCell(cell, content || EMPTY);

    return cell;
  }

  function fillCell(cell, mark) {
    cell.innerHTML = game.style.marks[mark];
    return cell;
  }

  // делаем ход
  function placeMark(mark, i) {
    game.field[i] = mark;
    game.cellsDOM[i] = fillCell(game.cellsDOM[i], mark);
  }

  function decideFirstTurn() {
    game.playerTurn = Math.random() < 0.5 ? CROSS : CIRCLE;

    return game.playerTurn;
  }

  function nextPlayerTurn() {
    game.playerTurn = game.playerTurn === CROSS ? CIRCLE : CROSS;

    return game.playerTurn;
  }

  function announceVictory(mark) {
    toggleFinishBox(game.style.marks[mark] + ' wins!', true);
    game.winner = mark;
  }

  function announceDraw() {
    toggleFinishBox('It\'s a draw!', true);
    game.winner = EMPTY;
  }

  function toggleFinishBox(msg, shown) {
    winnerPlaceholder.innerHTML = msg;
    finishBox.style.display = shown ? 'block' : 'none';
  }

  function restartGame() {
    location.reload(); // перезагружаем страницу
  }

  function getIndex(x, y) {
    return x + game.fieldSize * y;
  }

  function getXY(i) {
    const x = i % game.fieldSize;
    const y = Math.floor(i / game.fieldSize);

    return [x, y];
  }

  // проверка победителя
  function checkVictory(x, y, mark) {
    const minTurnsToWin = game.marksToWin * 2 - 1; // valid for two players turn-based game

    if (game.turnsCount < minTurnsToWin) {
      // there is no winner if turns count is not enough
      return false;
    }

    const minIndex = i => Math.max(i - game.marksToWin, 0);
    const maxIndex = i => Math.min(i + game.marksToWin, game.fieldSize - 1);
    const maxX = maxIndex(x);
    const maxY = maxIndex(y);
    const minX = minIndex(x);
    const minY = minIndex(y);

    const mainDiagonal = [minX, minY, maxX, maxY];
    const secondaryDiagonal = [maxX, minY, minX, maxY];
    const horizontal = [minX, y, maxX, y];
    const vertical = [x, minY, x, maxY];

    const result = [
      horizontal,
      vertical,
      mainDiagonal,
      secondaryDiagonal
    ].some(coords => checkLine.apply(null, coords.concat(mark)));

    return result;
  }

  function checkLine(x0, y0, x1, y1, mark) {
    const incX = x0 === x1 ? 0 : (x0 < x1 ? 1 : -1);
    const incY = y0 === y1 ? 0 : (y0 < y1 ? 1 : -1);
    const n = Math.abs(incX !== 0 ? (x1 - x0) : (y1 - y0));
    let i = 0;
    let counter = 0;

    for (i; i <= n; i++) {
      const cellIndex = getIndex(x0 + (i * incX), y0 + (i * incY));

      if (game.field[cellIndex] === mark) {
        counter += 1;
        if (counter >= game.marksToWin) return true;
      } else {
        counter = 0;
      }
    }

    return false;
  }
});
