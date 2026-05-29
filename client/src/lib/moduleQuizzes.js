/**
 * CompTIA Security+ Module Exams question bank and dynamic evaluator.
 * Provides 20-question practice exams for all 5 core modules of Network Security.
 * Includes category tracking to generate personalized "Strengths & Weaknesses" (Pros & Cons) feedback.
 */

// Category descriptions for personalized report mapping
export const CATEGORY_METADATA = {
  foundations: {
    name: 'Security Foundations & Network Architecture',
    proTip: 'Excellent grasp of foundational topologies, the OSI model, and core CIA Triad boundaries.',
    conTip: 'Need to review basics: revisit the OSI layers, network media, and fundamental security design models.'
  },
  cryptography: {
    name: 'Cryptography & PKI Operations',
    proTip: 'Strong understanding of asymmetric/symmetric encryption standards, hashing, and TLS key exchanges.',
    conTip: 'Focus on crypto operations: review the distinction between DH key exchange, RSA, AES, and HMAC algorithms.'
  },
  protocols: {
    name: 'Secure Network Protocols & Services',
    proTip: 'Deep knowledge of secure network services (SSH, HTTPS, SFTP, IPsec) and their unencrypted equivalents.',
    conTip: 'Review ports and protocols: brush up on common ports (e.g. 443, 22, 990, 80) and secure transmission layers.'
  },
  defenses: {
    name: 'Network Defense Mechanisms & Controls',
    proTip: 'Outstanding command over defensive controls, including Firewalls, IDS/IPS, WAF, SIEM, and VLAN segregation.',
    conTip: 'Revisit defensive administration: check the difference between stateless vs stateful firewalls and signature vs anomaly systems.'
  },
  attacks: {
    name: 'Common Threat Vectors & Countermeasures',
    proTip: 'Superb awareness of adversary behavior, from brute-force and social engineering to MitM and script injections.',
    conTip: 'Study threat indicators: spend more time reviewing attack signatures, Xsite scripting (XSS), and privilege escalation paths.'
  },
  monitoring: {
    name: 'Security Monitoring & Threat Hunting',
    proTip: 'Excellent insight into logs analysis, traffic captures (Wireshark), and correlation filters.',
    conTip: 'Recheck alert monitoring: review Syslog schemas, flow captures (Netflow), and PCAP analytical workflows.'
  },
  incidentResponse: {
    name: 'Incident Response & Digital Forensics',
    proTip: 'Great understanding of containment strategies, order of volatility, and formal forensic evidence collection.',
    conTip: 'Re-study response workflows: look into the containment phase, isolation boundaries, and the preservation of RAM/cache.'
  }
};

