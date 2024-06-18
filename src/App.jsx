import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import Chart from './components/Chart';
import BatchInfo from './components/BatchInfo';
import BatchProgress from './components/BatchProgress';
import CheckBP from './components/Button';
import { createBatch, getBatches } from './apiService';
import CartPopup from './components/CartPopup'; // Ensure this is imported

const MainPage = ({ toggleCart, handleDeliverUpdate }) => {
  const totalWeightFor100Percent = 10;  // 10 kg corresponds to 100%
  const [todayWeight, setTodayWeight] = useState(parseFloat(sessionStorage.getItem('todayWeight')) || 0);  // Initial weight for today
  const [batches, setBatches] = useState([]); // Array to store batches
  const [centraID, setCentraID] = useState(1); // Example Centra ID
  const [error, setError] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    sessionStorage.setItem('todayWeight', todayWeight);
  }, [todayWeight]);

  const fetchBatches = async () => {
    const fetchedBatches = await getBatches(centraID);
    setBatches(fetchedBatches.map(batch => ({
      ...batch,
      currentStatus: batch.Status
    })));
  };

  useEffect(() => {
    fetchBatches();
  }, [centraID]);

  const percentage = (todayWeight / totalWeightFor100Percent) * 100;

  const addLeaves = (weight) => {
    setTodayWeight(todayWeight + weight);  // Update today's weight
  };

  const createNewBatch = async () => {
    if (percentage >= 100) {
      try {
        const newBatch = await createBatch(todayWeight, centraID);
        setBatches([...batches, newBatch]);
        setTodayWeight(0);  // Reset today's weight
        sessionStorage.setItem('todayWeight', 0); // Reset in sessionStorage
      } catch (error) {
        console.error('Error creating batch:', error);
      }
    } else {
      setError(true);
    }
  };

  const removeBatch = (batchId) => {
    setBatches(batches.filter(batch => batch.id !== batchId));
  };

  return (
    <main className="main-content">
      <div className="chart-section">
        <Chart centraID={centraID} />
      </div>
      <div className="dashboard">
        <div className="progress-section">
          <ProgressBar value={percentage} addLeaves={addLeaves} createBatch={createNewBatch} />
          <CheckBP />
          {error && <div style={{ color: 'red' }}>Weight must be 10 kg or more to create a batch.</div>}
        </div>
        <div className="batch-info-section">
          <BatchInfo batches={batches} />
        </div>
      </div>
      {isCartOpen && <CartPopup centraId={centraID} onClose={toggleCart} onDeliver={handleDeliverUpdate} />}
    </main>
  );
}

const App = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [batches, setBatches] = useState([]);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const handleDeliverUpdate = (deliveredBatchIds) => {
    const newBatches = batches.filter(batch => !deliveredBatchIds.includes(batch.Batch_ID));
    setBatches(newBatches);
  };

  return (
    <Router>
      <div className="App">
        <Header toggleCart={toggleCart} />
        <Routes>
          <Route path="/" element={<MainPage toggleCart={toggleCart} handleDeliverUpdate={handleDeliverUpdate} />} />
          <Route path="/batch-progress/*" element={<BatchProgress centraId={1} />} />
        </Routes>
        {isCartOpen && <CartPopup centraId={1} onClose={toggleCart} onDeliver={handleDeliverUpdate} />}
      </div>
    </Router>
  );
};

export default App;
