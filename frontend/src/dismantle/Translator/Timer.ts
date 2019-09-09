import { ActionListener } from './types';
class Timer {
  private delay: number;
  private listener: ActionListener;
  private intervalHandle: any;

  constructor(delay: number, listener: ActionListener) {
    this.delay = delay;
    this.listener = listener;
  }

  start() {
    this.intervalHandle = setInterval(this.run, this.delay);
  }

  stop() {
    clearInterval(this.intervalHandle);
  }

  private run() {
    this.listener.actionPerformed(null);
  }
}

export default Timer;