const MODULE_ONE_EXAM = [
  {
    id: 'm1-q1',
    question: 'Which security principle in the CIA Triad is primarily violated when an adversary performs a successful Distributed Denial of Service (DDoS) attack?',
    options: ['Confidentiality', 'Integrity', 'Availability', 'Non-repudiation'],
    correctIndex: 2,
    category: 'foundations',
    explanation: 'A DDoS attack aims to exhaust system resources, making services unavailable to legitimate users. Hence, it violates the Availability pillar.'
  },
  {
    id: 'm1-q2',
    question: 'At which layer of the OSI model does a traditional packet-filtering firewall operate?',
    options: ['Layer 2 (Data Link)', 'Layer 3 (Network)', 'Layer 4 (Transport)', 'Layer 7 (Application)'],
    correctIndex: 1,
    category: 'foundations',
    explanation: 'Traditional packet filters make routing and blocking decisions based on source and destination IP addresses, which exist at Layer 3 (Network).'
  },
  {
    id: 'm1-q3',
    question: 'Which of the following devices operates at OSI Layer 2 and makes forwarding decisions based on hardware MAC addresses?',
    options: ['Hub', 'Router', 'Switch', 'Repeater'],
    correctIndex: 2,
    category: 'foundations',
    explanation: 'A network Switch operates at the Data Link layer (OSI Layer 2) and uses MAC address tables to forward frames to specific ports.'
  },
  {
    id: 'm1-q4',
    question: 'A security engineer is trying to secure data in transit from eavesdropping. Which pillar of the CIA Triad is the engineer prioritizing?',
    options: ['Confidentiality', 'Integrity', 'Availability', 'Accountability'],
    correctIndex: 0,
    category: 'foundations',
    explanation: 'Confidentiality ensures that unauthorized parties cannot read data in transit. Encryption is typically used to achieve this.'
  },
  {
    id: 'm1-q5',
    question: 'An organization experiences unauthorized modifications in its database. Which security goal was directly compromised?',
    options: ['Availability', 'Confidentiality', 'Integrity', 'Utility'],
    correctIndex: 2,
    category: 'foundations',
    explanation: 'Integrity guarantees that data has not been altered or tampered with by unauthorized entities.'
  },
  {
    id: 'm1-q6',
    question: 'Which topology is most resilient against single cable breaks causing a complete network failure?',
    options: ['Bus', 'Star', 'Ring', 'Mesh'],
    correctIndex: 3,
    category: 'foundations',
    explanation: 'A Mesh topology provides redundant connections between all nodes, making it highly resilient to individual failures.'
  },
  {
    id: 'm1-q7',
    question: 'What is the primary function of the Address Resolution Protocol (ARP)?',
    options: ['Resolve hostnames to IP addresses', 'Resolve IP addresses to MAC addresses', 'Map port numbers to applications', 'Provide dynamic IP allocation'],
    correctIndex: 1,
    category: 'foundations',
    explanation: 'ARP translates Layer 3 IP addresses into Layer 2 physical MAC addresses on a local area network.'
  },
  {
    id: 'm1-q8',
    question: 'Which type of address is 48 bits long and written in hexadecimal format?',
    options: ['IPv4 Address', 'IPv6 Address', 'MAC Address', 'Subnet Mask'],
    correctIndex: 2,
    category: 'foundations',
    explanation: 'A MAC (Media Access Control) address is a unique 48-bit physical hardware identifier.'
  },
  {
    id: 'm1-q9',
    question: 'Which OSI layer is responsible for routing packets across logical network boundaries?',
    options: ['Layer 2 (Data Link)', 'Layer 3 (Network)', 'Layer 4 (Transport)', 'Layer 5 (Session)'],
    correctIndex: 1,
    category: 'foundations',
    explanation: 'The Network layer (Layer 3) handles addressing, path determination, and packet routing.'
  },
  {
    id: 'm1-q10',
    question: 'Which device is used to connect separate IP networks and operates at Layer 3 of the OSI model?',
    options: ['Bridge', 'Router', 'Layer 2 Switch', 'Active Hub'],
    correctIndex: 1,
    category: 'foundations',
    explanation: 'A Router connects different networks and routes IP packets based on Layer 3 network addresses.'
  },
  {
    id: 'm1-q11',
    question: 'Under the Principle of Least Privilege, what should a default firewall rule block?',
    options: ['Only known malicious ports', 'All traffic (implicit deny)', 'Only outbound web traffic', 'Non-standard routing headers'],
    correctIndex: 1,
    category: 'foundations',
    explanation: 'An "Implicit Deny" policy ensures all traffic is blocked by default, and only specifically approved traffic is allowed.'
  },
  {
    id: 'm1-q12',
    question: 'Which concept refers to applying multiple layers of overlapping security controls to protect assets?',
    options: ['Single Point of Failure', 'Defense in Depth', 'Social Engineering', 'Security Through Obscurity'],
    correctIndex: 1,
    category: 'foundations',
    explanation: 'Defense in Depth is the practice of employing multiple security measures to protect an organization\'s assets.'
  },
  {
    id: 'm1-q13',
    question: 'Which OSI layer manages flow control, error recovery, and establishes end-to-end connections using ports?',
    options: ['Layer 2 (Data Link)', 'Layer 3 (Network)', 'Layer 4 (Transport)', 'Layer 7 (Application)'],
    correctIndex: 2,
    category: 'foundations',
    explanation: 'The Transport layer (Layer 4) manages port addressing, connection control, flow control, and error correction.'
  },
  {
    id: 'm1-q14',
    question: 'What is the physical connection standard used by most modern wired Ethernet cables?',
    options: ['RJ-11', 'RJ-45', 'BNC', 'F-Type'],
    correctIndex: 1,
    category: 'foundations',
    explanation: 'RJ-45 is the standard physical connector used for 8-pin copper twisted-pair Ethernet cables.'
  },
  {
    id: 'm1-q15',
    question: 'Which term describes an IP address that can be routed across the public internet?',
    options: ['Private IP Address', 'Loopback IP Address', 'Public IP Address', 'Link-Local Address'],
    correctIndex: 2,
    category: 'foundations',
    explanation: 'Public IP addresses are globally unique and routable on the public internet, unlike RFC 1918 private IPs.'
  },
  {
    id: 'm1-q16',
    question: 'What range of ports is designated as "Well-Known Ports" by the IANA?',
    options: ['0 to 1023', '1024 to 49151', '49152 to 65535', '1 to 65535'],
    correctIndex: 0,
    category: 'foundations',
    explanation: 'System or Well-Known ports range from 0 to 1023 (e.g. HTTP on 80, HTTPS on 443).'
  },
  {
    id: 'm1-q17',
    question: 'Which protocol is connectionless and does not perform error checking or packet sequencing?',
    options: ['TCP', 'UDP', 'FTP', 'SSH'],
    correctIndex: 1,
    category: 'foundations',
    explanation: 'UDP (User Datagram Protocol) is a lightweight, connectionless transport protocol operating at Layer 4.'
  },
  {
    id: 'm1-q18',
    question: 'What type of network encompasses a single building or office campus?',
    options: ['WAN', 'MAN', 'LAN', 'PAN'],
    correctIndex: 2,
    category: 'foundations',
    explanation: 'A Local Area Network (LAN) covers a small geographical area, such as a single room, building, or office.'
  },
  {
    id: 'm1-q19',
    question: 'Which security control is designed to detect and log security threats but does not block them actively?',
    options: ['IPS', 'IDS', 'Stateful Firewall', 'Application Proxy'],
    correctIndex: 1,
    category: 'foundations',
    explanation: 'An Intrusion Detection System (IDS) is passive; it detects and alerts on threats but does not block them.'
  },
  {
    id: 'm1-q20',
    question: 'What is the primary risk of using unshielded twisted pair (UTP) cabling near high-voltage lines?',
    options: ['Physical line cuts', 'Electromagnetic Interference (EMI)', 'Optical signal dispersion', 'Impedance mismatching'],
    correctIndex: 1,
    category: 'foundations',
    explanation: 'UTP cables lack metal shielding and are vulnerable to EMI from power lines, causing packet corruption.'
  }
];

