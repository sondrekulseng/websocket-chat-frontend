import { useState, useEffect  } from 'react';
import { FormLogin } from '../components/FormLogin';
import { Header } from '../components/Header';

export default function HomePage() {

  return (
    <div>
      <h3>Websocket chat</h3>
      <FormLogin/>
    </div>
  );
}
