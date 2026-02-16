export const DEPARTMENTS = [
      'Computer Science',
      'Information Technology',
      'Electronics',
      'Mechanical',
      'Civil',
      'Electrical',
    ];
    
    export const GENDERS = [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' },
    ];
    
    export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    export const DESIGNATIONS = [
      'Professor',
      'Associate Professor',
      'Assistant Professor',
      'Lecturer',
      'Senior Lecturer',
    ];
    
    export const QUALIFICATIONS = ['PhD', 'M.Tech', 'M.E', 'M.Sc', 'B.Tech', 'B.E'];
    
    export const COURSE_TYPES = [
      { value: 'core', label: 'Core' },
      { value: 'elective', label: 'Elective' },
      { value: 'lab', label: 'Lab' },
      { value: 'project', label: 'Project' },
    ];
    
    export const EXAM_TYPES = [
      { value: 'internal', label: 'Internal' },
      { value: 'midterm', label: 'Midterm' },
      { value: 'endterm', label: 'End Term' },
      { value: 'assignment', label: 'Assignment' },
      { value: 'project', label: 'Project' },
    ];
    
    export const FEE_TYPES = [
      { value: 'tuition', label: 'Tuition' },
      { value: 'examination', label: 'Examination' },
      { value: 'library', label: 'Library' },
      { value: 'sports', label: 'Sports' },
      { value: 'hostel', label: 'Hostel' },
      { value: 'transport', label: 'Transport' },
      { value: 'other', label: 'Other' },
    ];
    
    export const PAYMENT_MODES = [
      { value: 'cash', label: 'Cash' },
      { value: 'card', label: 'Card' },
      { value: 'upi', label: 'UPI' },
      { value: 'netbanking', label: 'Net Banking' },
      { value: 'cheque', label: 'Cheque' },
    ];
    
    export const STATUS_COLORS = {
      active: 'success',
      inactive: 'danger',
      pending: 'warning',
      paid: 'success',
      partial: 'info',
      overdue: 'danger',
      graduated: 'info',
      suspended: 'danger',
      'on-leave': 'warning',
      retired: 'info',
      completed: 'success',
    };
    
    export const GRADE_COLORS = {
      O: 'success',
      'A+': 'success',
      A: 'success',
      'B+': 'info',
      B: 'info',
      C: 'warning',
      P: 'warning',
      F: 'danger',
      AB: 'danger',
    };
    
    export const DAYS_OF_WEEK = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    
    export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
    
    export const GUARDIAN_RELATIONS = [
      { value: 'father', label: 'Father' },
      { value: 'mother', label: 'Mother' },
      { value: 'guardian', label: 'Guardian' },
      { value: 'other', label: 'Other' },
    ];
    
    export const STUDENT_STATUS = [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'graduated', label: 'Graduated' },
      { value: 'suspended', label: 'Suspended' },
    ];
    
    export const FACULTY_STATUS = [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'on-leave', label: 'On Leave' },
      { value: 'retired', label: 'Retired' },
    ];
    
    export const COURSE_STATUS = [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'completed', label: 'Completed' },
    ];
    
    export const FEE_STATUS = [
      { value: 'pending', label: 'Pending' },
      { value: 'partial', label: 'Partial' },
      { value: 'paid', label: 'Paid' },
      { value: 'overdue', label: 'Overdue' },
    ];