import React, { useState } from 'react'
import './newstyle.css'
import './style.css'
import TextEntry from './TextEntry';
import Expert from './Expert'
import Customer from './Customer'
import moment from 'moment'

const data = [
    { message: "Hello", isExpert: true, timeStamp: moment().format('MMMM Do YYYY'), imageUrl: "https://randomuser.me/api/portraits/women/0.jpg" },
    { message: "world", isExpert: false, timeStamp: moment().format('MMMM Do YYYY'), imageUrl: "https://image.ibb.co/eTiXWa/avatarrobot.png " }
]
export default function NewChatbot() {

    const [chatList, setChatList] = useState(data);
    const [value, setValue] = useState("");

    const handleSubmit = value => {
        setChatList(prev => [...prev, { message: value, isExpert: false }])
        // setChatList([...data, { message: value, isExpert: false }])
        // setValue("")
    };
    const renderChat = () => {
        return chatList.map((item) => {
            if (item.isExpert) {
                return (<Customer
                    message={item.message}
                    timeStamp={item.timeStamp}
                    imageUrl={item.imageUrl} />)
            }
            else {
                return (<Expert
                    message={item.message}
                    timeStamp={item.timeStamp}
                    imageUrl={item.imageUrl} />)

            }
        }
        );
    }

    return (
        <div className="ChatWindow">
            <div>CHATBOT</div>

            {renderChat()}

            <TextEntry
                handleSubmit={handleSubmit}
            />

        </div>

    )
}
