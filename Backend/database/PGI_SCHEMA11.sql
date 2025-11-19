--
-- PostgreSQL database dump
--

\restrict 1uya4b4RdkEyJrLhqJOtMijnhrOhrjv6gc2qvrxsKtuta06okisJSMUf6lYrRfC

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-11-19 10:55:43

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3 (class 3079 OID 20584)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 5200 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 2 (class 3079 OID 20190)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 5201 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 292 (class 1255 OID 20539)
-- Name: generate_adl_number(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_adl_number() RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    year_part TEXT;
    random_part TEXT;
    new_adl_no TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    -- Generate random 8-character string
    random_part := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    
    -- Format as ADL + year + 8-character random string
    new_adl_no := 'ADL' || year_part || random_part;
    
    RETURN new_adl_no;
END;
$$;


ALTER FUNCTION public.generate_adl_number() OWNER TO postgres;

--
-- TOC entry 265 (class 1255 OID 20537)
-- Name: generate_cr_number(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_cr_number() RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
    new_cr_no TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    -- Get next sequence number for current year
    SELECT COALESCE(MAX(CAST(SUBSTRING(cr_no FROM 6) AS INTEGER)), 0) + 1
    INTO sequence_part
    FROM registered_patient 
    WHERE cr_no LIKE 'CR' || year_part || '%';
    
    -- Format as CR + year + 6-digit sequence
    new_cr_no := 'CR' || year_part || LPAD(sequence_part::TEXT, 6, '0');
    
    RETURN new_cr_no;
END;
$$;


ALTER FUNCTION public.generate_cr_number() OWNER TO postgres;

--
-- TOC entry 291 (class 1255 OID 20538)
-- Name: generate_psy_number(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_psy_number() RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
    new_psy_no TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    -- Get next sequence number for current year
    SELECT COALESCE(MAX(CAST(SUBSTRING(psy_no FROM 7) AS INTEGER)), 0) + 1
    INTO sequence_part
    FROM registered_patient 
    WHERE psy_no LIKE 'PSY' || year_part || '%';
    
    -- Format as PSY + year + 6-digit sequence
    new_psy_no := 'PSY' || year_part || LPAD(sequence_part::TEXT, 6, '0');
    
    RETURN new_psy_no;
END;
$$;


ALTER FUNCTION public.generate_psy_number() OWNER TO postgres;

--
-- TOC entry 262 (class 1255 OID 20517)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 223 (class 1259 OID 20273)
-- Name: adl_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.adl_files (
    id integer NOT NULL,
    patient_id uuid,
    adl_no character varying(50) NOT NULL,
    created_by integer,
    clinical_proforma_id integer,
    file_status character varying(20) DEFAULT 'created'::character varying,
    physical_file_location text,
    file_created_date date NOT NULL,
    last_accessed_date date,
    last_accessed_by integer,
    total_visits integer DEFAULT 1,
    is_active boolean DEFAULT true,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    history_narrative text,
    history_specific_enquiry text,
    history_drug_intake text,
    history_treatment_place text,
    history_treatment_dates date,
    history_treatment_drugs text,
    history_treatment_response text,
    informants jsonb DEFAULT '[]'::jsonb,
    complaints_patient jsonb DEFAULT '[]'::jsonb,
    complaints_informant jsonb DEFAULT '[]'::jsonb,
    past_history_medical text,
    past_history_psychiatric_dates date,
    past_history_psychiatric_diagnosis text,
    past_history_psychiatric_treatment text,
    past_history_psychiatric_interim text,
    past_history_psychiatric_recovery text,
    family_history_father_age integer,
    family_history_father_education text,
    family_history_father_occupation text,
    family_history_father_personality text,
    family_history_father_deceased boolean DEFAULT false,
    family_history_father_death_age integer,
    family_history_father_death_date date,
    family_history_father_death_cause text,
    family_history_mother_age integer,
    family_history_mother_education text,
    family_history_mother_occupation text,
    family_history_mother_personality text,
    family_history_mother_deceased boolean DEFAULT false,
    family_history_mother_death_age integer,
    family_history_mother_death_date date,
    family_history_mother_death_cause text,
    family_history_siblings jsonb DEFAULT '[]'::jsonb,
    diagnostic_formulation_summary text,
    diagnostic_formulation_features text,
    diagnostic_formulation_psychodynamic text,
    premorbid_personality_passive_active text,
    premorbid_personality_assertive text,
    premorbid_personality_introvert_extrovert text,
    premorbid_personality_traits jsonb DEFAULT '[]'::jsonb,
    premorbid_personality_hobbies text,
    premorbid_personality_habits text,
    premorbid_personality_alcohol_drugs text,
    physical_appearance text,
    physical_body_build text,
    physical_pallor boolean DEFAULT false,
    physical_icterus boolean DEFAULT false,
    physical_oedema boolean DEFAULT false,
    physical_lymphadenopathy boolean DEFAULT false,
    physical_pulse text,
    physical_bp text,
    physical_height text,
    physical_weight text,
    physical_waist text,
    physical_fundus text,
    physical_cvs_apex text,
    physical_cvs_regularity text,
    physical_cvs_heart_sounds text,
    physical_cvs_murmurs text,
    physical_chest_expansion text,
    physical_chest_percussion text,
    physical_chest_adventitious text,
    physical_abdomen_tenderness text,
    physical_abdomen_mass text,
    physical_abdomen_bowel_sounds text,
    physical_cns_cranial text,
    physical_cns_motor_sensory text,
    physical_cns_rigidity text,
    physical_cns_involuntary text,
    physical_cns_superficial_reflexes text,
    physical_cns_dtrs text,
    physical_cns_plantar text,
    physical_cns_cerebellar text,
    mse_general_demeanour text,
    mse_general_tidy text,
    mse_general_awareness text,
    mse_general_cooperation text,
    mse_psychomotor_verbalization text,
    mse_psychomotor_pressure text,
    mse_psychomotor_tension text,
    mse_psychomotor_posture text,
    mse_psychomotor_mannerism text,
    mse_psychomotor_catatonic text,
    mse_affect_subjective text,
    mse_affect_tone text,
    mse_affect_resting text,
    mse_affect_fluctuation text,
    mse_thought_flow text,
    mse_thought_form text,
    mse_thought_content text,
    mse_cognitive_consciousness text,
    mse_cognitive_orientation_time text,
    mse_cognitive_orientation_place text,
    mse_cognitive_orientation_person text,
    mse_cognitive_memory_immediate text,
    mse_cognitive_memory_recent text,
    mse_cognitive_memory_remote text,
    mse_cognitive_subtraction text,
    mse_cognitive_digit_span text,
    mse_cognitive_counting text,
    mse_cognitive_general_knowledge text,
    mse_cognitive_calculation text,
    mse_cognitive_similarities text,
    mse_cognitive_proverbs text,
    mse_insight_understanding text,
    mse_insight_judgement text,
    education_start_age text,
    education_highest_class text,
    education_performance text,
    education_disciplinary text,
    education_peer_relationship text,
    education_hobbies text,
    education_special_abilities text,
    education_discontinue_reason text,
    occupation_jobs jsonb DEFAULT '[]'::jsonb,
    sexual_menarche_age text,
    sexual_menarche_reaction text,
    sexual_education text,
    sexual_masturbation text,
    sexual_contact text,
    sexual_premarital_extramarital text,
    sexual_marriage_arranged text,
    sexual_marriage_date date,
    sexual_spouse_age integer,
    sexual_spouse_occupation text,
    sexual_adjustment_general text,
    sexual_adjustment_sexual text,
    sexual_children jsonb DEFAULT '[]'::jsonb,
    sexual_problems text,
    religion_type text,
    religion_participation text,
    religion_changes text,
    living_residents jsonb DEFAULT '[]'::jsonb,
    living_income_sharing text,
    living_expenses text,
    living_kitchen text,
    living_domestic_conflicts text,
    living_social_class text,
    living_inlaws jsonb DEFAULT '[]'::jsonb,
    home_situation_childhood text,
    home_situation_parents_relationship text,
    home_situation_socioeconomic text,
    home_situation_interpersonal text,
    personal_birth_date date,
    personal_birth_place text,
    personal_delivery_type text,
    personal_complications_prenatal text,
    personal_complications_natal text,
    personal_complications_postnatal text,
    development_weaning_age text,
    development_first_words text,
    development_three_words text,
    development_walking text,
    development_neurotic_traits text,
    development_nail_biting text,
    development_bedwetting text,
    development_phobias text,
    development_childhood_illness text,
    provisional_diagnosis text,
    treatment_plan text,
    consultant_comments text,
    CONSTRAINT adl_files_file_status_check CHECK (((file_status)::text = ANY ((ARRAY['created'::character varying, 'stored'::character varying, 'retrieved'::character varying, 'active'::character varying, 'archived'::character varying])::text[])))
);


ALTER TABLE public.adl_files OWNER TO postgres;

--
-- TOC entry 5252 (class 0 OID 0)
-- Dependencies: 223
-- Name: TABLE adl_files; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.adl_files IS 'Specialized file management for complex cases';


--
-- TOC entry 5253 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN adl_files.history_narrative; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.adl_files.history_narrative IS 'Detailed narrative history of present illness';


--
-- TOC entry 5254 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN adl_files.informants; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.adl_files.informants IS 'JSONB array of informant details';


--
-- TOC entry 5255 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN adl_files.complaints_patient; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.adl_files.complaints_patient IS 'JSONB array of patient complaints';


--
-- TOC entry 5256 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN adl_files.complaints_informant; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.adl_files.complaints_informant IS 'JSONB array of informant complaints';


--
-- TOC entry 5257 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN adl_files.family_history_siblings; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.adl_files.family_history_siblings IS 'JSONB array of sibling information';


--
-- TOC entry 5258 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN adl_files.premorbid_personality_traits; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.adl_files.premorbid_personality_traits IS 'JSONB array of premorbid personality traits';


--
-- TOC entry 5259 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN adl_files.occupation_jobs; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.adl_files.occupation_jobs IS 'JSONB array of occupation/job history';


--
-- TOC entry 5260 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN adl_files.sexual_children; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.adl_files.sexual_children IS 'JSONB array of children information';


--
-- TOC entry 5261 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN adl_files.living_residents; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.adl_files.living_residents IS 'JSONB array of living residents';


--
-- TOC entry 5262 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN adl_files.living_inlaws; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.adl_files.living_inlaws IS 'JSONB array of in-laws information';


--
-- TOC entry 222 (class 1259 OID 20272)
-- Name: adl_files_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.adl_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.adl_files_id_seq OWNER TO postgres;

--
-- TOC entry 5264 (class 0 OID 0)
-- Dependencies: 222
-- Name: adl_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.adl_files_id_seq OWNED BY public.adl_files.id;


--
-- TOC entry 239 (class 1259 OID 20467)
-- Name: audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_log (
    id integer NOT NULL,
    table_name character varying(50) NOT NULL,
    record_id character varying(255) NOT NULL,
    action character varying(20) NOT NULL,
    old_values jsonb,
    new_values jsonb,
    changed_by integer,
    changed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ip_address inet,
    user_agent text
);


ALTER TABLE public.audit_log OWNER TO postgres;

--
-- TOC entry 5266 (class 0 OID 0)
-- Dependencies: 239
-- Name: TABLE audit_log; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.audit_log IS 'Complete audit trail for all data changes';


--
-- TOC entry 238 (class 1259 OID 20466)
-- Name: audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_log_id_seq OWNER TO postgres;

--
-- TOC entry 5268 (class 0 OID 0)
-- Dependencies: 238
-- Name: audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_log_id_seq OWNED BY public.audit_log.id;


--
-- TOC entry 225 (class 1259 OID 20305)
-- Name: clinical_proforma; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clinical_proforma (
    id integer NOT NULL,
    patient_id uuid,
    filled_by integer,
    visit_date date NOT NULL,
    visit_type character varying(20) DEFAULT 'first_visit'::character varying,
    room_no text,
    informant_present boolean,
    nature_of_information text,
    onset_duration text,
    course text,
    precipitating_factor text,
    illness_duration text,
    current_episode_since text,
    mood text,
    behaviour text,
    speech text,
    thought text,
    perception text,
    somatic text,
    bio_functions text,
    adjustment text,
    cognitive_function text,
    fits text,
    sexual_problem text,
    substance_use text,
    past_history text,
    family_history text,
    associated_medical_surgical text,
    mse_behaviour text,
    mse_affect text,
    mse_thought text,
    mse_delusions text,
    mse_perception text,
    mse_cognitive_function text,
    gpe text,
    diagnosis text,
    icd_code text,
    disposal text,
    workup_appointment date,
    referred_to text,
    treatment_prescribed text,
    doctor_decision character varying(20) DEFAULT 'simple_case'::character varying,
    case_severity character varying(20),
    requires_adl_file boolean DEFAULT false,
    adl_reasoning text,
    adl_file_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    assigned_doctor integer,
    CONSTRAINT clinical_proforma_case_severity_check CHECK (((case_severity)::text = ANY ((ARRAY['mild'::character varying, 'moderate'::character varying, 'severe'::character varying, 'critical'::character varying])::text[]))),
    CONSTRAINT clinical_proforma_doctor_decision_check CHECK (((doctor_decision)::text = ANY ((ARRAY['simple_case'::character varying, 'complex_case'::character varying])::text[]))),
    CONSTRAINT clinical_proforma_visit_type_check CHECK (((visit_type)::text = ANY ((ARRAY['first_visit'::character varying, 'follow_up'::character varying])::text[])))
);


ALTER TABLE public.clinical_proforma OWNER TO postgres;

--
-- TOC entry 5270 (class 0 OID 0)
-- Dependencies: 225
-- Name: TABLE clinical_proforma; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.clinical_proforma IS 'Clinical assessment data collected by doctors';


--
-- TOC entry 5271 (class 0 OID 0)
-- Dependencies: 225
-- Name: COLUMN clinical_proforma.assigned_doctor; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.clinical_proforma.assigned_doctor IS 'Doctor assigned to the patient for this visit';


--
-- TOC entry 224 (class 1259 OID 20304)
-- Name: clinical_proforma_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clinical_proforma_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clinical_proforma_id_seq OWNER TO postgres;

--
-- TOC entry 5273 (class 0 OID 0)
-- Dependencies: 224
-- Name: clinical_proforma_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clinical_proforma_id_seq OWNED BY public.clinical_proforma.id;


--
-- TOC entry 227 (class 1259 OID 20343)
-- Name: file_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.file_movements (
    id integer NOT NULL,
    adl_file_id integer,
    patient_id uuid,
    moved_by integer,
    movement_type character varying(20),
    from_location text,
    to_location text,
    movement_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT file_movements_movement_type_check CHECK (((movement_type)::text = ANY ((ARRAY['created'::character varying, 'stored'::character varying, 'retrieved'::character varying, 'returned'::character varying, 'archived'::character varying])::text[])))
);


ALTER TABLE public.file_movements OWNER TO postgres;

--
-- TOC entry 5275 (class 0 OID 0)
-- Dependencies: 227
-- Name: TABLE file_movements; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.file_movements IS 'Audit trail for physical file movements';


--
-- TOC entry 226 (class 1259 OID 20342)
-- Name: file_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.file_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.file_movements_id_seq OWNER TO postgres;

--
-- TOC entry 5277 (class 0 OID 0)
-- Dependencies: 226
-- Name: file_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.file_movements_id_seq OWNED BY public.file_movements.id;


--
-- TOC entry 235 (class 1259 OID 20438)
-- Name: login_otps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.login_otps (
    id integer NOT NULL,
    user_id integer NOT NULL,
    otp character varying(6) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.login_otps OWNER TO postgres;

--
-- TOC entry 5279 (class 0 OID 0)
-- Dependencies: 235
-- Name: TABLE login_otps; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.login_otps IS 'Login OTPs for 2FA login verification';


--
-- TOC entry 234 (class 1259 OID 20437)
-- Name: login_otps_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.login_otps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.login_otps_id_seq OWNER TO postgres;

--
-- TOC entry 5281 (class 0 OID 0)
-- Dependencies: 234
-- Name: login_otps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.login_otps_id_seq OWNED BY public.login_otps.id;


--
-- TOC entry 233 (class 1259 OID 20421)
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token character varying(255) NOT NULL,
    otp character varying(6) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- TOC entry 5283 (class 0 OID 0)
-- Dependencies: 233
-- Name: TABLE password_reset_tokens; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.password_reset_tokens IS 'Password reset tokens for forgot password functionality';


--
-- TOC entry 232 (class 1259 OID 20420)
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_reset_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_reset_tokens_id_seq OWNER TO postgres;

--
-- TOC entry 5285 (class 0 OID 0)
-- Dependencies: 232
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_reset_tokens_id_seq OWNED BY public.password_reset_tokens.id;


--
-- TOC entry 229 (class 1259 OID 20370)
-- Name: patient_visits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_visits (
    id integer NOT NULL,
    patient_id uuid,
    visit_date date NOT NULL,
    visit_type character varying(20) NOT NULL,
    has_file boolean DEFAULT false,
    adl_file_id integer,
    clinical_proforma_id integer,
    assigned_doctor_id integer,
    room_no text,
    visit_status character varying(20) DEFAULT 'scheduled'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT patient_visits_visit_status_check CHECK (((visit_status)::text = ANY ((ARRAY['scheduled'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[]))),
    CONSTRAINT patient_visits_visit_type_check CHECK (((visit_type)::text = ANY ((ARRAY['first_visit'::character varying, 'follow_up'::character varying])::text[])))
);


ALTER TABLE public.patient_visits OWNER TO postgres;

--
-- TOC entry 5287 (class 0 OID 0)
-- Dependencies: 229
-- Name: TABLE patient_visits; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.patient_visits IS 'Visit tracking and history';


--
-- TOC entry 228 (class 1259 OID 20369)
-- Name: patient_visits_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patient_visits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patient_visits_id_seq OWNER TO postgres;

--
-- TOC entry 5289 (class 0 OID 0)
-- Dependencies: 228
-- Name: patient_visits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patient_visits_id_seq OWNED BY public.patient_visits.id;


--
-- TOC entry 231 (class 1259 OID 20405)
-- Name: prescriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescriptions (
    id integer NOT NULL,
    clinical_proforma_id integer NOT NULL,
    medicine text NOT NULL,
    dosage text,
    when_to_take character varying(100),
    frequency character varying(100),
    duration character varying(100),
    quantity character varying(50),
    details text,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.prescriptions OWNER TO postgres;

--
-- TOC entry 5291 (class 0 OID 0)
-- Dependencies: 231
-- Name: TABLE prescriptions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.prescriptions IS 'Prescription details linked to clinical proforma';


--
-- TOC entry 230 (class 1259 OID 20404)
-- Name: prescriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prescriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prescriptions_id_seq OWNER TO postgres;

--
-- TOC entry 5293 (class 0 OID 0)
-- Dependencies: 230
-- Name: prescriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prescriptions_id_seq OWNED BY public.prescriptions.id;


--
-- TOC entry 221 (class 1259 OID 20217)
-- Name: registered_patient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registered_patient (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    cr_no character varying(50),
    psy_no text,
    special_clinic_no text,
    adl_no character varying(50),
    date date,
    name text NOT NULL,
    contact_number text,
    age integer,
    sex character varying(10),
    category character varying(50),
    father_name text,
    department character varying(100),
    unit_consit text,
    room_no text,
    serial_no text,
    file_no text,
    unit_days text,
    seen_in_walk_in_on date,
    worked_up_on date,
    age_group text,
    marital_status text,
    year_of_marriage integer,
    no_of_children_male integer DEFAULT 0,
    no_of_children_female integer DEFAULT 0,
    occupation text,
    education text,
    locality text,
    income numeric(12,2),
    religion text,
    family_type text,
    head_name text,
    head_age integer,
    head_relationship text,
    head_education text,
    head_occupation text,
    head_income numeric(12,2),
    distance_from_hospital text,
    mobility text,
    referred_by text,
    address_line text,
    country text,
    state text,
    district text,
    city text,
    pin_code text,
    assigned_doctor_id integer,
    assigned_doctor_name text,
    assigned_room text,
    filled_by integer,
    has_adl_file boolean DEFAULT false,
    file_status character varying(20) DEFAULT 'none'::character varying,
    case_complexity character varying(20) DEFAULT 'simple'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    permanent_address_line_1 text,
    permanent_address_line_2 text,
    permanent_city_town_village text,
    permanent_district text,
    permanent_state text,
    permanent_pin_code text,
    permanent_country text,
    present_address_line_1 text,
    present_address_line_2 text,
    present_city_town_village text,
    present_district text,
    present_state text,
    present_pin_code text,
    present_country text,
    local_address text,
    CONSTRAINT check_unit_days CHECK (((unit_days IS NULL) OR (unit_days = ANY (ARRAY[('mon'::character varying)::text, ('tue'::character varying)::text, ('wed'::character varying)::text, ('thu'::character varying)::text, ('fri'::character varying)::text, ('sat'::character varying)::text])))),
    CONSTRAINT registered_patient_age_check CHECK (((age >= 0) AND (age <= 150))),
    CONSTRAINT registered_patient_case_complexity_check CHECK (((case_complexity)::text = ANY ((ARRAY['simple'::character varying, 'complex'::character varying])::text[]))),
    CONSTRAINT registered_patient_file_status_check CHECK (((file_status)::text = ANY ((ARRAY['none'::character varying, 'created'::character varying, 'stored'::character varying, 'retrieved'::character varying, 'active'::character varying])::text[]))),
    CONSTRAINT registered_patient_sex_check CHECK (((sex)::text = ANY ((ARRAY['M'::character varying, 'F'::character varying, 'Other'::character varying])::text[])))
);


ALTER TABLE public.registered_patient OWNER TO postgres;

--
-- TOC entry 5295 (class 0 OID 0)
-- Dependencies: 221
-- Name: TABLE registered_patient; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.registered_patient IS 'Master patient registry with comprehensive patient information';


--
-- TOC entry 237 (class 1259 OID 20453)
-- Name: system_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_settings (
    id integer NOT NULL,
    setting_key character varying(100) NOT NULL,
    setting_value text,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.system_settings OWNER TO postgres;

--
-- TOC entry 5297 (class 0 OID 0)
-- Dependencies: 237
-- Name: TABLE system_settings; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.system_settings IS 'Application configuration settings';


--
-- TOC entry 236 (class 1259 OID 20452)
-- Name: system_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.system_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_settings_id_seq OWNER TO postgres;

--
-- TOC entry 5299 (class 0 OID 0)
-- Dependencies: 236
-- Name: system_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.system_settings_id_seq OWNED BY public.system_settings.id;


--
-- TOC entry 220 (class 1259 OID 20202)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    two_factor_secret character varying(32),
    two_factor_enabled boolean DEFAULT false,
    backup_codes text[],
    is_active boolean DEFAULT true,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    new_id uuid,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['Admin'::character varying, 'Faculty'::character varying, 'Resident'::character varying, 'Psychiatric Welfare Officer'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 5301 (class 0 OID 0)
-- Dependencies: 220
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.users IS 'System users with role-based access control';


--
-- TOC entry 240 (class 1259 OID 20533)
-- Name: user_stats; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.user_stats AS
 SELECT role,
    count(*) AS total_users,
    count(
        CASE
            WHEN (is_active = true) THEN 1
            ELSE NULL::integer
        END) AS active_users,
    count(
        CASE
            WHEN (last_login IS NOT NULL) THEN 1
            ELSE NULL::integer
        END) AS users_with_login
   FROM public.users
  GROUP BY role;


ALTER VIEW public.user_stats OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 20201)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5304 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4863 (class 2604 OID 20276)
-- Name: adl_files id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adl_files ALTER COLUMN id SET DEFAULT nextval('public.adl_files_id_seq'::regclass);


--
-- TOC entry 4914 (class 2604 OID 20470)
-- Name: audit_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log ALTER COLUMN id SET DEFAULT nextval('public.audit_log_id_seq'::regclass);


--
-- TOC entry 4884 (class 2604 OID 20308)
-- Name: clinical_proforma id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinical_proforma ALTER COLUMN id SET DEFAULT nextval('public.clinical_proforma_id_seq'::regclass);


--
-- TOC entry 4891 (class 2604 OID 20346)
-- Name: file_movements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_movements ALTER COLUMN id SET DEFAULT nextval('public.file_movements_id_seq'::regclass);


--
-- TOC entry 4906 (class 2604 OID 20441)
-- Name: login_otps id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_otps ALTER COLUMN id SET DEFAULT nextval('public.login_otps_id_seq'::regclass);


--
-- TOC entry 4902 (class 2604 OID 20424)
-- Name: password_reset_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass);


--
-- TOC entry 4894 (class 2604 OID 20373)
-- Name: patient_visits id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_visits ALTER COLUMN id SET DEFAULT nextval('public.patient_visits_id_seq'::regclass);


--
-- TOC entry 4899 (class 2604 OID 20408)
-- Name: prescriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions ALTER COLUMN id SET DEFAULT nextval('public.prescriptions_id_seq'::regclass);


--
-- TOC entry 4910 (class 2604 OID 20456)
-- Name: system_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings ALTER COLUMN id SET DEFAULT nextval('public.system_settings_id_seq'::regclass);


--
-- TOC entry 5177 (class 0 OID 20273)
-- Dependencies: 223
-- Data for Name: adl_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.adl_files (id, patient_id, adl_no, created_by, clinical_proforma_id, file_status, physical_file_location, file_created_date, last_accessed_date, last_accessed_by, total_visits, is_active, notes, created_at, updated_at, history_narrative, history_specific_enquiry, history_drug_intake, history_treatment_place, history_treatment_dates, history_treatment_drugs, history_treatment_response, informants, complaints_patient, complaints_informant, past_history_medical, past_history_psychiatric_dates, past_history_psychiatric_diagnosis, past_history_psychiatric_treatment, past_history_psychiatric_interim, past_history_psychiatric_recovery, family_history_father_age, family_history_father_education, family_history_father_occupation, family_history_father_personality, family_history_father_deceased, family_history_father_death_age, family_history_father_death_date, family_history_father_death_cause, family_history_mother_age, family_history_mother_education, family_history_mother_occupation, family_history_mother_personality, family_history_mother_deceased, family_history_mother_death_age, family_history_mother_death_date, family_history_mother_death_cause, family_history_siblings, diagnostic_formulation_summary, diagnostic_formulation_features, diagnostic_formulation_psychodynamic, premorbid_personality_passive_active, premorbid_personality_assertive, premorbid_personality_introvert_extrovert, premorbid_personality_traits, premorbid_personality_hobbies, premorbid_personality_habits, premorbid_personality_alcohol_drugs, physical_appearance, physical_body_build, physical_pallor, physical_icterus, physical_oedema, physical_lymphadenopathy, physical_pulse, physical_bp, physical_height, physical_weight, physical_waist, physical_fundus, physical_cvs_apex, physical_cvs_regularity, physical_cvs_heart_sounds, physical_cvs_murmurs, physical_chest_expansion, physical_chest_percussion, physical_chest_adventitious, physical_abdomen_tenderness, physical_abdomen_mass, physical_abdomen_bowel_sounds, physical_cns_cranial, physical_cns_motor_sensory, physical_cns_rigidity, physical_cns_involuntary, physical_cns_superficial_reflexes, physical_cns_dtrs, physical_cns_plantar, physical_cns_cerebellar, mse_general_demeanour, mse_general_tidy, mse_general_awareness, mse_general_cooperation, mse_psychomotor_verbalization, mse_psychomotor_pressure, mse_psychomotor_tension, mse_psychomotor_posture, mse_psychomotor_mannerism, mse_psychomotor_catatonic, mse_affect_subjective, mse_affect_tone, mse_affect_resting, mse_affect_fluctuation, mse_thought_flow, mse_thought_form, mse_thought_content, mse_cognitive_consciousness, mse_cognitive_orientation_time, mse_cognitive_orientation_place, mse_cognitive_orientation_person, mse_cognitive_memory_immediate, mse_cognitive_memory_recent, mse_cognitive_memory_remote, mse_cognitive_subtraction, mse_cognitive_digit_span, mse_cognitive_counting, mse_cognitive_general_knowledge, mse_cognitive_calculation, mse_cognitive_similarities, mse_cognitive_proverbs, mse_insight_understanding, mse_insight_judgement, education_start_age, education_highest_class, education_performance, education_disciplinary, education_peer_relationship, education_hobbies, education_special_abilities, education_discontinue_reason, occupation_jobs, sexual_menarche_age, sexual_menarche_reaction, sexual_education, sexual_masturbation, sexual_contact, sexual_premarital_extramarital, sexual_marriage_arranged, sexual_marriage_date, sexual_spouse_age, sexual_spouse_occupation, sexual_adjustment_general, sexual_adjustment_sexual, sexual_children, sexual_problems, religion_type, religion_participation, religion_changes, living_residents, living_income_sharing, living_expenses, living_kitchen, living_domestic_conflicts, living_social_class, living_inlaws, home_situation_childhood, home_situation_parents_relationship, home_situation_socioeconomic, home_situation_interpersonal, personal_birth_date, personal_birth_place, personal_delivery_type, personal_complications_prenatal, personal_complications_natal, personal_complications_postnatal, development_weaning_age, development_first_words, development_three_words, development_walking, development_neurotic_traits, development_nail_biting, development_bedwetting, development_phobias, development_childhood_illness, provisional_diagnosis, treatment_plan, consultant_comments) FROM stdin;
5	9adeca75-5844-44f8-b13e-e39df0960dad	ADL-000001	4	11	created	\N	2025-11-18	\N	\N	1	t	\N	2025-11-18 22:09:11.700507	2025-11-19 00:00:30.169612	sdfgdhfjgklj;k	dfghjkl;	assdfghjhfscbvgd	dsffgdfgd	\N	dsfsddg	sfddfgdd	[{"name": "", "reliability": "", "relationship": ""}]	[{"duration": "", "complaint": ""}]	[{"duration": "", "complaint": ""}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	[{"age": "", "sex": "", "education": "", "occupation": "", "marital_status": ""}]	\N	\N	\N	\N	\N	\N	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[{"job": "", "dates": "", "adjustment": "", "promotions": "", "difficulties": "", "change_reason": ""}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[{"age": "", "sex": ""}]	\N	\N	\N	\N	[{"age": "", "name": "", "relationship": ""}]	\N	\N	\N	\N	\N	[{"age": "", "name": "", "relationship": ""}]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	dgetgfhgjhrth	dsfgfrwegfhggethfgr	adsfsfsfdgfgetrhfwarewrewtew
\.


--
-- TOC entry 5193 (class 0 OID 20467)
-- Dependencies: 239
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_log (id, table_name, record_id, action, old_values, new_values, changed_by, changed_at, ip_address, user_agent) FROM stdin;
\.


--
-- TOC entry 5179 (class 0 OID 20305)
-- Dependencies: 225
-- Data for Name: clinical_proforma; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clinical_proforma (id, patient_id, filled_by, visit_date, visit_type, room_no, informant_present, nature_of_information, onset_duration, course, precipitating_factor, illness_duration, current_episode_since, mood, behaviour, speech, thought, perception, somatic, bio_functions, adjustment, cognitive_function, fits, sexual_problem, substance_use, past_history, family_history, associated_medical_surgical, mse_behaviour, mse_affect, mse_thought, mse_delusions, mse_perception, mse_cognitive_function, gpe, diagnosis, icd_code, disposal, workup_appointment, referred_to, treatment_prescribed, doctor_decision, case_severity, requires_adl_file, adl_reasoning, adl_file_id, is_active, created_at, updated_at, assigned_doctor) FROM stdin;
1	700cd2d2-6978-41ba-8b34-793899c779b2	3	2025-11-17	follow_up	206	t	Reliable	<1_week	Continuous	fix it please	6 month	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	120/80	asdfgh	18	asdfghj	2025-11-18	dsfghj	\N	simple_case	critical	f	\N	\N	t	2025-11-18 18:55:16.232327	2025-11-18 22:26:25.302633	\N
11	9adeca75-5844-44f8-b13e-e39df0960dad	4	2025-11-18	first_visit	205	t	Reliable	1w_1m	Episodic	adfghjk	6	\N	Anxious	Talking/Smiling to self	Incoherent	Grandiose, Hypochondriasis	Hallucination - Visual	Weakness	Bowel/Bladder	Socialization	Inattention	Dissociative	Poor erection	Opioid	\N	\N	Diabetes	Unkempt	Anxious	Suicidal	\N	Hallucinations - Visual	Not impaired	120/80	ASDFGHJKL	6A00.0	SFGHJKL	2025-11-18	ASDFGHJK	\N	complex_case	mild	t	\N	5	t	2025-11-18 21:25:35.978293	2025-11-18 22:09:11.706013	\N
13	60eb49ca-b3d4-480b-86ee-6e948c0b82da	2	2025-11-19	first_visit	206	t	Unreliable	not_known	Continuous	6	6	\N	Anxious	Talking/Smiling to self, Avolution	Incoherent	Persecution, Nihilism	Hallucination - Auditory	Numbness	Appetite	Socialization	Inattention	Dissociative	Poor erection	Opioid			Diabetes	Unkempt	Elated	Suicidal		Hallucinations - Auditory	Not impaired	120/80	wertyhyjkhgfd	07	ertyyjergerg	2025-11-19	dfghgrghfdg	\N	simple_case	critical	f		\N	t	2025-11-19 08:20:23.772579	2025-11-19 08:20:23.772579	\N
14	11cd3bb7-686e-4537-8e13-34368b6eb95b	3	2025-11-19	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	t	2025-11-19 10:43:14.570065	2025-11-19 10:43:14.570065	\N
\.


--
-- TOC entry 5181 (class 0 OID 20343)
-- Dependencies: 227
-- Data for Name: file_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.file_movements (id, adl_file_id, patient_id, moved_by, movement_type, from_location, to_location, movement_date, notes, created_at) FROM stdin;
\.


--
-- TOC entry 5189 (class 0 OID 20438)
-- Dependencies: 235
-- Data for Name: login_otps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.login_otps (id, user_id, otp, expires_at, used, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5187 (class 0 OID 20421)
-- Dependencies: 233
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (id, user_id, token, otp, expires_at, used, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5183 (class 0 OID 20370)
-- Dependencies: 229
-- Data for Name: patient_visits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patient_visits (id, patient_id, visit_date, visit_type, has_file, adl_file_id, clinical_proforma_id, assigned_doctor_id, room_no, visit_status, notes, created_at, updated_at) FROM stdin;
1	700cd2d2-6978-41ba-8b34-793899c779b2	2025-11-18	follow_up	f	\N	\N	2	206	scheduled	\N	2025-11-18 18:52:38.008753	2025-11-18 18:52:38.008753
2	700cd2d2-6978-41ba-8b34-793899c779b2	2025-11-18	follow_up	f	\N	\N	2	206	scheduled	\N	2025-11-18 18:55:16.204964	2025-11-18 18:55:16.204964
4	60eb49ca-b3d4-480b-86ee-6e948c0b82da	2025-11-18	follow_up	f	\N	\N	2	206	scheduled	\N	2025-11-19 01:24:41.571481	2025-11-19 01:24:41.571481
5	700cd2d2-6978-41ba-8b34-793899c779b2	2025-11-19	follow_up	f	\N	\N	2	206	scheduled	Visit created via Existing Patient flow	2025-11-19 08:48:15.160447	2025-11-19 08:48:15.160447
6	700cd2d2-6978-41ba-8b34-793899c779b2	2025-11-19	follow_up	f	\N	\N	2	206	scheduled	Visit created via Existing Patient flow	2025-11-19 08:52:03.376333	2025-11-19 08:52:03.376333
7	9adeca75-5844-44f8-b13e-e39df0960dad	2025-11-19	follow_up	f	\N	\N	4	205	scheduled	Visit created via Existing Patient flow	2025-11-19 10:00:17.56089	2025-11-19 10:00:17.56089
8	11cd3bb7-686e-4537-8e13-34368b6eb95b	2025-11-19	follow_up	f	\N	\N	2	206	scheduled	\N	2025-11-19 10:43:14.524233	2025-11-19 10:43:14.524233
\.


--
-- TOC entry 5185 (class 0 OID 20405)
-- Dependencies: 231
-- Data for Name: prescriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescriptions (id, clinical_proforma_id, medicine, dosage, when_to_take, frequency, duration, quantity, details, notes, created_at, updated_at) FROM stdin;
1	11	Paracetamol	1-0-0	Before Food	Twice Daily	5 Days	5	na	na	2025-11-18 23:46:39.511722	2025-11-18 23:46:39.511722
\.


--
-- TOC entry 5175 (class 0 OID 20217)
-- Dependencies: 221
-- Data for Name: registered_patient; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registered_patient (id, cr_no, psy_no, special_clinic_no, adl_no, date, name, contact_number, age, sex, category, father_name, department, unit_consit, room_no, serial_no, file_no, unit_days, seen_in_walk_in_on, worked_up_on, age_group, marital_status, year_of_marriage, no_of_children_male, no_of_children_female, occupation, education, locality, income, religion, family_type, head_name, head_age, head_relationship, head_education, head_occupation, head_income, distance_from_hospital, mobility, referred_by, address_line, country, state, district, city, pin_code, assigned_doctor_id, assigned_doctor_name, assigned_room, filled_by, has_adl_file, file_status, case_complexity, is_active, created_at, updated_at, permanent_address_line_1, permanent_address_line_2, permanent_city_town_village, permanent_district, permanent_state, permanent_pin_code, permanent_country, present_address_line_1, present_address_line_2, present_city_town_village, present_district, present_state, present_pin_code, present_country, local_address) FROM stdin;
700cd2d2-6978-41ba-8b34-793899c779b2	9875223523	PSY2025068218	01	\N	2025-11-18	Rohit	9816565196	30	M	GEN	Inder Singh	Psychiatry	ABS	211	01	PSYGEN01	tue	2025-11-18	2025-11-18	15-30	single	\N	\N	\N	professional	master_professional	urban	15000.00	hinduism	nuclear	Inder Singh	60	father	matric	skilled	15000.00	20	permanent_resident	medical_specialities_pgi	Dharampur	India	Himachal Pradesh	Mandi	Dharampur	175040	2	Unknown Doctor	206	3	f	none	simple	t	2025-11-18 18:51:08.223449	2025-11-18 18:55:16.143429	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
11cd3bb7-686e-4537-8e13-34368b6eb95b	7417894561	PSY2025318489	\N	\N	2025-11-19	OJHU2YxRDKdN93wrphAgc7w2NsOF+dbVcJ4sumlF78El8GiazvQiPQAC3LHpGrPx/qvqOToHCzTeXyryESGbZbmfByzXP2ol3DX5phvcEY/CDBoCDqdcMZE4FG1P+59rBjr9BgOegw==	zAhkM8dFyflN6f3BSFERrwcbLErT6sHk+WAkQKy81exxosMQjbPxUFhkHgTPxKRdNIgnZRX0RvnARLgg7Hiuwqju74piOOKWDJOUJtMMZbRDUsep4CFW7kC25BP42B5U6w6tzgd3lNswiw==	25	M	GEN	nIicuQSmKJmqV1025HqEciep/FN2ZdbPgn7ZbgrzPn1LjadjPMwvnJg0I4M7JClWFRncLw1zs28YxQ+eYQJV0FEBs0d0myt+/IEe8EMPce2XPFKfMD52vnOesyXLkagn0gQ46ecuXUwhH2E=	Psychiatry	ABS	211	04	PSYGEN04	wed	2025-11-19	2025-11-19	dc2E4ujKXsBnyCjlVn0jNPhACMY/VmGmNptGcB2a4pIT/5irwqORdEofSIf+6fjGCxS6V9h4O2XbMDpr9trKEk3uTy97+KWvRl+bBePl4PH7M+H7vsF/yw0qJpvHhIdVh/mIMCQ=	CV3wWkhGGxyWTkvK58CiK7J6aj25++xZdZ4Un4LO8OwLXRHuRhUu+d71wVegU4FOyOR0LZkVm+MZUWgZUsAhR39Ep453rMac7L7Xwy1FA/E5c+L5TGuwo8zFekne+EtNaM1v8Ab5	\N	\N	\N	1LWD5Yn8aF4EbFZwpvwzRqPwnl4PKfTyxDL6+umOgt6b80wEQtNKkzY44GmlF8YFOUeDG1nh2Ph+gjYFeIa7zqF9mcJbF7RnaNX/K+doOC5EocFVL8NtHOWve3LanXyPbD8GyLrdiavd	y2i+E468wAkYNxT6XQ8lk0v1hpKsYcWM6L6Zx/8PLRd5t0Dlcr1dsXJtRpxDB/uXuHrZlBmsHbNkQ+CTBDKFuhdtKHUqyd0IJCZr8c8DR9eAqxpbTRCCO9N0/HULGgqYV2T6BAL9FQ2/WpZo7YG2oVe2tQ==	4WmALhJWafNtawXys4wChdwBTsJIDlASisu7FcICMLfuAsxGeBn3xwH2EeW7MricMFH6MbFmwD3Nsya+Jo7Iks6lchqPRcP+DPZ588pbKmwkDAzTCMDjRUkO9OC5Lo3DBKK+ysU=	\N	rj1Var6PW4hTqquJarSKgZrS4LaHLoJfTBTG5LccXjeN3bl9k92ZRD9fClaIX9W3X3EunmyxF0GcFqgcxDOgo1XpyFN1j4I63eDdBQl9JBjrDwQOMj1UIBsVwW6WAC+m9TkdDmwvKSI=	GkZeHxQeHhpcpg63y8QYuuZlKLTQkooi++oXWqQMcxInO33o8IgQYFn2ujkHs7URPEorzfxHi8xmldIbyWgLToDVVXA/DSxWLTOp5OgD7rbQqAJIi99P4yomRsJa1y3PplFAwMz4iQ==	LodvPUazRbIH0dvhSCXDXYjwKB6f7CSX1s9B5Pz4qYqneoshrTYQbbOcKrrnNS3iLgq4bhQtDx3w/+hUine9eaKKsWhfXHZ2vG2o2V/+XBIkI/Hg0Kfv/8Z+v6rGo6Qan33odjOVQLOIZw==	50	QvmDqxp+eJFigQ4RApC633wtixZmfVWec7knSEflArRquEUuUS0wdIm4WsIeFNCvLsXjBlRZz4yVudnKE+GvPg0c6FTkcEKdTXil0SmCvZYyFLtgfBK4EiMXgKbUOPYFTyjyTLFP	qJw+S9Ckojnji5UCQMMB5Bm8rZt17WAAJW1cJmFPmumxOXlK5z/Tg+YB4omIzt51qSqexO4gtaLk+xORL5eW+EJtsAlJPyvUolSK9q4SGjoEkeNZ4ZFwpI+/99NdaP9VmSWzt0zgWg==	mcU6f5TyaFDw78cmlWXeggNoItWZpIqjxMul4Cr3x2H0GkpF9HBw0NhRwZsaBQ0zw/Pn9PKRVJbBR17n+SdyawK6Mvd/MN7Xd24cG/OuED3E1RtcY0qqcBpbXQPwhmFMxgp5jGkB2UFH	15000.00	PR2sdhymRm7XQvREFEB2XH2NI7mEfqQZz3WJbkV99F1b32zIdT3c4dTSMtmyMuWCHAsd7Oxs+wde8i9dVJ6pQackG9j7e0OZfkxibkmJZb08KPo8GjPdy5fWOHJuejg8Q3A=	A6e6+R76XOgIoBPDJ66+qlBJ8G4qtyb+6/6PSt51o6ar4MhPnFV8dZYyfZfZVoZQEot1q+qb0lAyjRicc4j0/T13Jk3HTtHsHdjCuTiVLxWIsTTgbRZCHjb9cGMtqK2/12xM4Dx/CcTa1NjaVoZ+tadr	W9TAuOA9PcH/C40FVLzKeqBS8IKCy3qM/PTgj3tOmapda8cr0DQ7UmO7IUILSpMN5uTNSp3zoD7G5FINfN+D1fvQgaqtgZkjriTDRM0LKnybdeuQl4LO1PrXbpfx21EFBVNxJg==	cBRoWnyyafM0vQ4nb2wnEKRjyyL13gvOfEE+hkBsVW3VFmCAd68zSEImWGVbxvRZ6vzuPHMRiUk4WzDtMtHIYXqaAm2AZKV+78jhuqjyZUpDrjDY1bnI1axyCpq7AHtDEEMDSa8=	+NRkDOKBGWDXq7lXHj1vSuo7zCwrfOW8qSBuGF6LimljDhEazoyY06+XpXMMYZniyQYp11jGXnWd403NYrDf3m/jza/SJh8AxPl7HrgeFKYjOkUwVoDlBAAKSt04TNQOuOYkUBM=	fGxkCXKW7IG3Kv8VsfJfcbOi4oDGQnQERQj+uoJQCwevTG/Suppa4kH63+kHtCBqb6jzRg5hf2COKlRDm44NaaFZq5Hop0kNH5H3jWpxtOJb21x+rxENNRuyT+getfUcxXKkqAMNkSRlvLSOOTqGVQ==	5gxh6UJHX54OPwqM/N0N2VkdDtB15ZtFuY3+4w4+rj9nPWvW+Wi4UsVUnjNHy91x9vtTNeV7/BKXNm4nGu775dzGeqjRn44qb0qQT1nJo3+lDxWayytgDOWfW5Rg/qRz1YCrFlo=	ICR7OoXeuCLCGj/LM12ADFNToDbRBBCWZOqmKs9qLJrPeIvzo6yQ/KRsDESfbmUdKRdSb4dUILsu3+OhjeZSVFl9TIFpouwkAMg0D8E3/bCYxlKOnA7Nvoz5zlzuPEjXuhh9HCA=	/WKO20hBVV8alUJWplPjQ+sGb5R/jdeH1I+T8NZM8YMWlwKNjBHLCEf3ZMzopKPQYNRGTLzNXQ9/HK4ldXuxLRAzKgqtAn/0nAvoWcVa4jumCFrpDzskphtYhqAxQj+iaNn3ea/b	2	d1IZoZo5xzZD+Wx7UTPG2hp7MrUL/9ioaqUj9PZGhacJrzeE5PDaPvb9lVt+QDwq+2HBaEa1PqEMbQIXU1xyKeCuDMtEW5v9EIRr0Tn9fSRI+J7UTbPTnQESD93uWBhFL2Dr5r6J6U9eoF3jRZ4=	s6PiGbp1uul11xt4fXR6GTuKXCMiPlpjwdcJJmGqwksTFbuYef1K3s7JlQDB5HKx1aIrPboEeKARI46+8aiBIaIr3ew68nk3O9SOS2w3L/jyJBa5xKURPTPdxls2BQFeJ4OZ	3	f	none	simple	t	2025-11-19 09:55:20.688325	2025-11-19 10:42:59.22014	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
9adeca75-5844-44f8-b13e-e39df0960dad	8411252	PSY2025481113	02	\N	2025-11-18	Anil Kumar	9874563215	33	M	GEN	Rahul	Psychiatry	BNS	211	02	PSYGEN02	wed	2025-11-18	2025-11-18	30-45	single	\N	\N	\N	professional	master_professional	urban	15000.00	hinduism	nuclear	Suresh	55	father	graduate	semi_skilled	15000.00	15	permanent_resident	self	Sarkaghat	India	Himachal Pradesh	Mandi	Mandi	175024	4	Unknown Doctor	205	3	t	none	simple	t	2025-11-18 19:31:21.116199	2025-11-18 22:09:11.713247	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
60eb49ca-b3d4-480b-86ee-6e948c0b82da	741852963	PSY2025556541	03	\N	2025-11-19	D7VkSPPnBBNPaFUwL0Ac4C2lOytRXKjxOpVz3wZVpKeKqSmoGu0KPPs2m/7UTbAbIUZJe83KkYXl/5iOuWU9MfvLYr2c5qmTJMk1oWVIdNk/Pp8VK1gWgDYgiZ/6wG0EgOH3BcIWtwuzodEK4w4=	d0E5k6M2wKo++gWq20lWI6M3xNAVIpZojYcMtaosTpl3x5bPdgyI2I7Am1qdMvOcfniIZ3mYOPAmJSlkE8fBF4gIjJnv+unQdafy6mTqv8wOxjJH/S4SS0SyaE5v7WB6AZI+55sb85ePww==	25	F	GEN	q+c0N4oIefp6cQKWZ+bVzCZevWc2aDJxcXNimEoh/QMluJ43XNzcp+SRBm/oLjIqzWETvPELdsWV1YsKvvlt5JJG80vzUQjwu2wFl5OSIYUij3055RCVtnciDig5YB2bOoM0UTIg+v2T/Hw=	Psychiatry	BNS	211	03	PSYGEN03	tue	2025-11-19	2025-11-19	15-30	single	\N	\N	\N	professional	master_professional	urban	25000.00	hinduism	nuclear	9CnKxmDL2tqJcGyBbUR+SdRjnzoKXeUDbVU3rBxjbXU9VaWHEUTubpnhlRrL8IO2Ph2VMXJ0GuDNbw69GSob7P36NQ7WK/Kg5Cf2QNDxRh5Z/pxJG1MpqnczSMMUpysLYnkylV849jrevqc=	60	jgrZ33jJopeRzpcrEjA3DujQLc3T7DXxNXxZDAd21GY0+wcMQw6E2MKH0Ne4UbH3slsbP51WkZDFvjBUJTUnx7NH4N9lE1VByu8LaB+NwHpCCwTLh8FNomP6JWXh71+BbtQ8vj7O	inter_diploma	of/daK35euYcpzyp3cQlT1uYexMOQK7KB2lSHEFbQT8SxwEpCLJj/VhmAu5ktDSsp74yRKYelXUmHybHwCcbNzRYDgyapaufhM46OCUEwgcX+Qx0Zgmhg66Kj1JwhvfkOh7KeLqQ2ztCB7gr	50000.00	10	permanent_resident	self	ro/fT7iXEQDv4genWck3ur7lnC3LD89IiWfvJgam60HjVMH4iLa28rJ22DkPDhja3niCfr6fkJhOCscI7DANylUNpT0a40M+pvikR5Bo7r6HRUBvxSsBLei3mwUpH9hdvtWDrY8=	India	HoHkJYg1u0h5La6ZJ4WPZcRh0D9lpFCILOSn6o4CxLyuvo89MECV7SvWGiXIt0wk9862IsiL/U61dZeXMHeK4TriamiB4tHZ4G3/c7VsaY1phB6Xe4r9xfWx6Lmxdh6iXFZgK+Q0wd1uGRlIQ6sk5A==	Ylnaw3Gljj0Gp9nyaoac0eqwGo/vAF/Gu/R4oTSvUwnqevcaof7mVDvwo53ljjBel+GJ+Dl7lrl+icdtlY/NtNRBAFljurK5VGd7x8vn8et4mnsBKpGj6iwBtNFJPhmZ3KTr/hM=	6SJiw0M9X83aFwJrw2bNJeRMdQ47IRAQ9RZgRScb2jN4HZAUH1+xaJ/1EJV8FHyTGmKD68A4mpOQHkI0429ntKvEe4atI5GdKFubuQ0V1b3Pv+UI5Qs2qKom0pwdeaVHQ6k44E8=	AyULrkicz+WG/E+YI5GA+vfySgW10vz0xElyirewvjzFywzDBn7FLpRUDAJbM54brvBa5sQzC0I4EUO3PgJ63PYFNrbaYNtYXx0P6OERBlUK5YtqIX5LrcnQ4yb1QMtjPaLE9TqO	2	Unknown Doctor	206	3	f	none	simple	t	2025-11-19 01:22:38.601316	2025-11-19 01:24:36.895182	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- TOC entry 5191 (class 0 OID 20453)
-- Dependencies: 237
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_settings (id, setting_key, setting_value, description, is_active, created_at, updated_at) FROM stdin;
1	hospital_name	Postgraduate Institute of Medical Education & Research	Hospital name	t	2025-11-18 18:19:48.954842	2025-11-18 18:19:48.954842
2	hospital_location	Chandigarh	Hospital location	t	2025-11-18 18:19:48.954842	2025-11-18 18:19:48.954842
3	department_name	Department of Psychiatry	Department name	t	2025-11-18 18:19:48.954842	2025-11-18 18:19:48.954842
4	app_version	1.0.0	Application version	t	2025-11-18 18:19:48.954842	2025-11-18 18:19:48.954842
5	maintenance_mode	false	Maintenance mode status	t	2025-11-18 18:19:48.954842	2025-11-18 18:19:48.954842
6	max_file_size	10485760	Maximum file upload size in bytes	t	2025-11-18 18:19:48.954842	2025-11-18 18:19:48.954842
7	session_timeout	3600	Session timeout in seconds	t	2025-11-18 18:19:48.954842	2025-11-18 18:19:48.954842
8	backup_frequency	daily	Database backup frequency	t	2025-11-18 18:19:48.954842	2025-11-18 18:19:48.954842
\.


--
-- TOC entry 5174 (class 0 OID 20202)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, role, email, password_hash, two_factor_secret, two_factor_enabled, backup_codes, is_active, last_login, created_at, updated_at, new_id) FROM stdin;
1	System Administrator	Admin	inventory@ihubiitmandi.in	$2a$12$ANThJjcqYV7X1PwFFiAtvO5EiidfmRsCcmTtErsAzMBSB5tB2H1rW	\N	f	\N	t	2025-11-19 08:56:48.143709	2025-11-18 18:25:19.995773	2025-11-19 08:56:48.143709	34c3a41c-c020-4f7f-a6e4-27ffda79ce0d
4	Chirag	Resident	chirag@ihubiitmandi.in	$2a$12$4J4fm74bC8Xboge6Assm4.vp22mODz5Nj5ZRZNH5Bc5CKt3gJYktO	\N	f	\N	t	2025-11-19 09:48:26.192322	2025-11-18 19:29:32.690806	2025-11-19 09:48:26.192322	d5f31f5b-bee9-4be3-bd09-10387c6bc6d8
3	Rohit Saklani	Psychiatric Welfare Officer	rohit@ihubiitmandi.in	$2a$12$qUZ8ug3xvDtGc3uQj0olLOJD1DZtgsWIkQz1p3pJ/29eV0VcQXZ8G	\N	f	\N	t	2025-11-19 09:49:15.824911	2025-11-18 18:37:43.835447	2025-11-19 09:49:15.824911	c694e820-a58a-4380-af12-c14b50a09b9e
2	Fariyad Khan	Faculty	fariyad@ihubiitmandi.in	$2a$12$IrG5yDqDJbh4vjiMqYmvM./HyvaEmz7KFV5tZACZiC5OLHoGPyCfe	\N	f	\N	t	2025-11-19 10:44:43.005456	2025-11-18 18:37:04.164572	2025-11-19 10:44:43.005456	f59c7cf1-2428-4f5b-ab36-522c05a0fd6d
\.


--
-- TOC entry 5306 (class 0 OID 0)
-- Dependencies: 222
-- Name: adl_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.adl_files_id_seq', 5, true);


--
-- TOC entry 5307 (class 0 OID 0)
-- Dependencies: 238
-- Name: audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_log_id_seq', 1, false);


--
-- TOC entry 5308 (class 0 OID 0)
-- Dependencies: 224
-- Name: clinical_proforma_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clinical_proforma_id_seq', 14, true);


--
-- TOC entry 5309 (class 0 OID 0)
-- Dependencies: 226
-- Name: file_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.file_movements_id_seq', 1, false);


--
-- TOC entry 5310 (class 0 OID 0)
-- Dependencies: 234
-- Name: login_otps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.login_otps_id_seq', 1, false);


--
-- TOC entry 5311 (class 0 OID 0)
-- Dependencies: 232
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 1, false);


--
-- TOC entry 5312 (class 0 OID 0)
-- Dependencies: 228
-- Name: patient_visits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patient_visits_id_seq', 8, true);


--
-- TOC entry 5313 (class 0 OID 0)
-- Dependencies: 230
-- Name: prescriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prescriptions_id_seq', 1, true);


--
-- TOC entry 5314 (class 0 OID 0)
-- Dependencies: 236
-- Name: system_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.system_settings_id_seq', 8, true);


--
-- TOC entry 5315 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- TOC entry 4952 (class 2606 OID 20288)
-- Name: adl_files adl_files_adl_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adl_files
    ADD CONSTRAINT adl_files_adl_no_key UNIQUE (adl_no);


--
-- TOC entry 4954 (class 2606 OID 20286)
-- Name: adl_files adl_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adl_files
    ADD CONSTRAINT adl_files_pkey PRIMARY KEY (id);


--
-- TOC entry 4993 (class 2606 OID 20475)
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- TOC entry 4960 (class 2606 OID 20321)
-- Name: clinical_proforma clinical_proforma_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinical_proforma
    ADD CONSTRAINT clinical_proforma_pkey PRIMARY KEY (id);


--
-- TOC entry 4969 (class 2606 OID 20353)
-- Name: file_movements file_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_movements
    ADD CONSTRAINT file_movements_pkey PRIMARY KEY (id);


--
-- TOC entry 4987 (class 2606 OID 20446)
-- Name: login_otps login_otps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_otps
    ADD CONSTRAINT login_otps_pkey PRIMARY KEY (id);


--
-- TOC entry 4983 (class 2606 OID 20429)
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4985 (class 2606 OID 20431)
-- Name: password_reset_tokens password_reset_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_key UNIQUE (token);


--
-- TOC entry 4978 (class 2606 OID 20383)
-- Name: patient_visits patient_visits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_visits
    ADD CONSTRAINT patient_visits_pkey PRIMARY KEY (id);


--
-- TOC entry 4981 (class 2606 OID 20414)
-- Name: prescriptions prescriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_pkey PRIMARY KEY (id);


--
-- TOC entry 4946 (class 2606 OID 20240)
-- Name: registered_patient registered_patient_adl_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registered_patient
    ADD CONSTRAINT registered_patient_adl_no_key UNIQUE (adl_no);


--
-- TOC entry 4948 (class 2606 OID 20238)
-- Name: registered_patient registered_patient_cr_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registered_patient
    ADD CONSTRAINT registered_patient_cr_no_key UNIQUE (cr_no);


--
-- TOC entry 4950 (class 2606 OID 20236)
-- Name: registered_patient registered_patient_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registered_patient
    ADD CONSTRAINT registered_patient_pkey PRIMARY KEY (id);


--
-- TOC entry 4989 (class 2606 OID 20463)
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 4991 (class 2606 OID 20465)
-- Name: system_settings system_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_setting_key_key UNIQUE (setting_key);


--
-- TOC entry 4933 (class 2606 OID 20216)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4935 (class 2606 OID 20214)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4955 (class 1259 OID 20503)
-- Name: idx_adl_files_adl_no; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_adl_files_adl_no ON public.adl_files USING btree (adl_no);


--
-- TOC entry 4956 (class 1259 OID 20505)
-- Name: idx_adl_files_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_adl_files_created_by ON public.adl_files USING btree (created_by);


--
-- TOC entry 4957 (class 1259 OID 20502)
-- Name: idx_adl_files_patient_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_adl_files_patient_id ON public.adl_files USING btree (patient_id);


--
-- TOC entry 4958 (class 1259 OID 20504)
-- Name: idx_adl_files_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_adl_files_status ON public.adl_files USING btree (file_status);


--
-- TOC entry 4994 (class 1259 OID 20516)
-- Name: idx_audit_log_changed_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_log_changed_at ON public.audit_log USING btree (changed_at);


--
-- TOC entry 4995 (class 1259 OID 20515)
-- Name: idx_audit_log_changed_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_log_changed_by ON public.audit_log USING btree (changed_by);


--
-- TOC entry 4996 (class 1259 OID 20514)
-- Name: idx_audit_log_table_record; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_log_table_record ON public.audit_log USING btree (table_name, record_id);


--
-- TOC entry 4961 (class 1259 OID 20501)
-- Name: idx_clinical_case_severity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clinical_case_severity ON public.clinical_proforma USING btree (case_severity);


--
-- TOC entry 4962 (class 1259 OID 20500)
-- Name: idx_clinical_doctor_decision; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clinical_doctor_decision ON public.clinical_proforma USING btree (doctor_decision);


--
-- TOC entry 4963 (class 1259 OID 20497)
-- Name: idx_clinical_filled_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clinical_filled_by ON public.clinical_proforma USING btree (filled_by);


--
-- TOC entry 4964 (class 1259 OID 20496)
-- Name: idx_clinical_patient_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clinical_patient_id ON public.clinical_proforma USING btree (patient_id);


--
-- TOC entry 4965 (class 1259 OID 20567)
-- Name: idx_clinical_proforma_assigned_doctor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clinical_proforma_assigned_doctor ON public.clinical_proforma USING btree (assigned_doctor);


--
-- TOC entry 4966 (class 1259 OID 20498)
-- Name: idx_clinical_visit_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clinical_visit_date ON public.clinical_proforma USING btree (visit_date);


--
-- TOC entry 4967 (class 1259 OID 20499)
-- Name: idx_clinical_visit_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clinical_visit_type ON public.clinical_proforma USING btree (visit_type);


--
-- TOC entry 4970 (class 1259 OID 20506)
-- Name: idx_file_movements_adl_file_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_file_movements_adl_file_id ON public.file_movements USING btree (adl_file_id);


--
-- TOC entry 4971 (class 1259 OID 20508)
-- Name: idx_file_movements_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_file_movements_date ON public.file_movements USING btree (movement_date);


--
-- TOC entry 4972 (class 1259 OID 20507)
-- Name: idx_file_movements_patient_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_file_movements_patient_id ON public.file_movements USING btree (patient_id);


--
-- TOC entry 4973 (class 1259 OID 20512)
-- Name: idx_patient_visits_assigned_doctor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patient_visits_assigned_doctor_id ON public.patient_visits USING btree (assigned_doctor_id);


--
-- TOC entry 4974 (class 1259 OID 20510)
-- Name: idx_patient_visits_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patient_visits_date ON public.patient_visits USING btree (visit_date);


--
-- TOC entry 4975 (class 1259 OID 20509)
-- Name: idx_patient_visits_patient_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patient_visits_patient_id ON public.patient_visits USING btree (patient_id);


--
-- TOC entry 4976 (class 1259 OID 20511)
-- Name: idx_patient_visits_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patient_visits_status ON public.patient_visits USING btree (visit_status);


--
-- TOC entry 4979 (class 1259 OID 20513)
-- Name: idx_prescriptions_clinical_proforma_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prescriptions_clinical_proforma_id ON public.prescriptions USING btree (clinical_proforma_id);


--
-- TOC entry 4936 (class 1259 OID 20486)
-- Name: idx_registered_patient_adl_no; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registered_patient_adl_no ON public.registered_patient USING btree (adl_no);


--
-- TOC entry 4937 (class 1259 OID 20490)
-- Name: idx_registered_patient_assigned_doctor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registered_patient_assigned_doctor_id ON public.registered_patient USING btree (assigned_doctor_id);


--
-- TOC entry 4938 (class 1259 OID 20488)
-- Name: idx_registered_patient_case_complexity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registered_patient_case_complexity ON public.registered_patient USING btree (case_complexity);


--
-- TOC entry 4939 (class 1259 OID 20484)
-- Name: idx_registered_patient_cr_no; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registered_patient_cr_no ON public.registered_patient USING btree (cr_no);


--
-- TOC entry 4940 (class 1259 OID 20492)
-- Name: idx_registered_patient_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registered_patient_created_at ON public.registered_patient USING btree (created_at);


--
-- TOC entry 4941 (class 1259 OID 20487)
-- Name: idx_registered_patient_file_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registered_patient_file_status ON public.registered_patient USING btree (file_status);


--
-- TOC entry 4942 (class 1259 OID 20491)
-- Name: idx_registered_patient_filled_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registered_patient_filled_by ON public.registered_patient USING btree (filled_by);


--
-- TOC entry 4943 (class 1259 OID 20489)
-- Name: idx_registered_patient_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registered_patient_is_active ON public.registered_patient USING btree (is_active);


--
-- TOC entry 4944 (class 1259 OID 20946)
-- Name: idx_registered_patient_psy_no; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registered_patient_psy_no ON public.registered_patient USING btree (psy_no);


--
-- TOC entry 4929 (class 1259 OID 20481)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 4930 (class 1259 OID 20483)
-- Name: idx_users_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_is_active ON public.users USING btree (is_active);


--
-- TOC entry 4931 (class 1259 OID 20482)
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- TOC entry 5020 (class 2620 OID 20522)
-- Name: adl_files update_adl_files_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_adl_files_updated_at BEFORE UPDATE ON public.adl_files FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5021 (class 2620 OID 20521)
-- Name: clinical_proforma update_clinical_proforma_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_clinical_proforma_updated_at BEFORE UPDATE ON public.clinical_proforma FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5025 (class 2620 OID 20527)
-- Name: login_otps update_login_otps_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_login_otps_updated_at BEFORE UPDATE ON public.login_otps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5024 (class 2620 OID 20526)
-- Name: password_reset_tokens update_password_reset_tokens_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_password_reset_tokens_updated_at BEFORE UPDATE ON public.password_reset_tokens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5022 (class 2620 OID 20523)
-- Name: patient_visits update_patient_visits_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_patient_visits_updated_at BEFORE UPDATE ON public.patient_visits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5023 (class 2620 OID 20524)
-- Name: prescriptions update_prescriptions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5019 (class 2620 OID 20519)
-- Name: registered_patient update_registered_patient_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_registered_patient_updated_at BEFORE UPDATE ON public.registered_patient FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5026 (class 2620 OID 20525)
-- Name: system_settings update_system_settings_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5018 (class 2620 OID 20518)
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4999 (class 2606 OID 20294)
-- Name: adl_files adl_files_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adl_files
    ADD CONSTRAINT adl_files_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5000 (class 2606 OID 20299)
-- Name: adl_files adl_files_last_accessed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adl_files
    ADD CONSTRAINT adl_files_last_accessed_by_fkey FOREIGN KEY (last_accessed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5001 (class 2606 OID 20289)
-- Name: adl_files adl_files_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adl_files
    ADD CONSTRAINT adl_files_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.registered_patient(id) ON DELETE CASCADE;


--
-- TOC entry 5017 (class 2606 OID 20476)
-- Name: audit_log audit_log_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5003 (class 2606 OID 20332)
-- Name: clinical_proforma clinical_proforma_adl_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinical_proforma
    ADD CONSTRAINT clinical_proforma_adl_file_id_fkey FOREIGN KEY (adl_file_id) REFERENCES public.adl_files(id) ON DELETE SET NULL;


--
-- TOC entry 5004 (class 2606 OID 20562)
-- Name: clinical_proforma clinical_proforma_assigned_doctor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinical_proforma
    ADD CONSTRAINT clinical_proforma_assigned_doctor_fkey FOREIGN KEY (assigned_doctor) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5005 (class 2606 OID 20327)
-- Name: clinical_proforma clinical_proforma_filled_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinical_proforma
    ADD CONSTRAINT clinical_proforma_filled_by_fkey FOREIGN KEY (filled_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5006 (class 2606 OID 20322)
-- Name: clinical_proforma clinical_proforma_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinical_proforma
    ADD CONSTRAINT clinical_proforma_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.registered_patient(id) ON DELETE CASCADE;


--
-- TOC entry 5007 (class 2606 OID 20354)
-- Name: file_movements file_movements_adl_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_movements
    ADD CONSTRAINT file_movements_adl_file_id_fkey FOREIGN KEY (adl_file_id) REFERENCES public.adl_files(id) ON DELETE CASCADE;


--
-- TOC entry 5008 (class 2606 OID 20364)
-- Name: file_movements file_movements_moved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_movements
    ADD CONSTRAINT file_movements_moved_by_fkey FOREIGN KEY (moved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5009 (class 2606 OID 20359)
-- Name: file_movements file_movements_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_movements
    ADD CONSTRAINT file_movements_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.registered_patient(id) ON DELETE SET NULL;


--
-- TOC entry 5002 (class 2606 OID 20337)
-- Name: adl_files fk_adl_files_clinical_proforma_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adl_files
    ADD CONSTRAINT fk_adl_files_clinical_proforma_id FOREIGN KEY (clinical_proforma_id) REFERENCES public.clinical_proforma(id) ON DELETE SET NULL;


--
-- TOC entry 5016 (class 2606 OID 20447)
-- Name: login_otps login_otps_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_otps
    ADD CONSTRAINT login_otps_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5015 (class 2606 OID 20432)
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5010 (class 2606 OID 20389)
-- Name: patient_visits patient_visits_adl_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_visits
    ADD CONSTRAINT patient_visits_adl_file_id_fkey FOREIGN KEY (adl_file_id) REFERENCES public.adl_files(id) ON DELETE SET NULL;


--
-- TOC entry 5011 (class 2606 OID 20399)
-- Name: patient_visits patient_visits_assigned_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_visits
    ADD CONSTRAINT patient_visits_assigned_doctor_id_fkey FOREIGN KEY (assigned_doctor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5012 (class 2606 OID 20394)
-- Name: patient_visits patient_visits_clinical_proforma_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_visits
    ADD CONSTRAINT patient_visits_clinical_proforma_id_fkey FOREIGN KEY (clinical_proforma_id) REFERENCES public.clinical_proforma(id) ON DELETE SET NULL;


--
-- TOC entry 5013 (class 2606 OID 20384)
-- Name: patient_visits patient_visits_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_visits
    ADD CONSTRAINT patient_visits_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.registered_patient(id) ON DELETE CASCADE;


--
-- TOC entry 5014 (class 2606 OID 20415)
-- Name: prescriptions prescriptions_clinical_proforma_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_clinical_proforma_id_fkey FOREIGN KEY (clinical_proforma_id) REFERENCES public.clinical_proforma(id) ON DELETE CASCADE;


--
-- TOC entry 4997 (class 2606 OID 20241)
-- Name: registered_patient registered_patient_assigned_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registered_patient
    ADD CONSTRAINT registered_patient_assigned_doctor_id_fkey FOREIGN KEY (assigned_doctor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4998 (class 2606 OID 20246)
-- Name: registered_patient registered_patient_filled_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registered_patient
    ADD CONSTRAINT registered_patient_filled_by_fkey FOREIGN KEY (filled_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5199 (class 0 OID 0)
-- Dependencies: 7
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO fariyad;


--
-- TOC entry 5202 (class 0 OID 0)
-- Dependencies: 298
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.armor(bytea) TO fariyad;


--
-- TOC entry 5203 (class 0 OID 0)
-- Dependencies: 299
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.armor(bytea, text[], text[]) TO fariyad;


--
-- TOC entry 5204 (class 0 OID 0)
-- Dependencies: 245
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.crypt(text, text) TO fariyad;


--
-- TOC entry 5205 (class 0 OID 0)
-- Dependencies: 300
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.dearmor(text) TO fariyad;


--
-- TOC entry 5206 (class 0 OID 0)
-- Dependencies: 249
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.decrypt(bytea, bytea, text) TO fariyad;


--
-- TOC entry 5207 (class 0 OID 0)
-- Dependencies: 251
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.decrypt_iv(bytea, bytea, bytea, text) TO fariyad;


--
-- TOC entry 5208 (class 0 OID 0)
-- Dependencies: 242
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.digest(bytea, text) TO fariyad;


--
-- TOC entry 5209 (class 0 OID 0)
-- Dependencies: 241
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.digest(text, text) TO fariyad;


--
-- TOC entry 5210 (class 0 OID 0)
-- Dependencies: 248
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.encrypt(bytea, bytea, text) TO fariyad;


--
-- TOC entry 5211 (class 0 OID 0)
-- Dependencies: 250
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.encrypt_iv(bytea, bytea, bytea, text) TO fariyad;


--
-- TOC entry 5212 (class 0 OID 0)
-- Dependencies: 263
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gen_random_bytes(integer) TO fariyad;


--
-- TOC entry 5213 (class 0 OID 0)
-- Dependencies: 264
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gen_random_uuid() TO fariyad;


--
-- TOC entry 5214 (class 0 OID 0)
-- Dependencies: 246
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gen_salt(text) TO fariyad;


--
-- TOC entry 5215 (class 0 OID 0)
-- Dependencies: 247
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gen_salt(text, integer) TO fariyad;


--
-- TOC entry 5216 (class 0 OID 0)
-- Dependencies: 292
-- Name: FUNCTION generate_adl_number(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.generate_adl_number() TO fariyad;


--
-- TOC entry 5217 (class 0 OID 0)
-- Dependencies: 265
-- Name: FUNCTION generate_cr_number(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.generate_cr_number() TO fariyad;


--
-- TOC entry 5218 (class 0 OID 0)
-- Dependencies: 291
-- Name: FUNCTION generate_psy_number(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.generate_psy_number() TO fariyad;


--
-- TOC entry 5219 (class 0 OID 0)
-- Dependencies: 244
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.hmac(bytea, bytea, text) TO fariyad;


--
-- TOC entry 5220 (class 0 OID 0)
-- Dependencies: 243
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.hmac(text, text, text) TO fariyad;


--
-- TOC entry 5221 (class 0 OID 0)
-- Dependencies: 301
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_armor_headers(text, OUT key text, OUT value text) TO fariyad;


--
-- TOC entry 5222 (class 0 OID 0)
-- Dependencies: 297
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_key_id(bytea) TO fariyad;


--
-- TOC entry 5223 (class 0 OID 0)
-- Dependencies: 288
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea) TO fariyad;


--
-- TOC entry 5224 (class 0 OID 0)
-- Dependencies: 293
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea, text) TO fariyad;


--
-- TOC entry 5225 (class 0 OID 0)
-- Dependencies: 295
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea, text, text) TO fariyad;


--
-- TOC entry 5226 (class 0 OID 0)
-- Dependencies: 289
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea) TO fariyad;


--
-- TOC entry 5227 (class 0 OID 0)
-- Dependencies: 294
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text) TO fariyad;


--
-- TOC entry 5228 (class 0 OID 0)
-- Dependencies: 296
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO fariyad;


--
-- TOC entry 5229 (class 0 OID 0)
-- Dependencies: 274
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_encrypt(text, bytea) TO fariyad;


--
-- TOC entry 5230 (class 0 OID 0)
-- Dependencies: 276
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_encrypt(text, bytea, text) TO fariyad;


--
-- TOC entry 5231 (class 0 OID 0)
-- Dependencies: 275
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea) TO fariyad;


--
-- TOC entry 5232 (class 0 OID 0)
-- Dependencies: 281
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea, text) TO fariyad;


--
-- TOC entry 5233 (class 0 OID 0)
-- Dependencies: 270
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_decrypt(bytea, text) TO fariyad;


--
-- TOC entry 5234 (class 0 OID 0)
-- Dependencies: 272
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_decrypt(bytea, text, text) TO fariyad;


--
-- TOC entry 5235 (class 0 OID 0)
-- Dependencies: 271
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_decrypt_bytea(bytea, text) TO fariyad;


--
-- TOC entry 5236 (class 0 OID 0)
-- Dependencies: 273
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_decrypt_bytea(bytea, text, text) TO fariyad;


--
-- TOC entry 5237 (class 0 OID 0)
-- Dependencies: 266
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_encrypt(text, text) TO fariyad;


--
-- TOC entry 5238 (class 0 OID 0)
-- Dependencies: 268
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_encrypt(text, text, text) TO fariyad;


--
-- TOC entry 5239 (class 0 OID 0)
-- Dependencies: 267
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_encrypt_bytea(bytea, text) TO fariyad;


--
-- TOC entry 5240 (class 0 OID 0)
-- Dependencies: 269
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_encrypt_bytea(bytea, text, text) TO fariyad;


--
-- TOC entry 5241 (class 0 OID 0)
-- Dependencies: 262
-- Name: FUNCTION update_updated_at_column(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_updated_at_column() TO fariyad;


--
-- TOC entry 5242 (class 0 OID 0)
-- Dependencies: 257
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_generate_v1() TO fariyad;


--
-- TOC entry 5243 (class 0 OID 0)
-- Dependencies: 258
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_generate_v1mc() TO fariyad;


--
-- TOC entry 5244 (class 0 OID 0)
-- Dependencies: 259
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_generate_v3(namespace uuid, name text) TO fariyad;


--
-- TOC entry 5245 (class 0 OID 0)
-- Dependencies: 260
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_generate_v4() TO fariyad;


--
-- TOC entry 5246 (class 0 OID 0)
-- Dependencies: 261
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_generate_v5(namespace uuid, name text) TO fariyad;


--
-- TOC entry 5247 (class 0 OID 0)
-- Dependencies: 252
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_nil() TO fariyad;


--
-- TOC entry 5248 (class 0 OID 0)
-- Dependencies: 253
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_ns_dns() TO fariyad;


--
-- TOC entry 5249 (class 0 OID 0)
-- Dependencies: 255
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_ns_oid() TO fariyad;


--
-- TOC entry 5250 (class 0 OID 0)
-- Dependencies: 254
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_ns_url() TO fariyad;


--
-- TOC entry 5251 (class 0 OID 0)
-- Dependencies: 256
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_ns_x500() TO fariyad;


--
-- TOC entry 5263 (class 0 OID 0)
-- Dependencies: 223
-- Name: TABLE adl_files; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.adl_files TO fariyad;


--
-- TOC entry 5265 (class 0 OID 0)
-- Dependencies: 222
-- Name: SEQUENCE adl_files_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.adl_files_id_seq TO fariyad;


--
-- TOC entry 5267 (class 0 OID 0)
-- Dependencies: 239
-- Name: TABLE audit_log; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.audit_log TO fariyad;


--
-- TOC entry 5269 (class 0 OID 0)
-- Dependencies: 238
-- Name: SEQUENCE audit_log_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.audit_log_id_seq TO fariyad;


--
-- TOC entry 5272 (class 0 OID 0)
-- Dependencies: 225
-- Name: TABLE clinical_proforma; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.clinical_proforma TO fariyad;


--
-- TOC entry 5274 (class 0 OID 0)
-- Dependencies: 224
-- Name: SEQUENCE clinical_proforma_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.clinical_proforma_id_seq TO fariyad;


--
-- TOC entry 5276 (class 0 OID 0)
-- Dependencies: 227
-- Name: TABLE file_movements; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.file_movements TO fariyad;


--
-- TOC entry 5278 (class 0 OID 0)
-- Dependencies: 226
-- Name: SEQUENCE file_movements_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.file_movements_id_seq TO fariyad;


--
-- TOC entry 5280 (class 0 OID 0)
-- Dependencies: 235
-- Name: TABLE login_otps; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.login_otps TO fariyad;


--
-- TOC entry 5282 (class 0 OID 0)
-- Dependencies: 234
-- Name: SEQUENCE login_otps_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.login_otps_id_seq TO fariyad;


--
-- TOC entry 5284 (class 0 OID 0)
-- Dependencies: 233
-- Name: TABLE password_reset_tokens; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.password_reset_tokens TO fariyad;


--
-- TOC entry 5286 (class 0 OID 0)
-- Dependencies: 232
-- Name: SEQUENCE password_reset_tokens_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.password_reset_tokens_id_seq TO fariyad;


--
-- TOC entry 5288 (class 0 OID 0)
-- Dependencies: 229
-- Name: TABLE patient_visits; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.patient_visits TO fariyad;


--
-- TOC entry 5290 (class 0 OID 0)
-- Dependencies: 228
-- Name: SEQUENCE patient_visits_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.patient_visits_id_seq TO fariyad;


--
-- TOC entry 5292 (class 0 OID 0)
-- Dependencies: 231
-- Name: TABLE prescriptions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.prescriptions TO fariyad;


--
-- TOC entry 5294 (class 0 OID 0)
-- Dependencies: 230
-- Name: SEQUENCE prescriptions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.prescriptions_id_seq TO fariyad;


--
-- TOC entry 5296 (class 0 OID 0)
-- Dependencies: 221
-- Name: TABLE registered_patient; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.registered_patient TO fariyad;


--
-- TOC entry 5298 (class 0 OID 0)
-- Dependencies: 237
-- Name: TABLE system_settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.system_settings TO fariyad;


--
-- TOC entry 5300 (class 0 OID 0)
-- Dependencies: 236
-- Name: SEQUENCE system_settings_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.system_settings_id_seq TO fariyad;


--
-- TOC entry 5302 (class 0 OID 0)
-- Dependencies: 220
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO fariyad;


--
-- TOC entry 5303 (class 0 OID 0)
-- Dependencies: 240
-- Name: TABLE user_stats; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_stats TO fariyad;


--
-- TOC entry 5305 (class 0 OID 0)
-- Dependencies: 219
-- Name: SEQUENCE users_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.users_id_seq TO fariyad;


--
-- TOC entry 2150 (class 826 OID 20542)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO fariyad;


--
-- TOC entry 2151 (class 826 OID 20543)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO fariyad;


--
-- TOC entry 2149 (class 826 OID 20541)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO fariyad;


-- Completed on 2025-11-19 10:55:43

--
-- PostgreSQL database dump complete
--

\unrestrict 1uya4b4RdkEyJrLhqJOtMijnhrOhrjv6gc2qvrxsKtuta06okisJSMUf6lYrRfC

