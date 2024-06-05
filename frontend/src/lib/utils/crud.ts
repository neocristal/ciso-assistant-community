import type { urlModel } from './types';
import { BASE_API_URL } from './constants';
import EvidenceFilePreview from '$lib/components/ModelTable/EvidenceFilePreview.svelte';
import LanguageDisplay from '$lib/components/ModelTable/LanguageDisplay.svelte';
import LibraryActions from '$lib/components/ModelTable/LibraryActions.svelte';
import UserGroupNameDisplay from '$lib/components/ModelTable/UserGroupNameDisplay.svelte';

type GetOptionsParams = {
	objects: any[];
	suggestions?: any[];
	label?: string;
	value?: string;
	extra_fields: string[];
	self?: Record<string, any>;
	selfSelect?: boolean;
};

export function checkConstraints(constraints: { [key: string]: any }, foreignKeys: any) {
	const emptyConstraintsList = [];
	for (const [key, constraint] of Object.entries(constraints)) {
		if (constraint.required && foreignKeys[key])
			if (foreignKeys[key].length === 0) emptyConstraintsList.push(key);
	}
	return emptyConstraintsList;
}

function getValue(object: { [key: string]: any }, keys: string | string[]) {
	if (typeof keys === 'string') {
		return object[keys];
	}
	let finalValue = object;
	for (const key of keys) {
		finalValue = finalValue[key];
	}
	return finalValue;
}

export const getOptions = ({
	objects,
	suggestions,
	label = 'name',
	value = 'id',
	extra_fields = [],
	self = undefined,
	selfSelect = false
}: GetOptionsParams): {
	label: string;
	value: string;
	suggested: boolean;
	self?: Record<string, any>;
	selfSelect?: boolean;
}[] => {
	const append = (x, y) => (!y ? x : !x || x == '' ? y : x + ' - ' + y);
	const options = objects
		.map((object) => {
			let my_label =
				label != 'auto'
					? object[label]
					: append(object['ref_id'], object['name'] ? object['name'] : object['description']);
			return {
				label:
					extra_fields.length > 0
						? extra_fields
								.map((field) => getValue(object, field))
								.map((string) => `${string}`)
								.join('/') +
						  '/' +
						  my_label
						: my_label,
				value: object[value],
				suggested: false
			};
		})
		.filter((option) => {
			if (selfSelect) {
				return true;
			}
			return option.value !== self?.id;
		});

	if (suggestions) {
		const suggestedIds = suggestions.map((suggestion) => suggestion[value]);

		const filteredOptions = options.filter((option) => {
			const isSuggested = suggestedIds.includes(option.value);
			if (isSuggested) {
				option.suggested = true;
			}
			return !isSuggested;
		});

		const suggestedOptions = options.filter((option) => option.suggested);
		const reorderedOptions = suggestedOptions.concat(filteredOptions);

		return reorderedOptions;
	}

	return options;
};

interface ForeignKeyField {
	field: string;
	urlModel: urlModel;
	urlParams?: string;
}

interface Field {
	field: string;
	type?: 'date' | 'datetime';
}

interface SelectField {
	field: string;
	detail?: boolean;
}

export interface ModelMapEntry {
	name: string;
	localName: string;
	localNamePlural: string;
	verboseName: string;
	verboseNamePlural?: string;
	urlModel?: urlModel;
	detailViewFields?: Field[];
	foreignKeyFields?: ForeignKeyField[];
	reverseForeignKeyFields?: ForeignKeyField[];
	selectFields?: SelectField[];
	filters?: SelectField[];
}

type ModelMap = {
	[key: string]: ModelMapEntry;
};

