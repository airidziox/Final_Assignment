import React, {useEffect, useRef} from 'react';
import useStore from "../store/main";
import http from "../plugins/https";
import {useNavigate} from "react-router-dom";
import {socket} from "../socket";


const ProfilePage = () => {

    const imageRef = useRef();
    const usernameRef = useRef()
    const passwordRef = useRef()
    const confirmPasswordRef = useRef()

    let {loggedUser, updateLoggedUser, error, updateOnlineUsers} = useStore((state) => state);

    const navigate = useNavigate()

    useEffect(() => {
        if (!loggedUser) {
            return navigate("/login")
        }
    }, []);

    useEffect(() => {
        socket.on("onlineUsers", (data) => {
            updateOnlineUsers(data)
        })
        socket.emit('requestOnlineUsers');
    },[])

    async function changeImage() {
        const info = {
            image: imageRef.current.value,
            userId: loggedUser.id
        }

        const res = await http.postToken("http://localhost:2001/changeImage", info)

        if (res.error) {
            return console.log(res.message)
        } else {
            updateLoggedUser({...loggedUser, image: res.updatedUser.image})
            console.log(res)
        }
    }

    async function changeUsername() {
        const userInfo = {
            newUsername: usernameRef.current.value,
            userId: loggedUser.id
        }

        const res = await http.postToken("http://localhost:2001/changeUsername", userInfo)

        if (res.error) {
            return alert(res.message)
        } else {
            console.log(res)
            updateLoggedUser({...loggedUser, username: res.updatedUser.username})
        }
    }

    async function changePassword() {
        if (passwordRef.current.value !== confirmPasswordRef.current.value) {
            return alert("Passwords do not match")
        }

        const userInfo = {
            newPassword: passwordRef.current.value,
            userId: loggedUser.id
        }

        const res = await http.postToken("http://localhost:2001/changePassword", userInfo)

        if (res.error) {
            return alert(res.message)
        } else {
            alert(res.message)
        }
    }

    return (
            <div className="container d-flex border justify-content-evenly rounded-3 align-items-center p-4 fs-4 bg-white shadow gap-5">
                <div className="d-flex align-items-center flex-column gap-3">
                    <img className="border border-4 border-secondary border-opacity-50 rounded-4 shadow"
                         src={loggedUser && loggedUser.image} alt=""/>
                    <h2>{loggedUser && loggedUser.username}</h2>
                    <div className="d-flex align-items-center flex-column gap-3 card p-3">
                        <h3>Change your image</h3>
                        <input className="p-2 rounded-2" type="text" ref={imageRef} placeholder="Image URL"/>
                        <button className="btn btn-primary fs-4 fw-bold w-100" onClick={changeImage}>Change Image
                        </button>
                    </div>
                </div>
                <div className="d-flex align-items-center flex-column gap-3 w-50">
                    <div className="d-flex align-items-center flex-column gap-3 w-100 card p-3">
                        <h3>Change your username</h3>
                        <input className="p-2 rounded-2 w-100" type="text" ref={usernameRef}
                               placeholder="New username"/>
                        {error && <h4 style={{color: "red"}}>{error}</h4>}
                        <button className="btn btn-primary fs-4 fw-bold w-100" onClick={changeUsername}>Change Username</button>
                    </div>
                    <div className="d-flex align-items-center flex-column gap-3 w-100 card p-3">
                        <h3>Change your password</h3>
                        <input className="p-2 rounded-2 w-100" type="password" ref={passwordRef}
                               placeholder="New password"/>
                        <input className="p-2 rounded-2 w-100" type="password" ref={confirmPasswordRef}
                               placeholder="Confirm new password"/>
                        <button className="btn btn-primary fs-4 fw-bold w-100" onClick={changePassword}>Change Password</button>
                    </div>
                </div>
            </div>
    );
};

export default ProfilePage;