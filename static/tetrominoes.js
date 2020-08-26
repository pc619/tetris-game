import F from "./Functional.js";
import grid from "./grid.js";

const {compose, randomInt, filter, deepCopy, transpose, flattenFilter} = F;

const Tetrominoes = Object.create(null);

// -------------------------------------------------------------------------- //
// -------------- TETROMINOES MODULE -------------- //
// -------------------------------------------------------------------------- //

/**
 *
 * Defines all of the different tetromino shapes.
 *
 * Handles:
 *      1. Randomly picking a random tetromino.
 *      2. The current tetromino matrix, its movements and rotations.
 */


const tetrominoZ = [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
];

const tetrominoS = [
    [0, 2, 2],
    [2, 2, 0],
    [0, 0, 0]
];

const tetrominoI = [
    [0, 3, 0, 0],
    [0, 3, 0, 0],
    [0, 3, 0, 0],
    [0, 3, 0, 0]
];

const tetrominoL = [
    [4, 0, 0],
    [4, 0, 0],
    [4, 4, 0]
];

const tetrominoJ = [
    [0, 0, 5],
    [0, 0, 5],
    [0, 5, 5]
];

const tetrominoO = [
    [6, 6],
    [6, 6]
];

const tetrominoT = [
    [0, 7, 0],
    [7, 7, 7],
    [0, 0, 0]
];

Tetrominoes.blockTypes = [
    tetrominoZ,
    tetrominoS,
    tetrominoI,
    tetrominoL,
    tetrominoJ,
    tetrominoO,
    tetrominoT
];

Tetrominoes.style = [
    {color: "#EE2733", border: "#EF0102"},
    {color: "#4EB748", border: "#02EF00"},
    {color: "#2CACE2", border: "#2CACE2"},
    {color: "#015A9D", border: "#0791fa"},
    {color: "#F0A001", border: "#F0A001"},
    {color: "#FDE102", border: "#D7D800"},
    {color: "#A000F0", border: "#bf40ff"}
];

// Random tetromino creator

Tetrominoes.randomBlock = () => Tetrominoes.blockTypes[randomInt(7)];

// Function to first handle current tetromino

const newTetromino = function (tetromino, pos) {
    const newTetro = tetromino.map(
        (row, rowIndex) => row.map(
            function (cell, colIndex) {
                return (
                    cell === 0
                    ? 0
                    : {"value": cell, "col": colIndex + pos, "row": rowIndex}
                );
            }
        )
    );
    return newTetro;
};

// Create a new random tetromino and convert it into an object to work with

Tetrominoes.new = function (gridLength) {
    const tetromino = Tetrominoes.randomBlock();
    const width = tetromino[0].length;
    const firstPos = Math.floor((gridLength - width) / 2);
    return newTetromino(tetromino, firstPos);
};

// Checking if tetromino is going out of grid

const outOfGridReducer = function (arr, gridLength) {
    const out = deepCopy(arr).reduce(
        (total, el) => (
            ((el.col < 0) || (el.col > (gridLength - 1)))
            ? (
                Math.abs(el.col) > Math.abs(total)
                ? el.col + total - total
                : total
            )
            : total
        ),
        0
    );
    return out;
};


const outFromBottomReducer = function (arr, gridHeight) {
    const out = deepCopy(arr).reduce(
        (total, el) => (
            el.row > gridHeight
            ? 1 + total - total
            : total
        ),
        0
    );
    return out;
};

Tetrominoes.outFromBottomGrid = function (tetromino, gridHeight) {
    const newTetro = flattenFilter(deepCopy(tetromino));
    return outFromBottomReducer(newTetro, gridHeight);
};

Tetrominoes.outOfGrid = function (tetromino, gridLength) {
    const newTetro = flattenFilter(deepCopy(tetromino));
    return outOfGridReducer(newTetro, gridLength);
};

// Checking if tetromino intersects with other elements in grid

const gameArrayReducer = function (gameArray, row, col) {
    return deepCopy(gameArray).reduce(
        (total, el) => (
            el.row === row
            ? (
                el.col === col
                ? 1 + total - total
                : total
            )
            : total
        ),
        0
    );
};

const intersectionReducer = function (arr, gameArray) {
    return arr.reduce(
        (total, el) => (
            gameArrayReducer(gameArray, el.row, el.col) === 0
            ? total
            : 1 + total - total
        ),
        0
    );
};

Tetrominoes.intersection = function (tetromino, gameArray) {
    const newTetro = flattenFilter(deepCopy(tetromino));
    return intersectionReducer(newTetro, gameArray);
};

// Rotating the tetromino

const flipH = (matrix) => matrix.slice().reverse();


