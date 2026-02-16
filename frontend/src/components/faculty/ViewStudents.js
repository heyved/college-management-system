import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaSearch, FaFilter, FaUserGraduate } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import studentService from '../../services/studentService';
import { formatDate } from '../../utils/helpers';
import { DEPARTMENTS } from '../../utils/constants';

const ViewStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  });

  const [filters, setFilters] = useState({
    search: '',
    department: '',
    semester: '',
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    fetchStudents();
  }, [filters]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentService.getAllStudents(filters);
      setStudents(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to fetch students');
      console.error('Fetch students error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value, page: 1 });
  };

  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  if (loading && students.length === 0) {
    return <Loader message="Loading students..." />;
  }

  return (
    <div className="view-students">
      <PageHeader
        title="Students"
        subtitle={`Total: ${pagination.totalRecords} students`}
      />

      {/* Filters */}
      <div className="card filters-card">
        <div className="filters-grid">
          <div className="filter-item">
            <label className="filter-label">
              <FaSearch /> Search
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Search by name or code..."
              className="form-control"
            />
          </div>

          <div className="filter-item">
            <label className="filter-label">
              <FaFilter /> Department
            </label>
            <select
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-label">Semester</label>
            <select
              name="semester"
              value={filters.semester}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      {students.length > 0 ? (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student Code</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Enrollment Date</th>
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
                    <td>{student.department}</td>
                    <td>{student.currentSemester}</td>
                    <td>{student.contactNumber}</td>
                    <td>{student.userId?.email}</td>
                    <td>{formatDate(student.enrollmentDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="btn btn-secondary btn-sm"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="btn btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={FaUserGraduate}
          title="No Students Found"
          message="No students match your current filters."
        />
      )}
    </div>
  );
};

export default ViewStudents;