"use client";

import { useState, useEffect, useRef } from "react";
import { IMG, JUS_COURSES, JUS_USER } from "../data";
import { cx, Btn } from "./ui";

function parseDur(d) {
  if (!d) return 600;
  let s = 0;
  const h = /(\d+)h/.exec(d);
  const m = /(\d+)min/.exec(d);
  if (h) s += parseInt(h[1]) * 3600;
  if (m) s += parseInt(m[1]) * 60;
  return s || 600;
}

function fmt(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
  const mm = String(m).padStart(2, "0"), ss = String(sec).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

export function PlayerScreen({ course, mod, lesson, onPlayLesson, onOpenMaterial, onBack }) {
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(lesson.progress || 0);
  const [tab, setTab] = useState("about");
  const total = parseDur(lesson.duration);

  useEffect(() => { setT(lesson.progress || 0); setPlaying(false); }, [lesson.id]);
  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(() => setT((x) => Math.min(1, x + 0.5 / total)), 500);
    return () => clearInterval(iv);
  }, [playing, total]);

  const cur = Math.round(t * total);
  const idx = mod.lessons.findIndex((l) => l.id === lesson.id);
  const upNext = mod.lessons.slice(idx + 1).concat(mod.lessons.slice(0, idx));
  const pdfs = mod.lessons.filter((l) => l.type === "pdf");

  return (
    <div className="screen player">
      <div className="player-grid">
        <div className="player-main">
          <div className="stage" style={{ backgroundImage: `url(${IMG(lesson.img, 1200, 700)})` }}>
            <div className="stage-veil" />
            {!playing && (
              <button className="stage-big-play" onClick={() => setPlaying(true)}>
                <i className="fa-solid fa-play" />
              </button>
            )}
            <div className="stage-top">
              <span className="stage-mod">{mod.title}</span>
              <span className="stage-live"><i className="fa-solid fa-circle" /> Aula {lesson.n}</span>
            </div>
            <div className="controls">
              <div className="scrub" onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setT(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)));
              }}>
                <div className="scrub-buf" style={{ width: Math.min(100, t * 100 + 12) + "%" }} />
                <div className="scrub-fill" style={{ width: t * 100 + "%" }}><span className="scrub-knob" /></div>
              </div>
              <div className="controls-row">
                <div className="controls-left">
                  <button onClick={() => setPlaying((p) => !p)}>
                    <i className={cx("fa-solid", playing ? "fa-pause" : "fa-play")} />
                  </button>
                  <button onClick={() => setT((x) => Math.max(0, x - 10 / total))}><i className="fa-solid fa-rotate-left" /></button>
                  <button onClick={() => setT((x) => Math.min(1, x + 10 / total))}><i className="fa-solid fa-rotate-right" /></button>
                  <button><i className="fa-solid fa-volume-high" /></button>
                  <span className="time">{fmt(cur)} <span>/ {lesson.duration}</span></span>
                </div>
                <div className="controls-right">
                  <button className="speed">1x</button>
                  <button><i className="fa-solid fa-closed-captioning" /></button>
                  <button><i className="fa-solid fa-gear" /></button>
                  <button><i className="fa-solid fa-expand" /></button>
                </div>
              </div>
            </div>
          </div>

          <div className="lesson-info">
            <div className="lesson-info-head">
              <div>
                <span className="li-crumb">{course.short} · {mod.title}</span>
                <h1>{lesson.title}</h1>
                <span className="li-instr">com {course.instructor}</span>
              </div>
              <div className="lesson-info-actions">
                <Btn variant={t >= 1 ? "done" : "outline"} icon={t >= 1 ? "fa-check" : "fa-circle-check"}
                  onClick={() => setT(1)}>{t >= 1 ? "Concluída" : "Marcar concluída"}</Btn>
                <button className="round-btn"><i className="fa-regular fa-bookmark" /></button>
                <button className="round-btn"><i className="fa-solid fa-share" /></button>
              </div>
            </div>

            <div className="tabs">
              <button className={cx("tab", tab === "about" && "on")} onClick={() => setTab("about")}>Sobre a aula</button>
              <button className={cx("tab", tab === "materials" && "on")} onClick={() => setTab("materials")}>
                Materiais {pdfs.length > 0 && <span className="tab-count">{pdfs.length}</span>}
              </button>
              <button className={cx("tab", tab === "notes" && "on")} onClick={() => setTab("notes")}>Minhas anotações</button>
            </div>

            {tab === "about" && (
              <div className="tab-body">
                <p>Nesta aula você vai aprofundar <strong>{lesson.title.toLowerCase()}</strong>, com exemplos práticos e direcionamento de banca. O professor {course.instructor.replace(/^Prof[ª.]*\s*/, "")} apresenta a teoria essencial e parte direto para a aplicação em prova.</p>
                <div className="about-grid">
                  <div><span className="about-k">Duração</span><span className="about-v">{lesson.duration}</span></div>
                  <div><span className="about-k">Módulo</span><span className="about-v">{mod.title.replace(/^Módulo \d+ — /, "")}</span></div>
                  <div><span className="about-k">Nível</span><span className="about-v">Intermediário</span></div>
                  <div><span className="about-k">Atualizada</span><span className="about-v">mai/2026</span></div>
                </div>
              </div>
            )}
            {tab === "materials" && (
              <div className="tab-body">
                {pdfs.length === 0 ? <p className="muted">Nenhum material complementar nesta aula.</p> : (
                  <div className="mat-list">
                    {pdfs.map((p) => (
                      <button key={p.id} className="mat-item" onClick={() => onOpenMaterial(course, mod, p)}>
                        <span className="lesson-doc sm"><i className="fa-solid fa-file-pdf" /></span>
                        <span className="mat-item-info"><strong>{p.title}</strong><small>PDF · {p.pages} páginas</small></span>
                        <i className="fa-solid fa-arrow-right" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {tab === "notes" && (
              <div className="tab-body">
                <textarea className="notes-area" placeholder="Anote os pontos-chave desta aula... (salvo automaticamente)" />
              </div>
            )}
          </div>
        </div>

        <aside className="player-rail">
          <div className="rail-head">
            <h3>A seguir</h3>
            <span>{mod.title.replace(/^Módulo \d+ — /, "")}</span>
          </div>
          <div className="rail-list">
            {upNext.map((l) => (
              <button key={l.id} className={cx("rail-item", l.type === "pdf" && "is-pdf")}
                onClick={() => l.type === "video" ? onPlayLesson(course, mod, l) : onOpenMaterial(course, mod, l)}>
                {l.type === "video" ? (
                  <span className="rail-thumb">
                    <img src={IMG(l.img, 200, 120)} alt="" loading="lazy" />
                    <span className="rail-thumb-play"><i className="fa-solid fa-play" /></span>
                  </span>
                ) : (
                  <span className="rail-thumb rail-doc"><i className="fa-solid fa-file-pdf" /></span>
                )}
                <span className="rail-info">
                  <span className={cx("rail-type", l.type === "video" ? "t-video" : "t-pdf")}>
                    {l.type === "video" ? "Aula " + l.n : "Material"}
                  </span>
                  <strong>{l.title}</strong>
                  <small>{l.type === "video" ? l.duration : l.pages + " páginas"}</small>
                </span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

const PDF_PAGES = [
  { h: "1. Introdução", lead: "Este material complementa a videoaula e sistematiza os pontos essenciais para a prova.", bullets: true },
  { h: "2. Conceitos-chave", lead: "Fixe a terminologia da banca antes de avançar para a aplicação prática.", bullets: true },
  { h: "3. Jurisprudência selecionada", lead: "Precedentes recentes do STF e do STJ com relevância direta para o edital.", bullets: false },
  { h: "4. Questões comentadas", lead: "Resolução passo a passo de questões no padrão da banca examinadora.", bullets: true },
  { h: "5. Síntese e revisão", lead: "Mapa de revisão rápida para a véspera da prova.", bullets: false },
];

export function MaterialScreen({ course, mod, lesson, onBack }) {
  const total = lesson.pages || 12;
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const pageRef = useRef(null);
  useEffect(() => { if (pageRef.current) pageRef.current.scrollTop = 0; }, [page]);
  const data = PDF_PAGES[(page - 1) % PDF_PAGES.length];

  return (
    <div className="screen viewer">
      <div className="viewer-toolbar">
        <div className="vt-left">
          <span className="lesson-doc sm"><i className="fa-solid fa-file-pdf" /></span>
          <div className="vt-title">
            <strong>{lesson.title}</strong>
            <small>{course.short} · {mod.title}</small>
          </div>
        </div>
        <div className="vt-center">
          <button className="icon-btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><i className="fa-solid fa-chevron-left" /></button>
          <span className="vt-page">Página <strong>{page}</strong> de {total}</span>
          <button className="icon-btn" disabled={page >= total} onClick={() => setPage((p) => Math.min(total, p + 1))}><i className="fa-solid fa-chevron-right" /></button>
        </div>
        <div className="vt-right">
          <div className="zoom">
            <button onClick={() => setZoom((z) => Math.max(60, z - 10))}><i className="fa-solid fa-minus" /></button>
            <span>{zoom}%</span>
            <button onClick={() => setZoom((z) => Math.min(160, z + 10))}><i className="fa-solid fa-plus" /></button>
          </div>
          <Btn variant="outline" icon="fa-arrow-down">Baixar PDF</Btn>
        </div>
      </div>

      <div className="viewer-body">
        <aside className="thumbs">
          {Array.from({ length: total }).map((_, i) => (
            <button key={i} className={cx("thumb", page === i + 1 && "on")} onClick={() => setPage(i + 1)}>
              <span className="thumb-pg">
                <span className="thumb-line w70" /><span className="thumb-line" /><span className="thumb-line" /><span className="thumb-line w50" />
              </span>
              <span className="thumb-n">{i + 1}</span>
            </button>
          ))}
        </aside>

        <div className="viewer-stage" ref={pageRef}>
          <div className="pdf-page" style={{ transform: `scale(${zoom / 100})` }}>
            <div className="pdf-head">
              <span className="pdf-brand">JUS<b>21</b></span>
              <span className="pdf-course">{course.short} — {mod.title.replace(/^Módulo \d+ — /, "")}</span>
            </div>
            <h1 className="pdf-h1">{lesson.title}</h1>
            <h2 className="pdf-h2">{data.h}</h2>
            <p className="pdf-lead">{data.lead}</p>
            {data.bullets ? (
              <ul className="pdf-list">
                <li><span className="pl-line w90" /></li>
                <li><span className="pl-line w80" /></li>
                <li><span className="pl-line w95" /></li>
              </ul>
            ) : (
              <div className="pdf-quote"><span className="pl-line w85" /><span className="pl-line w70" /></div>
            )}
            <div className="pdf-para"><span className="pl-line" /><span className="pl-line" /><span className="pl-line w90" /><span className="pl-line w60" /></div>
            <div className="pdf-para"><span className="pl-line" /><span className="pl-line w95" /><span className="pl-line w75" /></div>
            <div className="pdf-callout">
              <i className="fa-solid fa-circle-info" />
              <span><span className="pl-line w85" /><span className="pl-line w50" /></span>
            </div>
            <div className="pdf-foot"><span>Material exclusivo Jus21 · proibida a reprodução</span><span>{page} / {total}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

const CERTS = [
  { course: "PJe na Prática: Do Zero ao Protocolo", date: "Concluído em 12/04/2026", hours: "14h", code: "JUS21-PJE-2026-00471" },
  { course: "Direito Constitucional — Módulo 1", date: "Concluído em 03/02/2026", hours: "9h", code: "JUS21-CON-2026-01188" },
];

function Field({ label, value }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input defaultValue={value} />
    </label>
  );
}

export function ProfileScreen() {
  const u = JUS_USER;
  const [tab, setTab] = useState("dados");
  const [notif, setNotif] = useState({ aulas: true, materiais: true, email: false, promo: true });
  const stats = [
    { k: "Cursos adquiridos", v: JUS_COURSES.length, icon: "fa-graduation-cap" },
    { k: "Em andamento", v: JUS_COURSES.filter((c) => c.progress > 0).length, icon: "fa-circle-play" },
    { k: "Certificados", v: CERTS.length, icon: "fa-award" },
    { k: "Horas estudadas", v: "86h", icon: "fa-clock" },
  ];
  return (
    <div className="screen pad profile">
      <div className="profile-head">
        <div className="profile-avatar">
          <img src={u.avatar} alt="" />
          <button className="avatar-edit"><i className="fa-solid fa-camera" /></button>
        </div>
        <div className="profile-id">
          <h1>{u.name}</h1>
          <p>{u.email}</p>
          <div className="profile-badges">
            <span className="plan-badge"><i className="fa-solid fa-crown" /> {u.plan}</span>
            <span className="since">{u.since}</span>
          </div>
        </div>
        <Btn variant="outline" icon="fa-pen" onClick={() => setTab("dados")}>Editar perfil</Btn>
      </div>

      <div className="profile-stats">
        {stats.map((s) => (
          <div className="stat" key={s.k}>
            <i className={cx("fa-solid", s.icon)} />
            <div><strong>{s.v}</strong><span>{s.k}</span></div>
          </div>
        ))}
      </div>

      <div className="tabs profile-tabs">
        <button className={cx("tab", tab === "dados" && "on")} onClick={() => setTab("dados")}>Dados pessoais</button>
        <button className={cx("tab", tab === "certs" && "on")} onClick={() => setTab("certs")}>Certificados</button>
        <button className={cx("tab", tab === "config" && "on")} onClick={() => setTab("config")}>Configurações</button>
      </div>

      {tab === "dados" && (
        <div className="form-card">
          <div className="form-grid">
            <Field label="Nome completo" value="Mariana Costa Ferreira" />
            <Field label="E-mail" value="mariana.costa@email.com" />
            <Field label="Telefone" value="(81) 99876-5432" />
            <Field label="CPF" value="123.456.789-09" />
            <Field label="Data de nascimento" value="14/08/1996" />
            <Field label="Cidade / UF" value="Recife / PE" />
            <Field label="Profissão" value="Bacharel em Direito" />
            <Field label="OAB (se aplicável)" value="Em obtenção" />
          </div>
          <div className="form-foot">
            <Btn variant="ghost">Cancelar</Btn>
            <Btn icon="fa-check">Salvar alterações</Btn>
          </div>
        </div>
      )}

      {tab === "certs" && (
        <div className="certs-grid">
          {CERTS.map((c) => (
            <div className="cert" key={c.code}>
              <div className="cert-ribbon"><i className="fa-solid fa-award" /></div>
              <span className="cert-label">Certificado de conclusão</span>
              <h3>{c.course}</h3>
              <div className="cert-meta"><span>{c.date}</span><span className="dot" /><span>{c.hours}</span></div>
              <div className="cert-code">Cód. {c.code}</div>
              <div className="cert-actions">
                <Btn variant="gold" icon="fa-arrow-down">Baixar PDF</Btn>
                <button className="round-btn"><i className="fa-solid fa-share" /></button>
              </div>
            </div>
          ))}
          <div className="cert cert-empty">
            <i className="fa-solid fa-medal" />
            <p>Continue estudando para desbloquear novos certificados ao concluir cada curso.</p>
          </div>
        </div>
      )}

      {tab === "config" && (
        <div className="config">
          <div className="config-card">
            <h3>Notificações</h3>
            {[
              { k: "aulas", label: "Novas aulas liberadas", sub: "Avise quando um curso publicar conteúdo novo" },
              { k: "materiais", label: "Novos materiais em PDF", sub: "Apostilas, mapas mentais e listas de questões" },
              { k: "email", label: "Resumo semanal por e-mail", sub: "Seu progresso e metas da semana" },
              { k: "promo", label: "Ofertas e lançamentos Jus21", sub: "Novos cursos e condições especiais" },
            ].map((n) => (
              <div className="toggle-row" key={n.k}>
                <div><strong>{n.label}</strong><small>{n.sub}</small></div>
                <button className={cx("switch", notif[n.k] && "on")} onClick={() => setNotif((s) => ({ ...s, [n.k]: !s[n.k] }))}>
                  <span className="switch-knob" />
                </button>
              </div>
            ))}
          </div>
          <div className="config-card">
            <h3>Plano e assinatura</h3>
            <div className="plan-row">
              <div>
                <span className="plan-badge lg"><i className="fa-solid fa-crown" /> Jus21 Premium Anual</span>
                <p className="muted">Renova em 14/03/2027 · R$ 1.188/ano</p>
              </div>
              <Btn variant="outline">Gerenciar plano</Btn>
            </div>
            <ul className="plan-perks">
              <li><i className="fa-solid fa-check" /> Acesso a todos os cursos adquiridos</li>
              <li><i className="fa-solid fa-check" /> Materiais em PDF para download</li>
              <li><i className="fa-solid fa-check" /> Certificados de conclusão</li>
            </ul>
          </div>
          <div className="config-card">
            <h3>Segurança</h3>
            <div className="toggle-row"><div><strong>Alterar senha</strong><small>Última alteração há 3 meses</small></div><Btn variant="ghost">Alterar</Btn></div>
            <div className="toggle-row"><div><strong>Sair de todos os dispositivos</strong><small>Encerra sessões ativas</small></div><Btn variant="ghost">Encerrar</Btn></div>
          </div>
        </div>
      )}
    </div>
  );
}
