import PageLabel from "../components/PageLabel.jsx";
import { projects } from "../data/brandWallContent.js";
import { useLocalUrls } from "../hooks/useLocalUrl.js";

export default function ProjectsSection({ onNavigate }) {
  const localMap = useLocalUrls(projects.map((p) => p.image).filter(Boolean));
  return (
    <section id="projects" className="panel projects-panel" data-section>
      <PageLabel>Page 3: Explore Projects</PageLabel>
      <div className="projects-frame">
        <div className="projects-heading">
          <p className="eyebrow">Our Portfolio</p>
          <h2>
            Signature <span>Properties</span>
          </h2>
          <p>Each project is a testament to our commitment to luxury, quality, and innovation</p>
        </div>
        <div className="project-grid">
          {projects.map((project, index) => (
            <article
              className="project-card"
              key={project.title}
              role="button"
              tabIndex={0}
              onClick={() => onNavigate(project.page)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onNavigate(project.page);
                }
              }}
            >
              <div
                className={`project-photo project-photo--${index + 1}`}
                style={project.image ? { "--bg-image": `url("${localMap[project.image] || project.image}")` } : undefined}
              >
                <span className="project-pill">{project.category}</span>
                <span className={`project-status ${project.status === "Ongoing" ? "is-ongoing" : ""}`}>{project.status}</span>
                <span className="project-card-go" aria-hidden="true">→</span>
              </div>
              <div className="project-card-body">
                <h3>{project.title}</h3>
                <p className="project-location">{project.location}</p>
                <p className="project-rera">{project.rera}</p>
              </div>
            </article>
          ))}
        </div>
        <button className="view-all-action" type="button" onClick={() => onNavigate("allProjects")}>
          View All Projects
        </button>
      </div>
    </section>
  );
}
