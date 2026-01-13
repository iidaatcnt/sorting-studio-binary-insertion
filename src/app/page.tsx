'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  StepBack,
  Github,
  Info,
  Code2,
  Zap,
  Lightbulb,
  Search,
  MoveDown
} from 'lucide-react';

// --- Types ---
type SortState = 'search' | 'shift' | 'insert' | 'init' | 'complete';

interface SortingStep {
  array: number[];
  indices: number[]; // Working indices (low, mid, high)
  targetIdx?: number; // The element we are trying to insert
  searchRange?: [number, number];
  type: SortState;
  description: string;
  codeLine?: number;
}

// --- Constants ---
const ARRAY_SIZE = 12;
const INITIAL_SPEED = 800;

const CODE_PYTHON = [
  "def binary_insertion_sort(arr):",
  "    for i in range(1, len(arr)):",
  "        val = arr[i]",
  "        pos = binary_search(arr, val, 0, i - 1)",
  "        # Shift and insert...",
  "        for j in range(i, pos, -1):",
  "            arr[j] = arr[j - 1]",
  "        arr[pos] = val",
  "",
  "def binary_search(arr, val, start, end):",
  "    while start <= end:",
  "        mid = (start + end) // 2",
  "        if arr[mid] < val:",
  "            start = mid + 1",
  "        else:",
  "            end = mid - 1",
  "    return start"
];

// --- Algorithm Logic ---
const generateSteps = (initialArray: number[]): SortingStep[] => {
  const steps: SortingStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;

  steps.push({
    array: [...arr],
    indices: [],
    type: 'init',
    description: '二分挿入ソートを開始します。挿入位置を「二分探索」で見つける賢いアルゴリズムです。',
    codeLine: 0
  });

  for (let i = 1; i < n; i++) {
    const val = arr[i];
    let low = 0;
    let high = i - 1;

    steps.push({
      array: [...arr],
      indices: [],
      targetIdx: i,
      type: 'search',
      description: `インデックス ${i} の値 ${val} の挿入位置を、整列済みの範囲 [${low}, ${high}] から探します。`,
      codeLine: 3
    });

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      steps.push({
        array: [...arr],
        indices: [low, mid, high],
        searchRange: [low, high],
        targetIdx: i,
        type: 'search',
        description: `中央値 ${arr[mid]} と比較。範囲を絞り込みます。`,
        codeLine: 11
      });

      if (arr[mid] < val) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    const pos = low;
    steps.push({
      array: [...arr],
      indices: [pos],
      targetIdx: i,
      type: 'search',
      description: `挿入位置がインデックス ${pos} に決定しました！`,
      codeLine: 16
    });

    // Shift
    for (let j = i; j > pos; j--) {
      steps.push({
        array: [...arr],
        indices: [j, j - 1],
        targetIdx: i,
        type: 'shift',
        description: `位置 ${pos} を空けるために、要素を右にずらします。`,
        codeLine: 6
      });
      arr[j] = arr[j - 1];
    }

    arr[pos] = val;
    steps.push({
      array: [...arr],
      indices: [pos],
      type: 'insert',
      description: `位置 ${pos} に ${val} を挿入しました。`,
      codeLine: 7
    });
  }

  steps.push({
    array: [...arr],
    indices: Array.from({ length: n }, (_, k) => k),
    type: 'complete',
    description: '二分探索を活用し、すべての要素を効率的に整列しました！',
    codeLine: 0
  });

  return steps;
};


