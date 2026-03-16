import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-container d-flex align-items-center justify-content-center text-center">
      <div className="container">

        <h1 className="display-4 fw-bold mb-3">
          📚 Welcome to <span className="text-primary">PrajnaAI</span>
        </h1>

        <p className="lead mb-4">
          A smart platform where students can <b>import, export and manage</b> study materials easily.
        </p>

        <div className="mb-5">
          <Link className="btn btn-primary btn-lg me-3" to="/register">
            🚀 Get Started
          </Link>

          <Link className="btn btn-outline-light btn-lg" to="/materials">
            📂 View Materials
          </Link>
        </div>

        {/* Feature Section */}

        <div className="row mt-4">

          <div className="col-md-4 mb-3">
            <div className="card p-3 shadow-sm h-100">
              <h4>📤 Import Materials</h4>
              <p>Upload notes, PDFs and study resources in one place.</p>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card p-3 shadow-sm h-100">
              <h4>📥 Export Materials</h4>
              <p>Download and share useful study content anytime.</p>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card p-3 shadow-sm h-100">
              <h4>🧠 Smart Learning</h4>
              <p>Organize your learning resources efficiently.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Home;