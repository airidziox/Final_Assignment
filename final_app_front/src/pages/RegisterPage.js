import React, {useRef} from 'react';
import useStore from '../store/main';
import {useNavigate} from "react-router-dom";
import http from "../plugins/https"


const RegisterPage = () => {

    const usernameRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();

    const navigate = useNavigate()

    const {error, updateError} = useStore((state) => state);

    async function register() {
        const myUser = {
            username: usernameRef.current.value,
            passwordOne: passwordRef.current.value,
            passwordTwo: passwordConfirmRef.current.value
        }

        const res = await http.post("http://localhost:2001/register", myUser)

        if (res.error) {
            console.log(res)
            return updateError(res.message)
        } else {
            updateError(null);
            navigate("/login")
            console.log(res)
        }
    }

    return (
        <div className="d-flex justify-content-center">
            <div className="d-flex flex-column align-items-center justify-content-center gap-4 fs-4 rounded-4 p-5 bg-white shadow">
                <h1>Register</h1>
                <input className="p-2 rounded-2" type="text" ref={usernameRef} placeholder="Username"/>
                <input className="p-2 rounded-2" type="password" ref={passwordRef} placeholder="Password"/>
                <input className="p-2 rounded-2" type="password" ref={passwordConfirmRef} placeholder="Confirm password"/>
                {error && <h4 className="btn bg-danger text-white fs-5 fw-bold">{error}</h4>}
                <button className="btn btn-primary fs-4 fw-bold shadow w-100" onClick={register}>Register</button>
            </div>
        </div>
    );
};

export default RegisterPage;