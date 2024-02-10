import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';

function Form() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: new Date(),
    questions: [{ id: 1, text: '', options: [{ id: 1, text: '' }] }],
    eventPw: ''
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e, questionId, optionId) => {
    const { name, value } = e.target;
    if (name === 'text') {
      const updatedQuestions = formData.questions.map(question => {
        if (question.id === questionId) {
          return { ...question, text: value };
        }
        return question;
      });
      setFormData({
        ...formData,
        questions: updatedQuestions
      });
    } else if (name === 'options') {
      const updatedOptions = formData.questions.map(question => {
        if (question.id === questionId) {
          const updatedQuestionOptions = question.options.map(option => {
            if (option.id === optionId) {
              return { ...option, text: value };
            }
            return option;
          });
          return { ...question, options: updatedQuestionOptions };
        }
        return question;
      });
      setFormData({
        ...formData,
        questions: updatedOptions
      });
    }
  };

  const handleAddQuestion = () => {
    const newQuestionId = formData.questions.length + 1;
    const newQuestion = { id: newQuestionId, text: '', options: [{ id: 1, text: '' }] };
    setFormData(prevState => ({
      ...prevState,
      questions: [...prevState.questions, newQuestion]
    }));
  };

  const handleAddOption = (questionId) => {
    const question = formData.questions.find(q => q.id === questionId);
    if (question.options.length < 10) {
      const newOptionId = question.options.length + 1;
      const updatedQuestions = formData.questions.map(q => {
        if (q.id === questionId) {
          return { ...q, options: [...q.options, { id: newOptionId, text: '' }] };
        }
        return q;
      });
      setFormData({
        ...formData,
        questions: updatedQuestions
      });
    }
  };

  const handleRemoveOption = (questionId, optionId) => {
    const updatedQuestions = formData.questions.map(q => {
      if (q.id === questionId) {
        const updatedOptions = q.options.filter(option => option.id !== optionId);
        return { ...q, options: updatedOptions };
      }
      return q;
    });
    setFormData({
      ...formData,
      questions: updatedQuestions
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
    if (formData.eventName.trim() === '' || formData.questions.some(q => q.text.trim() === '' || q.options.some(option => option.text.trim() === '')) || formData.eventPw.trim() === '') {
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
        {formData.questions.map(question => (
          <div key={question.id} className="mb-4">
            <label className="block text-sm font-bold mb-2">{`Question ${question.id}:`}</label>
            <input
              type="text"
              value={question.text}
              onChange={(e) => handleChange(e, question.id)}
              name="text"
              placeholder="Enter question"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500 mb-2"
            />
            {question.options.map(option => (
              <div key={option.id} className="flex items-center mb-2">
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleChange(e, question.id, option.id)}
                  name="options"
                  placeholder={`Option ${option.id}`}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                />
                <button type="button" onClick={() => handleRemoveOption(question.id, option.id)} className="ml-2 bg-red-500 text-white py-1 px-2 rounded-md hover:bg-red-600">
                  -
                </button>
              </div>
            ))}
            {question.options.length < 10 && (
              <button type="button" onClick={() => handleAddOption(question.id)} className="bg-blue-500 text-white py-1 px-2 rounded-md hover:bg-blue-600">
                + Add Option
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={handleAddQuestion} className="bg-blue-500 text-white py-1 px-2 rounded-md hover:bg-blue-600">
          + Add Question
        </button>
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
