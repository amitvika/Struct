import React from 'react'
import Header from '../containers/Header'
import Footer from '../containers/Footer';
import Chatbot from '../containers/Chatbot';

export default function Layout(props) {
    return (
        <>
            <Header />
            {props.children}
            <Chatbot />
            <Footer />
        </ >
    )
}