export const URL_MODEL_MAP: ModelMap = {
	folders: {
		name: 'folder',
		localName: 'domain',
		localNamePlural: 'domains',
		verboseName: 'Domain',
		verboseNamePlural: 'Domains',
		foreignKeyFields: [
			{ field: 'parent_folder', urlModel: 'folders', urlParams: 'content_type=GL' }
		],
		reverseForeignKeyFields: [{ field: 'folder', urlModel: 'projects' }]
	},
	projects: {
		name: 'project',
		localName: 'project',
		localNamePlural: 'projects',
		verboseName: 'Project',
		verboseNamePlural: 'Projects',
		foreignKeyFields: [{ field: 'folder', urlModel: 'folders', urlParams: 'content_type=DO' }],
		selectFields: [{ field: 'lc_status' }],
		reverseForeignKeyFields: [
			{ field: 'project', urlModel: 'risk-assessments' },
			{ field: 'project', urlModel: 'compliance-assessments' }
		],
		filters: [{ field: 'lc_status' }, { field: 'folder' }]
	},
	'risk-matrices': {
		name: 'riskmatrix',
		localName: 'riskMatrix',
		localNamePlural: 'riskMatrices',
		verboseName: 'Risk matrix',
		verboseNamePlural: 'Risk matrices',
		foreignKeyFields: [{ field: 'folder', urlModel: 'folders' }]
	},
	'risk-assessments': {
		name: 'riskassessment',
		localName: 'riskAssessment',
		localNamePlural: 'riskAssessments',
		verboseName: 'Risk assessment',
		verboseNamePlural: 'Risk assessments',
		foreignKeyFields: [
			{ field: 'project', urlModel: 'projects' },
			{ field: 'authors', urlModel: 'users' },
			{ field: 'reviewers', urlModel: 'users' },
			{ field: 'risk_matrix', urlModel: 'risk-matrices' },
			{ field: 'risk_scenarios', urlModel: 'risk-scenarios' }
		],
		reverseForeignKeyFields: [{ field: 'risk_assessment', urlModel: 'risk-scenarios' }],
		selectFields: [{ field: 'status' }],
		filters: [{ field: 'project' }, { field: 'auditor' }, { field: 'status' }]
	},
	threats: {
		name: 'threat',
		localName: 'threat',
		localNamePlural: 'threats',
		verboseName: 'Threat',
		verboseNamePlural: 'Threats',
		foreignKeyFields: [{ field: 'folder', urlModel: 'folders' }]
	},
	'risk-scenarios': {
		name: 'riskscenario',
		localName: 'riskScenario',
		localNamePlural: 'riskScenarios',
		verboseName: 'Risk scenario',
		verboseNamePlural: 'Risk scenarios',
		foreignKeyFields: [
			{ field: 'threats', urlModel: 'threats' },
			{ field: 'risk_assessment', urlModel: 'risk-assessments' },
			{ field: 'assets', urlModel: 'assets' },
			{ field: 'applied_controls', urlModel: 'applied-controls' },
			{ field: 'project', urlModel: 'projects' },
			{ field: 'risk_matrix', urlModel: 'risk-matrices' },
			{ field: 'auditor', urlModel: 'users' }
		],
		filters: [{ field: 'threats' }, { field: 'risk_assessment' }]
	},
	'applied-controls': {
		name: 'appliedcontrol',
		localName: 'appliedControl',
		localNamePlural: 'appliedControls',
		verboseName: 'Applied control',
		verboseNamePlural: 'Applied controls',
		detailViewFields: [
			{ field: 'id' },
			{ field: 'folder' },
			{ field: 'reference_control' },
			{ field: 'category' },
			{ field: 'effort' },
			{ field: 'created_at', type: 'datetime' },
			{ field: 'updated_at', type: 'datetime' },
			{ field: 'name' },
			{ field: 'description' },
			{ field: 'eta', type: 'date' },
			{ field: 'expiry_date', type: 'date' },
			{ field: 'link' }
		],
		foreignKeyFields: [
			{ field: 'reference_control', urlModel: 'reference-controls' },
			{ field: 'folder', urlModel: 'folders' },
			{ field: 'evidences', urlModel: 'evidences' }
		],
		reverseForeignKeyFields: [{ field: 'applied_controls', urlModel: 'evidences' }],
		selectFields: [{ field: 'status' }, { field: 'category' }, { field: 'effort' }],
		filters: [
			{ field: 'reference_control' },
			{ field: 'status' },
			{ field: 'category' },
			{ field: 'effort' },
			{ field: 'folder' }
		]
	},
	policies: {
		name: 'appliedcontrol',
		localName: 'policy',
		localNamePlural: 'policies',
		verboseName: 'Policy',
		verboseNamePlural: 'Policies',
		foreignKeyFields: [
			{ field: 'reference_control', urlModel: 'reference-controls' },
			{ field: 'folder', urlModel: 'folders' },
			{ field: 'evidences', urlModel: 'evidences' }
		],
		selectFields: [{ field: 'status' }, { field: 'effort' }],
		filters: [
			{ field: 'reference_control' },
			{ field: 'status' },
			{ field: 'effort' },
			{ field: 'folder' }
		]
	},
	'risk-acceptances': {
		name: 'riskacceptance',
		localName: 'riskAcceptance',
		localNamePlural: 'riskAcceptances',
		verboseName: 'Risk acceptance',
		verboseNamePlural: 'Risk acceptances',
		foreignKeyFields: [
			{
				field: 'risk_scenarios',
				urlModel: 'risk-scenarios',
				urlParams: '/acceptable'
			},
			{ field: 'folder', urlModel: 'folders' },
			{ field: 'approver', urlModel: 'users', urlParams: 'is_approver=true' }
		],
		filters: [{ field: 'risk_scenarios' }, { field: 'folder' }, { field: 'approver' }]
	},
	'reference-controls': {
		name: 'referencecontrol',
		localName: 'referenceControl',
		localNamePlural: 'referenceControls',
		verboseName: 'Reference control',
		verboseNamePlural: 'Reference controls',
		foreignKeyFields: [{ field: 'folder', urlModel: 'folders' }],
		selectFields: [{ field: 'category' }],
		filters: [{ field: 'folder' }]
	},
	assets: {
		name: 'asset',
		localName: 'asset',
		localNamePlural: 'assets',
		verboseName: 'Asset',
		verboseNamePlural: 'Assets',
		foreignKeyFields: [
			{ field: 'parent_assets', urlModel: 'assets' },
			{ field: 'folder', urlModel: 'folders' }
		],
		selectFields: [{ field: 'type' }],
		filters: [{ field: 'parent_assets' }, { field: 'folder' }, { field: 'type' }]
	},
	users: {
		name: 'user',
		localName: 'user',
		localNamePlural: 'users',
		verboseName: 'User',
		verboseNamePlural: 'Users',
		foreignKeyFields: [{ field: 'user_groups', urlModel: 'user-groups' }],
		filters: []
	},
	'user-groups': {
		name: 'usergroup',
		localName: 'userGroup',
		localNamePlural: 'userGroups',

		verboseName: 'User group',
		verboseNamePlural: 'User groups',
		foreignKeyFields: [{ field: 'folder', urlModel: 'folders' }],
		filters: []
	},
	'role-assignments': {
		name: 'roleassignment',
		localName: 'roleAssignment',
		localNamePlural: 'roleAssignments',
		verboseName: 'Role assignment',
		verboseNamePlural: 'Role assignments',
		foreignKeyFields: [],
		filters: []
	},
	frameworks: {
		name: 'framework',
		localName: 'framework',
		localNamePlural: 'frameworks',
		verboseName: 'Framework',
		verboseNamePlural: 'Frameworks',
		foreignKeyFields: [
			{
				field: 'folder',
				urlModel: 'folders'
			}
		]
	},
	evidences: {
		name: 'evidence',
		localName: 'evidence',
		localNamePlural: 'evidences',
		verboseName: 'Evidence',
		verboseNamePlural: 'Evidences',
		foreignKeyFields: [
			{ field: 'folder', urlModel: 'folders' },
			{ field: 'applied_controls', urlModel: 'applied-controls' },
			{ field: 'requirement_assessments', urlModel: 'requirement-assessments' }
		]
	},
	'compliance-assessments': {
		name: 'complianceassessment',
		localName: 'complianceAssessment',
		localNamePlural: 'complianceAssessments',
		verboseName: 'Compliance assessment',
		verboseNamePlural: 'Compliance assessments',
		foreignKeyFields: [
			{ field: 'project', urlModel: 'projects' },
			{ field: 'framework', urlModel: 'frameworks' },
			{ field: 'authors', urlModel: 'users' },
			{ field: 'reviewers', urlModel: 'users' }
		],
		selectFields: [{ field: 'status' }, { field: 'selected_implementation_groups', detail: true }],
		filters: [{ field: 'status' }]
	},
	requirements: {
		name: 'requirement',
		localName: 'requirement',
		localNamePlural: 'requirements',
		verboseName: 'Requirement',
		verboseNamePlural: 'Requirements'
	},
	'requirement-assessments': {
		name: 'requirementassessment',
		localName: 'requirementAssessment',
		localNamePlural: 'requirementAssessments',
		verboseName: 'Requirement assessment',
		verboseNamePlural: 'Requirement assessments',
		selectFields: [{ field: 'status' }],
		foreignKeyFields: [
			{ field: 'applied_controls', urlModel: 'applied-controls' },
			{ field: 'evidences', urlModel: 'evidences' },
			{ field: 'compliance_assessment', urlModel: 'compliance-assessments' }
		]
	},
	'stored-libraries': {
		name: 'storedlibrary',
		localName: 'stored library',
		localNamePlural: 'stored libraries',
		verboseName: 'stored Library',
		verboseNamePlural: 'stored Libraries'
	},
	'loaded-libraries': {
		name: 'loadedlibrary',
		localName: 'loaded library',
		localNamePlural: 'loaded libraries',
		verboseName: 'loaded Library',
		verboseNamePlural: 'loaded Libraries'
	}
};