const MODULE_TWO_EXAM = [
  {
    id: 'm2-q1',
    question: 'Which secure protocol should a network administrator use to securely transfer files while utilizing SSH for channel encryption on port 22?',
    options: ['FTP', 'TFTP', 'SFTP', 'FTPS'],
    correctIndex: 2,
    category: 'protocols',
    explanation: 'SFTP (SSH File Transfer Protocol) runs inside an SSH connection on TCP port 22. FTPS is FTP secured with SSL/TLS.'
  },
  {
    id: 'm2-q2',
    question: 'Which cryptographic algorithm relies on prime number factorization and is widely used for asymmetric key exchanges and digital signatures?',
    options: ['AES', 'DES', 'RSA', 'SHA-256'],
    correctIndex: 2,
    category: 'cryptography',
    explanation: 'RSA is a widely used asymmetric algorithm whose mathematical strength rests on the difficulty of factoring large prime numbers.'
  },
  {
    id: 'm2-q3',
    question: 'A security professional wants to implement an encryption standard that is highly efficient for encrypting large databases without consuming high CPU overhead. Which type of encryption should they choose?',
    options: ['Symmetric Encryption', 'Asymmetric Encryption', 'Hashing Algorithms', 'Diffie-Hellman Key Exchange'],
    correctIndex: 0,
    category: 'cryptography',
    explanation: 'Symmetric algorithms (like AES) are much faster and computationally lighter than asymmetric cryptography, making them ideal for large bulk data.'
  },
  {
    id: 'm2-q4',
    question: 'Which hashing algorithm is designed to produce a 256-bit fixed output and is currently recommended for ensuring message integrity?',
    options: ['MD5', 'SHA-1', 'SHA-256', 'HMAC-MD5'],
    correctIndex: 2,
    category: 'cryptography',
    explanation: 'SHA-256 (part of SHA-2 family) creates a highly secure 256-bit message digest and is robust against collisions, unlike MD5 or SHA-1.'
  },
  {
    id: 'm2-q5',
    question: 'Which of the following ports is the standard port designated for secure web browsing (HTTPS)?',
    options: ['Port 80', 'Port 443', 'Port 8080', 'Port 22'],
    correctIndex: 1,
    category: 'protocols',
    explanation: 'HTTPS (Hypertext Transfer Protocol Secure) operates over TCP port 443. Port 80 is for unsecure HTTP.'
  },
  {
    id: 'm2-q6',
    question: 'Which cryptographic concept allows two parties to securely generate and share a symmetric key over an unsecure public network without sending the key itself?',
    options: ['RSA Encryption', 'Diffie-Hellman Key Exchange', 'ECC Digital Signature', 'Blowfish Ciphering'],
    correctIndex: 1,
    category: 'cryptography',
    explanation: 'Diffie-Hellman is a key-agreement protocol that lets two entities establish a shared secret key over an open channel.'
  },
  {
    id: 'm2-q7',
    question: 'Which secure protocol is designed to replace Telnet for command-line administrative access to routers and switches?',
    options: ['SNMPv3', 'SSH', 'HTTPS', 'LDAP'],
    correctIndex: 1,
    category: 'protocols',
    explanation: 'SSH (Secure Shell) provides encrypted command-line access over port 22, replacing the unencrypted Telnet (port 23).'
  },
  {
    id: 'm2-q8',
    question: 'In public key cryptography, if Bob wants to send an encrypted message that ONLY Alice can read, which key should Bob use to encrypt it?',
    options: ['Bob\'s Public Key', 'Bob\'s Private Key', 'Alice\'s Public Key', 'Alice\'s Private Key'],
    correctIndex: 2,
    category: 'cryptography',
    explanation: 'To ensure confidentiality, messages are encrypted with the recipient\'s public key, and can only be decrypted by the recipient\'s private key.'
  },
  {
    id: 'm2-q9',
    question: 'Which of the following describes a hash collision?',
    options: [
      'Two different inputs produce the exact same hash output',
      'One input produces two different hash outputs',
      'The hashing engine crashes due to memory leakage',
      'An encrypted ciphertext is decrypted back to cleartext'
    ],
    correctIndex: 0,
    category: 'cryptography',
    explanation: 'A collision occurs when two distinct input values yield the identical hash digest, revealing a vulnerability in the hash algorithm.'
  },
  {
    id: 'm2-q10',
    question: 'Which protocol secures web traffic and operates between the Transport and Application layers of the OSI model?',
    options: ['IPsec', 'TLS', 'WPA2', 'DNSSEC'],
    correctIndex: 1,
    category: 'protocols',
    explanation: 'TLS (Transport Layer Security) encrypts connections at the session/transport interface, securing application protocols like HTTP.'
  },
  {
    id: 'm2-q11',
    question: 'Which IPsec mode encrypts BOTH the payload and the original IP header, wrapping them in a completely new IP packet?',
    options: ['Transport Mode', 'Tunnel Mode', 'AH Mode', 'ESP Mode'],
    correctIndex: 1,
    category: 'protocols',
    explanation: 'Tunnel Mode encrypts the entire original IP packet (header and payload) and adds a new header, ideal for Site-to-Site VPNs.'
  },
  {
    id: 'm2-q12',
    question: 'What is the main purpose of adding a cryptographic "salt" to passwords before hashing them?',
    options: [
      'To compress the password length',
      'To prevent collision attacks entirely',
      'To defend against precomputed Rainbow Table attacks',
      'To make decryption faster for authorized admins'
    ],
    correctIndex: 2,
    category: 'cryptography',
    explanation: 'Salting adds a random string to passwords before hashing, rendering precomputed dictionaries (Rainbow Tables) useless.'
  },
  {
    id: 'm2-q13',
    question: 'Which protocol secures email transmission between mail servers and operates over port 587 or port 25?',
    options: ['IMAPS', 'POP3S', 'SMTPS', 'HTTPS'],
    correctIndex: 2,
    category: 'protocols',
    explanation: 'SMTPS (Simple Mail Transfer Protocol Secure) secures the outbound transmission of emails over TLS.'
  },
  {
    id: 'm2-q14',
    question: 'What is the primary function of a Certificate Authority (CA) in a Public Key Infrastructure (PKI)?',
    options: [
      'To generate symmetric session keys',
      'To sign and issue digital certificates verifying identities',
      'To decrypt user data dynamically',
      'To scan web portals for threat signatures'
    ],
    correctIndex: 1,
    category: 'cryptography',
    explanation: 'A CA is a trusted third-party entity that validates identities and issues digitally signed certificates.'
  },
  {
    id: 'm2-q15',
    question: 'Which protocol is used to query directory services securely over TCP port 636?',
    options: ['HTTP', 'LDAPS', 'DNS', 'IMAP'],
    correctIndex: 1,
    category: 'protocols',
    explanation: 'LDAPS (Lightweight Directory Access Protocol Secure) provides directory queries over SSL/TLS on port 636.'
  },
  {
    id: 'm2-q16',
    question: 'Which symmetric encryption standard is the current industry gold standard and uses block sizes of 128 bits?',
    options: ['DES', '3DES', 'AES', 'RC4'],
    correctIndex: 2,
    category: 'cryptography',
    explanation: 'AES (Advanced Encryption Standard) is the global standard utilizing 128-bit blocks and keys up to 256 bits.'
  },
  {
    id: 'm2-q17',
    question: 'If Bob wants to send a message to Alice and prove that the message truly originated from him (Non-repudiation), which key should Bob sign the message with?',
    options: ['Bob\'s Public Key', 'Bob\'s Private Key', 'Alice\'s Public Key', 'Alice\'s Private Key'],
    correctIndex: 1,
    category: 'cryptography',
    explanation: 'Signing with Bob\'s private key achieves non-repudiation. Since only Bob possesses his private key, anyone verifying with his public key knows it came from him.'
  },
  {
    id: 'm2-q18',
    question: 'Which of the following secure protocols should be used to synchronize system clocks across network servers?',
    options: ['SNMP', 'NTP', 'SSH', 'DNSSEC'],
    correctIndex: 1,
    category: 'protocols',
    explanation: 'NTP (Network Time Protocol) synchronizes system clocks over port 123 to coordinate chronological log accuracy.'
  },
  {
    id: 'm2-q19',
    question: 'Which file format is used to list revoked digital certificates that are no longer valid before their expiration date?',
    options: ['CSR', 'CRL', 'PKCS12', 'DER'],
    correctIndex: 1,
    category: 'cryptography',
    explanation: 'A CRL (Certificate Revocation List) is published by a CA to declare which certificates have been revoked early.'
  },
  {
    id: 'm2-q20',
    question: 'Which cryptographic algorithm provides asymmetric encryption using shorter key lengths while offering equivalent security to RSA?',
    options: ['Blowfish', 'AES-GCM', 'ECC', 'Diffie-Hellman'],
    correctIndex: 2,
    category: 'cryptography',
    explanation: 'ECC (Elliptic Curve Cryptography) delivers the same protection as RSA but with significantly smaller keys, saving bandwidth and CPU.'
  }
];

