"use client";

import { useEffect, useMemo, useState } from "react";

type Tab = "home" | "train" | "calendar" | "food" | "profile";
type ProfileView = "main" | "theme" | "equipment" | "data" | "install";
type TrainCategory = "strength" | "sport";

type TrainingActivity = {
  id: string;
  name: string;
  icon: string;
  desc: string;
  actions: { name: string; dose: string; cue: string }[];
};
type Checkin = {
  date: string;
  minutes: number;
  parts: string[];
  moves: number;
  note: string;
};

type PlannedActivity = {
  id: string;
  date: string;
  start: string;
  end: string;
  sport: string;
  note: string;
};
type ThemeState = {
  preset: string;
  background: string;
};

type AppState = {
  selectedParts: string[];
  foodKcal: number;
  checkins: Checkin[];
  schedule: { time: string; name: string }[];
  plans: PlannedActivity[];
  theme: ThemeState;
};

const STORAGE_KEY = "fitdaily-pwa-v1";

const themePresets = [
  { id: "pink", name: "樱花粉", accent: "#ff6d98", accent2: "#ff87ab", background: "#fff7fa", soft: "#fff1f6" },
  { id: "lavender", name: "薰衣草", accent: "#8d78e8", accent2: "#aa98f2", background: "#f8f5ff", soft: "#f1edff" },
  { id: "mint", name: "薄荷绿", accent: "#46aa89", accent2: "#69c5a7", background: "#f3fbf8", soft: "#eaf8f3" },
  { id: "peach", name: "蜜桃橙", accent: "#f28b69", accent2: "#f5aa8f", background: "#fff7f2", soft: "#fff0e8" },
  { id: "sky", name: "晴空蓝", accent: "#5f9eea", accent2: "#83b7f2", background: "#f4f9ff", soft: "#eaf4ff" },
  { id: "mono", name: "奶油灰", accent: "#66636d", accent2: "#89858f", background: "#f8f7f5", soft: "#f0eeeb" },
] as const;

const strengthActivities: TrainingActivity[] = [
  { id:"chest", name:"胸部", icon:"🏋️", desc:"推类力量训练", actions:[
    { name:"杠铃卧推", dose:"4组 × 6–8次", cue:"肩胛稳定、双脚踩稳，优先保证动作控制。" },
    { name:"上斜哑铃卧推", dose:"3组 × 8–10次", cue:"凳面保持适中角度，感受胸上部发力。" },
    { name:"器械夹胸", dose:"3组 × 10–15次", cue:"动作末端停顿，不要用惯性甩动。" }
  ]},
  { id:"back", name:"背部", icon:"🧍", desc:"背阔肌与中上背", actions:[
    { name:"高位下拉", dose:"4组 × 8–10次", cue:"肘向下带动，避免只用手臂拉。" },
    { name:"坐姿划船", dose:"3组 × 8–12次", cue:"躯干稳定，把肘向身体后侧带。" },
    { name:"单臂哑铃划船", dose:"3组 × 10次", cue:"保持脊柱稳定，控制回程。" }
  ]},
  { id:"legs", name:"腿部", icon:"🦵", desc:"下肢力量训练", actions:[
    { name:"深蹲", dose:"4组 × 6–8次", cue:"膝盖方向与脚尖一致，保持躯干稳定。" },
    { name:"腿举", dose:"4组 × 10次", cue:"控制下放，不要在顶端猛烈锁膝。" },
    { name:"罗马尼亚硬拉", dose:"3组 × 8–10次", cue:"髋部向后移动，感受腿后侧拉伸。" }
  ]},
  { id:"shoulders", name:"肩部", icon:"🙋", desc:"肩部稳定与围度", actions:[
    { name:"哑铃推举", dose:"3组 × 8–10次", cue:"保持核心稳定，避免腰部过度后仰。" },
    { name:"哑铃侧平举", dose:"4组 × 12–15次", cue:"重量不必过大，避免耸肩借力。" },
    { name:"绳索面拉", dose:"3组 × 12–15次", cue:"肘部向外，感受后束和肩胛参与。" }
  ]},
  { id:"arms", name:"手臂", icon:"💪", desc:"肱二头与肱三头", actions:[
    { name:"哑铃弯举", dose:"3组 × 10–12次", cue:"固定上臂，减少身体摆动。" },
    { name:"绳索下压", dose:"3组 × 10–12次", cue:"肘部贴近身体，控制回程。" },
    { name:"锤式弯举", dose:"3组 × 10次", cue:"手腕保持中立，避免甩动。" }
  ]},
  { id:"core", name:"核心", icon:"🧘", desc:"核心稳定训练", actions:[
    { name:"平板支撑", dose:"3组 × 30–60秒", cue:"保持身体一条直线，不塌腰。" },
    { name:"死虫", dose:"3组 × 10次/侧", cue:"腰背保持稳定贴地，动作放慢。" },
    { name:"卷腹", dose:"3组 × 12–15次", cue:"避免颈部发力，控制躯干卷起。" }
  ]},
  { id:"glutes", name:"臀部", icon:"🍑", desc:"臀腿后侧训练", actions:[
    { name:"臀桥", dose:"4组 × 10–12次", cue:"顶端夹紧臀部，不要过度顶腰。" },
    { name:"保加利亚分腿蹲", dose:"3组 × 8–10次/侧", cue:"前脚踩稳，保持膝盖轨迹。" },
    { name:"绳索后踢", dose:"3组 × 12次/侧", cue:"骨盆保持稳定，避免身体大幅前倾。" }
  ]},
  { id:"fullbody", name:"全身", icon:"🤸", desc:"全身综合训练", actions:[
    { name:"壶铃摆动", dose:"4组 × 15次", cue:"以髋伸发力，不要只用手臂抬起。" },
    { name:"深蹲推举", dose:"3组 × 10次", cue:"先稳定下肢，再顺势完成推举。" },
    { name:"农夫行走", dose:"4组 × 30–45秒", cue:"保持躯干直立和稳定呼吸。" }
  ]},
  { id:"cardio", name:"有氧", icon:"🏃", desc:"器械心肺训练", actions:[
    { name:"坡度快走", dose:"25–40分钟", cue:"保持可持续节奏，不必追求过高速度。" },
    { name:"椭圆机", dose:"20–35分钟", cue:"保持动作连贯，控制呼吸。" },
    { name:"划船机", dose:"15–25分钟", cue:"先蹬腿再拉手，避免只靠上肢。" }
  ]}
];

