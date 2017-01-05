document.addEventListener("DOMContentLoaded", function() {
  'use strict';

  var MARKS = {};
  var CROSS = 1;
  var CIRCLE = 0;
  var EMPTY = -1;

  MARKS[CROSS] = '\u2622';
  MARKS[CIRCLE] = '\u2623';
  MARKS[EMPTY] = '';

  var game = {
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

  var body = document.body;
  var fieldEl = document.querySelector('.field');
  var gameFormEl = document.getElementById('gameoptions');
  var finishBox = document.querySelector('.finished');
  var reloadBtn = document.getElementById('reload');
  var winnerPlaceholder = finishBox.querySelector('.winner');

  init();

  function init() {
    gameFormEl.addEventListener('submit', startGame);
    reloadBtn.addEventListener('click', restartGame);

    toggle('start');
  }

  function startGame(e) {
    e.preventDefault();
    var formElements = this.elements;
    var size = +formElements.size.value;
    var marksToWin = +formElements.winCount.value;

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
    var screens = {
      'start': gameFormEl,
      'game': fieldEl
    };

    Object.keys(screens).forEach(function(name) {
      screens[name].style.display = name === screenname ? 'block' : 'none'
    });
  }

  function handleFieldClick(event) {
    var target = event.target;
    var cellIndex = game.cellsDOM.indexOf(target);

    if (game.winner || cellIndex < 0) {
      return ;
    }

    if (game.field[cellIndex] !== EMPTY) {
      console.log('Forbidden: cell not empty');
      return ;
    }

    var coords = getXY(cellIndex);

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
    var fieldLength = game.fieldSize * game.fieldSize;
    var fieldWidth = game.fieldSize * game.style.cellSize;

    fieldEl.removeEventListener('click', handleFieldClick, false);
    fieldEl.innerHTML = '';

    game.field = [];
    game.cellsDOM = [];

    while (fieldLength--) {
      var cell = createCell();
      game.field.push(EMPTY);
      game.cellsDOM.push(cell);
      fieldEl.appendChild(cell);
    }

    fieldEl.style.width = fieldWidth + 'px';
    fieldEl.addEventListener('click', handleFieldClick, false);

    return game.field;
  }

  function createCell(content) {
    var cell = document.createElement('div');
    var sizePx = game.style.cellSize + 'px';

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
    var x = i % game.fieldSize;
    var y = Math.floor(i / game.fieldSize);

    return [x, y];
  }

  // проверка победителя
  function checkVictory(x, y, mark) {
    var minTurnsToWin = game.marksToWin * 2 - 1; // valid for two players turn-based game

    if (game.turnsCount < minTurnsToWin) {
      // there is no winner if turns count is not enough
      return false;
    }

    var minIndex = (i) => Math.max(i - game.marksToWin, 0);
    var maxIndex = (i) => Math.min(i + game.marksToWin, game.fieldSize - 1);
    var maxX = maxIndex(x);
    var maxY = maxIndex(y);
    var minX = minIndex(x);
    var minY = minIndex(y);

    var mainDiagonal = [minX, minY, maxX, maxY];
    var secondaryDiagonal = [maxX, minY, minX, maxY];
    var horizontal = [minX, y, maxX, y];
    var vertical = [x, minY, x, maxY];

    var result = [horizontal, vertical, mainDiagonal, secondaryDiagonal].some(function(coords) {
      return checkLine.apply(null, coords.concat(mark));
    });

    return result;
  }

  function checkLine(x0, y0, x1, y1, mark) {
    var incX = x0 === x1 ? 0 : (x0 < x1 ? 1 : -1);
    var incY = y0 === y1 ? 0 : (y0 < y1 ? 1 : -1);
    var i = 0;
    var n = Math.abs(incX !== 0 ? (x1 - x0) : (y1 - y0));
    var counter = 0;

    for (i; i <= n; i++) {
      var cellIndex = getIndex(x0 + (i * incX), y0 + (i * incY));

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
