import { apiSlice } from '../../app/api/apiSlice';

export const patientFilesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get patient files
    getPatientFiles: builder.query({
      query: (patient_id) => `/patient-files/${patient_id}`,
      providesTags: (result, error, patient_id) => [
        { type: 'PatientFile', id: patient_id },
        { type: 'PatientFile', id: 'LIST' }
      ],
    }),

    // Create/Upload patient files
    createPatientFiles: builder.mutation({
      queryFn: async ({ patient_id, user_id, files }, _queryApi, _extraOptions, fetchWithBQ) => {
        const formData = new FormData();
        
        // Append files with 'attachments[]' field name
        files.forEach((file) => {
          formData.append('attachments[]', file);
        });
        
        // Append patient_id and user_id
        formData.append('patient_id', patient_id);
        if (user_id) {
          formData.append('user_id', user_id);
        }

        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:2025/api';
        const token = JSON.parse(localStorage.getItem('user'))?.token || localStorage.getItem('token');

        try {
          const response = await fetch(`${baseUrl}/patient-files/create`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              // Don't set Content-Type, let browser set it with boundary
            },
            body: formData,
          });

          const data = await response.json();

          if (!response.ok) {
            return { error: { status: response.status, data } };
          }

          return { data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: (result, error, { patient_id }) => [
        { type: 'PatientFile', id: patient_id },
        { type: 'PatientFile', id: 'LIST' },
        { type: 'Patient', id: patient_id }
      ],
    }),

    // Update patient files (add/remove)
    updatePatientFiles: builder.mutation({
      queryFn: async ({ patient_id, files, files_to_remove }, _queryApi, _extraOptions, fetchWithBQ) => {
        const formData = new FormData();
        
        // Append new files with 'attachments[]' field name
        if (files && files.length > 0) {
          files.forEach((file) => {
            formData.append('attachments[]', file);
          });
        }
        
        // Append files to remove
        if (files_to_remove && files_to_remove.length > 0) {
          files_to_remove.forEach((filePath) => {
            formData.append('files_to_remove[]', filePath);
          });
        }

        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:2025/api';
        const token = JSON.parse(localStorage.getItem('user'))?.token || localStorage.getItem('token');

        try {
          const response = await fetch(`${baseUrl}/patient-files/update/${patient_id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });

          const data = await response.json();

          if (!response.ok) {
            return { error: { status: response.status, data } };
          }

          return { data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: (result, error, { patient_id }) => [
        { type: 'PatientFile', id: patient_id },
        { type: 'PatientFile', id: 'LIST' },
        { type: 'Patient', id: patient_id }
      ],
    }),

    // Delete a specific file
    deletePatientFile: builder.mutation({
      query: ({ patient_id, file_path }) => ({
        url: `/patient-files/delete/${patient_id}/${encodeURIComponent(file_path)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { patient_id }) => [
        { type: 'PatientFile', id: patient_id },
        { type: 'PatientFile', id: 'LIST' },
        { type: 'Patient', id: patient_id }
      ],
    }),

    // Get file upload statistics
    getFileStats: builder.query({
      query: () => '/patient-files/stats',
      providesTags: ['Stats'],
    }),
  }),
});

export const {
  useGetPatientFilesQuery,
  useCreatePatientFilesMutation,
  useUpdatePatientFilesMutation,
  useDeletePatientFileMutation,
  useGetFileStatsQuery,
} = patientFilesApiSlice;

