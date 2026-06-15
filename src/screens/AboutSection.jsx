import CountUp from "../components/CountUp.jsx";
import LogoMark from "../components/LogoMark.jsx";
import PageLabel from "../components/PageLabel.jsx";
import ScrollCue from "../components/ScrollCue.jsx";
import { aboutContent } from "../data/brandWallContent.js";

export default function AboutSection() {
  return (
    <section id="about" className="panel pdf-panel about-page" data-section>
      <PageLabel>{aboutContent.pageLabel}</PageLabel>
      <div className="interface-frame about-frame">
        <div className="center-logo">
          <LogoMark />
        </div>
        <div className="about-intro">
          <p className="eyebrow">{aboutContent.subtitle}</p>
          <h2>{aboutContent.title}</h2>
        </div>
        <div className="principles-grid">
          {aboutContent.principles.map((principle) => (
            <article className="principle-card" key={principle.number}>
              <span>{principle.number}</span>
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="interface-frame about-frame numbers-frame">
        <PageLabel>{aboutContent.scrollLabel}</PageLabel>
        <div className="copy-block">
          <p className="eyebrow">{aboutContent.scrollEyebrow}</p>
          <h2>{aboutContent.scrollTitle}</h2>
          <blockquote>{aboutContent.scrollQuote}</blockquote>
        </div>
        <div className="numbers-grid" aria-label="Raheja Group legacy numbers">
          {aboutContent.stats.map((stat) => (
            <div className="number-card" key={stat.label}>
              <strong><CountUp value={stat.value} /></strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
      <ScrollCue />
    </section>
  );
}
