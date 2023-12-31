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
  const [room, setRoom] = useState();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState("");
  const [noMessageMsg, setNoMessageMsg] = useState("No messages yet... Be the first!");
  const [typing, setTyping] = useState("");
  const socket = new SockJS(backendBaseUrl+'/websocket');
  const stompClient = Stomp.over(socket);

  useEffect(() => {
    function connectAndSubscribe() {
      if (roomId == null) {
        return;
      } else {
        fetch(backendBaseUrl+"/api/room/"+roomId)
            .then(response => {
                    if (!response.ok) {
                        location.replace("/..");
                    }
                    return response.json();
            })
            .then(response => {
                setRoom(response);
                setLoading(false);
            });
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
  }, [roomId, username, loading]);

  if (loading) {
    return <h4>Loading data...</h4>;
  }


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
        <div style={{paddingTop: "5vh", width: "80%", margin: "auto"}}>
          <h3>Join chatroom {room.name}</h3>
          <FormUsername/>
        </div>
    )
  }

  console.log(room);

  return (
    <div>
      <MainContainer>
        <ChatContainer style={{ height: "85vh", overflow: "hidden" }}>
            <ConversationHeader>
                <ConversationHeader.Content userName=<h4>{room.name} ({room.isPublic ? "public" : "private"})</h4> info=<h5>Logged in as {username}</h5> />
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
            placeholder="Type a message"
            onSend={(value) => send(value)}
            onChange={(value) => sendTyping(value)}
          />
        </ChatContainer>
      </MainContainer>
      <div style={{marginTop: "1em"}}>
        <button onClick={deleteChat}>Delete chat history</button>
        <button onClick={getChatUrl}>Copy chat link</button>
      </div>
    </div>
  );
}
