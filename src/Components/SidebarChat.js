import React, { useEffect, useRef, useState } from 'react'
import './SidebarChat.css'
import axios from 'axios'
import { io } from "socket.io-client"
import { FaStar } from "react-icons/fa"
import { FiStar } from "react-icons/fi"
import { RiMailOpenLine } from "react-icons/ri"
import { format } from "timeago.js"

const localeFunc = (date_str) => {
    return date_str
        .replace('right now', 'Akkurat nå')
        .replace('just now', 'Akkurat nå')
        .replace('seconds', 'sekunder')
        .replace('minutes', 'minutter')
        .replace('years', 'år')
        .replace('hours', 'timer')
        .replace('days', 'dager')
        .replace('weeks', 'uker')
        .replace('months', 'måneder')
        .replace('minute', 'minutt')
        .replace('hour', 'time')
        .replace('day', 'dag')
        .replace('week', 'uke')
        .replace('month', 'måned')
        .replace('year', 'år')
        .replace('in ', '')
        .replace(' ago', '');
};

function SidebarChat({ chatroomtile, currentChat, currentUser }) {
    const [user, setUser] = useState(null)
    const [isSelected, SetIsSelected] = useState(false);
    const [online, setOnline] = useState(false);
    const [favorite, setFavorite] = useState(false);
    const [latestAt, setLatestAt] = useState('');
    const socket = useRef()

    const API_URL = process.env.REACT_APP_API_URL

    useEffect(() => {
        socket.current = io(API_URL);
    }, [API_URL])

    useEffect(() => {
        const amigoId = chatroomtile.members.find((m) => m !== currentUser._id);
        const currentId = currentChat?.members.find((m) => m !== currentUser._id);
        if (amigoId === currentId) {
            SetIsSelected(true);
        } else {
            SetIsSelected(false);
        }
        socket.current.on("getUsers", (users) => {
            setOnline(users.find((user) => user.userId === amigoId));
        })
        const getAmigodetails = async () => {
            try {
                const response = await axios.get(API_URL + 'api/users/' + amigoId)
                setUser(response.data)
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
        getAmigodetails()
        getLatestMessage()
    }, [currentUser, currentChat, chatroomtile, online, API_URL])

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
                                <span className="sidebarchat-plan">
                                    +{user?.plans.length - 1} more
                                </span>
                            </>
                        )}
                    </span>
                </div>
            </div>
            <div className='flex flex-col gap-10'>
                <div className='flex gap-10 justify-end'>
                    <span className='latest_time'>{latestAt ? latestAt.replace(' ago', '') : 'Akkurat nå'}</span>
                    <button name="favorite" className='btn-favorite' onClick={() => setFavorite(prev => !prev)}>
                        {favorite ? <FaStar size={20} color='#12A4FF'></FaStar> : <FiStar size={20} color='#8f9199'></FiStar>}
                    </button>
                </div>
                <div className='flex gap-10 justify-end'>
                    <span className='badge'>1</span>
                    <RiMailOpenLine size={20} color='#8f9199'></RiMailOpenLine>
                </div>
            </div>
        </div>
    )
}

export default SidebarChat