const MODULE_THREE_EXAM = [
  {
    id: 'm3-q1',
    question: 'Which type of firewall monitors the state of active network connections and dynamically opens ports for return traffic?',
    options: ['Packet-Filtering Firewall', 'Stateful Inspection Firewall', 'Proxy Firewall', 'Stateless Access List'],
    correctIndex: 1,
    category: 'defenses',
    explanation: 'Stateful firewalls maintain a state table tracking conversations. Return traffic matching an established session is automatically allowed.'
  },
  {
    id: 'm3-q2',
    question: 'Which defensive component acts as a decoy server designed to attract and analyze hackers, deflecting them from genuine production assets?',
    options: ['SIEM', 'Honeypot', 'WAF', 'Load Balancer'],
    correctIndex: 1,
    category: 'defenses',
    explanation: 'A Honeypot is an intentional trap designed to mimic legitimate targets to gather threat intelligence and slow down adversaries.'
  },
  {
    id: 'm3-q3',
    question: 'An administrator wants to secure a web server against specific application-layer attacks like SQL injection and Cross-Site Scripting (XSS). Which control is best suited for this?',
    options: ['Intrusion Detection System', 'Web Application Firewall (WAF)', 'Network Access Control (NAC)', 'Stateful Packet Filter'],
    correctIndex: 1,
    category: 'defenses',
    explanation: 'A WAF inspects HTTP traffic at Layer 7 to block web application attacks like SQLi and XSS which bypass Layer 3/4 firewalls.'
  },
  {
    id: 'm3-q4',
    question: 'Which tool aggregates logs and event data from servers, network devices, and security controls across an enterprise to correlate security alerts?',
    options: ['Vulnerability Scanner', 'SIEM', 'Proxy Server', 'Intrusion Prevention System'],
    correctIndex: 1,
    category: 'defenses',
    explanation: 'SIEM (Security Information and Event Management) tools collect, normalize, and analyze log data to detect security anomalies.'
  },
  {
    id: 'm3-q5',
    question: 'Which technology segregates a single physical switch into multiple isolated logical networks to restrict broad broadcast domains?',
    options: ['NAT', 'VLAN', 'VPN', 'DMZ'],
    correctIndex: 1,
    category: 'defenses',
    explanation: 'VLANs (Virtual Local Area Networks) logically partition physical switches to separate traffic and limit subnet communication.'
  },
  {
    id: 'm3-q6',
    question: 'What is the main operational difference between an IDS and an IPS?',
    options: [
      'IDS operates at Layer 2, while IPS operates at Layer 7',
      'IDS only generates alerts, while IPS takes direct action to block threats',
      'IDS encrypts traffic, while IPS decrypts it',
      'IDS blocks inbound traffic, while IPS blocks outbound traffic'
    ],
    correctIndex: 1,
    category: 'defenses',
    explanation: 'An IDS (Intrusion Detection System) detects and alerts, whereas an IPS (Intrusion Prevention System) resides in-line to actively block detected threats.'
  },
  {
    id: 'm3-q7',
    question: 'Which concept refers to placing publicly accessible services, like web and mail servers, in an isolated network segment between the internal LAN and public internet?',
    options: ['Intranet', 'Demilitarized Zone (DMZ)', 'Virtual Private Cloud', 'VLAN Segment'],
    correctIndex: 1,
    category: 'defenses',
    explanation: 'A DMZ separates public services from the private internal network, providing an extra defensive layer if the public server is compromised.'
  },
  {
    id: 'm3-q8',
    question: 'What security feature verifies a connecting device\'s posture (OS patch level, active antivirus, firewall state) before granting network access?',
    options: ['IPsec VPN', 'Network Access Control (NAC)', 'Active Directory Domain', 'WAF Filter'],
    correctIndex: 1,
    category: 'defenses',
    explanation: 'NAC enforces security compliance policies on devices before permitting them to connect to internal wired/wireless networks.'
  },
  {
    id: 'm3-q9',
    question: 'Which access control mechanism is used by routers to filter traffic based on source/destination IP, protocol, and port numbers?',
    options: ['Access Control List (ACL)', 'Multi-Factor Authentication', 'Single Sign-On', 'Vulnerability Assessment'],
    correctIndex: 0,
    category: 'defenses',
    explanation: 'An ACL is a set of rules used by routers and firewalls to permit or deny IP packets based on header attributes.'
  },
  {
    id: 'm3-q10',
    question: 'What type of load balancing distributes traffic based on persistent client IP routing to ensure users land on the same server?',
    options: ['Round Robin', 'Least Connections', 'Session Affinity (Source IP)', 'Weighted Routing'],
    correctIndex: 2,
    category: 'defenses',
    explanation: 'Session Affinity (Sticky Sessions) binds a client IP address to a specific backend server for the duration of their session.'
  },
  {
    id: 'm3-q11',
    question: 'Which system is characterized by signature-based and anomaly-based detection to identify malicious payloads in network streams?',
    options: ['Proxy Server', 'NIDS', 'Syslog Daemon', 'WAF'],
    correctIndex: 1,
    category: 'defenses',
    explanation: 'A Network Intrusion Detection System (NIDS) analyzes network traffic streams for signature patterns or behavioral anomalies.'
  },
  {
    id: 'm3-q12',
    question: 'A firewall administrator configures rules to inspect the actual data payload of packets to block specific file types. What type of firewall is this?',
    options: ['Stateless Packet Filter', 'Next-Generation Firewall (NGFW) / Deep Packet Inspection', 'Layer 2 Bridge', 'NAT Router'],
    correctIndex: 1,
    category: 'defenses',
    explanation: 'NGFWs and Deep Packet Inspection (DPI) look inside the data payload of packets rather than just reading headers (Layer 3/4).'
  },
  {
    id: 'm3-q13',
    question: 'What security mechanism is bypassed when an attacker plugs a rogue access point directly into an open office ethernet jack?',
    options: ['Proxy Authentication', 'VLAN Tagging', '802.1X Port Security', 'WAF Filtering'],
    correctIndex: 2,
    category: 'defenses',
    explanation: '802.1X provides port-based authentication, preventing unauthorized devices from connecting to physical ethernet jacks without credentials.'
  },
  {
    id: 'm3-q14',
    question: 'What type of proxy hides the identities of internal clients making outbound requests to the internet?',
    options: ['Reverse Proxy', 'Forward Proxy', 'Open Mail Relay', 'Transparent Gateway'],
    correctIndex: 1,
    category: 'defenses',
    explanation: 'A Forward Proxy handles outgoing requests for internal clients, filtering content and caching requests while masking client IPs.'
  },
  {
    id: 'm3-q15',
    question: 'Which concept ensures high availability by grouping multiple firewalls so that if one fails, another takes over instantly?',
    options: ['Active-Passive Clustering', 'Stateless Redundancy', 'Proxy Intermediaries', 'VLAN Trunking'],
    correctIndex: 0,
    category: 'defenses',
    explanation: 'Active-Passive or Active-Active clusters group firewalls to eliminate a single point of failure and handle failovers.'
  },
  {
    id: 'm3-q16',
    question: 'Which monitoring feature automatically translates internal private IP addresses to a single public IP to hide internal network structure?',
    options: ['VLAN Routing', 'Network Address Translation (NAT)', 'Proxy Cache', '802.1X EAP'],
    correctIndex: 1,
    category: 'defenses',
    explanation: 'NAT (specifically PAT) maps private internal addresses to public external IPs, preserving address space and hiding internal topology.'
  },
  {
    id: 'm3-q17',
    question: 'Which mechanism blocks loop scenarios in complex redundant switched networks?',
    options: ['Spanning Tree Protocol (STP)', 'Border Gateway Protocol (BGP)', 'OSPF Routing', 'DHCP Snooping'],
    correctIndex: 0,
    category: 'defenses',
    explanation: 'STP prevents switching loops and broadcast storms in networks with redundant physical Layer 2 paths.'
  },
  {
    id: 'm3-q18',
    question: 'What is the primary advantage of a stateful firewall over a stateless packet filter?',
    options: [
      'It operates at Layer 2 only',
      'It automatically tracks session state, preventing spoofed packets from entering out of sequence',
      'It encrypts local traffic logs',
      'It acts as an authoritative DNS resolver'
    ],
    correctIndex: 1,
    category: 'defenses',
    explanation: 'Stateful firewalls prevent unsolicited inbound packets from entering because they check if they correspond to an active session.'
  },
  {
    id: 'm3-q19',
    question: 'Which WAF feature is highly effective at stopping Zero-Day web application vulnerabilities?',
    options: ['Signature matching', 'IP Reputation lists', 'Anomaly Detection / Positive Security Model', 'VLAN Tagging'],
    correctIndex: 2,
    category: 'defenses',
    explanation: 'A Positive Security model (defining only allowed inputs) blocks zero-day exploits because anything not specifically allowed is rejected.'
  },
  {
    id: 'm3-q20',
    question: 'Which term describes a non-existent vulnerability flagged as threat by an IDS?',
    options: ['True Positive', 'True Negative', 'False Positive', 'False Negative'],
    correctIndex: 2,
    category: 'defenses',
    explanation: 'A False Positive is an alert triggered on harmless, legitimate traffic that was mistakenly flagged as a threat.'
  }
];

