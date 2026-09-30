import './study-mode.css';

export function StudyMode({mode, classicUrl = '/#/today'}: {mode: 'classic' | 'map'; classicUrl?: string}) {
  return <nav className="study-mode" aria-label="学习模式">
    <a href={classicUrl} aria-current={mode === 'classic' ? 'page' : undefined}>经典模式</a>
    <a href={mode === 'map' ? '#/map/first' : '/map/'} aria-current={mode === 'map' ? 'page' : undefined}>地图模式</a>
  </nav>;
}
