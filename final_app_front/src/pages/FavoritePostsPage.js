import React, {useEffect} from 'react';
import useStore from "../store/main";
import http from "../plugins/https";
import {useNavigate} from "react-router-dom";
import Post from "../components/Post";

const FavoritePostsPage = () => {

    const { favoritePosts, loggedUser, updateFavoritePosts } = useStore((state) => state);

    const navigate = useNavigate()

    useEffect(() => {
        if (!loggedUser) {
            navigate("/login")
        }
    }, []);

    useEffect(() => {
        http.getToken(`http://localhost:2001/favorites/${loggedUser?.id}`)
            .then(res => {
                updateFavoritePosts(res)
            })
    }, [favoritePosts]);

    return (
        <div className="container users-list d-flex flex-column gap-3">
            <h1>Your favorite posts</h1>
            {favoritePosts ?
                <div className="d-flex flex-wrap gap-3">
                    {favoritePosts && favoritePosts.map((x, i) =>
                        <Post key={i} post={x}/>
                    )}
                </div>
                :
                <div>No favorites posts yet.</div>
            }

        </div>
    );
};

export default FavoritePostsPage;