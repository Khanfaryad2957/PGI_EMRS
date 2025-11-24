import { apiSlice } from '../../app/api/apiSlice';

export const patientsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllPatients: builder.query({
      query: ({ page = 1, limit = 10, ...filters }) => ({
        url: '/patients',
        params: { page, limit, ...filters },
      }),
      providesTags: ['Patient'],
    }),
    getPatientById: builder.query({
      query: (id) => `/patients/${id}`,
      providesTags: (result, error, id) => [{ type: 'Patient', id }],
    }),
    searchPatients: builder.query({
      query: ({ search, page = 1, limit = 10 }) => ({
        url: '/patients/search',
        params: { q: search, page, limit },
      }),
      providesTags: ['Patient'],
    }),
    createPatient: builder.mutation({
      query: (patientData) => ({
        url: '/patients',
        method: 'POST',
        body: patientData,
      }),
      invalidatesTags: (result, error, patientData) => {
        const tags = ['Patient', 'Stats'];
        // If creating a visit for existing patient, also invalidate visit count
        if (patientData?.patient_id) {
          tags.push({ type: 'PatientVisit', id: patientData.patient_id });
        }
        return tags;
      },
    }),
    createPatientComplete: builder.mutation({
      query: (patientData) => ({
        url: '/patients/register-complete',
        method: 'POST',
        body: patientData,
      }),
      invalidatesTags: ['Patient', 'Stats', 'ClinicalProforma', 'ADLFile'],
    }),
    updatePatient: builder.mutation({
      queryFn: async ({ id, files, files_to_remove, ...data }, _queryApi, _extraOptions, fetchWithBQ) => {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:2025/api';
        const state = _queryApi.getState();
        const token = state.auth.token;
        
        // If files are present, use FormData; otherwise use JSON
        if (files && files.length > 0 || (files_to_remove && files_to_remove.length > 0)) {
          const formData = new FormData();
          
          // Append patient data
          Object.keys(data).forEach(key => {
            if (data[key] !== undefined && data[key] !== null) {
              if (typeof data[key] === 'object' && !(data[key] instanceof File)) {
                formData.append(key, JSON.stringify(data[key]));
              } else {
                formData.append(key, data[key]);
              }
            }
          });
          
          // Append new files
          if (files && files.length > 0) {
            files.forEach((file) => {
              formData.append('attachments[]', file);
            });
          }
          
          // Append files to remove
          if (files_to_remove && files_to_remove.length > 0) {
            if (Array.isArray(files_to_remove)) {
              files_to_remove.forEach((filePath) => {
                formData.append('files_to_remove[]', filePath);
              });
            } else {
              formData.append('files_to_remove', JSON.stringify(files_to_remove));
            }
          }
          
          // Use fetch directly for FormData (don't set Content-Type, browser will set it with boundary)
          const response = await fetch(`${baseUrl}/patients/${id}`, {
            method: 'PUT',
            body: formData,
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            credentials: 'include',
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            return { error: { status: response.status, data: result } };
          }
          
          return { data: result };
        } else {
          // No files, use regular JSON request via fetchWithBQ
          return fetchWithBQ({
            url: `/patients/${id}`,
            method: 'PUT',
            body: data,
          });
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Patient', id }, 'Patient'],
    }),
    deletePatient: builder.mutation({
      query: (id) => ({
        url: `/patients/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Patient', id },
        { type: 'Patient', id: 'LIST' },
        'Patient',
        'Stats',
        'ClinicalProforma',
        'ADLFile',
      ],
    }),
    getPatientStats: builder.query({
      query: () => '/patients/stats',
      providesTags: ['Stats'],
    }),
    assignPatient: builder.mutation({
      query: (payload) => ({
        url: '/patients/assign',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Patient'],
    }),
    checkCRNumberExists: builder.query({
      query: (crNo) => `/patients/cr/${crNo}`,
      transformResponse: (response) => response.success, // true if patient exists
      transformErrorResponse: (response) => {
        // If 404, patient doesn't exist (return false)
        // If other error, assume exists to be safe (return true)
        return response.status === 404 ? false : true;
      },
    }),
    getPatientsStats: builder.query({
      query: () => '/patients/stats',
      providesTags: ['Stats'],
    }),
    getAgeDistribution: builder.query({
      query: () => '/patients/age-distribution',
      providesTags: ['Stats'],
    }),
    getPatientVisitCount: builder.query({
      query: (patientId) => `/patients/${patientId}/visits/count`,
      providesTags: (result, error, patientId) => [
        { type: 'Patient', id: patientId },
        { type: 'PatientVisit', id: patientId }
      ],
    }),
    markVisitCompleted: builder.mutation({
      query: ({ patient_id, visit_date }) => ({
        url: `/patients/${patient_id}/visits/complete`,
        method: 'POST',
        body: visit_date ? { visit_date } : {},
      }),
      invalidatesTags: (result, error, { patient_id }) => [
        { type: 'Patient', id: patient_id },
        { type: 'Patient', id: 'LIST' },
        { type: 'PatientVisit', id: patient_id },
      ],
    }),
    uploadPatientFiles: builder.mutation({
      queryFn: async ({ patientId, files }, _queryApi, _extraOptions, fetchWithBQ) => {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append('files', file);
        });

        const baseUrl = import.meta.env.VITE_API_URL || 'http://31.97.60.2:2025/api';
        const token = JSON.parse(localStorage.getItem('user'))?.token || localStorage.getItem('token');

        try {
          const response = await fetch(`${baseUrl}/patients/${patientId}/files`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              // Don't set Content-Type, let browser set it with boundary
            },
            credentials: 'include',
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
      invalidatesTags: (result, error, { patientId }) => [
        { type: 'Patient', id: patientId },
        'Patient',
      ],
    }),
    getPatientFiles: builder.query({
      query: (patientId) => `/patients/${patientId}/files`,
      providesTags: (result, error, patientId) => [
        { type: 'Patient', id: patientId },
        'Patient',
      ],
    }),
    deletePatientFile: builder.mutation({
      query: ({ patientId, filename }) => ({
        url: `/patients/${patientId}/files/${filename}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { patientId }) => [
        { type: 'Patient', id: patientId },
        'Patient',
      ],
    }),
  }),
});

export const {
  useGetAllPatientsQuery,
  useGetPatientByIdQuery,
  useSearchPatientsQuery,
  useCreatePatientMutation,
  useCreatePatientCompleteMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
  useGetPatientStatsQuery,
  useAssignPatientMutation,
  useCheckCRNumberExistsQuery,
  //dashboard stats queries
  useGetPatientsStatsQuery,
  useGetAgeDistributionQuery,
  useGetPatientVisitCountQuery,
  useMarkVisitCompletedMutation,
  useUploadPatientFilesMutation,
  useGetPatientFilesQuery,
  useDeletePatientFileMutation,
} = patientsApiSlice;

