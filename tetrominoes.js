import F from "./Functional.js";

const {compose, randomInt, deepCopy, transpose} = F;

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

Tetrominoes.legalRotate = function (currentTetromino, length, gameArray) {

};

// Moving the tetromino left or right

Tetrominoes.leftPosChange = (currentTetromino) => currentTetromino.map(
    (row) => row.map(
        (cell) => (
            cell === 0
            ? 0
            : {"value": cell.value, "col": cell.col - 1, "row": cell.row}
        )
    )
);

Tetrominoes.legalLeftPosChange = function (currentTetro, length, gameArray) {

};

Tetrominoes.rightPosChange = (currentTetromino) => currentTetromino.map(
    (row) => row.map(
        (cell) => (
            cell === 0
            ? 0
            : {"value": cell.value, "col": cell.col + 1, "row": cell.row}
        )
    )
);

Tetrominoes.legalRightPosChange = function (currentTetro, length, gameArray) {

};

Tetrominoes.downPosChange = (currentTetromino) => currentTetromino.map(
    (row) => row.map(
        (cell) => (
            cell === 0
            ? 0
            : {"value": cell.value, "col": cell.col, "row": cell.row + 1}
        )
    )
);


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