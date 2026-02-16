import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaMoneyBillWave, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import feesService from '../../services/feesService';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/helpers';

const ViewFees = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [feesData, setFeesData] = useState(null);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      if (!user?.studentId) {
        toast.error('Student profile not found');
        return;
      }

      const response = await feesService.getFeesByStudent(user.studentId);
      setFeesData(response.data);
    } catch (error) {
      toast.error('Failed to fetch fees');
      console.error('Fetch fees error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Loading your fees..." />;
  }

  const fees = feesData?.fees || [];
  const summary = feesData?.summary || {
    totalAmount: 0,
    paidAmount: 0,
    dueAmount: 0,
  };

  return (
    <div className="view-fees">
      <PageHeader title="My Fees" subtitle="View your fee details and payment history" />

      {/* Fee Summary */}
      {fees.length > 0 && (
        <div className="card fee-summary-card">
          <div className="card-header">
            <h3 className="card-title">
              <FaMoneyBillWave /> Fee Summary
            </h3>
          </div>
          <div className="fee-summary-grid">
            <div className="summary-card">
              <div className="summary-icon">
                <FaMoneyBillWave />
              </div>
              <div className="summary-info">
                <span className="summary-label">Total Amount</span>
                <span className="summary-value">{formatCurrency(summary.totalAmount)}</span>
              </div>
            </div>

            <div className="summary-card success">
              <div className="summary-icon">
                <FaCheckCircle />
              </div>
              <div className="summary-info">
                <span className="summary-label">Paid Amount</span>
                <span className="summary-value">{formatCurrency(summary.paidAmount)}</span>
              </div>
            </div>

            <div className="summary-card danger">
              <div className="summary-icon">
                <FaExclamationCircle />
              </div>
              <div className="summary-info">
                <span className="summary-label">Due Amount</span>
                <span className="summary-value">{formatCurrency(summary.dueAmount)}</span>
              </div>
            </div>
          </div>

          <div className="payment-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${
                    summary.totalAmount > 0
                      ? (summary.paidAmount / summary.totalAmount) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
            <span className="progress-label">
              {summary.totalAmount > 0
                ? ((summary.paidAmount / summary.totalAmount) * 100).toFixed(1)
                : 0}
              % Paid
            </span>
          </div>
        </div>
      )}

      {/* Fee Details */}
      {fees.length > 0 ? (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Fee Details</h3>
          </div>
          <div className="fees-list">
            {fees.map((fee) => (
              <div key={fee._id} className="fee-item-card">
                <div className="fee-item-header">
                  <div>
                    <h4 className="fee-title">
                      {fee.feeType.charAt(0).toUpperCase() + fee.feeType.slice(1)} Fee
                    </h4>
                    <p className="fee-meta">
                      {fee.academicYear} - Semester {fee.semester}
                    </p>
                  </div>
                  <span className={`badge ${getStatusBadgeClass(fee.status)}`}>
                    {fee.status}
                  </span>
                </div>

                <div className="fee-item-body">
                  <div className="fee-amounts">
                    <div className="amount-item">
                      <span>Total Amount:</span>
                      <strong>{formatCurrency(fee.totalAmount)}</strong>
                    </div>
                    <div className="amount-item success">
                      <span>Paid Amount:</span>
                      <strong>{formatCurrency(fee.paidAmount)}</strong>
                    </div>
                    <div className="amount-item danger">
                      <span>Due Amount:</span>
                      <strong>{formatCurrency(fee.dueAmount)}</strong>
                    </div>
                    {fee.discount > 0 && (
                      <div className="amount-item info">
                        <span>Discount:</span>
                        <strong>{formatCurrency(fee.discount)}</strong>
                      </div>
                    )}
                  </div>

                  <div className="fee-dates">
                    <div className="date-item">
                      <span>Due Date:</span>
                      <strong>{formatDate(fee.dueDate)}</strong>
                    </div>
                  </div>

                  {/* Payment History */}
                  {fee.paymentHistory && fee.paymentHistory.length > 0 && (
                    <div className="payment-history">
                      <h5>Payment History</h5>
                      <div className="payment-list">
                        {fee.paymentHistory.map((payment, index) => (
                          <div key={index} className="payment-record">
                            <div className="payment-info">
                              <span className="payment-date">
                                {formatDate(payment.paymentDate)}
                              </span>
                              <span className="payment-mode badge badge-info">
                                {payment.paymentMode}
                              </span>
                            </div>
                            <strong className="payment-amount">
                              {formatCurrency(payment.amount)}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={FaMoneyBillWave}
          title="No Fee Records"
          message="You don't have any fee records yet."
        />
      )}
    </div>
  );
};

export default ViewFees;