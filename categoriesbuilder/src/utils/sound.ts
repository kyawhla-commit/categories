export function playOrderAlert() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    // Play a pleasant 4-tone chime
    [523, 659, 784, 1047].forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = "sine";
      
      const startTime = ctx.currentTime + i * 0.12;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
      gainNode.gain.linearRampToValueAtTime(0, startTime + 0.18);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.22);
    });
  } catch (e) {
    console.error("Failed to play sound:", e);
  }
}
