(function () {
  class Sound {
    constructor() { this.enabled = false; this.context = null; this.music = null; this.volume = 0.35; }
    toggle() {
      this.enabled = !this.enabled;
      if (this.enabled) { try { this.context ||= new (window.AudioContext || window.webkitAudioContext)(); this.context.resume().catch(()=>{}); } catch { this.enabled = false; } }
      if (this.music) { if (this.enabled) this.music.play().catch(()=>{}); else this.music.pause(); }
      return this.enabled;
    }
    // Optional local, licensed recording. No music is included in the release.
    setMusic(localUrl) {
      this.music?.pause();
      this.music = localUrl ? new Audio(localUrl) : null;
      if (this.music) { this.music.loop = true; this.music.volume = this.volume; if(this.enabled) this.music.play().catch(()=>{}); }
    }
    pause() { if(this.music) this.music.pause(); this.context?.suspend().catch(()=>{}); }
    resume() { if(this.enabled) { this.context?.resume().catch(()=>{}); this.music?.play().catch(()=>{}); } }
    note(frequency, duration = 0.2, volume = 0.06, delay = 0) {
      if (!this.enabled || !this.context || this.context.state !== 'running') return;
      const c=this.context, o=c.createOscillator(), g=c.createGain(), t=c.currentTime+delay;
      o.type='sine'; o.frequency.value=frequency; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(volume,t+0.012); g.gain.exponentialRampToValueAtTime(0.0001,t+duration);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+duration+0.02);
    }
    event(type) {
      if(type==='record') this.note(293.66,.22);
      if(type==='playback') { this.note(392,.4);this.note(587.33,.5,.04,.12); }
      if(type==='plate') this.note(659.25,.4,.045);
      if(type==='bridge-open') { this.note(440,.5,.03);this.note(554.37,.5,.025,.07); }
      if(type==='win') [392,493.88,587.33,783.99].forEach((f,i)=>this.note(f,.9,.035,i*.12));
    }
  }
  window.WWMSound=Sound;
})();
