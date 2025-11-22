import { apiSlice } from '../../app/api/apiSlice';

export const adlApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllADLFiles: builder.query({
      query: ({ page = 1, limit = 10, ...filters }) => ({
        url: '/adl-files',
        params: { page, limit, ...filters },
      }),
      providesTags: ['ADL'],
    }),
    getADLFileById: builder.query({
      query: (id) => `/adl-files/${id}`,
      providesTags: (result, error, id) => [{ type: 'ADL', id }],
    }),
    getADLFileByPatientId: builder.query({
      query: (patientId) => `/adl-files/patient/${patientId}`,
      providesTags: (result, error, patientId) => [{ type: 'ADL', id: `patient-${patientId}` }],
    }),
    createADLFile: builder.mutation({
      query: (data) => ({
        url: '/adl-files',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ADL', 'Stats'],
    }),
    updateADLFile: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/adl-files/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'ADL', id }, 'ADL'],
    }),
    getActiveFiles: builder.query({
      query: () => '/adl-files/active',
      providesTags: ['ADL'],
    }),
    getADLStats: builder.query({
      query: () => '/adl-files/stats',
      providesTags: ['Stats'],
    }),
    getFilesByStatus: builder.query({
      query: () => '/adl-files/status-stats',
      providesTags: ['Stats'],
    }),
  }),
});

export const {
  useGetAllADLFilesQuery,
  useGetADLFileByIdQuery,
  useGetADLFileByPatientIdQuery,
  useCreateADLFileMutation,
  useUpdateADLFileMutation,
  useGetActiveFilesQuery,
  useGetADLStatsQuery,
  useGetFilesByStatusQuery,
} = adlApiSlice;

