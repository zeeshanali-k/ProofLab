export type SystemId =
	| 'skeletal' | 'muscular' | 'nervous' | 'circulatory'
	| 'respiratory' | 'digestive' | 'urinary' | 'lymphatic' | 'endocrine';

export interface OrganInfo {
	name: string;
	description: string;
	location: string;
	fn: string;
}

export interface StructureInfo {
	name: string;
	description: string;
	type: string;
}

export interface ConditionInfo {
	name: string;
	description: string;
	symptoms: string[];
}

export interface SystemInfo {
	id: SystemId;
	name: string;
	icon: string;
	color: string;
	description: string;
	functions: string[];
	mainOrgans: OrganInfo[];
	keyStructures: StructureInfo[];
	commonConditions: ConditionInfo[];
	funFact: string;
}

export const SYSTEM_IDS: SystemId[] = [
	'skeletal', 'muscular', 'nervous', 'circulatory',
	'respiratory', 'digestive', 'urinary', 'lymphatic', 'endocrine'
];

export const SYSTEM_CONTENT: Record<SystemId, SystemInfo> = {
	skeletal: {
		id: 'skeletal', name: 'Skeletal System', icon: '🦴', color: '#f59e0b',
		description: 'The skeletal system provides structure, protection, and movement. The adult human body has 206 bones organized into axial and appendicular divisions.',
		functions: [
			'Provides structural support for the body',
			'Protects vital organs (skull → brain, ribcage → heart/lungs)',
			'Enables movement through joints and muscle attachments',
			'Produces blood cells in bone marrow (hematopoiesis)',
			'Stores minerals — calcium and phosphorus',
		],
		mainOrgans: [
			{ name: 'Skull (Cranium)', description: '22 bones fused together protecting the brain and forming the face.', location: 'Head', fn: 'Protection, sensory organ housing' },
			{ name: 'Spine (Vertebral Column)', description: '33 vertebrae (7 cervical, 12 thoracic, 5 lumbar, 5 sacral, 4 coccygeal).', location: 'Back', fn: 'Supports body, protects spinal cord' },
			{ name: 'Ribcage', description: '12 pairs of ribs — 7 true, 3 false, 2 floating.', location: 'Thorax', fn: 'Protects heart and lungs, assists breathing' },
			{ name: 'Femur', description: 'Longest and strongest bone (~48 cm). Supports up to 30x body weight.', location: 'Thigh', fn: 'Weight bearing, locomotion' },
			{ name: 'Pelvis', description: 'Bowl-shaped structure of ilium, ischium, and pubis.', location: 'Hip', fn: 'Supports organs, transfers weight to legs' },
		],
		keyStructures: [
			{ name: 'Compact Bone', description: 'Dense outer layer — 80% of bone mass.', type: 'tissue' },
			{ name: 'Spongy Bone', description: 'Porous inner lattice containing red marrow.', type: 'tissue' },
			{ name: 'Cartilage', description: 'Flexible connective tissue cushioning joints.', type: 'tissue' },
			{ name: 'Ligaments', description: 'Connect bone to bone, stabilizing joints.', type: 'tissue' },
			{ name: 'Periosteum', description: 'Membrane covering bones, supplies blood.', type: 'membrane' },
		],
		commonConditions: [
			{ name: 'Osteoporosis', description: 'Loss of bone density making bones fragile and prone to fracture.', symptoms: ['Back pain', 'Loss of height', 'Fractures from minor falls'] },
			{ name: 'Arthritis', description: 'Inflammation of joints causing pain and stiffness.', symptoms: ['Joint pain', 'Stiffness', 'Swelling', 'Reduced range of motion'] },
			{ name: 'Fracture', description: 'A break in bone continuity from trauma or stress.', symptoms: ['Pain', 'Swelling', 'Deformity', 'Inability to bear weight'] },
		],
		funFact: 'Babies are born with ~270 bones, but adults have only 206 — many fuse together during growth!',
	},
	muscular: {
		id: 'muscular', name: 'Muscular System', icon: '💪', color: '#ef4444',
		description: 'The muscular system consists of ~600 muscles that enable movement, maintain posture, and generate heat. Muscles account for ~40% of body weight.',
		functions: [
			'Enables voluntary movement (skeletal muscles)',
			'Maintains posture and body position',
			'Generates heat through metabolic activity (thermogenesis)',
			'Protects internal organs (abdominal wall)',
			'Moves substances through hollow organs (peristalsis)',
		],
		mainOrgans: [
			{ name: 'Heart (Cardiac Muscle)', description: 'Specialized involuntary muscle pumping blood continuously.', location: 'Thorax', fn: 'Pumps ~5L of blood per minute' },
			{ name: 'Diaphragm', description: 'Dome-shaped muscle separating thorax from abdomen.', location: 'Lower chest', fn: 'Primary muscle of breathing' },
			{ name: 'Quadriceps', description: 'Group of 4 muscles in the front of the thigh.', location: 'Thigh', fn: 'Extends the knee, stabilizes the leg' },
			{ name: 'Biceps Brachii', description: 'Two-headed muscle in the upper arm.', location: 'Upper arm', fn: 'Flexes the elbow, supinates the forearm' },
			{ name: 'Gluteus Maximus', description: 'Largest muscle in the body by mass.', location: 'Buttock', fn: 'Extends the hip, maintains upright posture' },
		],
		keyStructures: [
			{ name: 'Sarcomere', description: 'Basic contractile unit of muscle fibers.', type: 'cell' },
			{ name: 'Tendon', description: 'Connects muscle to bone, transmits force.', type: 'tissue' },
			{ name: 'Fascia', description: 'Connective tissue wrapping and separating muscles.', type: 'tissue' },
			{ name: 'Motor Unit', description: 'One motor neuron + all muscle fibers it controls.', type: 'nerve' },
		],
		commonConditions: [
			{ name: 'Muscular Dystrophy', description: 'Group of genetic diseases causing progressive muscle weakness.', symptoms: ['Progressive weakness', 'Frequent falls', 'Difficulty walking'] },
			{ name: 'Strain', description: 'Tearing of muscle fibers from overstretching.', symptoms: ['Sudden pain', 'Swelling', 'Bruising', 'Loss of function'] },
			{ name: 'Myasthenia Gravis', description: 'Autoimmune disorder disrupting nerve-muscle communication.', symptoms: ['Drooping eyelids', 'Difficulty swallowing', 'Muscle fatigue'] },
		],
		funFact: 'The strongest muscle relative to its size is the masseter (jaw muscle) — it can close the teeth with a force of up to 200 pounds!',
	},
	nervous: {
		id: 'nervous', name: 'Nervous System', icon: '🧠', color: '#a855f7',
		description: 'The nervous system is the body\'s command center. The brain contains ~86 billion neurons connected by ~100 trillion synapses, processing information at speeds up to 120 m/s.',
		functions: [
			'Receives and processes sensory information',
			'Coordinates voluntary and involuntary movements',
			'Regulates homeostasis (body temperature, hunger, thirst)',
			'Enables cognition, memory, emotion, and consciousness',
			'Controls reflexes through spinal cord circuits',
		],
		mainOrgans: [
			{ name: 'Brain', description: '~1.4 kg organ with 4 lobes: frontal, parietal, temporal, occipital.', location: 'Cranium', fn: 'Higher cognition, sensory processing, motor control' },
			{ name: 'Spinal Cord', description: '~45 cm bundle of nerves running through vertebrae.', location: 'Vertebral column', fn: 'Relays signals between brain and body, reflex center' },
			{ name: 'Cerebellum', description: 'Contains more neurons than the rest of the brain combined.', location: 'Lower brain', fn: 'Coordination, balance, fine motor control' },
			{ name: 'Hypothalamus', description: 'Peanut-sized structure controlling the autonomic nervous system.', location: 'Base of brain', fn: 'Regulates temperature, hunger, sleep, hormones' },
		],
		keyStructures: [
			{ name: 'Neuron', description: 'Excitable cell that transmits electrical impulses.', type: 'cell' },
			{ name: 'Synapse', description: 'Junction between neurons where chemical signals pass.', type: 'cell' },
			{ name: 'Myelin Sheath', description: 'Fatty insulation around axons, speeds signal transmission.', type: 'tissue' },
			{ name: 'Meninges', description: 'Three protective membranes around brain and spinal cord.', type: 'membrane' },
			{ name: 'Cranial Nerves', description: '12 pairs of nerves emerging directly from the brain.', type: 'nerve' },
		],
		commonConditions: [
			{ name: 'Alzheimer\'s Disease', description: 'Progressive neurodegenerative disease affecting memory and cognition.', symptoms: ['Memory loss', 'Confusion', 'Language difficulties', 'Behavioral changes'] },
			{ name: 'Epilepsy', description: 'Neurological disorder causing recurrent seizures.', symptoms: ['Seizures', 'Aura', 'Loss of consciousness', 'Muscle spasms'] },
			{ name: 'Multiple Sclerosis', description: 'Autoimmune disease destroying myelin sheaths.', symptoms: ['Numbness', 'Vision problems', 'Muscle weakness', 'Coordination difficulties'] },
		],
		funFact: 'Your brain uses ~20% of your body\'s total energy despite being only 2% of your body weight!',
	},
	circulatory: {
		id: 'circulatory', name: 'Circulatory System', icon: '❤️', color: '#dc2626',
		description: 'The circulatory system transports blood, oxygen, nutrients, and waste throughout the body. The heart beats ~100,000 times per day, pumping ~7,500 liters of blood.',
		functions: [
			'Transports oxygen from lungs to tissues',
			'Delivers nutrients and hormones to cells',
			'Removes carbon dioxide and metabolic waste',
			'Regulates body temperature',
			'Carries immune cells and clotting factors',
		],
		mainOrgans: [
			{ name: 'Heart', description: '4-chambered muscular pump (~300g). Right side pumps to lungs, left to body.', location: 'Thorax', fn: 'Pumps blood through pulmonary and systemic circuits' },
			{ name: 'Aorta', description: 'Largest artery (~2.5 cm diameter). Carries oxygenated blood from the heart.', location: 'Thorax/Abdomen', fn: 'Distributes blood to all body systems' },
			{ name: 'Capillaries', description: 'Microscopic vessels (5-10 μm) where gas exchange occurs.', location: 'Throughout body', fn: 'Exchange of O₂, CO₂, nutrients, waste' },
			{ name: 'Vena Cava', description: 'Largest veins returning deoxygenated blood to the heart.', location: 'Thorax', fn: 'Returns blood from body to right atrium' },
		],
		keyStructures: [
			{ name: 'Red Blood Cells', description: '~5 million/μL. Carry O₂ via hemoglobin.', type: 'cell' },
			{ name: 'White Blood Cells', description: 'Immune defense cells — neutrophils, lymphocytes, etc.', type: 'cell' },
			{ name: 'Platelets', description: 'Cell fragments that initiate blood clotting.', type: 'cell' },
			{ name: 'Heart Valves', description: '4 valves ensuring one-directional blood flow.', type: 'organ' },
			{ name: 'Arteries', description: 'Thick-walled vessels carrying blood away from heart.', type: 'vessel' },
		],
		commonConditions: [
			{ name: 'Coronary Artery Disease', description: 'Plaque buildup narrowing heart arteries.', symptoms: ['Chest pain (angina)', 'Shortness of breath', 'Heart attack'] },
			{ name: 'Hypertension', description: 'Chronically elevated blood pressure (>130/80 mmHg).', symptoms: ['Often asymptomatic', 'Headaches', 'Nosebleeds', 'Vision changes'] },
			{ name: 'Heart Failure', description: 'Heart cannot pump enough blood for the body\'s needs.', symptoms: ['Fatigue', 'Shortness of breath', 'Swelling in legs', 'Rapid heartbeat'] },
		],
		funFact: 'If laid end to end, all blood vessels in your body would stretch ~100,000 km — enough to wrap around Earth 2.5 times!',
	},
	respiratory: {
		id: 'respiratory', name: 'Respiratory System', icon: '🫁', color: '#3b82f6',
		description: 'The respiratory system enables gas exchange — bringing oxygen into the body and removing carbon dioxide. You breathe ~20,000 times per day, processing ~11,000 liters of air.',
		functions: [
			'Gas exchange: O₂ in, CO₂ out',
			'Regulates blood pH by controlling CO₂ levels',
			'Enables speech and vocalization',
			'Filters, warms, and humidifies inhaled air',
			'Protects against airborne pathogens (mucus, cilia)',
		],
		mainOrgans: [
			{ name: 'Lungs', description: 'Paired organs with ~300 million alveoli providing ~70 m² of surface area.', location: 'Thorax', fn: 'Gas exchange between air and blood' },
			{ name: 'Trachea', description: 'Windpipe — 10-12 cm tube reinforced by C-shaped cartilage rings.', location: 'Neck/Thorax', fn: 'Airway connecting larynx to bronchi' },
			{ name: 'Diaphragm', description: 'Dome-shaped skeletal muscle — primary breathing muscle.', location: 'Below lungs', fn: 'Contracts to create negative pressure for inhalation' },
			{ name: 'Bronchi', description: 'Main airways branching from trachea into each lung.', location: 'Thorax', fn: 'Distribute air throughout the lungs' },
		],
		keyStructures: [
			{ name: 'Alveoli', description: 'Tiny air sacs (~0.2 mm) where gas exchange occurs.', type: 'tissue' },
			{ name: 'Cilia', description: 'Hair-like projections moving mucus and debris upward.', type: 'cell' },
			{ name: 'Pleura', description: 'Double membrane surrounding each lung.', type: 'membrane' },
			{ name: 'Surfactant', description: 'Soap-like substance reducing alveolar surface tension.', type: 'tissue' },
		],
		commonConditions: [
			{ name: 'Asthma', description: 'Chronic inflammation causing airway narrowing and spasms.', symptoms: ['Wheezing', 'Shortness of breath', 'Chest tightness', 'Coughing'] },
			{ name: 'COPD', description: 'Chronic obstructive pulmonary disease — emphysema + chronic bronchitis.', symptoms: ['Chronic cough', 'Sputum production', 'Progressive breathlessness'] },
			{ name: 'Pneumonia', description: 'Infection inflaming the alveoli, which may fill with fluid.', symptoms: ['Fever', 'Productive cough', 'Chest pain', 'Difficulty breathing'] },
		],
		funFact: 'Your lungs contain ~300 million alveoli, providing a surface area roughly the size of a tennis court (~70 m²)!',
	},
	digestive: {
		id: 'digestive', name: 'Digestive System', icon: '🍽️', color: '#22c55e',
		description: 'The digestive system breaks down food into absorbable nutrients. The entire tract is ~9 meters long, from mouth to anus, with specialized organs performing mechanical and chemical digestion.',
		functions: [
			'Ingestion and mechanical breakdown of food',
			'Chemical digestion via enzymes and acids',
			'Absorption of nutrients, water, and electrolytes',
			'Elimination of indigestible waste',
			'Hosts gut microbiome (~100 trillion bacteria)',
		],
		mainOrgans: [
			{ name: 'Stomach', description: 'J-shaped muscular sac producing HCl (pH 1.5-3.5) and pepsin.', location: 'Upper abdomen', fn: 'Chemical and mechanical digestion of proteins' },
			{ name: 'Small Intestine', description: '~6 m long — duodenum, jejunum, ileum. Lined with villi.', location: 'Abdomen', fn: 'Primary site of nutrient absorption' },
			{ name: 'Large Intestine', description: '~1.5 m — absorbs water, houses gut bacteria.', location: 'Abdomen', fn: 'Water absorption, feces formation' },
			{ name: 'Liver', description: 'Largest internal organ (~1.5 kg). Performs 500+ functions.', location: 'Upper right abdomen', fn: 'Detoxification, bile production, nutrient storage' },
			{ name: 'Pancreas', description: 'Dual-function organ — exocrine (digestive enzymes) and endocrine (insulin).', location: 'Behind stomach', fn: 'Produces digestive enzymes and hormones' },
		],
		keyStructures: [
			{ name: 'Villi', description: 'Finger-like projections increasing absorption surface area.', type: 'tissue' },
			{ name: 'Enzymes', description: 'Amylase, lipase, protease — break down carbs, fats, proteins.', type: 'cell' },
			{ name: 'Sphincters', description: 'Ring muscles controlling passage between organs.', type: 'tissue' },
			{ name: 'Gut Microbiome', description: '~100 trillion bacteria aiding digestion and immunity.', type: 'cell' },
		],
		commonConditions: [
			{ name: 'GERD', description: 'Gastroesophageal reflux — stomach acid flows back into esophagus.', symptoms: ['Heartburn', 'Regurgitation', 'Chest pain', 'Difficulty swallowing'] },
			{ name: 'Crohn\'s Disease', description: 'Chronic inflammation anywhere along the GI tract.', symptoms: ['Abdominal pain', 'Diarrhea', 'Weight loss', 'Fatigue'] },
			{ name: 'Irritable Bowel Syndrome', description: 'Functional disorder affecting large intestine.', symptoms: ['Cramping', 'Bloating', 'Alternating diarrhea/constipation'] },
		],
		funFact: 'Your stomach produces a new layer of mucus every two weeks — otherwise it would digest itself with its own acid!',
	},
	urinary: {
		id: 'urinary', name: 'Urinary System', icon: '🧫', color: '#f97316',
		description: 'The urinary system filters blood, removes waste, and regulates fluid balance. The kidneys filter ~180 liters of blood daily, producing ~1.5 liters of urine.',
		functions: [
			'Filters blood to remove metabolic waste (urea, creatinine)',
			'Regulates fluid volume and electrolyte balance',
			'Controls blood pressure via renin-angiotensin system',
			'Maintains blood pH (5.5-7.0 in urine)',
			'Produces erythropoietin (stimulates red blood cell production)',
		],
		mainOrgans: [
			{ name: 'Kidneys', description: 'Bean-shaped organs (~12 cm). Each contains ~1 million nephrons.', location: 'Retroperitoneal', fn: 'Filter blood, produce urine, regulate homeostasis' },
			{ name: 'Ureters', description: 'Two muscular tubes (~25 cm) connecting kidneys to bladder.', location: 'Abdomen/Pelvis', fn: 'Transport urine via peristalsis' },
			{ name: 'Bladder', description: 'Hollow muscular organ expanding to hold 400-600 mL.', location: 'Pelvis', fn: 'Stores urine until voluntary release' },
			{ name: 'Urethra', description: 'Tube from bladder to exterior (~4 cm female, ~20 cm male).', location: 'Pelvis', fn: 'Conducts urine out of the body' },
		],
		keyStructures: [
			{ name: 'Nephron', description: 'Functional unit — glomerulus + tubule. ~1 million per kidney.', type: 'organ' },
			{ name: 'Glomerulus', description: 'Capillary tuft filtering blood by pressure.', type: 'vessel' },
			{ name: 'Loop of Henle', description: 'U-shaped tubule concentrating urine via countercurrent exchange.', type: 'tissue' },
			{ name: 'Detrusor Muscle', description: 'Smooth muscle in bladder wall that contracts during urination.', type: 'tissue' },
		],
		commonConditions: [
			{ name: 'Kidney Stones', description: 'Hard mineral deposits forming in the kidneys.', symptoms: ['Severe flank pain', 'Blood in urine', 'Nausea', 'Painful urination'] },
			{ name: 'UTI', description: 'Bacterial infection of the urinary tract.', symptoms: ['Burning urination', 'Frequent urge', 'Cloudy urine', 'Pelvic pain'] },
			{ name: 'Chronic Kidney Disease', description: 'Progressive loss of kidney function over time.', symptoms: ['Fatigue', 'Swelling', 'Changes in urination', 'Nausea'] },
		],
		funFact: 'Your kidneys filter your entire blood supply about 40 times a day — processing ~180 liters daily!',
	},
	lymphatic: {
		id: 'lymphatic', name: 'Lymphatic & Immune System', icon: '🛡️', color: '#14b8a6',
		description: 'The lymphatic and immune system defends against pathogens, removes waste, and maintains fluid balance. It produces ~2 billion immune cells per day.',
		functions: [
			'Defends against bacteria, viruses, and other pathogens',
			'Returns excess fluid from tissues to bloodstream',
			'Absorbs dietary fats from the digestive system',
			'Produces and matures lymphocytes (T cells, B cells)',
			'Monitors for and destroys cancer cells',
		],
		mainOrgans: [
			{ name: 'Spleen', description: 'Largest lymphatic organ (~12 cm). Filters blood and stores platelets.', location: 'Upper left abdomen', fn: 'Filters blood, recycles old RBCs, immune response' },
			{ name: 'Thymus', description: 'Two-lobed organ where T cells mature. Shrinks after puberty.', location: 'Upper chest', fn: 'T cell maturation and education' },
			{ name: 'Tonsils', description: 'Lymphoid tissue at the back of the throat.', location: 'Throat', fn: 'First line of defense against ingested/inhaled pathogens' },
			{ name: 'Bone Marrow', description: 'Soft tissue inside bones producing all blood cells.', location: 'Inside bones', fn: 'Produces B cells, all blood cells (hematopoiesis)' },
		],
		keyStructures: [
			{ name: 'Lymph Nodes', description: '~600 bean-shaped filters along lymphatic vessels.', type: 'organ' },
			{ name: 'Lymphocytes', description: 'T cells (cell-mediated) and B cells (antibody-mediated).', type: 'cell' },
			{ name: 'Antibodies', description: 'Y-shaped proteins recognizing specific antigens.', type: 'cell' },
			{ name: 'Lymphatic Vessels', description: 'Network carrying lymph fluid throughout the body.', type: 'vessel' },
			{ name: 'Macrophages', description: '"Big eaters" — phagocytic cells that engulf pathogens.', type: 'cell' },
		],
		commonConditions: [
			{ name: 'Lymphoma', description: 'Cancer of lymphocytes — Hodgkin and non-Hodgkin types.', symptoms: ['Swollen lymph nodes', 'Fever', 'Night sweats', 'Weight loss'] },
			{ name: 'Autoimmune Disease', description: 'Immune system attacks the body\'s own tissues.', symptoms: ['Varies by type', 'Inflammation', 'Fatigue', 'Joint pain'] },
			{ name: 'Lymphedema', description: 'Swelling from blocked lymphatic fluid drainage.', symptoms: ['Swelling in limbs', 'Heaviness', 'Recurring infections'] },
		],
		funFact: 'You have ~600 lymph nodes in your body — they act as checkpoints where immune cells sample fluid for pathogens!',
	},
	endocrine: {
		id: 'endocrine', name: 'Endocrine System', icon: '⚗️', color: '#8b5cf6',
		description: 'The endocrine system produces hormones that regulate metabolism, growth, reproduction, and mood. Hormones travel through blood to target organs, acting as chemical messengers.',
		functions: [
			'Regulates metabolism and energy balance',
			'Controls growth and development',
			'Maintains homeostasis (calcium, blood sugar, water)',
			'Regulates reproduction and sexual development',
			'Controls mood, sleep cycles, and stress response',
		],
		mainOrgans: [
			{ name: 'Pituitary Gland', description: '"Master gland" (~1 cm, 0.5g). Controls other endocrine glands.', location: 'Base of brain', fn: 'Produces GH, TSH, ACTH, FSH, LH, prolactin, ADH' },
			{ name: 'Thyroid Gland', description: 'Butterfly-shaped gland (~25g) in the neck.', location: 'Neck', fn: 'Produces T3/T4 (metabolism) and calcitonin (calcium)' },
			{ name: 'Adrenal Glands', description: 'Paired glands atop each kidney. Cortex + medulla.', location: 'Above kidneys', fn: 'Produces cortisol, aldosterone, adrenaline' },
			{ name: 'Pancreas (Islets)', description: 'Islets of Langerhans — alpha (glucagon) and beta (insulin) cells.', location: 'Abdomen', fn: 'Regulates blood glucose levels' },
			{ name: 'Hypothalamus', description: 'Links nervous system to endocrine system via the pituitary.', location: 'Brain', fn: 'Controls temperature, hunger, thirst, circadian rhythm' },
		],
		keyStructures: [
			{ name: 'Hormones', description: 'Chemical messengers — steroids, peptides, amines.', type: 'cell' },
			{ name: 'Receptors', description: 'Protein molecules on/in target cells detecting hormones.', type: 'cell' },
			{ name: 'Feedback Loops', description: 'Negative feedback maintaining hormone levels within range.', type: 'tissue' },
			{ name: 'Pineal Gland', description: 'Produces melatonin regulating sleep-wake cycles.', type: 'organ' },
		],
		commonConditions: [
			{ name: 'Diabetes Mellitus', description: 'Impaired insulin production (Type 1) or response (Type 2).', symptoms: ['Excessive thirst', 'Frequent urination', 'Fatigue', 'Blurred vision'] },
			{ name: 'Hypothyroidism', description: 'Underactive thyroid — insufficient thyroid hormone.', symptoms: ['Fatigue', 'Weight gain', 'Cold sensitivity', 'Dry skin'] },
			{ name: 'Cushing\'s Syndrome', description: 'Excess cortisol production from adrenal glands.', symptoms: ['Weight gain', 'Round face', 'High blood pressure', 'Purple stretch marks'] },
		],
		funFact: 'Hormones can be effective at incredibly low concentrations — some work at just parts per trillion!',
	},
};
