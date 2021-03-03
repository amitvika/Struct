import React, { useState } from 'react';
import './style.css'
import ChatManager from './ChatManager'
// import ChatIcon from '@material-ui/icons/Chat';
import ChatIcon from '../../assets/images/Chatbot_icon.jpg'

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

            <button className="Submit_btn"
                onClick={handleChatBoxClick}>
                <img className="Chat_btn" src={ChatIcon}></img>
                {/* <ChatIcon style={{
                    fontSize: "66px",
                    marginRight: "4px"
                }} /> */}
            </button>

        </div>
    )

}
export default Chatbot