const MODULE_FOUR_EXAM = [
  {
    id: 'm4-q1',
    question: 'An attacker sends a victim an email claiming to be their bank, requesting them to click a link and reset their password. What social engineering attack is this?',
    options: ['Vishing', 'Phishing', 'Smishing', 'Tailgating'],
    correctIndex: 1,
    category: 'attacks',
    explanation: 'Phishing is an email-based social engineering threat designed to steal credentials or infect machines.'
  },
  {
    id: 'm4-q2',
    question: 'Which type of attack involves intercepting and modifying communication between a client and a server without either party knowing?',
    options: ['DDoS Attack', 'Man-in-the-Middle (MitM) Attack', 'SQL Injection', 'Brute Force'],
    correctIndex: 1,
    category: 'attacks',
    explanation: 'A MitM attack intercepts a communication channel, allowing the attacker to eavesdrop or alter data in transit silently.'
  },
  {
    id: 'm4-q3',
    question: 'An attacker enters a payload into an input field: `\' OR 1=1; --`. What attack vector are they attempting?',
    options: ['Cross-Site Scripting (XSS)', 'SQL Injection (SQLi)', 'Buffer Overflow', 'DNS Poisoning'],
    correctIndex: 1,
    category: 'attacks',
    explanation: 'The `\' OR 1=1; --` payload is a classic SQLi pattern aimed at manipulating database queries to bypass authentication.'
  },
  {
    id: 'm4-q4',
    question: 'Which threat uses a network of compromised internet-facing devices (bots) to swamp a server with garbage traffic, causing it to crash?',
    options: ['Phishing', 'Privilege Escalation', 'Distributed Denial of Service (DDoS)', 'Ransomware'],
    correctIndex: 2,
    category: 'attacks',
    explanation: 'DDoS attacks use botnets to overwhelm target networks or applications, exhausting their operational bandwidth.'
  },
  {
    id: 'm4-q5',
    question: 'What is it called when an attacker follows an authorized employee through a secure doorway without scanning a badge?',
    options: ['Shoulder Surfing', 'Tailgating', 'Dumpster Diving', 'Spear Phishing'],
    correctIndex: 1,
    category: 'attacks',
    explanation: 'Tailgating (or piggybacking) is a physical breach where an unauthorized person tags along behind a legitimate badge-holder.'
  },
  {
    id: 'm4-q6',
    question: 'Which web application vulnerability allows malicious scripts to be injected into trusted websites and executed in a victim\'s browser?',
    options: ['SQL Injection', 'Cross-Site Scripting (XSS)', 'Directory Traversal', 'Command Injection'],
    correctIndex: 1,
    category: 'attacks',
    explanation: 'XSS occurs when user-supplied inputs are rendered in a browser without sanitization, executing arbitrary JavaScript.'
  },
  {
    id: 'm4-q7',
    question: 'Which type of malware encrypts files and demands payment in exchange for a decryption key?',
    options: ['Spyware', 'Trojan Horse', 'Ransomware', 'Adware'],
    correctIndex: 2,
    category: 'attacks',
    explanation: 'Ransomware locks down files or operating systems using strong encryption, extorting victims for the key.'
  },
  {
    id: 'm4-q8',
    question: 'What is a watering hole attack?',
    options: [
      'Flooding a target server with connection requests until it runs out of memory',
      'Infecting a third-party website commonly visited by target company employees',
      'Stealing hardware from open company breakrooms',
      'Sending SMS phishing texts to executives'
    ],
    correctIndex: 1,
    category: 'attacks',
    explanation: 'A watering hole attack targets specific users by compromising public websites they are known to visit frequently.'
  },
  {
    id: 'm4-q9',
    question: 'Which term describes an exploit that targets a software vulnerability before a patch or update is released by the vendor?',
    options: ['Zero-Day Exploit', 'Replay Attack', 'Buffer Overflow', 'Pass-the-Hash'],
    correctIndex: 0,
    category: 'attacks',
    explanation: 'A Zero-day exploit takes advantage of a security hole that is unknown to the vendor, leaving zero days for preparation.'
  },
  {
    id: 'm4-q10',
    question: 'Which attack floods a local network switch with spoofed ARP responses, mapping an attacker\'s MAC address to the default gateway\'s IP?',
    options: ['ARP Poisoning', 'MAC Flooding', 'DNS Spoofing', 'IP Spoofing'],
    correctIndex: 0,
    category: 'attacks',
    explanation: 'ARP Poisoning (or Spoofing) corrupts ARP caches on a LAN, routing target outbound packets through the attacker\'s device.'
  },
  {
    id: 'm4-q11',
    question: 'What is the primary defense against SQL Injection vulnerabilities?',
    options: ['Strong passwords', 'Input sanitization & parameterized queries', 'Installing local antivirus', 'Enabling HTTPS'],
    correctIndex: 1,
    category: 'attacks',
    explanation: 'Sanitizing inputs and using prepared statements (parameterized queries) separates code logic from SQL input data, blocking SQLi.'
  },
  {
    id: 'm4-q12',
    question: 'Which protocol attack involves sending packets with the same source and destination IP addresses, confusing the target host?',
    options: ['SYN Flood', 'Land Attack', 'Smurf Attack', 'Ping of Death'],
    correctIndex: 1,
    category: 'attacks',
    explanation: 'A Land Attack crafts packets where source and destination IPs are set to the target\'s IP, causing infinite loops.'
  },
  {
    id: 'm4-q13',
    question: 'What type of phishing specifically targets high-profile executives or business owners?',
    options: ['Smishing', 'Vishing', 'Whaling', 'Pharming'],
    correctIndex: 2,
    category: 'attacks',
    explanation: 'Whaling is a highly customized spear-phishing attack aimed at C-level executives (the "big fish").'
  },
  {
    id: 'm4-q14',
    question: 'An attacker attempts to crack a hashed password by testing every possible character combination systematically. What is this?',
    options: ['Dictionary Attack', 'Brute Force Attack', 'Rainbow Table Attack', 'Birthday Attack'],
    correctIndex: 1,
    category: 'attacks',
    explanation: 'A Brute Force attack tests all combinations sequentially until the correct password or hash match is discovered.'
  },
  {
    id: 'm4-q15',
    question: 'Which attack redirects users to a fraudulent website by compromising local DNS caches or hosts files?',
    options: ['Phishing', 'Pharming', 'Spamming', 'Vishing'],
    correctIndex: 1,
    category: 'attacks',
    explanation: 'Pharming corrupts DNS resolution or DNS servers to transparently route victims to malicious clones of legitimate websites.'
  },
  {
    id: 'm4-q16',
    question: 'What is the primary danger of a Buffer Overflow vulnerability?',
    options: [
      'It consumes internet bandwidth',
      'It overwrites memory space, allowing arbitrary code execution with system privileges',
      'It locks the database table',
      'It sends spam emails automatically'
    ],
    correctIndex: 1,
    category: 'attacks',
    explanation: 'Buffer overflows occur when inputs exceed buffer sizes, spilling into neighboring memory and altering the instruction pointer.'
  },
  {
    id: 'm4-q17',
    question: 'Which attack exploits a trust relationship in a third-party partner\'s software to compromise a larger enterprise?',
    options: ['Supply Chain Attack', 'Watering Hole', 'Replay Exploit', 'SYN Spoofing'],
    correctIndex: 0,
    category: 'attacks',
    explanation: 'Supply Chain attacks target vendor dependencies, libraries, or updating mechanisms to inject backdoors into downstream customers.'
  },
  {
    id: 'm4-q18',
    question: 'What type of threat involves a trusted employee stealing sensitive intellectual property from their employer?',
    options: ['External threat', 'Social Engineer', 'Insider Threat', 'Script Kiddie'],
    correctIndex: 2,
    category: 'attacks',
    explanation: 'Insider threats come from employees, contractors, or partners who have legitimate system access but misuse it maliciously.'
  },
  {
    id: 'm4-q19',
    question: 'Which social engineering attack relies on the telephone to extract credit card or social security details?',
    options: ['Smishing', 'Phishing', 'Vishing', 'Spamming'],
    correctIndex: 2,
    category: 'attacks',
    explanation: 'Vishing (Voice Phishing) uses phone systems or interactive voice response (IVR) systems to impersonate legitimate entities.'
  },
  {
    id: 'm4-q20',
    question: 'What is the risk of using default credentials on corporate IoT devices?',
    options: [
      'They cause hardware degradation',
      'They make devices easily discoverable and exploitable via search engines like Shodan',
      'They block automatic updates',
      'They reduce standard battery lifespans'
    ],
    correctIndex: 1,
    category: 'attacks',
    explanation: 'Default credentials are widely documented, making IoT devices easy targets for automated scanners to draft them into botnets.'
  }
];

