import React, { useState } from 'react'; 
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import dadosStore from './redux/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import './App.css'


import Clientes from './pages/Clientes';
import Concluidos from './pages/Concluidos';
import Agendados from './pages/Agendados';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';

// App

export default function App() {
  let {store, persistor} = dadosStore();

  return ( 
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <Routes>
            <Route path='/cadastro' element={<Cadastro />} />
            <Route path='/agendados' element={<Agendados />} />
            <Route path='/Concluidos' element={<Concluidos />} /> 
            <Route path='/login' element={<Login />} /> 
            <Route path='/' element={<Clientes />} />
          </Routes>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}