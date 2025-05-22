import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center space-x-2 text-light hover:text-accent transition-colors duration-200"
    >
      <FaArrowLeft className="text-lg" />
      <span>Back</span>
    </button>
  );
};

export default BackButton;
