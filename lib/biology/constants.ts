import type { Trait, CycleData } from './types';

export const SAMPLE_NEWICK =
	'((Homo_sapiens:0.09,Pan_troglodytes:0.11):0.07,(Mus_musculus:0.23,Rattus_norvegicus:0.21):0.14);';

export const SAMPLE_FASTA = `>Homo_sapiens
MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHF
>Pan_troglodytes
MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHF
>Mus_musculus
MVLSGEDKSNIKAAWGKIGGHGAEYGAEALERMFASFPTTKTYFPHF`.trim();

export const BUG_TRAITS: Trait[] = [
	{ id: 'antennae', name: 'Antennae Length', dominantAllele: 'L', recessiveAllele: 'l', description: 'Long (L) vs Short (l)' },
	{ id: 'wing_color', name: 'Wing Color', dominantAllele: 'R', recessiveAllele: 'r', description: 'Red (R) vs Blue (r)' },
	{ id: 'body_shape', name: 'Body Shape', dominantAllele: 'O', recessiveAllele: 'o', description: 'Round (O) vs Oval (o)' },
	{ id: 'eye_color', name: 'Eye Color', dominantAllele: 'D', recessiveAllele: 'd', description: 'Dark (D) vs Light (d)' },
];

export const BUG_PHENOTYPES: Record<string, Record<string, string>> = {
	antennae: { LL: 'Long', Ll: 'Long', lL: 'Long', ll: 'Short' },
	wing_color: { RR: 'Red', Rr: 'Red', rR: 'Red', rr: 'Blue' },
	body_shape: { OO: 'Round', Oo: 'Round', oO: 'Round', oo: 'Oval' },
	eye_color: { DD: 'Dark', Dd: 'Dark', dD: 'Dark', dd: 'Light' },
};

export const ECOLOGY_CYCLES: CycleData[] = [
	{
		name: 'Carbon Cycle',
		description: 'Movement of carbon through atmosphere, biosphere, oceans, and geosphere.',
		reservoirs: [
			{ name: 'Atmosphere', amount: '~750 Gt C' },
			{ name: 'Oceans', amount: '~38,000 Gt C' },
			{ name: 'Fossil Fuels', amount: '~4,000 Gt C' },
			{ name: 'Terrestrial Biosphere', amount: '~2,000 Gt C' },
		],
		fluxes: [
			{ from: 'Atmosphere', to: 'Plants (Photosynthesis)', rate: '~120 Gt/year' },
			{ from: 'Plants', to: 'Atmosphere (Respiration)', rate: '~60 Gt/year' },
			{ from: 'Oceans', to: 'Atmosphere', rate: '~90 Gt/year' },
			{ from: 'Atmosphere', to: 'Oceans', rate: '~92 Gt/year' },
			{ from: 'Fossil Fuels', to: 'Atmosphere', rate: '~10 Gt/year (human)' },
		],
		humanImpact: 'Burning fossil fuels releases ~10 Gt C/year, disrupting the natural cycle and increasing atmospheric CO₂.',
	},
	{
		name: 'Nitrogen Cycle',
		description: 'Conversion and movement of nitrogen through atmosphere, soil, and living organisms.',
		reservoirs: [
			{ name: 'Atmosphere', amount: '~4 × 10¹⁵ tons N₂' },
			{ name: 'Soil Organic Matter', amount: '~1.4 × 10¹¹ tons' },
			{ name: 'Oceans', amount: '~7.2 × 10¹¹ tons' },
		],
		fluxes: [
			{ from: 'Atmosphere', to: 'Soil (Nitrogen Fixation)', rate: '~200 Tg/year' },
			{ from: 'Soil', to: 'Plants (Nitrification)', rate: '~50 Tg/year' },
			{ from: 'Organisms', to: 'Soil (Decomposition)', rate: '~50 Tg/year' },
			{ from: 'Soil', to: 'Atmosphere (Denitrification)', rate: '~30 Tg/year' },
		],
		humanImpact: 'Haber-Bosch process doubles natural nitrogen fixation. Excess fertilizer causes eutrophication and dead zones.',
	},
	{
		name: 'Water Cycle',
		description: 'Continuous movement of water on, above, and below the surface of the Earth.',
		reservoirs: [
			{ name: 'Oceans', amount: '~1.335 × 10⁹ km³' },
			{ name: 'Ice Caps/Glaciers', amount: '~24.1 × 10⁶ km³' },
			{ name: 'Groundwater', amount: '~8.4 × 10⁶ km³' },
			{ name: 'Atmosphere', amount: '~12,900 km³' },
		],
		fluxes: [
			{ from: 'Oceans', to: 'Atmosphere (Evaporation)', rate: '~434,000 km³/year' },
			{ from: 'Land', to: 'Atmosphere (Evapotranspiration)', rate: '~71,000 km³/year' },
			{ from: 'Atmosphere', to: 'Surface (Precipitation)', rate: '~505,000 km³/year' },
			{ from: 'Surface', to: 'Oceans (Runoff)', rate: '~42,000 km³/year' },
		],
		humanImpact: 'Climate change intensifies evaporation and precipitation patterns, causing more extreme droughts and floods.',
	},
	{
		name: 'Phosphorus Cycle',
		description: 'Movement of phosphorus through rocks, soil, water, and living organisms. No atmospheric component.',
		reservoirs: [
			{ name: "Earth's Crust", amount: '~0.1% by weight' },
			{ name: 'Oceans', amount: '~90 mg/m³ avg' },
			{ name: 'Soil', amount: '~400-1200 ppm' },
		],
		fluxes: [
			{ from: 'Rocks', to: 'Soil (Weathering)', rate: '~1 Tg/year' },
			{ from: 'Soil', to: 'Plants (Uptake)', rate: '~0.5 Tg/year' },
			{ from: 'Organisms', to: 'Soil (Decomposition)', rate: '~0.5 Tg/year' },
			{ from: 'Land', to: 'Oceans (Runoff)', rate: '~0.3 Tg/year' },
		],
		humanImpact: 'Mining phosphate rock for fertilizer causes runoff pollution. Phosphorus is a non-renewable resource.',
	},
];

