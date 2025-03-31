import React, {useRef} from 'react';
import useStore from '../store/main';
import {useNavigate} from "react-router-dom";
import http from "../plugins/https";
import {socket} from "../socket";

const LoginPage = () => {

    let navigate = useNavigate();

    const usernameRef = useRef();
    const passwordRef = useRef();

    const {error, updateError, updateLoggedUser, updateFavoritePosts} = useStore((state) => state);

    async function login() {
        const myUser = {
            username: usernameRef.current.value,
            password: passwordRef.current.value
        }

        const res = await http.postToken("http://localhost:2001/login", myUser)

        if (res.error) {
            console.log(res)
            return updateError(res.message)
        } else {
            updateError(null);
            navigate("/profile");
            localStorage.setItem("token", res.token)
            updateLoggedUser({
                username: res.user.username,
                image: res.user.image,
                id: res.user._id,
            })
            updateFavoritePosts(res.favorites)
            console.log(res)

            if (!socket.connected) {
                socket.connect();
            }
            socket.emit("login", usernameRef.current.value)
        }
    }

    return (
        <div className="d-flex justify-content-center">
            <div className="d-flex flex-column align-items-center justify-content-center gap-4 fs-4 rounded-4 p-5 bg-white shadow">
                <h1>Login</h1>
                <input className="p-2 rounded-2" type="text" ref={usernameRef} placeholder="Username"/>
                <input className="p-2 rounded-2" type="password" ref={passwordRef} placeholder="Password"/>
                {error && <h4 className="btn bg-danger text-white fs-5 fw-bold">{error}</h4>}
                <button className="btn btn-primary fs-4 fw-bold w-100" onClick={login}>Login</button>
            </div>

        </div>
    );
};

export default LoginPage;