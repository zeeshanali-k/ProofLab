'use client';

import React, { useState } from 'react';
import { SAMPLE_NEWICK } from '@/lib/biology/constants';
import { ErrorDisplay } from './ErrorDisplay';
import CopyButton from '../CopyButton';

interface TreeNode {
	name: string;
	branchLength: number;
	children: TreeNode[];
}

function parseNewick(newick: string): TreeNode {
	const root: TreeNode = { name: '', branchLength: 0, children: [] };
	const stack: TreeNode[] = [root];
	let current = root;
	let i = 0;
	let nameBuffer = '';

	while (i < newick.length) {
		const ch = newick[i];
		if (ch === '(') {
			const child: TreeNode = { name: '', branchLength: 0, children: [] };
			current.children.push(child);
			stack.push(child);
			current = child;
			i++;
		} else if (ch === ',') {
			stack.pop();
			current = stack[stack.length - 1];
			const child: TreeNode = { name: '', branchLength: 0, children: [] };
			current.children.push(child);
			stack.push(child);
			current = child;
			i++;
		} else if (ch === ')') {
			if (nameBuffer) {
				current.name = nameBuffer.trim();
				nameBuffer = '';
			}
			stack.pop();
			current = stack.length > 0 ? stack[stack.length - 1] : root;
			i++;
		} else if (ch === ':') {
			if (nameBuffer) {
				current.name = nameBuffer.trim();
				nameBuffer = '';
			}
			i++;
			let numStr = '';
			while (i < newick.length && /[\d.e\-]/.test(newick[i])) {
				numStr += newick[i];
				i++;
			}
			current.branchLength = parseFloat(numStr) || 0;
		} else if (ch === ';') {
			i++;
		} else {
			nameBuffer += ch;
			i++;
		}
	}

	return root.children[0] || root;
}

function TreeSVG({ node, x = 0, y = 0, scaleX = 600, scaleY = 300, depth = 0, maxDepth = 5 }: {
	node: TreeNode; x?: number; y?: number; scaleX?: number; scaleY?: number; depth?: number; maxDepth?: number;
}) {
	const leaves: TreeNode[] = [];
	function collectLeaves(n: TreeNode) {
		if (n.children.length === 0) leaves.push(n);
		else n.children.forEach(collectLeaves);
	}
	collectLeaves(node);
	const totalLeaves = leaves.length;
	const leafSpacing = scaleY / Math.max(totalLeaves, 1);

	let leafIndex = 0;
	const elements: React.ReactElement[] = [];
	const maxBranch = 0.3;

	function renderNode(n: TreeNode, px: number, py: number, d: number) {
		const nx = px + (n.branchLength / maxBranch) * scaleX * 0.7;
		if (n.children.length === 0) {
			const ny = leafIndex * leafSpacing + leafSpacing / 2;
			leafIndex++;
			elements.push(
				<line key={`h-${d}-${n.name}`} x1={px} y1={py} x2={nx} y2={ny}
					stroke="#6366f1" strokeWidth="2" />,
				<line key={`v-${d}-${n.name}`} x1={px} y1={py} x2={px} y2={ny}
					stroke="#6366f1" strokeWidth="2" />,
				<text key={`t-${d}-${n.name}`} x={nx + 6} y={ny + 4}
					fontSize="12" fill="#1f2937" fontWeight="500">
					{n.name.replace(/_/g, ' ')}
				</text>,
				<circle key={`d-${d}-${n.name}`} cx={nx} cy={ny} r="3" fill="#6366f1" />
			);
		} else {
			const childYs: number[] = [];
			n.children.forEach((child, ci) => {
				const childPy = py + (ci - (n.children.length - 1) / 2) * leafSpacing * 0.8;
				childYs.push(childPy);
			});
			const avgY = childYs.reduce((a, b) => a + b, 0) / childYs.length;
			elements.push(
				<line key={`trunk-${d}`} x1={px} y1={py} x2={nx} y2={py}
					stroke="#6366f1" strokeWidth="2" />
			);
			n.children.forEach((child, ci) => {
				const childNx = nx + (child.branchLength / maxBranch) * scaleX * 0.7;
				const childPy = childYs[ci];
				elements.push(
					<line key={`vh-${d}-${ci}`} x1={nx} y1={py} x2={nx} y2={childPy}
						stroke="#6366f1" strokeWidth="2" />,
					<line key={`hh-${d}-${ci}`} x1={nx} y1={childPy} x2={childNx} y2={childPy}
						stroke="#6366f1" strokeWidth="2" />
				);
				renderNode(child, childNx, childPy, d + 1);
			});
		}
	}

	renderNode(node, 40, scaleY / 2, 0);

	return (
		<svg viewBox={`0 0 ${scaleX + 160} ${scaleY + 20}`} className="bio-tree-svg">
			<rect x="0" y="0" width={scaleX + 160} height={scaleY + 20} rx="8" fill="#fafbfc" />
			{elements}
			<text x="10" y={scaleY + 12} fontSize="10" fill="#94a3b8">Branch length = evolutionary distance</text>
		</svg>
	);
}

