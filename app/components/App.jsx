"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { JUS_COURSES, JUS_USER, findCourse } from "../data";
import { Sidebar, Topbar } from "./ui";
import { HomeScreen, MyCoursesScreen, CourseDetailScreen } from "./ScreensBrowse";
import { PlayerScreen, MaterialScreen, ProfileScreen } from "./ScreensView";

// ── useTweaks ────────────────────────────────────────────────────────────────
function useTweaks(defaults) {
  const [values, setValues] = useState(defaults);
  const setTweak = useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === "object" && keyOrEdits !== null
      ? keyOrEdits : { [keyOrEdits]: val };
    setValues((prev) => ({ ...prev, ...edits }));
    if (typeof window !== "undefined") {
      window.parent.postMessage({ type: "__edit_mode_set_keys", edits }, "*");
      window.dispatchEvent(new CustomEvent("tweakchange", { detail: edits }));
    }
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ──────────────────────────────────────────────────────────────
const TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}
  .twk-field{appearance:none;box-sizing:border-box;width:100%;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  select.twk-field{padding-right:22px}
  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s,width .15s}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2}
  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}
`;

function TweakSection({ label }) {
  return <div className="twk-sect">{label}</div>;
}

function TweakRow({ label, children }) {
  return (
    <div className="twk-row">
      <div className="twk-lbl"><span>{label}</span></div>
      {children}
    </div>
  );
}

function TweakToggle({ label, value, onChange }) {
  return (
    <div className="twk-row twk-row-h">
      <div className="twk-lbl"><span>{label}</span></div>
      <button type="button" className="twk-toggle" data-on={value ? "1" : "0"}
        onClick={() => onChange(!value)}><i /></button>
    </div>
  );
}

function TweakRadio({ label, value, options, onChange }) {
  const opts = options.map((o) => (typeof o === "object" ? o : { value: o, label: o }));
  const idx = Math.max(0, opts.findIndex((o) => o.value === value));
  const n = opts.length;
  return (
    <TweakRow label={label}>
      <div className="twk-seg">
        <div className="twk-seg-thumb"
          style={{ left: `calc(2px + ${idx} * (100% - 4px) / ${n})`, width: `calc((100% - 4px) / ${n})` }} />
        {opts.map((o) => (
          <button key={o.value} type="button" onClick={() => onChange(o.value)}>{o.label}</button>
        ))}
      </div>
    </TweakRow>
  );
}

function TweakSelect({ label, value, options, onChange }) {
  return (
    <TweakRow label={label}>
      <select className="twk-field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => {
          const v = typeof o === "object" ? o.value : o;
          const l = typeof o === "object" ? o.label : o;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </TweakRow>
  );
}

function TweaksPanel({ title = "Tweaks", children }) {
  const [open, setOpen] = useState(false);
  const dragRef = useRef(null);
  const offsetRef = useRef({ x: 16, y: 16 });

  useEffect(() => {
    const onMsg = (e) => {
      const t = e?.data?.type;
      if (t === "__activate_edit_mode") setOpen(true);
      else if (t === "__deactivate_edit_mode") setOpen(false);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({ type: "__edit_mode_dismissed" }, "*");
  };

  if (!open) return null;
  return (
    <>
      <style>{TWEAKS_STYLE}</style>
      <div ref={dragRef} className="twk-panel" style={{ right: offsetRef.current.x, bottom: offsetRef.current.y }}>
        <div className="twk-hd">
          <b>{title}</b>
          <button className="twk-x" onClick={dismiss}>✕</button>
        </div>
        <div className="twk-body">{children}</div>
      </div>
    </>
  );
}

// ── MaterialsScreen ──────────────────────────────────────────────────────────
function MaterialsScreen({ onOpenMaterial }) {
  const items = [];
  JUS_COURSES.forEach((c) => (c.modules || []).forEach((m) =>
    m.lessons.filter((l) => l.type === "pdf").forEach((l) => items.push({ c, m, l }))));
  return (
    <div className="screen pad">
      <div className="page-head">
        <div>
          <h1 className="page-title">Materiais</h1>
          <p className="page-sub">{items.length} materiais em PDF dos seus cursos</p>
        </div>
      </div>
      <div className="mat-grid">
        {items.map(({ c, m, l }) => (
          <button key={l.id} className="mat-card" onClick={() => onOpenMaterial(c, m, l)}>
            <span className="mat-card-doc"><i className="fa-solid fa-file-pdf" /></span>
            <span className="mat-card-info">
              <strong>{l.title}</strong>
              <small>{c.short} · {m.title.replace(/^Módulo \d+ — /, "")}</small>
              <span className="mat-card-meta"><span>PDF</span><span className="dot" /><span>{l.pages} páginas</span></span>
            </span>
            <i className="fa-solid fa-arrow-down" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── TWEAK_DEFAULTS ───────────────────────────────────────────────────────────
const TWEAK_DEFAULTS = {
  heroStyle: "cinematic",
  heroCourse: "const-2f",
  cardWidth: "regular",
  showContinue: true,
};

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useState({ screen: "home" });
  const u = JUS_USER;
  const mainRef = useRef(null);

  useEffect(() => { if (mainRef.current) mainRef.current.scrollTop = 0; }, [route]);

  const go = (screen, extra = {}) => setRoute({ screen, ...extra });
  const openCourse = (course) => go("course", { courseId: course.id });
  const playFeatured = (course) => {
    if (course.modules && course.modules.length) {
      for (const m of course.modules) {
        const l = m.lessons.find((x) => x.type === "video");
        if (l) return go("player", { courseId: course.id, modId: m.id, lessonId: l.id });
      }
    }
    openCourse(course);
  };
  const playLesson = (course, mod, lesson) => go("player", { courseId: course.id, modId: mod.id, lessonId: lesson.id });
  const openMaterial = (course, mod, lesson) => go("material", { courseId: course.id, modId: mod.id, lessonId: lesson.id });

  const course = route.courseId ? findCourse(route.courseId) : null;
  const mod = course && route.modId ? course.modules.find((m) => m.id === route.modId) : null;
  const lesson = mod && route.lessonId ? mod.lessons.find((l) => l.id === route.lessonId) : null;

  let active = route.screen;
  if (["course", "player", "material"].includes(route.screen)) active = "courses";

  let topProps = { user: u, onNav: go };
  let body = null;

  switch (route.screen) {
    case "home":
      topProps.title = `Olá, ${u.first} — bons estudos`;
      body = <HomeScreen onOpen={openCourse} onPlay={playFeatured}
        heroStyle={t.heroStyle} heroCourseId={t.heroCourse} showContinue={t.showContinue} />;
      break;
    case "courses":
      topProps.title = "Meus Cursos";
      body = <MyCoursesScreen onOpen={openCourse} />;
      break;
    case "continue":
      topProps.title = "Continuar Assistindo";
      body = <MyCoursesScreen onOpen={openCourse} />;
      break;
    case "materials":
      topProps.title = "Materiais";
      body = <MaterialsScreen onOpenMaterial={openMaterial} />;
      break;
    case "certs":
    case "settings":
    case "profile":
      topProps.title = "Meu Perfil";
      body = <ProfileScreen />;
      break;
    case "course":
      topProps.crumbs = [{ label: "Meus Cursos", onClick: () => go("courses") }, { label: course.short }];
      topProps.onBack = () => go("courses");
      body = <CourseDetailScreen course={course} onPlayLesson={playLesson} onOpenMaterial={openMaterial} onBack={() => go("courses")} />;
      break;
    case "player":
      topProps.crumbs = [
        { label: "Meus Cursos", onClick: () => go("courses") },
        { label: course.short, onClick: () => openCourse(course) },
        { label: "Aula " + lesson.n },
      ];
      topProps.onBack = () => openCourse(course);
      body = <PlayerScreen course={course} mod={mod} lesson={lesson} onPlayLesson={playLesson} onOpenMaterial={openMaterial} onBack={() => openCourse(course)} />;
      break;
    case "material":
      topProps.crumbs = [
        { label: "Meus Cursos", onClick: () => go("courses") },
        { label: course.short, onClick: () => openCourse(course) },
        { label: "Material" },
      ];
      topProps.onBack = () => openCourse(course);
      body = <MaterialScreen course={course} mod={mod} lesson={lesson} onBack={() => openCourse(course)} />;
      break;
    default:
      body = <HomeScreen onOpen={openCourse} onPlay={playFeatured} heroStyle={t.heroStyle} heroCourseId={t.heroCourse} />;
  }

  const featuredOptions = JUS_COURSES.filter((c) => c.featured);

  return (
    <div className="app">
      <Sidebar active={active} onNav={go} user={u} />
      <div className="main" ref={mainRef}>
        <Topbar {...topProps} />
        <div className="content">{body}</div>
      </div>

      <TweaksPanel>
        <TweakSection label="Home — Destaque" />
        <TweakRadio label="Layout do hero" value={t.heroStyle}
          options={["cinematic", "spotlight", "split"]}
          onChange={(v) => setTweak("heroStyle", v)} />
        <TweakSelect label="Curso em destaque" value={t.heroCourse}
          options={featuredOptions.map((c) => ({ value: c.id, label: c.short }))}
          onChange={(v) => setTweak("heroCourse", v)} />
        <TweakToggle label="Mostrar 'Continue de onde parou'" value={t.showContinue}
          onChange={(v) => setTweak("showContinue", v)} />
      </TweaksPanel>
    </div>
  );
}
