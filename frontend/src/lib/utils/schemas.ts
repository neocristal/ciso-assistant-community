import { z, type AnyZodObject } from 'zod';

const toArrayPreprocessor = (value: unknown) => {
	if (Array.isArray(value)) {
		return value;
	}

	switch (typeof value) {
		case 'string':
		case 'number':
		case 'bigint':
		case 'boolean':
			return [value];

		default:
			return value; // could not coerce, return the original and face the consequences during validation
	}
};

export const loginSchema = z
	.object({
		username: z
			.string({
				required_error: 'Email is required'
			})
			.email(),
		password: z.string({
			required_error: 'Password is required'
		})
	})
	.required();

export const emailSchema = z
	.object({
		email: z.string({
			required_error: 'Email is required'
		})
	})
	.required();

// Utility functions for commonly used schema structures
const nameSchema = z
	.string({
		required_error: 'Name is required'
	})
	.min(1);

const descriptionSchema = z.string().optional().nullable();

const baseNamedObject = (additionalFields: any) =>
	z.object({
		name: nameSchema,
		description: descriptionSchema,
		...additionalFields
	});

export const FolderSchema = baseNamedObject({
	parent_folder: z.string().optional()
});

export const ProjectSchema = baseNamedObject({
	folder: z.string(),
	internal_reference: z.string().optional().nullable(),
	lc_status: z.string().optional().default('in_design')
});

export const RiskMatrixSchema = baseNamedObject({
	folder: z.string(),
	json_definition: z.string(),
	is_enabled: z.boolean()
});

export const LibraryUploadSchema = z.object({
	file: z.instanceof(File).optional()
});

export const RiskAssessmentSchema = baseNamedObject({
	version: z.string().optional().default('0.1'),
	project: z.string(),
	status: z.string().optional().nullable(),
	risk_matrix: z.string(),
	eta: z.string().optional().nullable(),
	due_date: z.string().optional().nullable(),
	authors: z.array(z.string().optional()).optional(),
	reviewers: z.array(z.string().optional()).optional()
});

export const ThreatSchema = baseNamedObject({
	folder: z.string(),
	provider: z.string().optional().nullable(),
	ref_id: z.string().optional().nullable()
});

export const RiskScenarioSchema = baseNamedObject({
	existing_controls: z.string().optional(),
	applied_controls: z.string().uuid().optional().array().optional(),
	current_proba: z.number().optional(),
	current_impact: z.number().optional(),
	residual_proba: z.number().optional(),
	residual_impact: z.number().optional(),
	treatment: z.string().optional(),
	strength_of_knowledge: z.number().default(-1).optional(),
	justification: z.string().optional().nullable(),
	risk_assessment: z.string(),
	threats: z.string().uuid().optional().array().optional(),
	assets: z.string().uuid().optional().array().optional()
});

export const AppliedControlSchema = baseNamedObject({
	category: z.string().optional().nullable(),
	status: z.string().optional().nullable(),
	evidences: z.string().optional().array().optional(),
	eta: z.string().optional().nullable(),
	expiry_date: z.string().optional().nullable(),
	link: z.string().url().optional().nullable(),
	effort: z.string().optional().nullable(),
	folder: z.string(),
	reference_control: z.string().optional().nullable()
});

export const PolicySchema = baseNamedObject({
	status: z.string().optional().nullable(),
	evidences: z.string().optional().array().optional(),
	eta: z.string().optional().nullable(),
	expiry_date: z.string().optional().nullable(),
	link: z.string().url().optional().nullable(),
	effort: z.string().optional().nullable(),
	folder: z.string(),
	reference_control: z.string().optional().nullable()
});

export const RiskAcceptanceSchema = baseNamedObject({
	folder: z.string(),
	expiry_date: z.string().optional().nullable(),
	justification: z.string().optional().nullable(),
	approver: z.string(),
	risk_scenarios: z.array(z.string())
});

export const ReferenceControlSchema = baseNamedObject({
	provider: z.string().optional().nullable(),
	category: z.string().optional().nullable(),
	folder: z.string(),
	ref_id: z.string().optional().nullable(),
	annotation: z.string().optional().nullable()
});

export const AssetSchema = baseNamedObject({
	business_value: z.string().optional(),
	type: z.string().default('PR'),
	folder: z.string(),
	parent_assets: z.string().optional().array().optional()
});

export const RequirementAssessmentSchema = z.object({
	status: z.string(),
	score: z.number().optional().nullable(),
	is_scored: z.boolean().optional(),
	comment: z.string().optional().nullable(),
	folder: z.string(),
	requirement: z.string(),
	evidences: z.string().uuid().optional().array(),
	compliance_assessment: z.string(),
	applied_controls: z.string().uuid().optional().array(),
	observation: z.string().optional().nullable()
});

export const UserEditSchema = z.object({
	email: z.string().email(),
	first_name: z.string().optional(),
	last_name: z.string().optional(),
	is_active: z.boolean().optional(),
	user_groups: z.array(z.string().uuid().optional()).optional()
});

export const UserCreateSchema = z.object({ email: z.string().email() });
export const ChangePasswordSchema = z.object({
	old_password: z.string(),
	new_password: z.string(),
	confirm_new_password: z.string()
});

export const ResetPasswordSchema = z.object({
	new_password: z.string(),
	confirm_new_password: z.string()
});

export const SetPasswordSchema = z.object({
	user: z.string(),
	new_password: z.string(),
	confirm_new_password: z.string()
});

export const ComplianceAssessmentSchema = baseNamedObject({
	version: z.string().optional().default('0.1'),
	project: z.string(),
	status: z.string().optional().nullable(),
	selected_implementation_groups: z.array(z.string().optional()).optional(),
	framework: z.string(),
	eta: z.string().optional().nullable(),
	due_date: z.string().optional().nullable(),
	authors: z.array(z.string().optional()).optional(),
	reviewers: z.array(z.string().optional()).optional()
});

export const EvidenceSchema = baseNamedObject({
	attachment: z.instanceof(File).optional().nullable(),
	folder: z.string(),
	applied_controls: z.preprocess(toArrayPreprocessor, z.array(z.string().optional())).optional(),
	requirement_assessments: z.string().optional().array().optional(),
	link: z.string().optional().nullable()
});

const SCHEMA_MAP: Record<string, AnyZodObject> = {
	folders: FolderSchema,
	projects: ProjectSchema,
	'risk-matrices': RiskMatrixSchema,
	'risk-assessments': RiskAssessmentSchema,
	threats: ThreatSchema,
	'risk-scenarios': RiskScenarioSchema,
	'applied-controls': AppliedControlSchema,
	policies: PolicySchema,
	'risk-acceptances': RiskAcceptanceSchema,
	'reference-controls': ReferenceControlSchema,
	assets: AssetSchema,
	'requirement-assessments': RequirementAssessmentSchema,
	'compliance-assessments': ComplianceAssessmentSchema,
	evidences: EvidenceSchema,
	users: UserCreateSchema
};

export const modelSchema = (model: string) => {
	return SCHEMA_MAP[model] || z.object({});
};

export const composerSchema = z.object({
	risk_assessments: z.array(z.string().uuid())
});
