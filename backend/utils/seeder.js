const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const connectDatabase = require('../config/db');
const logger = require('./logger');

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDatabase();

    // Clear existing data
    await User.deleteMany();
    await Student.deleteMany();
    await Faculty.deleteMany();
    await Course.deleteMany();

    logger.info('Database cleared');

    // Create admin user
    const adminUser = await User.create({
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@hexaware.com',
      password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123',
      role: 'admin',
      isActive: true,
      profileCompleted: true,
    });

    logger.info('Admin user created');

    // Create sample faculty users
    const facultyUsers = [];
    
    const faculty1User = await User.create({
      email: 'rajesh.kumar@hexaware.com',
      password: 'Faculty@123',
      role: 'faculty',
    });
    facultyUsers.push(faculty1User);

    const faculty2User = await User.create({
      email: 'priya.sharma@hexaware.com',
      password: 'Faculty@123',
      role: 'faculty',
    });
    facultyUsers.push(faculty2User);

    const faculty3User = await User.create({
      email: 'amit.patel@hexaware.com',
      password: 'Faculty@123',
      role: 'faculty',
    });
    facultyUsers.push(faculty3User);

    logger.info('Faculty users created');

    // Create faculty profiles one by one
    const faculty1 = await Faculty.create({
      userId: facultyUsers[0]._id,
      firstName: 'Rajesh',
      lastName: 'Kumar',
      dateOfBirth: new Date('1985-05-15'),
      gender: 'male',
      contactNumber: '9876543210',
      address: {
        street: '123 MG Road',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
        country: 'India',
      },
      department: 'Computer Science',
      designation: 'Associate Professor',
      qualification: 'PhD',
      specialization: 'Data Structures and Algorithms',
      experience: 12,
      joiningDate: new Date('2012-07-01'),
      salary: 85000,
      officeLocation: {
        building: 'Block A',
        roomNumber: '201',
      },
      officeHours: 'Mon-Fri: 10:00 AM - 4:00 PM',
    });

    const faculty2 = await Faculty.create({
      userId: facultyUsers[1]._id,
      firstName: 'Priya',
      lastName: 'Sharma',
      dateOfBirth: new Date('1988-08-22'),
      gender: 'female',
      contactNumber: '9876543211',
      address: {
        street: '456 Brigade Road',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560002',
        country: 'India',
      },
      department: 'Information Technology',
      designation: 'Assistant Professor',
      qualification: 'M.Tech',
      specialization: 'Database Management Systems',
      experience: 8,
      joiningDate: new Date('2016-08-01'),
      salary: 65000,
      officeLocation: {
        building: 'Block B',
        roomNumber: '105',
      },
      officeHours: 'Mon-Fri: 9:00 AM - 3:00 PM',
    });

    const faculty3 = await Faculty.create({
      userId: facultyUsers[2]._id,
      firstName: 'Amit',
      lastName: 'Patel',
      dateOfBirth: new Date('1990-03-10'),
      gender: 'male',
      contactNumber: '9876543212',
      address: {
        street: '789 Residency Road',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560003',
        country: 'India',
      },
      department: 'Computer Science',
      designation: 'Lecturer',
      qualification: 'M.E',
      specialization: 'Web Development',
      experience: 5,
      joiningDate: new Date('2019-07-15'),
      salary: 55000,
      officeLocation: {
        building: 'Block A',
        roomNumber: '305',
      },
      officeHours: 'Mon-Fri: 11:00 AM - 5:00 PM',
    });

    const createdFaculty = [faculty1, faculty2, faculty3];

    // Update users with faculty references
    facultyUsers[0].facultyId = faculty1._id;
    facultyUsers[0].profileCompleted = true;
    await facultyUsers[0].save();

    facultyUsers[1].facultyId = faculty2._id;
    facultyUsers[1].profileCompleted = true;
    await facultyUsers[1].save();

    facultyUsers[2].facultyId = faculty3._id;
    facultyUsers[2].profileCompleted = true;
    await facultyUsers[2].save();

    logger.info('Faculty profiles created');

    // Create sample courses
    const courses = [];

    const course1 = await Course.create({
      courseCode: 'CS101',
      courseName: 'Introduction to Programming',
      description: 'Fundamentals of programming using C language',
      department: 'Computer Science',
      credits: 4,
      semester: 1,
      courseType: 'core',
      faculty: createdFaculty[0]._id,
      maxStudents: 60,
      academicYear: '2024-2025',
      schedule: {
        days: ['Monday', 'Wednesday', 'Friday'],
        startTime: '09:00',
        endTime: '10:00',
        room: 'Lab 101',
      },
    });
    courses.push(course1);

    const course2 = await Course.create({
      courseCode: 'CS102',
      courseName: 'Data Structures',
      description: 'Implementation of various data structures',
      department: 'Computer Science',
      credits: 4,
      semester: 2,
      courseType: 'core',
      faculty: createdFaculty[0]._id,
      maxStudents: 60,
      academicYear: '2024-2025',
      schedule: {
        days: ['Tuesday', 'Thursday'],
        startTime: '10:00',
        endTime: '12:00',
        room: 'Room 205',
      },
    });
    courses.push(course2);

    const course3 = await Course.create({
      courseCode: 'IT201',
      courseName: 'Database Management Systems',
      description: 'Relational database concepts and SQL',
      department: 'Information Technology',
      credits: 4,
      semester: 3,
      courseType: 'core',
      faculty: createdFaculty[1]._id,
      maxStudents: 60,
      academicYear: '2024-2025',
      schedule: {
        days: ['Monday', 'Wednesday'],
        startTime: '14:00',
        endTime: '16:00',
        room: 'Lab 203',
      },
    });
    courses.push(course3);

    const course4 = await Course.create({
      courseCode: 'CS301',
      courseName: 'Web Development',
      description: 'Full stack web development with modern frameworks',
      department: 'Computer Science',
      credits: 3,
      semester: 5,
      courseType: 'elective',
      faculty: createdFaculty[2]._id,
      maxStudents: 40,
      academicYear: '2024-2025',
      schedule: {
        days: ['Tuesday', 'Friday'],
        startTime: '11:00',
        endTime: '13:00',
        room: 'Lab 301',
      },
    });
    courses.push(course4);

    // Update faculty with assigned courses
    createdFaculty[0].assignedCourses = [courses[0]._id, courses[1]._id];
    await createdFaculty[0].save();

    createdFaculty[1].assignedCourses = [courses[2]._id];
    await createdFaculty[1].save();

    createdFaculty[2].assignedCourses = [courses[3]._id];
    await createdFaculty[2].save();

    logger.info('Courses created');

    // Create sample student users
    const studentUsers = [];

    const student1User = await User.create({
      email: 'arjun.reddy@student.hexaware.com',
      password: 'Student@123',
      role: 'student',
    });
    studentUsers.push(student1User);

    const student2User = await User.create({
      email: 'sneha.iyer@student.hexaware.com',
      password: 'Student@123',
      role: 'student',
    });
    studentUsers.push(student2User);

    const student3User = await User.create({
      email: 'vikram.singh@student.hexaware.com',
      password: 'Student@123',
      role: 'student',
    });
    studentUsers.push(student3User);

    logger.info('Student users created');

    // Create student profiles one by one
    const student1 = await Student.create({
      userId: studentUsers[0]._id,
      firstName: 'Arjun',
      lastName: 'Reddy',
      dateOfBirth: new Date('2003-06-15'),
      gender: 'male',
      contactNumber: '9123456780',
      address: {
        street: '12 JP Nagar',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560078',
        country: 'India',
      },
      guardianName: 'Ramesh Reddy',
      guardianContact: '9123456781',
      guardianRelation: 'father',
      department: 'Computer Science',
      currentSemester: 1,
      admissionYear: 2024,
      bloodGroup: 'O+',
      courses: [courses[0]._id],
    });

    const student2 = await Student.create({
      userId: studentUsers[1]._id,
      firstName: 'Sneha',
      lastName: 'Iyer',
      dateOfBirth: new Date('2003-09-22'),
      gender: 'female',
      contactNumber: '9123456782',
      address: {
        street: '45 Koramangala',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560034',
        country: 'India',
      },
      guardianName: 'Lakshmi Iyer',
      guardianContact: '9123456783',
      guardianRelation: 'mother',
      department: 'Information Technology',
      currentSemester: 3,
      admissionYear: 2023,
      bloodGroup: 'A+',
      courses: [courses[2]._id],
    });

    const student3 = await Student.create({
      userId: studentUsers[2]._id,
      firstName: 'Vikram',
      lastName: 'Singh',
      dateOfBirth: new Date('2002-12-05'),
      gender: 'male',
      contactNumber: '9123456784',
      address: {
        street: '78 Indiranagar',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560038',
        country: 'India',
      },
      guardianName: 'Rajendra Singh',
      guardianContact: '9123456785',
      guardianRelation: 'father',
      department: 'Computer Science',
      currentSemester: 5,
      admissionYear: 2022,
      bloodGroup: 'B+',
      courses: [courses[3]._id],
    });

    const createdStudents = [student1, student2, student3];

    // Update users with student references
    studentUsers[0].studentId = student1._id;
    studentUsers[0].profileCompleted = true;
    await studentUsers[0].save();

    studentUsers[1].studentId = student2._id;
    studentUsers[1].profileCompleted = true;
    await studentUsers[1].save();

    studentUsers[2].studentId = student3._id;
    studentUsers[2].profileCompleted = true;
    await studentUsers[2].save();

    // Update courses with enrolled students
    courses[0].enrolledStudents = [createdStudents[0]._id];
    await courses[0].save();

    courses[2].enrolledStudents = [createdStudents[1]._id];
    await courses[2].save();

    courses[3].enrolledStudents = [createdStudents[2]._id];
    await courses[3].save();

    logger.info('Students created');

    logger.info('Database seeded successfully!');
    logger.info('\n=== Login Credentials ===');
    logger.info(`Admin: ${adminUser.email} / ${process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123'}`);
    logger.info('Faculty: rajesh.kumar@hexaware.com / Faculty@123');
    logger.info('Student: arjun.reddy@student.hexaware.com / Student@123');
    logger.info('========================\n');

    process.exit(0);
  } catch (error) {
    logger.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();