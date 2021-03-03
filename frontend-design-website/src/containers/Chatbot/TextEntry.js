import React, { useState } from 'react'
import './style.css'
import SendIcon from '@material-ui/icons/Send';


export default function TextEntries({ handleSubmit }) {
    const [value, setValue] = useState("");

    const handleChange = e => {
        setValue(e.target.value);
    };
    const handleKeypress = e => {

        if (e.key === 'Enter') {
            handleSubmit(value);
            setValue("")
        }
    };
    const handleOnSubmit = () => {
        handleSubmit(value)
        setValue("")
    }

    return (
        <div className="ChatInput is-hidey">
            <div className="ChatInput-input">
                <input
                    style={{ width: "2000px" }}
                    className="Chat_Text"
                    contentEditable="true"
                    type="text"
                    placeholder="Type your message here..."
                    value={value}
                    onChange={handleChange}
                    onKeyPress={handleKeypress}

                />

                <button className="SumbitChat_btn" >
                    <SendIcon
                        type=" submit"
                        fontSize="large"
                        onClick={handleOnSubmit} />
                </button>
            </div>
        </div>
    )
}
