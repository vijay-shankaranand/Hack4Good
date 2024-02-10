import React from 'react';
import Form from './Form';
import FormSubmittedPage from './FormSubmittedPage';
import './index.css'
import { BrowserRouter as Router,Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
    <div className="App">
      <Routes>
      <Route exact path="/" element={<Form />} />
      <Route path="/form-submitted" element={<FormSubmittedPage />} />
      </Routes>
    </div>
    </Router>
  );
}

export default App;
