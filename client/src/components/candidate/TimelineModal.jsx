import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import LoadingSpinner from '../common/LoadingSpinner';

const TimelineModal = ({ applicationId, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/applications/${applicationId}/history`);
        setHistory(res.data.history);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load timeline');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [applicationId]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Application Timeline</h3>
            <p className="text-xs text-slate-500">Chronological history of status updates</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold"
          >
            &times;
          </button>
        </div>

        {loading ? (
          <LoadingSpinner size="sm" text="Loading status history..." />
        ) : error ? (
          <p className="text-xs text-rose-600 text-center py-4">{error}</p>
        ) : history.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No status updates recorded yet.</p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {history.map((item, idx) => (
              <div key={item.id} className="relative">
                {/* Timeline node */}
                <span
                  className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                    idx === history.length - 1 ? 'bg-teal-600 ring-4 ring-teal-100' : 'bg-slate-300'
                  }`}
                />

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      {item.toStatus.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.changedAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 mt-1">
                    Updated by:{' '}
                    <span className="font-semibold text-slate-700">
                      {item.changedBy?.name} ({item.changedBy?.role})
                    </span>
                  </div>

                  {item.fromStatus !== 'NONE' && (
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Transitioned from {item.fromStatus.replace('_', ' ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-3 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimelineModal;
