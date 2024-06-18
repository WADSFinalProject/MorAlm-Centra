import React from 'react';
import { Paper, Typography } from '@material-ui/core';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import '../App.css';

const BatchInfo = ({ batches }) => {
  // Filter out batches with status 'Pending'
  const activeBatches = batches?.filter(batch => batch.currentStatus !== 'Pending') || [];
  const totalBatches = activeBatches.length;

  const countBatchesInStep = (stepName) => {
    return activeBatches.filter(batch => batch.currentStatus === stepName).length;
  };

  const wetLeavesBatches = countBatchesInStep('Wet Leaves');
  const dryLeavesBatches = countBatchesInStep('Dry Leaves');
  const powderLeavesBatches = countBatchesInStep('Flour Leaves');

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px', backgroundColor: '#CEDDC2', borderRadius: '16px'}}>
      <Paper style={{ padding: '10px', backgroundColor: '#F5F5F5', borderRadius: '16px', margin: '0 10px', width: '30%', textAlign: 'center', border: '2px solid #467e18' }}>
        <Typography variant="h6" style={{fontWeight: '100', marginBottom: '10px', color: 'black'}}>
          Wet Leaves Progress
        </Typography>
        <div style={{ width: '80%', margin: '0 auto' }}>
          <CircularProgressbar 
            value={(totalBatches === 0 ? 0 : (wetLeavesBatches / totalBatches) * 100)} 
            text={`${wetLeavesBatches}/${totalBatches}`} 
            styles={buildStyles({
              pathColor: '#467e18',
              textColor: '#467e18',
              trailColor: '#d6d6d6',
            })}
          />
        </div>
      </Paper>
      <Paper style={{ padding: '10px', backgroundColor: '#F5F5F5', borderRadius: '16px', margin: '0 10px', width: '30%', textAlign: 'center', border: '2px solid #467e18' }}>
        <Typography variant="h6" style={{fontWeight: '100', marginBottom: '10px', color: 'black'}}>
          Dry Leaves Progress
        </Typography>
        <div style={{ width: '80%', margin: '0 auto' }}>
          <CircularProgressbar 
            value={(totalBatches === 0 ? 0 : (dryLeavesBatches / totalBatches) * 100)} 
            text={`${dryLeavesBatches}/${totalBatches}`} 
            styles={buildStyles({
              pathColor: '#467e18',
              textColor: '#467e18',
              trailColor: '#d6d6d6',
            })}
          />
        </div>
      </Paper>
      <Paper style={{ padding: '10px', backgroundColor: '#F5F5F5', borderRadius: '16px', margin: '0 10px', width: '30%', textAlign: 'center', border: '2px solid #467e18' }}>
        <Typography variant="h6" style={{fontWeight: '100', marginBottom: '10px', color: 'black'}}>
          Powder Leaves Progress
        </Typography>
        <div style={{ width: '80%', margin: '0 auto' }}>
          <CircularProgressbar 
            value={(totalBatches === 0 ? 0 : (powderLeavesBatches / totalBatches) * 100)} 
            text={`${powderLeavesBatches}/${totalBatches}`} 
            styles={buildStyles({
              pathColor: '#467e18',
              textColor: '#467e18',
              trailColor: '#d6d6d6',
            })}
          />
        </div>
      </Paper>
    </div>
  );
};

export default BatchInfo;
