--
-- PostgreSQL database dump
--

\restrict 7WXbM85KJDPRue2VLortEfzAVMVMrYU1cy6DxOwYjoTugobyEi0PUhUCS3FJcHL

-- Dumped from database version 17.4 (Ubuntu 17.4-1.pgdg24.04+2)
-- Dumped by pg_dump version 17.6 (Ubuntu 17.6-1.pgdg22.04+1)

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: role_8dcaff960
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO role_8dcaff960;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: role_8dcaff960
--

COMMENT ON SCHEMA public IS '';


--
-- Name: CasePriority; Type: TYPE; Schema: public; Owner: role_8dcaff960
--

CREATE TYPE public."CasePriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


ALTER TYPE public."CasePriority" OWNER TO role_8dcaff960;

--
-- Name: CaseStatus; Type: TYPE; Schema: public; Owner: role_8dcaff960
--

CREATE TYPE public."CaseStatus" AS ENUM (
    'NEW',
    'IN_PROGRESS',
    'REVIEW',
    'COMPLETED'
);


ALTER TYPE public."CaseStatus" OWNER TO role_8dcaff960;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: role_8dcaff960
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMINISTRATOR',
    'USER'
);


ALTER TYPE public."UserRole" OWNER TO role_8dcaff960;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: role_8dcaff960
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public."Account" OWNER TO role_8dcaff960;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: role_8dcaff960
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO role_8dcaff960;

--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: role_8dcaff960
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationToken" OWNER TO role_8dcaff960;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: role_8dcaff960
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO role_8dcaff960;

--
-- Name: activities; Type: TABLE; Schema: public; Owner: role_8dcaff960
--

CREATE TABLE public.activities (
    id text NOT NULL,
    type text NOT NULL,
    description text NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text,
    "caseId" text
);


ALTER TABLE public.activities OWNER TO role_8dcaff960;

--
-- Name: cases; Type: TABLE; Schema: public; Owner: role_8dcaff960
--

CREATE TABLE public.cases (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    status public."CaseStatus" DEFAULT 'NEW'::public."CaseStatus" NOT NULL,
    priority public."CasePriority" DEFAULT 'MEDIUM'::public."CasePriority" NOT NULL,
    "clientName" text,
    "clientEmail" text,
    "clientPhone" text,
    "dueDate" timestamp(3) without time zone,
    tags text[] DEFAULT ARRAY[]::text[],
    notes text,
    progress integer DEFAULT 0 NOT NULL,
    "estimatedHours" double precision,
    "actualHours" double precision DEFAULT 0 NOT NULL,
    "hourlyRate" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "assignedToId" text,
    "createdById" text
);


ALTER TABLE public.cases OWNER TO role_8dcaff960;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: role_8dcaff960
--

CREATE TABLE public.comments (
    id text NOT NULL,
    content text NOT NULL,
    "isInternal" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "caseId" text NOT NULL,
    "authorId" text NOT NULL
);


ALTER TABLE public.comments OWNER TO role_8dcaff960;

--
-- Name: court_decisions; Type: TABLE; Schema: public; Owner: role_8dcaff960
--

CREATE TABLE public.court_decisions (
    id text NOT NULL,
    title text NOT NULL,
    court text NOT NULL,
    "caseNumber" text,
    date timestamp(3) without time zone,
    summary text,
    url text,
    relevance text,
    precedent boolean DEFAULT false NOT NULL,
    outcome text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "caseId" text NOT NULL,
    "addedById" text
);


ALTER TABLE public.court_decisions OWNER TO role_8dcaff960;

--
-- Name: document_types; Type: TABLE; Schema: public; Owner: role_8dcaff960
--

CREATE TABLE public.document_types (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    icon text,
    required boolean DEFAULT false NOT NULL,
    category text,
    template text,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "caseId" text NOT NULL
);


ALTER TABLE public.document_types OWNER TO role_8dcaff960;

--
-- Name: files; Type: TABLE; Schema: public; Owner: role_8dcaff960
--

CREATE TABLE public.files (
    id text NOT NULL,
    "originalName" text NOT NULL,
    "fileName" text NOT NULL,
    "fileSize" integer NOT NULL,
    "mimeType" text NOT NULL,
    "filePath" text NOT NULL,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "caseId" text NOT NULL,
    "uploadedById" text NOT NULL
);


ALTER TABLE public.files OWNER TO role_8dcaff960;

