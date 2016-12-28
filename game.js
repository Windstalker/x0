document.addEventListener("DOMContentLoaded", function() {
  'use strict';

  var MARKS = {};
  var CROSS = 1;
  var CIRCLE = 0;
  var EMPTY = -1;

  MARKS[CROSS] = 'X';
  MARKS[CIRCLE] = 'O';
  MARKS[EMPTY] = '';

  var game = {
    // pos: null,
    field: [],
    cellsDOM: [],
    fieldSize: 3,
    marksVictoryCount: 3,
    playerTurn: undefined,
    winner: undefined,
    style: {
      cellSize: 100,
      marks: MARKS
    }
  }

  var body = document.body;
  var fieldEl = document.querySelector('.field');
  var gameFormEl = document.getElementById('gameform');
  var finishBox = document.querySelector('.finished');
  var startBtn = document.getElementById('begin');
  var reloadBtn = document.getElementById('reload');

  init();

  function init() {
    startBtn.addEventListener('click', startGame);
    reloadBtn.addEventListener('click', restartGame);

    toggle('start');
  }

  function startGame() {
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

    if (cellIndex < 0) {
      return ;
    }

    console.log(cellIndex);
    var coords = getXY(cellIndex);
    console.log(coords);

    if (game.field[cellIndex] !== EMPTY) {
      console.log('Forbidden: cell not empty');
      return ;
    }

    placeMark(game.playerTurn, cellIndex);

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
    alert(game.style.marks[mark] + ' wins!');
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
  function checkVictory(y, x, mark) {
    // TODO: implement checkVictory
    return false;
  }
});
