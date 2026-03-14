import { useState } from "react";
import axios from "axios";

function Register() {

  const [name,setName] = useState("")
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")

  const register = async () => {

    await axios.post("http://127.0.0.1:8000/api/users/register/",{
      name,email,password
    })

    alert("Registration successful")

  }

  return (

    <div className="container form-box">

      <h2>Register</h2>

      <input
        className="form-control mt-3"
        placeholder="Name"
        onChange={(e)=>setName(e.target.value)}
      />

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
        className="btn btn-success mt-3"
        onClick={register}
      >
        Register
      </button>

    </div>

  );

}

export default Register;