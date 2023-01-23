import React, { useState, useEffect } from 'react'
import './Message.css'
import { format } from "timeago.js"

function Message({message,own}) {
    const [msg, setMsg] = useState('');
    useEffect(() => {
        setMsg(format(message.createdAt));
        const interval = setInterval(() => {
            setMsg(format(message.createdAt));
        }, 1000);
        return () => clearInterval(interval);
    }, [message]);
    return (
        <div>
            <p className={own?'message-sent':'message-received'}>
                <span>{message.text}</span>
                <span className='message-time'>{msg}</span>
            </p>
        </div>
    )
}

export default Message
