import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { getBatches } from '../apiService'; // Make sure to import your API service

const Chart = ({ centraID }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const batches = await getBatches(centraID);
        // Get the last 7 batches
        const recentBatches = batches.slice(-7);
        const formattedData = recentBatches.map(batch => ({
          date: new Date(batch.InTimeRaw).toLocaleDateString(),
          weight: batch.RawWeight
        }));

        // Sort data by date ascending
        formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));

        setData(formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [centraID]);

  const styles = {
    chartContainer: {
      width: '90%',
      height: '300px',
      margin: '0 auto',
      paddingBottom: '45px',
    },
    chartTitle: {
      textAlign: 'center',
      marginBottom: '20px',
      fontFamily: 'DM Sans, sans-serif',
      fontSize: '20px',
      fontWeight: '100',
    },
    pageTitle: {
      textAlign: 'left',
      marginTop: '20px',
      fontFamily: 'DM Sans, sans-serif',
      fontSize: '35px',
      fontWeight: '100',
    },
    yAxisLabel: {
      textAnchor: 'middle',
      fontFamily: 'DM Sans, sans-serif',
      fontWeight: 'bold'
    },
  };

  return (
    <div style={styles.chartContainer}>
      <h2 style={styles.pageTitle}>Centra {centraID}</h2>
      <h3 style={styles.chartTitle}>Weekly Raw Leaves Weight (Kg)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 13, right: 30, left: 40, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" label={{ position: 'insideBottom', style: styles.yAxisLabel }} />
          <YAxis label={{ position: 'insideLeft', style: styles.yAxisLabel }} />
          <Tooltip />
          <Line type="monotone" dataKey="weight" stroke="#467E18" strokeWidth={3} activeDot={{ r: 8, strokeWidth: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
