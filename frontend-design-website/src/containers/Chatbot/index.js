import React, { useState } from 'react';
import './style.css'
import ChatManager from './ChatManager'
import ChatIcon from '@material-ui/icons/Chat';

function Chatbot() {
    const [isChatBoxVisible, setisChatBoxVisible] = useState(false)

    const handleChatBoxClick = () => {
        console.log('Button clicked')
        setisChatBoxVisible(!isChatBoxVisible)
    }


    return (
        <div className="Chatbot_main"
            id="openChatBox">
            {
                isChatBoxVisible ?
                    <ChatManager /> : null
            }
            <div className="Submit_btn">
                <button onClick={handleChatBoxClick}><ChatIcon fontSize="90px" /></button>
            </div>
        </div>
    )

}
export default Chatbot
