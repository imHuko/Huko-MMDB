// RTP measurement for both machines, mirroring schema-casino.sql exactly.
//   classic: exact enumeration of 128^3 reel combinations (stake units = bet).
//   dragon:  exact line + scatter expectation (one line's cells are i.i.d., so
//            expectation is linear over 9 lines) plus a Monte Carlo for the
//            free-spin round, which is where retriggers couple spins together.
//
// usage: node rtp.js [spins] [classicPaysJSON] [dragonPaysJSON]
//   classicPays: {"cherry":6,"lemon":10,"bell":20,"diamond":50,"seven":110,"star":100}
//   dragonPays:  {"cherry":[1,4,15],...,"wild":[26,155,1280],"scatter":[0,0,2,10,60]}

var SPINS = +(process.argv[2] || 2000000);
var C_PAY = process.argv[3] ? JSON.parse(process.argv[3])
  : { cherry: 6, lemon: 10, bell: 20, diamond: 50, seven: 110, star: 100 };
var D_PAY = process.argv[4] ? JSON.parse(process.argv[4])
  : { cherry: [1,4,15], lemon: [3,8,31], bell: [5,15,62], diamond: [8,31,130],
      seven: [13,62,260], star: [21,105,520], wild: [26,155,1280],
      scatter: { 3: 2, 4: 10, 5: 60 } };

// ---- strips --------------------------------------------------------------
var C_STRIP = [], D_STRIP = [];
function put(arr, n, s) { for (var i = 0; i < n; i++) arr.push(s); }
put(C_STRIP, 40, 'cherry'); put(C_STRIP, 28, 'lemon'); put(C_STRIP, 22, 'bell');
put(C_STRIP, 18, 'diamond'); put(C_STRIP, 16, 'seven'); put(C_STRIP, 4, 'star');
put(D_STRIP, 30, 'cherry'); put(D_STRIP, 25, 'lemon'); put(D_STRIP, 22, 'bell');
put(D_STRIP, 16, 'diamond'); put(D_STRIP, 12, 'seven'); put(D_STRIP, 9, 'star');
put(D_STRIP, 10, 'wild'); put(D_STRIP, 4, 'scatter');

// ---- classic -------------------------------------------------------------
function classic() {
  var combos = 128 * 128 * 128, total = 0, hit = 0;
  var by = {}, two = 0;
  for (var a = 0; a < 128; a++) {
    for (var b = 0; b < 128; b++) {
      for (var c = 0; c < 128; c++) {
        var x = C_STRIP[a], y = C_STRIP[b], z = C_STRIP[c], win = 0, key = null;
        if (x === y && y === z) { win = C_PAY[x]; key = x + ' x3'; }
        else {
          var n = (x === 'cherry') + (y === 'cherry') + (z === 'cherry');
          if (n === 2) { win = 1; key = 'two cherry'; two++; }
        }
        if (win) hit++;
        if (key) {
          var b2 = by[key] || (by[key] = { n: 0, pay: win });
          b2.n++; b2.pay = win;
        }
        total += win;
      }
    }
  }
  var contrib = {};
  Object.keys(by).forEach(function (k) {
    contrib[k] = { oddsOneIn: combos / by[k].n, pay: by[k].pay, rtp: by[k].n * by[k].pay / combos };
  });
  return { rtp: total / combos, hitFrequency: hit / combos, contrib: contrib, twoCherrySpins: two };
}

// ---- dragon: exact line expectation --------------------------------------
// One line sees 5 i.i.d. cells. Enumerate the 8^5 symbol sequences with their
// probabilities; the 9 lines are identical in distribution, so E[sum] = 9 x E[one].
var D_SYMBOLS = ['cherry', 'lemon', 'bell', 'diamond', 'seven', 'star', 'wild', 'scatter'];
var D_WEIGHT = { cherry: 30, lemon: 25, bell: 22, diamond: 16, seven: 12, star: 9, wild: 10, scatter: 4 };