--
-- Name: legal_references; Type: TABLE; Schema: public; Owner: role_8dcaff960
--

CREATE TABLE public.legal_references (
    id text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    citation text NOT NULL,
    url text,
    summary text,
    relevance text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "caseId" text NOT NULL,
    "addedById" text
);


ALTER TABLE public.legal_references OWNER TO role_8dcaff960;

--
-- Name: legal_statutes; Type: TABLE; Schema: public; Owner: role_8dcaff960
--

CREATE TABLE public.legal_statutes (
    id text NOT NULL,
    title text NOT NULL,
    chapter text,
    section text,
    subsection text,
    description text,
    url text,
    notes text,
    priority text DEFAULT 'MEDIUM'::text NOT NULL,
    status text DEFAULT 'TO_REVIEW'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "caseId" text NOT NULL,
    "addedById" text
);


ALTER TABLE public.legal_statutes OWNER TO role_8dcaff960;

--
-- Name: milestones; Type: TABLE; Schema: public; Owner: role_8dcaff960
--

CREATE TABLE public.milestones (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "dueDate" timestamp(3) without time zone,
    completed boolean DEFAULT false NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "caseId" text NOT NULL,
    "completedById" text,
    "assignedToId" text,
    "estimatedHours" double precision
);


ALTER TABLE public.milestones OWNER TO role_8dcaff960;

--
-- Name: time_entries; Type: TABLE; Schema: public; Owner: role_8dcaff960
--

