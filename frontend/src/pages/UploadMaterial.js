import {useState} from "react"
import axios from "axios"

function UploadMaterial(){

const [file,setFile]=useState()
const [title,setTitle]=useState("")
const [subject,setSubject]=useState("")

const upload = async ()=>{

let form = new FormData()

form.append("file",file)
form.append("title",title)
form.append("subject",subject)

await axios.post(
"http://127.0.0.1:8000/api/materials/upload/",
form
)

alert("Material Uploaded")

}

return(

<div className="container form-box">

<h2>Upload Study Material</h2>

<input
className="form-control mt-3"
placeholder="Title"
onChange={(e)=>setTitle(e.target.value)}
/>

<input
className="form-control mt-3"
placeholder="Subject"
onChange={(e)=>setSubject(e.target.value)}
/>

<input
type="file"
className="form-control mt-3"
onChange={(e)=>setFile(e.target.files[0])}
/>

<button
className="btn btn-warning mt-3"
onClick={upload}
>
Upload
</button>

</div>

)

}

export default UploadMaterial