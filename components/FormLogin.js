import 'bootstrap/dist/css/bootstrap.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useState } from 'react';
import { useRouter } from 'next/router';

export function FormLogin() {
  const [username, setUsername] = useState('');
  const [chatRoomName, setChatRoomName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
  const router = useRouter();

  const handleSwitchChange = () => {
      setIsPublic(!isPublic);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const requestOptions = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: chatRoomName,
                        isPublic: isPublic
                    })
                };
                
    fetch(backendBaseUrl+"/api/create/room", requestOptions)
        .then(response => response.text())
        .then(response => router.push('/ChatRoom?roomId='+response+'&username='+username));
  }

  return (
    <Form onSubmit={e => handleSubmit(e)}>
     <Form.Group className="mb-3">
       <Form.Control
         type="text"
         placeholder="Username"
         value={username}
         required
         onChange={(e) => setUsername(e.target.value)}
       />
     </Form.Group>
     <Form.Group className="mb-3">
       <Form.Control
         type="text"
         placeholder="Chat room name"
         value={chatRoomName}
         required
         onChange={(e) => setChatRoomName(e.target.value)}
       />
     </Form.Group>
     <Form.Group className="mb-3">
     <Form.Check // prettier-ignore
        type="switch"
        id="custom-switch"
        label="Public chat room"
        checked={isPublic}
        onChange={handleSwitchChange}
        />
        </Form.Group>
     <Button variant="primary" type="submit">Create chatroom</Button>
   </Form>
  );
}
