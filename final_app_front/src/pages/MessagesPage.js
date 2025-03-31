import React, {useEffect} from 'react';
import {useNavigate} from "react-router-dom";
import useStore from "../store/main";
import {socket} from "../socket";
import http from "../plugins/https";
import Message from "../components/Message";

const MessagesPage = () => {

    const {loggedUser, updateMessages, messages} = useStore((state) => state);
    const navigate = useNavigate()

    useEffect(() => {
        if (!loggedUser) {
            return navigate("/login")
        }
    }, []);

    useEffect(() => {
        http.getToken(`http://localhost:2001/messages/${loggedUser?.id}`)
            .then(res => {
                updateMessages(res);
            });
    }, [messages]);


    useEffect(() => {
        socket.on("messageReceived", (data) => {
            updateMessages(data.messages)
            console.log(data)
        })
    }, [messages]);

    return (
        <div className="container d-flex flex-column gap-3">
            <h1 className="text-center">Messages</h1>
            {messages && messages.length > 0 ?
                <div className="d-flex flex-column align-items-center gap-3 fs-4">
                    {messages.map((x, i) =>
                        <Message message={x} key={i}/>
                    )}
                </div>
                :
                <div className="text-center">No messages yet.</div>
            }
        </div>
    );
};

export default MessagesPage;