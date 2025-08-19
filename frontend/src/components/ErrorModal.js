import React from 'react';
import '../custom-slotmodal.css'; // Reusing styles for consistency

const ErrorModal = ({ errorMessage, onClose }) => {
  return (
    <div className="slot-modal-overlay">
      <div className="slot-modal-card border-2 border-red-600">
        <button
          onClick={onClose}
          className="slot-modal-close"
        >
          &times;
        </button>
        <div className="flex flex-col items-center gap-1">
          <h3 className="text-2xl font-bold mb-2 text-red-600">Error!</h3>
          <p className="mb-4 text-base text-gray-700 text-center">
            {errorMessage.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < errorMessage.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
          <button
            onClick={onClose}
            className="slot-modal-btn"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;