import { Topic } from "@/types";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";

export interface TopicGenerationParams {
  subject: string;
  classLevel: string;
  board: string;
  examGoal?: string;
}

// Generate dynamic topics using AI based on class level and board
export async function generateTopicsForProfile(params: TopicGenerationParams): Promise<Topic[]> {
  const { subject, classLevel, board, examGoal } = params;

  // Try AI generation first
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-3.6-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const prompt = `Generate a list of 5-7 main topics for a student studying:
- Subject: ${subject}
- Class/Grade: ${classLevel}
- Board/Curriculum: ${board}
${examGoal ? `- Exam Goal: ${examGoal}` : ""}

IMPORTANT: Topics must be EXACTLY appropriate for ${classLevel} level following ${board} curriculum.
For example:
- 8th class topics should be simpler than 12th class
- CBSE topics follow NCERT syllabus
- ICSE topics may include additional content

Return JSON:
{
  "topics": [
    {
      "id": "topic-slug-lowercase",
      "name": "Topic Display Name",
      "prerequisites": [],
      "subtopics": ["Subtopic 1", "Subtopic 2", "Subtopic 3"],
      "importance": 0.9,
      "description": "Brief description"
    }
  ]
}

Generate topics that a ${classLevel} student would actually study in ${board} ${subject}.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const cleaned = text
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();

      const parsed = JSON.parse(cleaned);
      if (parsed.topics && parsed.topics.length > 0) {
        return parsed.topics.map((t: any) => ({
          id: t.id || `topic-${Math.random().toString(36).slice(2, 8)}`,
          name: t.name,
          prerequisites: t.prerequisites || [],
          subtopics: t.subtopics || [],
          importance: t.importance || 0.8,
          description: t.description || "",
        }));
      }
    } catch (error) {
      console.warn("AI topic generation failed, using fallback:", error);
    }
  }

  // Fallback to static topics based on class level
  return getFallbackTopics(subject, classLevel, board);
}

// Fallback static topics organized by class level
function getFallbackTopics(subject: string, classLevel: string, board: string): Topic[] {
  const classNum = parseInt(classLevel) || 10;
  const isElementary = classNum <= 8;
  const isMiddle = classNum >= 9 && classNum <= 10;
  const isSenior = classNum >= 11;

  const topicsBySubjectAndLevel: Record<string, Record<string, Topic[]>> = {
    Mathematics: {
      elementary: [
        { id: "math-numbers", name: "Number Systems", prerequisites: [], subtopics: ["Integers", "Fractions", "Decimals"], importance: 0.9, description: "Understanding numbers" },
        { id: "math-basic-algebra", name: "Introduction to Algebra", prerequisites: [], subtopics: ["Variables", "Simple equations", "Expressions"], importance: 0.85, description: "Algebra basics" },
        { id: "math-geometry-basic", name: "Basic Geometry", prerequisites: [], subtopics: ["Shapes", "Angles", "Perimeter & Area"], importance: 0.85, description: "Geometric shapes" },
        { id: "math-ratios", name: "Ratios & Proportions", prerequisites: ["math-numbers"], subtopics: ["Ratios", "Proportions", "Percentages"], importance: 0.8, description: "Comparing quantities" },
        { id: "math-data", name: "Data Handling", prerequisites: [], subtopics: ["Bar graphs", "Pie charts", "Mean"], importance: 0.75, description: "Basic statistics" },
      ],
      middle: [
        { id: "math-real-numbers", name: "Real Numbers", prerequisites: [], subtopics: ["Rational numbers", "Irrational numbers", "Laws of exponents"], importance: 0.9, description: "Number system" },
        { id: "math-polynomials", name: "Polynomials", prerequisites: ["math-real-numbers"], subtopics: ["Degree", "Zeroes", "Factorization"], importance: 0.9, description: "Polynomial expressions" },
        { id: "math-linear-eq", name: "Linear Equations", prerequisites: ["math-polynomials"], subtopics: ["Two variables", "Graphical method", "Substitution"], importance: 0.9, description: "Solving equations" },
        { id: "math-quadratic", name: "Quadratic Equations", prerequisites: ["math-linear-eq"], subtopics: ["Factorization", "Formula", "Nature of roots"], importance: 0.85, description: "Second degree equations" },
        { id: "math-triangles", name: "Triangles & Similarity", prerequisites: [], subtopics: ["Congruence", "Similarity", "Pythagoras"], importance: 0.85, description: "Triangle properties" },
        { id: "math-coordinate", name: "Coordinate Geometry", prerequisites: ["math-linear-eq"], subtopics: ["Distance formula", "Section formula", "Area"], importance: 0.8, description: "Geometry with coordinates" },
      ],
      senior: [
        { id: "math-sets-relations", name: "Sets & Relations", prerequisites: [], subtopics: ["Set operations", "Relations", "Functions"], importance: 0.9, description: "Set theory" },
        { id: "math-trig-functions", name: "Trigonometric Functions", prerequisites: [], subtopics: ["Identities", "Equations", "Inverse trig"], importance: 0.9, description: "Trigonometry" },
        { id: "math-calculus", name: "Calculus", prerequisites: ["math-trig-functions"], subtopics: ["Limits", "Derivatives", "Integration"], importance: 0.95, description: "Differential & integral calculus" },
        { id: "math-vectors", name: "Vectors & 3D", prerequisites: ["math-coordinate"], subtopics: ["Vector algebra", "3D geometry", "Direction cosines"], importance: 0.85, description: "Vector mathematics" },
        { id: "math-probability", name: "Probability", prerequisites: [], subtopics: ["Conditional probability", "Bayes theorem", "Distributions"], importance: 0.8, description: "Probability theory" },
      ],
    },
    "Computer Science": {
      elementary: [
        { id: "cs-intro", name: "Introduction to Computers", prerequisites: [], subtopics: ["Hardware", "Software", "Input/Output devices"], importance: 0.9, description: "Computer basics" },
        { id: "cs-os-basic", name: "Operating Systems Basics", prerequisites: ["cs-intro"], subtopics: ["Windows", "File management", "Desktop"], importance: 0.85, description: "Using computers" },
        { id: "cs-internet", name: "Internet Basics", prerequisites: ["cs-intro"], subtopics: ["Browsers", "Email", "Safe browsing"], importance: 0.8, description: "Using internet" },
        { id: "cs-scratch", name: "Visual Programming", prerequisites: [], subtopics: ["Scratch", "Blocks", "Simple animations"], importance: 0.85, description: "Intro to coding" },
        { id: "cs-ms-office", name: "Office Applications", prerequisites: ["cs-os-basic"], subtopics: ["Word", "PowerPoint", "Excel basics"], importance: 0.75, description: "Productivity tools" },
      ],
      middle: [
        { id: "cs-python-intro", name: "Introduction to Python", prerequisites: [], subtopics: ["Variables", "Data types", "Input/Output"], importance: 0.95, description: "Python basics" },
        { id: "cs-control-flow", name: "Control Structures", prerequisites: ["cs-python-intro"], subtopics: ["if-else", "Loops", "Nested loops"], importance: 0.9, description: "Decision making" },
        { id: "cs-functions", name: "Functions", prerequisites: ["cs-control-flow"], subtopics: ["Defining functions", "Parameters", "Return values"], importance: 0.9, description: "Modular programming" },
        { id: "cs-lists", name: "Lists & Strings", prerequisites: ["cs-python-intro"], subtopics: ["List operations", "String methods", "Slicing"], importance: 0.85, description: "Data structures" },
        { id: "cs-html", name: "HTML Basics", prerequisites: [], subtopics: ["Tags", "Structure", "Forms"], importance: 0.8, description: "Web basics" },
      ],
      senior: [
        { id: "cs-python-adv", name: "Python Programming", prerequisites: [], subtopics: ["File handling", "Exception handling", "Modules"], importance: 0.95, description: "Advanced Python" },
        { id: "cs-data-structures", name: "Data Structures", prerequisites: ["cs-python-adv"], subtopics: ["Stacks", "Queues", "Linked lists"], importance: 0.95, description: "Data organization" },
        { id: "cs-dbms", name: "Database Management", prerequisites: [], subtopics: ["SQL", "Relational model", "Keys"], importance: 0.9, description: "Database concepts" },
        { id: "cs-networking", name: "Computer Networks", prerequisites: [], subtopics: ["Topologies", "Protocols", "Internet"], importance: 0.85, description: "Networking basics" },
        { id: "cs-boolean", name: "Boolean Algebra", prerequisites: [], subtopics: ["Logic gates", "Laws", "Circuits"], importance: 0.8, description: "Digital logic" },
      ],
    },
    Physics: {
      elementary: [
        { id: "phys-motion-basic", name: "Motion & Time", prerequisites: [], subtopics: ["Speed", "Distance", "Time graphs"], importance: 0.9, description: "Basic motion" },
        { id: "phys-light-basic", name: "Light", prerequisites: [], subtopics: ["Sources", "Shadows", "Reflection"], importance: 0.85, description: "Light basics" },
        { id: "phys-heat-basic", name: "Heat & Temperature", prerequisites: [], subtopics: ["Measurement", "Transfer", "Conductors"], importance: 0.85, description: "Thermal concepts" },
        { id: "phys-electricity-basic", name: "Electric Current", prerequisites: [], subtopics: ["Circuits", "Cells", "Safety"], importance: 0.8, description: "Basic electricity" },
        { id: "phys-force-basic", name: "Force & Pressure", prerequisites: ["phys-motion-basic"], subtopics: ["Types of forces", "Friction", "Pressure"], importance: 0.85, description: "Force concepts" },
      ],
      middle: [
        { id: "phys-motion", name: "Motion", prerequisites: [], subtopics: ["Velocity", "Acceleration", "Equations of motion"], importance: 0.95, description: "Kinematics" },
        { id: "phys-force-laws", name: "Force & Laws of Motion", prerequisites: ["phys-motion"], subtopics: ["Newton's laws", "Momentum", "Conservation"], importance: 0.95, description: "Dynamics" },
        { id: "phys-gravitation", name: "Gravitation", prerequisites: ["phys-force-laws"], subtopics: ["Universal law", "Weight", "Free fall"], importance: 0.85, description: "Gravity" },
        { id: "phys-work-energy", name: "Work & Energy", prerequisites: ["phys-force-laws"], subtopics: ["Work", "Power", "Energy forms"], importance: 0.9, description: "Energy concepts" },
        { id: "phys-sound", name: "Sound", prerequisites: [], subtopics: ["Wave properties", "Echo", "Human ear"], importance: 0.8, description: "Sound waves" },
      ],
      senior: [
        { id: "phys-mechanics-adv", name: "Mechanics", prerequisites: [], subtopics: ["Kinematics", "Laws of motion", "Work-energy theorem"], importance: 0.95, description: "Classical mechanics" },
        { id: "phys-electrostatics", name: "Electrostatics", prerequisites: [], subtopics: ["Coulomb's law", "Electric field", "Potential"], importance: 0.9, description: "Static electricity" },
        { id: "phys-current", name: "Current Electricity", prerequisites: ["phys-electrostatics"], subtopics: ["Ohm's law", "Circuits", "Kirchhoff's laws"], importance: 0.9, description: "Electric current" },
        { id: "phys-magnetism", name: "Magnetism", prerequisites: ["phys-current"], subtopics: ["Magnetic field", "Moving charges", "EMI"], importance: 0.85, description: "Magnetic effects" },
        { id: "phys-optics", name: "Optics", prerequisites: [], subtopics: ["Reflection", "Refraction", "Wave optics"], importance: 0.85, description: "Light phenomena" },
      ],
    },
    Chemistry: {
      elementary: [
        { id: "chem-matter-basic", name: "Matter Around Us", prerequisites: [], subtopics: ["States of matter", "Changes", "Mixtures"], importance: 0.9, description: "Matter basics" },
        { id: "chem-elements-basic", name: "Elements & Compounds", prerequisites: ["chem-matter-basic"], subtopics: ["Symbols", "Simple compounds", "Mixtures vs compounds"], importance: 0.85, description: "Basic chemistry" },
        { id: "chem-air-water", name: "Air & Water", prerequisites: [], subtopics: ["Composition of air", "Water cycle", "Pollution"], importance: 0.8, description: "Environmental chemistry" },
      ],
      middle: [
        { id: "chem-matter", name: "Matter - Nature & Behaviour", prerequisites: [], subtopics: ["Particle nature", "States", "Change of state"], importance: 0.9, description: "States of matter" },
        { id: "chem-atoms", name: "Atoms & Molecules", prerequisites: ["chem-matter"], subtopics: ["Atomic structure", "Molecules", "Mole concept"], importance: 0.95, description: "Atomic theory" },
        { id: "chem-structure-atom", name: "Structure of Atom", prerequisites: ["chem-atoms"], subtopics: ["Subatomic particles", "Bohr model", "Electrons"], importance: 0.9, description: "Atomic structure" },
        { id: "chem-periodic", name: "Periodic Classification", prerequisites: ["chem-structure-atom"], subtopics: ["Periodic table", "Groups", "Periods"], importance: 0.85, description: "Element classification" },
        { id: "chem-reactions", name: "Chemical Reactions", prerequisites: ["chem-atoms"], subtopics: ["Types", "Balancing", "Rates"], importance: 0.9, description: "Chemical changes" },
      ],
      senior: [
        { id: "chem-solid-state", name: "Solid State", prerequisites: [], subtopics: ["Crystal structure", "Defects", "Properties"], importance: 0.85, description: "Solids" },
        { id: "chem-solutions", name: "Solutions", prerequisites: [], subtopics: ["Concentration", "Colligative properties", "Osmosis"], importance: 0.9, description: "Mixtures" },
        { id: "chem-electrochemistry", name: "Electrochemistry", prerequisites: [], subtopics: ["Cells", "EMF", "Electrolysis"], importance: 0.85, description: "Chemistry of electricity" },
        { id: "chem-organic", name: "Organic Chemistry", prerequisites: [], subtopics: ["IUPAC naming", "Isomerism", "Reactions"], importance: 0.95, description: "Carbon compounds" },
        { id: "chem-coordination", name: "Coordination Compounds", prerequisites: [], subtopics: ["Werner theory", "Nomenclature", "Isomerism"], importance: 0.8, description: "Complex compounds" },
      ],
    },
    Biology: {
      elementary: [
        { id: "bio-living-things", name: "Living Things", prerequisites: [], subtopics: ["Characteristics", "Classification", "Habitats"], importance: 0.9, description: "Life basics" },
        { id: "bio-plants-basic", name: "Plants", prerequisites: ["bio-living-things"], subtopics: ["Parts", "Photosynthesis", "Reproduction"], importance: 0.85, description: "Plant biology" },
        { id: "bio-animals-basic", name: "Animals", prerequisites: ["bio-living-things"], subtopics: ["Types", "Adaptations", "Food chains"], importance: 0.85, description: "Animal biology" },
        { id: "bio-human-body-basic", name: "Human Body", prerequisites: [], subtopics: ["Organs", "Systems", "Health"], importance: 0.8, description: "Body basics" },
      ],
      middle: [
        { id: "bio-cell", name: "The Fundamental Unit of Life", prerequisites: [], subtopics: ["Cell structure", "Organelles", "Cell division"], importance: 0.95, description: "Cell biology" },
        { id: "bio-tissues", name: "Tissues", prerequisites: ["bio-cell"], subtopics: ["Plant tissues", "Animal tissues", "Functions"], importance: 0.85, description: "Tissue types" },
        { id: "bio-life-processes", name: "Life Processes", prerequisites: ["bio-cell"], subtopics: ["Nutrition", "Respiration", "Transportation"], importance: 0.9, description: "Body functions" },
        { id: "bio-reproduction", name: "Reproduction", prerequisites: ["bio-cell"], subtopics: ["Asexual", "Sexual", "Human reproduction"], importance: 0.85, description: "Reproduction" },
        { id: "bio-heredity", name: "Heredity & Evolution", prerequisites: ["bio-reproduction"], subtopics: ["Mendel's laws", "Inheritance", "Evolution"], importance: 0.85, description: "Genetics basics" },
      ],
      senior: [
        { id: "bio-reproduction-adv", name: "Reproduction in Organisms", prerequisites: [], subtopics: ["Sexual reproduction", "Fertilization", "Development"], importance: 0.9, description: "Reproductive biology" },
        { id: "bio-genetics", name: "Genetics & Molecular Biology", prerequisites: [], subtopics: ["DNA", "RNA", "Gene expression"], importance: 0.95, description: "Molecular genetics" },
        { id: "bio-evolution", name: "Evolution", prerequisites: ["bio-genetics"], subtopics: ["Origin of life", "Natural selection", "Speciation"], importance: 0.85, description: "Evolutionary biology" },
        { id: "bio-human-health", name: "Human Health & Disease", prerequisites: [], subtopics: ["Immunity", "Diseases", "Drugs"], importance: 0.85, description: "Health biology" },
        { id: "bio-ecology", name: "Ecology & Environment", prerequisites: [], subtopics: ["Ecosystems", "Biodiversity", "Conservation"], importance: 0.8, description: "Environmental biology" },
      ],
    },
  };

  const subjectTopics = topicsBySubjectAndLevel[subject];
  if (!subjectTopics) {
    return topicsBySubjectAndLevel["Mathematics"]?.middle || [];
  }

  if (isElementary) {
    return subjectTopics.elementary || subjectTopics.middle || [];
  } else if (isSenior) {
    return subjectTopics.senior || subjectTopics.middle || [];
  } else {
    return subjectTopics.middle || [];
  }
}

// Synchronous version that uses fallback (for immediate rendering)
export function getTopicsForSubject(subject: string, examGoal: string, classLevel?: string): Topic[] {
  const classNum = classLevel ? parseInt(classLevel) || 10 : 10;
  return getFallbackTopics(subject, classLevel || "10th Class", "CBSE");
}
