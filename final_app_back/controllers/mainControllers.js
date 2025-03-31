const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const {uid} = require("uid");

const io = require("../modules/sockets");
const usersOnline = require("../modules/usersOnline");

const userSchema = require("../schemas/userSchema");
const postSchema = require("../schemas/postSchema");
const favoritesSchema = require("../schemas/favoritesSchema");

module.exports = {
    register: async (req, res) => {
        const {username, passwordOne} = req.body;

        const userExists = await userSchema.findOne({username})
        if (userExists) return res.send({message: "User already exists.", error: true})

        const salt = await bcrypt.genSalt(5)
        const hash = await bcrypt.hash(passwordOne, salt)

        const user = {
            username,
            password: hash,
        }

        const newUser = new userSchema(user)
        await newUser.save()

        res.send({message: "User created successfully!"});
    },
    login: async (req, res) => {
        const {username, password} = req.body;

        const userExists = await userSchema.findOne({username})
        if (!userExists) return res.send({error: true, message: "User does not exist!"});

        const samePassword = await bcrypt.compare(password, userExists.password);
        if (!samePassword) return res.send({error: true, message: "Username or password is invalid."});

        let user = {
            _id: userExists._id,
            username: userExists.username,
            password: userExists.password,
            image: userExists.image,
            messages: userExists.messages
        }

        const token = jwt.sign(user, process.env.SECRET_KEY)
        const posts = await postSchema.find()
        const favorites = await favoritesSchema.find({favoriteById: userExists._id})

        return res.send({message: "Logged in successfully!", token: token, user, posts, favorites})
    },
    changeImage: async (req, res) => {
        const {userId, image} = req.body

        const updatedUser = await userSchema.findOneAndUpdate(
            {_id: userId},
            {$set: {image: image}},
            {new: true, projection: {password: 0}}
        )

        // Updating new user messages image
        await userSchema.updateMany(
            { "messages.senderId": userId },
            { $set: { "messages.$[msg].senderPhoto": image } },
            { arrayFilters: [{ "msg.senderId": userId }] }
        );

        return res.send({message: "Image was changed!", updatedUser})
    },
    allPosts: async (req, res) => {
        const posts = await postSchema.find()

        res.send(posts)
    },
    createPost: async (req, res) => {
        const {userId, username, title, description, image, time} = req.body;

        const post = {
            username,
            authorId: userId,
            title: title,
            description: description,
            image: image,
            time: time
        }

        const newPost = new postSchema(post)
        await newPost.save()

        const posts = await postSchema.find()

        res.send({message: "Post created successfully!", posts});
    },
    deletePost: async (req, res) => {
        const postId = req.params.postId;

        await postSchema.findOneAndDelete({_id: postId})

        const posts = await postSchema.find()

        res.send({message: "Post deleted.", error: false, posts})
    },
    editPost: async (req, res) => {
        const {title, description, image} = req.body;

        const postId = req.params.postId;

        await postSchema.findOneAndUpdate(
            {_id: postId},
            {
                $set: {
                    image, title, description
                }
            }
        )

        const posts = await postSchema.find()
        return res.send({message: "Post updated!", posts})
    },
    changeUsername: async (req, res) => {
        const {newUsername, userId} = req.body

        if (newUsername === "") return res.send({error: true, message: "Username field cannot be empty!"});
        if(newUsername.length < 4 || newUsername.length > 20)
            return res.send({error: true, message: "Username must be 4 - 20 symbols long."})

        const usernameExists = await userSchema.findOne({username: newUsername})
        if (usernameExists) return res.send({error: true, message: "Username is already taken!"});

        // Updating online user username
        const findCurrentUser = await userSchema.findOne({_id: userId})
        if (!findCurrentUser) return res.send({error: true, message: "User not found!"});

        const currentUserOnline = usersOnline.getUser(findCurrentUser.username);
        if (!currentUserOnline) return res.send({error: true, message: "User is not online!"});

        usersOnline.updateUser(currentUserOnline.id, newUsername)

        // Updating registered user username
        const updatedUser = await userSchema.findOneAndUpdate(
            {_id: userId},
            {$set: {username: newUsername}},
            {new: true, projection: {password: 0}}
        )

        // Updating new user posts and favorites
        await postSchema.updateMany(
            { authorId: userId },
            { $set: { username: newUsername } }
        );

        await favoritesSchema.updateMany(
            { authorId: userId },
            { $set: { username: newUsername } }
        );

        // Updating new user messages
        await userSchema.updateMany(
            { "messages.senderId": userId },
            { $set: { "messages.$[msg].sender": newUsername } },
            { arrayFilters: [{ "msg.senderId": userId }] }
        );

        // Updating new user comments
        await postSchema.updateMany(
            { "comments.commenterId": userId },
            { $set: { "comments.$[comment].commenter": newUsername } },
            { arrayFilters: [{ "comment.commenterId": userId }] }
        );

        return res.send({message: "Username was changed!", updatedUser})
    },
    changePassword: async (req, res) => {
        const {newPassword, userId} = req.body

        const userExists = await userSchema.findOne({_id: userId})
        if (!userExists) return res.send({error: true, message: "User does not exist!"});

        const samePassword = await bcrypt.compare(newPassword, userExists.password);
        if (samePassword) return res.send({error: true, message: "Please enter new password!"});

        if(newPassword === "")
            return res.send({error: true, message: "Password field cannot be empty!"})
        if(newPassword.length < 4 || newPassword.length > 20)
            return res.send({error: true, message: "Password must be 4 - 20 symbols long."})

        const salt = await bcrypt.genSalt(5)
        const hash = await bcrypt.hash(newPassword, salt)

        const updatedUser = await userSchema.findOneAndUpdate(
            {_id: userId},
            {$set: {password: hash}},
            {new: true, projection: {password: 0}}
        )

        return res.send({message: "Password was changed!", updatedUser})
    },
    addToFavorites: async (req, res) => {
        const {userId} = req.body;
        const postId = req.params.postId
        const postObjectId = new mongoose.Types.ObjectId(postId); // PostId from string to dbId

        // Check if the post is already in the user's favorites
        const existingFavorite = await favoritesSchema.findOne({ postId: postObjectId, favoriteById: userId });
        if (existingFavorite) return res.send({ error: true, message: "Post is already in favorites!" });

        const chosenPost = await postSchema.findOne({ _id: postObjectId })
        if (!chosenPost) return res.send({ error: true, message: "Post not found!" });


        const favoritePost = {
            postId: postObjectId,
            favoriteById: userId,
            username: chosenPost.username,
            authorId: chosenPost.authorId,
            title: chosenPost.title,
            description: chosenPost.description,
            image: chosenPost.image,
            time: chosenPost.time
        }

        const newFavoritePost = new favoritesSchema(favoritePost)
        await newFavoritePost.save()

        const favoriteUserPosts = await favoritesSchema.find({favoriteById: userId})

        res.send(favoriteUserPosts)
    },
    removeFavorite: async (req, res) => {
        const {userId} = req.body;
        const postId = req.params.postId
        const postObjectId = new mongoose.Types.ObjectId(postId); // PostId from string to dbId

        const chosenPost = await favoritesSchema.findOne({ postId })
        if (!chosenPost) return res.send({error: true, message: "Post not found!"});

        await favoritesSchema.findOneAndDelete({postId: postObjectId, favoriteById: userId})

        const favoriteUserPosts = await favoritesSchema.find({favoriteById: userId})

        res.send({message: "Favorite post was removed!", favoriteUserPosts});
    },
    allFavorites: async (req, res) => {
        const userId = req.params.userId

        const favoriteUserPosts = await favoritesSchema.find({favoriteById: userId})

        res.send(favoriteUserPosts)
    },
    singleUser: async (req, res) => {
        const userId = req.params.userId

        const userExists = await userSchema.findOne({_id: userId});
        const userPosts = await postSchema.find({authorId: userId})

        res.send({userExists, userPosts})
    },
    singlePost: async (req, res) => {
        const postId = req.params.postId

        const postExists = await postSchema.findOne({_id: postId});

        res.send(postExists)
    },
    comment: async (req, res) => {
        const {commenter, commenterId, text, postId} = req.body

        const postExists = await postSchema.findOne({_id: postId});
        if (!postExists) return res.send({error: true, message: "Post doesn't exist!"});

        if (text === "") return res.send({error: true, message: "Text field cannot be empty!"});

        const newComment = {
            commentId: uid(),
            commenter,
            commenterId,
            text
        }

        const updatedPost = await postSchema.findOneAndUpdate(
            {_id: postId},
            {$push: { comments: newComment }},
            {new: true}
        )

        res.send(updatedPost)
    },
    deleteComment: async (req, res) => {
        const {postId, commentId} = req.body

        const updatedPost = await postSchema.findOneAndUpdate(
            {_id: postId},
            { $pull: { comments: { commentId: commentId } } },
            { new: true }
        )

        res.send(updatedPost)
    },
    allMessages: async (req, res) => {
        const userId = req.params.userId

        const userExists = await userSchema.findOne({_id: userId});
        if (!userExists) return res.status(404).json({ error: 'User not found' });

        res.send(userExists.messages)
    },
    sendMessage: async (req, res) => {
        const {sender, senderId, receiver, message, time} = req.body;
        const onlineUsers = usersOnline.userIsOnline(receiver);
        if (!onlineUsers) return res.send({error: true, message: "User is offline!"});

        if (message === "") return res.send({error: true, message: "Message field cannot be empty!"});

        const senderInfo = await userSchema.findOne({_id: senderId})

        const messageInfo = {
            id: uid(),
            sender,
            senderPhoto: senderInfo.image,
            senderId,
            receiver,
            message,
            time
        }

        const updatedUser = await userSchema.findOneAndUpdate(
            {username: receiver},
            {$push: { messages: messageInfo }},
            {new: true, projection: {password: 0}}
        )

        const selectedUser = usersOnline.getUser(receiver);
        if (selectedUser) {
            io.to(selectedUser.id).emit("messageReceived", updatedUser)
        }

        res.send({error: false, message: "Message sent!", updatedUser})
    },
    deleteMessage: async (req, res) => {
        const {messageId, receiver} = req.body;

        const updatedUser = await userSchema.findOneAndUpdate(
            {username: receiver},
            {$pull: { messages: { id: messageId } } },
            {new: true, projection: {password: 0}}
        )

        res.send(updatedUser.messages)
    }
}