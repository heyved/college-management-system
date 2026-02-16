import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import PageHeader from '../common/PageHeader';
import Loader from '../common/Loader';
import studentService from '../../services/studentService';
import {
  DEPARTMENTS,
  GENDERS,
  BLOOD_GROUPS,
  GUARDIAN_RELATIONS,
  STUDENT_STATUS,
} from '../../utils/constants';
import { FaCopy, FaCheck } from 'react-icons/fa';
import './StudentForm.css';

const StudentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  const [initialValues, setInitialValues] = useState({
    email: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    contactNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
    },
    guardianName: '',
    guardianContact: '',
    guardianRelation: '',
    department: '',
    currentSemester: 1,
    admissionYear: new Date().getFullYear(),
    bloodGroup: '',
    status: 'active',
  });

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    firstName: Yup.string()
      .min(2, 'Must be at least 2 characters')
      .required('First name is required'),
    lastName: Yup.string()
      .min(2, 'Must be at least 2 characters')
      .required('Last name is required'),
    dateOfBirth: Yup.date()
      .max(new Date(), 'Date of birth cannot be in the future')
      .required('Date of birth is required'),
    gender: Yup.string().required('Gender is required'),
    contactNumber: Yup.string()
      .matches(/^[0-9]{10}$/, 'Must be exactly 10 digits')
      .required('Contact number is required'),
    guardianName: Yup.string().required('Guardian name is required'),
    guardianContact: Yup.string()
      .matches(/^[0-9]{10}$/, 'Must be exactly 10 digits')
      .required('Guardian contact is required'),
    guardianRelation: Yup.string().required('Guardian relation is required'),
    department: Yup.string().required('Department is required'),
    currentSemester: Yup.number()
      .min(1, 'Must be at least 1')
      .max(8, 'Cannot exceed 8')
      .required('Current semester is required'),
    admissionYear: Yup.number()
      .min(1900, 'Invalid year')
      .max(new Date().getFullYear() + 1, 'Invalid year')
      .required('Admission year is required'),
  });

  useEffect(() => {
    if (isEditMode) {
      fetchStudent();
    }
  }, [id]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await studentService.getStudentById(id);
      const student = response.data;

      const dateOfBirth = student.dateOfBirth
        ? new Date(student.dateOfBirth).toISOString().split('T')[0]
        : '';

      setInitialValues({
        email: student.userId?.email || '',
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        dateOfBirth,
        gender: student.gender || '',
        contactNumber: student.contactNumber || '',
        address: student.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India',
        },
        guardianName: student.guardianName || '',
        guardianContact: student.guardianContact || '',
        guardianRelation: student.guardianRelation || '',
        department: student.department || '',
        currentSemester: student.currentSemester || 1,
        admissionYear: student.admissionYear || new Date().getFullYear(),
        bloodGroup: student.bloodGroup || '',
        status: student.status || 'active',
      });
    } catch (error) {
      toast.error('Failed to fetch student details');
      navigate('/students');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        await studentService.updateStudent(id, values);
        toast.success('Student updated successfully');
        navigate('/students');
      } else {
        const response = await studentService.createStudent(values);
        
        // Check if credentials were returned
        if (response.data.credentials) {
          setCredentials(response.data.credentials);
          setShowCredentials(true);
        } else {
          toast.success('Student created successfully');
          navigate('/students');
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    const text = `Email: ${credentials.email}\nPassword: ${credentials.temporaryPassword}\n\n${credentials.message}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Credentials copied to clipboard');
  };

  const closeCredentialsModal = () => {
    setShowCredentials(false);
    setCredentials(null);
    navigate('/students');
  };

  if (loading) {
    return <Loader message="Loading student details..." />;
  }

  return (
    <div className="student-form-container">
      <PageHeader
        title={isEditMode ? 'Edit Student' : 'Add New Student'}
        subtitle={isEditMode ? 'Update student information' : 'Create a new student record'}
      />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Personal Information</h3>
              </div>
              <div className="form-grid">
                {!isEditMode && (
                  <div className="form-group full-width">
                    <label htmlFor="email" className="form-label">
                      Email Address *
                    </label>
                    <Field
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      placeholder="student@example.com"
                    />
                    <ErrorMessage name="email" component="span" className="form-error" />
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">
                    First Name *
                  </label>
                  <Field
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="form-control"
                  />
                  <ErrorMessage name="firstName" component="span" className="form-error" />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">
                    Last Name *
                  </label>
                  <Field
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="form-control"
                  />
                  <ErrorMessage name="lastName" component="span" className="form-error" />
                </div>

                <div className="form-group">
                  <label htmlFor="dateOfBirth" className="form-label">
                    Date of Birth *
                  </label>
                  <Field
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="dateOfBirth"
                    component="span"
                    className="form-error"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="gender" className="form-label">
                    Gender *
                  </label>
                  <Field as="select" id="gender" name="gender" className="form-control">
                    <option value="">Select Gender</option>
                    {GENDERS.map((gender) => (
                      <option key={gender.value} value={gender.value}>
                        {gender.label}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="gender" component="span" className="form-error" />
                </div>

                <div className="form-group">
                  <label htmlFor="contactNumber" className="form-label">
                    Contact Number *
                  </label>
                  <Field
                    type="text"
                    id="contactNumber"
                    name="contactNumber"
                    className="form-control"
                    placeholder="10-digit number"
                  />
                  <ErrorMessage
                    name="contactNumber"
                    component="span"
                    className="form-error"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bloodGroup" className="form-label">
                    Blood Group *
                  </label>
                  <Field as="select" id="bloodGroup" name="bloodGroup" className="form-control">
                    <option value="">Select Blood Group</option>
                    {BLOOD_GROUPS.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </Field>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Address</h3>
              </div>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="address.street" className="form-label">
                    Street Address
                  </label>
                  <Field
                    type="text"
                    id="address.street"
                    name="address.street"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address.city" className="form-label">
                    City
                  </label>
                  <Field
                    type="text"
                    id="address.city"
                    name="address.city"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address.state" className="form-label">
                    State
                  </label>
                  <Field
                    type="text"
                    id="address.state"
                    name="address.state"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address.zipCode" className="form-label">
                    Zip Code
                  </label>
                  <Field
                    type="text"
                    id="address.zipCode"
                    name="address.zipCode"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address.country" className="form-label">
                    Country
                  </label>
                  <Field
                    type="text"
                    id="address.country"
                    name="address.country"
                    className="form-control"
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Guardian Information</h3>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="guardianName" className="form-label">
                    Guardian Name *
                  </label>
                  <Field
                    type="text"
                    id="guardianName"
                    name="guardianName"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="guardianName"
                    component="span"
                    className="form-error"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="guardianContact" className="form-label">
                    Guardian Contact *
                  </label>
                  <Field
                    type="text"
                    id="guardianContact"
                    name="guardianContact"
                    className="form-control"
                    placeholder="10-digit number"
                  />
                  <ErrorMessage
                    name="guardianContact"
                    component="span"
                    className="form-error"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="guardianRelation" className="form-label">
                    Guardian Relation *
                  </label>
                  <Field
                    as="select"
                    id="guardianRelation"
                    name="guardianRelation"
                    className="form-control"
                  >
                    <option value="">Select Relation</option>
                    {GUARDIAN_RELATIONS.map((relation) => (
                      <option key={relation.value} value={relation.value}>
                        {relation.label}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="guardianRelation"
                    component="span"
                    className="form-error"
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Academic Information</h3>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="department" className="form-label">
                    Department *
                  </label>
                  <Field as="select" id="department" name="department" className="form-control">
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="department" component="span" className="form-error" />
                </div>

                <div className="form-group">
                  <label htmlFor="currentSemester" className="form-label">
                    Current Semester *
                  </label>
                  <Field
                    type="number"
                    id="currentSemester"
                    name="currentSemester"
                    min="1"
                    max="8"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="currentSemester"
                    component="span"
                    className="form-error"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="admissionYear" className="form-label">
                    Admission Year *
                  </label>
                  <Field
                    type="number"
                    id="admissionYear"
                    name="admissionYear"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className="form-control"
                  />
                  <ErrorMessage
                    name="admissionYear"
                    component="span"
                    className="form-error"
                  />
                </div>

                {isEditMode && (
                  <div className="form-group">
                    <label htmlFor="status" className="form-label">
                      Status
                    </label>
                    <Field as="select" id="status" name="status" className="form-control">
                      {STUDENT_STATUS.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </Field>
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/students')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="spinner spinner-small"></span>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : isEditMode ? (
                  'Update Student'
                ) : (
                  'Create Student'
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>

      {/* Credentials Modal */}
      {showCredentials && credentials && (
        <div className="modal-backdrop">
          <div className="modal credentials-modal">
            <div className="modal-header">
              <h3>Student Created Successfully!</h3>
            </div>
            <div className="modal-body">
              <div className="credentials-info">
                <p className="credentials-message">
                  <strong>Important:</strong> Please save these credentials and share them with the student.
                  The student should change their password after the first login.
                </p>
                
                <div className="credentials-box">
                  <div className="credential-item">
                    <label>Email:</label>
                    <strong>{credentials.email}</strong>
                  </div>
                  <div className="credential-item">
                    <label>Temporary Password:</label>
                    <strong className="password-text">{credentials.temporaryPassword}</strong>
                  </div>
                </div>

                <button 
                  onClick={handleCopyCredentials} 
                  className="btn btn-outline btn-block"
                >
                  {copied ? (
                    <>
                      <FaCheck /> Copied!
                    </>
                  ) : (
                    <>
                      <FaCopy /> Copy Credentials
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeCredentialsModal} className="btn btn-primary">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentForm;