"use client";

import { useEffect, useMemo, useState } from "react";

type Tab = "home" | "train" | "calendar" | "food" | "profile";
type ProfileView = "main" | "theme" | "equipment" | "data" | "install";
type TrainCategory = "strength" | "sport";

type TrainingAction = {
  name: string;
  dose: string;
  cue: string;
  equipment?: string;
  target?: string;
  level?: string;
  rest?: string;
  setup?: string[];
  steps?: string[];
  mistakes?: string[];
  progression?: string;
  sourceName?: string;
  sourceUrl?: string;
};

type TrainingActivity = {
  id: string;
  name: string;
  icon: string;
  desc: string;
  actions: TrainingAction[];
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
  {
    id:"chest", name:"胸部", icon:"🏋️", desc:"胸大肌为主，同时训练肱三头肌和前三角", actions:[
      {
        name:"杠铃卧推", dose:"3–4组 × 6–10次", cue:"大重量动作优先保证稳定轨迹和保护措施。",
        equipment:"平板卧推凳、杠铃、杠铃片、卧推架/安全杆", target:"胸大肌；辅助：肱三头肌、前三角", level:"入门进阶 / 中级", rest:"2–3分钟",
        setup:["卧凳置于架内，眼睛大致位于杠铃正下方；大重量时先设置安全杆或找保护者。","双脚踩稳地面，肩胛骨向后、向下收紧，上背稳定贴住卧凳。","握距通常略宽于肩，手腕尽量保持在前臂上方。"],
        steps:["从架上取杠后稳定在肩部上方。","吸气并控制杠铃下放至胸部中下段附近，前臂尽量保持接近垂直。","呼气推起，杠铃沿自然弧线回到肩部上方，不要反弹起杠。"],
        mistakes:["下放过快或用胸口反弹杠铃。","肘部过度外展、手腕过度后折。","为了重量抬臀或失去肩胛稳定。"],
        progression:"当目标次数能稳定完成且动作不变形时再逐步加重；不建议用牺牲动作范围换重量。",
        sourceName:"ACE 胸部训练研究 / Exercise Library", sourceUrl:"https://www.acefitness.org/resources/pros/expert-articles/8972/be-a-chest-day-champion-an-evidence-based-approach-to-training-the-chest/"
      },
      {
        name:"蝴蝶机夹胸", dose:"3组 × 10–15次", cue:"更适合控制胸部收缩，不需要追求很大的重量。",
        equipment:"Pec Deck / 蝴蝶机夹胸器", target:"胸大肌", level:"入门", rest:"60–90秒",
        setup:["调整座椅，使上臂/肘部大致位于胸部至肩部高度，具体以器械结构为准。","背部贴住靠垫，双脚踩稳，手臂贴合把手或护垫。"],
        steps:["保持胸部自然抬起，将两侧手臂缓慢向中间合拢。","接近中线时短暂停顿，感受胸部收缩。","缓慢返回，不让配重片猛烈撞击。"],
        mistakes:["重量过大导致上背离开靠垫。","回程太快、肩部被强行拉到过度伸展。","用身体摆动代替胸部发力。"],
        progression:"先增加动作控制与完整范围，再增加重量；有肩部不适史时可优先选择更舒适的胸推器械。",
        sourceName:"ACE Top Chest Exercises", sourceUrl:"https://www.acefitness.org/certifiednewsarticle/3003/what-are-the-top-3-most-effective-chest-exercises/"
      },
      {
        name:"绳索夹胸", dose:"3组 × 10–15次", cue:"保持躯干稳定，让手臂沿弧线向前内侧合拢。",
        equipment:"龙门架 / 双滑轮绳索机、单手把", target:"胸大肌", level:"中级", rest:"60–90秒",
        setup:["左右滑轮调到合适高度，两手各握一个把手。","采用前后站姿或稳定的平行站姿，肘部保持轻微弯曲。"],
        steps:["躯干稳定，双臂沿宽弧线向前、向内合拢。","中间位置短暂停顿，保持手肘角度基本不变。","缓慢回到起始位置，不让肩部被拉到过度后伸。"],
        mistakes:["身体跟着把手前后摆动。","为了扩大幅度让手臂过度越过身体后方。","重量过大导致动作变成推举。"],
        progression:"可以通过调节滑轮高度改变刺激角度，但先固定一种角度熟练动作。",
        sourceName:"ACE Bent-forward Cable Crossover", sourceUrl:"https://www.acefitness.org/certifiednewsarticle/3003/what-are-the-top-3-most-effective-chest-exercises/"
      }
    ]
  },
  {
    id:"back", name:"背部", icon:"🧍", desc:"背阔肌、菱形肌、斜方肌及肘屈肌群", actions:[
      {
        name:"高位下拉", dose:"3–4组 × 8–12次", cue:"先让肩胛下沉，再用肘向下拉，不要只靠手臂。",
        equipment:"高位下拉机、长杆或中立握把", target:"背阔肌；辅助：肱二头肌、上背", level:"入门", rest:"90–120秒",
        setup:["调整大腿固定垫，使腿部能被稳定压住。","握距略宽于肩，胸部自然抬起，躯干仅轻微后倾。"],
        steps:["先将肩胛骨下沉并略向后收。","将肘部向身体两侧下方拉，横杆靠近上胸。","短暂停顿后缓慢伸直手臂，让背阔肌充分拉长。"],
        mistakes:["把横杆拉到颈后。","大幅后仰、用身体摆动借力。","耸肩并只用手臂拉。"],
        progression:"先能稳定控制回程，再逐渐增加重量；若无法把杆拉到上胸附近且动作变形，应减重。",
        sourceName:"ACE Back Exercise Research", sourceUrl:"https://www.acefitness.org/continuing-education/certified/special-dec-2018-issue/7146/ace-sponsored-research-what-is-the-best-back-exercise/"
      },
      {
        name:"坐姿绳索划船", dose:"3组 × 8–12次", cue:"胸部保持抬起，肘向后拉到躯干旁，不用腰部甩动。",
        equipment:"坐姿划船机 / 低位绳索机、V形把手", target:"中背、背阔肌；辅助：肱二头肌", level:"入门", rest:"90–120秒",
        setup:["双脚踩稳踏板，膝盖微屈，背部保持自然中立。","握住把手，先把胸部抬起并稳定躯干。"],
        steps:["将肘部沿身体两侧向后拉，直到把手靠近腹部。","末端停顿约1秒，感受肩胛后缩。","缓慢伸直手臂返回，不要含胸塌腰。"],
        mistakes:["每次都用腰部大幅前后摆动。","耸肩、肘部外张过多。","回程直接放掉配重。"],
        progression:"先增加停顿和控制，之后再加重量或更换不同握把。",
        sourceName:"ACE Seated Row", sourceUrl:"https://www.acefitness.org/resources/everyone/exercise-library/48/seated-row/"
      },
      {
        name:"胸托划船机", dose:"3组 × 10–12次", cue:"胸部贴住支撑垫，减少腰部借力。",
        equipment:"胸托划船机 / 杠杆式划船机", target:"中背、菱形肌、背阔肌", level:"入门", rest:"90秒",
        setup:["调整座椅，使胸部能稳定贴住支撑垫，把手大致在胸口高度。","双脚踩稳，保持颈部中立。"],
        steps:["先稳定肩胛，再将肘向后拉。","把手靠近躯干时停顿，保持胸部不离开支撑垫。","慢慢伸直手臂回到起始位置。"],
        mistakes:["为了拉更重让胸部离开靠垫。","耸肩或手腕过度弯折。","回程完全失去控制。"],
        progression:"适合新手建立背部发力感；熟练后可逐步过渡到自由重量划船。",
        sourceName:"ACE Exercise Library", sourceUrl:"https://www.acefitness.org/resources/everyone/exercise-library/"
      }
    ]
  },
  {
    id:"legs", name:"腿部", icon:"🦵", desc:"股四头肌、臀肌、腘绳肌及小腿", actions:[
      {
        name:"坐姿腿举", dose:"3–4组 × 8–12次", cue:"脚掌完整贴住踏板，控制下放，不要顶端锁死膝盖。",
        equipment:"坐姿腿举机 / 45°腿举机", target:"股四头肌、臀肌、腘绳肌", level:"入门", rest:"2分钟",
        setup:["背部和骶骨贴住靠背，双脚稳定踩在踏板上。","调整座椅，使起始位置膝关节大约接近90°弯曲且脚跟不抬起。"],
        steps:["收紧核心，呼气将踏板平稳推远。","伸膝到接近自然伸直，但不要猛烈锁死。","吸气缓慢回程，保持腰背贴住靠垫。"],
        mistakes:["最低点骨盆卷起、腰部离开靠背。","膝盖向内塌。","脚跟离开踏板或顶端暴力锁膝。"],
        progression:"先稳定控制完整范围；可在熟练后采用单腿版本，但仍需从轻重量开始。",
        sourceName:"ACE Seated Leg Press", sourceUrl:"https://www.acefitness.org/resources/everyone/exercise-library/154/seated-leg-press/"
      },
      {
        name:"杠铃深蹲", dose:"3–4组 × 5–10次", cue:"这是技术要求较高的自由重量动作，新手应先学习空杆与徒手深蹲。",
        equipment:"深蹲架、杠铃、杠铃片、安全杆", target:"臀肌、股四头肌、腘绳肌、核心", level:"高级动作 / 需技术基础", rest:"2–3分钟",
        setup:["将杠铃架在略低于肩部的位置，并设置安全杆。","杠铃稳定放在上背部，胸部抬起，双脚约肩宽或略宽。"],
        steps:["吸气并收紧躯干，髋膝同时屈曲下蹲。","保持膝盖方向与脚尖基本一致，背部保持稳定。","脚掌用力蹬地，髋膝协同伸展回到站立。"],
        mistakes:["为了深度出现明显腰背塌陷。","膝盖明显内扣。","没有安全措施就进行接近极限重量。"],
        progression:"先从徒手/高脚杯深蹲学动作，再逐步进入空杆和杠铃深蹲。",
        sourceName:"ACE Back Squat", sourceUrl:"https://www.acefitness.org/resources/everyone/exercise-library/11/back-squat/"
      },
      {
        name:"罗马尼亚硬拉", dose:"3组 × 8–12次", cue:"动作核心是髋铰链，不是深蹲。",
        equipment:"杠铃或哑铃", target:"腘绳肌、臀大肌、竖脊肌", level:"中级", rest:"90–120秒",
        setup:["双脚约髋宽，杠铃或哑铃贴近大腿，膝盖轻微弯曲。","收紧核心并保持脊柱自然中立。"],
        steps:["髋部主动向后推，重量沿腿部附近向下移动。","下降到还能保持背部稳定且腿后侧有明显拉伸的位置。","臀部发力向前伸髋回到站立。"],
        mistakes:["把动作做成蹲起。","重量离身体太远。","为了下降更低而弓腰。"],
        progression:"先用轻哑铃练习髋铰链，再逐步增加重量；下降深度由自身活动度决定。",
        sourceName:"ACE Exercise Library", sourceUrl:"https://www.acefitness.org/resources/everyone/exercise-library/"
      }
    ]
  },
  {
    id:"shoulders", name:"肩部", icon:"🙋", desc:"三角肌、肩袖和肩胛稳定肌群", actions:[
      {
        name:"坐姿哑铃推举", dose:"3组 × 8–12次", cue:"坐姿靠背能减少身体借力，适合学习垂直推举。",
        equipment:"可调训练凳、哑铃", target:"前三角、中束；辅助：肱三头肌", level:"入门 / 中级", rest:"90–120秒",
        setup:["训练凳靠背调到接近直立且舒适的角度。","双脚踩稳，核心收紧，哑铃位于肩部两侧。"],
        steps:["呼气将哑铃向上推起，保持躯干稳定。","顶端不要用力撞击哑铃，也不需要过度耸肩。","吸气缓慢下放回肩部附近。"],
        mistakes:["腰部过度后仰。","为了重量缩短动作范围。","手腕明显向后折。"],
        progression:"若腰部无法稳定，先减重或使用有靠背的肩推器械。",
        sourceName:"ACE Shoulder Exercise Library", sourceUrl:"https://www.acefitness.org/resources/everyone/exercise-library/body-part/shoulders/anterior-and-medial-deltoids%28delts%29/"
      },
      {
        name:"哑铃侧平举", dose:"3–4组 × 10–15次", cue:"小重量、慢控制通常比甩更重的哑铃更适合侧平举。",
        equipment:"哑铃", target:"三角肌中束", level:"入门", rest:"60–90秒",
        setup:["双脚站稳，哑铃自然垂于身体两侧，肘部轻微弯曲。","肩胛保持稳定，不要刻意耸肩。"],
        steps:["手臂向身体两侧抬起，保持轻微肘屈。","抬到舒适范围后停顿。","缓慢下放，不让哑铃自由坠落。"],
        mistakes:["身体摆动借力。","耸肩代替三角肌发力。","重量过重导致动作完全变形。"],
        progression:"优先增加稳定次数，再缓慢加重；也可使用绳索侧平举保持连续张力。",
        sourceName:"ACE Shoulder Exercise Library", sourceUrl:"https://www.acefitness.org/resources/everyone/exercise-library/body-part/shoulders/"
      },
      {
        name:"绳索面拉", dose:"3组 × 12–15次", cue:"重点是肩胛后缩和外旋，不是用腰部后仰拉重量。",
        equipment:"龙门架、高位滑轮、绳索把手", target:"后三角、斜方肌中下束、肩袖", level:"入门", rest:"60–90秒",
        setup:["滑轮设在面部附近高度，双手握住绳索两端。","站稳并保持躯干中立。"],
        steps:["将绳索拉向面部，两肘向外打开。","末端让双手分开到面部两侧，感受肩胛后缩。","控制回程直到手臂伸直。"],
        mistakes:["身体大幅后仰。","用过大重量导致动作变成划船。","耸肩、手肘位置过低。"],
        progression:"先保持较高次数和动作质量，再逐步提高阻力。",
        sourceName:"ACE Exercise Library", sourceUrl:"https://www.acefitness.org/resources/everyone/exercise-library/"
      }
    ]
  },
  {
    id:"arms", name:"手臂", icon:"💪", desc:"肱二头肌、肱肌、肱三头肌与前臂", actions:[
      {
        name:"坐姿哑铃弯举", dose:"3组 × 8–12次", cue:"固定上臂，避免用腰和肩把哑铃甩起来。",
        equipment:"有靠背训练凳、哑铃", target:"肱二头肌", level:"入门", rest:"60–90秒",
        setup:["头、肩、臀部稳定贴住靠背，双脚踩稳。","手臂自然下垂，手腕保持中立。"],
        steps:["呼气屈肘把哑铃抬向胸部。","上臂尽量保持稳定，不让肘明显前移。","吸气慢慢下放回起始位置。"],
        mistakes:["后仰借力。","手腕弯折。","回程太快或肘部大幅向前跑。"],
        progression:"当能稳定完成目标次数时再小幅加重，也可改为交替弯举或锤式弯举。",
        sourceName:"ACE Seated Biceps Curl", sourceUrl:"https://www.acefitness.org/resources/everyone/exercise-library/44/seated-biceps-curl/"
      },
      {
        name:"绳索下压", dose:"3组 × 10–15次", cue:"肘部固定在身体两侧，让前臂完成伸展。",
        equipment:"龙门架 / 高位滑轮、绳索把手", target:"肱三头肌", level:"入门", rest:"60–90秒",
        setup:["滑轮设在高位，握住绳索，双脚稳定站立。","肘部贴近躯干并保持在相对固定的位置。"],
        steps:["呼气将绳索向下压，伸直肘关节。","底部可轻轻分开绳索两端。","吸气控制回到约90°屈肘位置。"],
        mistakes:["肘部不断前后移动。","身体大幅前倾或下压时用体重压。","回程放任配重片弹起。"],
        progression:"先保持肘固定，再增加阻力；也可换直杆或V杆改变手感。",
        sourceName:"ACE Arm Exercise Library", sourceUrl:"https://www.acefitness.org/resources/everyone/exercise-library/body-part/arms/triceps/"
      },
      {
        name:"锤式弯举", dose:"3组 × 10–12次", cue:"中立握法更强调肱肌与肱桡肌。",
        equipment:"哑铃", target:"肱肌、肱桡肌、肱二头肌", level:"入门", rest:"60–90秒",
        setup:["双脚站稳，手掌相对握住哑铃。","核心收紧，上臂贴近身体。"],
        steps:["保持手掌相对，屈肘抬起哑铃。","顶部短暂停顿。","慢慢下放到手臂接近伸直。"],
        mistakes:["身体摆动。","耸肩。","为了更高而让肘部明显向前移动。"],
        progression:"可以采用交替方式提高控制，也可使用绳索锤式弯举。",
        sourceName:"ACE Exercise Library", sourceUrl:"https://www.acefitness.org/resources/everyone/exercise-library/"
      }
    ]
  },
  {
    id:"core", name:"核心", icon:"🧘", desc:"腹部、腰背和抗伸展/抗旋转能力", actions:[
      {
        name:"平板支撑", dose:"3组 × 20–60秒", cue:"质量优先，不需要为了时间让腰部塌下去。",
        equipment:"瑜伽垫 / 无器械", target:"腹部、背部稳定肌群", level:"入门 / 中级", rest:"45–60秒",
        setup:["俯卧，肘部放在肩部正下方，前臂贴地。","收紧腹部和腿部，让躯干形成稳定整体。"],
        steps:["抬起身体，使头、躯干、髋和腿尽量保持一条直线。","自然呼吸，不耸肩。","在还能维持姿势时结束，不必坚持到动作崩溃。"],
        mistakes:["塌腰或臀部过高。","憋气。","肩膀耸起、肘部离肩太远。"],
        progression:"可先从膝撑版本开始，再延长时间或增加四点支撑变化。",
        sourceName:"ACE Front Plank", sourceUrl:"https://www.acefitness.org/resources/everyone/exercise-library/32/front-plank/"
      },
      {
        name:"绳索抗旋转（Pallof Press）", dose:"3组 × 8–12次/侧", cue:"核心任务是抵抗旋转，而不是把重量推得很快。",
        equipment:"龙门架 / 弹力带", target:"腹斜肌、腹横肌、躯干稳定", level:"入门", rest:"45–60秒",
        setup:["滑轮调到胸口高度，身体侧对机器站立。","双手把把手抱在胸前，双脚站稳。"],
        steps:["保持躯干正对前方，将双手缓慢向前推出。","抵抗绳索把身体拉向一侧的力量。","收回胸前并重复，完成后换另一侧。"],
        mistakes:["身体跟着绳索旋转。","过度后仰。","阻力太大导致无法保持姿势。"],
        progression:"可以加大与机器的距离或延长推出后的停顿时间。",
        sourceName:"ACE Exercise Library", sourceUrl:"https://www.acefitness.org/resources/everyone/exercise-library/"
      },
      {
        name:"死虫", dose:"3组 × 6–10次/侧", cue:"动作越慢越能检查腰背是否稳定。",
        equipment:"瑜伽垫 / 无器械", target:"深层核心、髋部控制", level:"入门", rest:"45秒",
        setup:["仰卧，髋膝约90°，双臂指向天花板。","收紧腹部，让腰背保持稳定。"],
        steps:["缓慢伸出一侧腿和对侧手臂。","在腰背仍能稳定时达到最大范围。","回到起始位置后换边。"],
        mistakes:["伸展时腰部明显拱起。","速度过快。","为了伸得更远牺牲核心稳定。"],
        progression:"可增加停顿时间或手持轻重量，但前提是腰背保持稳定。",
        sourceName:"ACE Exercise Library", sourceUrl:"https://www.acefitness.org/resources/everyone/exercise-library/"
      }
    ]
  },
  {
    id:"glutes", name:"臀部", icon:"🍑", desc:"臀大肌、臀中肌及髋伸展能力", actions:[
      {
        name:"臀推 / 臀桥", dose:"3–4组 × 8–12次", cue:"顶端是髋伸展，不是用腰椎过度后仰。",
        equipment:"臀推凳/平凳、杠铃和护垫；入门可徒手", target:"臀大肌；辅助：腘绳肌", level:"入门到中级", rest:"90–120秒",
        setup:["肩胛下缘靠住卧凳边缘，双脚踩稳。","杠铃放在髋部并使用护垫，徒手版本可直接开始。"],
        steps:["收紧核心并抬起髋部。","顶端让躯干与大腿接近一条直线，主动收紧臀部。","控制髋部下降，不让腰部承担主要动作。"],
        mistakes:["顶端过度挺腰。","脚位太远或太近导致膝/腿后侧不适。","重量太大无法控制顶端。"],
        progression:"先用徒手臀桥建立发力，再加杠铃或器械阻力。",
        sourceName:"ACE Glute Exercise Library", sourceUrl:"https://www.acefitness.org/resources/everyone/exercise-library/body-part/butt-hips/gluteus-maximus%28glutes%29/"
      },
      {
        name:"保加利亚分腿蹲", dose:"3组 × 8–10次/侧", cue:"单腿动作先从徒手开始，稳定比重量更重要。",
        equipment:"平凳、哑铃（可选）", target:"臀肌、股四头肌", level:"中级", rest:"90秒",
        setup:["后脚放在凳面，前脚站在足够远的位置。","躯干保持稳定，前脚完整踩地。"],
        steps:["屈髋屈膝缓慢下降。","前膝方向与脚尖一致。","以前脚发力站起，保持身体平衡。"],
        mistakes:["前脚距离过近导致膝盖压力明显增加。","左右摇晃。","一开始就使用过重哑铃。"],
        progression:"徒手 → 轻哑铃 → 双手哑铃；也可增加底部停顿。",
        sourceName:"ACE Exercise Library", sourceUrl:"https://www.acefitness.org/resources/everyone/exercise-library/"
      },
      {
        name:"髋外展机", dose:"3组 × 12–20次", cue:"控制开合，不要用身体反复前后晃动。",
        equipment:"坐姿髋外展机", target:"臀中肌、臀小肌", level:"入门", rest:"60秒",
        setup:["调整座椅与腿垫，使双腿能舒适贴住护垫。","背部稳定贴住靠背，双手握住把手。"],
        steps:["保持躯干稳定，将双腿向外打开。","末端短暂停顿。","缓慢回到起始位置，保持持续控制。"],
        mistakes:["重量过大导致动作幅度很小。","身体前后摆动。","配重片撞击。"],
        progression:"先提高控制和次数，再增加重量。",
        sourceName:"ACE Exercise Library", sourceUrl:"https://www.acefitness.org/resources/everyone/exercise-library/"
      }
    ]
  },
  {
    id:"fullbody", name:"全身", icon:"🤸", desc:"多关节综合训练，适合效率型训练日", actions:[
      {
        name:"高脚杯深蹲", dose:"3组 × 8–12次", cue:"比杠铃深蹲更容易学习躯干稳定和下蹲轨迹。",
        equipment:"哑铃或壶铃", target:"腿部、臀部、核心", level:"入门", rest:"90秒",
        setup:["双手抱住哑铃或壶铃靠近胸前。","双脚约肩宽或略宽，脚尖自然外展。"],
        steps:["屈髋屈膝向下蹲，保持胸部抬起。","膝盖与脚尖方向一致。","脚掌蹬地站起，保持重量贴近身体。"],
        mistakes:["脚跟抬起。","膝盖明显内扣。","重量远离身体导致躯干前倒。"],
        progression:"先加次数，再加重量；技术成熟后可学习杠铃深蹲。",
        sourceName:"ACE Exercise Library", sourceUrl:"https://www.acefitness.org/resources/everyone/exercise-library/"
      },
      {
        name:"农夫行走", dose:"4组 × 30–45秒", cue:"看似简单，但核心是保持姿势和稳定步态。",
        equipment:"两只哑铃或壶铃", target:"握力、肩带稳定、核心、下肢", level:"入门 / 中级", rest:"60–90秒",
        setup:["两手各握一只重量相近的哑铃或壶铃。","身体直立，肩胛稳定，前方留出安全行走区域。"],
        steps:["保持自然直立姿势向前走。","步幅保持稳定，正常呼吸。","时间结束后安全放下重量，不要直接扔落。"],
        mistakes:["耸肩、身体左右大幅倾斜。","为了速度失去步态稳定。","在拥挤区域进行。"],
        progression:"优先增加行走时间/距离，再增加重量。",
        sourceName:"ACE Exercise Library", sourceUrl:"https://www.acefitness.org/resources/everyone/exercise-library/"
      },
      {
        name:"壶铃摆动", dose:"4组 × 10–15次", cue:"属于髋主导爆发动作，新手先学髋铰链再练摆动。",
        equipment:"壶铃", target:"臀部、腿后侧、核心；辅助：背部与握力", level:"中级", rest:"90秒",
        setup:["壶铃放在身体前方，双脚略宽于髋。","先学习髋铰链，背部保持中立。"],
        steps:["髋部向后，将壶铃带入双腿之间。","快速伸髋，让髋部力量把壶铃带到前方。","手臂只负责连接，不主动用肩抬举。"],
        mistakes:["把动作做成深蹲。","用手臂把壶铃抬起来。","背部圆曲或失去核心稳定。"],
        progression:"先用轻壶铃练技术，再增加重量和组数。",
        sourceName:"ACE Exercise Library", sourceUrl:"https://www.acefitness.org/resources/everyone/exercise-library/"
      }
    ]
  }
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
function TrainingDetail({activity,onBack,onRecord}:{activity:TrainingActivity;onBack:()=>void;onRecord:(activity:TrainingActivity,action:TrainingAction)=>void}) {
  const [tutorial,setTutorial]=useState<TrainingAction | null>(null);
  const professional = activity.actions.some(action => action.equipment);

  if (tutorial) {
    return (
      <ExerciseTutorial
        activity={activity}
        action={tutorial}
        onBack={() => setTutorial(null)}
        onRecord={() => onRecord(activity, tutorial)}
      />
    );
  }

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

      {professional && (
        <div className="white-card evidence-card">
          <div className="evidence-title"><span>📚</span><b>训练方法参考</b></div>
          <div className="evidence-grid">
            <div><b>入门</b><span>先学动作，选择能规范完成约 12–15 次的重量。</span></div>
            <div><b>力量</b><span>复合动作优先；重负荷训练常用 2–3 组并保证充分休息。</span></div>
            <div><b>增肌</b><span>更看重每周总训练量，可逐步累积到约 10+ 组/肌群/周。</span></div>
          </div>
          <p>主要肌群至少每周训练 2 次；动作质量和持续执行比复杂技巧更重要。</p>
        </div>
      )}

      <div className="training-action-list">
        {activity.actions.map((action, index) => (
          <div className="white-card training-action-card professional-action" key={action.name}>
            <div className="action-index">{String(index + 1).padStart(2,"0")}</div>
            <div className="action-copy">
              <b>{action.name}</b>
              <span className="action-dose">{action.dose}</span>
              {action.equipment && <span className="action-equipment">器械：{action.equipment}</span>}
              <p>{action.cue}</p>
            </div>
            <div className="action-buttons">
              {action.equipment && <button className="tutorial-btn" onClick={() => setTutorial(action)}>教程</button>}
              <button className="record-btn" onClick={() => onRecord(activity, action)}>记录</button>
            </div>
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

function ExerciseTutorial({
  activity,action,onBack,onRecord
}:{
  activity:TrainingActivity;
  action:TrainingAction;
  onBack:()=>void;
  onRecord:()=>void;
}) {
  return (
    <div className="exercise-tutorial">
      <button className="back-button" onClick={onBack}>← 返回{activity.name}</button>

      <div className="tutorial-heading">
        <div className="training-detail-icon">{activity.icon}</div>
        <div>
          <span className="tutorial-kicker">动作教程</span>
          <h2>{action.name}</h2>
          <p>{action.target || activity.desc}</p>
        </div>
      </div>

      <div className="tutorial-meta">
        <div><span>器械</span><b>{action.equipment || "按实际情况"}</b></div>
        <div><span>难度</span><b>{action.level || "一般"}</b></div>
        <div><span>建议训练</span><b>{action.dose}</b></div>
        <div><span>组间休息</span><b>{action.rest || "按状态调整"}</b></div>
      </div>

      {action.setup?.length ? (
        <TutorialSection icon="⚙️" title="器械怎么设置">
          <ol>{action.setup.map((item,i)=><li key={i}>{item}</li>)}</ol>
          <p className="machine-note">不同品牌器械结构可能不同，座椅、滑轮和限位位置应以设备铭牌与现场说明为准。</p>
        </TutorialSection>
      ) : null}

      {action.steps?.length ? (
        <TutorialSection icon="▶️" title="动作步骤">
          <ol className="numbered-steps">{action.steps.map((item,i)=><li key={i}><span>{i+1}</span><p>{item}</p></li>)}</ol>
        </TutorialSection>
      ) : null}

      <TutorialSection icon="🎯" title="训练要点">
        <div className="cue-box">{action.cue}</div>
        <div className="method-row"><span>建议训练量</span><b>{action.dose}</b></div>
        <div className="method-row"><span>组间休息</span><b>{action.rest || "按训练目标调整"}</b></div>
        {action.progression && <div className="progression-box"><b>如何进阶</b><p>{action.progression}</p></div>}
      </TutorialSection>

      {action.mistakes?.length ? (
        <TutorialSection icon="⚠️" title="常见错误">
          <ul className="mistake-list">{action.mistakes.map((item,i)=><li key={i}>{item}</li>)}</ul>
        </TutorialSection>
      ) : null}

      {action.sourceName && action.sourceUrl && (
        <a className="source-card white-card" href={action.sourceUrl} target="_blank" rel="noreferrer">
          <div><span>专业参考来源</span><b>{action.sourceName}</b></div>
          <strong>↗</strong>
        </a>
      )}

      <div className="tutorial-safety">
        出现尖锐疼痛、明显关节不适或无法保持动作控制时应停止该动作；有既往损伤或特殊健康情况时，先咨询合格的医疗或健身专业人员。
      </div>

      <button className="primary-action" onClick={onRecord}>✓ 记录这次训练</button>
    </div>
  );
}

function TutorialSection({icon,title,children}:{icon:string;title:string;children:React.ReactNode}) {
  return (
    <section className="white-card tutorial-section">
      <h3><span>{icon}</span>{title}</h3>
      {children}
    </section>
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
