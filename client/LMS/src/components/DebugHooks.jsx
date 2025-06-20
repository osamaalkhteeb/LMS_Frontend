import React, { useState, useEffect } from 'react';
import { useCourses } from '../hooks/useCourses';
import { useCourseManagement } from '../hooks/useCourses';
import { useModulesByCourse } from '../hooks/useModules';
import { useLessonsByModule } from '../hooks/useLessons';
import { useQuizzesByLesson } from '../hooks/useQuizzes';
import { useAssignmentsByLesson } from '../hooks/useAssignments';
import { useCourseEnrollments } from '../hooks/useEnrollments';
import { useAuth } from '../hooks/useAuth';
import { useCategories } from '../hooks/useCategories';
import { useCategoryManagement } from '../hooks/useCategories';

const DebugHooks = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [crudTestData, setCrudTestData] = useState({
    courseName: 'Test Course',
    moduleTitle: 'Test Module',
    lessonTitle: 'Test Lesson',
    categoryName: 'Test Category'
  });

  // Read hooks
  const { courses, loading: coursesLoading, error: coursesError } = useCourses();
  const { modules, loading: modulesLoading, error: modulesError } = useModulesByCourse(selectedCourse?.id);
  const { lessons, loading: lessonsLoading, error: lessonsError } = useLessonsByModule(selectedModule?.id);
  const { quizzes, loading: quizzesLoading, error: quizzesError } = useQuizzesByLesson(selectedLesson?.id);
  const { assignments, loading: assignmentsLoading, error: assignmentsError } = useAssignmentsByLesson(selectedLesson?.id);
  const { enrollments, loading: enrollmentsLoading, error: enrollmentsError } = useCourseEnrollments(selectedCourse?.id);
  const { user, loading: authLoading, error: authError } = useAuth();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  
  // Management hooks for CRUD operations
  const { createCourse, updateCourse, deleteCourse, loading: courseManagementLoading, error: courseManagementError } = useCourseManagement();
  const { create: createCategory, update: updateCategory, remove: deleteCategory, loading: categoryManagementLoading, error: categoryManagementError } = useCategoryManagement();

  const logResult = (operation, result) => {
    console.log(`${operation}:`, result);
    setTestResults(prev => ({
      ...prev,
      [operation]: {
        timestamp: new Date().toISOString(),
        result,
        success: !result.error
      }
    }));
  };

  // Get current user info
  const getCurrentUser = () => {
    const userInfo = {
      isLoggedIn: !!user,
      loading: authLoading,
      error: authError,
      userData: user || null
    };
    logResult('GET_CURRENT_USER', userInfo);
    return userInfo;
  };

  // CRUD Test Functions
  const testCreateCourse = async () => {
    try {
      const courseData = {
        title: crudTestData.courseName + ' ' + Date.now(),
        description: 'Test course description',
        category_id: categories[0]?.id || 1
      };
      const result = await createCourse(courseData);
      logResult('CREATE_COURSE', result);
    } catch (error) {
      logResult('CREATE_COURSE', { error: error.message });
    }
  };

  const testUpdateCourse = async () => {
    if (!selectedCourse) {
      logResult('UPDATE_COURSE', { error: 'No course selected' });
      return;
    }
    try {
      const updateData = {
        title: selectedCourse.title + ' (Updated)',
        description: 'Updated description'
      };
      const result = await updateCourse(selectedCourse.id, updateData);
      logResult('UPDATE_COURSE', result);
    } catch (error) {
      logResult('UPDATE_COURSE', { error: error.message });
    }
  };

  const testDeleteCourse = async () => {
    if (!selectedCourse) {
      logResult('DELETE_COURSE', { error: 'No course selected' });
      return;
    }
    try {
      const result = await deleteCourse(selectedCourse.id);
      logResult('DELETE_COURSE', result);
      setSelectedCourse(null);
    } catch (error) {
      logResult('DELETE_COURSE', { error: error.message });
    }
  };

  const testCreateCategory = async () => {
    try {
      const categoryData = {
        name: crudTestData.categoryName + ' ' + Date.now()
      };
      const result = await createCategory(categoryData);
      logResult('CREATE_CATEGORY', result);
    } catch (error) {
      logResult('CREATE_CATEGORY', { error: error.message });
    }
  };

  const testUpdateCategory = async () => {
    if (!categories || categories.length === 0) {
      logResult('UPDATE_CATEGORY', { error: 'No categories available' });
      return;
    }
    try {
      const category = categories[0];
      const updateData = {
        name: category.name + ' (Updated)'
      };
      const result = await updateCategory(category.id, updateData);
      logResult('UPDATE_CATEGORY', result);
    } catch (error) {
      logResult('UPDATE_CATEGORY', { error: error.message });
    }
  };

  const testDeleteCategory = async () => {
    if (!categories || categories.length === 0) {
      logResult('DELETE_CATEGORY', { error: 'No categories available' });
      return;
    }
    try {
      const category = categories[categories.length - 1];
      const result = await deleteCategory(category.id);
      logResult('DELETE_CATEGORY', result);
    } catch (error) {
      logResult('DELETE_CATEGORY', { error: error.message });
    }
  };

  const runAllReadTests = () => {
    logResult('read_courses', { data: courses, loading: coursesLoading, error: coursesError });
    logResult('read_modules', { data: modules, loading: modulesLoading, error: modulesError });
    logResult('read_lessons', { data: lessons, loading: lessonsLoading, error: lessonsError });
    logResult('read_quizzes', { data: quizzes, loading: quizzesLoading, error: quizzesError });
    logResult('read_assignments', { data: assignments, loading: assignmentsLoading, error: assignmentsError });
    logResult('read_enrollments', { data: enrollments, loading: enrollmentsLoading, error: enrollmentsError });
    logResult('read_categories', { data: categories, loading: categoriesLoading, error: categoriesError });
    logResult('read_auth', { data: user, loading: authLoading, error: authError });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🧪 CRUD Testing Dashboard</h1>
      
      {/* Current User Status */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '2px solid #007bff', borderRadius: '5px', backgroundColor: user ? '#d4edda' : '#f8d7da' }}>
        <h3>👤 Current User Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          <div>
            <strong>Login Status:</strong> 
            <span style={{ 
              padding: '4px 8px', 
              borderRadius: '3px', 
              backgroundColor: user ? '#28a745' : '#dc3545', 
              color: 'white', 
              marginLeft: '8px' 
            }}>
              {authLoading ? 'Loading...' : user ? '✅ Logged In' : '❌ Not Logged In'}
            </span>
          </div>
          <div>
            <strong>User ID:</strong> {user?.id || 'N/A'}
          </div>
          <div>
            <strong>Name:</strong> {user?.name || 'N/A'}
          </div>
          <div>
            <strong>Email:</strong> {user?.email || 'N/A'}
          </div>
          <div>
            <strong>Role:</strong> {user?.role || 'N/A'}
          </div>
          <div>
            <strong>Auth Error:</strong> {authError ? authError.message : 'None'}
          </div>
        </div>
        <button 
          onClick={getCurrentUser}
          style={{ 
            marginTop: '10px',
            padding: '8px 16px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '3px', 
            cursor: 'pointer' 
          }}
        >
          🔍 Get Current User Info
        </button>
      </div>

      {/* Test Data Input */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>Test Data Configuration</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          <input
            type="text"
            placeholder="Course Name"
            value={crudTestData.courseName}
            onChange={(e) => setCrudTestData(prev => ({ ...prev, courseName: e.target.value }))}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
          />
          <input
            type="text"
            placeholder="Module Title"
            value={crudTestData.moduleTitle}
            onChange={(e) => setCrudTestData(prev => ({ ...prev, moduleTitle: e.target.value }))}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
          />
          <input
            type="text"
            placeholder="Lesson Title"
            value={crudTestData.lessonTitle}
            onChange={(e) => setCrudTestData(prev => ({ ...prev, lessonTitle: e.target.value }))}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
          />
          <input
            type="text"
            placeholder="Category Name"
            value={crudTestData.categoryName}
            onChange={(e) => setCrudTestData(prev => ({ ...prev, categoryName: e.target.value }))}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
          />
        </div>
      </div>

      {/* READ Operations */}
      <div style={{ marginBottom: '20px' }}>
        <h3>📖 READ Operations</h3>
        <button 
          onClick={runAllReadTests}
          style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Test All Read Operations
        </button>
      </div>

      {/* CREATE Operations */}
      <div style={{ marginBottom: '20px' }}>
        <h3>➕ CREATE Operations</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={testCreateCategory} style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
            Create Category
          </button>
          <button onClick={testCreateCourse} style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
            Create Course
          </button>
        </div>
      </div>

      {/* UPDATE Operations */}
      <div style={{ marginBottom: '20px' }}>
        <h3>✏️ UPDATE Operations</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={testUpdateCategory} style={{ padding: '8px 16px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
            Update Category
          </button>
          <button onClick={testUpdateCourse} style={{ padding: '8px 16px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
            Update Course
          </button>
        </div>
      </div>

      {/* DELETE Operations */}
      <div style={{ marginBottom: '20px' }}>
        <h3>🗑️ DELETE Operations</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={testDeleteCategory} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
            Delete Category
          </button>
          <button onClick={testDeleteCourse} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
            Delete Course
          </button>
        </div>
      </div>

      {/* Selection Controls */}
      <div style={{ marginBottom: '20px' }}>
        <h3>🎯 Selection Controls</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <select 
            onChange={(e) => setSelectedCourse(courses.find(c => c.id == e.target.value))}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
          >
            <option value="">Select Course</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
          
          <select 
            onChange={(e) => setSelectedModule(modules.find(m => m.id == e.target.value))}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
          >
            <option value="">Select Module</option>
            {modules.map(module => (
              <option key={module.id} value={module.id}>{module.title}</option>
            ))}
          </select>
          
          <select 
            onChange={(e) => setSelectedLesson(lessons.find(l => l.id == e.target.value))}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
          >
            <option value="">Select Lesson</option>
            {lessons.map(lesson => (
              <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Current Data Display */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        <div>
          <h3>📊 Current Data</h3>
          <div style={{ fontSize: '12px', fontFamily: 'monospace', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '5px', maxHeight: '300px', overflow: 'auto' }}>
            <strong>Courses ({courses.length}):</strong> {JSON.stringify(courses, null, 2)}<br/><br/>
            <strong>Modules ({modules.length}):</strong> {JSON.stringify(modules, null, 2)}<br/><br/>
            <strong>Lessons ({lessons.length}):</strong> {JSON.stringify(lessons, null, 2)}<br/><br/>
            <strong>Categories ({categories.length}):</strong> {JSON.stringify(categories, null, 2)}
          </div>
        </div>
        
        <div>
          <h3>🧪 Test Results</h3>
          <div style={{ fontSize: '12px', fontFamily: 'monospace', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '5px', maxHeight: '300px', overflow: 'auto' }}>
            {Object.entries(testResults).map(([operation, result]) => (
              <div key={operation} style={{ marginBottom: '10px', padding: '5px', backgroundColor: result.success ? '#d4edda' : '#f8d7da', borderRadius: '3px' }}>
                <strong>{operation}:</strong><br/>
                <span style={{ fontSize: '10px' }}>{result.timestamp}</span><br/>
                {JSON.stringify(result.result, null, 2)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
        <h4>📋 Testing Instructions:</h4>
        <ol>
          <li><strong>User Status:</strong> Check if you're logged in at the top of the page</li>
          <li><strong>Read Tests:</strong> Click "Test All Read Operations" to verify all data fetching works</li>
          <li><strong>Create Tests:</strong> Use the create buttons to add new data</li>
          <li><strong>Update Tests:</strong> Select items and use update buttons to modify them</li>
          <li><strong>Delete Tests:</strong> Use delete buttons to remove items (be careful!)</li>
          <li><strong>Check Console:</strong> All operations are logged to browser console</li>
          <li><strong>Check Network Tab:</strong> Monitor API calls in browser dev tools</li>
        </ol>
      </div>
    </div>
  );
};

export default DebugHooks;