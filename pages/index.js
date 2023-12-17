import { useState, useEffect  } from 'react';
import { FormLogin } from '../components/FormLogin';
import { ChatRoomList } from '../components/ChatRoomList';
import { Header } from '../components/Header';

export default function HomePage() {

  return (
    <div style={{paddingTop: "5vh", width: "80%", margin: "auto"}}>
      <h3>Websocket chat</h3>
      <FormLogin/>
      <br/>
      <ChatRoomList/>
    <p>Application created by <a target="_blank" href="https://sondre.kulseng.no">Sondre Kulseng</a></p>
    </div>
  );
}
