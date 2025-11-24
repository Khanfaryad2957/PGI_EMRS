import { apiSlice } from '../../app/api/apiSlice';

export const clinicalApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Dynamic options for clinical groups
    getClinicalOptions: builder.query({
      query: (group) => `/clinical-proformas/options/${group}`,
      providesTags: (result, error, group) => [{ type: 'ClinicalOptions', id: group }],
      transformResponse: (resp) => resp?.data?.options || [],
    }),
    addClinicalOption: builder.mutation({
      query: ({ group, label }) => ({
        url: `/clinical-proformas/options/${group}`,
        method: 'POST',
        body: { label },
      }),
      invalidatesTags: (result, error, { group }) => [{ type: 'ClinicalOptions', id: group }],
    }),
    deleteClinicalOption: builder.mutation({
      query: ({ group, label }) => ({
        url: `/clinical-proformas/options/${group}`,
        method: 'DELETE',
        body: { label },
      }),
      invalidatesTags: (result, error, { group }) => [{ type: 'ClinicalOptions', id: group }],
    }),
    getAllClinicalProformas: builder.query({
      query: ({ page = 1, limit = 10, ...filters }) => ({
        url: '/clinical-proformas',
        params: { page, limit, ...filters },
      }),
      providesTags: ['Clinical'],
    }),
    getClinicalProformaById: builder.query({
      query: (id) => `/clinical-proformas/${id}`,
      providesTags: (result, error, id) => [{ type: 'Clinical', id }],
    }),
    getClinicalProformaByPatientId: builder.query({
      query: (patientId) => `/clinical-proformas/patient/${patientId}`,
      providesTags: (result, error, patientId) => [
        { type: 'Clinical', id: `patient-${patientId}` },
        'Clinical',
      ],
    }),
    createClinicalProforma: builder.mutation({
      query: (proformaData) => ({
        url: '/clinical-proformas',
        method: 'POST',
        body: proformaData,
      }),
      invalidatesTags: ['Clinical', 'Patient', 'Stats', 'ADL'],
    }),
    updateClinicalProforma: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/clinical-proformas/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id, patient_id }) => {
        const tags = [
          { type: 'Clinical', id },
          'Clinical',
          'Patient',
          'Stats',
          'ADL'
        ];
        // Also invalidate patient-specific clinical proforma query
        if (patient_id) {
          tags.push({ type: 'Clinical', id: `patient-${patient_id}` });
        }
        // If we have the result, get patient_id from it
        if (result?.data?.proforma?.patient_id) {
          tags.push({ type: 'Clinical', id: `patient-${result.data.proforma.patient_id}` });
        }
        return tags;
      },
    }),
    deleteClinicalProforma: builder.mutation({
      query: (id) => ({
        url: `/clinical-proformas/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => {
        // Invalidate all related queries
        return [
          { type: 'Clinical', id },
          'Clinical',
          'Stats',
          'Patient',
          'ADL',
        ];
      },
    }),
    getClinicalStats: builder.query({
      query: () => '/clinical-proformas/stats',
      providesTags: ['Stats'],
    }),
    getMyProformas: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: '/clinical-proformas/my-proformas',
        params: { page, limit },
      }),
      providesTags: ['Clinical'],
    }),
    getComplexCases: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: '/clinical-proformas/complex-cases',
        params: { page, limit },
      }),
      providesTags: ['Clinical'],
    }),
    getCasesByDecision: builder.query({
      query: ({ user_id } = {}) => ({
        url: '/clinical-proformas/decision-stats',
        params: user_id ? { user_id } : {},
      }),
      providesTags: ['Stats'],
    }),
    getVisitTrends: builder.query({
      query: ({ period = 'week', user_id } = {}) => ({
        url: '/clinical-proformas/visit-trends',
        params: { period, ...(user_id ? { user_id } : {}) },
      }),
      providesTags: ['Stats'],
    }),
  }),
});

export const {
  useGetAllClinicalProformasQuery,
  useGetClinicalProformaByIdQuery,
  useGetClinicalProformaByPatientIdQuery,
  useCreateClinicalProformaMutation,
  useUpdateClinicalProformaMutation,
  useDeleteClinicalProformaMutation,
  //Dashboard Stats Queries
  useGetClinicalStatsQuery,
  useGetMyProformasQuery,
  useGetComplexCasesQuery,
  useGetCasesByDecisionQuery,
  useGetVisitTrendsQuery,
  useGetClinicalOptionsQuery,
  useAddClinicalOptionMutation,
  useDeleteClinicalOptionMutation,
} = clinicalApiSlice;
