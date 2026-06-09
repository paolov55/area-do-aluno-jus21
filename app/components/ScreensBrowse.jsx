"use client";

import { useState } from "react";
import { IMG, JUS_COURSES, JUS_ROWS, findCourse, byIds } from "../data";
import { cx, ProgressBar, Tag, tagTone, Btn, Carousel } from "./ui";

function Hero({ course, onOpen, onPlay, style }) {
  const meta = (
    <div className="hero-meta">
      <span className="hero-match"><i className="fa-solid fa-star" /> {course.rating}</span>
      <span>{course.hours} de conteúdo</span>
      <span className="dot" />
      <span>{course.lessonsCount} aulas</span>
      <span className="dot" />
      <span>{course.students} alunos</span>
    </div>
  );
  const actions = (
    <div className="hero-actions">
      <Btn icon="fa-play" onClick={() => onPlay(course)}>
        {course.progress > 0 ? "Continuar assistindo" : "Começar curso"}
      </Btn>
      <Btn variant="ghost" icon="fa-circle-info" onClick={() => onOpen(course)}>Ver detalhes</Btn>
      <button className="round-btn lg" title="Minha lista"><i className="fa-solid fa-plus" /></button>
    </div>
  );

  if (style === "split") {
    return (
      <section className="hero hero-split">
        <div className="hero-split-text">
          <Tag tone={tagTone(course.tag)}>{course.tag}</Tag>
          <h1>{course.title}</h1>
          <p className="hero-instr">com {course.instructor}</p>
          {meta}
          <p className="hero-syn">{course.synopsis}</p>
          {course.progress > 0 && (
            <div className="hero-progress">
              <ProgressBar value={course.progress} height={6} />
              <span>{Math.round(course.progress * 100)}% concluído</span>
            </div>
          )}
          {actions}
        </div>
        <div className="hero-split-art">
          <img src={IMG(course.hero || course.cover, 1100, 1000)} alt="" />
          <div className="hero-split-fade" />
        </div>
      </section>
    );
  }

  if (style === "spotlight") {
    return (
      <section className="hero hero-spotlight" style={{ backgroundImage: `url(${IMG(course.hero || course.cover, 1600, 900)})` }}>
        <div className="hero-scrim" />
        <div className="hero-inner center">
          <Tag tone={tagTone(course.tag)}>{course.tag}</Tag>
          <h1>{course.title}</h1>
          {meta}
          <p className="hero-syn">{course.synopsis}</p>
          {actions}
        </div>
        <div className="hero-thumbs">
          {byIds(["const-2f", "pc-ba", "tjce", "pos-digital"]).map((c) => (
            <button key={c.id} className="hero-thumb" onClick={() => onOpen(c)}>
              <img src={IMG(c.cover, 200, 120)} alt="" />
            </button>
          ))}
        </div>
      </section>
    );
  }

  // cinematic (default)
  return (
    <section className="hero hero-cinematic" style={{ backgroundImage: `url(${IMG(course.hero || course.cover, 1700, 900)})` }}>
      <div className="hero-scrim" />
      <div className="hero-scrim-bottom" />
      <div className="hero-inner">
        <Tag tone={tagTone(course.tag)}>{course.tag}</Tag>
        <h1>{course.title}</h1>
        <p className="hero-instr">com {course.instructor}</p>
        {meta}
        <p className="hero-syn">{course.synopsis}</p>
        {course.progress > 0 && (
          <div className="hero-progress">
            <ProgressBar value={course.progress} height={6} />
            <span>{Math.round(course.progress * 100)}% concluído</span>
          </div>
        )}
        {actions}
      </div>
    </section>
  );
}

export function HomeScreen({ onOpen, onPlay, heroStyle, heroCourseId, showContinue = true }) {
  const featured = findCourse(heroCourseId) || JUS_COURSES.find((c) => c.featured);
  const continuing = JUS_COURSES.filter((c) => c.progress > 0).sort((a, b) => b.progress - a.progress);
  return (
    <div className="screen home">
      <Hero course={featured} onOpen={onOpen} onPlay={onPlay} style={heroStyle} />
      <div className="rows">
        {showContinue && continuing.length > 0 && (
          <Carousel title="Continue de onde parou" sub="Retome seus estudos sem perder o ritmo"
            courses={continuing} onOpen={onOpen} showProgress />
        )}
        {JUS_ROWS.map((r) => (
          <Carousel key={r.id} title={r.title} courses={byIds(r.ids)} onOpen={onOpen} showProgress />
        ))}
      </div>
    </div>
  );
}

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "oab", label: "OAB 2ª Fase" },
  { id: "policiais", label: "Carreiras Policiais" },
  { id: "tribunais", label: "Tribunais" },
  { id: "pratica", label: "Prática Jurídica" },
  { id: "pos", label: "Pós-Graduação" },
];

