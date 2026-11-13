import React, { useEffect, useRef, useState } from "react";

const CONFIG = {
  mode: "stops",
  names: ["Afsana", "Azmain"],
  year: 2026,
  month: 11,
  day: 14,
  unlock: [2026, 11, 13, 12, 0],
  years: "two",
  stops: [
    { time: "11:00", title: "Brunch", emoji: "🍽️", place: "Sun Tzu, Elmont, NY", map: "Sun Tzu, Elmont, NY", transport: "Drive to Sun Tzu", note: "Come hungry." },
    {
      time: "15:00",
      title: "Make Our Own Scent",
      emoji: "🧴",
      place: "Bios Apothecary, Greenpoint",
      map: "Bios Apothecary, 61 West St, Brooklyn, NY 11222",
      transport: "Drive to the perfume bar",
      note: "Our reservation is at 4:00 PM. We’re blending a perfume together.",
    },
    {
      time: "17:00",
      title: "Vintage Photo Booth",
      emoji: "📸",
      place: "Old Friend Photobooth, Williamsburg",
      map: "Old Friend Photobooth, 243 Berry St, Williamsburg, Brooklyn",
      transport: "Drive to the photo booth",
      note: "Four poses, one strip to keep. Worth the wait.",
    },
    {
      time: "18:00",
      title: "A Stroll By The Water",
      emoji: "🌊",
      place: "Brooklyn Bridge Park",
      map: "Brooklyn Bridge Park, Brooklyn, NY",
      transport: "Drive to the waterfront",
      note: "Bundle up. The skyline looks best after dark.",
    },
    {
      time: "19:00",
      title: "Where It All Began",
      emoji: "💋",
      place: "101 Court St, Brooklyn, NY 11201",
      map: "101 Court St, Brooklyn, NY 11201",
      transport: "Drive to Court Street",
      note: "Our first kiss, and where we made it official.",
    },
    { time: "20:00", title: "Time To Head Home", emoji: "🏠", place: "4314 Queens St, Long Island City, NY", transport: "Drive back home", note: "There’s something waiting for you heh 🤭." },
  ],
  showPreviewBar: import.meta.env.DEV,
};

const storageKey = (name) => `ann_${CONFIG.mode}_${name}`;
const load = (name) => {
  try {
    return localStorage.getItem(storageKey(name));
  } catch {
    return null;
  }
};
const save = (name, value) => {
  try {
    localStorage.setItem(storageKey(name), value);
  } catch {
    // Keep the current view usable when browser storage is unavailable.
  }
};
const pad = (value) => String(value).padStart(2, "0");
const eventDay = (hour = 0, minute = 0) => new Date(CONFIG.year, CONFIG.month - 1, CONFIG.day, hour, minute);
const unlockTime = () => new Date(...[CONFIG.unlock[0], CONFIG.unlock[1] - 1, ...CONFIG.unlock.slice(2)]);
const stopTime = (stop) => {
  const [hour, minute] = stop.time.split(":").map(Number);
  return eventDay(hour, minute);
};
const formatTime = (time) => {
  const [hour, minute] = time.split(":").map(Number);
  return `${hour % 12 || 12}:${pad(minute)} ${hour < 12 ? "AM" : "PM"}`;
};
const formatInvitationTime = (time) => {
  const [hour, minute] = time.split(":").map(Number);
  const period = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  return `${hour % 12 || 12}:${pad(minute)} in the ${period}`;
};
const formatInvitationDate = () => {
  const date = eventDay();
  const day = date.getDate();
  const suffix = day % 100 >= 11 && day % 100 <= 13
    ? "th"
    : ({ 1: "st", 2: "nd", 3: "rd" }[day % 10] || "th");
  return {
    weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
    date: `${day}${suffix} ${date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
  };
};
const countdown = (milliseconds) => {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days ? `${days}d ` : ""}${hours}h ${pad(minutes)}m ${pad(seconds % 60)}s`;
};

function NameLine() {
  return (
    <p className="script name-line">
      <span className="name-sparkle" aria-hidden="true">✦</span>{" "}
      {CONFIG.names[0]} + {CONFIG.names[1]}{" "}
      <span className="name-sparkle" aria-hidden="true">✦</span>
    </p>
  );
}

function Paper({ children, folding = false, turningIn = false, onFoldComplete }) {
  return (
    <div
      className={`paper${folding ? " paper-folding" : ""}${turningIn ? " paper-turning-in" : ""}`}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget && event.animationName === "card-turn-out") {
          onFoldComplete();
        }
      }}
    >
      <div className="paper-corners" aria-hidden="true">
        <span /><span /><span /><span />
      </div>
      {children}
    </div>
  );
}

