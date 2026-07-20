'use client';

import type { SystemId } from '@/lib/biology/systemContent';

const SYSTEM_DIAGRAMS: Record<SystemId, { elements: React.ReactNode; viewBox: string }> = {
	skeletal: {
		viewBox: '0 0 300 400',
		elements: (
			<>
				<ellipse cx="150" cy="45" rx="30" ry="35" fill="none" stroke="#f59e0b" strokeWidth="2" />
				<text x="150" y="48" textAnchor="middle" fontSize="8" fill="#92400e">Skull</text>
				<line x1="150" y1="80" x2="150" y2="220" stroke="#f59e0b" strokeWidth="3" />
				<text x="170" y="150" fontSize="8" fill="#92400e">Spine</text>
				{[100, 120, 140, 160, 180].map((y, i) => (
					<ellipse key={i} cx="150" cy={y} rx={40 - i * 2} ry="6" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
				))}
				<text x="200" y="140" fontSize="8" fill="#92400e">Ribcage</text>
				<line x1="150" y1="100" x2="90" y2="180" stroke="#f59e0b" strokeWidth="2" />
				<line x1="150" y1="100" x2="210" y2="180" stroke="#f59e0b" strokeWidth="2" />
				<text x="70" y="150" fontSize="8" fill="#92400e">Humerus</text>
				<line x1="90" y1="180" x2="75" y2="250" stroke="#f59e0b" strokeWidth="2" />
				<line x1="210" y1="180" x2="225" y2="250" stroke="#f59e0b" strokeWidth="2" />
				<ellipse cx="150" cy="230" rx="35" ry="15" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
				<text x="150" y="255" textAnchor="middle" fontSize="8" fill="#92400e">Pelvis</text>
				<line x1="135" y1="245" x2="125" y2="360" stroke="#f59e0b" strokeWidth="2.5" />
				<line x1="165" y1="245" x2="175" y2="360" stroke="#f59e0b" strokeWidth="2.5" />
				<text x="105" y="310" fontSize="8" fill="#92400e">Femur</text>
				<line x1="125" y1="360" x2="120" y2="390" stroke="#f59e0b" strokeWidth="2" />
				<line x1="175" y1="360" x2="180" y2="390" stroke="#f59e0b" strokeWidth="2" />
			</>
		),
	},
	muscular: {
		viewBox: '0 0 300 400',
		elements: (
			<>
				<ellipse cx="150" cy="45" rx="28" ry="33" fill="#fecaca" stroke="#ef4444" strokeWidth="1.5" />
				<rect x="130" y="78" width="40" height="20" rx="8" fill="#fecaca" stroke="#ef4444" strokeWidth="1.5" />
				<text x="150" y="92" textAnchor="middle" fontSize="7" fill="#991b1b">Trapezius</text>
				<ellipse cx="120" cy="120" rx="25" ry="18" fill="#fecaca" stroke="#ef4444" strokeWidth="1.5" />
				<ellipse cx="180" cy="120" rx="25" ry="18" fill="#fecaca" stroke="#ef4444" strokeWidth="1.5" />
				<text x="150" y="124" textAnchor="middle" fontSize="7" fill="#991b1b">Pectorals</text>
				<ellipse cx="150" cy="160" rx="30" ry="15" fill="#fecaca" stroke="#ef4444" strokeWidth="1.5" />
				<text x="150" y="163" textAnchor="middle" fontSize="7" fill="#991b1b">Diaphragm</text>
				<rect x="125" y="175" width="50" height="30" rx="6" fill="#fecaca" stroke="#ef4444" strokeWidth="1.5" />
				<text x="150" y="193" textAnchor="middle" fontSize="7" fill="#991b1b">Abs</text>
				<ellipse cx="100" cy="140" rx="12" ry="35" fill="#fecaca" stroke="#ef4444" strokeWidth="1.5" />
				<ellipse cx="200" cy="140" rx="12" ry="35" fill="#fecaca" stroke="#ef4444" strokeWidth="1.5" />
				<text x="80" y="145" fontSize="7" fill="#991b1b">Biceps</text>
				<ellipse cx="130" cy="260" rx="18" ry="45" fill="#fecaca" stroke="#ef4444" strokeWidth="1.5" />
				<ellipse cx="170" cy="260" rx="18" ry="45" fill="#fecaca" stroke="#ef4444" strokeWidth="1.5" />
				<text x="150" y="265" textAnchor="middle" fontSize="7" fill="#991b1b">Quadriceps</text>
				<ellipse cx="130" cy="340" rx="14" ry="35" fill="#fecaca" stroke="#ef4444" strokeWidth="1.5" />
				<ellipse cx="170" cy="340" rx="14" ry="35" fill="#fecaca" stroke="#ef4444" strokeWidth="1.5" />
				<text x="150" y="345" textAnchor="middle" fontSize="7" fill="#991b1b">Calves</text>
			</>
		),
	},
	nervous: {
		viewBox: '0 0 300 400',
		elements: (
			<>
				<ellipse cx="150" cy="50" rx="40" ry="38" fill="#e9d5ff" stroke="#a855f7" strokeWidth="2" />
				<text x="150" y="40" textAnchor="middle" fontSize="8" fill="#581c87">Cerebrum</text>
				<ellipse cx="150" cy="70" rx="15" ry="10" fill="#d8b4fe" stroke="#a855f7" strokeWidth="1.5" />
				<text x="150" y="73" textAnchor="middle" fontSize="6" fill="#581c87">Cerebellum</text>
				<line x1="150" y1="88" x2="150" y2="280" stroke="#a855f7" strokeWidth="3" strokeDasharray="6 3" />
				<text x="170" y="180" fontSize="8" fill="#581c87">Spinal Cord</text>
				{[120, 150, 180, 210, 240].map((y, i) => (
					<g key={i}>
						<line x1="150" y1={y} x2={90 - i * 3} y2={y + 20} stroke="#a855f7" strokeWidth="1.5" />
						<line x1="150" y1={y} x2={210 + i * 3} y2={y + 20} stroke="#a855f7" strokeWidth="1.5" />
					</g>
				))}
				<text x="150" y="30" textAnchor="middle" fontSize="7" fill="#7e22ce">Brain (~86B neurons)</text>
				<text x="60" y="200" fontSize="7" fill="#7e22ce">Peripheral</text>
				<text x="60" y="210" fontSize="7" fill="#7e22ce">Nerves</text>
			</>
		),
	},
	circulatory: {
		viewBox: '0 0 300 400',
		elements: (
			<>
				<path d="M150,100 C130,80 110,100 130,130 L150,160 L170,130 C190,100 170,80 150,100" fill="#fecaca" stroke="#dc2626" strokeWidth="2" />
				<text x="150" y="135" textAnchor="middle" fontSize="8" fill="#991b1b">Heart</text>
				<path d="M130,110 C100,90 60,120 80,160" fill="none" stroke="#3b82f6" strokeWidth="2" />
				<text x="60" y="130" fontSize="7" fill="#1d4ed8">Pulmonary</text>
				<path d="M170,110 C200,90 240,120 220,160" fill="none" stroke="#3b82f6" strokeWidth="2" />
				<text x="225" y="130" fontSize="7" fill="#1d4ed8">Aorta</text>
				<line x1="150" y1="160" x2="150" y2="300" stroke="#dc2626" strokeWidth="2" />
				<line x1="130" y1="300" x2="130" y2="160" stroke="#3b82f6" strokeWidth="2" />
				<text x="165" y="230" fontSize="7" fill="#991b1b">Arteries</text>
				<text x="95" y="230" fontSize="7" fill="#1d4ed8">Veins</text>
				{[180, 220, 260].map((y, i) => (
					<g key={i}>
						<circle cx="100" cy={y} r="4" fill="#dc2626" opacity="0.5" />
						<circle cx="200" cy={y} r="4" fill="#3b82f6" opacity="0.5" />
					</g>
				))}
				<text x="150" y="330" textAnchor="middle" fontSize="7" fill="#6b7280">Capillary networks throughout body</text>
			</>
		),
	},
	respiratory: {
		viewBox: '0 0 300 400',
		elements: (
			<>
				<rect x="140" y="30" width="20" height="60" rx="8" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="1.5" />
				<text x="150" y="65" textAnchor="middle" fontSize="7" fill="#1e40af">Trachea</text>
				<line x1="150" y1="90" x2="120" y2="120" stroke="#3b82f6" strokeWidth="2" />
				<line x1="150" y1="90" x2="180" y2="120" stroke="#3b82f6" strokeWidth="2" />
				<text x="100" y="115" fontSize="7" fill="#1e40af">Bronchi</text>
				<ellipse cx="110" cy="180" rx="45" ry="65" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" />
				<ellipse cx="190" cy="180" rx="45" ry="65" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" />
				<text x="110" y="175" textAnchor="middle" fontSize="8" fill="#1e40af">Left Lung</text>
				<text x="190" y="175" textAnchor="middle" fontSize="8" fill="#1e40af">Right Lung</text>
				<text x="110" y="190" textAnchor="middle" fontSize="6" fill="#3b82f6">(~300M alveoli)</text>
				<text x="190" y="190" textAnchor="middle" fontSize="6" fill="#3b82f6">(~300M alveoli)</text>
				<ellipse cx="150" cy="260" rx="55" ry="12" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 2" />
				<text x="150" y="264" textAnchor="middle" fontSize="7" fill="#1e40af">Diaphragm</text>
				<path d="M150,20 L150,30" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowBlue)" />
				<text x="150" y="15" textAnchor="middle" fontSize="7" fill="#1e40af">Air in → O₂</text>
			</>
		),
	},
	digestive: {
		viewBox: '0 0 300 420',
		elements: (
			<>
				<ellipse cx="150" cy="30" rx="20" ry="12" fill="#bbf7d0" stroke="#22c55e" strokeWidth="1.5" />
				<text x="150" y="33" textAnchor="middle" fontSize="7" fill="#166534">Mouth</text>
				<line x1="150" y1="42" x2="150" y2="80" stroke="#22c55e" strokeWidth="2" />
				<text x="170" y="65" fontSize="7" fill="#166534">Esophagus</text>
				<ellipse cx="150" cy="110" rx="35" ry="25" fill="#bbf7d0" stroke="#22c55e" strokeWidth="2" />
				<text x="150" y="113" textAnchor="middle" fontSize="8" fill="#166534">Stomach</text>
				<text x="150" y="125" textAnchor="middle" fontSize="6" fill="#22c55e">(HCl + pepsin)</text>
				<path d="M150,135 C180,150 120,170 160,190 C200,210 120,230 160,250 C200,270 130,280 150,300" fill="none" stroke="#22c55e" strokeWidth="2.5" />
				<text x="210" y="200" fontSize="7" fill="#166534">Small Intestine</text>
				<text x="210" y="210" fontSize="6" fill="#22c55e">(~6m, villi)</text>
				<path d="M150,300 L120,300 L120,340 L180,340 L180,300 L160,300" fill="none" stroke="#16a34a" strokeWidth="2.5" />
				<text x="150" y="360" textAnchor="middle" fontSize="7" fill="#166534">Large Intestine (~1.5m)</text>
				<ellipse cx="80" cy="110" rx="25" ry="18" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" />
				<text x="80" y="113" textAnchor="middle" fontSize="7" fill="#166534">Liver</text>
				<ellipse cx="150" cy="155" rx="15" ry="8" fill="#dcfce7" stroke="#22c55e" strokeWidth="1" />
				<text x="150" y="170" textAnchor="middle" fontSize="6" fill="#166534">Pancreas</text>
			</>
		),
	},
	urinary: {
		viewBox: '0 0 300 400',
		elements: (
			<>
				<ellipse cx="100" cy="80" rx="30" ry="40" fill="#fed7aa" stroke="#f97316" strokeWidth="2" />
				<ellipse cx="200" cy="80" rx="30" ry="40" fill="#fed7aa" stroke="#f97316" strokeWidth="2" />
				<text x="100" y="75" textAnchor="middle" fontSize="8" fill="#9a3412">Left Kidney</text>
				<text x="200" y="75" textAnchor="middle" fontSize="8" fill="#9a3412">Right Kidney</text>
				<text x="100" y="90" textAnchor="middle" fontSize="6" fill="#c2410c">(~1M nephrons)</text>
				<text x="200" y="90" textAnchor="middle" fontSize="6" fill="#c2410c">(~1M nephrons)</text>
				<line x1="100" y1="120" x2="130" y2="220" stroke="#f97316" strokeWidth="2" />
				<line x1="200" y1="120" x2="170" y2="220" stroke="#f97316" strokeWidth="2" />
				<text x="85" y="170" fontSize="7" fill="#9a3412">Ureter</text>
				<ellipse cx="150" cy="250" rx="35" ry="30" fill="#ffedd5" stroke="#f97316" strokeWidth="2" />
				<text x="150" y="248" textAnchor="middle" fontSize="8" fill="#9a3412">Bladder</text>
				<text x="150" y="262" textAnchor="middle" fontSize="6" fill="#c2410c">(400-600 mL)</text>
				<line x1="150" y1="280" x2="150" y2="330" stroke="#f97316" strokeWidth="2" />
				<text x="170" y="310" fontSize="7" fill="#9a3412">Urethra</text>
				<text x="150" y="360" textAnchor="middle" fontSize="7" fill="#6b7280">Filters ~180L of blood daily</text>
			</>
		),
	},
	lymphatic: {
		viewBox: '0 0 300 400',
		elements: (
			<>
				<circle cx="150" cy="50" r="20" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="1.5" />
				<text x="150" y="53" textAnchor="middle" fontSize="7" fill="#115e59">Tonsils</text>
				<ellipse cx="90" cy="100" rx="15" ry="10" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="1.5" />
				<ellipse cx="210" cy="100" rx="15" ry="10" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="1.5" />
				<text x="90" y="103" textAnchor="middle" fontSize="6" fill="#115e59">Node</text>
				<text x="210" y="103" textAnchor="middle" fontSize="6" fill="#115e59">Node</text>
				<ellipse cx="150" cy="120" rx="25" ry="15" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="2" />
				<text x="150" y="123" textAnchor="middle" fontSize="7" fill="#115e59">Thymus</text>
				<ellipse cx="80" cy="180" rx="30" ry="20" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="2" />
				<text x="80" y="183" textAnchor="middle" fontSize="7" fill="#115e59">Spleen</text>
				<text x="80" y="195" textAnchor="middle" fontSize="6" fill="#14b8a6">(filters blood)</text>
				{[140, 180, 220, 260, 300].map((y, i) => (
					<g key={i}>
						<circle cx={100 + (i % 2) * 100} cy={y} r="6" fill="#99f6e4" stroke="#14b8a6" strokeWidth="1" />
						<text x={100 + (i % 2) * 100} y={y + 3} textAnchor="middle" fontSize="5" fill="#115e59">LN</text>
					</g>
				))}
				<line x1="150" y1="70" x2="150" y2="350" stroke="#14b8a6" strokeWidth="1" strokeDasharray="4 3" />
				<text x="165" y="350" fontSize="7" fill="#115e59">Lymphatic vessels</text>
				<text x="150" y="380" textAnchor="middle" fontSize="7" fill="#6b7280">~600 lymph nodes throughout body</text>
			</>
		),
	},
	endocrine: {
		viewBox: '0 0 300 400',
		elements: (
			<>
				<circle cx="150" cy="40" r="12" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.5" />
				<text x="150" y="43" textAnchor="middle" fontSize="6" fill="#5b21b6">Pituitary</text>
				<rect x="120" y="60" width="60" height="15" rx="6" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.5" />
				<text x="150" y="71" textAnchor="middle" fontSize="6" fill="#5b21b6">Hypothalamus</text>
				<path d="M125,95 L140,85 L160,85 L175,95 L160,105 L140,105 Z" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.5" />
				<text x="150" y="98" textAnchor="middle" fontSize="6" fill="#5b21b6">Thyroid</text>
				<rect x="100" y="120" width="20" height="12" rx="4" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1" />
				<rect x="180" y="120" width="20" height="12" rx="4" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1" />
				<text x="110" y="129" textAnchor="middle" fontSize="5" fill="#5b21b6">PTH</text>
				<text x="190" y="129" textAnchor="middle" fontSize="5" fill="#5b21b6">PTH</text>
				<ellipse cx="150" cy="170" rx="20" ry="12" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.5" />
				<text x="150" y="173" textAnchor="middle" fontSize="6" fill="#5b21b6">Thymus</text>
				<ellipse cx="100" cy="210" rx="20" ry="12" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.5" />
				<ellipse cx="200" cy="210" rx="20" ry="12" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.5" />
				<text x="100" y="213" textAnchor="middle" fontSize="5" fill="#5b21b6">Adrenal</text>
				<text x="200" y="213" textAnchor="middle" fontSize="5" fill="#5b21b6">Adrenal</text>
				<ellipse cx="150" cy="260" rx="25" ry="15" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.5" />
				<text x="150" y="258" textAnchor="middle" fontSize="6" fill="#5b21b6">Pancreas</text>
				<text x="150" y="270" textAnchor="middle" fontSize="5" fill="#7c3aed">(Insulin/Glucagon)</text>
				<text x="150" y="310" textAnchor="middle" fontSize="7" fill="#6b7280">Hormones travel via bloodstream</text>
				<text x="150" y="325" textAnchor="middle" fontSize="7" fill="#6b7280">to target organs throughout body</text>
			</>
		),
	},
};

export function SystemDiagram2D({ systemId }: { systemId: SystemId }) {
	const diagram = SYSTEM_DIAGRAMS[systemId];
	if (!diagram) return null;

	return (
		<div className="bio-diagram-container">
			<svg viewBox={diagram.viewBox} className="bio-diagram-svg">
				<rect x="0" y="0" width="300" height="400" rx="12" fill="var(--surface)" />
				{diagram.elements}
			</svg>
		</div>
	);
}

export default SystemDiagram2D;
