"use client";

import { useState, useRef } from "react";
import { IMG } from "../data";

export function cx(...a) {
  return a.filter(Boolean).join(" ");
}

export function tagTone(tag) {
  if (/OAB/.test(tag)) return "gold";
  if (/PÓS/.test(tag)) return "violet";
  if (/POLICIAL/.test(tag)) return "blue";
  if (/TRIBUNAIS/.test(tag)) return "blue";
  return "slate";
}

export function ProgressBar({ value, height = 4, className }) {
  const pct = Math.round((value || 0) * 100);
  return (
    <div className={cx("prog", className)} style={{ height }}>
      <div className="prog-fill" style={{ width: pct + "%" }} />
    </div>
  );
}

export function Tag({ children, tone = "blue" }) {
  return <span className={cx("tag", `tag-${tone}`)}>{children}</span>;
}

export function Avatar({ src, size = 36, ring }) {
  return (
    <span
      className={cx("avatar", ring && "avatar-ring")}
      style={{ width: size, height: size }}
    >
      <img src={src} alt="" />
    </span>
  );
}

export function Btn({
  children,
  icon,
  variant = "primary",
  onClick,
  className,
}) {
  return (
    <button
      className={cx("btn", `btn-${variant}`, className)}
      onClick={onClick}
    >
      {icon && <i className={cx("fa-solid", icon)} />}
      {children}
    </button>
  );
}

const NAV = [
  {
    group: "Navegação",
    items: [
      { id: "home", label: "Início", icon: "fa-house" },
      { id: "courses", label: "Meus Cursos", icon: "fa-graduation-cap" },
      // { id: "continue", label: "Continuar Assistindo", icon: "fa-circle-play" },
    ],
  },
  {
    group: "Biblioteca",
    items: [
      { id: "materials", label: "Materiais", icon: "fa-folder-open" },
      { id: "certs", label: "Certificados", icon: "fa-award" },
    ],
  },
  {
    group: "Conta",
    items: [
      { id: "profile", label: "Meu Perfil", icon: "fa-user" },
      { id: "settings", label: "Configurações", icon: "fa-gear" },
    ],
  },
];

export function Sidebar({ active, onNav, user }) {
  return (
    <aside className="sidebar">
      <div className="brand" onClick={() => onNav("home")}>
        <span className="brand-mark">J21</span>
        <span className="brand-word">
          JUS<span className="brand-num">21</span>
        </span>
      </div>
      <nav className="nav">
        {NAV.map((sec) => (
          <div className="nav-group" key={sec.group}>
            <div className="nav-group-label">{sec.group}</div>
            {sec.items.map((it) => {
              const on =
                active === it.id ||
                (active === "course" && it.id === "courses");
              return (
                <button
                  key={it.id}
                  className={cx("nav-item", on && "on")}
                  onClick={() => onNav(it.id)}
                >
                  <i className={cx("fa-solid", it.icon)} />
                  <span>{it.label}</span>
                  {on && <span className="nav-dot" />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      <button className="nav-user" onClick={() => onNav("profile")}>
        <Avatar src={user.avatar} size={40} ring />
        <span className="nav-user-info">
          <strong>
            {user.first} {user.name.split(" ").slice(-1)}
          </strong>
          <small>{user.plan}</small>
        </span>
        <i className="fa-solid fa-chevron-right" />
      </button>
    </aside>
  );
}

export function Topbar({ title, crumbs, onBack, user, onNav }) {
  const [q, setQ] = useState("");
  return (
    <header className="topbar">
      <div className="topbar-left">
        {onBack && (
          <button className="icon-btn" onClick={onBack} title="Voltar">
            <i className="fa-solid fa-arrow-left" />
          </button>
        )}
        {crumbs ? (
          <div className="crumbs">
            {crumbs.map((c, i) => (
              <span key={i} className="crumb">
                {c.onClick ? (
                  <button onClick={c.onClick}>{c.label}</button>
                ) : (
                  <span>{c.label}</span>
                )}
                {i < crumbs.length - 1 && (
                  <i className="fa-solid fa-angle-right" />
                )}
              </span>
            ))}
          </div>
        ) : (
          <h1 className="topbar-title">{title}</h1>
        )}
      </div>
      <div className="search">
        <i className="fa-solid fa-magnifying-glass" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar cursos, aulas, materiais..."
        />
      </div>
      <div className="topbar-right">
        <button className="icon-btn badge-btn" title="Notificações">
          <i className="fa-regular fa-bell" />
          <span className="ping" />
        </button>
        <button className="icon-btn" title="Ajuda">
          <i className="fa-regular fa-circle-question" />
        </button>
        <button className="profile-chip" onClick={() => onNav("profile")}>
          <Avatar src={user.avatar} size={34} />
          <span>
            <strong>{user.first}</strong>
            <small>{user.plan.replace("Jus21 ", "")}</small>
          </span>
        </button>
      </div>
    </header>
  );
}

export function CourseCard({ course, onOpen, width = 300, showProgress }) {
  return (
    <button className="ccard" style={{ width }} onClick={() => onOpen(course)}>
      <div className="ccard-art">
        <img
          src={IMG(course.cover, 600, 360)}
          alt={course.title}
          loading="lazy"
        />
        <div className="ccard-grad" />
        <span className="ccard-tag">
          <Tag tone={tagTone(course.tag)}>{course.tag}</Tag>
        </span>
        <div className="ccard-hover">
          <div className="ccard-actions">
            <span className="play-btn">
              <i className="fa-solid fa-play" />
            </span>
            <span className="round-btn">
              <i className="fa-solid fa-plus" />
            </span>
            <span className="round-btn">
              <i className="fa-regular fa-bookmark" />
            </span>
          </div>
          <div className="ccard-meta">
            <span>
              <i className="fa-solid fa-star" /> {course.rating}
            </span>
            <span>
              <i className="fa-regular fa-clock" /> {course.hours}
            </span>
            <span>
              <i className="fa-solid fa-film" /> {course.lessonsCount} aulas
            </span>
          </div>
          <p className="ccard-syn">{course.synopsis}</p>
        </div>
        {showProgress && course.progress > 0 && (
          <div className="ccard-prog">
            <ProgressBar value={course.progress} />
          </div>
        )}
      </div>
      <div className="ccard-body">
        <h3>{course.short}</h3>
        <p>{course.instructor}</p>
      </div>
    </button>
  );
}

export function Carousel({ title, sub, courses, onOpen, showProgress }) {
  const ref = useRef(null);
  const scroll = (dir) => {
    const el = ref.current;
    if (el)
      el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };
  return (
    <section className="row">
      <div className="row-head">
        <div>
          <h2>{title}</h2>
          {sub && <p>{sub}</p>}
        </div>
        <div className="row-nav">
          <button className="icon-btn" onClick={() => scroll(-1)}>
            <i className="fa-solid fa-chevron-left" />
          </button>
          <button className="icon-btn" onClick={() => scroll(1)}>
            <i className="fa-solid fa-chevron-right" />
          </button>
        </div>
      </div>
      <div className="row-track" ref={ref}>
        {courses.map((c) => (
          <CourseCard
            key={c.id + title}
            course={c}
            onOpen={onOpen}
            showProgress={showProgress}
          />
        ))}
      </div>
    </section>
  );
}
