<script lang="ts">
	import { onMount } from 'svelte';

	interface sankeyData {
		source: string;
		target: string;
		value: number;
	}
	interface Props {
		width?: string;
		height?: string;
		classesContainer?: string;
		title?: string;
		name?: string;
		values: sankeyData[]; // Set the types for these variables later on
	}

	let {
		width = 'w-auto',
		height = 'h-full',
		classesContainer = '',
		title = '',
		name = '',
		values
	}: Props = $props();

	const chart_id = `${name}_div`;
	onMount(async () => {
		const echarts = await import('echarts');
		let chart = echarts.init(document.getElementById(chart_id), null, { renderer: 'svg' });

		// specify chart configuration item and data
		var option = {
			title: {
				subtext: title
			},
			series: {
				type: 'sankey',
				layout: 'none',
				orient: 'horizontal',
				emphasis: {
					focus: 'adjacency'
				},
				data: [
					{
						name: 'Controls function'
					},
					{
						name: 'Govern'
					},
					{
						name: 'Identify'
					},
					{
						name: 'Protect'
					},
					{
						name: 'Detect'
					},
					{
						name: 'Respond'
					},
					{
						name: 'Recover'
					},
					{
						name: '--'
					}
				],
				links: values
			}
		};

		// console.debug(option);

		// use configuration item and data specified to show chart
		chart.setOption(option);

		window.addEventListener('resize', function () {
			chart.resize();
		});
	});
</script>

<div id={chart_id} class="{width} {height} {classesContainer}"></div>
