import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import MediaModal from "./components/MediaModal.jsx";
import NavArrows from "./components/NavArrows.jsx";
import PageIndicator from "./components/PageIndicator.jsx";
import AboutSection from "./screens/AboutSection.jsx";
import AllProjectsSection from "./screens/AllProjectsSection.jsx";
import DirectorSection from "./screens/DirectorSection.jsx";
import HeroSection from "./screens/HeroSection.jsx";
import LuxurySection from "./screens/LuxurySection.jsx";
import ProjectDetailSection from "./screens/ProjectDetailSection.jsx";
import ThanksSection from "./screens/ThanksSection.jsx";

// The guided step flow. Luxury → Avana → Thanks.
const pageOrder = ["standby", "about", "director", "projects", "luxury", "avana", "thanks"];

const pageTitles = {
  standby: "Home",
  about: "About Raheja Group",
  director: "Director's Desk",
  projects: "Our Projects",
  luxury: "Raheja Luxury",
  avana: "Raheja Avana",
  thanks: "Thank You",
};

function FullscreenButton() {
  const [isFs, setIsFs] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  return (
    <button
      className="global-fullscreen-btn"
      type="button"
      aria-label={isFs ? "Exit fullscreen" : "Enter fullscreen"}
      onClick={toggle}
    >
      {isFs ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3v3a2 2 0 01-2 2H3M21 8h-3a2 2 0 01-2-2V3M3 16h3a2 2 0 012 2v3M16 21v-3a2 2 0 012-2h3" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3H5a2 2 0 00-2 2v3M16 3h3a2 2 0 012 2v3M21 16v3a2 2 0 01-2 2h-3M3 16v3a2 2 0 002 2h3" />
        </svg>
      )}
    </button>
  );
}

export default function App() {
  const [activeMedia, setActiveMedia] = useState(null);
  const [activePage, setActivePage] = useState("standby");
  const [history, setHistory] = useState([]);
  const [overlayClass, setOverlayClass] = useState("");
  const [threadOn, setThreadOn] = useState(false);
  const [atBottom, setAtBottom] = useState(false);

  // Track whether the current page is scrolled to the bottom (used to gate the
  // About page's Next arrow until the visitor has read through).
  useEffect(() => {
    const check = () => {
      const doc = document.documentElement;
      setAtBottom(window.innerHeight + window.scrollY >= doc.scrollHeight - 48);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [activePage]);

  const openMedia = (title) => setActiveMedia(title);
  const closeMedia = () => setActiveMedia(null);

  // Cinematic page change: expand the obsidian overlay over the old page,
  // swap behind it, flash the gold thread, then collapse to reveal the new one.
  const runTransition = (page) => {
    setOverlayClass("out");
    window.setTimeout(() => {
      setActivePage(page);
      window.scrollTo({ top: 0 });
      setThreadOn(true);
      setOverlayClass("in");
      window.setTimeout(() => setThreadOn(false), 900);
      window.setTimeout(() => setOverlayClass(""), 720);
    }, 520);
  };

  const navigateTo = (page) => {
    if (page === activePage) return;
    setHistory((stack) => [...stack, activePage]);
    runTransition(page);
  };

  const goBack = () => {
    const target = history.length ? history[history.length - 1] : "standby";
    setHistory((stack) => stack.slice(0, -1));
    if (target === activePage) return;
    runTransition(target);
  };

  const currentIndex = pageOrder.indexOf(activePage);
  const inFlow = currentIndex >= 0;
  const isLast = currentIndex === pageOrder.length - 1;

  const nextPage = inFlow ? pageOrder[currentIndex + 1] : null;

  const showPrev = inFlow ? currentIndex > 0 : true;
  // Projects (the coverflow) advances via its own "Enter Luxury" card, so hide
  // the global Next arrow there. On About, hold the Next arrow back until the
  // visitor has scrolled to the bottom.
  const showNext =
    inFlow && activePage !== "projects" && (activePage !== "about" || atBottom);
  const nextLabel = !inFlow
    ? ""
    : currentIndex === 0
      ? "Begin Journey"
      : isLast
        ? "Start Over"
        : nextPage === "thanks"
          ? ""
          : pageTitles[nextPage];

  const handlePrev = () => {
    if (!inFlow) return goBack();
    if (currentIndex > 0) navigateTo(pageOrder[currentIndex - 1]);
  };
  const handleNext = () => {
    if (!inFlow) return;
    if (isLast) navigateTo("standby");
    else navigateTo(pageOrder[currentIndex + 1]);
  };

  const pageMap = {
    standby: <HeroSection />,
    about: <AboutSection />,
    director: <DirectorSection onNavigate={navigateTo} />,
    projects: <AllProjectsSection onNavigate={navigateTo} />,
    luxury: <LuxurySection onNavigate={navigateTo} onOpenMedia={openMedia} />,
    avana: <ProjectDetailSection onOpenMedia={openMedia} onNavigate={navigateTo} />,
    thanks: <ThanksSection onNavigate={navigateTo} onBack={goBack} />,
  };

  return (
    <div className="app-shell">
      <Header
        activePage={activePage}
        onHome={() => navigateTo("standby")}
        onLuxe={() => navigateTo("luxury")}
      />

      <main className="page-stage">{pageMap[activePage]}</main>

      {/* The thanks/CTA page carries its own back + restart controls. */}
      {activePage !== "thanks" && (
        <>
          <NavArrows
            showPrev={showPrev}
            showNext={showNext}
            nextLabel={nextLabel}
            onPrev={handlePrev}
            onNext={handleNext}
          />

          <PageIndicator order={pageOrder} titles={pageTitles} activeIndex={currentIndex} />
        </>
      )}

      <FullscreenButton />

      <div className={`gold-thread${threadOn ? " animate" : ""}`} aria-hidden="true" />
      <div className={`transition-overlay ${overlayClass}`} aria-hidden="true" />

      <MediaModal title={activeMedia} onClose={closeMedia} />
    </div>
  );
}
