const F = Object.create(null);

F.compose = (...fs) => (x) => fs.reduceRight((a, f) => f(a), x);

F.randomInt = (number) => Math.floor(Math.random() * number);

F.filter = (f) => (array) => array.filter(f);

F.reduce = (f, initialValue) => (array) => array.reduce(f, initialValue);

F.map = (f) => (array) => array.map(f);

F.deepCopy = (arr) => JSON.parse(JSON.stringify(arr));

F.transpose = (matrix) => matrix[0].map(
    (ignore, row) => matrix.map((col) => col[row])
);

export default Object.freeze(F);