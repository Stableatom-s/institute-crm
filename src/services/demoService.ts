import { apiRequest } from '../lib/api';

export type DemoTab = 'Scheduled' | 'Completed' | 'Cancelled';

export interface DemoItem {
  id: string;
  srNo: string;
  name: string;
  lastName?: string;
  contactNo: string;
  address?: string;
  timeSlot: string;
  demoDate: string;
  course: string;
  mode: 'Online' | 'Offline';
  faculty: string;
  status: DemoTab;
  demoStatusText?: string;
  remark?: string;
  cancellationReason?: string;
  feedback?: string;
  screenshotUrl?: string;
}

export const demoService = {
  getAllDemos: async (): Promise<DemoItem[]> => {
    const data = await apiRequest<any[]>('/demos');
    return data.map((item) => ({
      ...item,
      id: item._id || item.id,
      contactNo: item.contactNo || '9078675645',
      lastName: item.lastName || '',
      address: item.address || 'Pune',
    }));
  },

  scheduleDemo: async (demoData: Partial<DemoItem>): Promise<DemoItem> => {
    const item = await apiRequest<any>('/demos', {
      method: 'POST',
      body: JSON.stringify(demoData),
    });
    return {
      ...item,
      id: item._id || item.id,
      contactNo: item.contactNo || demoData.contactNo || '9078675645',
      lastName: item.lastName || demoData.lastName || '',
      address: item.address || demoData.address || 'Pune',
    };
  },

  updateDemoStatus: async (
    id: string,
    status: DemoTab,
    extraFields?: Partial<DemoItem>
  ): Promise<DemoItem> => {
    const item = await apiRequest<any>(`/demos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ...extraFields }),
    });
    return {
      ...item,
      id: item._id || item.id,
      contactNo: item.contactNo || '9078675645',
    };
  },
};