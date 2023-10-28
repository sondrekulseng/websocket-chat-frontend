import 'bootstrap/dist/css/bootstrap.css';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import FormUsername from '../components/FormUsername';
import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  ConversationHeader,
  MessageList,
  Message,
  MessageGroup,
  MessageInput,
  TypingIndicator
} from "@chatscope/chat-ui-kit-react";

export default function ChatRoom() {
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
  const searchParams = useSearchParams();
  const username = searchParams.get('username');
  const roomId = searchParams.get('roomId');
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [noMessageMsg, setNoMessageMsg] = useState("No messages yet... Be the first!");
  const [typing, setTyping] = useState("");
  const socket = new SockJS(backendBaseUrl+'/websocket');
  const stompClient = Stomp.over(socket);

  useEffect(() => {
    function connectAndSubscribe() {
      if (roomId == null) {
        return;
      }

      stompClient.connect({}, () => {
        stompClient.subscribe('/app/chat/' + roomId, result => {
          const results = result.body;
          const data = JSON.parse(results);
          setMessages(data);
        });

        stompClient.subscribe('/app/typing/' + roomId, result => {
          setTyping(result.body);
        });

        stompClient.subscribe('/app/deleted/' + roomId, result => {
            setNoMessageMsg(result.body);
            setMessages([]);
        });
      });
    }

    connectAndSubscribe();

    return () => {
      socket.close();
    };
  }, [roomId, username]);

  const handleMessageInputChange = (e) => {
    setMessageInput(e);
    debounce((e) => setMessageInput(e), 1000);
  };

  function sendTyping(inputValue) {
    const inputLength = inputValue.length;
    setMessageInput(inputValue);

    try {
      if (inputLength === 0) {
        stompClient.send("/app/typing/" + roomId, {}, "");
      } else if (inputLength < 2 && inputLength > 0) {
        stompClient.send("/app/typing/" + roomId, {}, username + " is typing...");
      }
    } catch (exception) {
      console.log("Error when sending typing");
    }
  }

  function send(value) {
    const messageDto = {
        roomId: roomId,
        sender: username,
        message: value
    }

    try {
      stompClient.send("/app/send/" + roomId, {}, JSON.stringify(messageDto));
      stompClient.send("/app/typing/" + roomId, {}, "");
    } catch (exception) {
      console.log("Error while sending: " + value);
    }

    setMessageInput("");
    window.scrollTo(0, 0);
  }

  function getChatUrl() {
    navigator.clipboard.writeText(window.location.href.split('&username=')[0]);
    alert("Copied to clipboard!");
  }

  function deleteChat() {
    const pin = prompt("Enter PIN to delete chats for room: " + roomId);
    fetch(backendBaseUrl+'/api/admin/chats?roomId='+roomId+"&pin="+pin, { method: 'DELETE' })
        .then(response => {
               if (response.ok) {
                    stompClient.send("/app/deleted/"+roomId, {}, username + " deleted the chat history!");
               } else {
                    alert("Wrong PIN! No messages was deleted");
               }
           });
  }

  if (username == null) {
    return (
        <>
          <h3>Join chatroom {roomId}</h3>
          <FormUsername/>
        </>
    )
  }

  return (
    <div>
      <MainContainer>
        <ChatContainer style={{ height: "85vh", overflow: "hidden" }}>
            <ConversationHeader>
                <ConversationHeader.Content userName=<h4>{roomId} chat</h4> info=<h5>Logged in as {username}</h5> />
                </ConversationHeader>
          <MessageList typingIndicator={typing !== "" ? <TypingIndicator content={typing} /> : ""}>
            {messages.length == 0 ? <strong>{noMessageMsg}</strong> : ""}
            {messages.map((message) => (
                <MessageGroup direction= {message.sender == username ? "outgoing" : "incoming"}>
                <MessageGroup.Messages>
                    <Message model={{
                        message: message.message
                    }} />
                </MessageGroup.Messages>
                <MessageGroup.Footer>{message.sender} {message.dateTimeSent}</MessageGroup.Footer>
                </MessageGroup>
            ))}
          </MessageList>
          <MessageInput
            placeholder="Skriv melding"
            onSend={(value) => send(value)}
            onChange={(value) => sendTyping(value)}
          />
        </ChatContainer>
      </MainContainer>
      <div style={{marginTop: "1em"}}>
        <button onClick={deleteChat}>Delete chat history</button>
      </div>
    </div>
  );
}