export function PhylogeneticTree() {
	const [newick, setNewick] = useState(SAMPLE_NEWICK);
	const [customNewick, setCustomNewick] = useState('');
	const [showEditor, setShowEditor] = useState(false);

	let tree: TreeNode | null = null;
	try {
		tree = parseNewick(newick);
	} catch {
		tree = null;
	}

	return (
		<div className="bio-card">
			<h3 className="bio-card-title">🌳 Phylogenetic Tree Viewer</h3>
			<p className="bio-card-desc">Visualize evolutionary relationships from Newick format trees</p>

			<div className="bio-controls">
				<button onClick={() => setShowEditor(!showEditor)} className="bio-btn">
					{showEditor ? 'Hide' : 'Edit'} Newick String
				</button>
			</div>

			{showEditor && (
				<div className="bio-newick-editor">
					<label>Newick Format:</label>
					<textarea
						value={customNewick || newick}
						onChange={(e) => {
							setCustomNewick(e.target.value);
							if (e.target.value.trim()) setNewick(e.target.value.trim());
						}}
						className="bio-newick-input"
						rows={3}
						placeholder="((A:0.1,B:0.2):0.3,C:0.4);"
					/>
				</div>
			)}

			<div className="bio-viewer-container" style={{ minHeight: 350 }}>
				{tree ? (
					<TreeSVG node={tree} scaleX={500} scaleY={280} />
				) : (
					<div className="bio-loading">Invalid Newick format</div>
				)}
			</div>

			<div className="bio-tree-legend">
				<h4>Reading the Tree</h4>
				<div className="bio-legend-items">
					<div className="bio-legend-item">
						<svg width="30" height="10"><line x1="0" y1="5" x2="30" y2="5" stroke="#6366f1" strokeWidth="2" /></svg>
						<span>Branch = evolutionary lineage</span>
					</div>
					<div className="bio-legend-item">
						<svg width="10" height="10"><circle cx="5" cy="5" r="3" fill="#6366f1" /></svg>
						<span>Node = species/taxon</span>
					</div>
					<div className="bio-legend-item">
						<span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Branch length = genetic distance (substitutions/site)</span>
					</div>
				</div>
			</div>

			<div className="bio-info">
				<strong>Sample tree:</strong> Human ↔ Chimpanzee (closest relatives), then Mouse ↔ Rat, showing mammalian evolution
				<br />
				<strong>Features:</strong> Newick format • Custom tree input • Branch lengths • Interactive
			</div>

			<ErrorDisplay errors={[]} />

			<CopyButton textToCopy={newick} className="bio-copy-btn">
				Copy Newick String
			</CopyButton>
		</div>
	);
}

export default PhylogeneticTree;
