import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import PageHeader from '../common/PageHeader';
import Loader from '../common/Loader';
import courseService from '../../services/courseService';
import facultyService from '../../services/facultyService';
import {
  DEPARTMENTS,
  COURSE_TYPES,
  COURSE_STATUS,
  DAYS_OF_WEEK,
} from '../../utils/constants';
import { generateAcademicYear } from '../../utils/helpers';

const CourseForm = ({ mode = 'edit' }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id) && mode !== 'view';
  const isViewMode = mode === 'view';

  const [loading, setLoading] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [initialValues, setInitialValues] = useState({
    courseCode: '',
    courseName: '',
    description: '',
    department: '',
    credits: 3,
    semester: 1,
    courseType: 'core',
    faculty: '',
    maxStudents: 60,
    syllabus: '',
    schedule: {
      days: [],
      startTime: '',
      endTime: '',
      room: '',
    },
    academicYear: generateAcademicYear(),
    status: 'active',
  });

  const validationSchema = Yup.object({
    courseCode: Yup.string()
      .matches(/^[A-Z0-9]+$/, 'Course code must contain only uppercase letters and numbers')
      .required('Course code is required'),
    courseName: Yup.string()
      .min(3, 'Must be at least 3 characters')
      .required('Course name is required'),
    description: Yup.string().required('Description is required'),
    department: Yup.string().required('Department is required'),
    credits: Yup.number()
      .min(1, 'Must be at least 1')
      .max(6, 'Cannot exceed 6')
      .required('Credits are required'),
    semester: Yup.number()
      .min(1, 'Must be at least 1')
      .max(8, 'Cannot exceed 8')
      .required('Semester is required'),
    courseType: Yup.string().required('Course type is required'),
    maxStudents: Yup.number()
      .min(1, 'Must be at least 1')
      .required('Max students is required'),
    academicYear: Yup.string().required('Academic year is required'),
  });

  useEffect(() => {
    fetchFaculty();
    if (id) {
      fetchCourse();
    }
  }, [id]);

  const fetchFaculty = async () => {
    try {
      const response = await facultyService.getAllFaculty({ limit: 100, status: 'active' });
      setFacultyList(response.data);
    } catch (error) {
      console.error('Failed to fetch faculty:', error);
    }
  };

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourseById(id);
      const course = response.data;

      setInitialValues({
        courseCode: course.courseCode || '',
        courseName: course.courseName || '',
        description: course.description || '',
        department: course.department || '',
        credits: course.credits || 3,
        semester: course.semester || 1,
        courseType: course.courseType || 'core',
        faculty: course.faculty?._id || '',
        maxStudents: course.maxStudents || 60,
        syllabus: course.syllabus || '',
        schedule: course.schedule || {
          days: [],
          startTime: '',
          endTime: '',
          room: '',
        },
        academicYear: course.academicYear || generateAcademicYear(),
        status: course.status || 'active',
      });
    } catch (error) {
      toast.error('Failed to fetch course details');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        await courseService.updateCourse(id, values);
        toast.success('Course updated successfully');
      } else {
        await courseService.createCourse(values);
        toast.success('Course created successfully');
      }
      navigate('/courses');
    } catch (error) {
      toast.error(error.message || 'Failed to save course');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader message="Loading course details..." />;
  }

  return (
    <div className="course-form-container">
      <PageHeader
        title={
          isViewMode
            ? 'Course Details'
            : isEditMode
            ? 'Edit Course'
            : 'Add New Course'
        }
        subtitle={
          isViewMode
            ? 'View course information'
            : isEditMode
            ? 'Update course information'
            : 'Create a new course'
        }
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
                <h3 className="card-title">Basic Information</h3>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="courseCode" className="form-label">
                    Course Code *
                  </label>
                  <Field
                    type="text"
                    id="courseCode"
                    name="courseCode"
                    className="form-control"
                    placeholder="e.g., CS101"
                    style={{ textTransform: 'uppercase' }}
                    disabled={isViewMode || isEditMode}
                  />
                  <ErrorMessage name="courseCode" component="span" className="form-error" />
                </div>

                <div className="form-group">
                  <label htmlFor="courseName" className="form-label">
                    Course Name *
                  </label>
                  <Field
                    type="text"
                    id="courseName"
                    name="courseName"
                    className="form-control"
                    disabled={isViewMode}
                  />
                  <ErrorMessage name="courseName" component="span" className="form-error" />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description" className="form-label">
                    Description *
                  </label>
                  <Field
                    as="textarea"
                    id="description"
                    name="description"
                    className="form-control"
                    rows="3"
                    disabled={isViewMode}
                  />
                  <ErrorMessage
                    name="description"
                    component="span"
                    className="form-error"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="department" className="form-label">
                    Department *
                  </label>
                  <Field
                    as="select"
                    id="department"
                    name="department"
                    className="form-control"
                    disabled={isViewMode}
                  >
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
                  <label htmlFor="credits" className="form-label">
                    Credits *
                  </label>
                  <Field
                    type="number"
                    id="credits"
                    name="credits"
                    min="1"
                    max="6"
                    className="form-control"
                    disabled={isViewMode}
                  />
                  <ErrorMessage name="credits" component="span" className="form-error" />
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
                    disabled={isViewMode}
                  />
                  <ErrorMessage name="semester" component="span" className="form-error" />
                </div>

                <div className="form-group">
                  <label htmlFor="courseType" className="form-label">
                    Course Type *
                  </label>
                  <Field
                    as="select"
                    id="courseType"
                    name="courseType"
                    className="form-control"
                    disabled={isViewMode}
                  >
                    {COURSE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="courseType" component="span" className="form-error" />
                </div>

                <div className="form-group">
                  <label htmlFor="maxStudents" className="form-label">
                    Max Students *
                  </label>
                  <Field
                    type="number"
                    id="maxStudents"
                    name="maxStudents"
                    min="1"
                    className="form-control"
                    disabled={isViewMode}
                  />
                  <ErrorMessage
                    name="maxStudents"
                    component="span"
                    className="form-error"
                  />
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
                    disabled={isViewMode}
                  />
                  <ErrorMessage
                    name="academicYear"
                    component="span"
                    className="form-error"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="faculty" className="form-label">
                    Assigned Faculty
                  </label>
                  <Field
                    as="select"
                    id="faculty"
                    name="faculty"
                    className="form-control"
                    disabled={isViewMode}
                  >
                    <option value="">Select Faculty</option>
                    {facultyList.map((fac) => (
                      <option key={fac._id} value={fac._id}>
                        {fac.firstName} {fac.lastName} - {fac.facultyCode}
                      </option>
                    ))}
                  </Field>
                </div>

                {(isEditMode || isViewMode) && (
                  <div className="form-group">
                    <label htmlFor="status" className="form-label">
                      Status
                    </label>
                    <Field
                      as="select"
                      id="status"
                      name="status"
                      className="form-control"
                      disabled={isViewMode}
                    >
                      {COURSE_STATUS.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </Field>
                  </div>
                )}

                <div className="form-group full-width">
                  <label htmlFor="syllabus" className="form-label">
                    Syllabus
                  </label>
                  <Field
                    as="textarea"
                    id="syllabus"
                    name="syllabus"
                    className="form-control"
                    rows="4"
                    disabled={isViewMode}
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Schedule</h3>
              </div>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">Days</label>
                  <div className="checkbox-group">
                    {DAYS_OF_WEEK.map((day) => (
                      <label key={day} className="checkbox-label">
                        <Field
                          type="checkbox"
                          name="schedule.days"
                          value={day}
                          disabled={isViewMode}
                        />
                        <span>{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="schedule.startTime" className="form-label">
                    Start Time
                  </label>
                  <Field
                    type="time"
                    id="schedule.startTime"
                    name="schedule.startTime"
                    className="form-control"
                    disabled={isViewMode}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="schedule.endTime" className="form-label">
                    End Time
                  </label>
                  <Field
                    type="time"
                    id="schedule.endTime"
                    name="schedule.endTime"
                    className="form-control"
                    disabled={isViewMode}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="schedule.room" className="form-label">
                    Room
                  </label>
                  <Field
                    type="text"
                    id="schedule.room"
                    name="schedule.room"
                    className="form-control"
                    placeholder="e.g., Lab 101"
                    disabled={isViewMode}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/courses')}
                className="btn btn-secondary"
              >
                {isViewMode ? 'Back' : 'Cancel'}
              </button>
              {!isViewMode && (
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="spinner spinner-small"></span>
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : isEditMode ? (
                    'Update Course'
                  ) : (
                    'Create Course'
                  )}
                </button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CourseForm;