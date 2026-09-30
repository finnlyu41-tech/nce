import React, { useRef, useState, useLayoutEffect, forwardRef, useImperativeHandle } from 'react';
import { ArrowUpRight, Check, Lock, Flag, Headphones, BookOpen, PenLine, Mic, LocateFixed, Minus, Plus, Maximize2, RotateCcw, Milestone } from 'lucide-react';
import { nodes, stages, lanes, type MapNode, type Stage } from './content';
import { statusMap, due, type Progress } from './model';
export type GraphHandle = {
    focus: (id: string) => void;
    stage: (id: Stage) => void;
};
export const skillIcon = (lane?: string) => lane === 'listening' ? Headphones : lane === 'reading' ? BookOpen : lane === 'writing' ? PenLine : lane === 'speaking' ? Mic : BookOpen;
export const LearningGraph = forwardRef<GraphHandle, {
    state: Progress;
    selected: string;
    select: (id: string) => void;
    mobile: boolean;
    current: string;
}>(function LearningGraph({ state, selected, select, mobile, current }, ref) {
    const board = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const status = statusMap(state);
    const width = mobile ? 360 : 1020;
    const cardW = mobile ? 146 : 210, cardH = mobile ? 100 : 98;
    const layout = new Map<string, {
        x: number;
        y: number;
    }>();
    const bands: {
        id: Stage;
        y: number;
        height: number;
    }[] = [];
    const laneTitles: {
        id: string;
        x: number;
        y: number;
    }[] = [];
    let y = 10;
    for (const s of stages) {
        const start = y;
        const list = nodes.filter(n => n.stage === s.id);
        y += mobile ? 96 : 94;
        if (s.id === 'skills') {
            const rows = mobile ? 2 : 1;
            for (let row = 0; row < rows; row++) {
                let max = 0;
                for (const [col, lane] of lanes.slice(row * (mobile ? 2 : 4), (row + 1) * (mobile ? 2 : 4)).entries()) {
                    const x = mobile ? 22 + col * 170 : 45 + col * 240;
                    laneTitles.push({ id: lane.id, x, y });
                    const inLane = list.filter(n => n.lane === lane.id);
                    max = Math.max(max, inLane.length);
                    inLane.forEach((n, i) => layout.set(n.id, { x, y: y + 53 + i * (mobile ? 146 : 144) }));
                }
                y += 53 + max * (mobile ? 146 : 144) + 25;
            }
        }
        else {
            const cols = mobile ? 2 : 4;
            list.forEach((n, i) => { const row = Math.floor(i / cols), col = row % 2 ? cols - 1 - i % cols : i % cols; layout.set(n.id, { x: mobile ? 22 + col * 170 : 45 + col * 240, y: y + row * (mobile ? 153 : 155) }); });
            y += Math.ceil(list.length / cols) * (mobile ? 153 : 155) + 25;
        }
        bands.push({ id: s.id, y: start, height: y - start });
    }
    const height = y + 15;
    useLayoutEffect(() => {
        if (!board.current) return;
        const scale = Math.min(1, (board.current.clientWidth - 20) / width);
        setZoom(scale);
        const position = layout.get(selected);
        const frame = requestAnimationFrame(() => {
            if (position) board.current?.scrollTo({top: Math.max(0, position.y * scale - 95), left: 0, behavior: 'instant'});
        });
        return () => cancelAnimationFrame(frame);
    }, [width]);
    const scrollTo = (id: string, scale = zoom) => { const p = layout.get(id); if (!p || !board.current)
        return; board.current.scrollTo({ left: (p.x + cardW / 2) * scale - board.current.clientWidth / 2, top: p.y * scale - 50, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); };
    useImperativeHandle(ref, () => ({ focus: (id) => { const z = Math.min(1, ((board.current?.clientWidth || width) - 20) / width); setZoom(z); requestAnimationFrame(() => scrollTo(id, z)); }, stage: (id) => { const z = Math.min(1, ((board.current?.clientWidth || width) - 20) / width); setZoom(z); requestAnimationFrame(() => board.current?.scrollTo({ top: (bands.find(b => b.id === id)?.y || 0) * z, left: 0, behavior: 'smooth' })); } }));
    const rescale = (z: number) => { const b = board.current; if (!b)
        return; const ratio = z / zoom; const x = (b.scrollLeft + b.clientWidth / 2) * ratio - b.clientWidth / 2, y = (b.scrollTop + b.clientHeight / 2) * ratio - b.clientHeight / 2; setZoom(z); requestAnimationFrame(() => b.scrollTo({ left: x, top: y })); };
    return <section className="map-shell" aria-label="互动学习地图">
  <div className="map-toolbar"><span><span className="live-dot"/> 你的学习地图</span><div className="map-legend"><span><i className="legend-dot done"/>已通过</span><span><i className="legend-dot ready"/>可学习</span><span><Lock size={11}/>待解锁</span></div></div>
  <div className="map-scroll" ref={board} tabIndex={0} aria-label="地图画布，可滚动浏览，节点支持键盘 Tab 选择">
   <div style={{ width: width * zoom, height: height * zoom, position: 'relative', margin: '0 auto' }}><div className="map-world" style={{ width, height, transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
    <svg className="map-edges" width={width} height={height} aria-hidden="true"><defs><pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#dfe4dc"/></pattern></defs><rect width="100%" height="100%" fill="url(#dots)"/>
     {nodes.flatMap(n => n.requires.map(id => {
            const a = layout.get(id)!, b = layout.get(n.id)!;
            const same = Math.abs(a.y - b.y) < 2;
            const reverse = b.x < a.x;
            let path;
            if (same) {
                const x1 = a.x + (reverse ? 0 : cardW), x2 = b.x + (reverse ? cardW : 0), cy = a.y + cardH / 2;
                path = `M ${x1} ${cy} L ${x2} ${cy}`;
            }
            else {
                const x1 = a.x + cardW / 2, x2 = b.x + cardW / 2, y1 = a.y + cardH, y2 = b.y;
                path = `M ${x1} ${y1} C ${x1} ${y1 + (y2 - y1) / 2}, ${x2} ${y1 + (y2 - y1) / 2}, ${x2} ${y2}`;
            }
            return <path key={`${id}-${n.id}`} d={path} fill="none" stroke={status[id] === 'passed' ? '#349584' : '#d4dcd1'} strokeWidth={status[id] === 'passed' ? 3 : 2} strokeDasharray={status[id] === 'passed' ? undefined : '5 7'}/>;
        }))}
    </svg>
    {bands.map(b => { const s = stages.find(s => s.id === b.id)!; return <div className={`stage-label stage-${s.id}`} key={s.id} style={{ top: b.y + 14, left: mobile ? 23 : 45 }}><div className="eyebrow">{s.eyebrow}</div><h2>{s.title}</h2><p>{s.description}</p></div>; })}
    {laneTitles.map(l => { const lane = lanes.find(x => x.id === l.id)!; const Icon = skillIcon(l.id); return <div className="lane-title" key={l.id} style={{ left: l.x, top: l.y, color: lane.color }}><Icon size={18}/><span>{lane.title}<small>{lane.en}</small></span></div>; })}
    {nodes.map((n, index) => {
            const pos = layout.get(n.id)!;
            const Icon = n.kind === 'finish' ? Flag : n.kind === 'checkpoint' ? Milestone : skillIcon(n.lane);
            const s = status[n.id], review = due(n, state);
            return <button key={n.id} data-node={n.id} aria-label={`${n.title}，${s === 'locked' ? '待解锁' : s === 'passed' ? '已通过' : '可学习'}`} aria-pressed={selected === n.id} className={`map-node ${s} ${n.kind} ${selected === n.id ? 'selected' : ''} ${current === n.id ? 'current' : ''}`} style={{ left: pos.x, top: pos.y, width: cardW, height: cardH }} onClick={() => select(n.id)}>
     <span className="node-top"><span className="node-symbol">{s === 'passed' ? <Check size={16}/> : s === 'locked' ? <Lock size={14}/> : <Icon size={16}/>}</span><span className="node-number">{n.kind === 'finish' ? 'THE GOAL' : String(index + 1).padStart(2, '0')}</span>{review && <RotateCcw size={13} className="due-dot"/>}</span>
     <strong>{n.title}</strong><span className="node-footer">{n.kind === 'finish' ? 'ACADEMIC' : s === 'passed' ? review ? '待巩固 · 可复习' : '已通过' : s === 'locked' ? '完成前置节点后解锁' : current === n.id ? '从这里继续' : `${n.minutes} 分钟 · ${n.kind === 'task' ? '实践' : '练习'}`}{s !== 'locked' && <ArrowUpRight size={13}/>}</span>
    </button>;
        })}
   </div></div>
  </div>
  <div className="map-bottom"><span>循着连线，每次前进一步</span><div className="map-controls"><button title="回到当前节点" aria-label="回到当前节点" onClick={() => { select(current); scrollTo(current); }}><LocateFixed size={17}/></button><span className="control-divider"/><button aria-label="缩小地图" onClick={() => rescale(Math.max(.2, zoom - .15))}><Minus size={16}/></button><span className="zoom-label">{Math.round(zoom * 100)}%</span><button aria-label="放大地图" onClick={() => rescale(Math.min(1.4, zoom + .15))}><Plus size={16}/></button><button aria-label="查看全图" title="查看全图" onClick={() => { const b = board.current!; const z = Math.min((b.clientWidth - 20) / width, (b.clientHeight - 20) / height); setZoom(z); b.scrollTo(0, 0); }}><Maximize2 size={16}/></button></div></div>
 </section>;
});
