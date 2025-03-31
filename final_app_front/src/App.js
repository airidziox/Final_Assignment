import './App.css';
import React, {} from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";

import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import HomePage from "./pages/HomePage";
import FavoritePostsPage from "./pages/FavoritePostsPage";
import CreatePostPage from "./pages/CreatePostPage";
import MessagesPage from "./pages/MessagesPage";
import SingleUserPage from "./pages/SingleUserPage";
import SinglePostPage from "./pages/SinglePostPage";

import Toolbar from "./components/Toolbar";
import Footer from "./components/Footer";

function App() {

    return (
        <div className="App d-flex flex-column">

            <BrowserRouter>
                <Toolbar/>
                <div className="d-flex flex-column gap-5 p-3">
                    <Routes>
                        <Route path="/" element={<RegisterPage/>}/>
                        <Route path="/login" element={<LoginPage/>}/>
                        <Route path="/home" element={<HomePage/>}/>
                        <Route path="/profile" element={<ProfilePage/>}/>
                        <Route path="/createPost" element={<CreatePostPage/>}/>
                        <Route path="/singlePost/:id" element={<SinglePostPage/>}/>
                        <Route path="/user/:userId" element={<SingleUserPage/>}/>
                        <Route path="/favorites" element={<FavoritePostsPage/>}/>
                        <Route path="/messages" element={<MessagesPage/>}/>
                    </Routes>
                </div>
                {/*<Footer/>*/}
            </BrowserRouter>

        </div>
    );
}

export default App;
