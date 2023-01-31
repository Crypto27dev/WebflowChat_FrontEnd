import React, { useEffect, useContext } from 'react'
import './Signin-up.css'
import axios from 'axios'
import { Comment } from 'react-loader-spinner';
import { AuthContext } from '../Context/AuthContext'

function Signin() {
    const { dispatch, setLoading, setCurrentMem } = useContext(AuthContext);
    const API_URL = process.env.REACT_APP_API_URL;
    const API_KEY = process.env.REACT_APP_MEMBERSTACK_KEY;
    const BASE_URL = 'https://admin.memberstack.com/members';
    const headers = { "X-API-KEY": API_KEY };

    useEffect(() => {
        (() => {
            try {
                const token = window.location.pathname.replace('/', '');
                // const token = window.location.search.replace('?', '');
                const param = JSON.parse(atob(token));
                loginCall(param, dispatch);
            } catch (err) {
                console.log(err);
            }
        })()
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

    const registerCall = async (member_id) => {
        try {
            const profile = await getUserInfo(member_id);
            const res = await axios.post(API_URL + "api/auth/signin", {
                firstname: profile.customFields.fornavn,
                lastname: profile.customFields.etternavn,
                email: profile.auth.email,
                mem_id: profile.id,
                avatar: profile.customFields.profilbilde,
                plans: profile.planConnections
            });
        }
        catch (err) {
            console.log("Register Err:", err)
        }
    }

    const loginCall = async (param, dispatch) => {
        dispatch({ type: "LOGIN_START" });
        try {
            const userInfo = {
                email: param.email,
                mem_id: param.mem_id
            }

            const profile = await getUserInfo(userInfo.mem_id);
            const res = await axios.post(API_URL + "api/auth/signin", {
                firstname: profile.customFields.fornavn,
                lastname: profile.customFields.etternavn,
                email: profile.auth.email,
                mem_id: profile.id,
                avatar: profile.customFields.profilbilde,
                plans: profile.planConnections
            });
            
            if (param?.to) {
                await registerCall(param.to);
            }
            dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
            setLoading(false);
            setCurrentMem(param.to);
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