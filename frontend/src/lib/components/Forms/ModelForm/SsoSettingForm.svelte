<script lang="ts">
	import AutocompleteSelect from '../AutocompleteSelect.svelte';
	import TextArea from '$lib/components/Forms/TextArea.svelte';
	import TextField from '$lib/components/Forms/TextField.svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { ModelInfo, CacheLock } from '$lib/utils/types';
	import { m } from '$paraglide/messages';
	import Checkbox from '$lib/components/Forms/Checkbox.svelte';
	import { Accordion } from '@skeletonlabs/skeleton-svelte';
	interface Props {
		form: SuperValidated<any>;
		model: ModelInfo;
		cacheLocks?: Record<string, CacheLock>;
		formDataCache?: Record<string, any>;
		data?: any;
	}

	let { form, model, cacheLocks = {}, formDataCache = $bindable({}), data = {} }: Props = $props();

	let openAccordionItems = $state(['saml', 'idp', 'sp']);
</script>

<Accordion
	value={openAccordionItems}
	onValueChange={(e) => (openAccordionItems = e.value)}
	multiple
>
	<Checkbox {form} field="is_enabled" label={m.enableSSO()} helpText={m.enableSSOHelpText()} />
	<!-- Incomplete Translation -->
	<Checkbox
		{form}
		field="force_sso"
		label={m.forceSSOLogin()}
		helpText={m.forceSSOLoginHelpText()}
		disabled={!data.is_enabled}
	/>
	<span class="text-orange-500 italic text-sm"
		><i class="fa-solid fa-circle-exclamation mr-1"></i>{m.forceSSOLoginHelpText2()}</span
	>
	<AutocompleteSelect
		{form}
		hidden={model.selectOptions['provider'].length < 2}
		field="provider"
		cacheLock={cacheLocks['provider']}
		options={model.selectOptions['provider']}
		label={m.provider()}
		disabled={!data.is_enabled}
	/>
	{#if data.provider !== 'saml'}
		<Accordion.Item value="idp">
			{#snippet control()}
				{m.IdPConfiguration()}
			{/snippet}
			{#snippet panel()}
				<TextField
					{form}
					field="provider_name"
					label={m.name()}
					disabled={!data.is_enabled}
					cacheLock={cacheLocks['provider_name']}
				/>
				<TextField
					hidden
					{form}
					field="provider_id"
					label={m.providerID()}
					disabled={!data.is_enabled}
					cacheLock={cacheLocks['provider_id']}
				/>
				<TextField
					{form}
					field="client_id"
					label={m.clientID()}
					helpText={m.clientIDHelpText()}
					disabled={!data.is_enabled}
					cacheLock={cacheLocks['client_id']}
				/>
				{#if data.provider !== 'saml'}
					<TextField
						{form}
						field="secret"
						label={m.secret()}
						helpText={m.secretHelpText()}
						disabled={!data.is_enabled}
						cacheLock={cacheLocks['secret']}
					/>
					<TextField
						{form}
						field="key"
						label={m.key()}
						disabled={!data.is_enabled}
						cacheLock={cacheLocks['key']}
					/>
				{/if}
			{/snippet}
		</Accordion.Item>
	{/if}
	{#if data.provider === 'saml'}
		<Accordion.Item value="saml">
			{#snippet control()}
				<span class="font-semibold">{m.SAMLIdPConfiguration()}</span>
			{/snippet}
			{#snippet panel()}
				<TextField
					{form}
					field="idp_entity_id"
					label={m.IdPEntityID()}
					required={data.provider === 'saml'}
					disabled={!data.is_enabled}
					cacheLock={cacheLocks['idp_entity_id']}
				/>
				<p class="text-gray-600 text-sm">{m.fillMetadataURL()}</p>
				<TextField
					{form}
					field="metadata_url"
					label={m.metadataURL()}
					disabled={!data.is_enabled}
					cacheLock={cacheLocks['metadata_url']}
				/>
				<div class="flex items-center justify-center w-full space-x-2">
					<hr class="w-1/2 items-center bg-gray-200 border-0" />
					<span class="flex items-center text-gray-600 text-sm">{m.or()}</span>
					<hr class="w-1/2 items-center bg-gray-200 border-0" />
				</div>
				<p class="text-gray-600 text-sm">{m.fillSSOSLOURLx509cert()}</p>
				<TextField
					{form}
					field="sso_url"
					label={m.SSOURL()}
					disabled={!data.is_enabled}
					cacheLock={cacheLocks['sso_url']}
				/>
				<TextField
					{form}
					field="slo_url"
					label={m.SLOURL()}
					disabled={!data.is_enabled}
					cacheLock={cacheLocks['slo_url']}
				/>
				<TextArea
					{form}
					field="x509cert"
					label={m.x509Cert()}
					disabled={!data.is_enabled}
					cacheLock={cacheLocks['x509cert']}
				/>
			{/snippet}
		</Accordion.Item>

		<Accordion.Item value="sp">
			{#snippet control()}
				<span class="font-semibold">{m.SPConfiguration()}</span>
			{/snippet}
			{#snippet panel()}
				<TextField
					{form}
					field="sp_entity_id"
					label={m.SPEntityID()}
					required={data.provider === 'saml'}
					disabled={!data.is_enabled}
					cacheLock={cacheLocks['sp_entity_id']}
				/>
			{/snippet}
		</Accordion.Item>

		<Accordion.Item value="advanced"
			>{#snippet control()}
				<span class="font-semibold">{m.advancedSettings()}</span>
			{/snippet}
			{#snippet panel()}
				<TextField
					{form}
					field="attribute_mapping_uid"
					label={m.attributeMappingUID()}
					disabled={!data.is_enabled}
					cacheLock={cacheLocks['attribute_mapping_uid']}
				/>
				<TextField
					{form}
					field="attribute_mapping_email_verified"
					label={m.attributeMappingEmailVerified()}
					disabled={!data.is_enabled}
					cacheLock={cacheLocks['attribute_mapping_email_verified']}
				/>
				<TextField
					{form}
					field="attribute_mapping_email"
					label={m.attributeMappingEmail()}
					disabled={!data.is_enabled}
					cacheLock={cacheLocks['attribute_mapping_email']}
				/>

				<Checkbox
					{form}
					field="allow_repeat_attribute_name"
					label={m.allowRepeatAttributeName()}
					disabled={!data.is_enabled}
				/>
				<Checkbox
					{form}
					field="allow_single_label_domains"
					label={m.allowSingleLabelDomains()}
					disabled={!data.is_enabled}
				/>
				<Checkbox
					{form}
					field="authn_request_signed"
					hidden
					label={m.authnRequestSigned()}
					disabled={!data.is_enabled}
				/>
				<TextField
					{form}
					field="digest_algorithm"
					hidden
					label={m.digestAlgorithm()}
					disabled={!data.is_enabled}
					cacheLock={cacheLocks['digest_algorithm']}
				/>
				<Checkbox
					{form}
					field="logout_request_signed"
					hidden
					label={m.logoutRequestSigned()}
					disabled={!data.is_enabled}
				/>
				<Checkbox
					{form}
					field="logout_response_signed"
					hidden
					label={m.logoutResponseSigned()}
					disabled={!data.is_enabled}
				/>
				<Checkbox
					{form}
					field="metadata_signed"
					hidden
					label={m.metadataSigned()}
					disabled={!data.is_enabled}
				/>
				<Checkbox
					{form}
					field="name_id_encrypted"
					hidden
					label={m.nameIDEncrypted()}
					disabled={!data.is_enabled}
				/>
				<Checkbox
					{form}
					hidden
					field="reject_deprecated_algorithm"
					label={m.rejectDeprecatedAlgorithm()}
					disabled={!data.is_enabled}
				/>
				<Checkbox
					{form}
					field="reject_idp_initiated_sso"
					label={m.rejectIdPInitiatedSSO()}
					disabled={!data.is_enabled}
				/>
				<TextField
					{form}
					field="signature_algorithm"
					hidden
					label={m.signatureAlgorithm()}
					disabled={!data.is_enabled}
					cacheLock={cacheLocks['signature_algorithm']}
				/>
				<Checkbox
					{form}
					field="want_assertion_encrypted"
					hidden
					label={m.wantAssertionEncrypted()}
					disabled={!data.is_enabled}
				/>
				<Checkbox
					{form}
					field="want_assertion_signed"
					hidden
					label={m.wantAssertionSigned()}
					disabled={!data.is_enabled}
				/>
				<Checkbox
					{form}
					field="want_attribute_statement"
					label={m.wantAttributeStatement()}
					disabled={!data.is_enabled}
				/>
				<Checkbox
					{form}
					field="want_message_signed"
					hidden
					label={m.wantMessageSigned()}
					disabled={!data.is_enabled}
				/>
				<Checkbox {form} field="want_name_id" label={m.wantNameID()} disabled={!data.is_enabled} />
				<Checkbox
					{form}
					field="want_name_id_encrypted"
					hidden
					label={m.wantNameIDEncrypted()}
					disabled={!data.is_enabled}
				/>
			{/snippet}
		</Accordion.Item>
	{/if}
</Accordion>
