import React, { useEffect, useContext } from 'react'
import { useHistory, useParams } from 'react-router-dom';
import './Signin-up.css'
import axios from 'axios'
import { Comment } from 'react-loader-spinner';
import { AuthContext } from '../Context/AuthContext'

function Signin() {
    const { dispatch, setUserId } = useContext(AuthContext);
    const history = useHistory();
    const API_URL = process.env.REACT_APP_API_URL;
    const API_KEY = process.env.REACT_APP_MEMBERSTACK_KEY;
    const BASE_URL = 'https://admin.memberstack.com/members';
    const headers = { "X-API-KEY": API_KEY };
    const { msg } = useParams();

    useEffect(() => {
        loginCall(msg, dispatch);
    }, []);

    const getUserInfo = async (mem_id) => {
        try {
            const resp = await axios.get(`${BASE_URL}/${mem_id}`, { headers });
            return resp.data.data;
        } catch (err) {
            console.log(err);
        }
        return null;
    }

    const registerCall = async(member_id) => {
        try {
            const profile = await getUserInfo(member_id);
            const res = await axios.post(API_URL + "api/auth/signin", {
                firstname: profile.customFields.fornavn,
                lastname: profile.customFields.etternavn,
                email: profile.auth.email,
                mem_id: profile.id,
                avatar: profile.customFields.profilbilde
            });
        }
        catch (err) {
            console.log("Register Err:", err)
        }
    }

    const loginCall = async (pathname, dispatch) => {
        dispatch({ type: "LOGIN_START" });
        try {
            const token = pathname.replace('/chatapp/', '');
            const data = JSON.parse(atob(token));
            const userInfo = {
                email: data.email,
                mem_id: data.mem_id
            }
            
            const profile = await getUserInfo(userInfo.mem_id);
            const res = await axios.post(API_URL + "api/auth/signin", {
                firstname: profile.customFields.fornavn,
                lastname: profile.customFields.etternavn,
                email: profile.auth.email,
                mem_id: profile.id,
                avatar: profile.customFields.profilbilde
            });
            if (data?.to) {
                await registerCall(data.to);
            }
            dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
            history.push(`/chatapp/user/${data.to}`);
        }
        catch (err) {
            console.log("Login Err:", err)
            dispatch({ type: "LOGIN_FAILURE", payload: err })
        }
    }


    return (
        <div className='signin-container'>
            <div>
                <Comment
                    visible={true}
                    height="80"
                    width="80"
                    ariaLabel="comment-loading"
                    wrapperStyle={{}}
                    wrapperClass="comment-wrapper"
                    color="#316af3"
                    backgroundColor="#fff"
                />
            </div>
            <footer>
                <span>@Copyright2023</span>
            </footer>
        </div>
    )
}

export default Signin