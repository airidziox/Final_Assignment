import React, {useEffect, useRef, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import http from "../plugins/https";
import Post from "../components/Post";
import useStore from "../store/main";
import {socket} from "../socket";

const SingleUserPage = () => {

    const params = useParams()

    const messageRef = useRef();
    const [singleUser, setSingleUser] = useState(null)
    const [userPosts, setUserPosts] = useState([])

    const navigate = useNavigate()
    const {loggedUser, onlineUsers} = useStore((state) => state);

    useEffect(() => {
        if (!loggedUser) {
            return navigate("/login")
        }
    }, []);

    useEffect(() => {
        http.getToken(`http://localhost:2001/singleUser/${params.userId}`)
            .then(res => {
                setSingleUser(res.userExists)
                setUserPosts(res.userPosts)
            })
    }, []);

    console.log(onlineUsers)

    async function sendMessage() {
        const messageInfo = {
            sender: loggedUser.username,
            senderId: loggedUser.id,
            receiver: singleUser.username,
            message: messageRef.current.value,
            time: new Date().toLocaleString("lt-LT")
        }

        const res = await http.postToken("http://localhost:2001/sendMessage", messageInfo)

        alert(res.message)
    }


    return (
        <div className="container d-flex flex-column gap-4 border rounded-3 p-4 bg-white shadow">
            <div className="d-flex justify-content-evenly align-items-center gap-5 fs-4">
                <div className="d-flex align-items-center flex-column gap-3">
                    <img className="border border-4 border-secondary border-opacity-50 rounded-4 shadow"
                         src={singleUser?.image} alt=""/>
                    <div className="d-flex align-items-center flex-column gap-2">
                            <div>
                                {onlineUsers?.some(user => user.username === singleUser?.username) ?
                                    <div className="badge rounded-pill text-bg-success">Online</div>
                                    :
                                    <div className="badge rounded-pill text-bg-danger">Offline</div>
                                }
                            </div>
                        <h2>{singleUser?.username}</h2>
                    </div>
                </div>
                <div className="d-flex align-items-center flex-column w-75 card">
                    {onlineUsers?.some(user => user.username === singleUser?.username) ?
                        <h3 className="border-bottom card-img-top bg-primary text-white w-100 p-2">Send
                            message to <b>{singleUser?.username}</b></h3>
                        :
                        <h3 className="border-bottom card-img-top bg-secondary text-white w-100 p-2">Send
                            message to <b>{singleUser?.username}</b></h3>
                    }
                    <div className="d-flex gap-3 w-100 p-2">
                        <textarea className="p-2 rounded-2 w-100" ref={messageRef} placeholder="Your message..."/>
                        {onlineUsers?.some(user => user.username === singleUser?.username) ?
                            <button className="btn btn-primary px-5 fs-4 fw-bold" onClick={sendMessage}>Send</button>
                            :
                            <button className="btn btn-secondary px-5 fs-4 fw-bold" onClick={sendMessage}>Send</button>
                        }
                    </div>
                </div>
            </div>

            <div className="d-flex border-top py-3 align-items-center flex-column gap-3 w-100">
                <h2>{singleUser?.username}'s posts</h2>
                <div className="d-flex flex-wrap gap-3">
                    {userPosts.map((x, i) =>
                        <Post key={i} post={x}/>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SingleUserPage;