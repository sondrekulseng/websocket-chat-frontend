import 'bootstrap/dist/css/bootstrap.css';
import Table from 'react-bootstrap/Table';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export function ChatRoomList() {
    const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() =>  {
        fetch(backendBaseUrl + "/api/rooms/public")
            .then(response => response.json())
            .then(response => {
                setRooms(response);
                setLoading(false);
            })
    }, []);

    if (loading) {
        return "Loading..."
    }

    if (rooms.length == 0 && loading == false) {
        return <p><strong>No public chat rooms</strong></p>
    }

    return (
        <>
        <h4>Public chat rooms ({rooms.length})</h4>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Chat room</th>
              <th>Join</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((item) => (
              <tr key={item.id}>
                <td>{item.name} <br/>({item.id})</td>
                <td><Link href="/ChatRoom?roomId=[roomId}" as={`/ChatRoom?roomId=${item.id}`}>Join</Link></td>
              </tr>
            ))}
          </tbody>
        </Table>
        </>
      );
}