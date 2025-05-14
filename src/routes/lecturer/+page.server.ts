import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const load = async ({ locals }) => {
  if (!locals.user || locals.user.role !== 'LECTURER') {
    throw redirect(302, '/auth/login');
  }

  const lecturerId = locals.user.id;
  console.log(`Loading dashboard for lecturer: ${lecturerId}`);
  
  try {
    // Get courses taught by this lecturer
    const courses = await db.$queryRaw`
      SELECT c.id, c.code, c.name
      FROM "Course" c
      JOIN "CourseLecturer" cl ON c.id = cl."courseId"
      WHERE cl."lecturerId" = ${lecturerId}
    `;
    
    if (!Array.isArray(courses) || courses.length === 0) {
      console.log("No courses found for lecturer");
      return getEmptyResponse(locals.user);
    }
    
    console.log(`Found ${courses.length} courses for lecturer`);
    
    // Get formatted course IDs for queries
    const courseIds = courses.map(c => c.id);
    const courseIdsForQuery = courseIds.map(id => `'${id}'`).join(',');
    
    // Get total students across all courses
    let totalStudents = 0;
    try {
      const studentsQuery = `
        SELECT COUNT(DISTINCT sc."studentId") as count
        FROM "StudentCourse" sc
        WHERE sc."courseId" IN (${courseIdsForQuery})
      `;
      const result = await db.$queryRawUnsafe(studentsQuery);
      totalStudents = Number(result[0]?.count) || 0;
    } catch (e) {
      console.error("Error counting students:", e);
    }
    
    // Get total sessions
    let totalSessions = 0;
    try {
      const sessionsQuery = `
        SELECT COUNT(*) as count
        FROM "Session" s
        WHERE s."courseId" IN (${courseIdsForQuery})
      `;
      const result = await db.$queryRawUnsafe(sessionsQuery);
      totalSessions = Number(result[0]?.count) || 0;
    } catch (e) {
      console.error("Error counting sessions:", e);
    }
    
    // Get recent activity - sessions with attendance counts
    let recentActivity = [];
    try {
      const recentQuery = `
        SELECT 
          s.id, 
          s.date, 
          c.code as "courseCode", 
          c.name as "courseName",
          (SELECT COUNT(*) FROM "Attendance" a WHERE a."sessionId" = s.id AND a.status = 'PRESENT') as "attendanceCount"
        FROM "Session" s
        JOIN "Course" c ON s."courseId" = c.id
        WHERE c.id IN (${courseIdsForQuery})
        ORDER BY s.date DESC
        LIMIT 5
      `;
      const result = await db.$queryRawUnsafe(recentQuery);
      if (Array.isArray(result)) {
        recentActivity = result.map(item => ({
          id: item.id,
          date: item.date,
          courseCode: item.courseCode,
          courseName: item.courseName,
          attendanceCount: Number(item.attendanceCount) || 0
        }));
      }
    } catch (e) {
      console.error("Error fetching recent activity:", e);
    }
    
    // Generate date range for last 30 days
    const dates = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    // Direct query to get attendance data by date for all courses
    let courseSpecificAttendance = {};
    let cumulativeAttendance = {};
    
    // Initialize date-based data structures
    dates.forEach(date => {
      cumulativeAttendance[date] = {
        date,
        present: 0,
        total: 0,
        rate: 0
      };
    });
    
    // Get enrollment counts for each course
    const courseEnrollments = {};
    for (const course of courses) {
      try {
        const enrollmentQuery = `
          SELECT COUNT(DISTINCT "studentId") as count
          FROM "StudentCourse"
          WHERE "courseId" = '${course.id}'
        `;
        const result = await db.$queryRawUnsafe(enrollmentQuery);
        courseEnrollments[course.id] = Number(result[0]?.count) || 0;
      } catch (e) {
        console.error(`Error getting enrollment for course ${course.code}:`, e);
        courseEnrollments[course.id] = 0;
      }
      
      // Initialize course data structure
      courseSpecificAttendance[course.id] = {};
      dates.forEach(date => {
        courseSpecificAttendance[course.id][date] = {
          date,
          present: 0,
          total: courseEnrollments[course.id],
          rate: 0
        };
      });
    }
    
    // Query sessions and attendance directly from the database
    // - Group by date
    // - Count PRESENT status entries only
    try {
      const attendanceQuery = `
        SELECT 
          c.id as "courseId",
          DATE(s.date) as day,
          COUNT(DISTINCT CASE WHEN a.status = 'PRESENT' THEN a."userId" ELSE NULL END) as present_count,
          ${courseEnrollments[courses[0].id]} as total_possible
        FROM "Session" s
        JOIN "Course" c ON s."courseId" = c.id
        LEFT JOIN "Attendance" a ON a."sessionId" = s.id
        WHERE c.id IN (${courseIdsForQuery})
          AND s.date >= date('now', '-30 day')
        GROUP BY c.id, DATE(s.date)
      `;
      
      const attendanceResults = await db.$queryRawUnsafe(attendanceQuery);
      
      if (Array.isArray(attendanceResults)) {
        attendanceResults.forEach(record => {
          const courseId = record.courseId;
          const dateStr = record.day.toString().split('T')[0];
          const presentCount = Number(record.present_count) || 0;
          const totalPossible = courseEnrollments[courseId] || 0;
          const rate = totalPossible > 0 ? Math.min(100, Math.round((presentCount / totalPossible) * 100)) : 0;
          
          // Update course-specific data
          if (courseSpecificAttendance[courseId]?.[dateStr]) {
            courseSpecificAttendance[courseId][dateStr].present = presentCount;
            courseSpecificAttendance[courseId][dateStr].total = totalPossible;
            courseSpecificAttendance[courseId][dateStr].rate = rate;
          }
          
          // Update cumulative data
          if (cumulativeAttendance[dateStr]) {
            cumulativeAttendance[dateStr].present += presentCount;
            cumulativeAttendance[dateStr].total += totalPossible;
          }
        });
      }
      
      // Calculate rates for cumulative data
      Object.keys(cumulativeAttendance).forEach(date => {
        const data = cumulativeAttendance[date];
        if (data.total > 0) {
          data.rate = Math.min(100, Math.round((data.present / data.total) * 100));
        }
      });
    } catch (e) {
      console.error("Error calculating attendance data:", e);
    }
    
    // Format trend data for frontend
    const cumulativeTrends = dates.map(date => ({
      date,
      rate: cumulativeAttendance[date]?.rate || 0,
      present: cumulativeAttendance[date]?.present || 0,
      total: cumulativeAttendance[date]?.total || 0
    }));
    
    // Format course-specific trends
    const courseTrends = {};
    Object.keys(courseSpecificAttendance).forEach(courseId => {
      courseTrends[courseId] = dates.map(date => ({
        date,
        rate: courseSpecificAttendance[courseId][date]?.rate || 0,
        present: courseSpecificAttendance[courseId][date]?.present || 0,
        total: courseSpecificAttendance[courseId][date]?.total || 0
      }));
    });
    
    return {
      lecturer: locals.user,
      stats: {
        totalCourses: courses.length,
        activeCourses: courses.length, 
        totalStudents,
        totalSessions
      },
      courses,
      recentActivity,
      attendanceTrends: cumulativeTrends,
      courseTrends
    };
  } catch (error) {
    console.error("Dashboard error:", error);
    return getEmptyResponse(locals.user);
  }
};

// Helper function for empty response
function getEmptyResponse(user) {
  return {
    lecturer: user,
    stats: {
      totalCourses: 0,
      activeCourses: 0,
      totalStudents: 0,
      totalSessions: 0
    },
    courses: [],
    recentActivity: [],
    attendanceTrends: Array(30).fill(0).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        rate: 0,
        present: 0,
        total: 0
      };
    }),
    courseTrends: {}
  };
}
