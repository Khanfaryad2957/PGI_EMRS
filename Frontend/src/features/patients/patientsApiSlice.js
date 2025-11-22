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
      invalidatesTags: ['Patient', 'Stats'],
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
      query: ({ id, ...data }) => ({
        url: `/patients/${id}`,
        method: 'PUT',
        body: data,
      }),
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
} = patientsApiSlice;

