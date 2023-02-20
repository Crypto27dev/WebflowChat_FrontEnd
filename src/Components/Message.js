import React, { useContext } from 'react'
import moment from "moment";
import { IconButton } from "@material-ui/core";
import axios from 'axios';
import download from 'downloadjs';
import GetAppIcon from '@material-ui/icons/GetApp';
import './Message.css'
import { AuthContext } from "../Context/AuthContext";

function Message({ message, amigo, own }) {
  const { user } = useContext(AuthContext);
  const API_URL = process.env.REACT_APP_API_URL

  const checkFile = (text) => {
    if (!text) return false;
    if (text.startsWith("<file>") && text.endsWith("</file>")) return true;
    else return false;
  }

  const getFileUrl = (text) => {
    if (!text) return '';
    return text.replace("<file>", "").replace("</file>", "");
  }

  const getFileName = (text) => {
    if (!text) return '';
    let filename = text.replace("<file>", "").replace("</file>", "");
    return filename.slice(Date.now().toString().length);
  }

  const handleDownload = async (filename) => {
    const response = await axios.get(`${API_URL}api/messages/download`, {
      responseType: 'blob',
      params: {
        filename
      }
    })
    const content = response.headers['content-type'];
    download(response.data, getFileName(filename), content);
  }

  return (
    <div className='message-box'>
      <img className="message-image"
        src={own ? (user?.avatar ? user.avatar : API_URL + "api/images/noavatar.png") : (amigo?.avatar ? amigo.avatar : API_URL + "api/images/noavatar.png")}
        alt=""
      >
      </img>
      <div>
        <div className="message-header">
          <span className='message-user'>{own ? "Meg" : amigo?.firstname + " " + amigo?.lastname}</span>
          <span className='message-time'>{moment(message.createdAt).format("MMM DD YYYY, HH:mm")}</span>
        </div>

        {checkFile(message.text) ?
          <div className='flex align-items-center'>
            <p className="message-text">{getFileName(message.text)}</p>
            <IconButton onClick={() => handleDownload(getFileUrl(message.text))}>
              <GetAppIcon style={{ fontSize: 30, color: "#333" }} />
            </IconButton>
          </div>
          :
          <p className="message-text">{message.text}</p>
        }
      </div>
    </div>
  )
}

export default Message
