import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import PageHeader from '../common/PageHeader';
import Loader from '../common/Loader';
import marksService from '../../services/marksService';
import studentService from '../../services/studentService';
import courseService from '../../services/courseService';
import { EXAM_TYPES } from '../../utils/constants';
import { generateAcademicYear } from '../../utils/helpers';

const MarksForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [initialValues] = useState({
    student: '',
    course: '',
    academicYear: generateAcademicYear(),
    semester: 1,
    examType: 'internal',
    marksObtained: '',
    totalMarks: 100,
    remarks: '',
  });

  const validationSchema = Yup.object({
    student: Yup.string().required('Student is required'),
    course: Yup.string().required('Course is required'),
    academicYear: Yup.string().required('Academic year is required'),
    semester: Yup.number()
      .min(1, 'Must be at least 1')
      .max(8, 'Cannot exceed 8')
      .required('Semester is required'),
    examType: Yup.string().required('Exam type is required'),
    marksObtained: Yup.number()
      .min(0, 'Cannot be negative')
      .required('Marks obtained is required'),
    totalMarks: Yup.number()
      .min(1, 'Must be at least 1')
      .required('Total marks is required'),
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, coursesRes] = await Promise.all([
        studentService.getAllStudents({ limit: 1000, status: 'active' }),
        courseService.getAllCourses({ limit: 1000, status: 'active' }),
      ]);
      setStudents(studentsRes.data);
      setCourses(coursesRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Validate marks
      if (parseFloat(values.marksObtained) > parseFloat(values.totalMarks)) {
        toast.error('Marks obtained cannot exceed total marks');
        return;
      }

      await marksService.createOrUpdateMarks(values);
      toast.success('Marks saved successfully');
      navigate('/marks');
    } catch (error) {
      toast.error(error.message || 'Failed to save marks');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader message="Loading form data..." />;
  }

  return (
    <div className="marks-form-container">
      <PageHeader
        title="Enter Marks"
        subtitle="Add or update student marks"
      />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Marks Information</h3>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="student" className="form-label">
                    Student *
                  </label>
                  <Field as="select" id="student" name="student" className="form-control">
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
                  <label htmlFor="course" className="form-label">
                    Course *
                  </label>
                  <Field as="select" id="course" name="course" className="form-control">
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.courseCode} - {course.courseName}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="course" component="span" className="form-error" />
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
                  <label htmlFor="examType" className="form-label">
                    Exam Type *
                  </label>
                  <Field as="select" id="examType" name="examType" className="form-control">
                    {EXAM_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="examType" component="span" className="form-error" />
                </div>

                <div className="form-group">
                  <label htmlFor="totalMarks" className="form-label">
                    Total Marks *
                  </label>
                  <Field
                    type="number"
                    id="totalMarks"
                    name="totalMarks"
                    min="1"
                    className="form-control"
                  />
                  <ErrorMessage name="totalMarks" component="span" className="form-error" />
                </div>

                <div className="form-group">
                  <label htmlFor="marksObtained" className="form-label">
                    Marks Obtained *
                  </label>
                  <Field
                    type="number"
                    id="marksObtained"
                    name="marksObtained"
                    min="0"
                    max={values.totalMarks}
                    className="form-control"
                  />
                  <ErrorMessage
                    name="marksObtained"
                    component="span"
                    className="form-error"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Calculated</label>
                  <div className="calculated-info">
                    <div className="calc-item">
                      <span>Percentage:</span>
                      <strong>
                        {values.marksObtained && values.totalMarks
                          ? ((values.marksObtained / values.totalMarks) * 100).toFixed(2)
                          : 0}
                        %
                      </strong>
                    </div>
                  </div>
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
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/marks')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="spinner spinner-small"></span>
                    Saving...
                  </>
                ) : (
                  'Save Marks'
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default MarksForm;