import 'bootstrap/dist/css/bootstrap.css';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
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

    function formatId(id) {
        return "xxxx-" + id.substring(id.length - 12);
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
                <td>{item.name} <br/><i>({formatId(item.id)})</i></td>
                <td><Button variant="primary" onClick={() => location.href = location.href + "/ChatRoom?roomId=" + item.id}>Join</Button></td>
              </tr>
            ))}
          </tbody>
        </Table>
        </>
      );
}