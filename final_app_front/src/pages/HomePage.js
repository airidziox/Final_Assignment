import React, {useEffect} from 'react';
import useStore from "../store/main";
import Post from "../components/Post";
import {useNavigate} from "react-router-dom";
import http from "../plugins/https";

const HomePage = () => {

    const {posts, loggedUser, updatePosts} = useStore((state) => state);
    const navigate = useNavigate()

    useEffect(() => {
        if (!loggedUser) {
            navigate("/login")
        }
    }, []);


    useEffect(() => {
        http.getToken("http://localhost:2001/allPosts")
            .then(res => {
                updatePosts(res)
            })
    }, [posts]);

    return (
        <div className="container">
            <h1>Posts</h1>
            {posts ?
                <div className="d-flex flex-wrap gap-3">
                    {posts.map((x, i) =>
                        <Post key={i} post={x}/>
                    )}
                </div>
                :
                <div>No posts yet.</div>
            }
        </div>
    );
};

export default HomePage;