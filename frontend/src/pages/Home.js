import { Link } from "react-router-dom";

function Home() {

  return (

    <div className="home-container">

      <div className="container text-center">

        <h1 className="title">
          Welcome to PrajnaAI
        </h1>

        <p className="subtitle">

          A simple platform for students to import, export and manage study materials.

        </p>

        <div className="mt-4">

          <Link className="btn btn-primary me-3" to="/register">
            Get Started
          </Link>

          <Link className="btn btn-outline-light" to="/materials">
            View Materials
          </Link>

        </div>

      </div>

    </div>

  );
}

export default Home;