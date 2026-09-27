import {toast} from 'sonner';
import {getPlaybackRate, subscribePlaybackRate} from './playback-rate';

let cancelActive: (() => void) | undefined;

export function speak(text: string, onend?: (ok?: boolean) => void) {
  cancelActive?.();
  if (!('speechSynthesis' in window)) {
    toast.error('此浏览器没有本地朗读功能，请使用教材原声。');onend?.(false);return;
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const voices = synth.getVoices().filter(voice => voice.localService && voice.lang.toLowerCase().startsWith('en'));
  const voice = voices.find(voice => voice.lang === 'en-GB') || voices[0];
  if (!voice) {
    toast.error('未找到离线英文语音。请在系统中安装英文语音包，或使用已保存的教材音频；若刚打开页面，可稍后重试。');onend?.(false);return;
  }
  let utterance: SpeechSynthesisUtterance, finished = false;
  let unsubscribe = () => {};
  function detach() { if (utterance) { utterance.onend = null;utterance.onerror = null; } }
  function finish(ok: boolean) {
    if (finished) return;
    finished = true;detach();unsubscribe();
    if (cancelActive === cancel) cancelActive = undefined;
    onend?.(ok);
  }
  const cancel = () => finish(false);
  function play() {
    detach();synth.cancel();
    utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice!;utterance.lang = voice!.lang;utterance.rate = Number(getPlaybackRate());
    const current = utterance;
    utterance.onend = () => { if (utterance === current) finish(true); };
    utterance.onerror = event => {
      if (utterance !== current) return;
      if (!['canceled', 'interrupted'].includes(event.error)) toast.error('本地语音暂不可用，请检查系统语音包。');
      finish(false);
    };
    synth.speak(utterance);
  }
  unsubscribe = subscribePlaybackRate(() => {
    if (synth.speaking || synth.pending) play();
    else finish(false);
  });
  cancelActive = cancel;
  play();
}