function lineWin(seq) { // seq: array of 5 symbols; returns pay in line-bet units
  var base = null;
  for (var i = 0; i < 5; i++) if (seq[i] !== 'wild') { base = seq[i]; break; }
  if (base === null) base = 'wild';
  if (base === 'scatter') return { win: 0, base: null, run: 0 };
  var run = 0;
  for (var j = 0; j < 5; j++) {
    if (seq[j] === base || seq[j] === 'wild') run++;
    else break;
  }
  if (run < 3) return { win: 0, base: base, run: run };
  return { win: D_PAY[base][run - 3], base: base, run: run };
}

function dragonExact() {
  var idx = [0, 0, 0, 0, 0], seq = new Array(5);
  var lineEv = 0, by = {};
  var total = 128 * 128 * 128 * 128 * 128;
  for (var n = 0; n < 32768; n++) {
    var t = n, p = 1;
    for (var i = 0; i < 5; i++) {
      idx[i] = t % 8; t = (t - idx[i]) / 8;
      seq[i] = D_SYMBOLS[idx[i]];
      p *= D_WEIGHT[seq[i]] / 128;
    }
    var r = lineWin(seq);
    if (r.win) {
      var key = r.base + ' x' + r.run;
      var b = by[key] || (by[key] = { p: 0, pay: r.win });
      b.p += p; b.pay = r.win;
    }
    lineEv += r.win * p;
  }
  // 9 lines, each in total-bet/9 units -> divide by 9 for RTP.
  var linesRtp = 9 * lineEv / 9;
  var contrib = {};
  Object.keys(by).forEach(function (k) {
    contrib[k] = { oddsOneIn: 1 / (by[k].p * 9), pay: by[k].pay, rtp: by[k].p * 9 * by[k].pay / 9 };
  });

  // scatters: 15 i.i.d. cells, pays are multiples of the total bet.
  var pS = 4 / 128, scatRtp = 0, scatBy = {};
  for (var k = 3; k <= 15; k++) {
    var prob = 0, i2;
    // binomial(15, pS) exact
    function choose(n, k2) { var r = 1; for (i2 = 0; i2 < k2; i2++) r = r * (n - i2) / (i2 + 1); return r; }
    prob = choose(15, k) * Math.pow(pS, k) * Math.pow(1 - pS, 15 - k);
    var pay = D_PAY.scatter[Math.min(k, 5)];
    scatRtp += prob * pay;
    scatBy['scatters ' + k] = { oddsOneIn: 1 / prob, pay: pay, rtp: prob * pay };
  }
  return { linesRtp: linesRtp, scatRtp: scatRtp, contrib: contrib, scatter: scatBy };
}

// ---- dragon: Monte Carlo for the free-spin round -------------------------
function dragonSim(spins) {
  var grid = new Array(15), returned = 0, paid = 0;
  var freeReturn = 0, freeCount = 0, rounds = 0, hits = 0, baseReturn = 0;
  function draw() { return D_STRIP[(Math.random() * 128) | 0]; }
  function spin() {
    var win = 0, sc = 0, i;
    for (i = 0; i < 15; i++) { grid[i] = draw(); if (grid[i] === 'scatter') sc++; }
    var scatWin = (D_PAY.scatter[Math.min(sc, 5)] || 0) * 9; // multiples of total bet
    for (var li = 0; li < 9; li++) {
      var base = null, r, cells = [];
      for (var c2 = 0; c2 < 5; c2++) {
        var s = grid[c2 * 3 + (LINES9[li][c2] - 1)];
        cells.push(s);
        if (s !== 'wild' && base === null) base = s;
      }
      if (base === null) base = 'wild';
      if (base === 'scatter') continue;
      r = 0;
      for (var q = 0; q < 5; q++) {
        if (cells[q] === base || cells[q] === 'wild') r++;
        else break;
      }
      if (r >= 3) win += D_PAY[base][r - 3];
    }
    return { win: win + scatWin, scatters: sc };
  }
  for (var n = 0; n < spins; n++) {
    var res = spin();
    paid += 9;
    returned += res.win; baseReturn += res.win;
    if (res.win > 0) hits++;
    if (res.scatters >= 3) {
      rounds++;
      var left = 8;
      while (left > 0) {
        left--;
        var f = spin();
        var w = f.win * 2;
        returned += w; freeReturn += w; freeCount++;
        if (f.win > 0) hits++;
        if (f.scatters >= 3) left += 5;
      }
    }
  }
  return { rtp: returned / paid, baseRtp: baseReturn / paid, freeRtp: freeReturn / paid,
           freeRoundRate: rounds / spins, freeSpinCount: freeCount,
           freeSpinsPerRound: freeCount / Math.max(1, rounds), hits: hits, total: spins + freeCount };
}

