/**
 * Network Security course outline - stored in DB as content_blocks (editable in admin).
 */

const MODULES = [
  {
    id: 'm01',
    moduleTitle: '01 Foundations of Network Security',
    subtitle: 'Core concepts, models, and the threat landscape',
    lessons: [
      {
        num: '1.1',
        title: 'Introduction to Network Security Concepts',
        desc: 'CIA triad, security goals, and key terminology',
      },
      {
        num: '1.2',
        title: 'Types of Network Threats & Attack Vectors',
        desc: 'Passive vs. active attacks, insider vs. outsider threats',
      },
      {
        num: '1.3',
        title: 'OSI & TCP/IP Security Considerations',
        desc: 'Layer-by-layer vulnerabilities and attack surfaces',
      },
      {
        num: '1.4',
        title: 'Security Policies, Standards & Compliance',
        desc: 'ISO 27001, NIST framework, regulatory requirements',
      },
    ],
  },
  {
    id: 'm02',
    moduleTitle: '02 Cryptography & Secure Communication',
    subtitle: 'Encryption, protocols, and PKI infrastructure',
    lessons: [
      {
        num: '2.1',
        title: 'Symmetric & Asymmetric Encryption',
        desc: 'AES, RSA, ECC - algorithms and use cases',
      },
      {
        num: '2.2',
        title: 'Hashing, Digital Signatures & Certificates',
        desc: 'SHA, HMAC, X.509, and certificate chains',
      },
      {
        num: '2.3',
        title: 'Public Key Infrastructure (PKI)',
        desc: 'CA hierarchy, certificate lifecycle, and CRL/OCSP',
      },
      {
        num: '2.4',
        title: 'Secure Protocols: TLS, SSH, HTTPS & IPSec',
        desc: 'Handshake mechanisms, cipher suites, and key exchange',
      },
    ],
  },
  {
    id: 'm03',
    moduleTitle: '03 Network Defense Mechanisms',
    subtitle: 'Firewalls, IDS/IPS, VPNs, and access control',
    lessons: [
      {
        num: '3.1',
        title: 'Firewalls - Types, Rules & Architectures',
        desc: 'Packet filtering, stateful, NGFW, DMZ design',
      },
      {
        num: '3.2',
        title: 'Intrusion Detection & Prevention Systems',
        desc: 'Signature-based, anomaly-based, and hybrid IDS/IPS',
      },
      {
        num: '3.3',
        title: 'Virtual Private Networks (VPN)',
        desc: 'Site-to-site, remote access, SSL vs. IPSec VPNs',
      },
      {
        num: '3.4',
        title: 'Network Access Control & Zero Trust',
        desc: '802.1X, NAC policies, and Zero Trust architecture',
      },
    ],
  },
  {
    id: 'm04',
    moduleTitle: '04 Common Attacks & Countermeasures',
    subtitle: 'Attack techniques, exploitation, and defenses',
    lessons: [
      {
        num: '4.1',
        title: 'Reconnaissance & Scanning Attacks',
        desc: 'Footprinting, port scanning, OS fingerprinting',
      },
      {
        num: '4.2',
        title: 'Man-in-the-Middle, Spoofing & Sniffing',
        desc: 'ARP poisoning, DNS spoofing, packet capture techniques',
      },
      {
        num: '4.3',
        title: 'Denial of Service & DDoS Attacks',
        desc: 'SYN flood, amplification attacks, and mitigation strategies',
      },
      {
        num: '4.4',
        title: 'Social Engineering & Phishing Defense',
        desc: 'Spear phishing, pretexting, user awareness training',
      },
    ],
  },
  {
    id: 'm05',
    moduleTitle: '05 Security Monitoring & Incident Response',
    subtitle: 'Detection, analysis, and post-incident recovery',
    lessons: [
      {
        num: '5.1',
        title: 'Security Information & Event Management (SIEM)',
        desc: 'Log aggregation, correlation rules, and alerting',
      },
      {
        num: '5.2',
        title: 'Network Traffic Analysis & Forensics',
        desc: 'Packet analysis tools, flow data, and evidence handling',
      },
      {
        num: '5.3',
        title: 'Incident Response Lifecycle',
        desc: 'Preparation, containment, eradication, and recovery',
      },
      {
        num: '5.4',
        title: 'Vulnerability Assessment & Penetration Testing',
        desc: 'Scanning tools, pen test methodology, reporting',
      },
    ],
  },
];

function lessonMarkdown(num, title, desc) {
  return `# ${num} ${title}\n\n${desc}\n\n---\n\nExpand this lesson in the admin **Course content** editor.`;
}

function buildNetworkSecurityBlocks(lessonContent = {}) {
  const blocks = [];

  for (const mod of MODULES) {
    const sectionTitle = mod.moduleTitle;

    blocks.push({
      type: 'markdown',
      id: `ns-${mod.id}-overview`,
      moduleTitle: mod.moduleTitle,
      sectionTitle,
      navTitle: mod.moduleTitle,
      content: `# ${mod.moduleTitle}\n\n${mod.subtitle}\n\n---\n\nOpen the sub-lessons below to study each topic.`,
    });

    for (const les of mod.lessons) {
      const fullBody = lessonContent[les.num];
      blocks.push({
        type: 'markdown',
        id: `ns-${mod.id}-${les.num.replace('.', '')}`,
        moduleTitle: mod.moduleTitle,
        sectionTitle,
        navTitle: `${les.num} ${les.title}`,
        content:
          fullBody?.trim() ||
          lessonMarkdown(les.num, les.title, les.desc),
      });
    }
  }

  return blocks;
}

const COURSE_META = {
  slug: 'network-security',
  title: 'Network Security',
  description:
    'Master network security from foundations through cryptography, defense, attacks, and incident response.',
  cover_title: 'Network Security',
  cover_subtitle: 'Foundations to incident response - structured for exam-ready learning',
  level: 'Intermediate',
  duration: '24h',
  detail_description:
    'A structured path through network security: core concepts, cryptography, firewalls and VPNs, common attacks, and security operations. Each module includes focused sub-lessons you can edit anytime in the admin portal.',
  learning_outcomes: [
    'Explain the CIA triad, threat models, and security policies',
    'Understand encryption, PKI, and secure protocols (TLS, VPN)',
    'Design defenses with firewalls, IDS/IPS, and Zero Trust principles',
    'Recognize common attacks and apply practical countermeasures',
    'Use SIEM, forensics, and incident response workflows',
  ].join('\n'),
  instructor_name: 'CertNova',
  student_count: '2,400+',
  language: 'English',
};

module.exports = {
  MODULES,
  COURSE_META,
  buildNetworkSecurityBlocks,
};
