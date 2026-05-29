const KNOWLEDGE_CHECK_POOL = Array.from({ length: 50 }, (_, i) => ({
  id: `kc-q${i + 1}`,
  question: `Security+ Mock Question ${i + 1}: Which of the following best describes this security concept?`,
  options: [
    'Option A: A preventative administrative control.',
    'Option B: A detective technical control.',
    'Option C: A corrective physical control.',
    'Option D: A deterrent technical control.',
  ],
  correctIndex: i % 4,
  explanation: `This is the explanation for question ${i + 1}. In a real scenario, this would explain why the selected control type is the correct answer based on CompTIA Security+ objectives.`,
}));

// Add some realistic questions at the beginning for a better demo
KNOWLEDGE_CHECK_POOL[0] = {
  id: 'kc-q1',
  question: 'Which of the following cryptographic algorithms is asymmetric?',
  options: ['AES', 'DES', 'RSA', 'RC4'],
  correctIndex: 2,
  explanation: 'RSA is an asymmetric algorithm that uses a public and private key pair. AES, DES, and RC4 are all symmetric algorithms.',
};

KNOWLEDGE_CHECK_POOL[1] = {
  id: 'kc-q2',
  question: 'An attacker is intercepting communications between two parties and altering the data before sending it to the destination. What type of attack is this?',
  options: ['Denial of Service', 'Man-in-the-Middle', 'Phishing', 'SQL Injection'],
  correctIndex: 1,
  explanation: 'A Man-in-the-Middle (MitM) attack occurs when an attacker secretly relays and possibly alters the communications between two parties who believe they are directly communicating with each other.',
};

KNOWLEDGE_CHECK_POOL[2] = {
  id: 'kc-q3',
  question: 'Which of the following ports is used by default for SSH?',
  options: ['Port 21', 'Port 22', 'Port 23', 'Port 3389'],
  correctIndex: 1,
  explanation: 'Port 22 is the default port used by the Secure Shell (SSH) protocol. Port 21 is FTP, Port 23 is Telnet, and Port 3389 is RDP.',
};

KNOWLEDGE_CHECK_POOL[3] = {
  id: 'kc-q4',
  question: 'What is the primary purpose of a VLAN?',
  options: [
    'To increase the physical distance a network can span.',
    'To encrypt traffic on the local network.',
    'To logically separate broadcast domains on the same physical switch.',
    'To assign IP addresses to devices dynamically.'
  ],
  correctIndex: 2,
  explanation: 'A Virtual Local Area Network (VLAN) allows a network administrator to logically segment a network into separate broadcast domains, improving security and performance without needing separate physical switches.',
};

KNOWLEDGE_CHECK_POOL[4] = {
  id: 'kc-q5',
  question: 'Which principle ensures that a user is only given the access rights necessary to perform their job duties?',
  options: ['Separation of Duties', 'Least Privilege', 'Mandatory Access Control', 'Defense in Depth'],
  correctIndex: 1,
  explanation: 'The principle of Least Privilege dictates that users, systems, and processes should be granted only the minimum permissions necessary to perform their required tasks.',
};

/**
 * Shuffles the array and returns a specified number of questions.
 */
export function getRandomKnowledgeCheck(count = 20) {
  // Create a copy to shuffle
  const shuffled = [...KNOWLEDGE_CHECK_POOL];
  
  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.slice(0, count);
}

export function evaluateKnowledgeCheckPerformance(questions, answers) {
  // Basic mock performance diagnostic for the Knowledge Check
  return {
    pros: [
      { name: 'Core Security Concepts', percentage: 90, score: 'Excellent', feedback: 'You have a very strong grasp of foundational security principles.' }
    ],
    cons: [
      { name: 'Cryptography', percentage: 60, score: 'Needs Work', feedback: 'Review the differences between symmetric and asymmetric algorithms.' }
    ]
  };
}