export const FIELD_COMPONENT_MAP = {
	evidences: {
		attachment: EvidenceFilePreview
	},
	libraries: {
		locale: LanguageDisplay,
		actions: LibraryActions
	},
	// "stored-libraries": {
	// 	locale: LanguageDisplay,
	// 	actions: LibraryActions
	// },
	// "loaded-libraries": {
	// 	locale: LanguageDisplay
	// 	// actions: LibraryActions
	// },
	'user-groups': {
		localization_dict: UserGroupNameDisplay
	}
};

// Il faut afficher le tag "draft" pour la column name !

interface TagConfig {
	key: string;
	values: {
		[key: string]: {
			text: string;
			cssClasses: string;
		};
	};
}

interface FieldColoredTagMap {
	[key: string]: {
		[key: string]: TagConfig[] | TagConfig;
	};
}

export const FIELD_COLORED_TAG_MAP: FieldColoredTagMap = {
	'risk-assessments': {
		name: {
			key: 'status',
			values: {
				planned: { text: 'planned', cssClasses: 'badge bg-indigo-300' },
				in_progress: { text: 'inProgress', cssClasses: 'badge bg-yellow-300' },
				in_review: { text: 'inReview', cssClasses: 'badge bg-cyan-300' },
				done: { text: 'done', cssClasses: 'badge bg-lime-300' },
				deprecated: { text: 'deprecated', cssClasses: 'badge bg-orange-300' }
			}
		}
	},
	'risk-scenarios': {
		name: {
			key: 'treatment',
			values: {
				Open: { text: 'open', cssClasses: 'badge bg-green-300' },
				Mitigate: { text: 'mitigate', cssClasses: 'badge bg-lime-200' },
				Accept: { text: 'accept', cssClasses: 'badge bg-green-200' },
				Avoid: { text: 'avoid', cssClasses: 'badge bg-red-200' },
				Transfer: { text: 'transfer', cssClasses: 'badge bg-yellow-300' }
			}
		}
	},
	'compliance-assessments': {
		name: {
			key: 'status',
			values: {
				planned: { text: 'planned', cssClasses: 'badge bg-indigo-300' },
				in_progress: { text: 'inProgress', cssClasses: 'badge bg-yellow-300' },
				in_review: { text: 'inReview', cssClasses: 'badge bg-cyan-300' },
				done: { text: 'done', cssClasses: 'badge bg-lime-300' },
				deprecated: { text: 'deprecated', cssClasses: 'badge bg-orange-300' }
			}
		}
	},
	assets: {
		name: {
			key: 'type',
			values: {
				Primary: { text: 'primary', cssClasses: 'badge bg-blue-200' }
			}
		}
	},
	'applied-controls': {
		name: {
			key: 'status',
			values: {
				Planned: { text: 'planned', cssClasses: 'badge bg-blue-200' },
				Active: { text: 'active', cssClasses: 'badge bg-green-200' },
				Inactive: { text: 'inactive', cssClasses: 'badge bg-red-300' },
				null: { text: 'undefined', cssClasses: 'badge bg-gray-300' }
			}
		}
	},
	projects: {
		name: {
			key: 'lc_status',
			values: {
				Dropped: { text: 'dropped', cssClasses: 'badge bg-red-200' }
			}
		}
	}
};

