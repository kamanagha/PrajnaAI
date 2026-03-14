import { Link } from "react-router-dom";

function Dashboard(){

return(

<div className="container mt-5">

<h2>Student Dashboard</h2>

<div className="row mt-4">

<div className="col-md-4">

<div className="card dash-card">

<h4>Upload Materials</h4>

<p>Import study notes into PrajnaAI</p>

<Link to="/upload" className="btn btn-primary">
Upload
</Link>

</div>

</div>

<div className="col-md-4">

<div className="card dash-card">

<h4>View Materials</h4>

<p>Access structured study content</p>

<Link to="/materials" className="btn btn-success">
View
</Link>

</div>

</div>

</div>

</div>

)

}

export default Dashboard