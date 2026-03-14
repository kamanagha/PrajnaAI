import {useEffect,useState} from "react"
import axios from "axios"

function MaterialViewer(){

const [materials,setMaterials] = useState([])

useEffect(()=>{

axios.get("http://127.0.0.1:8000/api/materials/view/")
.then(res=>setMaterials(res.data))

},[])

return(

<div className="container mt-5">

<h2>Study Materials</h2>

{
materials.map((m)=>(

<div className="card mt-3 p-3">

<h4>{m.title}</h4>

<p>{m.subject}</p>

<pre>{m.structured_content}</pre>

</div>

))
}

</div>

)

}

export default MaterialViewer