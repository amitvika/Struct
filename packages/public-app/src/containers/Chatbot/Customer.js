import React from 'react'
import './newstyle.css'

export default function Customer({message,timeStamp, imageUrl}) {
    return (
        <div>
       
            <div className="ChatItem ChatItem--customer">
                <div className="ChatItem-meta">
                    <div className="ChatItem-avatar">
                        <img className="ChatItem-avatarImage" src={imageUrl} />
                    </div>
                </div>
                <div className="ChatItem-chatContent">
                    <div className="ChatItem-chatText">{message}</div>
                    <div className="ChatItem-timeStamp"><strong>Chat Bot</strong> {timeStamp}</div>
                </div>
            </div>
        </div>
    )
}