// --- Main App ---
export default function BinaryInsertionSortStudio() {
  const [array, setArray] = useState<number[]>([]);
  const [steps, setSteps] = useState<SortingStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    const newArray = Array.from({ length: ARRAY_SIZE }, () => Math.floor(Math.random() * 85) + 10);
    const newSteps = generateSteps(newArray);
    setArray(newArray);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    reset();
  }, [reset]);

  const stepForward = useCallback(() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1)), [steps.length]);
  const stepBackward = useCallback(() => setCurrentStep(prev => Math.max(prev - 1, 0)), []);

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1001 - speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, currentStep, steps.length, speed]);

  const step = steps[currentStep] || { array: [], indices: [], type: 'init', description: '' };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Search className="text-slate-950 w-5 h-5" />
            </div>
            <h1 className="font-black italic tracking-tighter text-xl uppercase tracking-widest text-cyan-400">Binary_Insertion_Studio</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-[10px] mono uppercase text-slate-500 font-black tracking-widest">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'}`} />
                {isPlaying ? 'Searching' : 'Idle'}
              </div>
              <span className="opacity-20">|</span>
              <span>Range: {step.searchRange ? `${step.searchRange[0]}-${step.searchRange[1]}` : 'N/A'}</span>
            </div>
            <a href="https://github.com/iidaatcnt/sorting-studio-binary-insertion" target="_blank" rel="noreferrer" className="text-slate-600 hover:text-white transition-colors">
              <Github size={20} />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Visualization */}
        <div className="lg:col-span-8 flex flex-col gap-8">

          <div className="relative aspect-video lg:aspect-square max-h-[500px] bg-[#030712] rounded-[3rem] border border-white/5 p-16 flex items-end justify-center gap-3 overflow-hidden shadow-2xl">
            <div className="absolute top-8 left-12 flex items-center gap-3 mono text-[9px] text-slate-500 uppercase font-black tracking-[0.2em] z-10">
              <Search size={14} className="text-cyan-400" />
              Binary Search Strategy // Optimal Insertion
            </div>

            <AnimatePresence mode="popLayout" initial={false}>
              {step.array.map((val, idx) => {
                const isSearching = step.type === 'search' && step.indices.includes(idx);
                const isMid = step.type === 'search' && step.indices[1] === idx;
                const inRange = step.searchRange ? (idx >= step.searchRange[0] && idx <= step.searchRange[1]) : false;
                const isTarget = step.targetIdx === idx;

                let colorClass = "bg-slate-800/40";
                let yOffset = 0;

                if (inRange) {
                  colorClass = "bg-slate-800";
                  if (isSearching) colorClass = "bg-cyan-600/50 border border-cyan-400/30";
                  if (isMid) colorClass = "bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]";
                }

                if (isTarget) {
                  colorClass = "bg-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.5)]";
                  yOffset = -80; // Lift the target element
                }

                if (step.type === 'shift' && step.indices.includes(idx)) {
                  colorClass = "bg-cyan-600 shadow-[0_0_15px_rgba(34,211,238,0.2)]";
                }

                if (step.type === 'insert' && step.indices[0] === idx) {
                  colorClass = "bg-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.6)]";
                }

                if (step.type === 'complete') {
                  colorClass = "bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]";
                }

                return (
                  <motion.div
                    key={`${idx}-${val}`}
                    layout
                    transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                    style={{ height: `${val}%`, y: yOffset }}
                    className={`flex-1 min-w-[20px] rounded-t-xl relative ${colorClass} transition-all duration-300`}
                  >
                    <div className={`absolute -top-8 left-1/2 -translate-x-1/2 mono text-[10px] font-black ${isSearching || isTarget ? 'text-white' : 'text-slate-700'}`}>
                      {val}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Search range visuals */}
            {step.searchRange && step.type === 'search' && (
              <div
                className="absolute bottom-6 h-1 bg-cyan-500/10 rounded-full transition-all duration-500"
                style={{
                  left: `${(step.searchRange[0] / ARRAY_SIZE) * 100}%`,
                  width: `${((step.searchRange[1] - step.searchRange[0] + 1) / ARRAY_SIZE) * 100}%`
                }}
              >
                <div className="absolute inset-x-0 -top-4 flex justify-between px-2 text-[8px] mono text-cyan-500 uppercase font-black">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            )}
          </div>

          <div className="px-10 py-8 bg-slate-900/50 rounded-[2.5rem] border border-white/10 flex flex-col gap-8 shadow-inner">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex items-center gap-2">
                <button onClick={stepBackward} className="p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-colors text-slate-400"><StepBack size={20} /></button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-20 h-20 bg-cyan-600 text-white rounded-[2rem] flex items-center justify-center hover:bg-cyan-400 transition-all active:scale-95 shadow-xl shadow-cyan-500/20"
                >
                  {isPlaying ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} className="ml-1" />}
                </button>
                <button onClick={stepForward} className="p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-colors text-slate-400"><StepForward size={20} /></button>
                <button onClick={reset} className="p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-colors text-slate-400 ml-4"><RotateCcw size={20} /></button>
              </div>

              <div className="flex-1 w-full text-center md:text-left">
                <div className="flex items-center justify-between mono text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3">
                  <span>Logic Speed</span>
                  <span className="text-cyan-400">{speed}ms</span>
                </div>
                <div className="flex gap-4 items-center">
                  <input type="range" min="100" max="980" value={speed} onChange={(e) => setSpeed(parseInt(e.target.value))} className="flex-1 appearance-none bg-slate-800 h-1.5 rounded-full accent-cyan-500 cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="p-6 bg-cyan-500/5 rounded-2xl border border-cyan-500/10 flex gap-4">
              <div className="mt-1 p-2 bg-cyan-500/10 rounded-xl shrink-0">
                <Search size={16} className="text-cyan-400" />
              </div>
              <p className="text-sm text-slate-400 leading-relaxed font-medium italic">
                {step.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Code & Theory */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="p-10 bg-zinc-900/80 border border-white/5 rounded-[3rem] shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <Lightbulb className="text-amber-400 w-5 h-5" />
              <h2 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Concept_Data</h2>
            </div>
            <div className="p-6 bg-black/40 rounded-3xl border border-white/5 mb-8">
              <h3 className="text-cyan-400 font-black mb-3 text-sm">Binary Insertion Sort</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                挿入ソートの「挿入位置を探す」工程を、効率的な「二分探索」に置き換えた手法。比較回数を大幅に削減し、知的な並び替えを実現します。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mono text-[9px] font-black uppercase tracking-tighter">
              <div className="p-4 bg-white/5 rounded-2xl text-center border border-white/5 hover:border-cyan-500/20 transition-colors">
                <span className="text-slate-600 block mb-1">Comparisons</span>
                <span className="text-cyan-300">O(N log N)</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl text-center border border-white/5 hover:border-cyan-500/20 transition-colors">
                <span className="text-slate-600 block mb-1">Stability</span>
                <span className="text-emerald-400">Stable</span>
              </div>
            </div>
          </div>

          <div className="p-10 bg-black border border-white/5 rounded-[3rem] flex-1 flex flex-col min-h-[450px]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Code2 className="text-slate-600 w-5 h-5" />
                <h2 className="font-black text-[10px] uppercase tracking-widest text-slate-500">Exec_Kernel</h2>
              </div>
              <div className="w-2 h-2 rounded-full bg-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
            </div>

            <div className="flex-1 bg-zinc-950/30 p-8 rounded-3xl mono text-[10px] leading-loose overflow-auto border border-white/5 whitespace-nowrap scrollbar-hide">
              {CODE_PYTHON.map((line, i) => (
                <div
                  key={i}
                  className={`flex gap-6 transition-all duration-300 ${step.codeLine === i ? 'text-cyan-400 bg-cyan-400/10 -mx-8 px-8 border-l-2 border-cyan-400 font-bold' : 'text-slate-800'}`}
                >
                  <span className="text-slate-900 tabular-nums w-4 select-none opacity-50">{i + 1}</span>
                  <pre className="whitespace-pre">{line}</pre>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center opacity-20">
              <span className="text-[8px] mono text-slate-500 uppercase tracking-[0.5em]">optimized_insertion_v2</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-white/5 py-16 text-center">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          <Search className="text-slate-900 w-8 h-8 opacity-20" />
          <p className="text-[8px] mono text-slate-700 uppercase tracking-[0.8em]">Interactive_Learning_Series // Informatics_I</p>
        </div>
      </footer>
    </div>
  );
}