var LINES9 = [[2,2,2,2,2],[1,1,1,1,1],[3,3,3,3,3],[1,2,3,2,1],[3,2,1,2,3],[1,2,1,2,1],[3,2,3,2,3],[2,1,1,1,2],[2,3,3,3,2]];

// ---- report --------------------------------------------------------------
var c = classic();
console.log('CLASSIC');
console.log('  table RTP (star triple pays 100x):  ' + (c.rtp * 100).toFixed(3) + '%');
console.log('  cash RTP at max bet (pool pays it): ' + ((c.rtp - c.contrib['star x3'].rtp) * 100).toFixed(3) + '%');
console.log('  long run incl. 1% jackpot feed:     ' + ((c.rtp - c.contrib['star x3'].rtp) * 100 + 1).toFixed(3) + '%');
console.log('  hit frequency: ' + (c.hitFrequency * 100).toFixed(2) + '%');
Object.keys(c.contrib).forEach(function (k) {
  var v = c.contrib[k];
  console.log('    ' + k.padEnd(12) + ' 1 in ' + v.oddsOneIn.toFixed(0).padStart(6) +
              '  pays ' + String(v.pay).padStart(4) + 'x  = ' + (v.rtp * 100).toFixed(3) + '%');
});

var ex = dragonExact();
console.log('\nDRAGON — exact line and scatter expectation');
console.log('  lines:    ' + (ex.linesRtp * 100).toFixed(3) + '%');
console.log('  scatters: ' + (ex.scatRtp * 100).toFixed(3) + '%');
Object.keys(ex.contrib).sort().forEach(function (k) {
  var v = ex.contrib[k];
  if (v.rtp < 0.0005) return;
  console.log('    ' + k.padEnd(12) + ' 1 in ' + v.oddsOneIn.toFixed(1).padStart(7) +
              '  pays ' + String(v.pay).padStart(5) + 'x line  = ' + (v.rtp * 100).toFixed(3) + '%');
});
Object.keys(ex.scatter).forEach(function (k) {
  var v = ex.scatter[k];
  console.log('    ' + k.padEnd(12) + ' 1 in ' + v.oddsOneIn.toFixed(1).padStart(7) +
              '  pays ' + String(v.pay).padStart(5) + 'x total = ' + (v.rtp * 100).toFixed(3) + '%');
});

var d = dragonSim(SPINS);
console.log('\nDRAGON — Monte Carlo (' + SPINS.toLocaleString() + ' paid spins)');
console.log('  base game:  ' + (d.baseRtp * 100).toFixed(3) + '%');
console.log('  free spins: ' + (d.freeRtp * 100).toFixed(3) + '%  (round every ' +
            (1 / d.freeRoundRate).toFixed(1) + ' spins, ' + d.freeSpinsPerRound.toFixed(2) + ' spins per round)');
console.log('  TOTAL RTP:  ' + (d.rtp * 100).toFixed(3) + '%');
console.log('  hit frequency incl. free spins: ' + (d.hits / d.total * 100).toFixed(2) + '%');
