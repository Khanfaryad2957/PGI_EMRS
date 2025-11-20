import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  patientRegistration: {
    cr_no: null,
    date: null,
    name:null,
    contact_number:null,
    age: null,
    sex: null,
    category: null,
    father_name: null ,
    department: null,
    unit_consit: null,
    room_no: null,
    serial_no: null,
    file_no: null,
    unit_days: null,
    seen_in_walk_in_on: null,
    worked_up_on: null,
    psy_no: null,
    special_clinic_no: null,
    age_group: null,
    marital_status: null,
    year_of_marriage: null,
    no_of_children_male: null,
    no_of_children_female: null,
    occupation: null,
    education: null,
    locality: null,
    patient_income: null,
    family_income: null,
    religion: null,
    family_type: null,
    head_name: null,
    head_age: null,
    head_relationship: null,
    head_education: null,
    head_occupation: null,
    head_income: null,
    distance_from_hospital: null,
    mobility: null,
    referred_by: null,
    address_line: null,
    country: null,
    state: null,
    district: null,
    city: null,
    pin_code: null,
    assigned_doctor_name: null,
    assigned_doctor_id: null,
    assigned_room: null,
  },
};

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    updatePatientRegistrationForm: (state, action) => {
      state.patientRegistration = {
        ...state.patientRegistration,
        ...action.payload,
      };
    },
    resetPatientRegistrationForm: (state) => {
      state.patientRegistration = initialState.patientRegistration;
    },
  },
});

export const { updatePatientRegistrationForm, resetPatientRegistrationForm } = formSlice.actions;

export const selectPatientRegistrationForm = (state) => state.form.patientRegistration;

export default formSlice.reducer;
