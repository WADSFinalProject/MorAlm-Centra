import React, { useEffect, useState } from 'react';
import './cartPopup.css';
import ConfirmationDialog from './ConfirmationDialog';
import { getCompletedBatches, createPackage } from '../apiService';

const CartPopup = ({ onClose, centraId, onDeliver }) => {
  const [batches, setBatches] = useState([]);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  useEffect(() => {
    async function fetchBatches() {
      try {
        const completedBatches = await getCompletedBatches();
        const filteredBatches = completedBatches.filter(batch => batch.Centra_ID === Number(centraId));
        setBatches(filteredBatches);
      } catch (error) {
        console.error('Error fetching batches:', error);
      }
    }
    fetchBatches();
  }, [centraId]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedBatches(batches.map(batch => batch.Batch_ID));
    } else {
      setSelectedBatches([]);
    }
  };

  const handleSelectBatch = (batchId) => {
    setSelectedBatches(prevSelected =>
      prevSelected.includes(batchId)
        ? prevSelected.filter(id => id !== batchId)
        : [...prevSelected, batchId]
    );
  };

  const calculateETA = (expedition) => {
    const currentDate = new Date();
    let etaDate = new Date(currentDate);
    if (expedition === 'Expedition 1') {
      etaDate.setDate(currentDate.getDate() + 5);
    } else if (expedition === 'Expedition 2') {
      etaDate.setDate(currentDate.getDate() + 10);
    } else if (expedition === 'Expedition 3') {
      etaDate.setDate(currentDate.getDate() + 15);
    }
    return etaDate.toLocaleDateString();
  };

  const handleExpeditionChange = (e, batchId) => {
    const newExpedition = e.target.value;
    const newBatches = batches.map(batch => {
      if (batch.Batch_ID === batchId) {
        return {
          ...batch,
          selectedExpedition: newExpedition,
          eta: calculateETA(newExpedition)
        };
      }
      return batch;
    });
    setBatches(newBatches);
  };

  const handleDeliverClick = () => {
    setIsConfirmationOpen(true);
  };

  const handleConfirmDeliver = async () => {
    const selectedExpedition = batches.find(batch => selectedBatches.includes(batch.Batch_ID))?.selectedExpedition;
    const expeditionType = selectedExpedition || 'Expedition 1';
    const now = new Date().toISOString();
    const packageData = {
      batchIds: selectedBatches,
      centra_id: Number(centraId),
      expeditionType: expeditionType,
      inDeliveryTime: now,
      outDeliveryTime: null,
      status: 'Pending'
    };

    try {
      const newPackage = await createPackage(packageData);
      setIsConfirmationOpen(false);
      setSelectedBatches([]);
      onDeliver(selectedBatches); // Notify parent component of delivery
      onClose();
    } catch (error) {
      console.error('Error creating package:', error);
    }
  };

  const handleCloseConfirmation = () => {
    setIsConfirmationOpen(false);
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="cart-popup-overlay" onClick={onClose}>
      <div className="cart-popup" onClick={e => e.stopPropagation()}>
        <div className="cart-popup-header">
          <h2>Deliver to MorAlm</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="cart-popup-table-container">
          <table className="cart-popup-table">
            <thead>
              <tr>
                <th className="select-column">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedBatches.length === batches.length}
                  />
                </th>
                <th>Batch ID</th>
                <th>Weight</th>
                <th className="expedition-column">Expedition</th>
                <th className="eta-column">ETA</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch.Batch_ID}>
                  <td className="select-column">
                    <input
                      type="checkbox"
                      checked={selectedBatches.includes(batch.Batch_ID)}
                      onChange={() => handleSelectBatch(batch.Batch_ID)}
                    />
                  </td>
                  <td>{batch.Batch_ID}</td>
                  <td>{batch.PowderWeight} KG</td>
                  <td>
                    <select className="expedition-select" value={batch.selectedExpedition || 'Expedition 1'} onChange={(e) => handleExpeditionChange(e, batch.Batch_ID)}>
                      <option>Expedition 1</option>
                      <option>Expedition 2</option>
                      <option>Expedition 3</option>
                    </select>
                  </td>
                  <td>{batch.eta || calculateETA('Expedition 1')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          className="deliver-selected-button"
          onClick={handleDeliverClick}
          disabled={selectedBatches.length === 0}
        >
          Deliver
        </button>
      </div>
      {isConfirmationOpen && (
        <ConfirmationDialog
          title="Confirm Delivery"
          message={`Are you sure you want to deliver ${selectedBatches.length > 1 ? 'these batches' : 'this batch'}?`}
          onCancel={handleCloseConfirmation}
          onConfirm={handleConfirmDeliver}
        />
      )}
    </div>
  );
};

export default CartPopup;
