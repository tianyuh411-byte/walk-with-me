(function (root) {
  const line = (x1, x2, y) => Array.from({ length: x2 - x1 + 1 }, (_, i) => [x1 + i, y]);
  root.WWMLevels = [{
    start: { x: 4, y: 9 }, exit: { x: 18, y: 6 },
    floors: [[2,2,10,10],[15,3,20,10]],
    plates: [{ id: 'A', x: 3, y: 3 }],
    bridges: [{ id: 'one', tiles: line(11,14,8), requires: ['A'] }]
  }, {
    start: { x: 4, y: 9 }, exit: { x: 18, y: 6 },
    floors: [[2,2,10,10],[15,3,20,10]],
    plates: [{ id: 'A', x: 3, y: 3 },{ id: 'B', x: 10, y: 8 }],
    bridges: [{ id: 'one', tiles: line(11,14,8), requires: ['A','B'] }]
  }, {
    start: { x: 5, y: 9 }, exit: { x: 20, y: 8 },
    floors: [[2,2,7,10],[11,3,14,9],[18,6,21,10]],
    plates: [{ id: 'A', x: 3, y: 3 },{ id: 'B', x: 3, y: 9 }],
    bridges: [{ id: 'one', tiles: line(8,10,5), requires: ['A'] },{ id: 'two', tiles: line(15,17,8), requires: ['B'] }]
  }, {
    start: { x: 5, y: 9 }, exit: { x: 20, y: 8 },
    floors: [[2,2,7,10],[11,3,14,9],[18,6,21,10]],
    plates: [{ id: 'A', x: 3, y: 3 },{ id: 'B', x: 6, y: 9 },{ id: 'C', x: 14, y: 8 }],
    bridges: [{ id: 'one', tiles: line(8,10,5), requires: ['A'] },{ id: 'two', tiles: line(15,17,8), requires: ['B','C'] }]
  }];
  const localized = (root.WWMText || (typeof require !== 'undefined' ? require('./strings.js') : null)).en.rooms;
  root.WWMLevels.forEach((level, i) => Object.assign(level, localized[i]));
  if (typeof module !== 'undefined') module.exports = root.WWMLevels;
})(typeof globalThis !== 'undefined' ? globalThis : this);
