import React, { useContext } from 'react'
import moment from "moment";
import './Message.css'
import { AuthContext } from "../Context/AuthContext";

function Message({ message, amigo, own }) {
    const { user } = useContext(AuthContext);
    const API_URL = process.env.REACT_APP_API_URL

    return (
        <div className='message-box'>
            <img className="message-image" 
                src={own ? (user?.avatar ? user.avatar : API_URL + "api/images/noavatar.png") : (amigo?.avatar ? amigo.avatar : API_URL + "api/images/noavatar.png")} 
                alt=""
            >
            </img>
            <div>
                <div className="message-header">
                    <span className='message-user'>{own ? "Me" : amigo?.firstname + " " + amigo?.lastname}</span>
                    <span className='message-time'>{moment(message.createdAt).format("MMM DD YYYY, h:mm A")}</span>
                </div>
                <p className="message-text">{message.text}</p>
            </div>
            {/* <p className={own ? 'message-sent' : 'message-received'}>
                <span>{message.text}</span>
                <span className='message-time'>{msg}</span>
            </p> */}
        </div>
    )
}

export default Message