function Envelope({ opened, clickable, onOpen, onAnimationComplete, cardReady, onCardOpen }) {
  const { weekday, date } = formatInvitationDate();
  const cardRef = useRef(null);
  useEffect(() => {
    if (cardReady) cardRef.current?.focus({ preventScroll: true });
  }, [cardReady]);
  return (
    <div
      className={`envelope${opened ? " open" : ""}`}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={clickable ? "Open the envelope" : undefined}
      onClick={clickable ? onOpen : undefined}
      onKeyDown={
        clickable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onOpen();
              }
            }
          : undefined
      }
    >
      {opened && (
        <div className="envelope-card-window">
          <button
            ref={cardRef}
            type="button"
            className="envelope-card"
            disabled={!cardReady}
            aria-label="Open your invitation"
            onClick={onCardOpen}
            onAnimationEnd={(event) => {
              if (event.target === event.currentTarget && event.animationName === "card-emerge") {
                onAnimationComplete();
              }
            }}
          >
            <div className="envelope-card-inner">
              <span className="script envelope-card-names"><span className="name-text">{CONFIG.names[0]}</span>,</span>
              <span className="envelope-card-rule" />
              <span className="script envelope-card-title">you’re cordially invited to Two Years of Us</span>
              <span className="envelope-card-date">{weekday}, {date} · {formatInvitationTime(CONFIG.stops[0].time)}</span>
              </div>
            </button>
        </div>
      )}
      <div className="flap" />
      <div className="seal script">&amp;</div>
      <div className="glitter" aria-hidden="true">
        {Array.from({ length: 10 }, (_, index) => (
          <span className="sparkle" key={index} />
        ))}
      </div>
    </div>
  );
}