const ninetyDegRotation = compose(transpose, flipH);

const rotateRowColValues = (cell, rowIndex, colIndex, length) => (
    cell === 0
    ? 0
    : {
        "value": cell.value,
        "col": cell.col + colIndex - rowIndex,
        "row": cell.row - (length - 1) + colIndex + rowIndex
    }
);

Tetrominoes.rotate = function (tetromino) {
    let rotatedTetromino = ninetyDegRotation(tetromino);
    return rotatedTetromino.map((row, rowIndex) => row.map(
        (cell, colIndex) => rotateRowColValues(
            cell,
            rowIndex,
            colIndex,
            tetromino.length
        )
    ));

};

const nNumLeft = function (n, start, currentTetro, length, gameArray) {
    const movedTetro = Tetrominoes.legalLeftPosChange(
        currentTetro,
        0,
        length,
        gameArray
    );

    start = start + 1;

    return (
        start === n
        ? movedTetro
        : nNumLeft(n, start, movedTetro, length, gameArray)
    );
};

const nNumRight = function (n, start, currentTetro, length, gameArray) {
    const movedTetro = Tetrominoes.legalRightPosChange(
        currentTetro,
        0,
        length,
        gameArray
    );

    start = start + 1;

    return (
        start === n
        ? movedTetro
        : nNumRight(n, start, movedTetro, length, gameArray)
    );
};

const moveN = function (out, currentTetro, length, gameArray) {
    return (
        out < 0
        ? Tetrominoes.legalRotate(
            nNumRight(Math.abs(out), 0, currentTetro, length, gameArray),
            0,
            length,
            gameArray
        )
        : Tetrominoes.legalRotate(
            nNumLeft(out - length + 1, 0, currentTetro, length, gameArray),
            0,
            length,
            gameArray
        )
    );

};

Tetrominoes.legalRotate = function (currentTetro, ignore, length, gameArray) {
    const movedTetromino = Tetrominoes.rotate(currentTetro);
    const out = Tetrominoes.outOfGrid(movedTetromino, length);
    return (
        Tetrominoes.intersection(movedTetromino, gameArray) === 0
        ? (
            out === 0
            ? movedTetromino
            : moveN(out, currentTetro, length, gameArray)
        )
        : currentTetro
    );

};

// Check if left/right/down movement is legal

const legal = function (movedTetro, currentTetro, length, gameArray) {
    return (
        Tetrominoes.intersection(movedTetro, gameArray) === 0
        ? (
            Tetrominoes.outOfGrid(movedTetro, length) === 0
            ? movedTetro
            : currentTetro
        )
        : currentTetro
    );
};

// Moving the tetromino left

Tetrominoes.leftPosChange = (currentTetro) => deepCopy(currentTetro).map(
    (row) => row.map(
        (cell) => (
            cell === 0
            ? 0
            : {"value": cell.value, "col": cell.col - 1, "row": cell.row}
        )
    )
);

Tetrominoes.legalLeftPosChange = function (currentTetro, ignore, length, gameArray) {
    const movedTetro = Tetrominoes.leftPosChange(currentTetro);
    return legal(movedTetro, currentTetro, length, gameArray);
};

// Moving the tetromino right

Tetrominoes.rightPosChange = (currentTetro) => deepCopy(currentTetro).map(
    (row) => row.map(
        (cell) => (
            cell === 0
            ? 0
            : {"value": cell.value, "col": cell.col + 1, "row": cell.row}
        )
    )
);

Tetrominoes.legalRightPosChange = function (currentTetro, ignore, length, gameArray) {
    const movedTetro = Tetrominoes.rightPosChange(currentTetro);
    return legal(movedTetro, currentTetro, length, gameArray);
};

// Moving the tetromino down

Tetrominoes.downPosChange = (currentTetro) => currentTetro.map(
    (row) => row.map(
        (cell) => (
            cell === 0
            ? 0
            : {"value": cell.value, "col": cell.col, "row": cell.row + 1}
        )
    )
);

Tetrominoes.legalDownPosChange = function (currentTetro, ignore, length, gameArray) {
    const movedTetro = Tetrominoes.downPosChange(currentTetro);
    return (
        Tetrominoes.outFromBottomGrid(movedTetro, 19) === 0
        ? legal(movedTetro, currentTetro, length, gameArray)
        : currentTetro
    );
};


Tetrominoes.collisionLocation = (currentTetromino, num) => currentTetromino.map(
    (row) => row.map(
        (cell) => (
            cell === 0
            ? 0
            : {"value": cell.value, "col": cell.col, "row": cell.row + num}
        )
    )
);



export default Object.freeze(Tetrominoes);