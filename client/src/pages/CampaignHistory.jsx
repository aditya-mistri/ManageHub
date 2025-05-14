import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CampaignHistory = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [insightMap, setInsightMap] = useState({});
  const [loadingInsightId, setLoadingInsightId] = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get('/api/campaigns');
        setCampaigns(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError('Failed to load campaigns. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const formatDate = (dateStr) => {
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateStr).toLocaleDateString(undefined, options);
    } catch {
      return 'N/A';
    }
  };

  const getStatusBadge = (status) => {
    const base = 'px-2 py-1 text-xs font-semibold rounded-full';
    switch (status) {
      case 'pending': return `${base} bg-yellow-200 text-yellow-800`;
      case 'sent': return `${base} bg-green-200 text-green-800`;
      case 'failed': return `${base} bg-red-200 text-red-800`;
      default: return `${base} bg-gray-300 text-gray-800`;
    }
  };

  const fetchInsight = async (campaignId) => {
    setLoadingInsightId(campaignId);
    try {
      console.log('Fetching insight for campaign:', campaignId);
      const response = await axios.post(`/api/campaigns/${campaignId}/insight`);
      setInsightMap(prev => ({ ...prev, [campaignId]: response.data.insight }));
    } catch (err) {
      console.error('Error fetching insight:', err);
      setInsightMap(prev => ({ ...prev, [campaignId]: 'Failed to generate insight.' }));
    } finally {
      setLoadingInsightId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-10 text-white bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-xl text-blue-400">Loading campaigns...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-10 text-white bg-gray-900 min-h-screen">
        <div className="bg-red-700 text-white p-4 rounded-md mb-6">{error}</div>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 text-white bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-blue-400">Campaign History</h1>

      {campaigns.length === 0 ? (
        <div className="bg-gray-800 p-6 rounded-md text-center text-gray-400">
          No campaigns found. Create your first campaign to get started.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Name</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Insight</th>
                {/* <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Status</th> */}
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Audience</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Sent</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Failed</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {campaigns.map((c) => (
                <React.Fragment key={c._id}>
                  <tr className="hover:bg-gray-750">
                    <td className="px-4 py-3 text-sm font-medium text-white">{c.name || 'Untitled'}</td>
                    <td className="px-4 py-3 text-center text-sm">
                      <button
                        className="text-blue-400 hover:underline"
                        onClick={() => fetchInsight(c._id)}
                        disabled={loadingInsightId === c._id}
                      >
                        {loadingInsightId === c._id ? 'Loading...' : 'View Insight'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-300">{c.stats?.audienceSize ?? 0}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-300">{c.stats?.sent ?? 0}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-300">{c.stats?.failed ?? 0}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-300">{formatDate(c.createdAt)}</td>
                  </tr>
                  {insightMap[c._id] && (
                    <tr className="bg-gray-750">
                      <td colSpan="7" className="px-4 py-3 text-sm text-blue-200 italic">
                        <span className="text-blue-500">AI Insight:</span> {insightMap[c._id]}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CampaignHistory;
