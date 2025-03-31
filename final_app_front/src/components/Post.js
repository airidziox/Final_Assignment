import React, {useEffect, useRef, useState} from 'react';
import http from "../plugins/https";
import useStore from "../store/main";
import {Link} from "react-router-dom";

const Post = ({post}) => {

    const titleRef = useRef();
    const postImageRef = useRef();
    const descriptionRef = useRef();

    const {updatePosts, loggedUser, favoritePosts, updateFavoritePosts} = useStore((state) => state);
    const [trigger, setTrigger] = useState(false)

    async function deletePost() {
        const res = await http.postToken(`http://localhost:2001/delete/${post._id}`)

        if (res.error) {
            console.log(res)
        } else {
            updatePosts(res.posts)
            console.log(res)
        }
    }

    async function editPost() {

        const updatedPost = {
            title: titleRef.current.value,
            image: postImageRef.current.value,
            description: descriptionRef.current.value
        }

        const res = await http.postToken(`http://localhost:2001/edit/${post._id}`, updatedPost)

        if (res.error) {
            return alert(res.message)
        } else {
            setTrigger(!trigger)
            updatePosts(res.posts)
            console.log(res)
        }
    }

    async function addToFavorites() {
        const userId = loggedUser.id;

        const res = await http.postToken(`http://localhost:2001/addFavorite/${post._id}`, {userId})

        if (res.error) {
            return alert(res.message)
        } else {
            updateFavoritePosts(res)
            console.log(res)
        }
    }

    async function removeFromFavorites() {
        const userId = loggedUser.id;

        const res = await http.postToken(`http://localhost:2001/removeFavorite/${post.postId || post._id}`, {userId})

        if (res.error) {
            return alert(res.message)
        } else {
            updateFavoritePosts(res.favoriteUserPosts)
            console.log(res)
        }
    }

    useEffect(() => {
        if (trigger) {
            titleRef.current.value = post.title
            postImageRef.current.value = post.image
            descriptionRef.current.value = post.description
        }
    }, [trigger]);

    return (
        <div className="post card h-100 gap-1">
            <Link to={`/singlePost/${post.postId || post._id }`}>
                <div className="imgDiv text-center border-bottom">
                    <img className="postImg card-img-top" src={post.image} alt=""/>
                </div>
            </Link>
            <div className="d-flex flex-column gap-2 p-2">
                <Link className="text-black text-decoration-none" to={`/singlePost/${post.postId || post._id}`}>
                    <h4 className="title m-0"><b>{post.title}</b></h4>
                </Link>
                <div>
                    <span className="badge rounded-pill text-bg-primary">{post.time}</span>
                </div>
                <Link to={`/user/${post.authorId}`}>
                    <div className="username p-0">{post.username}</div>
                </Link>
                <h5>{post.description}</h5>
                {loggedUser?.username !== post.username && !favoritePosts.some(favPost => favPost.postId === post._id || post.postId) ?
                    <button className="btn btn-outline-dark fw-bold" onClick={addToFavorites}>Add to Favorites ⭐</button>
                    : loggedUser?.username !== post.username && favoritePosts.some(favPost => favPost.postId === post._id || post.postId) ?
                        <button className="btn btn-danger fw-bold" onClick={removeFromFavorites}>Remove from Favorites ⭐</button>
                        : null
                }
                {loggedUser?.username === post.username &&
                    <div className="d-flex flex-column gap-2">
                        <button className="btn btn-warning fw-bold" onClick={deletePost}>Delete</button>
                        {trigger &&
                            <div className="d-flex flex-column gap-2 mt-3">
                                <input className="p-2 rounded-3" type="text" ref={titleRef} placeholder="Title"/>
                                <input className="p-2 rounded-3" type="text" ref={postImageRef} placeholder="Image"/>
                                <input className="p-2 rounded-3" type="text" ref={descriptionRef}
                                       placeholder="Description"/>
                                <button className="btn btn-info fw-bold" onClick={editPost}>Update Post</button>
                            </div>
                        }
                        {!trigger &&
                            <button className="btn btn-info w-100 fw-bold"
                                    onClick={() => setTrigger(!trigger)}>Edit</button>}
                    </div>
                }
            </div>
        </div>
    );
};

export default Post;