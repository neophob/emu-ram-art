
const MAX_LOOPS = 64;
const lastCC = [MAX_LOOPS].fill(0xFF);
let outputSlice = [];
let traceLoops = 0;
let steps = 0;

let started = false;

module.exports = {
  writeData,
};

function writeData(data) {
  if (!started) {
    started = true;
    initTraceLoops();
  }

  outputSlice.push(data);
  steps++;
  if (steps % (MAX_LOOPS * 100) === 0) {
    flushTraces();
    initTraceLoops();
  }

}

function initTraceLoops() {
  outputSlice = [];
}

function flushTraces() {
  outputSlice.forEach((line) => {
    const cc = line.cc;
    let count = 0;
    for (let i = 0; i < MAX_LOOPS; i++) {
      if (lastCC[i] === cc) {
        count++;
      }
    }

    if (count > 1) {
      traceLoops++;
    } else {
      if (traceLoops) {
        console.log('   (loops for ' + traceLoops + ' instructions)');
        traceLoops = 0;
      }
      //printInstruction(pc, instr, line);
      console.error(JSON.stringify({cc, ticks: line.ticks}) + ',');

      for (let i = 1; i < MAX_LOOPS; i++) {
        lastCC[i - 1] = lastCC[i];
      }
      lastCC[MAX_LOOPS - 1] = cc;
    }

  });
}
