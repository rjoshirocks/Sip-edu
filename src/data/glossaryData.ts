export type GlossaryCategory =
  | 'Core Protocols'
  | 'Network Entities'
  | 'Signaling & Headers'
  | 'Audio & Media'
  | 'NAT & Security';

export interface GlossaryTerm {
  id: string;
  term: string;
  shortCode?: string;
  category: GlossaryCategory;
  definition: string;
  analogy?: string;
  example?: string;
  relatedIds?: string[];
}

export const GLOSSARY_CATEGORIES: GlossaryCategory[] = [
  'Core Protocols',
  'Network Entities',
  'Signaling & Headers',
  'Audio & Media',
  'NAT & Security',
];

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // Core Protocols
  {
    id: 'voip',
    term: 'Voice over Internet Protocol',
    shortCode: 'VoIP',
    category: 'Core Protocols',
    definition:
      'The umbrella technology that converts analog human voice into digital IP packets and transmits them over internet or local data networks instead of traditional copper phone lines.',
    analogy: 'VoIP is the concept of "motorized transport" — the broad category covering every internet calling app and IP desk phone.',
    example: 'Services like Zoom Phone, Microsoft Teams Calling, Asterisk, and WhatsApp voice all run on VoIP.',
    relatedIds: ['sip', 'rtp', 'codec'],
  },
  {
    id: 'sip',
    term: 'Session Initiation Protocol',
    shortCode: 'SIP',
    category: 'Core Protocols',
    definition:
      'An application-layer signaling protocol (RFC 3261) used to create, modify, and terminate multimedia sessions like voice and video calls. SIP handles call setup and teardown, not the audio stream itself.',
    analogy: 'Like an air-traffic controller clearing planes for takeoff and landing, without carrying any passengers.',
    example: 'INVITE sip:bob@biloxi.com SIP/2.0 (Default ports: UDP/TCP 5060, TLS 5061)',
    relatedIds: ['sdp', 'rtp', 'uac', 'uas'],
  },
  {
    id: 'sdp',
    term: 'Session Description Protocol',
    shortCode: 'SDP',
    category: 'Core Protocols',
    definition:
      'A plain-text format (RFC 4566) carried inside SIP INVITE and 200 OK messages to negotiate media details: IP addresses, UDP ports, and supported audio/video codecs.',
    analogy: 'A restaurant menu shared before dinner so both guests agree on a language and meal format.',
    example: 'c=IN IP4 192.168.1.100  |  m=audio 5004 RTP/AVP 0 101',
    relatedIds: ['sip', 'rtp', 'codec', 'one-way-audio'],
  },
  {
    id: 'rtp',
    term: 'Real-time Transport Protocol',
    shortCode: 'RTP',
    category: 'Core Protocols',
    definition:
      'The UDP-based transport protocol (RFC 3550) that carries the actual digitized voice and video packets once SIP has established the call. Includes sequence numbers and timestamps for smooth playback.',
    analogy: 'The delivery truck carrying the actual spoken words back and forth after the phone call connects.',
    example: '20ms voice frames sent over dynamic UDP ports (commonly 10,000–20,000).',
    relatedIds: ['rtcp', 'srtp', 'jitter', 'sip'],
  },
  {
    id: 'rtcp',
    term: 'RTP Control Protocol',
    shortCode: 'RTCP',
    category: 'Core Protocols',
    definition:
      'A companion protocol to RTP that periodically exchanges call quality statistics—such as packet loss, jitter, and round-trip latency—between endpoints.',
    analogy: 'A quality inspector riding alongside the audio stream, reporting road bumps and delays.',
    example: 'Always uses RTP port + 1 (e.g., if audio flows on UDP 10000, RTCP uses UDP 10001).',
    relatedIds: ['rtp', 'jitter', 'mos'],
  },
  {
    id: 'srtp',
    term: 'Secure Real-time Transport Protocol',
    shortCode: 'SRTP',
    category: 'Core Protocols',
    definition:
      'An encrypted extension of RTP (RFC 3711) that protects voice and video media packets from eavesdropping and tampering using AES encryption.',
    analogy: 'Putting your spoken conversation inside a locked armored truck instead of a postcard.',
    example: 'Negotiated in SDP via m=audio 5004 RTP/SAVP and a=crypto:... lines.',
    relatedIds: ['rtp', 'sips'],
  },
  {
    id: 'sips',
    term: 'SIP over TLS',
    shortCode: 'SIPS',
    category: 'Core Protocols',
    definition:
      'Encrypted SIP signaling wrapped inside Transport Layer Security (TLS) on port 5061, preventing attackers from reading caller IDs, extensions, or SDP parameters in transit.',
    example: 'Contact: <sips:alice@atlanta.com:5061;transport=tls>',
    relatedIds: ['sip', 'srtp'],
  },

  // Network Entities
  {
    id: 'uac',
    term: 'User Agent Client',
    shortCode: 'UAC',
    category: 'Network Entities',
    definition:
      'The endpoint role that initiates a SIP request (such as sending an INVITE to start a call or REGISTER to sign in).',
    example: 'When Alice dials Bob, Alice softphone acts as the UAC.',
    relatedIds: ['uas', 'sip'],
  },
  {
    id: 'uas',
    term: 'User Agent Server',
    shortCode: 'UAS',
    category: 'Network Entities',
    definition:
      'The endpoint role that receives a SIP request and sends back a status response (such as 180 Ringing, 200 OK, or 486 Busy Here).',
    example: 'When Bob phone rings and answers Alice call, Bob phone acts as the UAS.',
    relatedIds: ['uac', 'sip'],
  },
  {
    id: 'sip-proxy',
    term: 'SIP Proxy Server',
    category: 'Network Entities',
    definition:
      'An intermediary router that receives SIP requests, looks up the destination user address, and forwards signaling packets closer to the target. Typically does not handle RTP audio.',
    analogy: 'A postal sorting hub that reads the envelope address and routes it to the right city.',
    relatedIds: ['registrar', 'b2bua', 'via'],
  },
  {
    id: 'registrar',
    term: 'SIP Registrar',
    category: 'Network Entities',
    definition:
      'A server that accepts REGISTER requests from phones and stores the mapping between a user logical SIP URI and their current physical IP address in a Location Database.',
    example: 'Maps sip:bob@company.com -> 192.168.1.102:5060 for 3600 seconds.',
    relatedIds: ['digest-auth', 'sip-proxy', 'uri'],
  },
  {
    id: 'pbx',
    term: 'Private Branch Exchange',
    shortCode: 'PBX / IP-PBX',
    category: 'Network Entities',
    definition:
      'An organization internal telephone switching system that manages extension dialing, voicemail, call queues, IVR menus, and routing calls out to the public phone network.',
    example: 'Asterisk, FreePBX, 3CX, and Cisco CallManager are popular IP-PBX platforms.',
    relatedIds: ['sip-trunk', 'b2bua'],
  },
  {
    id: 'sbc',
    term: 'Session Border Controller',
    shortCode: 'SBC',
    category: 'Network Entities',
    definition:
      'A specialized VoIP firewall and network border device that protects PBXs from attacks, resolves NAT traversal issues, normalizes broken SIP headers, and bridges carrier trunks.',
    analogy: 'Security checkpoint and translator standing at the border between your office LAN and the public internet.',
    relatedIds: ['nat', 'one-way-audio', 'b2bua'],
  },
  {
    id: 'b2bua',
    term: 'Back-to-Back User Agent',
    shortCode: 'B2BUA',
    category: 'Network Entities',
    definition:
      'A SIP server (like Asterisk or an SBC) that splits a call into two independent SIP dialogs: terminating the incoming leg as a UAS and creating a fresh outgoing leg as a UAC.',
    analogy: 'An interpreter who listens to person A, then turns around and speaks fresh sentences to person B.',
    relatedIds: ['sip-proxy', 'sbc', 'dialog'],
  },
  {
    id: 'sip-trunk',
    term: 'SIP Trunk',
    category: 'Network Entities',
    definition:
      'A virtual internet connection linking an organization IP-PBX to an Internet Telephony Service Provider (ITSP), replacing physical copper PRI/T1 phone lines.',
    example: 'Allows an office PBX to place and receive calls to normal mobile and landline numbers worldwide.',
    relatedIds: ['pbx', 'sbc'],
  },

  // Signaling & Headers
  {
    id: 'dialog',
    term: 'SIP Dialog',
    category: 'Signaling & Headers',
    definition:
      'A persistent peer-to-peer SIP relationship between two user agents lasting for the entire duration of a call. Uniquely identified by Call-ID, From tag, and To tag.',
    example: 'Established when 200 OK arrives for an INVITE, and destroyed when BYE completes.',
    relatedIds: ['transaction', 'call-id', 'tag'],
  },
  {
    id: 'transaction',
    term: 'SIP Transaction',
    category: 'Signaling & Headers',
    definition:
      'A single request message plus all responses to that request (provisional 1xx and one final 2xx–6xx response). A call dialog is made up of multiple transactions.',
    example: 'INVITE -> 100 Trying -> 180 Ringing -> 200 OK is one transaction; BYE -> 200 OK is another.',
    relatedIds: ['dialog', 'branch', 'cseq'],
  },
  {
    id: 'uri',
    term: 'SIP URI',
    shortCode: 'Uniform Resource Identifier',
    category: 'Signaling & Headers',
    definition:
      'An email-like addressing format used to identify users, extensions, or services on a SIP network.',
    example: 'sip:alice@atlanta.com  or  sip:+14155550199@trunk.carrier.net',
    relatedIds: ['registrar', 'contact'],
  },
  {
    id: 'via',
    term: 'Via Header',
    category: 'Signaling & Headers',
    definition:
      'Records the transport protocol and IP/port path taken by a SIP request so that responses can trace back through the exact same proxies in reverse order.',
    example: 'Via: SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bK776asdhds;rport',
    relatedIds: ['branch', 'sip-proxy', 'nat'],
  },
  {
    id: 'call-id',
    term: 'Call-ID Header',
    category: 'Signaling & Headers',
    definition:
      'A globally unique identifier string shared by every SIP message belonging to the same call session.',
    example: 'Call-ID: a84b4c76e66710@pc33.atlanta.com',
    relatedIds: ['dialog', 'cseq'],
  },
  {
    id: 'cseq',
    term: 'CSeq (Command Sequence)',
    shortCode: 'CSeq',
    category: 'Signaling & Headers',
    definition:
      'Combines an integer counter and the SIP method name to keep requests ordered within a dialog and match responses to their exact request.',
    example: 'CSeq: 314159 INVITE  (followed later by CSeq: 314160 BYE)',
    relatedIds: ['transaction', 'call-id'],
  },
  {
    id: 'contact',
    term: 'Contact Header',
    category: 'Signaling & Headers',
    definition:
      'Provides the direct IP address and port URI where subsequent in-dialog requests (like ACK, re-INVITE, or BYE) should be delivered.',
    example: 'Contact: <sip:bob@192.168.2.200:5060>',
    relatedIds: ['uri', 'dialog'],
  },
  {
    id: 'tag',
    term: 'From / To Tag',
    category: 'Signaling & Headers',
    definition:
      'Random alphanumeric parameters attached to the From header (by caller) and To header (by callee) to distinguish forked or parallel calls sharing the same Call-ID.',
    example: 'To: Bob <sip:bob@biloxi.com>;tag=a6c85cf',
    relatedIds: ['dialog', 'call-id'],
  },
  {
    id: 'branch',
    term: 'Branch Parameter',
    category: 'Signaling & Headers',
    definition:
      'A unique transaction identifier inside the Via header. Always starts with the magic cookie "z9hG4bK" defined by RFC 3261.',
    example: 'branch=z9hG4bK776asdhds',
    relatedIds: ['via', 'transaction'],
  },
  {
    id: 'early-media',
    term: 'Early Media',
    category: 'Signaling & Headers',
    definition:
      'Audio or video sent before a call is officially answered (before 200 OK). Used by carriers to play custom ringback tones, busy announcements, or error messages via 183 Session Progress.',
    example: 'Hearing "The number you have dialed is no longer in service" without the call timer starting.',
    relatedIds: ['sdp', 'rtp'],
  },

  // Audio & Media
  {
    id: 'codec',
    term: 'Audio Codec',
    shortCode: 'Coder-Decoder',
    category: 'Audio & Media',
    definition:
      'An algorithm that compresses analog/PCM sound into digital packets for network transmission and decompresses them back into sound at the receiver.',
    example: 'G.711 (PCMU/PCMA), Opus, G.722 (HD Voice), and G.729.',
    relatedIds: ['g711', 'opus', 'sdp'],
  },
  {
    id: 'g711',
    term: 'G.711 (PCMU / PCMA)',
    shortCode: 'Payload 0 / 8',
    category: 'Audio & Media',
    definition:
      'The universal uncompressed narrowband telephony codec running at 64 kbps (8 kHz sampling). Supported by nearly every VoIP phone and PSTN gateway worldwide.',
    example: 'PCMU (u-law, payload 0) is standard in North America/Japan; PCMA (a-law, payload 8) in Europe/rest of world.',
    relatedIds: ['codec', 'opus'],
  },
  {
    id: 'opus',
    term: 'Opus Codec',
    category: 'Audio & Media',
    definition:
      'A modern, royalty-free, adaptive HD audio codec supporting bitrates from 6 kbps to 510 kbps and full-band 48 kHz audio. Standard in WebRTC and modern softphones.',
    relatedIds: ['codec', 'g711'],
  },
  {
    id: 'dtmf',
    term: 'Dual-Tone Multi-Frequency',
    shortCode: 'DTMF',
    category: 'Audio & Media',
    definition:
      'The audible touch-tone keypad frequencies (0–9, *, #) used to navigate automated phone menus (IVRs) and enter PINs. Commonly sent over VoIP using RFC 2833/4733 RTP telephone-events.',
    example: 'Pressing "1" plays 697 Hz + 1209 Hz simultaneously.',
    relatedIds: ['rtp', 'sdp'],
  },
  {
    id: 'jitter',
    term: 'Jitter & Jitter Buffer',
    category: 'Audio & Media',
    definition:
      'Jitter is the uneven variation in packet arrival times over the internet. A Jitter Buffer holds incoming RTP packets briefly (20–60ms) to smooth out timing before playback.',
    analogy: 'Like a small water reservoir smoothing out irregular splashes into a steady stream.',
    relatedIds: ['rtp', 'rtcp', 'mos'],
  },
  {
    id: 'mos',
    term: 'Mean Opinion Score',
    shortCode: 'MOS',
    category: 'Audio & Media',
    definition:
      'A standard 1.0 to 5.0 rating scale measuring perceived call voice quality based on codec clarity, latency, jitter, and packet loss.',
    example: '4.3–4.5 is crisp toll-quality voice; below 3.0 sounds choppy or robotic.',
    relatedIds: ['jitter', 'rtcp'],
  },

  // NAT & Security
  {
    id: 'nat',
    term: 'Network Address Translation',
    shortCode: 'NAT',
    category: 'NAT & Security',
    definition:
      'A router mechanism that translates private local network IPs (e.g., 192.168.1.x) into a single shared public IP address. Causes VoIP issues when private IPs remain hidden inside SIP/SDP text.',
    relatedIds: ['one-way-audio', 'stun', 'sbc'],
  },
  {
    id: 'one-way-audio',
    term: 'One-Way Audio',
    category: 'NAT & Security',
    definition:
      'The #1 real-world VoIP fault where one caller can hear fine, while the other hears silence. Usually caused by NAT firewalls dropping incoming RTP or private IPs left inside SDP c= lines.',
    example: 'Alice advertises c=IN IP4 192.168.1.50; Bob sends audio to a non-routable LAN address.',
    relatedIds: ['nat', 'sdp', 'stun', 'sbc'],
  },
  {
    id: 'stun',
    term: 'STUN (Session Traversal Utilities for NAT)',
    shortCode: 'STUN',
    category: 'NAT & Security',
    definition:
      'A lightweight protocol allowing a VoIP client behind NAT to ask a public STUN server: "What is my public IP address and mapped port?" before writing its SDP offer.',
    relatedIds: ['nat', 'turn', 'ice', 'one-way-audio'],
  },
  {
    id: 'turn',
    term: 'TURN (Traversal Using Relays around NAT)',
    shortCode: 'TURN',
    category: 'NAT & Security',
    definition:
      'A fallback media relay server used when strict corporate symmetric NATs or firewalls block direct peer-to-peer RTP audio packets.',
    relatedIds: ['stun', 'ice', 'nat'],
  },
  {
    id: 'ice',
    term: 'Interactive Connectivity Establishment',
    shortCode: 'ICE',
    category: 'NAT & Security',
    definition:
      'A framework combining STUN and TURN to discover and test all possible IP/port candidate paths between two endpoints and automatically select the best working route.',
    relatedIds: ['stun', 'turn', 'nat'],
  },
  {
    id: 'digest-auth',
    term: 'SIP Digest Authentication',
    category: 'NAT & Security',
    definition:
      'A challenge-response security mechanism (401 Unauthorized / 407 Proxy Auth Required) where the client proves it knows the account password by sending a cryptographic hash mixed with a server nonce.',
    example: 'Prevents transmitting plain-text passwords across the network during REGISTER or INVITE.',
    relatedIds: ['nonce', 'registrar'],
  },
  {
    id: 'nonce',
    term: 'Cryptographic Nonce',
    category: 'NAT & Security',
    definition:
      'A single-use random token generated by a SIP Registrar inside a 401 challenge to ensure password hashes cannot be captured and replayed by attackers later.',
    example: 'WWW-Authenticate: Digest realm="biloxi.com", nonce="ea9c8e88df84f"',
    relatedIds: ['digest-auth', 'registrar'],
  },
];
