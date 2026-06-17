import { directorContent } from "../data/brandWallContent.js";
import { useLocalUrl } from "../hooks/useLocalUrl.js";

export default function DirectorSection({ onNavigate }) {
  const d = directorContent;
  const localImg = useLocalUrl(d.image);

  return (
    <section className="director-page-v2">
      <div className="dir-bg" />
      <div className="dir-layout">
        <div className="dir-portrait">
          <div className="dir-portrait-img" style={{ backgroundImage: `url("${localImg}")` }} />
          <div className="dir-name-card">
            <div className="dir-name">{d.author}</div>
            <div className="dir-role">{d.role}</div>
          </div>
        </div>

        <div className="dir-content">
          <div className="dir-eyebrow">{d.eyebrow}</div>
          <h2 className="dir-title">
            {d.titleLead}
            <br />
            {d.titleRest}
            <em>{d.titleEm}</em>
          </h2>
          <div className="dir-quote-mark" aria-hidden="true">“</div>
          <blockquote className="dir-quote">{d.quote}</blockquote>
          <div className="dir-body">
            {d.body.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