const sportActivities: TrainingActivity[] = [
  { id:"swimming", name:"游泳", icon:"🏊", desc:"心肺 · 全身协调", actions:[
    { name:"自由泳", dose:"20–30分钟", cue:"保持均匀呼吸和稳定节奏，优先动作质量。" },
    { name:"蛙泳", dose:"20–30分钟", cue:"注意蹬夹水节奏，避免膝关节过度外翻。" },
    { name:"打腿练习", dose:"6–10组 × 25米", cue:"专注身体流线与脚踝放松。" },
    { name:"间歇游", dose:"8组 × 50米", cue:"组间充分恢复，速度以可控为主。" }
  ]},
  { id:"badminton", name:"羽毛球", icon:"🏸", desc:"灵敏 · 爆发 · 心肺", actions:[
    { name:"多球步伐", dose:"6组 × 45秒", cue:"保持重心稳定，先到位再击球。" },
    { name:"高远球练习", dose:"10–15分钟", cue:"注意转体和挥拍连贯，不只用手臂发力。" },
    { name:"网前搓放", dose:"10分钟", cue:"控制拍面，动作轻柔，减少大幅挥拍。" },
    { name:"实战对打", dose:"30–45分钟", cue:"以节奏和落点为主，疲劳后降低强度。" }
  ]},
  { id:"running", name:"跑步", icon:"🏃", desc:"耐力 · 心肺", actions:[
    { name:"轻松跑", dose:"30–45分钟", cue:"以能正常交流的强度为主。" },
    { name:"节奏跑", dose:"20–30分钟", cue:"强度略高但保持稳定，不做全力冲刺。" },
    { name:"间歇跑", dose:"6组 × 2分钟", cue:"快段与恢复段交替，逐步增加训练量。" }
  ]},
  { id:"cycling", name:"骑行", icon:"🚴", desc:"低冲击耐力训练", actions:[
    { name:"轻松骑", dose:"40–60分钟", cue:"保持顺畅踏频，避免一开始阻力过大。" },
    { name:"耐力骑", dose:"60–90分钟", cue:"补充水分，保持稳定功率和节奏。" },
    { name:"间歇骑", dose:"6组 × 3分钟", cue:"快慢交替，恢复段充分放松。" }
  ]},
  { id:"rope", name:"跳绳", icon:"🪢", desc:"协调 · 心肺 · 小腿", actions:[
    { name:"基础双脚跳", dose:"8组 × 1分钟", cue:"小幅弹跳，落地轻柔。" },
    { name:"间歇跳绳", dose:"10轮 40秒/20秒", cue:"逐步提高节奏，不追求一次性极限。" },
    { name:"双摇练习", dose:"5–8组 × 技术练习", cue:"先稳定基础跳，再增加手腕转速。" }
  ]},
  { id:"yoga", name:"瑜伽拉伸", icon:"🧘", desc:"恢复 · 柔韧 · 放松", actions:[
    { name:"流瑜伽", dose:"20–30分钟", cue:"动作与呼吸配合，以舒适范围为主。" },
    { name:"髋部拉伸", dose:"10–15分钟", cue:"避免弹震式拉伸，缓慢进入幅度。" },
    { name:"肩背放松", dose:"10分钟", cue:"保持均匀呼吸，不强行压到疼痛范围。" }
  ]}
];