export const CUSTOM_MODEL_FETCH_MAP: { [key: string]: (load_data: any) => any } = {
	frameworks: async ({ fetch }) => {
		const endpoint = `${BASE_API_URL}/frameworks/`;
		const res = await fetch(endpoint);
		const response_data = await res.json();
		const frameworks = response_data.results;

		let compliance_assessment_req = null;
		let compliance_assessment_data = null;

		for (const framework of frameworks) {
			compliance_assessment_req = await fetch(
				`${BASE_API_URL}/compliance-assessments/?framework=${framework.id}`
			);
			compliance_assessment_data = await compliance_assessment_req.json();
			framework.compliance_assessments = compliance_assessment_data.count;
		}

		return frameworks;
	}
};

export const urlParamModelVerboseName = (model: string): string => {
	return URL_MODEL_MAP[model]?.verboseName || '';
};

export const urlParamModelForeignKeyFields = (model: string): ForeignKeyField[] => {
	return URL_MODEL_MAP[model]?.foreignKeyFields || [];
};

export const urlParamModelSelectFields = (model: string): SelectField[] => {
	return URL_MODEL_MAP[model]?.selectFields || [];
};

export const getModelInfo = (model: urlModel): ModelMapEntry => {
	const map = URL_MODEL_MAP[model] || {};
	map['urlModel'] = model;
	return map;
};

export function processObject(
	data: Record<string, any>,
	regex: RegExp,
	computeReplacement: (matchedString: string) => string
): void {
	for (const key in data) {
		if (!Object.prototype.hasOwnProperty.call(data, key)) continue;

		if (typeof data[key] === 'object' && data[key] !== null) {
			processObject(data[key], regex, computeReplacement); // Recursive call for objects
		} else if (typeof data[key] === 'string') {
			data[key] = data[key].replace(regex, (match: string) => computeReplacement(match)); // Compute replacement for matched strings
		} else if (Array.isArray(data[key])) {
			data[key] = data[key].map(
				(item: any) =>
					typeof item === 'string'
						? item.replace(regex, (match) => computeReplacement(match)) // Compute replacement for matched strings in arrays
						: processObject(item, regex, computeReplacement) // Recursive call for objects in arrays
			);
		}
	}
}
