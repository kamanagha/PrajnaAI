import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login(){

const navigate = useNavigate()

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")

const login = async ()=>{

const res = await axios.post(
"http://127.0.0.1:8000/api/users/login/",
{email,password}
)

if(res.data.user_id){

localStorage.setItem("user",res.data.user_id)

navigate("/dashboard")

}

else{

alert("Invalid credentials")

}

}

return(

<div className="container form-box">

<h2>Login</h2>

<input
className="form-control mt-3"
placeholder="Email"
onChange={(e)=>setEmail(e.target.value)}
/>

<input
className="form-control mt-3"
type="password"
placeholder="Password"
onChange={(e)=>setPassword(e.target.value)}
/>

<button
className="btn btn-primary mt-3"
onClick={login}
>
Login
</button>

</div>

)

}

export default Login