const equipment = [
  { name: "杠铃卧推", icon: "🏋️", tip: "肩胛稳定、双脚踩稳，大重量时设置保护杆或找保护者。" },
  { name: "高位下拉", icon: "🧲", tip: "用肘向下带动，不要只用手臂猛拉，回程保持控制。" },
  { name: "腿举机", icon: "🦵", tip: "膝盖方向与脚尖一致，避免骨盆在最低点明显卷起。" },
  { name: "跑步机", icon: "🏃", tip: "从慢走逐步提速，结束前逐渐降速，不要高速直接跳下。" },
];

const initialState: AppState = {
  selectedParts: ["肩部", "手臂"],
  foodKcal: 0,
  checkins: [],
  schedule: [{ time: "08:00", name: "晨跑 🏃" }],
  plans: [],
  theme: { preset: "pink", background: "#fff7fa" },
};

function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayLabel() {
  return new Date().toLocaleDateString("zh-CN", {
    month: "long", day: "numeric", weekday: "short"
  });
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("home");
  const [state, setState] = useState<AppState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [installEvent, setInstallEvent] = useState<any>(null);
  const [showLog, setShowLog] = useState(false);
  const [showFood, setShowFood] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [profileView, setProfileView] = useState<ProfileView>("main");
  const [trainCategory, setTrainCategory] = useState<TrainCategory>("strength");
  const [trainDetail, setTrainDetail] = useState<string | null>(null);
  const [calendarDate, setCalendarDate] = useState<string | null>(null);
  const [minutes, setMinutes] = useState(45);
  const [moves, setMoves] = useState(5);
  const [note, setNote] = useState("");
  const [foodInput, setFoodInput] = useState(500);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        setState({
          ...initialState,
          ...saved,
          theme: { ...initialState.theme, ...(saved.theme || {}) },
        });
      } catch {}
    }
    setHydrated(true);

    if ("serviceWorker" in navigator) {
      let refreshing = false;
      const swUrl = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/sw.js?v=3`;

      navigator.serviceWorker.register(swUrl, { updateViaCache: "none" })
        .then(registration => registration.update())
        .catch(() => {});

      const handleControllerChange = () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      };

      navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  useEffect(() => {
    const preset = themePresets.find(x => x.id === state.theme.preset) || themePresets[0];
    const root = document.documentElement;
    root.style.setProperty("--pink", preset.accent);
    root.style.setProperty("--pink2", preset.accent2);
    root.style.setProperty("--page-bg", state.theme.background || preset.background);
    root.style.setProperty("--page-bg2", preset.soft);
  }, [state.theme]);

  const today = dateKey();
  const todayCheckin = state.checkins.find(x => x.date === today);
  const todayMinutes = todayCheckin?.minutes ?? 0;
  const todayMoves = todayCheckin?.moves ?? 0;

  const streak = useMemo(() => {
    const set = new Set(state.checkins.map(x => x.date));
    const cursor = new Date();
    let count = 0;
    if (!set.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (set.has(dateKey(cursor))) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [state.checkins]);

  const monthCheckins = useMemo(() => {
    const now = new Date();
    return state.checkins.filter(c => {
      const d = new Date(c.date + "T00:00:00");
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
  }, [state.checkins]);

  const saveWorkout = () => {
    const entry: Checkin = {
      date: today,
      minutes,
      parts: state.selectedParts,
      moves,
      note,
    };
    setState(s => ({
      ...s,
      checkins: [...s.checkins.filter(x => x.date !== today), entry]
    }));
    setShowLog(false);
    setTab("home");
  };

  const togglePart = (part: string) => {
    setState(s => ({
      ...s,
      selectedParts: s.selectedParts.includes(part)
        ? s.selectedParts.filter(x => x !== part)
        : [...s.selectedParts, part]
    }));
  };

  const installApp = async () => {
    if (installEvent) {
      installEvent.prompt();
      await installEvent.userChoice;
      setInstallEvent(null);
    } else {
      setShowInstallHelp(true);
    }
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="avatar">🎀</div>
          <div>
            <div className="eyebrow">个人健身工作台 · v1.1</div>
            <h1>FitDaily</h1>
          </div>
        </div>
        <button className="streak" onClick={() => setTab("calendar")}>🔥 {streak}天</button>
      </header>

      <section className="screen">
        {tab === "home" && (
          <>
            <div className="hero-card">
              <div className="muted">{todayLabel()}</div>
              <h2>今天也要元气满满 ✨</h2>
              <div className="metric-grid">
                <Metric icon="⏱️" value={`${todayMinutes}min`} label="今日训练" />
                <Metric icon="🔥" value={`${state.foodKcal}`} label="大卡摄入" />
                <Metric icon="🏋️" value={`${todayMoves}`} label="完成动作" />
              </div>
            </div>

            <div className="shortcut-grid">
              <Shortcut icon="👟" label="开始训练" onClick={() => setTab("train")} />
              <Shortcut icon="🍽️" label="记录饮食" onClick={() => setShowFood(true)} />
              <Shortcut icon="📅" label="日程" onClick={() => setTab("calendar")} />
            </div>

            <SectionTitle icon="🗓️" title="今日日程" action="查看" onAction={() => setTab("calendar")} />
            <div className="white-card schedule-card">
              {state.schedule.map((x, i) => (
                <div className="schedule-row" key={i}>
                  <div><b>{x.time}</b><span>{x.name}</span></div>
                  <span className="tag">待办</span>
                </div>
              ))}
            </div>

            <SectionTitle icon="📋" title="今日训练" action="开始" onAction={() => setTab("train")} />
            <div className="white-card workout-summary">
              <div className="workout-main">
                <div className="circle-icon">💪</div>
                <div><b>{state.selectedParts.length ? state.selectedParts.join("、") : "自由训练"}</b><span>{todayCheckin?.note || "还没有完成今日训练"}</span></div>
              </div>
              <b className="accent">{todayMinutes}min</b>
            </div>

            <SectionTitle icon="📈" title="本月记录" action="详情" onAction={() => setTab("calendar")} />
            <div className="white-card month-card">
              <div><strong>{monthCheckins.length}</strong><span>训练次数</span></div>
              <div><strong>{monthCheckins.reduce((s, x) => s + x.minutes, 0)}</strong><span>累计分钟</span></div>
              <div><strong>{monthCheckins.reduce((s, x) => s + x.moves, 0)}</strong><span>完成动作</span></div>
            </div>
          </>
        )}

        {tab === "train" && (
          <>
            {!trainDetail ? (
              <>
                <div className="page-heading">
                  <h2>今天练什么？</h2>
                  <p>先选训练类型，再进入具体动作页面</p>
                </div>

                <div className="train-segment">
                  <button
                    className={trainCategory === "strength" ? "active" : ""}
                    onClick={() => setTrainCategory("strength")}
                  >
                    💪 力量训练
                  </button>
                  <button
                    className={trainCategory === "sport" ? "active" : ""}
                    onClick={() => setTrainCategory("sport")}
                  >
                    🏊 其他运动
                  </button>
                </div>

                <div className="part-grid">
                  {(trainCategory === "strength" ? strengthActivities : sportActivities).map(activity => (
                    <button
                      key={activity.id}
                      className="part-card activity-entry"
                      onClick={() => setTrainDetail(activity.id)}
                    >
                      <span className="part-icon">{activity.icon}</span>
                      <b>{activity.name}</b>
                      <small>{activity.desc}</small>
                    </button>
                  ))}
                </div>

                <button
                  className="secondary-action"
                  onClick={() => {
                    setState(s => ({...s, selectedParts: []}));
                    setNote("自由训练");
                    setShowLog(true);
                  }}
                >
                  ⚡ 自由训练
                </button>
              </>
            ) : (
              <TrainingDetail
                activity={[...strengthActivities, ...sportActivities].find(x => x.id === trainDetail)!}
                onBack={() => setTrainDetail(null)}
                onRecord={(activity, action) => {
                  setState(s => ({ ...s, selectedParts: [activity.name] }));
                  setNote(`${action.name} · ${action.dose}`);
                  setShowLog(true);
                }}
              />
            )}
          </>
        )}

        {tab === "calendar" && (
          <>
            {!calendarDate ? (
              <>
                <div className="page-heading left">
                  <h2>训练日历</h2>
                  <p>点击任意日期，安排当天的运动时间和项目。</p>
                </div>
                <Calendar
                  checkins={state.checkins}
                  plans={state.plans}
                  onSelectDate={setCalendarDate}
                />
                <div className="calendar-legend">
                  <span><i className="legend-dot planned" />有计划</span>
                  <span><i className="legend-dot done" />已完成训练</span>
                </div>
              </>
            ) : (
              <DayPlanPage
                date={calendarDate}
                plans={state.plans.filter(x => x.date === calendarDate)}
                onBack={() => setCalendarDate(null)}
                onAdd={plan => setState(s => ({ ...s, plans: [...s.plans, plan] }))}
                onDelete={id => setState(s => ({ ...s, plans: s.plans.filter(x => x.id !== id) }))}
              />
            )}
          </>
        )}

        {tab === "food" && (
          <>
            <div className="page-heading left">
              <h2>饮食记录</h2>
              <p>V1 先记录每日摄入总量，后续可以拆分早餐、午餐和晚餐。</p>
            </div>
            <div className="food-hero white-card">
              <div className="food-icon">🍱</div>
              <strong>{state.foodKcal} kcal</strong>
              <span>今日累计摄入</span>
              <button className="primary-action compact" onClick={() => setShowFood(true)}>+ 记录饮食</button>
            </div>
            <div className="meal-list">
              {["早餐","午餐","加餐","晚餐"].map((x,i) => (
                <div className="white-card meal-row" key={x}>
                  <div className="circle-icon">{["🥛","🍚","🍌","🥗"][i]}</div>
                  <div><b>{x}</b><span>点击记录这一餐</span></div>
                  <button onClick={() => setShowFood(true)}>+</button>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "profile" && (
          <>
            {profileView === "main" && (
              <>
                <div className="page-heading left">
                  <h2>我的 FitDaily</h2>
                  <p>这里仅保留功能入口，具体设置进入独立页面。</p>
                </div>

                <div className="profile-menu">
                  <ProfileMenuItem
                    icon="🎨"
                    title="主题与背景"
                    desc="配色、背景颜色与个性化"
                    onClick={() => setProfileView("theme")}
                  />
                  <ProfileMenuItem
                    icon="🏋️"
                    title="器械指南"
                    desc="常用器械使用方法与动作提示"
                    onClick={() => setProfileView("equipment")}
                  />
                  <ProfileMenuItem
                    icon="📲"
                    title="添加到手机桌面"
                    desc="把 FitDaily 安装成类似 App 的体验"
                    onClick={() => setProfileView("install")}
                  />
                  <ProfileMenuItem
                    icon="💾"
                    title="数据管理"
                    desc="查看当前数据保存方式与注意事项"
                    onClick={() => setProfileView("data")}
                  />
                </div>
              </>
            )}

            {profileView === "theme" && (
              <ProfileSubpage
                icon="🎨"
                title="主题与背景"
                subtitle="选择喜欢的配色，也可以单独自定义背景。"
                onBack={() => setProfileView("main")}
              >
                <div className="white-card theme-panel subpage-card">
                  <div className="theme-copy">
                    <b>快速主题</b>
                    <span>点击主题后立即应用，并自动保存。</span>
                  </div>
                  <div className="theme-presets">
                    {themePresets.map(theme => (
                      <button
                        key={theme.id}
                        className={`theme-option ${state.theme.preset === theme.id ? "active" : ""}`}
                        onClick={() => setState(s => ({
                          ...s,
                          theme: { preset: theme.id, background: theme.background }
                        }))}
                        aria-label={theme.name}
                        title={theme.name}
                      >
                        <span className="theme-swatch" style={{ background: theme.accent }} />
                        <small>{theme.name}</small>
                      </button>
                    ))}
                  </div>
                  <div className="custom-bg-row">
                    <div>
                      <b>自定义背景</b>
                      <span>点击右侧色块选择任意颜色</span>
                    </div>
                    <label className="color-picker-wrap">
                      <input
                        type="color"
                        value={state.theme.background}
                        onChange={e => setState(s => ({
                          ...s,
                          theme: { ...s.theme, background: e.target.value }
                        }))}
                      />
                      <span style={{ background: state.theme.background }} />
                    </label>
                  </div>
                  <button
                    className="reset-theme"
                    onClick={() => setState(s => ({
                      ...s,
                      theme: { ...initialState.theme }
                    }))}
                  >
                    恢复默认粉色
                  </button>
                </div>
              </ProfileSubpage>
            )}

            {profileView === "equipment" && (
              <ProfileSubpage
                icon="🏋️"
                title="器械指南"
                subtitle="常用器械单独放在这里，不占用“我的”首页。"
                onBack={() => setProfileView("main")}
              >
                <div className="equipment-list subpage-list">
                  {equipment.map(x => (
                    <div className="white-card equipment-row" key={x.name}>
                      <div className="circle-icon">{x.icon}</div>
                      <div><b>{x.name}</b><span>{x.tip}</span></div>
                    </div>
                  ))}
                </div>
              </ProfileSubpage>
            )}

            {profileView === "install" && (
              <ProfileSubpage
                icon="📲"
                title="添加到手机桌面"
                subtitle="不同设备安装方式不同，点击下方按钮尝试直接安装。"
                onBack={() => setProfileView("main")}
              >
                <div className="white-card install-detail subpage-card">
                  <div className="install-hero">📱</div>
                  <b>把 FitDaily 放到手机桌面</b>
                  <p>安装后可从桌面图标直接打开，显示效果更接近独立 App。</p>
                  <button className="primary-action compact" onClick={installApp}>尝试安装</button>
                  <div className="install-steps">
                    <b>iPhone / Safari</b>
                    <span>分享 → 添加到主屏幕</span>
                    <b>Android / Chrome、Edge</b>
                    <span>浏览器菜单 → 安装应用 / 添加到主屏幕</span>
                  </div>
                </div>
              </ProfileSubpage>
            )}

            {profileView === "data" && (
              <ProfileSubpage
                icon="💾"
                title="数据管理"
                subtitle="当前仍然是快速试用阶段，数据保存在本机浏览器。"
                onBack={() => setProfileView("main")}
              >
                <div className="white-card data-detail subpage-card">
                  <div className="data-status-row"><span>当前模式</span><b>本地保存</b></div>
                  <div className="data-status-row"><span>是否需要账号</span><b>不需要</b></div>
                  <div className="data-status-row"><span>换设备同步</span><b>暂不支持</b></div>
                  <div className="data-status-row"><span>清缓存后保留</span><b>不能保证</b></div>
                  <p>等功能稳定并准备给多人长期使用时，再接登录与云数据库。</p>
                </div>
              </ProfileSubpage>
            )}
          </>
        )}

      </section>

      <nav className="bottom-nav">
        <NavItem icon="⌂" label="首页" active={tab === "home"} onClick={() => setTab("home")} />
        <NavItem icon="💪" label="训练" active={tab === "train"} onClick={() => { setTab("train"); setTrainDetail(null); }} />
        <NavItem icon="▦" label="日程" active={tab === "calendar"} onClick={() => { setTab("calendar"); setCalendarDate(null); }} />
        <NavItem icon="🍜" label="饮食" active={tab === "food"} onClick={() => setTab("food")} />
        <NavItem icon="♡" label="我的" active={tab === "profile"} onClick={() => { setTab("profile"); setProfileView("main"); }} />
      </nav>

      {showLog && (
        <Sheet title="记录今日训练" subtitle={state.selectedParts.length ? state.selectedParts.join("、") : "自由训练"} onClose={() => setShowLog(false)}>
          <label>训练时长（分钟）</label>
          <input type="number" value={minutes} onChange={e => setMinutes(Number(e.target.value))} />
          <label>完成动作数量</label>
          <input type="number" value={moves} onChange={e => setMoves(Number(e.target.value))} />
          <label>训练备注</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="例如：卧推状态不错，最后一组略吃力。" />
          <button className="primary-action compact" onClick={saveWorkout}>保存训练</button>
        </Sheet>
      )}

      {showFood && (
        <Sheet title="记录今日饮食" subtitle="V1 先记录总热量" onClose={() => setShowFood(false)}>
          <label>本次摄入（kcal）</label>
          <input type="number" value={foodInput} onChange={e => setFoodInput(Number(e.target.value))} />
          <button className="primary-action compact" onClick={() => {
            setState(s => ({...s, foodKcal: s.foodKcal + foodInput}));
            setShowFood(false);
          }}>加入今日摄入</button>
        </Sheet>
      )}


      {showInstallHelp && (
        <Sheet title="添加到桌面" subtitle="不同手机操作略有不同" onClose={() => setShowInstallHelp(false)}>
          <div className="install-help">
            <b>iPhone / Safari</b>
            <p>点击浏览器“分享” → “添加到主屏幕”。</p>
            <b>Android / Chrome 或 Edge</b>
            <p>浏览器菜单中选择“安装应用”或“添加到主屏幕”。</p>
          </div>
        </Sheet>
      )}
    </main>
  );
}

function Metric({icon,value,label}:{icon:string;value:string;label:string}) {
  return <div className="metric"><span>{icon}</span><b>{value}</b><small>{label}</small></div>
}
function Shortcut({icon,label,onClick}:{icon:string;label:string;onClick:()=>void}) {
  return <button className="shortcut" onClick={onClick}><span>{icon}</span><b>{label}</b></button>
}
function SectionTitle({icon,title,action,onAction}:{icon:string;title:string;action?:string;onAction?:()=>void}) {
  return <div className="section-title"><h3><span>{icon}</span>{title}</h3>{action && <button onClick={onAction}>{action}</button>}</div>
}
function NavItem({icon,label,active,onClick}:{icon:string;label:string;active:boolean;onClick:()=>void}) {
  return <button className={active ? "nav active" : "nav"} onClick={onClick}><span>{icon}</span><small>{label}</small></button>
}
function TrainingDetail({activity,onBack,onRecord}:{activity:TrainingActivity;onBack:()=>void;onRecord:(activity:TrainingActivity,action:TrainingActivity["actions"][number])=>void}) {
  return (
    <div className="training-detail">
      <button className="back-button" onClick={onBack}>← 返回</button>
      <div className="training-detail-head">
        <div className="training-detail-icon">{activity.icon}</div>
        <div>
          <h2>{activity.name}</h2>
          <p>{activity.desc}</p>
        </div>
      </div>

      <div className="training-action-list">
        {activity.actions.map((action, index) => (
          <div className="white-card training-action-card" key={action.name}>
            <div className="action-index">{String(index + 1).padStart(2,"0")}</div>
            <div className="action-copy">
              <b>{action.name}</b>
              <span className="action-dose">{action.dose}</span>
              <p>{action.cue}</p>
            </div>
            <button onClick={() => onRecord(activity, action)}>记录</button>
          </div>
        ))}
      </div>

      <button
        className="secondary-action"
        onClick={() => onRecord(activity, { name: "自由练习", dose: "按实际完成", cue: "" })}
      >
        + 记录一次{activity.name}
      </button>
    </div>
  );
}

function ProfileMenuItem({icon,title,desc,onClick}:{icon:string;title:string;desc:string;onClick:()=>void}) {
  return (
    <button className="profile-menu-item white-card" onClick={onClick}>
      <div className="circle-icon">{icon}</div>
      <div className="profile-menu-copy"><b>{title}</b><span>{desc}</span></div>
      <strong className="profile-chevron">›</strong>
    </button>
  );
}

function ProfileSubpage({icon,title,subtitle,onBack,children}:{icon:string;title:string;subtitle:string;onBack:()=>void;children:React.ReactNode}) {
  return (
    <div className="profile-subpage">
      <button className="back-button" onClick={onBack}>← 返回</button>
      <div className="subpage-heading">
        <span>{icon}</span>
        <div><h2>{title}</h2><p>{subtitle}</p></div>
      </div>
      {children}
    </div>
  );
}

function Sheet({title,subtitle,onClose,children}:{title:string;subtitle:string;onClose:()=>void;children:React.ReactNode}) {
  return <div className="sheet-backdrop" onClick={onClose}>
    <div className="sheet" onClick={e=>e.stopPropagation()}>
      <div className="handle" />
      <h3>{title}</h3><p>{subtitle}</p>
      <div className="form">{children}</div>
    </div>
  </div>
}
function Calendar({checkins,plans,onSelectDate}:{checkins:Checkin[];plans:PlannedActivity[];onSelectDate:(date:string)=>void}) {
  const now = new Date();
  const [cursor, setCursor] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const y = cursor.getFullYear(), m = cursor.getMonth();
  const first = new Date(y,m,1);
  const offset = (first.getDay()+6)%7;
  const start = new Date(y,m,1-offset);
  const items = Array.from({length:42}, (_,i)=>{
    const d = new Date(start); d.setDate(start.getDate()+i); return d;
  });
  const doneSet = new Set(checkins.map(x=>x.date));
  const planCount = plans.reduce<Record<string,number>>((acc,plan)=>{
    acc[plan.date]=(acc[plan.date]||0)+1;
    return acc;
  },{});

  return <div className="white-card calendar-card">
    <div className="calendar-head">
      <button type="button" onClick={()=>setCursor(new Date(y,m-1,1))}>‹</button>
      <b>{y}年{m+1}月</b>
      <button type="button" onClick={()=>setCursor(new Date(y,m+1,1))}>›</button>
    </div>
    <div className="week-row">{["一","二","三","四","五","六","日"].map(x=><span key={x}>{x}</span>)}</div>
    <div className="calendar-grid">
      {items.map(d=>{
        const k=dateKey(d), done=doneSet.has(k), planned=(planCount[k]||0)>0, other=d.getMonth()!==m, today=k===dateKey();
        return <button
          type="button"
          className={`day ${done?"done":""} ${planned?"planned":""} ${other?"other":""} ${today?"today":""}`}
          key={k}
          onClick={()=>onSelectDate(k)}
          aria-label={`${k}${planned ? `，已有${planCount[k]}项计划` : ""}${done ? "，已完成训练" : ""}`}
        >
          <span>{d.getDate()}</span>
          {planned && <i className="plan-mark">{planCount[k]}</i>}
          {done && <i className="done-mark">✓</i>}
        </button>
      })}
    </div>
  </div>
}

function DayPlanPage({
  date,plans,onBack,onAdd,onDelete
}:{
  date:string;
  plans:PlannedActivity[];
  onBack:()=>void;
  onAdd:(plan:PlannedActivity)=>void;
  onDelete:(id:string)=>void;
}) {
  const [start,setStart]=useState("18:00");
  const [end,setEnd]=useState("19:00");
  const [sport,setSport]=useState("力量训练");
  const [note,setNote]=useState("");
  const [error,setError]=useState("");

  const parts=date.split("-").map(Number);
  const d=new Date(parts[0],parts[1]-1,parts[2]);
  const label=d.toLocaleDateString("zh-CN",{year:"numeric",month:"long",day:"numeric",weekday:"long"});
  const sorted=[...plans].sort((a,b)=>a.start.localeCompare(b.start));

  const submit=(e:React.FormEvent)=>{
    e.preventDefault();
    if(!start || !end){
      setError("请填写开始和结束时间。");
      return;
    }
    if(end<=start){
      setError("结束时间需要晚于开始时间。");
      return;
    }
    const item:PlannedActivity={
      id:`${date}-${Date.now()}`,
      date,
      start,
      end,
      sport,
      note:note.trim()
    };
    onAdd(item);
    setNote("");
    setError("");
  };

  return (
    <div className="day-plan-page">
      <button className="back-button" type="button" onClick={onBack}>← 返回月历</button>

      <div className="day-plan-heading">
        <div>
          <span>当天计划</span>
          <h2>{label}</h2>
          <p>可以安排多个时间段，不同运动分开记录。</p>
        </div>
        <div className="day-plan-count">{plans.length}<small>项</small></div>
      </div>

      <div className="white-card day-plan-form-card">
        <h3>+ 添加运动计划</h3>
        <form className="day-plan-form" onSubmit={submit}>
          <div className="time-range">
            <label>
              <span>开始</span>
              <input type="time" value={start} onChange={e=>setStart(e.target.value)} />
            </label>
            <div className="time-arrow">→</div>
            <label>
              <span>结束</span>
              <input type="time" value={end} onChange={e=>setEnd(e.target.value)} />
            </label>
          </div>

          <label className="plan-field">
            <span>准备进行什么运动</span>
            <select value={sport} onChange={e=>setSport(e.target.value)}>
              <optgroup label="力量训练">
                <option>力量训练</option>
                <option>胸部训练</option>
                <option>背部训练</option>
                <option>腿部训练</option>
                <option>肩部训练</option>
                <option>手臂训练</option>
                <option>核心训练</option>
              </optgroup>
              <optgroup label="其他运动">
                <option>游泳</option>
                <option>羽毛球</option>
                <option>跑步</option>
                <option>骑行</option>
                <option>跳绳</option>
                <option>瑜伽拉伸</option>
              </optgroup>
              <option>其他</option>
            </select>
          </label>

          <label className="plan-field">
            <span>备注（可选）</span>
            <input
              type="text"
              value={note}
              maxLength={80}
              onChange={e=>setNote(e.target.value)}
              placeholder="例如：游泳馆，轻松游 1000 m"
            />
          </label>

          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="primary-action compact" type="submit">保存当天计划</button>
        </form>
      </div>

      <div className="day-plan-list-head">
        <h3>当天安排</h3>
        <span>{plans.length ? "按时间排序" : "还没有安排"}</span>
      </div>

      <div className="day-plan-list">
        {sorted.length ? sorted.map(item=>(
          <div className="white-card day-plan-item" key={item.id}>
            <div className="plan-time">
              <b>{item.start}</b>
              <span>{item.end}</span>
            </div>
            <div className="plan-info">
              <b>{item.sport}</b>
              <span>{item.note || "暂无备注"}</span>
            </div>
            <button type="button" onClick={()=>onDelete(item.id)} aria-label={`删除${item.sport}计划`}>×</button>
          </div>
        )) : (
          <div className="empty-plan white-card">
            <span>🗓️</span>
            <b>这一天还没有运动计划</b>
            <p>在上方选择时间段和运动项目后保存。</p>
          </div>
        )}
      </div>
    </div>
  );
}