function App() {
  const [rsvp, setRsvp] = useState(() => load("rsvp"));
  const [opened, setOpened] = useState(() => load("opened") === "1");
  const [animating, setAnimating] = useState(false);
  const [cardReady, setCardReady] = useState(false);
  const [folding, setFolding] = useState(false);
  const [turningIn, setTurningIn] = useState(false);
  const [note, setNote] = useState(() => load("note") || "");
  const [previewOn, setPreviewOn] = useState(import.meta.env.DEV);
  const [previewHour, setPreviewHour] = useState(23.5);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const now = previewOn
    ? eventDay(Math.floor(previewHour), (previewHour % 1) * 60)
    : currentTime;
  const unlocked = previewOn || now >= unlockTime();

  const finishOpening = () => {
    setOpened(true);
    save("opened", "1");
    setAnimating(false);
    setCardReady(false);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (!animating) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event) => {
      if (event.matches) {
        setCardReady(true);
      }
    };
    preference.addEventListener("change", handleChange);
    if (preference.matches) handleChange(preference);
    return () => preference.removeEventListener("change", handleChange);
  }, [animating]);

  const openEnvelope = () => {
    if (animating) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAnimating(true);
      setCardReady(true);
      return;
    }
    setAnimating(true);
  };

  const finishFold = () => {
    setFolding(false);
    setTurningIn(true);
    setRsvp("yes");
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (!folding) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event) => {
      if (event.matches) {
        setFolding(false);
        setTurningIn(false);
        setRsvp("yes");
        window.scrollTo(0, 0);
      }
    };
    preference.addEventListener("change", handleChange);
    if (preference.matches) handleChange(preference);
    return () => preference.removeEventListener("change", handleChange);
  }, [folding]);

  const answer = (value) => {
    if (folding) return;
    save("note", note);
    const nextRsvp = value === "reset" ? null : value;
    save("rsvp", nextRsvp || "");
    if (nextRsvp === "yes" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFolding(true);
      return;
    }
    setTurningIn(false);
    setRsvp(nextRsvp);
    window.scrollTo(0, 0);
  };

  const resetPreview = () => {
    setAnimating(false);
    setCardReady(false);
    setFolding(false);
    setTurningIn(false);
    setRsvp(null);
    setOpened(false);
    save("rsvp", "");
    save("opened", "0");
  };

  let content;
  if (!unlocked) {
    const unlock = unlockTime();
    content = (
      <>
        <div className="cap script large-cap">Our story continues...</div>
        <Envelope opened={false} clickable={false} />
        <p className="cap">
          Your invitation unlocks on
          <br />
          <b>
            {unlock.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at{" "}
            {unlock.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </b>
        </p>
        <p className="cap script countdown">{countdown(unlock - now)}</p>
      </>
    );
  } else if (!opened) {
    content = (
      <>
        <div className="cap script large-cap"><span className="name-sparkle" aria-hidden="true">✦</span> Specially Curated For You <span className="name-sparkle" aria-hidden="true">✦</span></div>
        <Envelope opened={animating} clickable={!animating} onOpen={openEnvelope} onAnimationComplete={() => setCardReady(true)} cardReady={cardReady} onCardOpen={finishOpening} />
        <p className="cap" aria-live="polite">
          {cardReady ? "Tap the card to open your invitation" : animating ? "Your invitation is on its way" : "Tap the seal to open"}
        </p>
      </>
    );
  } else if (rsvp === "yes") {
    const stops = CONFIG.stops.map((stop) => ({ ...stop, date: stopTime(stop) }));
    let nextLockedStop = false;
    content = (
      <Paper key="itinerary" turningIn={turningIn}>
        <h1 className="invitation-heading">A Delightful Day, Created For</h1>
        <NameLine />
        <p className="soft">{CONFIG.mode === "all" ? "Here is the plan for our day." : "Each stop unlocks when it’s time to head out. No peeking."}</p>
        <div className="rule" />
        <div className="itinerary">
          {stops.map((stop) => {
            const isOpen = CONFIG.mode === "all" || now >= stop.date;
            if (isOpen) {
              return (
                <div className="stop" key={stop.time}>
                  <div className="time">{formatTime(stop.time)}</div>
                  <span className="dot" />
                  <div className="stop-content">
                    <h3>{stop.title} <span aria-hidden="true">{stop.emoji}</span></h3>
                    <p className="stop-place">
                      <span aria-hidden="true">📍</span> {stop.place}
                      {stop.map && (
                        <>
                          {" · "}
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.map)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Map ↗
                          </a>
                        </>
                      )}
                    </p>
                    <p className="stop-transport">
                      <span aria-hidden="true">🚗</span> {stop.transport}
                    </p>
                    <p className="stop-note">{stop.note}</p>
                  </div>
                </div>
              );
            }

            const isNext = !nextLockedStop;
            nextLockedStop = true;
            return (
              <div className={`stop locked${isNext ? " next" : ""}`} key={stop.time}>
                <div className="time">{formatTime(stop.time)}</div>
                <span className="dot" />
                <div className="stop-content">
                  <h3>A surprise awaits</h3>
                  <p>
                    {isNext ? (
                      <>
                        Unlocks in <span>{countdown(stop.date - now)}</span>
                      </>
                    ) : (
                      <>Revealed at {formatTime(stop.time)}</>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="rule" />
        <p className="script closing">Delighted to see you there! ;)</p>
      </Paper>
    );
  } else if (opened && rsvp === "no") {
    content = (
      <Paper key="declined">
        <NameLine />
        <h1 className="script">Nice try!</h1>
        <p className="soft">Sorry, that’s too bad :( there's only one right answer. Try again asap.</p>
        <button className="button alt change-answer" onClick={() => answer("reset")}>
          Change My Answer
        </button>
      </Paper>
    );
  } else {
    const { weekday, date } = formatInvitationDate();
    content = (
      <Paper key="invitation" folding={folding} onFoldComplete={finishFold}>
        <p className="soft intro">You are cordially invited to celebrate</p>
        <h1 className="invitation-heading">{CONFIG.years.charAt(0).toUpperCase() + CONFIG.years.slice(1)} Years Of</h1>
        <NameLine />
        <div className="rule" />
        <p>
          <b>{weekday}<br />{date}<br />{formatInvitationTime(CONFIG.stops[0].time)}</b>
        </p>
        <p className="soft small">
          <span className="gold-heart" aria-hidden="true">♥</span> A full day together, with the beautifulest cutiest patootie LAWYER ever <span className="gold-heart" aria-hidden="true">♥</span>
        </p>
        <p className="soft">
          Can't wait to celebrate and start our 2nd year around the sun of a lifetime more with you!!!! :)<br />
          <span className="small">(if you potentially accept my invitation heh)</span>
        </p>
        <p className="small">
          <b>Dress code:</b> Anniversary Attire. Please dress nice!!!
        </p>
        <div className="rule" />
        <p className="soft small kind-reply">Kindly reply</p>
        <textarea
          aria-label="A note for your host"
          placeholder="A note for me (optional)"
          value={note}
          disabled={folding}
          onChange={(event) => setNote(event.target.value)}
        />
        <button className="button accept" disabled={folding} onClick={() => answer("yes")}>
          <span className="accept-glitter" aria-hidden="true">
            {Array.from({ length: 10 }, (_, index) => <span key={index} />)}
          </span>
          <span className="accept-label">Joyfully Accept <span aria-hidden="true">😀</span></span>
        </button>
        <button className="button alt decline" disabled={folding} onClick={() => answer("no")}>
          Regretfully Decline <span aria-hidden="true">☹</span>
        </button>
      </Paper>
    );
  }

  return (
    <>
      <main id="app" className={!unlocked || !opened ? "envelope-screen" : undefined}>
        {!unlocked || !opened ? <div className="envelope-content">{content}</div> : content}
      </main>
      {CONFIG.showPreviewBar && (
        <aside className="preview-bar">
          <label>
            <input type="checkbox" checked={previewOn} onChange={(event) => {
              setAnimating(false);
              setCardReady(false);
              if (folding) finishFold();
              setPreviewOn(event.target.checked);
            }} />
            Preview mode: bypass the date lock
          </label>
          {previewOn && CONFIG.mode !== "all" && (
            <span className="preview-range">
              <input
                type="range"
                min="6"
                max="23.5"
                step="0.5"
                value={previewHour}
                aria-label="Preview time of day"
                onChange={(event) => setPreviewHour(Number(event.target.value))}
              />
              <b>
                {Math.floor(previewHour) % 12 || 12}:{pad((previewHour % 1) * 60)}
                {previewHour < 12 ? " AM" : " PM"}
              </b>
            </span>
          )}
          {previewOn && (
            <button onClick={resetPreview}>
              {opened || rsvp ? "Reset Preview" : "Reset My RSVP"}
            </button>
          )}
        </aside>
      )}
    </>
  );
}

export default App;
