
var game = {}
game.arrayField = ['0', 0, '', 'x', 'x', 'x', '', '', 'x'];
game.sizeLength = 3;
game.sqWinCount = 3
game.checkStr = '';
game.checkArr = [];


function getCoords(y, x) {
    for (var i = 0; i < game.sizeLength; i++) {
        for (var j = 0; j < game.sizeLength; j++) {
            if (y == i && x == j) {
                return game.arrayField[i * game.sizeLength + j];
            }
        }
    }
}

function check(y, x) {
    for (var i = 0; i < game.sizeLength; i++) {
        if (getCoords(y, i) == 'x') {
            game.checkStr += 'y';
        } else {
            game.checkStr += 'n';
        }
    }
    game.checkArr.push(game.checkStr.search('y'.repeat(game.sqWinCount))); // game.checkStr.search('y'.repeat(c))
    game.checkStr = '';
    for (var i = 0; i < game.sizeLength; i++) {
        if (getCoords(i, x) == 'x') {
            game.checkStr += 'y';
        } else {
            game.checkStr += 'n';
        }
    }
    game.checkArr.push(game.checkStr.search('y'.repeat(game.sqWinCount))); // game.checkStr.search('y'.repeat(c))
    game.checkStr = '';
    for (var i = 0; i < game.sizeLength; i++) {
        if (getCoords(i, i) == 'x') {
            game.checkStr += 'y';
        } else {
            game.checkStr += 'n'
        }
    }
    game.checkArr.push(game.checkStr.search('y'.repeat(game.sqWinCount)));
    game.checkStr = '';

    for (var i = 0; i < game.checkArr.length; i++) {
        if (game.checkArr[i] > -1) {
            return 'win';
            break;
        } else {
            return null;
        }
    }
}

console.log(check(1, 1))
