import type {Pack} from '../types';
export const listeningAudio:Record<Pack,string>={
 A:new URL('./audio/listening-a.wav',import.meta.url).href,
 B:new URL('./audio/listening-b.wav',import.meta.url).href,
 C:new URL('./audio/listening-c.wav',import.meta.url).href,
 D:new URL('./audio/listening-d.wav',import.meta.url).href,
 E:new URL('./audio/listening-e.wav',import.meta.url).href,
 F:new URL('./audio/listening-f.wav',import.meta.url).href,
};
export const practiceListeningAudio=new URL('./audio/practice-listening.wav',import.meta.url).href;
