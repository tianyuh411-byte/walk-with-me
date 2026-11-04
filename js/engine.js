(function (root) {
  'use strict';
  const STEP = 1 / 60, LIMIT = 12, SPEED = 3.2, GRACE = 2.4, RADIUS = 0.24;
  const clone = p => ({ x: p.x, y: p.y });
  const near = (a, b, radius = 0.48) => Math.hypot(a.x - b.x, a.y - b.y) <= radius;
  class Game {
    constructor(level) { this.level = level; this.events = []; this.reset(); }
    emit(type, data) { this.events.push({ type, data }); }
    drain() { return this.events.splice(0); }
    reset(message = '') {
      this.player = clone(this.level.start); this.echo = null; this.samples = [];
      this.mode = 'ready'; this.time = 0; this.paused = false; this.won = false;
      this.plates = this.level.plates.map(p => ({ ...p, active: false }));
      this.bridges = this.level.bridges.map(b => ({ ...b, remaining: 0, open: false, held: false }));
      this.events = []; this.emit('reset', message);
    }
    record() {
      if (this.paused || this.won) return;
      if (this.mode === 'recording') return this.finish();
      this.reset(); this.mode = 'recording'; this.samples = [{ t: 0, ...clone(this.player) }]; this.emit('record');
    }
    finish() {
      if (this.mode !== 'recording') return;
      const samples = this.samples.map(p => ({ ...p }));
      const duration = this.time;
      this.reset(); this.samples = samples; this.mode = 'playback';
      this.echo = { ...clone(samples[0]), duration, cursor: 0, finished: duration === 0 };
      this.emit('playback');
    }
    floor(x, y) {
      const tx = Math.floor(x + 0.5), ty = Math.floor(y + 0.5);
      return this.level.floors.some(r => tx >= r[0] && tx <= r[2] && ty >= r[1] && ty <= r[3]) ||
        this.bridges.some(b => b.open && b.tiles.some(t => tx === t[0] && ty === t[1]));
    }
    safe(x, y) {
      return [[-RADIUS,-RADIUS],[RADIUS,-RADIUS],[-RADIUS,RADIUS],[RADIUS,RADIUS]].every(o => this.floor(x+o[0], y+o[1]));
    }
    updateEcho() {
      const e = this.echo;
      if (!e) return;
      while (e.cursor + 1 < this.samples.length && this.samples[e.cursor + 1].t <= this.time + 1e-9) e.cursor++;
      const a = this.samples[e.cursor], b = this.samples[Math.min(e.cursor + 1, this.samples.length - 1)];
      const f = b.t > a.t ? Math.max(0, Math.min(1, (this.time - a.t) / (b.t - a.t))) : 0;
      e.x = a.x + (b.x - a.x) * f; e.y = a.y + (b.y - a.y) * f;
      if (this.time + 1e-9 >= e.duration && !e.finished) { e.finished = true; this.emit('echo-held'); }
    }
    updateBridges(dt) {
      for (const p of this.plates) {
        const was = p.active;
        p.active = near(this.player, p) || !!(this.echo && near(this.echo, p));
        if (p.active && !was) this.emit('plate', p.id);
      }
      for (const b of this.bridges) {
        const was = b.open;
        b.held = b.requires.every(id => this.plates.find(p => p.id === id).active);
        b.remaining = b.held ? GRACE : Math.max(0, b.remaining - dt);
        b.open = b.remaining > 1e-8;
        if (was !== b.open) this.emit(b.open ? 'bridge-open' : 'bridge-close', b.id);
      }
    }
    tick(dt, input = {}) {
      if (this.paused || this.won) return;
      // The caller uses a fixed timestep; bound unusual external deltas as well.
      dt = Math.min(STEP, Math.max(0, dt));
      this.time += dt;
      this.updateEcho(); // Replay recorded coordinates without physical collision solving.
      this.updateBridges(dt);
      if (!this.safe(this.player.x, this.player.y)) { this.reset('bridge-faded'); return; }
      let dx = (input.right ? 1 : 0) - (input.left ? 1 : 0), dy = (input.down ? 1 : 0) - (input.up ? 1 : 0);
      const length = Math.hypot(dx, dy) || 1; dx *= SPEED * dt / length; dy *= SPEED * dt / length;
      if (this.safe(this.player.x + dx, this.player.y)) this.player.x += dx;
      if (this.safe(this.player.x, this.player.y + dy)) this.player.y += dy;
      // Occupancy is recomputed after movement, including simultaneous player/echo handoffs.
      this.updateBridges(0);
      if (this.mode === 'recording') {
        this.samples.push({ t: this.time, ...clone(this.player) });
        if (this.time + 1e-8 >= LIMIT) this.finish();
      } else if (near(this.player, this.level.exit, 0.5)) {
        this.won = true; this.emit('win');
      }
    }
  }
  root.WWMEngine = { Game, STEP, LIMIT, SPEED, GRACE, near };
  if (typeof module !== 'undefined') module.exports = root.WWMEngine;
})(typeof globalThis !== 'undefined' ? globalThis : this);
