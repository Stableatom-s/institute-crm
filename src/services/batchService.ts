import { apiRequest } from '../lib/api';

export interface BatchStudent {
  id?: string;
  srNo: string;
  name: string;
  startDate: string;
  contact: string;
  attendance: string;
  remark: string;
  fees: string;
}

export interface BatchLecture {
  id: string;
  title: string;
  date: string;
  timeSlot: string;
  course: string;
  topics: string[];
  assignment: string;
  totalStudents: number;
  presentStudents: number;
}

export interface BatchItem {
  id: string;
  srNo: string;
  batchCode: string;
  startDate: string;
  endDate?: string;
  course: string;
  faculty: string;
  studentCount: number;
  timeSlot?: string;
  phase?: string;
  students: BatchStudent[];
  lectures: BatchLecture[];
}

export const batchService = {
  getAllBatches: async (): Promise<BatchItem[]> => {
    const data = await apiRequest<any[]>('/batches');
    return data.map((b) => ({
      ...b,
      id: b._id || b.id,
      students: b.students || [],
      lectures: b.lectures || [],
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
};