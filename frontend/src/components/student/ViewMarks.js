import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaClipboardList, FaChartLine, FaDownload } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import marksService from '../../services/marksService';
import { getGradeBadgeClass } from '../../utils/helpers';

const ViewMarks = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [marksData, setMarksData] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState('all');

  useEffect(() => {
    fetchMarks();
  }, []);

  const fetchMarks = async () => {
    try {
      setLoading(true);
      if (!user?.studentId) {
        toast.error('Student profile not found');
        return;
      }

      const response = await marksService.getMarksByStudent(user.studentId);
      setMarksData(response.data);
    } catch (error) {
      toast.error('Failed to fetch marks');
      console.error('Fetch marks error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSemesterMarks = () => {
    if (!marksData || !marksData.marks) return [];
    
    if (selectedSemester === 'all') {
      return Object.entries(marksData.marks).flatMap(([sem, marks]) =>
        marks.map((mark) => ({ ...mark, semester: sem }))
      );
    }
    
    return marksData.marks[selectedSemester] || [];
  };

  const calculateSemesterStats = (semester) => {
    const marks = marksData?.marks?.[semester] || [];
    if (marks.length === 0) return null;

    const totalMarks = marks.reduce((sum, mark) => sum + mark.totalMarks, 0);
    const obtainedMarks = marks.reduce((sum, mark) => sum + mark.marksObtained, 0);
    const percentage = totalMarks > 0 ? ((obtainedMarks / totalMarks) * 100).toFixed(2) : 0;

    return { totalMarks, obtainedMarks, percentage, subjects: marks.length };
  };

  if (loading) {
    return <Loader message="Loading your marks..." />;
  }

  const displayMarks = getSemesterMarks();
  const semesters = marksData?.marks ? Object.keys(marksData.marks).sort() : [];

  return (
    <div className="view-marks">
      <PageHeader
        title="My Marks"
        subtitle="View your academic performance"
        actions={
          displayMarks.length > 0 && (
            <button className="btn btn-outline">
              <FaDownload /> Download Report
            </button>
          )
        }
      />

      {/* Overall Performance Card */}
      {marksData && displayMarks.length > 0 && (
        <div className="card performance-overview">
          <div className="card-header">
            <h3 className="card-title">
              <FaChartLine /> Overall Performance
            </h3>
          </div>
          <div className="performance-stats">
            <div className="stat-card">
              <span className="stat-label">Total Subjects</span>
              <span className="stat-value">{displayMarks.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Marks</span>
              <span className="stat-value">
                {displayMarks.reduce((sum, mark) => sum + mark.marksObtained, 0)}/
                {displayMarks.reduce((sum, mark) => sum + mark.totalMarks, 0)}
              </span>
            </div>
            <div className="stat-card primary">
              <span className="stat-label">Overall Percentage</span>
              <span className="stat-value">
                {displayMarks.reduce((sum, mark) => sum + mark.totalMarks, 0) > 0
                  ? (
                      (displayMarks.reduce((sum, mark) => sum + mark.marksObtained, 0) /
                        displayMarks.reduce((sum, mark) => sum + mark.totalMarks, 0)) *
                      100
                    ).toFixed(2)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Semester Filter */}
      {semesters.length > 0 && (
        <div className="card semester-filter">
          <div className="filter-buttons">
            <button
              onClick={() => setSelectedSemester('all')}
              className={`filter-btn ${selectedSemester === 'all' ? 'active' : ''}`}
            >
              All Semesters
            </button>
            {semesters.map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`filter-btn ${selectedSemester === sem ? 'active' : ''}`}
              >
                Semester {sem}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Marks Table */}
      {displayMarks.length > 0 ? (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <FaClipboardList /> Detailed Marks
            </h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Semester</th>
                  <th>Exam Type</th>
                  <th>Marks</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {displayMarks.map((mark) => (
                  <tr key={mark._id}>
                    <td>
                      <div>
                        <strong>{mark.course?.courseName}</strong>
                        <br />
                        <small>{mark.course?.courseCode}</small>
                      </div>
                    </td>
                    <td>{mark.semester}</td>
                    <td>
                      <span className="badge badge-info">{mark.examType}</span>
                    </td>
                    <td>
                      <strong>
                        {mark.marksObtained}/{mark.totalMarks}
                      </strong>
                    </td>
                    <td>{mark.percentage?.toFixed(2)}%</td>
                    <td>
                      <span className={`badge ${getGradeBadgeClass(mark.grade)}`}>
                        {mark.grade}
                      </span>
                    </td>
                    <td>
                      {mark.isPublished ? (
                        <span className="badge badge-success">Published</span>
                      ) : (
                        <span className="badge badge-warning">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={FaClipboardList}
          title="No Marks Available"
          message="Your marks will appear here once they are published by your faculty."
        />
      )}

      {/* Semester-wise Summary */}
      {selectedSemester !== 'all' && semesters.includes(selectedSemester) && (
        <div className="card semester-summary">
          <div className="card-header">
            <h3 className="card-title">Semester {selectedSemester} Summary</h3>
          </div>
          <div className="summary-content">
            {(() => {
              const stats = calculateSemesterStats(selectedSemester);
              return stats ? (
                <div className="summary-stats">
                  <div className="summary-item">
                    <span>Total Subjects:</span>
                    <strong>{stats.subjects}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Total Marks:</span>
                    <strong>
                      {stats.obtainedMarks}/{stats.totalMarks}
                    </strong>
                  </div>
                  <div className="summary-item">
                    <span>Percentage:</span>
                    <strong className="highlight">{stats.percentage}%</strong>
                  </div>
                </div>
              ) : (
                <p>No data available for this semester.</p>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewMarks;