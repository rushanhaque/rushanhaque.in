// A queue for set-up work that can wait a frame: building scroll scenes, splitting titles.
// Tasks run a few milliseconds' worth at a time and the browser gets the main thread back in
// between, so a dozen sections arriving together never become one long freeze.
const queue: (() => void)[] = [];
let running = false;

const pump = () => {
  const start = performance.now();
  while (queue.length && performance.now() - start < 8) queue.shift()!();
  if (queue.length) setTimeout(pump, 0);
  else running = false;
};

export function soon(task: () => void) {
  queue.push(task);
  if (!running) { running = true; setTimeout(pump, 0); }
}
