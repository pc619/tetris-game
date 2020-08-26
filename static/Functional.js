const F = Object.create(null);

F.identity = (x) => x;

F.compose = (...fs) => (x) => fs.reduceRight((a, f) => f(a), x);

F.randomInt = (number) => Math.floor(Math.random() * number);

F.filter = (f) => (array) => array.filter(f);

F.reduce = (f, initialValue) => (array) => array.reduce(f, initialValue);

F.map = (f) => (array) => array.map(f);

F.deepCopy = (arr) => JSON.parse(JSON.stringify(arr));

F.transpose = (matrix) => matrix[0].map(
    (ignore, row) => matrix.map((col) => col[row])
);

F.flatten = (matrix) => matrix.flat();

F.filterZeros = F.filter((x) => x !== 0);

F.flattenFilter = F.compose(F.filterZeros, F.flatten);

export default Object.freeze(F);