const MODULE_FIVE_EXAM = [
  {
    id: 'm5-q1',
    question: 'What is the first operational phase in the standard Incident Response lifecycle?',
    options: ['Detection and Analysis', 'Preparation', 'Containment, Eradication, and Recovery', 'Post-Incident Activity'],
    correctIndex: 1,
    category: 'incidentResponse',
    explanation: 'Preparation is the critical first phase, establishing policies, training response teams, and configuring defense tools before threats occur.'
  },
  {
    id: 'm5-q2',
    question: 'In digital forensics, which of the following is considered the MOST volatile memory source and should be collected first?',
    options: ['Hard Disk Drive (HDD)', 'Random Access Memory (RAM)', 'Processor Cache & Registers', 'Solid State Drive (SSD)'],
    correctIndex: 2,
    category: 'incidentResponse',
    explanation: 'Under the Order of Volatility, CPU registers and cache are extremely volatile (changing in nanoseconds), followed by system RAM.'
  },
  {
    id: 'm5-q3',
    question: 'Which open-source tool should a security analyst use to capture network packets, inspect protocols, and perform detailed PCAP analysis?',
    options: ['Nmap', 'Wireshark', 'Metasploit', 'Nessus'],
    correctIndex: 1,
    category: 'monitoring',
    explanation: 'Wireshark is an industry-standard packet analyzer used to capture network streams and examine payloads.'
  },
  {
    id: 'm5-q4',
    question: 'An analyst receives an alert and immediately isolates the compromised web server from the corporate network. Which incident response phase are they executing?',
    options: ['Preparation', 'Containment', 'Eradication', 'Post-Incident Assessment'],
    correctIndex: 1,
    category: 'incidentResponse',
    explanation: 'Containment limits the scope of an incident by preventing a threat from spreading to other network zones.'
  },
  {
    id: 'm5-q5',
    question: 'Which document contains the detailed step-by-step instructions that incident responders must execute when a specific alert occurs?',
    options: ['Security Policy', 'Playbook / Runbook', 'Disaster Recovery Plan', 'Service Level Agreement'],
    correctIndex: 1,
    category: 'incidentResponse',
    explanation: 'Playbooks provide specific, actionable steps to guide teams during specific incidents (e.g. ransomware or data leak playbooks).'
  },
  {
    id: 'm5-q6',
    question: 'Why is it critical to calculate a cryptographic hash (like SHA-256) of a physical hard drive image before performing forensic analysis?',
    options: [
      'To compress the image size for storage',
      'To ensure the evidence\'s integrity and prove it has not been modified',
      'To decrypt user passwords on the drive',
      'To verify the operating system license'
    ],
    correctIndex: 1,
    category: 'incidentResponse',
    explanation: 'Forensic images are hashed before and after analysis to prove that the evidence remains completely untampered with (integrity).'
  },
  {
    id: 'm5-q7',
    question: 'What is the primary purpose of a "Lessons Learned" meeting following a major security breach?',
    options: [
      'To assign blame and penalize responders',
      'To update security controls and improve response protocols based on what failed',
      'To report the incident to external media outlets',
      'To reset all administrative passwords across the board'
    ],
    correctIndex: 1,
    category: 'incidentResponse',
    explanation: 'The Post-Incident "Lessons Learned" review identifies gaps, updates playbooks, and strengthens defenses to prevent repeat breaches.'
  },
  {
    id: 'm5-q8',
    question: 'Which log source is most useful for tracing successful and failed user authentications on a Windows Active Directory Domain?',
    options: ['Application Log', 'System Log', 'Security Log', 'Setup Log'],
    correctIndex: 2,
    category: 'monitoring',
    explanation: 'Windows Security Logs record auditing events, including successful and failed login attempts and privilege modifications.'
  },
  {
    id: 'm5-q9',
    question: 'In forensics, what term describes the chronological documentation showing who collected, accessed, controlled, and secured evidence?',
    options: ['Order of Volatility', 'Chain of Custody', 'Incident Logbook', 'Forensic Timeline'],
    correctIndex: 1,
    category: 'incidentResponse',
    explanation: 'Chain of Custody is a strict log tracking custody of evidence to ensure it remains admissible in a court of law.'
  },
  {
    id: 'm5-q10',
    question: 'An analyst wants to view all connections from a specific IP in Wireshark. What display filter should they write?',
    options: ['ip.addr == 192.168.1.50', 'ip.src == 192.168.1.50', 'ip == 192.168.1.50', 'filter.ip = 192.168.1.50'],
    correctIndex: 0,
    category: 'monitoring',
    explanation: '`ip.addr == [IP]` is the standard Wireshark display filter to capture connections where the IP is either the source or destination.'
  },
  {
    id: 'm5-q11',
    question: 'Which strategy focuses on maintaining critical business operations during a disaster, even if systems are running in a degraded state?',
    options: ['Disaster Recovery (DR)', 'Business Continuity Plan (BCP)', 'Incident Containment', 'SLA Enforcement'],
    correctIndex: 1,
    category: 'incidentResponse',
    explanation: 'BCP focuses on keeping the business alive and operating during a disruption, while DR is the technical restoration of assets.'
  },
  {
    id: 'm5-q12',
    question: 'During a forensic investigation of a live server, why is it bad practice to run standard commands like `ls` or `ps` directly on the machine?',
    options: [
      'They cause CPU overload',
      'They can modify metadata, logs, or execute malicious rootkit-trojanned commands',
      'They require an internet connection',
      'They automatically encrypt local disks'
    ],
    correctIndex: 1,
    category: 'incidentResponse',
    explanation: 'Responders use trusted, statically compiled tools from external media to avoid corrupting volatile evidence or executing compromised system binaries.'
  },
  {
    id: 'm5-q13',
    question: 'Which alert category describes a notification triggered by a scanner that is a legitimate system action, not an actual threat?',
    options: ['True Positive', 'True Negative', 'False Positive', 'False Negative'],
    correctIndex: 2,
    category: 'monitoring',
    explanation: 'A False Positive occurs when a tool incorrectly alerts on safe, normal activity.'
  },
  {
    id: 'm5-q14',
    question: 'What is a hot site in disaster recovery planning?',
    options: [
      'A location near a volcanic zone',
      'A fully functional backup facility equipped with real-time data sync, ready to take over operations in minutes',
      'A physical building that has electricity and desks but no computers',
      'A digital sandbox environment'
    ],
    correctIndex: 1,
    category: 'incidentResponse',
    explanation: 'A hot site is a redundant, active site that mirrors production data and can take over operations immediately in case of disaster.'
  },
  {
    id: 'm5-q15',
    question: 'Which tool allows an administrator to gather high-level netflow details (source/destination IP, ports, packet sizes) without capturing the packet payload itself?',
    options: ['tcpdump', 'NetFlow / IPFIX', 'Wireshark', 'Nmap'],
    correctIndex: 1,
    category: 'monitoring',
    explanation: 'NetFlow aggregates IP traffic flow metadata, providing valuable routing and volume statistics without payload overhead.'
  },
  {
    id: 'm5-q16',
    question: 'Which containment strategy completely severs all external networking channels to block remote command & control servers?',
    options: ['Segment isolation', 'Firewall blackholing', 'Complete disconnection (air-gapping)', 'Passive monitoring'],
    correctIndex: 2,
    category: 'incidentResponse',
    explanation: 'Pulling the network plug or air-gapping guarantees that ransomware or remote backdoors cannot receive commands or leak data.'
  },
  {
    id: 'm5-q17',
    question: 'Which type of backup only saves files that have changed since the last full backup, and does not clear the archive bit?',
    options: ['Differential Backup', 'Incremental Backup', 'Synthetic Backup', 'Mirror Backup'],
    correctIndex: 0,
    category: 'incidentResponse',
    explanation: 'A Differential backup saves all changes since the last full backup, meaning only two backups are needed for recovery (full + last differential).'
  },
  {
    id: 'm5-q18',
    question: 'Which syslog severity level denotes a critical system event that requires immediate administrative response?',
    options: ['Level 0 (Emergency)', 'Level 5 (Notice)', 'Level 6 (Informational)', 'Level 7 (Debug)'],
    correctIndex: 0,
    category: 'monitoring',
    explanation: 'Syslog Level 0 (Emergency) or Level 1 (Alert) denotes highly critical conditions that need immediate intervention.'
  },
  {
    id: 'm5-q19',
    question: 'What is the primary benefit of deploying a network TAP over configuring a port mirror (SPAN port) on a switch for monitoring?',
    options: [
      'It is cheaper',
      'It captures all traffic, including physical layer errors, without overloading the switch CPU',
      'It encrypts the payload automatically',
      'It acts as an IP router'
    ],
    correctIndex: 1,
    category: 'monitoring',
    explanation: 'TAPs are dedicated hardware nodes that split network streams passively, ensuring no packet loss or switch performance degradation.'
  },
  {
    id: 'm5-q20',
    question: 'Which metric measures the maximum tolerable duration of a service outage before it causes unacceptable business damage?',
    options: ['RPO (Recovery Point Objective)', 'RTO (Recovery Time Objective)', 'MTBF', 'MTTR'],
    correctIndex: 1,
    category: 'incidentResponse',
    explanation: 'RTO is the target time limit set for restoring operations after a disaster to prevent catastrophic losses.'
  }
];

