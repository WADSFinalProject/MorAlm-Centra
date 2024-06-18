import React, { useState, useEffect, useRef } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import './batchprogress.css';
import Modal from './Modal';
import BackButton from '../assets/backbutton3.png';
import ThreeDots from '../assets/dots1.png'; // Import the three dots icon
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@material-ui/core';
import { getBatches, updateBatchWeightAndStatus, deleteBatch as deleteBatchAPI, getBatchById } from '../apiService';

function createSteps(batch) {
    return [
        { step: 'Gather Leaves', completed: true, details: { weight: batch.RawWeight, inTime: batch.InTimeRaw, outTime: null } },
        { step: 'Wet Leaves', completed: batch.WetWeight !== null, details: { weight: batch.WetWeight, inTime: batch.InTimeWet, outTime: batch.OutTimeWet } },
        { step: 'Dry Leaves', completed: batch.DryWeight !== null, details: { weight: batch.DryWeight, inTime: batch.InTimeDry, outTime: batch.OutTimeDry } },
        { step: 'Flour Leaves', completed: batch.PowderWeight !== null, details: { weight: batch.PowderWeight, inTime: batch.InTimePowder, outTime: batch.OutTimePowder } }
    ];
}

function BatchProgress({ centraId, handleDeliverUpdate }) {
    const [localBatches, setLocalBatches] = useState([]);
    const [modalActive, setModalActive] = useState(false);
    const [onConfirm, setOnConfirm] = useState(() => {});
    const [headerContent, setHeaderContent] = useState('');
    const [buttonLabel, setButtonLabel] = useState('Confirm');
    const [modalStep, setModalStep] = useState(null);
    const [modalBatch, setModalBatch] = useState(null);
    const [errorOpen, setErrorOpen] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchBatches = async () => {
        const response = await getBatches(centraId);
        const formattedBatches = response
            .filter(batch => batch.Status !== 'Pending')
            .map(batch => ({
                id: batch.Batch_ID,
                steps: createSteps(batch),
                currentStatus: batch.Status // Add current status to the batch
            }));
        setLocalBatches(formattedBatches);
    };

    useEffect(() => {
        fetchBatches();
    }, [centraId]);

    useEffect(() => {
        handleDeliverUpdate && handleDeliverUpdate(localBatches.map(batch => batch.id));
    }, [localBatches, handleDeliverUpdate]);

    const handleStepClick = (batchId, stepIndex, step) => {
        const batch = localBatches.find(b => b.id === batchId);
        let header = '';

        if (step.completed) {
            if (stepIndex === 0) {
                const inTimeRaw = new Date(step.details.inTime).toLocaleString();
                header = `Gather Leaves Weight: ${step.details.weight} kg\nIn Time Raw: ${inTimeRaw}`;
            } else if (stepIndex === 1) {
                header = `Wet Leaves Weight: ${step.details.weight} kg\nIn Time Wet: ${new Date(step.details.inTime).toLocaleString()}\nOut Time Wet: ${new Date(step.details.outTime).toLocaleString()}`;
            } else if (stepIndex === 2) {
                header = `Dry Leaves Weight: ${step.details.weight} kg\nIn Time Dry: ${new Date(step.details.inTime).toLocaleString()}\nOut Time Dry: ${new Date(step.details.outTime).toLocaleString()}`;
            } else if (stepIndex === 3) {
                header = `Flour Leaves Weight: ${step.details.weight} kg\nIn Time Powder: ${new Date(step.details.inTime).toLocaleString()}\nOut Time Powder: ${new Date(step.details.outTime).toLocaleString()}`;
            }
            setHeaderContent(header);
            setModalActive(true);
            setButtonLabel('Close');
            setModalStep(stepIndex);
            setModalBatch(batch);
            setOnConfirm(() => () => setModalActive(false)); // Close the modal when 'Close' is clicked
        } else {
            if (stepIndex > 0 && !localBatches.find(b => b.id === batchId).steps[stepIndex - 1].completed) {
                setErrorOpen(true);
                return;
            }
            if (stepIndex === 1) {
                header = 'Wet Leaves';
                setButtonLabel('Start');
            } else if (stepIndex === 2) {
                header = 'Dry Leaves';
                setButtonLabel('Start');
            } else if (stepIndex === 3) {
                header = 'Flour / Powder Record';
                setButtonLabel('Start');
            }
            setHeaderContent(header);
            setOnConfirm(() => async (data, inTime) => await completeStep(batchId, stepIndex, parseFloat(data), inTime));
            setModalActive(true);
            setModalStep(stepIndex);
            setModalBatch(batch);
        }
    };

    const completeStep = async (batchId, stepIndex, weight, inTime) => {
        const stepNames = ['Gather Leaves', 'Wet Leaves', 'Dry Leaves', 'Flour Leaves'];
        const step = stepNames[stepIndex];

        // Update the batch with in_time immediately
        const updatedBatch = await updateBatchWeightAndStatus(batchId, step, weight, inTime);

        // Fetch the updated batch details
        const updatedBatchDetails = await getBatchById(batchId);

        // Update the state with the new details
        const newBatches = localBatches.map(batch => 
            batch.id === batchId 
            ? {
                ...batch,
                steps: createSteps(updatedBatchDetails),
                currentStatus: updatedBatchDetails.Status
            } 
            : batch
        );
        
        setLocalBatches(newBatches);

        setModalActive(false);
    };

    const handleErrorClose = () => {
        setErrorOpen(false);
    };

    const toggleDropdown = (batchId) => {
        setDropdownVisible(dropdownVisible === batchId ? null : batchId);
    };

    const handleDelete = async (batchId) => {
        await deleteBatchAPI(batchId);
        const newBatches = localBatches.filter(batch => batch.id !== batchId);
        setLocalBatches(newBatches);
        setDropdownVisible(null);
    };

    const confirmDelete = async () => {
        await handleDelete(modalBatch.Batch_ID);
        setModalActive(false);
        setModalBatch(null);
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setDropdownVisible(null);
        }
    };

    useEffect(() => {
        if (dropdownVisible !== null) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownVisible]);

    const getStatusStep = (status) => {
        switch (status) {
            case 'Gather Leaves':
                return 1;
            case 'Wet Leaves':
                return 2;
            case 'Dry Leaves':
                return 3;
            case 'Flour Leaves':
                return 4;
            default:
                return 0;
        }
    };

    const handleBackClick = () => {
        navigate('/');
    };

    return (
        <div className="container">
            <button className="back-button" onClick={handleBackClick}>
                <img src={BackButton} alt="BackButton" className="BackButton" />
            </button>
            <div className="content">
                <h2 className="BP-title">Current Batch Progress of Centra {centraId}</h2>
                <Routes>
                    <Route path="/" element={
                        localBatches.length === 0 ? (
                            <p>No batches created yet.</p>
                        ) : (
                            localBatches.map(batch => (
                                <div key={batch.id} className="batch-row">
                                    <div className="batch-title">
                                        <div className="batch-name">{`Batch ${batch.id}`}</div>
                                        <div className="three-dots" onClick={() => toggleDropdown(batch.id)}>
                                            <img src={ThreeDots} alt="Three Dots" />
                                            {dropdownVisible === batch.id && (
                                                <div className="dropdown" ref={dropdownRef}>
                                                    <div className="dropdown-item" onClick={() => handleDelete(batch.id)}>Delete Batch</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="batch-content">
                                        {batch.steps.map((step, index) => (
                                            <div key={index} className={`step-container ${getStatusStep(batch.currentStatus) >= (index + 1) ? 'completed' : ''}`}
                                                onClick={() => handleStepClick(batch.id, index, step)}>
                                                <div className="step-circle">{index + 1}</div>
                                                <div className="step-name">{step.step}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )
                    } />
                </Routes>
            </div>
            <Modal
                isActive={modalActive}
                onClose={() => setModalActive(false)}
                onConfirm={onConfirm}
                headerContent={headerContent}
                buttonLabel={buttonLabel}
                step={modalStep}
                batch={modalBatch}
            />
            <Dialog open={errorOpen} onClose={handleErrorClose}>
                <DialogTitle>Error</DialogTitle>
                <DialogContent
                    style={{
                        width: '400px'
                    }}>
                    <p>Please complete the previous steps first.</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleErrorClose} color="primary" variant="contained">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default BatchProgress;
