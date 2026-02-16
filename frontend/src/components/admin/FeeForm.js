import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import PageHeader from '../common/PageHeader';
import Loader from '../common/Loader';
import feesService from '../../services/feesService';
import studentService from '../../services/studentService';
import { FEE_TYPES, PAYMENT_MODES } from '../../utils/constants';
import { generateAcademicYear, formatCurrency } from '../../utils/helpers';

const FeeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isPaymentMode = window.location.pathname.includes('/payment');
  const isEditMode = Boolean(id) && !isPaymentMode;

  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [feeDetails, setFeeDetails] = useState(null);
  const [initialValues, setInitialValues] = useState(
    isPaymentMode
      ? {
          amount: '',
          paymentMode: 'cash',
          transactionId: '',
          remarks: '',
        }
      : {
          student: '',
          academicYear: generateAcademicYear(),
          semester: 1,
          feeType: 'tuition',
          totalAmount: '',
          dueDate: '',
          discount: 0,
          remarks: '',
        }
  );

  const validationSchema = isPaymentMode
    ? Yup.object({
        amount: Yup.number()
          .min(1, 'Amount must be greater than 0')
          .required('Amount is required'),
        paymentMode: Yup.string().required('Payment mode is required'),
      })
    : Yup.object({
        student: Yup.string().required('Student is required'),
        academicYear: Yup.string().required('Academic year is required'),
        semester: Yup.number()
          .min(1, 'Must be at least 1')
          .max(8, 'Cannot exceed 8')
          .required('Semester is required'),
        feeType: Yup.string().required('Fee type is required'),
        totalAmount: Yup.number()
          .min(1, 'Amount must be greater than 0')
          .required('Total amount is required'),
        dueDate: Yup.date().required('Due date is required'),
        discount: Yup.number().min(0, 'Cannot be negative'),
      });

  useEffect(() => {
    if (!isPaymentMode) {
      fetchStudents();
    }
    if (id) {
      fetchFeeDetails();
    }
  }, [id]);

  const fetchStudents = async () => {
    try {
      const response = await studentService.getAllStudents({
        limit: 1000,
        status: 'active',
      });
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const fetchFeeDetails = async () => {
    try {
      setLoading(true);
      const response = await feesService.getAllFees({ _id: id });
      const fee = response.data[0];
      setFeeDetails(fee);

      if (!isPaymentMode) {
        const dueDate = fee.dueDate
          ? new Date(fee.dueDate).toISOString().split('T')[0]
          : '';

        setInitialValues({
          student: fee.student?._id || '',
          academicYear: fee.academicYear || '',
          semester: fee.semester || 1,
          feeType: fee.feeType || 'tuition',
          totalAmount: fee.totalAmount || '',
          dueDate,
          discount: fee.discount || 0,
          remarks: fee.remarks || '',
        });
      }
    } catch (error) {
      toast.error('Failed to fetch fee details');
      navigate('/fees');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isPaymentMode) {
        await feesService.addPayment(id, values);
        toast.success('Payment added successfully');
        navigate('/fees');
      } else if (isEditMode) {
        await feesService.updateFee(id, values);
        toast.success('Fee record updated successfully');
        navigate('/fees');
      } else {
        await feesService.createFee(values);
        toast.success('Fee record created successfully');
        navigate('/fees');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save fee record');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader message="Loading fee details..." />;
  }

  return (
    <div className="fee-form-container">
      <PageHeader
        title={
          isPaymentMode
            ? 'Add Payment'
            : isEditMode
            ? 'Edit Fee Record'
            : 'Add Fee Record'
        }
        subtitle={
          isPaymentMode
            ? 'Record a payment for fee'
            : isEditMode
            ? 'Update fee information'
            : 'Create a new fee record'
        }
      />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, values }) => (
          <Form>
            {isPaymentMode && feeDetails && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Fee Details</h3>
                </div>
                <div className="fee-details-summary">
                  <div className="summary-item">
                    <span>Student:</span>
                    <strong>
                      {feeDetails.student?.firstName} {feeDetails.student?.lastName}
                    </strong>
                  </div>
                  <div className="summary-item">
                    <span>Fee Type:</span>
                    <strong>{feeDetails.feeType}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Total Amount:</span>
                    <strong>{formatCurrency(feeDetails.totalAmount)}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Paid Amount:</span>
                    <strong className="text-success">
                      {formatCurrency(feeDetails.paidAmount)}
                    </strong>
                  </div>
                  <div className="summary-item">
                    <span>Due Amount:</span>
                    <strong className="text-danger">
                      {formatCurrency(feeDetails.dueAmount)}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  {isPaymentMode ? 'Payment Information' : 'Fee Information'}
                </h3>
              </div>
              <div className="form-grid">
                {!isPaymentMode && (
                  <>
                    <div className="form-group">
                      <label htmlFor="student" className="form-label">
                        Student *
                      </label>
                      <Field
                        as="select"
                        id="student"
                        name="student"
                        className="form-control"
                        disabled={isEditMode}
                      >
                        <option value="">Select Student</option>
                        {students.map((student) => (
                          <option key={student._id} value={student._id}>
                            {student.studentCode} - {student.firstName} {student.lastName}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="student" component="span" className="form-error" />
                    </div>

                    <div className="form-group">
                      <label htmlFor="academicYear" className="form-label">
                        Academic Year *
                      </label>
                      <Field
                        type="text"
                        id="academicYear"
                        name="academicYear"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="academicYear"
                        component="span"
                        className="form-error"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="semester" className="form-label">
                        Semester *
                      </label>
                      <Field
                        type="number"
                        id="semester"
                        name="semester"
                        min="1"
                        max="8"
                        className="form-control"
                      />
                      <ErrorMessage name="semester" component="span" className="form-error" />
                    </div>

                    <div className="form-group">
                      <label htmlFor="feeType" className="form-label">
                        Fee Type *
                      </label>
                      <Field
                        as="select"
                        id="feeType"
                        name="feeType"
                        className="form-control"
                      >
                        {FEE_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="feeType" component="span" className="form-error" />
                    </div>

                    <div className="form-group">
                      <label htmlFor="totalAmount" className="form-label">
                        Total Amount *
                      </label>
                      <Field
                        type="number"
                        id="totalAmount"
                        name="totalAmount"
                        min="0"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="totalAmount"
                        component="span"
                        className="form-error"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="dueDate" className="form-label">
                        Due Date *
                      </label>
                      <Field
                        type="date"
                        id="dueDate"
                        name="dueDate"
                        className="form-control"
                      />
                      <ErrorMessage name="dueDate" component="span" className="form-error" />
                    </div>

                    <div className="form-group">
                      <label htmlFor="discount" className="form-label">
                        Discount
                      </label>
                      <Field
                        type="number"
                        id="discount"
                        name="discount"
                        min="0"
                        className="form-control"
                      />
                      <ErrorMessage name="discount" component="span" className="form-error" />
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="remarks" className="form-label">
                        Remarks
                      </label>
                      <Field
                        as="textarea"
                        id="remarks"
                        name="remarks"
                        className="form-control"
                        rows="3"
                      />
                    </div>
                  </>
                )}

                {isPaymentMode && (
                  <>
                    <div className="form-group">
                      <label htmlFor="amount" className="form-label">
                        Payment Amount *
                      </label>
                      <Field
                        type="number"
                        id="amount"
                        name="amount"
                        min="0"
                        max={feeDetails?.dueAmount}
                        className="form-control"
                      />
                      <ErrorMessage name="amount" component="span" className="form-error" />
                      <small className="form-hint">
                        Maximum: {formatCurrency(feeDetails?.dueAmount || 0)}
                      </small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="paymentMode" className="form-label">
                        Payment Mode *
                      </label>
                      <Field
                        as="select"
                        id="paymentMode"
                        name="paymentMode"
                        className="form-control"
                      >
                        {PAYMENT_MODES.map((mode) => (
                          <option key={mode.value} value={mode.value}>
                            {mode.label}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="paymentMode"
                        component="span"
                        className="form-error"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="transactionId" className="form-label">
                        Transaction ID
                      </label>
                      <Field
                        type="text"
                        id="transactionId"
                        name="transactionId"
                        className="form-control"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="remarks" className="form-label">
                        Remarks
                      </label>
                      <Field
                        as="textarea"
                        id="remarks"
                        name="remarks"
                        className="form-control"
                        rows="3"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/fees')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="spinner spinner-small"></span>
                    {isPaymentMode ? 'Processing...' : isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : isPaymentMode ? (
                  'Add Payment'
                ) : isEditMode ? (
                  'Update Fee'
                ) : (
                  'Create Fee'
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default FeeForm;