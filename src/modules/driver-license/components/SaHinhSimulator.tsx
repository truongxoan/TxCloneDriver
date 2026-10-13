"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ChevronRight,
  HelpCircle,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  playClickSound,
  playCorrectSound,
  playWrongSound,
  playEngineRevSound,
  isSoundMuted,
  toggleSoundMute,
} from "@/lib/soundEffects";

export interface SimulatorScenario {
  id: string;
  title: string;
  category: "priority_vehicles" | "equal_crossroad" | "roundabout" | "priority_road" | "slope" | "overtaking";
  badge: string;
  description: string;
  ruleExplanation: string;
  tip: string;
  steps: {
    stepIndex: number;
    title: string;
    description: string;
    activeVehicleId: string;
  }[];
  correctOrder: string[]; // Vehicle IDs in correct order
  vehicles: {
    id: string;
    name: string;
    type: "fire" | "military" | "police" | "ambulance" | "car" | "truck" | "moto";
    color: string;
    startPos: { x: number; y: number; rot: number };
    endPos: { x: number; y: number; rot: number };
    directionLabel: string;
    priorityRank: number;
  }[];
}

const SIMULATOR_SCENARIOS: SimulatorScenario[] = [
  // 1. Ngã tư xe ưu tiên
  {
    id: "sc-priority-4",
    title: "1. Ngã Tư 4 Xe Ưu Tiên (Hỏa - Sự - An - Thương)",
    category: "priority_vehicles",
    badge: "🏎️ Xe Ưu Tiên Đặc Chủng",
    description: "Cả 4 xe ưu tiên đều phát tín hiệu còi đèn khẩn cấp tại cùng một ngã tư. Xe nào được quyền đi trước?",
    ruleExplanation:
      "Theo Điều 22 Luật GTĐB, thứ tự ưu tiên tuyệt đối khi cùng làm nhiệm vụ khẩn cấp là: 1. Xe Cứu Hỏa &rarr; 2. Xe Quân Sự &rarr; 3. Xe Công An &rarr; 4. Xe Cứu Thương.",
    tip: "Mẹo thần chú: 'HỎA - SỰ - AN - THƯƠNG'. Cứu hỏa luôn luôn đi đầu tiên!",
    steps: [
      { stepIndex: 1, title: "Bước 1: Xe Cứu Hỏa xuất phát", description: "Cứu hỏa có tính cấp bách cao nhất liên quan cháy nổ.", activeVehicleId: "v-fire" },
      { stepIndex: 2, title: "Bước 2: Xe Quân Sự xuất phát", description: "Bảo vệ an ninh quốc phòng ưu tiên thứ hai.", activeVehicleId: "v-military" },
      { stepIndex: 3, title: "Bước 3: Xe Công An xuất phát", description: "Nhiệm vụ trật tự an toàn xã hội ưu tiên thứ ba.", activeVehicleId: "v-police" },
      { stepIndex: 4, title: "Bước 4: Xe Cứu Thương xuất phát", description: "Vận chuyển người bệnh đi sau các xe an ninh hỏa hoạn.", activeVehicleId: "v-ambulance" },
    ],
    correctOrder: ["v-fire", "v-military", "v-police", "v-ambulance"],
    vehicles: [
      { id: "v-fire", name: "Xe Cứu Hỏa", type: "fire", color: "#dc2626", startPos: { x: 310, y: 340, rot: 0 }, endPos: { x: 310, y: 40, rot: 0 }, directionLabel: "Đi thẳng", priorityRank: 1 },
      { id: "v-military", name: "Xe Quân Sự", type: "military", color: "#15803d", startPos: { x: 100, y: 235, rot: 90 }, endPos: { x: 500, y: 235, rot: 90 }, directionLabel: "Đi thẳng", priorityRank: 2 },
      { id: "v-police", name: "Xe Công An", type: "police", color: "#1d4ed8", startPos: { x: 440, y: 175, rot: -90 }, endPos: { x: 40, y: 175, rot: -90 }, directionLabel: "Đi thẳng", priorityRank: 3 },
      { id: "v-ambulance", name: "Xe Cứu Thương", type: "ambulance", color: "#e2e8f0", startPos: { x: 250, y: 40, rot: 180 }, endPos: { x: 250, y: 340, rot: 180 }, directionLabel: "Đi thẳng", priorityRank: 4 },
    ],
  },

  // 2. Ngã tư đồng cấp
  {
    id: "sc-equal-intersection",
    title: "2. Ngã Tư Đồng Cấp (Bên Phải Không Vướng & Hướng Rẽ)",
    category: "equal_crossroad",
    badge: "🛑 Ngã Tư Không Đèn",
    description: "Ngã tư không có biển báo ưu tiên và không có tín hiệu đèn. Xe nào đi trước?",
    ruleExplanation:
      "Tại nơi giao nhau đồng cấp: Xe có phía bên phải trống (không vướng) được đi trước. Kế tiếp ưu tiên theo hướng: Rẽ Phải &rarr; Đi Thẳng &rarr; Rẽ Trái.",
    tip: "Mẹo nhớ: Nhất chớm, nhì ưu, tam đường, tứ hướng. Xe bên phải trống luôn đi đầu!",
    steps: [
      { stepIndex: 1, title: "Bước 1: Xe Mô Tô đi trước", description: "Phía bên phải xe mô tô trống hoàn toàn, được xuất phát trước.", activeVehicleId: "v-moto" },
      { stepIndex: 2, title: "Bước 2: Xe Con đi tiếp theo", description: "Sau khi mô tô đi qua, bên phải xe con không còn vướng.", activeVehicleId: "v-car" },
      { stepIndex: 3, title: "Bước 3: Xe Tải đi sau cùng", description: "Xe tải rẽ trái phải nhường đường cho xe đi thẳng.", activeVehicleId: "v-truck" },
    ],
    correctOrder: ["v-moto", "v-car", "v-truck"],
    vehicles: [
      { id: "v-moto", name: "Xe Mô Tô", type: "moto", color: "#3b82f6", startPos: { x: 310, y: 330, rot: 0 }, endPos: { x: 310, y: 50, rot: 0 }, directionLabel: "Đi thẳng (Bên phải trống)", priorityRank: 1 },
      { id: "v-car", name: "Xe Con", type: "car", color: "#eab308", startPos: { x: 440, y: 180, rot: -90 }, endPos: { x: 60, y: 180, rot: -90 }, directionLabel: "Đi thẳng", priorityRank: 2 },
      { id: "v-truck", name: "Xe Tải", type: "truck", color: "#ef4444", startPos: { x: 250, y: 50, rot: 180 }, endPos: { x: 440, y: 220, rot: 90 }, directionLabel: "Rẽ trái", priorityRank: 3 },
    ],
  },

  // 3. Vòng xuyến
  {
    id: "sc-roundabout",
    title: "3. Bùng Binh Vòng Xuyến (Nhường Đường Bên Trái)",
    category: "roundabout",
    badge: "↻ Đảo An Toàn",
    description: "Xe A đã ở trong vòng xuyến, xe B chuẩn bị đi vào. Xe nào phải nhường đường?",
    ruleExplanation:
      "Tại nơi giao nhau có biển báo hiệu đi theo vòng xuyến (R.303): Bắt buộc phải nhường đường cho xe đi từ BÊN TRÁI tới (xe đã vào trong vòng xuyến).",
    tip: "Mẹo: CÓ biển vòng xuyến nhường TRÁI; KHÔNG CÓ biển vòng xuyến nhường PHẢI.",
    steps: [
      { stepIndex: 1, title: "Bước 1: Xe A (đã trong bùng binh) đi trước", description: "Xe A đã nằm trong vòng xuyến bên trái xe B, được quyền đi tiếp.", activeVehicleId: "v-round-a" },
      { stepIndex: 2, title: "Bước 2: Xe B tiến vào sau", description: "Xe B phải nhường đường, đợi xe A đi qua rồi mới hòa vào làn.", activeVehicleId: "v-round-b" },
    ],
    correctOrder: ["v-round-a", "v-round-b"],
    vehicles: [
      { id: "v-round-a", name: "Xe A (Trong vòng xuyến)", type: "car", color: "#3b82f6", startPos: { x: 230, y: 120, rot: 45 }, endPos: { x: 380, y: 240, rot: 120 }, directionLabel: "Đang lưu thông trong đảo", priorityRank: 1 },
      { id: "v-round-b", name: "Xe B (Đang đi vào)", type: "car", color: "#ef4444", startPos: { x: 290, y: 340, rot: 0 }, endPos: { x: 270, y: 220, rot: -30 }, directionLabel: "Chuẩn bị vào vòng xuyến", priorityRank: 2 },
    ],
  },

  // 4. Đường dốc hẹp
  {
    id: "sc-slope",
    title: "4. Đường Dốc Hẹp (Xe Xuống Dốc Nhường Đường)",
    category: "slope",
    badge: "⛰️ Đường Đèo Dốc Hẹp",
    description: "Đường dốc hẹp có chướng ngại vật phía trước xe xuống dốc. Xe nào phải dừng lại nhường đường?",
    ruleExplanation:
      "Xe xuống dốc phải nhường đường cho xe đang lên dốc. Do xe đang lên dốc chịu tải nặng và quán tính khó dừng lại giữa dốc, nếu dừng lại có nguy cơ tụt dốc gây tai nạn.",
    tip: "Mẹo nằm lòng: 'XUỐNG DỐC NHƯỜNG LÊN DỐC'.",
    steps: [
      { stepIndex: 1, title: "Bước 1: Xe A (Đang lên dốc) đi trước", description: "Xe lên dốc giữ đà di chuyển qua đoạn đường hẹp.", activeVehicleId: "v-slope-up" },
      { stepIndex: 2, title: "Bước 2: Xe B (Đang xuống dốc) dừng chờ", description: "Xe xuống dốc dừng tại vị trí an toàn nhường đường.", activeVehicleId: "v-slope-down" },
    ],
    correctOrder: ["v-slope-up", "v-slope-down"],
    vehicles: [
      { id: "v-slope-up", name: "Xe A (Lên dốc)", type: "car", color: "#10b981", startPos: { x: 100, y: 290, rot: -20 }, endPos: { x: 450, y: 150, rot: -20 }, directionLabel: "Lên dốc - Ưu tiên đi trước", priorityRank: 1 },
      { id: "v-slope-down", name: "Xe B (Xuống dốc)", type: "truck", color: "#ef4444", startPos: { x: 450, y: 120, rot: 160 }, endPos: { x: 100, y: 260, rot: 160 }, directionLabel: "Xuống dốc - Dừng nhường", priorityRank: 2 },
    ],
  },

  // 5. Đường ưu tiên
  {
    id: "sc-priority-road",
    title: "5. Giao Lộ Có Biển Đường Ưu Tiên (Biển I.401 & W.208)",
    category: "priority_road",
    badge: "🔶 Biển Đường Ưu Tiên",
    description: "Xe Con trên trục đường cắm biển I.401, Xe Tải trên đường cắm biển tam giác ngược W.208.",
    ruleExplanation:
      "Xe đi trên đường có biển I.401 (Hình thoi vàng) là đường ưu tiên, được quyền đi trước qua nơi giao nhau. Xe có biển W.208 chúc đầu xuống là đường phụ phải nhường.",
    tip: "Mẹo: Thấy biển tam giác ngược W.208 trước mũi xe nào thì xe đó PHẢI NHƯỜNG ĐƯỜNG.",
    steps: [
      { stepIndex: 1, title: "Bước 1: Xe Con trên đường ưu tiên đi trước", description: "Biển I.401 cho phép xe con ưu tiên qua giao lộ.", activeVehicleId: "v-prio-car" },
      { stepIndex: 2, title: "Bước 2: Xe Tải từ đường phụ đi sau", description: "Biển W.208 bắt buộc xe tải giảm tốc nhường đường.", activeVehicleId: "v-prio-truck" },
    ],
    correctOrder: ["v-prio-car", "v-prio-truck"],
    vehicles: [
      { id: "v-prio-car", name: "Xe Con (Đường ưu tiên)", type: "car", color: "#10b981", startPos: { x: 300, y: 340, rot: 0 }, endPos: { x: 300, y: 40, rot: 0 }, directionLabel: "Biển I.401 Ưu tiên", priorityRank: 1 },
      { id: "v-prio-truck", name: "Xe Tải (Đường phụ)", type: "truck", color: "#f97316", startPos: { x: 440, y: 180, rot: -90 }, endPos: { x: 40, y: 180, rot: -90 }, directionLabel: "Biển W.208 Phải nhường", priorityRank: 2 },
    ],
  },

  // 6. Cấm vượt vạch liền
  {
    id: "sc-overtake-solid",
    title: "6. Tình Huống Vượt Xe (Vạch Nét Liền Màu Vàng)",
    category: "overtaking",
    badge: "⚠️ Vạch Kẻ Đường",
    description: "Xe con tăng tốc đè qua vạch nét liền màu vàng để vượt xe tải đang đi chậm.",
    ruleExplanation:
      "QCVN 41:2019 quy định vạch nét liền màu vàng phân chia 2 chiều xe chạy ngược chiều cấm đè vạch, cấm lấn làn để vượt xe. Hành vi này vi phạm nghiêm trọng có nguy cơ đối đầu trực diện.",
    tip: "Mẹo: Vạch nét liền = CẤM ĐÈ VẠCH, CẤM VƯỢT.",
    steps: [
      { stepIndex: 1, title: "Bước 1: Xe Tải chạy đúng làn", description: "Xe tải đi chậm giữ đúng phần đường bên phải.", activeVehicleId: "v-ot-truck" },
      { stepIndex: 2, title: "Bước 2: Xe Con vượt trái phép gây nguy hiểm", description: "Xe con lấn sang làn ngược chiều qua vạch nét liền là sai quy định.", activeVehicleId: "v-ot-car" },
    ],
    correctOrder: ["v-ot-truck", "v-ot-car"],
    vehicles: [
      { id: "v-ot-truck", name: "Xe Tải (Đi đúng)", type: "truck", color: "#f97316", startPos: { x: 350, y: 180, rot: 0 }, endPos: { x: 350, y: 40, rot: 0 }, directionLabel: "Làn phải chuẩn", priorityRank: 1 },
      { id: "v-ot-car", name: "Xe Con (Vượt ẩu)", type: "car", color: "#ef4444", startPos: { x: 350, y: 320, rot: 0 }, endPos: { x: 240, y: 140, rot: -20 }, directionLabel: "Đè vạch nét liền (SAI)", priorityRank: 2 },
    ],
  },
];

