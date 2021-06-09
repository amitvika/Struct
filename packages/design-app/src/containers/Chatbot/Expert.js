import React from 'react'
import './newstyle.css'



export default function Expert({ message, timeStamp, imageUrl }) {
    return (

        <div className="ChatItem ChatItem--expert">
            <div className="ChatItem-meta">
                <div className="ChatItem-avatar">
                    <img className="ChatItem-avatarImage"


                        src={imageUrl} />
                </div>
            </div>
            <div className="ChatItem-chatContent">
                {/* <div className="ChatItem-chatText">    {renderChat()}</div> */}

                <div className="ChatItem-chatText">  {message}</div>
                <div className="ChatItem-timeStamp"><strong>Me</strong> {timeStamp}</div>
            </div>
        </div>
    )
}
