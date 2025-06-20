import React, { useState, useEffect, useCallback } from 'react';
import { getInstructorCourses, getCourseStats, getCoursesByCategory, getTopPerformingCourses, getCourseTrend } from '../services/courseService.js';
import { getEnrollmentsByCourse } from '../services/enrollmentService.js';
import { getLessonsByCourse } from '../services/lessonService.js';
import { getCompletedLessonsByCourse, getAllCompletedLessonsByCourse } from '../services/lessonCompletionService.js';
import { getAssignmentSubmissions } from '../services/assignmentService.js';
import { getUserStats, getUserTrend } from '../services/userService.js';
import { getSystemStats, getHistoricalAnalytics } from '../services/systemService.js';

// Hook for instructor analytics
export const useInstructorAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
  
      // Fetch instructor's courses
      const courses = await getInstructorCourses({ limit: 100 });

      
      // Calculate analytics for each course using real data
      const courseAnalytics = await Promise.all(courses.map(async (course) => {
        try {
          // Get real enrollment data
          const enrollments = await getEnrollmentsByCourse(course.id);
          const totalEnrollments = enrollments.length;
          
          if (totalEnrollments === 0) {
            return {
              id: course.id,
              course: course.title,
              completionRate: 0,
              avgScore: 0,
              activeStudents: 0,
              totalEnrollments: 0,
              publishedStatus: course.is_published,
              approvedStatus: course.is_approved
            };
          }
          
          // Get lessons for the course
          const lessons = await getLessonsByCourse(course.id);
          const totalLessons = lessons.length;
          
          // Get completed lessons for this course (all users)
        const completedLessonsResponse = await getAllCompletedLessonsByCourse(course.id);
        const completedLessons = Array.isArray(completedLessonsResponse) ? completedLessonsResponse : [];
          
          // Calculate completion rate based on lesson completions
          let completionRate = 0;
          if (totalLessons > 0 && totalEnrollments > 0) {
            // Group completions by user to count unique students who completed lessons
            const completionsByUser = {};
            completedLessons.forEach(completion => {
              if (!completionsByUser[completion.user_id]) {
                completionsByUser[completion.user_id] = new Set();
              }
              completionsByUser[completion.user_id].add(completion.lesson_id);
            });
            
            // Calculate average completion rate across all enrolled students
            const userCompletionRates = Object.values(completionsByUser).map(userLessons => 
              (userLessons.size / totalLessons) * 100
            );
            
            // Add students with 0% completion (those not in completionsByUser)
            const studentsWithCompletions = Object.keys(completionsByUser).length;
            const studentsWithoutCompletions = totalEnrollments - studentsWithCompletions;
            for (let i = 0; i < studentsWithoutCompletions; i++) {
              userCompletionRates.push(0);
            }
            
            completionRate = userCompletionRates.reduce((sum, rate) => sum + rate, 0) / totalEnrollments;
          }
          
          // Calculate active students (students who have completed at least one lesson)
          const activeStudents = completedLessons.length > 0 ? new Set(completedLessons.map(c => c.user_id)).size : 0;
          
          // For avgScore, we'll use a placeholder since we don't have grade data readily available
          // This could be enhanced later with assignment submission grades
          const avgScore = completionRate > 0 ? Math.floor(completionRate * 0.8 + 20) : 0; // Rough estimate
          
          return {
            id: course.id,
            course: course.title,
            completionRate: Math.round(completionRate),
            avgScore: Math.round(avgScore),
            activeStudents,
            totalEnrollments,
            publishedStatus: course.is_published,
            approvedStatus: course.is_approved
          };
        } catch (error) {
          console.error(`Error calculating analytics for course ${course.id}:`, error);
          // Return fallback data if there's an error
          return {
            id: course.id,
            course: course.title,
            completionRate: 0,
            avgScore: 0,
            activeStudents: 0,
            totalEnrollments: course.enrolled_count || 0,
            publishedStatus: course.is_published,
            approvedStatus: course.is_approved
          };
        }
      }));
      
      // Filter out unpublished courses for analytics
      const publishedCourseAnalytics = courseAnalytics.filter(course => course.publishedStatus);
      
      const result = {
        analytics: publishedCourseAnalytics,
        totalCourses: courses.length,
        totalStudents: publishedCourseAnalytics.reduce((sum, course) => sum + course.totalEnrollments, 0),
        avgCompletionRate: publishedCourseAnalytics.length > 0 
          ? publishedCourseAnalytics.reduce((sum, course) => sum + course.completionRate, 0) / publishedCourseAnalytics.length 
          : 0
      };
      

      setAnalytics(result);
    } catch (err) {
      console.error('Error fetching instructor analytics:', err);
      console.error('Error details:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to fetch analytics';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {

    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  };
};

// Hook for course-specific analytics
export const useCourseAnalytics = (courseId) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourseAnalytics = useCallback(async () => {
    if (!courseId) {

      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Get real enrollment data
      const enrollments = await getEnrollmentsByCourse(courseId);
      const totalEnrollments = enrollments.length;
      
      if (totalEnrollments === 0) {
        const result = {
          totalEnrollments: 0,
          totalStudents: 0,
          completedCount: 0,
          completedStudents: 0,
          inProgressCount: 0,
          inProgressStudents: 0,
          notStartedCount: 0,
          notStartedStudents: 0,
          avgProgress: 0,
          enrollmentTrend: [],
          recentEnrollments: [],
          completionRate: 0
        };
        setAnalytics(result);
        return;
      }
      
      // Get lessons for the course
      const lessons = await getLessonsByCourse(courseId);
      const totalLessons = lessons.length;
      
      // Get completed lessons for the course (all users)
      const completedLessonsResponse = await getAllCompletedLessonsByCourse(courseId);
      const completedLessons = Array.isArray(completedLessonsResponse) ? completedLessonsResponse : [];
      
      // Calculate completion statistics per student
      const studentProgress = {};
      
      // Initialize all enrolled students with 0 progress
      enrollments.forEach(enrollment => {
        studentProgress[enrollment.user_id] = {
          completedLessons: 0,
          progressPercentage: 0,
          status: 'not_started'
        };
      });
      
      // Update progress based on completed lessons
      completedLessons.forEach(completion => {
        if (studentProgress[completion.user_id]) {
          studentProgress[completion.user_id].completedLessons++;
        }
      });
      
      // Calculate progress percentages and categorize students
      let completedCount = 0;
      let inProgressCount = 0;
      let notStartedCount = 0;
      let totalProgress = 0;
      
      Object.values(studentProgress).forEach(progress => {
        if (totalLessons > 0) {
          progress.progressPercentage = (progress.completedLessons / totalLessons) * 100;
        }
        
        if (progress.progressPercentage >= 100) {
          progress.status = 'completed';
          completedCount++;
        } else if (progress.progressPercentage > 0) {
          progress.status = 'in_progress';
          inProgressCount++;
        } else {
          progress.status = 'not_started';
          notStartedCount++;
        }
        
        totalProgress += progress.progressPercentage;
      });
      
      const avgProgress = totalEnrollments > 0 ? totalProgress / totalEnrollments : 0;
      const completionRate = totalEnrollments > 0 ? (completedCount / totalEnrollments) * 100 : 0;
      
      // Calculate enrollment trend based on enrollment dates
      const enrollmentTrend = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentDate = new Date();
      const enrollmentsByMonth = {};
      
      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const monthName = monthNames[date.getMonth()];
        enrollmentsByMonth[monthKey] = { month: monthName, enrollments: 0 };
      }
      
      // Count enrollments by month
      enrollments.forEach(enrollment => {
        if (enrollment.created_at) {
          const enrollDate = new Date(enrollment.created_at);
          const monthKey = `${enrollDate.getFullYear()}-${enrollDate.getMonth()}`;
          if (enrollmentsByMonth[monthKey]) {
            enrollmentsByMonth[monthKey].enrollments++;
          }
        }
      });
      
      // Convert to array for chart
      Object.values(enrollmentsByMonth).forEach(monthData => {
        enrollmentTrend.push(monthData);
      });
      
      // Get recent enrollments (last 10)
      const recentEnrollments = enrollments
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10)
        .map(enrollment => ({
          id: enrollment.id,
          user_id: enrollment.user_id,
          created_at: enrollment.created_at,
          // Add user info if available
          user_name: enrollment.user?.name || `User ${enrollment.user_id}`
        }));
      
      const result = {
        totalEnrollments,
        totalStudents: totalEnrollments,
        completedCount,
        completedStudents: completedCount,
        inProgressCount,
        inProgressStudents: inProgressCount,
        notStartedCount,
        notStartedStudents: notStartedCount,
        avgProgress: Math.round(avgProgress),
        enrollmentTrend,
        recentEnrollments,
        completionRate: Math.round(completionRate)
      };
      
      setAnalytics(result);
    } catch (err) {
      console.error('Error fetching course analytics:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to fetch course analytics';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (!courseId) {

      setLoading(false);
      setAnalytics(null);
      return;
    }
    

    fetchCourseAnalytics();
  }, [fetchCourseAnalytics, courseId]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchCourseAnalytics
  };
};

