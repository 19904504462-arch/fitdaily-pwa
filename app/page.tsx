"use client";

import { useEffect, useMemo, useState } from "react";

type Tab = "home" | "train" | "calendar" | "food" | "profile";
type Checkin = {
  date: string;
  minutes: number;
  parts: string[];
  moves: number;
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
const bodyParts = [
  ["胸部", "🏋️"], ["背部", "🧍"], ["腿部", "🦵"],
  ["肩部", "🙋"], ["手臂", "💪"], ["核心", "🧘"],
  ["臀部", "🍑"], ["全身", "🤸"], ["有氧", "🏃"],
] as const;

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
      navigator.serviceWorker.register(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/sw.js`).catch(() => {});
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
        <div className="top-actions">
          <button className="theme-quick" onClick={() => setShowTheme(true)} aria-label="主题设置">🎨</button>
          <button className="streak" onClick={() => setTab("calendar")}>🔥 {streak}天</button>
        </div>
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
            <div className="page-heading">
              <h2>今天练哪里呀？</h2>
              <p>可以多选部位，选好后开始训练</p>
            </div>
            <div className="part-grid">
              {bodyParts.map(([name, icon]) => (
                <button
                  key={name}
                  className={`part-card ${state.selectedParts.includes(name) ? "selected" : ""}`}
                  onClick={() => togglePart(name)}
                >
                  <span className="part-icon">{icon}</span>
                  <b>{name}</b>
                </button>
              ))}
            </div>
            <div className="selected-bar">已选：{state.selectedParts.length ? state.selectedParts.join("、") : "自由训练"}</div>
            <button className="primary-action" onClick={() => setShowLog(true)}>💪 开始训练（{state.selectedParts.length}）</button>
            <button className="secondary-action" onClick={() => { setState(s => ({...s, selectedParts: []})); setShowLog(true); }}>⚡ 自由训练</button>
          </>
        )}

        {tab === "calendar" && (
          <>
            <div className="page-heading left">
              <h2>训练日历</h2>
              <p>所有训练记录都会自动出现在这里</p>
            </div>
            <Calendar checkins={state.checkins} />
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
            <div className="page-heading left">
              <h2>我的 FitDaily</h2>
              <p>安装、器械指南和本地数据管理都放在这里。</p>
            </div>

            <button className="install-card white-card" onClick={installApp}>
              <div className="circle-icon">📲</div>
              <div><b>添加到手机桌面</b><span>安装后打开更像原生 App</span></div>
              <strong>›</strong>
            </button>

            <SectionTitle icon="🎨" title="主题与背景" />
            <div className="white-card theme-panel">
              <div className="theme-copy">
                <b>快速主题</b>
                <span>选择一套配色，或单独自定义页面背景。</span>
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
                  <span>点击色块选择任意颜色</span>
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

            <SectionTitle icon="🏋️" title="常用器械指南" />
            <div className="equipment-list">
              {equipment.map(x => (
                <div className="white-card equipment-row" key={x.name}>
                  <div className="circle-icon">{x.icon}</div>
                  <div><b>{x.name}</b><span>{x.tip}</span></div>
                </div>
              ))}
            </div>

            <SectionTitle icon="💾" title="数据说明" />
            <div className="white-card data-note">
              当前 V1 数据保存在本机浏览器。适合快速试用；正式给多人长期使用时，再接登录和云数据库。
            </div>
          </>
        )}
      </section>

      <nav className="bottom-nav">
        <NavItem icon="⌂" label="首页" active={tab === "home"} onClick={() => setTab("home")} />
        <NavItem icon="💪" label="训练" active={tab === "train"} onClick={() => setTab("train")} />
        <NavItem icon="▦" label="日程" active={tab === "calendar"} onClick={() => setTab("calendar")} />
        <NavItem icon="🍜" label="饮食" active={tab === "food"} onClick={() => setTab("food")} />
        <NavItem icon="♡" label="我的" active={tab === "profile"} onClick={() => setTab("profile")} />
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


      {showTheme && (
        <Sheet title="主题与背景" subtitle="选择喜欢的主题，也可以自定义背景颜色" onClose={() => setShowTheme(false)}>
          <div className="theme-presets sheet-themes">
            {themePresets.map(theme => (
              <button
                key={theme.id}
                className={`theme-option ${state.theme.preset === theme.id ? "active" : ""}`}
                onClick={() => setState(s => ({
                  ...s,
                  theme: { preset: theme.id, background: theme.background }
                }))}
              >
                <span className="theme-swatch" style={{ background: theme.accent }} />
                <small>{theme.name}</small>
              </button>
            ))}
          </div>
          <div className="custom-bg-row sheet-custom-bg">
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
            onClick={() => setState(s => ({ ...s, theme: { ...initialState.theme } }))}
          >
            恢复默认粉色
          </button>
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
function Sheet({title,subtitle,onClose,children}:{title:string;subtitle:string;onClose:()=>void;children:React.ReactNode}) {
  return <div className="sheet-backdrop" onClick={onClose}>
    <div className="sheet" onClick={e=>e.stopPropagation()}>
      <div className="handle" />
      <h3>{title}</h3><p>{subtitle}</p>
      <div className="form">{children}</div>
    </div>
  </div>
}
function Calendar({checkins}:{checkins:Checkin[]}) {
  const now = new Date();
  const [cursor, setCursor] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const y = cursor.getFullYear(), m = cursor.getMonth();
  const first = new Date(y,m,1);
  const offset = (first.getDay()+6)%7;
  const start = new Date(y,m,1-offset);
  const items = Array.from({length:42}, (_,i)=>{
    const d = new Date(start); d.setDate(start.getDate()+i); return d;
  });
  const set = new Set(checkins.map(x=>x.date));
  return <div className="white-card calendar-card">
    <div className="calendar-head">
      <button onClick={()=>setCursor(new Date(y,m-1,1))}>‹</button>
      <b>{y}年{m+1}月</b>
      <button onClick={()=>setCursor(new Date(y,m+1,1))}>›</button>
    </div>
    <div className="week-row">{["一","二","三","四","五","六","日"].map(x=><span key={x}>{x}</span>)}</div>
    <div className="calendar-grid">
      {items.map(d=>{
        const k=dateKey(d), done=set.has(k), other=d.getMonth()!==m, today=k===dateKey();
        return <div className={`day ${done?"done":""} ${other?"other":""} ${today?"today":""}`} key={k}>
          <span>{d.getDate()}</span>{done && <i>✓</i>}
        </div>
      })}
    </div>
  </div>
}
