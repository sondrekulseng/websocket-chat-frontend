import 'bootstrap/dist/css/bootstrap.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useState } from 'react';
import { useRouter } from 'next/router';

export function FormLogin() {
  const [username, setUsername] = useState('');
  const [chatRoomId, setChatRoomId] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push('/ChatRoom?roomId='+chatRoomId+'&username='+username);
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
         placeholder="Chat room id"
         value={chatRoomId}
         required
         onChange={(e) => setChatRoomId(e.target.value)}
       />
     </Form.Group>
     <Button variant="primary" type="submit">Login</Button>
   </Form>
  );
}
