import { apiRequest } from '../lib/api';

export interface BatchStudent {
  id?: string;
  _id?: string;
  srNo?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  startDate: string;
  contact: string;
  attendance?: string;
  attendanceRatio?: string;
  attendedLectures?: number;
  totalLectures?: number;
  remark: string;
  fees?: string;
  email?: string;
  presentInLecture?: boolean;
}

export interface BatchLecture {
  id?: string;
  _id?: string;
  srNo: string;
  title?: string;
  topic?: string;
  lectureTopic?: string;
  date: string;
  timeSlot: string;
  course: string;
  topics?: string[];
  topicsCovered?: string[];
  assignment?: string;
  assignmentGiven?: string;
  hoursSpent?: string;
  totalStudents: number;
  presentStudents: number;
  attendance?: string;
  attendanceRatio?: string;
  studentsList?: any[];
}

export interface BatchItem {
  id: string;
  _id?: string;
  srNo: string;
  batchCode: string;
  startDate: string;
  endDate?: string;
  course: string;
  faculty: string;
  studentCount: number;
  completedLectures?: number;
  hoursSpent?: number;
  timeSlot?: string;
  students: BatchStudent[];
  lectures: BatchLecture[];
}

export const batchService = {
  getAllBatches: async (): Promise<BatchItem[]> => {
    const data = await apiRequest<any[]>('/batches');
    return data.map((b) => ({
      ...b,
      id: b._id || b.id,
      students: (b.students || []).map((s: any) => ({
        ...s,
        id: s._id || s.id,
        attendance: s.attendanceRatio || s.attendance || '100%',
      })),
      lectures: (b.lectures || []).map((l: any) => ({
        ...l,
        id: l._id || l.id,
        title: l.lectureTopic || l.title || 'Lecture Session',
        topic: l.lectureTopic || l.title || 'Lecture Session',
        topicsCovered: l.topicsCovered || l.topics || [],
        assignmentGiven: l.assignmentGiven || l.assignment || 'None',
        attendance: l.attendanceRatio || l.attendance || `${l.presentStudents || 0}/${l.totalStudents || 0}`,
      })),
      studentCount: b.students ? b.students.length : b.studentCount || 0,
    }));
  },

  createBatch: async (batchData: Partial<BatchItem>): Promise<BatchItem> => {
    const data = await apiRequest<any>('/batches', {
      method: 'POST',
      body: JSON.stringify(batchData),
    });
    return {
      ...data,
      id: data._id || data.id,
      students: data.students || [],
      lectures: data.lectures || [],
    };
  },

  addStudentsToBatch: async (batchId: string, students: BatchStudent[]): Promise<BatchItem> => {
    const data = await apiRequest<any>(`/batches/${batchId}/students`, {
      method: 'POST',
      body: JSON.stringify({ students }),
    });
    return {
      ...data,
      id: data._id || data.id,
      students: data.students || [],
      lectures: data.lectures || [],
    };
  },

  addLectureToBatch: async (batchId: string, lectureData: any): Promise<BatchItem> => {
    const data = await apiRequest<any>(`/batches/${batchId}/lectures`, {
      method: 'POST',
      body: JSON.stringify(lectureData),
    });
    return {
      ...data,
      id: data._id || data.id,
      students: data.students || [],
      lectures: data.lectures || [],
    };
  },

  updateStudentAttendance: async (
    batchId: string,
    studentName: string,
    newAttended: number,
    remark?: string
  ): Promise<BatchItem> => {
    const data = await apiRequest<any>(
      `/batches/${batchId}/students/${encodeURIComponent(studentName)}/attendance`,
      {
        method: 'PATCH',
        body: JSON.stringify({ newAttended, remark }),
      }
    );
    return {
      ...data,
      id: data._id || data.id,
      students: data.students || [],
      lectures: data.lectures || [],
    };
  },

  // Helper utility to compute dynamic percentage from an attendance string ('02/02' -> 100)
  calculateAttendancePercentage: (attendanceStr?: string): number => {
    if (!attendanceStr) return 100;
    if (attendanceStr.includes('%')) {
      const parsed = parseInt(attendanceStr.replace('%', ''), 10);
      return isNaN(parsed) ? 100 : parsed;
    }
    if (attendanceStr.includes('/')) {
      const [attended, total] = attendanceStr.split('/').map((n) => parseInt(n, 10));
      if (!total || total === 0) return 100;
      return Math.round((attended / total) * 100);
    }
    return 100;
  },
};