CREATE TABLE public.time_entries (
    id text NOT NULL,
    description text,
    hours double precision NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    billable boolean DEFAULT true NOT NULL,
    "hourlyRate" double precision,
    amount double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "caseId" text NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public.time_entries OWNER TO role_8dcaff960;

--
-- Name: users; Type: TABLE; Schema: public; Owner: role_8dcaff960
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text,
    email text NOT NULL,
    "emailVerified" timestamp(3) without time zone,
    image text,
    password text,
    role public."UserRole" DEFAULT 'USER'::public."UserRole" NOT NULL,
    "firstName" text,
    "lastName" text,
    phone text,
    "position" text,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO role_8dcaff960;

--
-- Name: workflow_steps; Type: TABLE; Schema: public; Owner: role_8dcaff960
--

CREATE TABLE public.workflow_steps (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "order" integer NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "dueDate" timestamp(3) without time zone,
    "assignedToId" text,
    dependencies text[],
    "estimatedHours" double precision,
    "actualHours" double precision DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "caseId" text NOT NULL
);


ALTER TABLE public.workflow_steps OWNER TO role_8dcaff960;

--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: role_8dcaff960
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: role_8dcaff960
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: role_8dcaff960
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: role_8dcaff960
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
5353e466-a3bc-4e48-95c0-78a2350f8ac5	0ade68b9276b9779891cf007aec0fc81ef6c47a9632d153e0caceb575bc0a79d	2025-08-18 21:05:26.68078+00	20250818181537_init	\N	\N	2025-08-18 21:05:26.64709+00	1
\.


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: role_8dcaff960
--

COPY public.activities (id, type, description, metadata, "createdAt", "userId", "caseId") FROM stdin;
cmei800aq0004lg010cmn7ycx	case_created	Case "asdfadf" was created with 1 milestones, 0 workflow steps, 0 document types, 0 legal statutes, 0 court decisions, and 0 drive links	{"status": "NEW", "priority": "MEDIUM", "driveLinksCount": 0, "milestonesCount": 1, "documentTypesCount": 0, "legalStatutesCount": 0, "workflowStepsCount": 0, "courtDecisionsCount": 0}	2025-08-19 07:26:31.298	cmehltbhb0000sgle70okdgdg	cmei800am0001lg01z3z1nqb5
cmei89i8e0008lg01zdf58td1	comment_added	Added a public comment	\N	2025-08-19 07:33:54.446	cmehltbhb0000sgle70okdgdg	cmei800am0001lg01z3z1nqb5
cmei8a6xy000clg01ydymit3l	milestone_added	Added milestone: Komplettering av underlag	\N	2025-08-19 07:34:26.471	cmehltbhb0000sgle70okdgdg	cmei800am0001lg01z3z1nqb5
cmei8a8re000elg01oljyk463	milestone_completed	Completed milestone: Komplettering av underlag	\N	2025-08-19 07:34:28.826	cmehltbhb0000sgle70okdgdg	cmei800am0001lg01z3z1nqb5
cmei8axhu000ilg01ebl4k0ov	time_logged	Logged 2 hours	{"hours": 2, "amount": 400, "billable": true}	2025-08-19 07:35:00.882	cmehltbhb0000sgle70okdgdg	cmei800am0001lg01z3z1nqb5
cmei8g9r1000mlg01gv37w00f	milestone_added	Added milestone: Stämningsansökan	\N	2025-08-19 07:39:10.046	cmehltbhb0000sgle70okdgdg	cmei800am0001lg01z3z1nqb5
cmei8gbyk000olg013enh3pl4	milestone_completed	Completed milestone: Stämningsansökan	\N	2025-08-19 07:39:12.908	cmehltbhb0000sgle70okdgdg	cmei800am0001lg01z3z1nqb5
cmei8gco9000qlg01bx1eu5iw	milestone_uncompleted	Uncompleted milestone: Stämningsansökan	\N	2025-08-19 07:39:13.833	cmehltbhb0000sgle70okdgdg	cmei800am0001lg01z3z1nqb5
cmei8gowo000slg01qvmxycxp	milestone_completed	Completed milestone: 1111	\N	2025-08-19 07:39:29.688	cmehltbhb0000sgle70okdgdg	cmei800am0001lg01z3z1nqb5
cmei8grag000ulg01rasr55r4	milestone_completed	Completed milestone: Stämningsansökan	\N	2025-08-19 07:39:32.777	cmehltbhb0000sgle70okdgdg	cmei800am0001lg01z3z1nqb5
cmei8gtkh000wlg0134orapdv	milestone_uncompleted	Uncompleted milestone: Komplettering av underlag	\N	2025-08-19 07:39:35.729	cmehltbhb0000sgle70okdgdg	cmei800am0001lg01z3z1nqb5
cmei8gvqj000ylg01s29fo0vu	milestone_uncompleted	Uncompleted milestone: Stämningsansökan	\N	2025-08-19 07:39:38.54	cmehltbhb0000sgle70okdgdg	cmei800am0001lg01z3z1nqb5
cmei8xyfe0012lg014xlprkpv	legal_reference_added	Added legal reference: CRM ./. LAWARE	\N	2025-08-19 07:52:55.178	cmehltbhb0000sgle70okdgdg	cmei800am0001lg01z3z1nqb5
cmeictpuz0001lg01etyxo7s7	milestone_completed	Completed milestone: 1111	\N	2025-08-19 09:41:35.915	cmehltbhb0000sgle70okdgdg	cmei800am0001lg01z3z1nqb5
cmeictsfu0003lg0108e9n1rm	milestone_completed	Completed milestone: Komplettering av underlag	\N	2025-08-19 09:41:39.259	cmehltbhb0000sgle70okdgdg	cmei800am0001lg01z3z1nqb5
cmeicx6t00005lg01az3mnlf0	milestone_uncompleted	Uncompleted milestone: 1111	\N	2025-08-19 09:44:17.844	cmehltbhb0000sgle70okdgdg	cmei800am0001lg01z3z1nqb5
cmeify25p0003yyzl8x5q2n1r	comment_added	Added a public comment	\N	2025-08-19 11:08:57.325	cmehltbhb0000sgle70okdgdg	cmei800am0001lg01z3z1nqb5
cmeify8j10007yyzl6x89wpf1	comment_added	Added a public comment	\N	2025-08-19 11:09:05.581	cmehltbhb0000sgle70okdgdg	cmei800am0001lg01z3z1nqb5
cmeifyf6q0009yyzlp5090nee	milestone_completed	Completed milestone: 1111	\N	2025-08-19 11:09:14.21	cmehltbhb0000sgle70okdgdg	cmei800am0001lg01z3z1nqb5
cmeig0jfl000dyyzljt0175ob	time_logged	Logged 3.5 hours	{"hours": 3.5, "amount": null, "billable": true}	2025-08-19 11:10:53.025	cmehltbhb0000sgle70okdgdg	cmei800am0001lg01z3z1nqb5
\.


--
-- Data for Name: cases; Type: TABLE DATA; Schema: public; Owner: role_8dcaff960
--

COPY public.cases (id, title, description, status, priority, "clientName", "clientEmail", "clientPhone", "dueDate", tags, notes, progress, "estimatedHours", "actualHours", "hourlyRate", "createdAt", "updatedAt", "assignedToId", "createdById") FROM stdin;
cmei800am0001lg01z3z1nqb5	asdfadf	asdfasdfads	NEW	MEDIUM	asdfasdf	asdf	asdfasdf	\N	{}		67	\N	5.5	\N	2025-08-19 07:26:31.294	2025-08-19 11:10:53.022	\N	cmehltbhb0000sgle70okdgdg
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: role_8dcaff960
--

COPY public.comments (id, content, "isInternal", "createdAt", "updatedAt", "caseId", "authorId") FROM stdin;
cmei89i8b0006lg012fj66kjg	asdsadadas	f	2025-08-19 07:33:54.443	2025-08-19 07:33:54.443	cmei800am0001lg01z3z1nqb5	cmehltbhb0000sgle70okdgdg
cmeify25l0001yyzl3ah3gntt	Hur går ärendet?	f	2025-08-19 11:08:57.321	2025-08-19 11:08:57.321	cmei800am0001lg01z3z1nqb5	cmehltbhb0000sgle70okdgdg
cmeify8ix0005yyzll8lzemwb	Walla habibib	f	2025-08-19 11:09:05.578	2025-08-19 11:09:05.578	cmei800am0001lg01z3z1nqb5	cmehltbhb0000sgle70okdgdg
\.


--
-- Data for Name: court_decisions; Type: TABLE DATA; Schema: public; Owner: role_8dcaff960
--

COPY public.court_decisions (id, title, court, "caseNumber", date, summary, url, relevance, precedent, outcome, notes, "createdAt", "updatedAt", "caseId", "addedById") FROM stdin;
\.


--
-- Data for Name: document_types; Type: TABLE DATA; Schema: public; Owner: role_8dcaff960
--

COPY public.document_types (id, name, description, icon, required, category, template, "order", "createdAt", "caseId") FROM stdin;
\.


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: role_8dcaff960
--

COPY public.files (id, "originalName", "fileName", "fileSize", "mimeType", "filePath", "uploadedAt", "caseId", "uploadedById") FROM stdin;
\.


--
-- Data for Name: legal_references; Type: TABLE DATA; Schema: public; Owner: role_8dcaff960
--

COPY public.legal_references (id, type, title, citation, url, summary, relevance, "createdAt", "caseId", "addedById") FROM stdin;
cmei8xyf80010lg0167w8c86u	statute	CRM ./. LAWARE	NJA 2008 s.ddasdad	\N	Handlar om brott mot lojalitetsplikt	Avser illojalt beteende och grund för rättegångskostnader	2025-08-19 07:52:55.15	cmei800am0001lg01z3z1nqb5	cmehltbhb0000sgle70okdgdg
\.


--
-- Data for Name: legal_statutes; Type: TABLE DATA; Schema: public; Owner: role_8dcaff960
--

COPY public.legal_statutes (id, title, chapter, section, subsection, description, url, notes, priority, status, "createdAt", "updatedAt", "caseId", "addedById") FROM stdin;
\.


--
-- Data for Name: milestones; Type: TABLE DATA; Schema: public; Owner: role_8dcaff960
--

COPY public.milestones (id, title, description, "dueDate", completed, "completedAt", "order", "createdAt", "updatedAt", "caseId", "completedById", "assignedToId", "estimatedHours") FROM stdin;
cmei8g9qy000klg01v6c7bgbv	Stämningsansökan		\N	f	\N	3	2025-08-19 07:39:10.043	2025-08-19 07:39:38.534	cmei800am0001lg01z3z1nqb5	\N	\N	\N
cmei8a6xw000alg01ywsyldmp	Komplettering av underlag	asdasdasd	2025-08-21 00:00:00	t	2025-08-19 09:41:39.253	2	2025-08-19 07:34:26.469	2025-08-19 09:41:39.254	cmei800am0001lg01z3z1nqb5	cmehltbhb0000sgle70okdgdg	\N	\N
cmei800ao0002lg012r7dehy7	1111	asdfasdf	\N	t	2025-08-19 11:09:14.201	1	2025-08-19 07:26:31.296	2025-08-19 11:09:14.202	cmei800am0001lg01z3z1nqb5	cmehltbhb0000sgle70okdgdg	\N	\N
\.


--
-- Data for Name: time_entries; Type: TABLE DATA; Schema: public; Owner: role_8dcaff960
--

COPY public.time_entries (id, description, hours, date, billable, "hourlyRate", amount, "createdAt", "updatedAt", "caseId", "userId") FROM stdin;
cmei8axhp000glg01tw6jcr1x	CRM creaintg	2	2025-08-19 00:00:00	t	200	400	2025-08-19 07:35:00.877	2025-08-19 07:35:00.877	cmei800am0001lg01z3z1nqb5	cmehltbhb0000sgle70okdgdg
cmeig0jfe000byyzlr85ye3aq	Skapade CRM	3.5	2025-08-19 00:00:00	t	\N	\N	2025-08-19 11:10:53.017	2025-08-19 11:10:53.017	cmei800am0001lg01z3z1nqb5	cmehltbhb0000sgle70okdgdg
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: role_8dcaff960
--

COPY public.users (id, name, email, "emailVerified", image, password, role, "firstName", "lastName", phone, "position", active, "createdAt", "updatedAt") FROM stdin;
cmehltbhb0000sgle70okdgdg	John Doe	john@doe.com	\N	\N	$2a$10$FJNjiR6wDDsuQ2sBr/Xvs.ofuAszcpyO0vBcbcSLOyWlDmVbDw.c6	ADMINISTRATOR	John	Doe	\N	Managing Partner	t	2025-08-18 21:05:27.647	2025-08-18 21:05:27.647
cmehltbhk0001sgleqxunw32o	Thinh Admin	thinh@laware.se	\N	\N	$2a$10$zVcit1BsX.B2zFgwf7NOP.rW/m9./J.chpXm93uGEIyzwI4DpWFm2	ADMINISTRATOR	Thinh	Admin	\N	Managing Partner	t	2025-08-18 21:05:27.656	2025-08-18 21:05:27.656
cmehltbho0002sgleyyi92d7e	Tom Admin	Tom@laware.se	\N	\N	$2a$10$zVcit1BsX.B2zFgwf7NOP.rW/m9./J.chpXm93uGEIyzwI4DpWFm2	ADMINISTRATOR	Tom	Admin	\N	Senior Partner	t	2025-08-18 21:05:27.66	2025-08-18 21:05:27.66
cmehltbhs0003sgleqv0dyo7l	Momo Admin	Momo@laware.se	\N	\N	$2a$10$zVcit1BsX.B2zFgwf7NOP.rW/m9./J.chpXm93uGEIyzwI4DpWFm2	ADMINISTRATOR	Momo	Admin	\N	Legal Administrator	t	2025-08-18 21:05:27.664	2025-08-18 21:05:27.664
cmehltbhv0004sglenawldmdl	Sarah Johnson	sarah.johnson@lawfirm.com	\N	\N	$2a$10$zVcit1BsX.B2zFgwf7NOP.rW/m9./J.chpXm93uGEIyzwI4DpWFm2	USER	Sarah	Johnson	+1-555-0123	Senior Attorney	t	2025-08-18 21:05:27.668	2025-08-18 21:05:27.668
cmehltbhz0005sgle0wt1nc2o	Michael Chen	michael.chen@lawfirm.com	\N	\N	$2a$10$zVcit1BsX.B2zFgwf7NOP.rW/m9./J.chpXm93uGEIyzwI4DpWFm2	USER	Michael	Chen	+1-555-0124	Associate Attorney	t	2025-08-18 21:05:27.671	2025-08-18 21:05:27.671
cmehltbi20006sgledgssym5h	Emily Davis	emily.davis@lawfirm.com	\N	\N	$2a$10$zVcit1BsX.B2zFgwf7NOP.rW/m9./J.chpXm93uGEIyzwI4DpWFm2	ADMINISTRATOR	Emily	Davis	+1-555-0125	Legal Administrator	t	2025-08-18 21:05:27.675	2025-08-18 21:05:27.675
cmehluxgo0000sgps9wdr97n2	Test User	testuser99jlpeul@example.com	\N	\N	$2a$10$SL2Pgi96CGMCAazzEXLg7.r4uUuhUHr3g1clFGryON.i9pk/1uC4C	USER	Test	User	\N	\N	t	2025-08-18 21:06:42.792	2025-08-18 21:06:42.792
cmei6hkw70000tn0u40zks419	Test User	testuserzxnsra0s@example.com	\N	\N	$2a$10$cqb5j2RzH7W7pL6yWDJktexEKxMUO.Of12AsBRkubkmSMHPV1m6I.	USER	Test	User	\N	\N	t	2025-08-19 06:44:11.911	2025-08-19 06:44:11.911
cmei77abz0000tnfj1xbmv63f	Test User	testuserh3x9rcoz@example.com	\N	\N	$2a$10$/gENnokommUaeSiY3Dies..3IYP6vqHIxnM2ILFsdkgeuHXas/hFm	USER	Test	User	\N	\N	t	2025-08-19 07:04:11.279	2025-08-19 07:04:11.279
cmei7jifp0000tnaiamseoa36	Test User	testuserzt0nklpq@example.com	\N	\N	$2a$10$sx6t2VBbCBALyTYlVo87zOs.evPOPcJe4CBrND81s..Ces/UJ2ate	USER	Test	User	\N	\N	t	2025-08-19 07:13:41.654	2025-08-19 07:13:41.654
cmeicnskv0000vdj28ymcymaa	Test User	testuser589zgf8w@example.com	\N	\N	$2a$10$PfFjmtdm6gh9m3t1IUXqQeb0Zpr2Cq0gjUldX.nBpgG5xxejkQSpm	USER	Test	User	\N	\N	t	2025-08-19 09:36:59.504	2025-08-19 09:36:59.504
\.


--
-- Data for Name: workflow_steps; Type: TABLE DATA; Schema: public; Owner: role_8dcaff960
--

COPY public.workflow_steps (id, title, description, "order", completed, "completedAt", "dueDate", "assignedToId", dependencies, "estimatedHours", "actualHours", "createdAt", "updatedAt", "caseId") FROM stdin;
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: cases cases_pkey; Type: CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: court_decisions court_decisions_pkey; Type: CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.court_decisions
    ADD CONSTRAINT court_decisions_pkey PRIMARY KEY (id);


--
-- Name: document_types document_types_pkey; Type: CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.document_types
    ADD CONSTRAINT document_types_pkey PRIMARY KEY (id);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- Name: legal_references legal_references_pkey; Type: CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.legal_references
    ADD CONSTRAINT legal_references_pkey PRIMARY KEY (id);


--
-- Name: legal_statutes legal_statutes_pkey; Type: CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.legal_statutes
    ADD CONSTRAINT legal_statutes_pkey PRIMARY KEY (id);


--
-- Name: milestones milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT milestones_pkey PRIMARY KEY (id);


--
-- Name: time_entries time_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT time_entries_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: workflow_steps workflow_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.workflow_steps
    ADD CONSTRAINT workflow_steps_pkey PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: role_8dcaff960
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: role_8dcaff960
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: role_8dcaff960
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: role_8dcaff960
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: files_fileName_key; Type: INDEX; Schema: public; Owner: role_8dcaff960
--

CREATE UNIQUE INDEX "files_fileName_key" ON public.files USING btree ("fileName");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: role_8dcaff960
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: activities activities_caseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT "activities_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES public.cases(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: activities activities_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cases cases_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT "cases_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cases cases_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT "cases_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: comments comments_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: comments comments_caseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES public.cases(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: court_decisions court_decisions_addedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.court_decisions
    ADD CONSTRAINT "court_decisions_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: court_decisions court_decisions_caseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.court_decisions
    ADD CONSTRAINT "court_decisions_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES public.cases(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: document_types document_types_caseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.document_types
    ADD CONSTRAINT "document_types_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES public.cases(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: files files_caseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT "files_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES public.cases(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: files files_uploadedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT "files_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: legal_references legal_references_addedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.legal_references
    ADD CONSTRAINT "legal_references_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: legal_references legal_references_caseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.legal_references
    ADD CONSTRAINT "legal_references_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES public.cases(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: legal_statutes legal_statutes_addedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.legal_statutes
    ADD CONSTRAINT "legal_statutes_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: legal_statutes legal_statutes_caseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.legal_statutes
    ADD CONSTRAINT "legal_statutes_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES public.cases(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: milestones milestones_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT "milestones_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: milestones milestones_caseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT "milestones_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES public.cases(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: milestones milestones_completedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT "milestones_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: time_entries time_entries_caseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT "time_entries_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES public.cases(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: time_entries time_entries_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT "time_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: workflow_steps workflow_steps_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.workflow_steps
    ADD CONSTRAINT "workflow_steps_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: workflow_steps workflow_steps_caseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: role_8dcaff960
--

ALTER TABLE ONLY public.workflow_steps
    ADD CONSTRAINT "workflow_steps_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES public.cases(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: role_8dcaff960
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict 7WXbM85KJDPRue2VLortEfzAVMVMrYU1cy6DxOwYjoTugobyEi0PUhUCS3FJcHL