// Hook for admin analytics
export const useAdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real data from multiple backend endpoints
      const [userStats, courseStats, systemStats, coursesByCategory, userTrendData, courseTrendData] = await Promise.all([
        getUserStats(),
        getCourseStats(),
        getSystemStats().catch(() => null), // Optional endpoint
        getCoursesByCategory(),
        getUserTrend().catch(() => null), // Real user trend data
        getCourseTrend().catch(() => null) // Real course trend data
      ]);
      
      console.log('useAdminAnalytics - API responses:');
      console.log('coursesByCategory from API:', coursesByCategory);
      console.log('coursesByCategory type:', typeof coursesByCategory);
      console.log('coursesByCategory isArray:', Array.isArray(coursesByCategory));
      
      
      // Use real trend data from database
      const userTrend = userTrendData || {
        labels: [],
        data: []
      };
      
      // Use real course trend data from database
      const courseTrend = courseTrendData || {
        labels: [],
        data: []
      };
      
      // User role distribution from real data
      const userRoleDistribution = {
        labels: ['Students', 'Instructors', 'Admins'],
        data: [userStats.students, userStats.instructors, userStats.admins]
      };
      
      // Course status distribution from real data
      const courseStatusDistribution = {
        labels: ['Published', 'Pending', 'Drafts'],
        data: [courseStats.publishedCourses, courseStats.pendingCourses, courseStats.draftCourses]
      };
      
      const result = {
        totalUsers: userStats.totalUsers || 0,
        totalCourses: courseStats.totalCourses || 0,
        totalEnrollments: systemStats?.stats?.totalEnrollments || 0, // Will be 0 if system endpoint fails
        activeUsers: userStats.activeUsers || 0,
        totalRevenue: '$0', // Since the project is free, revenue is always 0
        userTrend,
        courseTrend,
        userRoleDistribution,
        courseStatusDistribution,
        coursesByCategory: coursesByCategory || []
      };
      
      console.log('useAdminAnalytics - Final result object:');
      console.log('result.coursesByCategory:', result.coursesByCategory);
      console.log('result.coursesByCategory type:', typeof result.coursesByCategory);
      console.log('result.coursesByCategory isArray:', Array.isArray(result.coursesByCategory));
      
      setAnalytics(result);
    } catch (err) {
      console.error('Error fetching admin analytics:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.data?.message || err.response?.data?.error || err.response?.statusText || err.message || 'Failed to fetch admin analytics';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminAnalytics();
  }, [fetchAdminAnalytics]);

  return { analytics, loading, error, refetch: fetchAdminAnalytics };
};

export default useInstructorAnalytics;