import { customFetch, setBaseUrl } from '@/lib/custom-fetch';
import { API_BASE_URL } from '@/constants/api';

setBaseUrl(API_BASE_URL);

export interface MobileAppUser {
  userId: string;
  email?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  designation?: string;
  phone?: string;
  mobileAppAccessTypes?: string[];
  subDivisions?: string[];
  reportingManagerName?: string;
  reportingManagerEmail?: string;
  role?: string;
  employeeId?: string;
  enabled?: boolean;
  expiryDate?: string;
}

export interface UpdateUserRequest {
  userId: string;
  newEmail?: string;
  newFirstName?: string;
  newMiddleName?: string;
  newLastName?: string;
  newDesignation?: string;
  newPhone?: string;
  mobileAppAccessTypes?: string[];
  subDivisions?: string[];
  reportingManagerName?: string;
  reportingManagerEmail?: string;
  role?: string;
  newEmployeeId?: string;
  enabled?: boolean;
  newExpiryDate?: string;
}

export interface CreateUserRequest {
  userId: string;
  email?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  employeeId?: string;
  designation?: string;
  phone?: string;
  password?: string;
  subDivisions?: string[];
  reportingManagerName?: string;
  reportingManagerEmail?: string;
  role?: string;
  enabled?: boolean;
  mobileAppAccessTypes?: string[];
  expiryDate?: string;
}

export interface UpdateUserDeviceStatusRequest {
  userId: string;
  deviceId: string;
  status: string;
  reason: string;
}

export const userService = {
  // PUT Methods
  updateUser: (data: UpdateUserRequest) =>
    customFetch<string>('/mobile-app-user/updateUser', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updatePassword: (params: { userId: string; oldPassword?: string; newPassword?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return customFetch<string>(`/mobile-app-user/update-password?${query}`, {
      method: 'PUT',
    });
  },

  sendDefaultPassword: (userId: string) =>
    customFetch<string>(`/mobile-app-user/send-default-password?userId=${userId}`, {
      method: 'PUT',
    }),

  forgotPassword: (userId: string) =>
    customFetch<string>(`/mobile-app-user/forgot-password?userId=${userId}`, {
      method: 'PUT',
    }),

  firstLoginPasswordUpdate: (params: { userId: string; oldPassword?: string; newPassword?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return customFetch<string>(`/mobile-app-user/first-login-password-update?${query}`, {
      method: 'PUT',
    });
  },

  // POST Methods
  enableUser: (userId: string) =>
    customFetch<string>(`/mobile-app-user/enableUser?userId=${userId}`, {
      method: 'POST',
    }),

  disableUser: (userId: string) =>
    customFetch<string>(`/mobile-app-user/disableUser?userId=${userId}`, {
      method: 'POST',
    }),

  updateUserDeviceStatus: (data: UpdateUserDeviceStatusRequest) =>
    customFetch<string>('/mobile-app-user/device/updateUserDeviceStatus', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createUser: (data: CreateUserRequest) =>
    customFetch<string>('/mobile-app-user/createUser', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // GET Methods
  getUserSubDivisions: (userId: string) =>
    customFetch<any[]>(`/mobile-app-user/user-sub-divisions?userId=${userId}`, {
      method: 'GET',
    }),

  getUserHierarchy: (userId: string) =>
    customFetch<any>(`/mobile-app-user/user-hierarchy?userId=${userId}`, {
      method: 'GET',
    }),

  searchUser: (params: { firstName: string; lastName: string; middleName?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return customFetch<any>(`/mobile-app-user/searchUser?${query}`, {
      method: 'GET',
    });
  },

  getMyDetails: () =>
    customFetch<MobileAppUser>('/mobile-app-user/getMyDetails', {
      method: 'GET',
    }),

  getAllUsers: (params?: { role?: string; status?: boolean; pageNumber?: number; pageSize?: number; sort_by?: string; direction?: string }) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return customFetch<any>('/mobile-app-user/getAllUsers' + query, {
      method: 'GET',
    });
  },

  getForgotPasswordList: (params?: { userId?: string; pageNumber?: number; pageSize?: number; sort_by?: string; direction?: string }) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return customFetch<any>('/mobile-app-user/forgot-password/list' + query, {
      method: 'GET',
    });
  },

  getUserDeviceStatus: (userId: string, deviceId: string) =>
    customFetch<any>(`/mobile-app-user/device/userDeviceStatus?userId=${userId}&deviceId=${deviceId}`, {
      method: 'GET',
    }),

  getAllUserDeviceStatus: (params: { pageNumber: number; pageSize: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return customFetch<any>(`/mobile-app-user/device/all-user-device-status?${query}`, {
      method: 'GET',
    });
  },
};
