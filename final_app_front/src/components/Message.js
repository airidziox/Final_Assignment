import React, {useRef} from 'react';
import http from "../plugins/https";
import useStore from "../store/main";

const Message = ({message}) => {

    const {loggedUser, updateMessages} = useStore((state) => state);
    const messageRef = useRef();

    async function sendMessage(sender) {
        const messageInfo = {
            sender: loggedUser.username,
            senderId: loggedUser.id,
            receiver: sender,
            message: messageRef.current.value,
            time: new Date().toLocaleString("lt-LT")
        }

        const res = await http.postToken("http://localhost:2001/sendMessage", messageInfo)

        alert(res.message)
    }

    async function deleteMessage(messageId) {
        const info = {
            messageId: messageId,
            receiver: loggedUser.username,
        }

        const res = await http.postToken("http://localhost:2001/deleteMessage", info)

        if (res.error) {
            alert(res.message)
        } else {
            updateMessages(res)
            console.log(res)
        }
    }

    return (
        <div className="d-flex flex-column card rounded-3 w-75 gap-1 bg-white shadow">
            <div className="d-flex p-2 card-img-top bg-primary text-white border-bottom justify-content-between">
                <div className="d-flex align-items-center gap-2">
                    <img className="msgImg rounded-circle" src={message.senderPhoto} alt=""/>
                    <b>{message.sender}:</b>
                </div>
                <div className="d-flex align-items-center">
                    <span className="badge rounded-pill text-bg-light">{message.time}</span>
                </div>
            </div>
            <div className="d-flex p-2 justify-content-between">
                <div>{message.message}</div>
                <div>
                    <button className="btn btn-outline-danger fw-bold" onClick={() => deleteMessage(message.id)}>Delete
                    </button>
                </div>
            </div>
            <div className="d-flex p-2 gap-3 w-100">
                <textarea className="p-2 rounded-3 w-100" ref={messageRef} placeholder="Your message..."/>
                <button className="btn btn-primary px-5 fs-4 fw-bold" onClick={() => sendMessage(message.sender)}>Reply
                </button>
            </div>
        </div>
    );
};

export default Message;