/** Generic 20-question quiz fallback for any custom course modules */
export function buildGenericModuleExam(modTitle) {
  // Let's create a dynamic mix of 20 high-quality Security+ questions
  const pool = [
    ...MODULE_ONE_EXAM,
    ...MODULE_TWO_EXAM,
    ...MODULE_THREE_EXAM,
    ...MODULE_FOUR_EXAM,
    ...MODULE_FIVE_EXAM
  ];
  // Deterministically shuffle or grab 20 questions based on the title string
  const hash = String(modTitle || 'Custom Module').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const questions = [];
  for (let i = 0; i < 20; i++) {
    const idx = (hash + i * 7) % pool.length;
    // Clone and adjust question ID so they are unique
    questions.push({
      ...pool[idx],
      id: `generic-mq-${i}`
    });
  }
  return questions;
}

/** Retreive the 20-question practice exam for a specific module */
export function getQuizForModule(modId, modTitle) {
  const cleanId = String(modId || '').toLowerCase();
  
  if (cleanId.includes('foundations') || cleanId.includes('01') || cleanId.includes('mod-0-')) {
    return MODULE_ONE_EXAM;
  }
  if (cleanId.includes('cryptography') || cleanId.includes('02') || cleanId.includes('mod-1-')) {
    return MODULE_TWO_EXAM;
  }
  if (cleanId.includes('defense') || cleanId.includes('03') || cleanId.includes('mod-2-')) {
    return MODULE_THREE_EXAM;
  }
  if (cleanId.includes('attack') || cleanId.includes('04') || cleanId.includes('mod-3-')) {
    return MODULE_FOUR_EXAM;
  }
  if (cleanId.includes('monitoring') || cleanId.includes('05') || cleanId.includes('mod-4-')) {
    return MODULE_FIVE_EXAM;
  }

  // Fallback to dynamic compilation
  return buildGenericModuleExam(modTitle);
}

