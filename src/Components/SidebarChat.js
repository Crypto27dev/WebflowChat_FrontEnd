import React, { useEffect, useRef, useState } from 'react'
import './SidebarChat.css'
import axios from 'axios'
import { io } from "socket.io-client"
import { FaStar } from "react-icons/fa"
import { FiStar } from "react-icons/fi"
import { format } from "timeago.js"
import { localeFunc } from '../Pages/utils'

function SidebarChat({ chatroomtile, currentChat, currentUser, arrivalChat }) {
    const [user, setUser] = useState(null)
    const [isSelected, SetIsSelected] = useState(false);
    const [online, setOnline] = useState(false);
    const [favorite, setFavorite] = useState(false);
    const [latestAt, setLatestAt] = useState('');
    const [unread, setUnread] = useState(0);
    const socket = useRef()
    const chatRef = useRef()

    const API_URL = process.env.REACT_APP_API_URL

    const getAmigodetails = async (amigoId) => {
        try {
            if (amigoId) {
                const response = await axios.get(API_URL + 'api/users/user/',
                    {
                        params: {
                            id: amigoId
                        }
                    }
                )
                setUser(response.data)
            }
        }
        catch (err) {
            console.log(err)
        }
    }
    const getLatestMessage = async () => {
        try {
            const response = await axios.get(API_URL + 'api/messages/latest/' + chatroomtile?._id)
            const data = response.data;
            if (data.length > 0) {
                setLatestAt(localeFunc(format(data[0].createdAt)));
            }
        } catch (err) {
            console.log(err);
        }
    }

    const getUnreadCount = async () => {
        try {
            const resp = await axios.get(API_URL + 'api/messages/count/', {
                params: {
                    chatroomId: chatroomtile?._id,
                    userId: currentUser?._id
                }
            })
            setUnread(resp.data);
            if (resp.data > 0) {
                document.title = "Upit Chat" + ` (${resp.data})`;
            } else {
                document.title = "Upit Chat";
            }
        } catch (err) {
            console.log(err)
        }
    }

    const handleFavorite = () => {
        const storage = localStorage.getItem("favorites");
        let favorites = {}
        if (storage) {
            favorites = JSON.parse(storage);
        }
        if (favorites && chatroomtile?._id) {
            favorites[chatroomtile?._id] = !favorite;
        }
        setFavorite(!favorite);
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }

    useEffect(() => {
        const storage = localStorage.getItem("favorites");
        let favorites = {};
        if (storage) {
            favorites = JSON.parse(storage);
        }
        if (favorites && chatroomtile?._id) {
            setFavorite(favorites[chatroomtile?._id]);
        }
    }, [chatroomtile])

    useEffect(() => {
        const amigoId = chatroomtile.members.find((m) => m !== currentUser._id);
        const currentId = currentChat?.members.find((m) => m !== currentUser._id);
        if (amigoId === currentId) {
            SetIsSelected(true);
        } else {
            SetIsSelected(false);
        }

        chatRef.current = currentChat;

        getAmigodetails(amigoId)
        getUnreadCount()
        getLatestMessage()
    }, [currentUser, currentChat, chatroomtile, online, API_URL])

    useEffect(() => {
        socket.current = io(API_URL);
        const amigoId = chatroomtile.members.find((m) => m !== currentUser._id);
        socket.current.on("getUsers", (users) => {
            setOnline(users.find((user) => user.userId === amigoId));
        })
    }, [API_URL, chatroomtile])

    useEffect(() => {
        if (document.hidden || chatroomtile?._id !== currentChat?._id) {
            getUnreadCount();
        }
    }, [arrivalChat, currentChat])

    return (
        <div className={isSelected ? 'sidebarchat sidebarchat-select' : 'sidebarchat'}>
            <div className='flex align-items-center'>
                <img className='amigo-profilepic' src={user?.avatar ? user.avatar : API_URL + "api/images/noavatar.png"} alt='' />
                <div className={online ? "online" : "offline"}></div>
                <div className='flex flex-col gap-10'>
                    <p className="sidebarchat-info-name">{user ? user?.firstname + " " + user?.lastname : ""}</p>
                    <span className='sidebarchat-plans'>
                        {user?.plans.length === 1 && (
                            <span className="sidebarchat-plan">
                                {user.plans[0].planName}
                            </span>
                        )}
                        {user?.plans.length > 1 && (
                            <>
                                <span className="sidebarchat-plan">
                                    {user?.plans[0].planName}
                                </span>
                                {/* <span className="sidebarchat-plan">
                                    +{user?.plans.length - 1} more
                                </span> */}
                            </>
                        )}
                    </span>
                </div>
            </div>
            <div className='flex flex-col gap-10'>
                <div className='flex gap-10 justify-end'>
                    <span className='latest_time'>{latestAt ? latestAt.replace(' ago', '') : 'Akkurat nå'}</span>
                </div>
                <div className='flex gap-10 justify-end'>
                    {unread > 0 && <span className='badge'>{unread}</span>}
                    <button name="favorite" className='btn-favorite' onClick={handleFavorite}>
                        {favorite ? <FaStar size={20} color='#12A4FF'></FaStar> : <FiStar size={20} color='#8f9199'></FiStar>}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SidebarChat