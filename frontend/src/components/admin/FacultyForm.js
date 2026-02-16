import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import PageHeader from '../common/PageHeader';
import Loader from '../common/Loader';
import facultyService from '../../services/facultyService';
import {
  DEPARTMENTS,
  GENDERS,
  DESIGNATIONS,
  QUALIFICATIONS,
  FACULTY_STATUS,
} from '../../utils/constants';
import { FaCopy, FaCheck } from 'react-icons/fa';

const FacultyForm = () => {
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
    department: '',
    designation: '',
    qualification: '',
    specialization: '',
    experience: 0,
    joiningDate: '',
    salary: '',
    officeLocation: {
      building: '',
      roomNumber: '',
    },
    officeHours: '',
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
    department: Yup.string().required('Department is required'),
    designation: Yup.string().required('Designation is required'),
    qualification: Yup.string().required('Qualification is required'),
    specialization: Yup.string().required('Specialization is required'),
    experience: Yup.number()
      .min(0, 'Experience cannot be negative')
      .required('Experience is required'),
    joiningDate: Yup.date().required('Joining date is required'),
    salary: Yup.number()
      .min(0, 'Salary cannot be negative')
      .required('Salary is required'),
  });

  const fetchFaculty = useCallback(async () => {
    try {
      setLoading(true);
      const response = await facultyService.getFacultyById(id);
      const faculty = response.data;
  
      const dateOfBirth = faculty.dateOfBirth
        ? new Date(faculty.dateOfBirth).toISOString().split('T')[0]
        : '';
      const joiningDate = faculty.joiningDate
        ? new Date(faculty.joiningDate).toISOString().split('T')[0]
        : '';
  
      setInitialValues({
        email: faculty.userId?.email || '',
        firstName: faculty.firstName || '',
        lastName: faculty.lastName || '',
        dateOfBirth,
        gender: faculty.gender || '',
        contactNumber: faculty.contactNumber || '',
        address: faculty.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India',
        },
        department: faculty.department || '',
        designation: faculty.designation || '',
        qualification: faculty.qualification || '',
        specialization: faculty.specialization || '',
        experience: faculty.experience || 0,
        joiningDate,
        salary: faculty.salary || '',
        officeLocation: faculty.officeLocation || {
          building: '',
          roomNumber: '',
        },
        officeHours: faculty.officeHours || '',
        status: faculty.status || 'active',
      });
    } catch (error) {
      toast.error('Failed to fetch faculty details');
      navigate('/faculty');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]); // Add dependencies
  
  useEffect(() => {
    if (isEditMode) {
      fetchFaculty();
    }
  }, [isEditMode, fetchFaculty]); // Now include both dependencies

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        await facultyService.updateFaculty(id, values);
        toast.success('Faculty updated successfully');
        navigate('/faculty');
      } else {
        const response = await facultyService.createFaculty(values);
        
        // Check if credentials were returned
        if (response.data.credentials) {
          setCredentials(response.data.credentials);
          setShowCredentials(true);
        } else {
          toast.success('Faculty created successfully');
          navigate('/faculty');
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save faculty');
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
    navigate('/faculty');
  };

  if (loading) {
    return <Loader message="Loading faculty details..." />;
  }

  return (
    <div className="faculty-form-container">
      <PageHeader
        title={isEditMode ? 'Edit Faculty' : 'Add New Faculty'}
        subtitle={
          isEditMode ? 'Update faculty information' : 'Create a new faculty record'
        }
      />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
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
                      placeholder="faculty@example.com"
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
                <h3 className="card-title">Professional Information</h3>
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
                  <label htmlFor="designation" className="form-label">
                    Designation *
                  </label>
                  <Field
                    as="select"
                    id="designation"
                    name="designation"
                    className="form-control"
                  >
                    <option value="">Select Designation</option>
                    {DESIGNATIONS.map((desig) => (
                      <option key={desig} value={desig}>
                        {desig}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="designation"
                    component="span"
                    className="form-error"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="qualification" className="form-label">
                    Qualification *
                  </label>
                  <Field
                    as="select"
                    id="qualification"
                    name="qualification"
                    className="form-control"
                  >
                    <option value="">Select Qualification</option>
                    {QUALIFICATIONS.map((qual) => (
                      <option key={qual} value={qual}>
                        {qual}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="qualification"
                    component="span"
                    className="form-error"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="specialization" className="form-label">
                    Specialization *
                  </label>
                  <Field
                    type="text"
                    id="specialization"
                    name="specialization"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="specialization"
                    component="span"
                    className="form-error"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="experience" className="form-label">
                    Experience (years) *
                  </label>
                  <Field
                    type="number"
                    id="experience"
                    name="experience"
                    min="0"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="experience"
                    component="span"
                    className="form-error"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="joiningDate" className="form-label">
                    Joining Date *
                  </label>
                  <Field
                    type="date"
                    id="joiningDate"
                    name="joiningDate"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="joiningDate"
                    component="span"
                    className="form-error"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="salary" className="form-label">
                    Salary *
                  </label>
                  <Field
                    type="number"
                    id="salary"
                    name="salary"
                    min="0"
                    className="form-control"
                  />
                  <ErrorMessage name="salary" component="span" className="form-error" />
                </div>

                <div className="form-group">
                  <label htmlFor="officeLocation.building" className="form-label">
                    Office Building
                  </label>
                  <Field
                    type="text"
                    id="officeLocation.building"
                    name="officeLocation.building"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="officeLocation.roomNumber" className="form-label">
                    Room Number
                  </label>
                  <Field
                    type="text"
                    id="officeLocation.roomNumber"
                    name="officeLocation.roomNumber"
                    className="form-control"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="officeHours" className="form-label">
                    Office Hours
                  </label>
                  <Field
                    type="text"
                    id="officeHours"
                    name="officeHours"
                    className="form-control"
                    placeholder="e.g., Mon-Fri: 10:00 AM - 4:00 PM"
                  />
                </div>

                {isEditMode && (
                  <div className="form-group">
                    <label htmlFor="status" className="form-label">
                      Status
                    </label>
                    <Field as="select" id="status" name="status" className="form-control">
                      {FACULTY_STATUS.map((status) => (
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
                onClick={() => navigate('/faculty')}
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
                  'Update Faculty'
                ) : (
                  'Create Faculty'
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
              <h3>Faculty Created Successfully!</h3>
            </div>
            <div className="modal-body">
              <div className="credentials-info">
                <p className="credentials-message">
                  <strong>Important:</strong> Please save these credentials and share them with the faculty member.
                  They should change their password after the first login.
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

export default FacultyForm;