/** Analyze exam answers and generate Strengths (Pros) & Weaknesses (Cons) dynamic reporting */
export function evaluateStudentPerformance(questions, answers) {
  const categoryStats = {};
  
  // Initialize stats for each active category
  questions.forEach(q => {
    const cat = q.category || 'foundations';
    if (!categoryStats[cat]) {
      categoryStats[cat] = { correct: 0, total: 0 };
    }
    const isCorrect = answers[q.id] === q.correctIndex;
    if (isCorrect) categoryStats[cat].correct += 1;
    categoryStats[cat].total += 1;
  });

  const pros = [];
  const cons = [];

  Object.keys(categoryStats).forEach(cat => {
    const stats = categoryStats[cat];
    const scorePct = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
    const meta = CATEGORY_METADATA[cat] || {
      name: 'General Security Concepts',
      proTip: 'Excellent work mastering general network security concepts.',
      conTip: 'Review basic concepts and study corresponding lesson modules.'
    };

    if (scorePct >= 75) {
      pros.push({
        category: cat,
        name: meta.name,
        score: `${stats.correct}/${stats.total}`,
        percentage: Math.round(scorePct),
        feedback: meta.proTip
      });
    } else {
      cons.push({
        category: cat,
        name: meta.name,
        score: `${stats.correct}/${stats.total}`,
        percentage: Math.round(scorePct),
        feedback: meta.conTip
      });
    }
  });

  // Safe checks if they got perfect/zero to ensure lists are never empty
  if (pros.length === 0) {
    pros.push({
      category: 'general',
      name: 'Exam Perseverance',
      score: '100%',
      percentage: 100,
      feedback: 'Good job attempting all questions on this challenging CompTIA practice assessment! Keep pushing.'
    });
  }
  if (cons.length === 0) {
    cons.push({
      category: 'perfect',
      name: 'Flawless Knowledge Base',
      score: '100%',
      percentage: 100,
      feedback: 'Incredible performance! You scored perfectly across all syllabus segments. No core weaknesses identified.'
    });
  }

  return { pros, cons };
}
