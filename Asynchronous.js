const A = Object.create(null);

A.setInterval = (f, s) => setInterval(f, s);

export default Object.freeze(A);