import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaBook, FaSave } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import courseService from '../../services/courseService';
import marksService from '../../services/marksService';
import { EXAM_TYPES } from '../../utils/constants';
import { generateAcademicYear } from '../../utils/helpers';

const EnterMarks = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedCourse = searchParams.get('course');

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(preselectedCourse || '');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [marksData, setMarksData] = useState({
    academicYear: generateAcademicYear(),
    semester: 1,
    examType: 'internal',
    totalMarks: 100,
  });

  const [studentMarks, setStudentMarks] = useState({});

  useEffect(() => {
    fetchMyCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseStudents();
    }
  }, [selectedCourse]);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAllCourses({ limit: 100 });
      const myCourses = response.data.filter(
        (course) => course.faculty?._id === user.facultyId
      );
      setCourses(myCourses);
    } catch (error) {
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseStudents = async () => {
    try {
      const response = await courseService.getCourseById(selectedCourse);
      const course = response.data;
      
      if (course.enrolledStudents && course.enrolledStudents.length > 0) {
        setStudents(course.enrolledStudents);
        setMarksData((prev) => ({ ...prev, semester: course.semester }));
        
        // Initialize student marks
        const initialMarks = {};
        course.enrolledStudents.forEach((student) => {
          initialMarks[student._id] = { marksObtained: '', remarks: '' };
        });
        setStudentMarks(initialMarks);
      } else {
        setStudents([]);
        setStudentMarks({});
      }
    } catch (error) {
      toast.error('Failed to fetch course students');
    }
  };

  const handleMarksDataChange = (e) => {
    const { name, value } = e.target;
    setMarksData({ ...marksData, [name]: value });
  };

  const handleStudentMarkChange = (studentId, field, value) => {
    setStudentMarks({
      ...studentMarks,
      [studentId]: {
        ...studentMarks[studentId],
        [field]: value,
      },
    });
  };

  const handleSubmitAll = async () => {
    try {
      setSaving(true);
      
      // Validate that at least one student has marks entered
      const hasMarks = Object.values(studentMarks).some(
        (mark) => mark.marksObtained !== ''
      );
      
      if (!hasMarks) {
        toast.warning('Please enter marks for at least one student');
        return;
      }

      // Prepare marks data for each student
      const promises = Object.entries(studentMarks)
        .filter(([_, mark]) => mark.marksObtained !== '')
        .map(([studentId, mark]) => {
          return marksService.createOrUpdateMarks({
            student: studentId,
            course: selectedCourse,
            academicYear: marksData.academicYear,
            semester: marksData.semester,
            examType: marksData.examType,
            marksObtained: parseFloat(mark.marksObtained),
            totalMarks: parseFloat(marksData.totalMarks),
            remarks: mark.remarks,
          });
        });

      await Promise.all(promises);
      toast.success('Marks saved successfully for all students');
      
      // Reset student marks
      const resetMarks = {};
      students.forEach((student) => {
        resetMarks[student._id] = { marksObtained: '', remarks: '' };
      });
      setStudentMarks(resetMarks);
    } catch (error) {
      toast.error(error.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader message="Loading courses..." />;
  }

  if (courses.length === 0) {
    return (
      <div>
        <PageHeader title="Enter Marks" subtitle="Add student marks for your courses" />
        <EmptyState
          icon={FaBook}
          title="No Courses Assigned"
          message="You don't have any courses assigned yet."
        />
      </div>
    );
  }

  return (
    <div className="enter-marks">
      <PageHeader title="Enter Marks" subtitle="Add student marks for your courses" />

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <FaBook /> Select Course and Exam Details
          </h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="course" className="form-label">
              Course *
            </label>
            <select
              id="course"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="form-control"
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.courseCode} - {course.courseName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="academicYear" className="form-label">
              Academic Year *
            </label>
            <input
              type="text"
              id="academicYear"
              name="academicYear"
              value={marksData.academicYear}
              onChange={handleMarksDataChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="semester" className="form-label">
              Semester *
            </label>
            <input
              type="number"
              id="semester"
              name="semester"
              value={marksData.semester}
              onChange={handleMarksDataChange}
              min="1"
              max="8"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="examType" className="form-label">
              Exam Type *
            </label>
            <select
              id="examType"
              name="examType"
              value={marksData.examType}
              onChange={handleMarksDataChange}
              className="form-control"
            >
              {EXAM_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="totalMarks" className="form-label">
              Total Marks *
            </label>
            <input
              type="number"
              id="totalMarks"
              name="totalMarks"
              value={marksData.totalMarks}
              onChange={handleMarksDataChange}
              min="1"
              className="form-control"
            />
          </div>
        </div>
      </div>

      {selectedCourse && students.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Student Marks</h3>
            <button
              onClick={handleSubmitAll}
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner spinner-small"></span>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave /> Save All Marks
                </>
              )}
            </button>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student Code</th>
                  <th>Name</th>
                  <th>Marks Obtained (out of {marksData.totalMarks})</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td>
                      <strong>{student.studentCode}</strong>
                    </td>
                    <td>
                      {student.firstName} {student.lastName}
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max={marksData.totalMarks}
                        value={studentMarks[student._id]?.marksObtained || ''}
                        onChange={(e) =>
                          handleStudentMarkChange(
                            student._id,
                            'marksObtained',
                            e.target.value
                          )
                        }
                        className="form-control"
                        placeholder="Enter marks"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={studentMarks[student._id]?.remarks || ''}
                        onChange={(e) =>
                          handleStudentMarkChange(student._id, 'remarks', e.target.value)
                        }
                        className="form-control"
                        placeholder="Optional remarks"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedCourse && students.length === 0 && (
        <EmptyState
          title="No Students Enrolled"
          message="This course has no enrolled students yet."
        />
      )}
    </div>
  );
};

export default EnterMarks;