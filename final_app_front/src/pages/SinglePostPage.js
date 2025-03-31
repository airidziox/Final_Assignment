import React, {useEffect, useRef, useState} from 'react';
import {Link, useNavigate, useParams} from "react-router-dom";
import useStore from "../store/main";
import http from "../plugins/https";

const SinglePostPage = () => {

    const navigate = useNavigate()
    const commentRef = useRef();
    const {loggedUser} = useStore((state) => state);
    const [singleUserPost, setSingleUserPost] = useState(null)

    const params = useParams()

    useEffect(() => {
        if (!loggedUser) {
            navigate("/login")
        }
    }, []);

    useEffect(() => {
        http.getToken(`http://localhost:2001/singlePost/${params.id}`)
            .then(res => {
                setSingleUserPost(res)
            })
    }, [singleUserPost]);

    async function comment() {
        const comment = {
            postId: params.id,
            commenter: loggedUser.username,
            commenterId: loggedUser.id,
            text: commentRef.current.value
        }

        const res = await http.postToken("http://localhost:2001/comment", comment)

        if (res.error) {
            return alert(res.message)
        } else {
            console.log(res)
            setSingleUserPost(res)
        }
    }

    async function deleteComment(commentId) {
        const info = {
            commentId: commentId,
            postId: params.id
        }

        const res = await http.postToken(`http://localhost:2001/deleteComment`, info)

        setSingleUserPost(res)
    }

    return (
        <div className="container d-flex flex-column border rounded-3 p-4 bg-white shadow gap-4">
            <div className="d-flex gap-5">
                <img className="singleImage border border-4 border-secondary-subtle rounded-4 shadow" src={singleUserPost?.image} alt=""/>
                <div className="d-flex flex-column gap-3">
                    <h1 className="fw-bold">{singleUserPost?.title}</h1>
                    <div>
                        <span className="badge rounded-pill text-bg-primary">{singleUserPost?.time}</span>
                    </div>
                    <div className="border p-2">
                        <h4>{singleUserPost?.description}</h4>
                    </div>
                    <Link to={`/user/${singleUserPost?.authorId}`}>
                        <div className="username p-0 fs-6">{singleUserPost?.username}</div>
                    </Link>
                </div>
            </div>

            <div className="d-flex border-top py-3 flex-column gap-3 w-100">
                <h2 className="text-center">Comments</h2>
                <div className="d-flex flex-column gap-2 fs-5">
                    {singleUserPost?.comments.map((x, i) =>
                        <div key={i}>
                            <div className="card bg-primary text-white d-inline-block p-2">
                                <b>{x.commenter}</b>: {x.text}
                                {x.commenter === loggedUser?.username &&
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red"
                                         className="delete ms-2 bi bi-x-circle-fill" viewBox="0 0 16 16"
                                    onClick={() => deleteComment(x.commentId)}>
                                        <path
                                            d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"/>
                                    </svg>
                                }
                            </div>
                        </div>
                    )}
                </div>
                <div className="d-flex w-100 gap-3">
                    <textarea className="p-2 rounded-3 fs-4 w-100" ref={commentRef} placeholder="Your comment..."/>
                    <button className="btn btn-primary fs-4 fw-bold px-5" onClick={comment}>Comment</button>
                </div>
            </div>
        </div>
    );
};

export default SinglePostPage;