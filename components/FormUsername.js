import 'bootstrap/dist/css/bootstrap.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function FormUsername() {
    const [username, setUsername] = useState('');
    const router = useRouter();

    const handleSubmit = (e) => {
        e.preventDefault();
        router.query.username = username;
        router.push(router);
      }

      return (
        <Form onSubmit={e => handleSubmit(e)}>
         <Form.Group className="mb-3" controlId="formGroupEmail">
           <Form.Control
             type="text"
             placeholder="Username"
             value={username}
             required
             onChange={(e) => setUsername(e.target.value)}
           />
         </Form.Group>
         <Button variant="primary" type="submit">Login</Button>
       </Form>
      );
}