export function SaHinhSimulator() {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [mode, setMode] = useState<"demo" | "challenge">("demo");
  const [userSelectedOrder, setUserSelectedOrder] = useState<string[]>([]);
  const [challengeResult, setChallengeResult] = useState<"correct" | "wrong" | null>(null);
  const [muted, setMuted] = useState(false);

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const scenario = SIMULATOR_SCENARIOS[selectedScenarioIndex];

  useEffect(() => {
    setMuted(isSoundMuted());
  }, []);

  // Reset simulator state when switching scenario or mode
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentStepIndex(0);
    setUserSelectedOrder([]);
    setChallengeResult(null);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [selectedScenarioIndex, mode]);

  // Main animation ticker loop
  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      return;
    }

    const duration = 4000 / playbackSpeed; // 4 seconds total for 100%

    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      setProgress((prev) => {
        const next = prev + (delta / duration) * 100;
        if (next >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return next;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, playbackSpeed]);

  // Update current active step based on progress
  useEffect(() => {
    const totalSteps = scenario.steps.length;
    const stepRatio = 100 / totalSteps;
    const stepIdx = Math.min(totalSteps - 1, Math.floor(progress / stepRatio));
    setCurrentStepIndex(stepIdx);
  }, [progress, scenario.steps.length]);

  const handleTogglePlay = () => {
    playClickSound();
    if (!isPlaying && progress >= 100) {
      setProgress(0);
    }
    if (!isPlaying) {
      playEngineRevSound();
    }
    setIsPlaying((prev) => !prev);
  };

  const handleReset = () => {
    playClickSound();
    setIsPlaying(false);
    setProgress(0);
    setCurrentStepIndex(0);
    setChallengeResult(null);
    setUserSelectedOrder([]);
  };

  const handleStepJump = (idx: number) => {
    playClickSound();
    setIsPlaying(false);
    const stepRatio = 100 / scenario.steps.length;
    setProgress(idx * stepRatio + 5);
    setCurrentStepIndex(idx);
  };

  const handleToggleMute = () => {
    const state = toggleSoundMute();
    setMuted(state);
  };

  // Interactive Puzzle: User clicks on vehicle to set order
  const handleVehicleClickInChallenge = (vId: string) => {
    if (mode !== "challenge" || challengeResult !== null) return;
    playClickSound();

    if (userSelectedOrder.includes(vId)) {
      setUserSelectedOrder((prev) => prev.filter((id) => id !== vId));
    } else {
      setUserSelectedOrder((prev) => [...prev, vId]);
    }
  };

  const handleCheckChallenge = () => {
    const isCorrect =
      userSelectedOrder.length === scenario.correctOrder.length &&
      userSelectedOrder.every((id, idx) => id === scenario.correctOrder[idx]);

    if (isCorrect) {
      playCorrectSound();
      setChallengeResult("correct");
      setIsPlaying(true); // Run animation in victory!
      try {
        const c = parseInt(localStorage.getItem("txclonedriver_fun_coins") || "50000", 10);
        localStorage.setItem("txclonedriver_fun_coins", (c + 1000).toString());
      } catch {}
    } else {
      playWrongSound();
      setChallengeResult("wrong");
    }
  };

  // Calculate current vehicle animated positions based on progress & priority
  const totalVehicles = scenario.vehicles.length;

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl glass-panel border border-white/10 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
            <span>{scenario.badge}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">{scenario.title}</h3>
          <p className="text-xs text-muted-foreground">{scenario.description}</p>
        </div>

        {/* Mode Selector & Sound Toggle */}
        <div className="flex items-center gap-2 self-end md:self-center">
          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
              muted
                ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                : "bg-white/5 text-muted-foreground hover:text-white border-white/10"
            }`}
            title={muted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <div className="flex p-1 rounded-2xl bg-black/40 border border-white/10 text-xs font-bold">
            <button
              onClick={() => setMode("demo")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                mode === "demo" ? "bg-blue-600 text-white shadow-md shadow-blue-500/30" : "text-muted-foreground hover:text-white"
              }`}
            >
              Mô Phỏng Tự Động
            </button>
            <button
              onClick={() => setMode("challenge")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                mode === "challenge" ? "bg-amber-600 text-white shadow-md shadow-amber-500/30" : "text-muted-foreground hover:text-white"
              }`}
            >
              Đố Vui Giải Sa Hình
            </button>
          </div>
        </div>
      </div>

      {/* Scenario Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {SIMULATOR_SCENARIOS.map((sc, idx) => (
          <button
            key={sc.id}
            onClick={() => {
              playClickSound();
              setSelectedScenarioIndex(idx);
            }}
            className={`px-3.5 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${
              selectedScenarioIndex === idx
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                : "glass-card border-white/10 text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            {idx + 1}. {sc.title.split("(")[0]}
          </button>
        ))}
      </div>

      {/* Main Interactive Stage & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center Canvas Area (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-slate-950 p-4 shadow-2xl flex flex-col items-center justify-center min-h-[380px] sm:min-h-[440px]">
            {/* SVG Stage */}
            <svg viewBox="0 0 600 420" className="w-full h-auto max-h-[420px] select-none">
              {/* Road Asphalt Background */}
              <rect width="600" height="420" fill="#0f172a" rx="16" />

              {/* Roads according to scenario category */}
              {scenario.category !== "slope" ? (
                <>
                  {/* 4-Way Crossroad */}
                  <rect x="0" y="145" width="600" height="130" fill="#1e293b" />
                  <rect x="235" y="0" width="130" height="420" fill="#1e293b" />

                  {/* Markings */}
                  <line x1="0" y1="210" x2="235" y2="210" stroke="#facc15" stroke-dasharray="10,10" stroke-width="3" />
                  <line x1="365" y1="210" x2="600" y2="210" stroke="#facc15" stroke-dasharray="10,10" stroke-width="3" />
                  <line x1="300" y1="0" x2="300" y2="145" stroke="#facc15" stroke-dasharray="10,10" stroke-width="3" />
                  <line x1="300" y1="275" x2="300" y2="420" stroke="#facc15" stroke-dasharray="10,10" stroke-width="3" />

                  {/* Crosswalk stripes */}
                  {[150, 165, 180, 195, 210, 225, 240, 255].map((y) => (
                    <line key={`cw-w-${y}`} x1="215" y1={y} x2="230" y2={y} stroke="#cbd5e1" stroke-width="4" />
                  ))}
                  {[150, 165, 180, 195, 210, 225, 240, 255].map((y) => (
                    <line key={`cw-e-${y}`} x1="370" y1={y} x2="385" y2={y} stroke="#cbd5e1" stroke-width="4" />
                  ))}
                </>
              ) : (
                /* Mountain Slope Road */
                <>
                  <polygon points="40,360 560,120 560,220 40,420" fill="#1e293b" />
                  <line x1="60" y1="340" x2="540" y2="135" stroke="#facc15" stroke-dasharray="10,10" stroke-width="3" />
                </>
              )}

              {/* Roundabout Island if category is roundabout */}
              {scenario.category === "roundabout" && (
                <>
                  <circle cx="300" cy="210" r="110" fill="#1e293b" stroke="#475569" stroke-width="3" />
                  <circle cx="300" cy="210" r="50" fill="#065f46" stroke="#34d399" stroke-width="3" />
                  <text x="300" y="217" text-anchor="middle" fill="#ffffff" font-size="22" font-weight="bold">↻</text>
                </>
              )}

              {/* Render Animated Vehicles */}
              {scenario.vehicles.map((v) => {
                // Determine animated vehicle progress fraction [0..1]
                const rankIndex = v.priorityRank - 1;
                const stepFraction = 1 / totalVehicles;
                const startThreshold = rankIndex * stepFraction;
                const endThreshold = (rankIndex + 1) * stepFraction;

                let vehicleProgress = 0;
                if (progress / 100 > startThreshold) {
                  vehicleProgress = Math.min(1, (progress / 100 - startThreshold) / stepFraction);
                }

                // Smooth interpolate position
                const currentX = v.startPos.x + (v.endPos.x - v.startPos.x) * vehicleProgress;
                const currentY = v.startPos.y + (v.endPos.y - v.startPos.y) * vehicleProgress;
                const currentRot = v.startPos.rot + (v.endPos.rot - v.startPos.rot) * vehicleProgress;

                const isCurrentlyActive = scenario.steps[currentStepIndex]?.activeVehicleId === v.id;
                const challengeOrderIndex = userSelectedOrder.indexOf(v.id);

                return (
                  <g
                    key={v.id}
                    transform={`translate(${currentX}, ${currentY}) rotate(${currentRot})`}
                    onClick={() => handleVehicleClickInChallenge(v.id)}
                    className="cursor-pointer transition-all duration-75"
                  >
                    {/* Active vehicle glowing aura */}
                    {(isCurrentlyActive || vehicleProgress > 0) && (
                      <circle cx="0" cy="0" r="34" fill={v.color} fillOpacity="0.25" className="animate-pulse" />
                    )}

                    {/* Vehicle Body Box */}
                    <rect
                      x="-18"
                      y="-32"
                      width="36"
                      height="64"
                      rx="8"
                      fill={v.color}
                      stroke="#ffffff"
                      strokeWidth={isCurrentlyActive ? "3" : "1.5"}
                    />

                    {/* Windshield */}
                    <rect x="-12" y="-22" width="24" height="14" rx="3" fill="#0f172a" fillOpacity="0.8" />

                    {/* Flashing light for emergency vehicles */}
                    {(v.type === "fire" || v.type === "police" || v.type === "ambulance") && (
                      <circle cx="0" cy="-28" r="4" fill="#facc15" className="animate-ping" />
                    )}

                    {/* Direction Arrow */}
                    <path d="M 0 -36 L -6 -44 L 6 -44 Z" fill="#ffffff" />

                    {/* Challenge selection badge if picked by user */}
                    {mode === "challenge" && challengeOrderIndex !== -1 && (
                      <g transform="translate(0, 0)">
                        <circle cx="0" cy="0" r="14" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                        <text
                          x="0"
                          y="5"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontFamily="sans-serif"
                          fontSize="12"
                          fontWeight="bold"
                        >
                          {challengeOrderIndex + 1}
                        </text>
                      </g>
                    )}

                    {/* Vehicle Name Tag */}
                    <g transform={`rotate(${-currentRot}) translate(0, 42)`}>
                      <rect x="-55" y="-10" width="110" height="20" rx="6" fill="#0f172a" fillOpacity="0.9" stroke="#ffffff" strokeWidth="0.8" />
                      <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontFamily="sans-serif" fontSize="10" fontWeight="bold">
                        {v.name}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>

            {/* Bottom Timeline & Controls Inside Stage */}
            <div className="w-full mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTogglePlay}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-transform active:scale-95"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? "Tạm Dừng" : "Phát Mô Phỏng"}</span>
                </button>
                <button
                  onClick={handleReset}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Tua lại từ đầu"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Speed Buttons */}
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                {([1, 1.5, 2] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      playClickSound();
                      setPlaybackSpeed(s);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      playbackSpeed === s ? "bg-white/20 text-white" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              {/* Progress Slider */}
              <div className="flex items-center gap-2 min-w-[140px] flex-1 max-w-xs">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setProgress(Number(e.target.value));
                  }}
                  className="w-full accent-blue-500 cursor-pointer h-1.5 rounded-lg bg-white/20"
                />
                <span className="font-mono text-[11px] text-muted-foreground w-9 text-right">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          </div>

          {/* Step Selector in Demo Mode */}
          {mode === "demo" && (
            <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase block">
                Xem chi tiết từng bước xe di chuyển:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {scenario.steps.map((st, sIdx) => (
                  <button
                    key={st.stepIndex}
                    onClick={() => handleStepJump(sIdx)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      currentStepIndex === sIdx
                        ? "bg-blue-600/30 border-blue-500 text-blue-200 ring-1 ring-blue-500 font-bold"
                        : "bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <div className="text-[10px] font-black uppercase text-sky-400">Bước #{st.stepIndex}</div>
                    <div className="text-xs truncate font-semibold mt-0.5">{st.title.split(":")[1] || st.title}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Info & Interactive Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {mode === "demo" ? (
            /* Mode 1: Detailed Explanations & Active Step */
            <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-5 shadow-xl">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm pb-3 border-b border-white/10">
                <Lightbulb className="w-5 h-5 text-amber-400" /> Quy Tắc Ưu Tiên Chuẩn Luật
              </div>

              {/* Active Step Box */}
              <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-1.5 animate-in fade-in-50">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-500 text-white uppercase">
                  Đang diễn ra (Bước {currentStepIndex + 1}/{scenario.steps.length})
                </span>
                <h4 className="text-sm font-bold text-white pt-1">
                  {scenario.steps[currentStepIndex]?.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {scenario.steps[currentStepIndex]?.description}
                </p>
              </div>

              {/* Legal Reference */}
              <div className="space-y-2 text-xs leading-relaxed text-slate-300">
                <strong className="text-white block font-bold">Căn cứ pháp lý:</strong>
                <p className="p-3 rounded-xl bg-black/40 border border-white/10 text-muted-foreground">
                  {scenario.ruleExplanation}
                </p>
              </div>

              {/* Quick Tip */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-start gap-2">
                <span className="text-base shrink-0">⚡</span>
                <span className="leading-snug">{scenario.tip}</span>
              </div>
            </div>
          ) : (
            /* Mode 2: Interactive Puzzle Challenge */
            <div className="p-6 rounded-3xl glass-panel border border-amber-500/30 space-y-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Thử Thách Giải Sa Hình
                </span>
                <span className="text-[11px] text-muted-foreground">Chọn thứ tự đi</span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                Hãy click vào các xe trên sa hình theo <strong>thứ tự quyền được đi trước</strong>:
              </p>

              {/* Selected List Pills */}
              <div className="space-y-2">
                {scenario.vehicles.map((v) => {
                  const pickIdx = userSelectedOrder.indexOf(v.id);
                  const isPicked = pickIdx !== -1;

                  return (
                    <button
                      key={v.id}
                      onClick={() => handleVehicleClickInChallenge(v.id)}
                      className={`w-full p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                        isPicked
                          ? "bg-sky-600/30 border-sky-400 text-sky-200 ring-1 ring-sky-400"
                          : "bg-white/5 border-white/10 text-muted-foreground hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full inline-block shrink-0"
                          style={{ backgroundColor: v.color }}
                        />
                        <span>{v.name}</span>
                      </div>
                      {isPicked ? (
                        <span className="px-2 py-0.5 rounded-md bg-sky-500 text-white text-[11px]">
                          Vị trí #{pickIdx + 1}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">+ Bấm để chọn</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Check Button & Result */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleCheckChallenge}
                  disabled={userSelectedOrder.length === 0}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:opacity-95 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 disabled:opacity-40 transition-transform active:scale-95"
                >
                  Kiểm Tra & Chạy Thử
                </button>

                {challengeResult === "correct" && (
                  <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs space-y-1.5 animate-in zoom-in-95">
                    <div className="font-black flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" /> CHÍNH XÁC 100%! (+1,000 Xu)
                    </div>
                    <p className="text-[11px] leading-snug">{scenario.ruleExplanation}</p>
                  </div>
                )}

                {challengeResult === "wrong" && (
                  <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs space-y-1.5 animate-in zoom-in-95">
                    <div className="font-black flex items-center gap-1.5 text-rose-400">
                      <AlertTriangle className="w-4 h-4" /> CHƯA ĐÚNG! NGUY CƠ VA CHẠM!
                    </div>
                    <p className="text-[11px] leading-snug">
                      Gợi ý: {scenario.tip}
                    </p>
                    <button
                      onClick={() => {
                        playClickSound();
                        setUserSelectedOrder([]);
                        setChallengeResult(null);
                      }}
                      className="mt-1 text-[11px] font-bold text-amber-300 underline block"
                    >
                      Bấm để thử chọn lại thứ tự &rarr;
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
