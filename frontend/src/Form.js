import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';

function Form() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: new Date(),
    questions: [''], // Array to store multiple inputs for "Question"
    eventPw: ''
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const questions = [...formData.questions];
    questions[index] = value;
    setFormData({
      ...formData,
      questions
    });
  };

  const handleAddInput = () => {
    const questions = [...formData.questions, ''];
    setFormData({
      ...formData,
      questions
    });
  };

  const handleRemoveInput = (index) => {
    const questions = [...formData.questions];
    questions.splice(index, 1);
    setFormData({
      ...formData,
      questions
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      eventDate: date
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset error state
    if (formData.eventName.trim() === '' || formData.questions.some(q => q.trim() === '') || formData.eventPw.trim() === '') {
      setError('Please fill in all fields');
      return;
    }
  
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_DOMIN}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error('Failed to create event');
      }
      setFormSubmitted(true);
      // Navigate to FormSubmittedPage
      navigate('/form-submitted'); // Replace '/form-submitted' with your actual route
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Failed to create event');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSubmit} className="max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl mb-4 text-center font-bold text-blue-600">Welcome to Volunteer Events Management System!</h2>
        <h2 className="text-l mb-4 text-center font-bold text-orange-600">Please fill in new event & feedback particulars!</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label htmlFor="eventName" className="block text-sm font-bold mb-2">Event Name:</label>
          <input
            type="text"
            id="eventName"
            name="eventName"
            value={formData.eventName}
            onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="eventDate" className="block text-sm font-bold mb-2">Event Date:</label>
          <DatePicker
            id="eventDate"
            selected={formData.eventDate}
            onChange={handleDateChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Questions:</label>
          {formData.questions.map((question, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={question}
                onChange={(e) => handleChange(e, index)}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
              />
              <button type="button" onClick={() => handleRemoveInput(index)} className="ml-2 bg-red-500 text-white py-1 px-2 rounded-md hover:bg-red-600">
                -
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddInput} className="bg-blue-500 text-white py-1 px-2 rounded-md hover:bg-blue-600">
            + Add Question
          </button>
        </div>
        <div className="mb-4">
          <label htmlFor="eventPw" className="block text-sm font-bold mb-2">Event Password:</label>
          <input
            type="text"
            id="eventPw"
            name="eventPw"
            value={formData.eventPw}
            onChange={(e) => setFormData({ ...formData, eventPw: e.target.value })}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button type="submit" className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600">
          Submit
        </button>
      </form>
    </div>
  );
}

export default Form;







