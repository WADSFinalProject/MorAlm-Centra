import React, { useState, useEffect } from 'react';
import './modal.css';
import daunImage from '../assets/daun.png';
import { getBatchById } from '../apiService'; // Import getBatchById from the apiService.js

const Modal = ({ isActive, onClose, onConfirm, headerContent, buttonLabel, step, batch }) => {
  const [weight, setWeight] = useState('');
  const [showProgress, setShowProgress] = useState(false);
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [finalWeight, setFinalWeight] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [inTime, setInTime] = useState(null);

  const handleInitialConfirm = () => {
    if (step === 1 || step === 2 || step === 3) {
      setShowProgress(true);
      const now = new Date();
      setInTime(now.toISOString()); // Set inTime when the process starts
      setTimeout(() => {
        setShowProgress(false);
        setShowWeightInput(true);
        // Immediately update the header content with the in-time value
        setHeaderContent(generateHeaderContent(step, { ...batch, inTime: now.toISOString() }));
      }, 2000); // simulate a delay for progress animation
    } else {
      setFinalWeight(weight);
      setShowConfirmation(true);
    }
  };

  const handleFinalConfirm = async () => {
    setFinalWeight(weight);
    setShowConfirmation(true); // Show confirmation
    await onConfirm(weight, inTime); // Complete the step with the inputted weight and inTime
    // Fetch the updated batch details
    const updatedBatch = await getBatchById(batch.id);
    // Update modal content with fetched details
    setHeaderContent(generateHeaderContent(step, updatedBatch));
  };

  const generateHeaderContent = (stepIndex, updatedBatch) => {
    let header = '';
    if (stepIndex === 1) {
      header = `Wet Leaves Weight: ${updatedBatch.WetWeight} kg\nIn Time Wet: ${new Date(updatedBatch.InTimeWet).toLocaleString()}\nOut Time Wet: ${new Date(updatedBatch.OutTimeWet).toLocaleString()}`;
    } else if (stepIndex === 2) {
      header = `Dry Leaves Weight: ${updatedBatch.DryWeight} kg\nIn Time Dry: ${new Date(updatedBatch.InTimeDry).toLocaleString()}\nOut Time Dry: ${new Date(updatedBatch.OutTimeDry).toLocaleString()}`;
    } else if (stepIndex === 3) {
      header = `Flour Leaves Weight: ${updatedBatch.PowderWeight} kg\nIn Time Powder: ${new Date(updatedBatch.InTimePowder).toLocaleString()}\nOut Time Powder: ${new Date(updatedBatch.OutTimePowder).toLocaleString()}`;
    }
    return header;
  };

  useEffect(() => {
    if (!isActive) {
      setWeight('');
      setShowProgress(false);
      setShowWeightInput(false);
      setFinalWeight(null);
      setShowConfirmation(false);
      setInTime(null);
    }
  }, [isActive]);

  useEffect(() => {
    console.log("Modal state changed: ", { showProgress, showWeightInput, finalWeight, showConfirmation });
  }, [showProgress, showWeightInput, finalWeight, showConfirmation]);

  if (!isActive) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {batch.steps[step].completed ? (
          <>
            {headerContent && <div className="modal-header" style={{ whiteSpace: 'pre-line' }}>{headerContent}</div>}
            <div className="modal-footer">
              <button onClick={onClose} className="close" style={{ margin: '0 auto' }}>CLOSE</button>
            </div>
          </>
        ) : (
          <>
            {!showProgress && !showWeightInput && finalWeight === null && !showConfirmation && (
              <>
                {headerContent && <div className="modal-header">{headerContent}</div>}
                <div className="modal-body">
                  <p>{step === 1 ? "Do you want to start the washing process?" : step === 2 ? "Do you want to start the drying process?" : "Do you want to start the flouring process?"}</p>
                </div>
                <div className="modal-footer">
                  <button onClick={onClose} className="close">CANCEL</button>
                  <button onClick={handleInitialConfirm} className="confirm-button">START</button>
                </div>
              </>
            )}
            {showProgress && (
              <div className="modal-body">
                <div className="loadingio-spinner-dual-ring-2by998twmg9">
                  <div className="ldio-yzaezf3dcml">
                    <div></div>
                    <div><div></div></div>
                  </div>
                </div>
                <img src={daunImage} alt="Loading" className="loading-image" />
                <p>{step === 1 ? "Wet leaves weight in progress......" : step === 2 ? "Dry leaves weight in progress......" : "Flour leaves weight in progress......"}</p>
              </div>
            )}
            {showWeightInput && finalWeight === null && !showConfirmation && (
              <>
                <div className="modal-header">{step === 1 ? "Enter the weight after wash" : step === 2 ? "Enter the weight after dry" : "Enter the weight after flouring"}</div>
                <div className="modal-body">
                  <div className="modal-field">
                    <label className="modal-label">{step === 1 ? "Weight after wash" : step === 2 ? "Weight after dry" : "Weight after flouring"}</label>
                    <input
                      type="number"
                      value={weight}
                      min={0}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="kg"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button onClick={onClose} className="close">CANCEL</button>
                  <button onClick={handleFinalConfirm} className="confirm-button">CONFIRM</button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Modal;