export function MyCoursesScreen({ onOpen }) {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  let list = JUS_COURSES.filter((c) => filter === "all" || c.category === filter);
  if (sort === "progress") list = [...list].sort((a, b) => b.progress - a.progress);
  if (sort === "az") list = [...list].sort((a, b) => a.short.localeCompare(b.short));
  const inProgress = JUS_COURSES.filter((c) => c.progress > 0).length;
  return (
    <div className="screen pad">
      <div className="page-head">
        <div>
          <h1 className="page-title">Meus Cursos</h1>
          <p className="page-sub">{JUS_COURSES.length} cursos adquiridos · {inProgress} em andamento</p>
        </div>
        <div className="sort">
          <span>Ordenar por</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="recent">Adicionados recentemente</option>
            <option value="progress">Progresso</option>
            <option value="az">A — Z</option>
          </select>
        </div>
      </div>
      <div className="chips">
        {FILTERS.map((f) => (
          <button key={f.id} className={cx("chip", filter === f.id && "on")} onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
      </div>
      <div className="grid">
        {list.map((c) => (
          <div className="gcard" key={c.id} onClick={() => onOpen(c)}>
            <div className="gcard-art">
              <img src={IMG(c.cover, 600, 340)} alt="" loading="lazy" />
              <div className="ccard-grad" />
              <span className="ccard-tag"><Tag tone={tagTone(c.tag)}>{c.tag}</Tag></span>
              <span className="gcard-play"><i className="fa-solid fa-play" /></span>
              {c.progress > 0 && <div className="ccard-prog"><ProgressBar value={c.progress} /></div>}
            </div>
            <div className="gcard-body">
              <h3>{c.short}</h3>
              <p className="gcard-instr">{c.instructor}</p>
              <div className="gcard-meta">
                <span><i className="fa-regular fa-clock" /> {c.hours}</span>
                <span><i className="fa-solid fa-film" /> {c.lessonsCount} aulas</span>
                {c.progress > 0
                  ? <span className="gcard-pct">{Math.round(c.progress * 100)}%</span>
                  : <span className="gcard-new">Novo</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LessonRow({ lesson, course, mod, onPlay, onOpenMaterial }) {
  const isVideo = lesson.type === "video";
  const done = lesson.progress >= 1;
  return (
    <li className={cx("lesson", isVideo ? "lesson-video" : "lesson-pdf")}
        onClick={() => isVideo ? onPlay(course, mod, lesson) : onOpenMaterial(course, mod, lesson)}>
      <span className="lesson-n">{String(lesson.n).padStart(2, "0")}</span>
      {isVideo ? (
        <span className="lesson-thumb">
          <img src={IMG(lesson.img, 240, 140)} alt="" loading="lazy" />
          <span className="lesson-thumb-play"><i className="fa-solid fa-play" /></span>
          {lesson.progress > 0 && lesson.progress < 1 && (
            <span className="lesson-thumb-prog"><ProgressBar value={lesson.progress} /></span>
          )}
        </span>
      ) : (
        <span className="lesson-doc">
          <i className="fa-solid fa-file-pdf" />
        </span>
      )}
      <span className="lesson-main">
        <span className="lesson-title-row">
          <span className={cx("lesson-type", isVideo ? "t-video" : "t-pdf")}>
            <i className={cx("fa-solid", isVideo ? "fa-circle-play" : "fa-file-lines")} />
            {isVideo ? "Videoaula" : "Material PDF"}
          </span>
          {done && <span className="lesson-done"><i className="fa-solid fa-check" /> Concluída</span>}
        </span>
        <strong className="lesson-title">{lesson.title}</strong>
        <span className="lesson-meta">
          {isVideo
            ? <span><i className="fa-regular fa-clock" /> {lesson.duration}</span>
            : <span><i className="fa-regular fa-file" /> {lesson.pages} páginas</span>}
          {isVideo && lesson.progress > 0 && lesson.progress < 1 &&
            <span className="lesson-resume">· {Math.round(lesson.progress * 100)}% assistido</span>}
        </span>
      </span>
      <span className="lesson-cta">
        {isVideo
          ? <span className="round-btn"><i className="fa-solid fa-play" /></span>
          : <span className="round-btn"><i className="fa-solid fa-arrow-down" /></span>}
      </span>
    </li>
  );
}

export function CourseDetailScreen({ course, onPlayLesson, onOpenMaterial, onBack }) {
  const hasModules = course.modules && course.modules.length > 0;
  const [modId, setModId] = useState(hasModules ? course.modules[0].id : null);
  const mod = hasModules ? course.modules.find((m) => m.id === modId) : null;
  const totalDone = hasModules
    ? course.modules.reduce((a, m) => a + m.lessons.filter((l) => l.progress >= 1).length, 0) : 0;
  const totalLessons = hasModules ? course.modules.reduce((a, m) => a + m.lessons.length, 0) : 0;

  let resume = null;
  if (hasModules) {
    for (const m of course.modules) {
      const l = m.lessons.find((x) => x.type === "video" && x.progress > 0 && x.progress < 1)
        || m.lessons.find((x) => x.type === "video" && x.progress === 0);
      if (l) { resume = { mod: m, lesson: l }; break; }
    }
  }

  return (
    <div className="screen detail">
      <div className="detail-hero" style={{ backgroundImage: `url(${IMG(course.hero || course.cover, 1700, 760)})` }}>
        <div className="hero-scrim" />
        <div className="hero-scrim-bottom" />
        <div className="detail-hero-inner">
          <Tag tone={tagTone(course.tag)}>{course.tag}</Tag>
          <h1>{course.title}</h1>
          <div className="hero-meta">
            <span className="hero-match"><i className="fa-solid fa-star" /> {course.rating}</span>
            <span>{course.year}</span>
            <span className="dot" />
            <span>{course.hours}</span>
            <span className="dot" />
            <span>{course.lessonsCount} aulas</span>
            <span className="badge-hd">HD</span>
          </div>
          <p className="hero-instr">com {course.instructor}</p>
          <p className="hero-syn">{course.synopsis}</p>
          <div className="hero-actions">
            {resume
              ? <Btn icon="fa-play" onClick={() => onPlayLesson(course, resume.mod, resume.lesson)}>
                  {course.progress > 0 ? "Continuar assistindo" : "Começar agora"}
                </Btn>
              : <Btn icon="fa-play" onClick={() => {}}>Em breve</Btn>}
            <button className="round-btn lg" title="Minha lista"><i className="fa-solid fa-plus" /></button>
            <button className="round-btn lg" title="Avaliar"><i className="fa-regular fa-thumbs-up" /></button>
            <button className="round-btn lg" title="Compartilhar"><i className="fa-solid fa-share" /></button>
          </div>
          {course.skills && (
            <div className="skill-tags">
              {course.skills.map((s) => <span key={s} className="skill">{s}</span>)}
            </div>
          )}
        </div>
      </div>

      {hasModules ? (
        <div className="detail-body">
          <div className="episodes-head">
            <div>
              <h2>Conteúdo do curso</h2>
              <p>{course.modules.length} módulos · {totalLessons} aulas · {totalDone} concluídas</p>
            </div>
            <div className="module-picker">
              <label>Módulo</label>
              <select value={modId} onChange={(e) => setModId(e.target.value)}>
                {course.modules.map((m) => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="module-sub">
            <h3>{mod.title}</h3>
            <p>{mod.subtitle}</p>
          </div>

          <ul className="lessons">
            {mod.lessons.map((l) => (
              <LessonRow key={l.id} lesson={l} course={course} mod={mod}
                onPlay={onPlayLesson} onOpenMaterial={onOpenMaterial} />
            ))}
          </ul>

          <div className="module-strip">
            <h4>Todos os módulos</h4>
            <div className="module-strip-track">
              {course.modules.map((m, i) => {
                const done = m.lessons.filter((l) => l.progress >= 1).length;
                const prog = m.lessons.length ? done / m.lessons.length : 0;
                return (
                  <button key={m.id} className={cx("module-chip", m.id === modId && "on")} onClick={() => setModId(m.id)}>
                    <span className="module-chip-n">{String(i + 1).padStart(2, "0")}</span>
                    <span className="module-chip-info">
                      <strong>{m.title.replace(/^Módulo \d+ — /, "")}</strong>
                      <small>{m.lessons.length} aulas</small>
                    </span>
                    <ProgressBar value={prog} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="detail-body">
          <div className="empty-modules">
            <i className="fa-solid fa-clock-rotate-left" />
            <h3>Conteúdo em liberação</h3>
            <p>As aulas deste curso estão sendo gravadas e liberadas conforme o cronograma. Você será avisado a cada novo módulo publicado.</p>
            <Btn variant="ghost" icon="fa-bell">Avisar-me das novidades</Btn>
          </div>
        </div>
      )}
    </div>
  );
}