export const BODY_SYSTEMS = [
	{ id: 'skeletal', name: 'Skeletal System', color: '#f5f5dc', description: '206 bones providing structure and protection' },
	{ id: 'muscular', name: 'Muscular System', color: '#cd5c5c', description: '~600 muscles enabling movement' },
	{ id: 'circulatory', name: 'Circulatory System', color: '#dc143c', description: 'Heart, blood, and vessels transporting nutrients' },
	{ id: 'respiratory', name: 'Respiratory System', color: '#87ceeb', description: 'Lungs and airways for gas exchange' },
	{ id: 'digestive', name: 'Digestive System', color: '#daa520', description: 'Breaks down food and absorbs nutrients' },
	{ id: 'nervous', name: 'Nervous System', color: '#ffd700', description: 'Brain, spinal cord, and nerves' },
	{ id: 'endocrine', name: 'Endocrine System', color: '#9370db', description: 'Glands producing hormones' },
	{ id: 'immune', name: 'Immune System', color: '#20b2aa', description: 'Defends against pathogens' },
];

export const ORGANS = [
	{ id: 'brain', name: 'Brain', system: 'nervous', description: 'Control center of the nervous system, ~86 billion neurons' },
	{ id: 'heart', name: 'Heart', system: 'circulatory', description: 'Muscular organ pumping blood through the circulatory system' },
	{ id: 'lungs', name: 'Lungs', system: 'respiratory', description: 'Primary organs of respiration, gas exchange' },
	{ id: 'liver', name: 'Liver', system: 'digestive', description: 'Largest internal organ, detoxification and bile production' },
	{ id: 'kidneys', name: 'Kidneys', system: 'digestive', description: 'Filter blood and produce urine' },
	{ id: 'stomach', name: 'Stomach', system: 'digestive', description: 'Muscular organ that digests food with acids and enzymes' },
	{ id: 'intestines', name: 'Intestines', system: 'digestive', description: 'Small (~6m) and large (~1.5m) intestines for nutrient absorption' },
	{ id: 'spine', name: 'Spinal Cord', system: 'nervous', description: 'Bundle of nerves running through the vertebral column' },
];
