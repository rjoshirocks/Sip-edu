export interface SipNode {
  id: string;
  name: string;
  role: string;
  ip: string;
  port: number;
  uri: string;
  color: string;
}

export interface LadderStep {
  id: string;
  stepNumber: number;
  from: 'alice' | 'proxy' | 'bob' | 'registrar';
  to: 'alice' | 'proxy' | 'bob' | 'registrar';
  type: 'request' | 'response' | 'media';
  title: string;
  code?: number;
  description: string;
  whyItMatters: string;
  keyHeaderSnippet: string;
  packetDetails: {
    startLine: string;
    headers: Record<string, string>;
    sdp?: Record<string, string>;
  };
  highlightColor: string; // tailwind color token
}

export interface CallScenario {
  id: string;
  title: string;
  category: 'Fundamentals' | 'Authentication' | 'Edge Cases' | 'Troubleshooting';
  subtitle: string;
  description: string;
  badge: string;
  participants: Array<{ id: 'alice' | 'proxy' | 'bob' | 'registrar'; label: string; role: string; ip: string }>;
  steps: LadderStep[];
}

export interface SipHeaderInfo {
  name: string;
  shortName?: string;
  purpose: string;
  example: string;
  commonBugs: string;
  category: 'Routing' | 'Identity' | 'Session' | 'Media';
}

export interface SdpLineInfo {
  prefix: string;
  name: string;
  meaning: string;
  example: string;
  voipImpact: string;
}

export interface ResponseCode {
  code: number;
  title: string;
  category: '1xx' | '2xx' | '3xx' | '4xx' | '5xx' | '6xx';
  meaning: string;
  realWorldAnalogy: string;
  troubleshootingTip: string;
}

export interface TroubleshootingQuiz {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  symptom: string;
  packetTrace: Array<{
    time: string;
    source: string;
    dest: string;
    protocol: string;
    info: string;
    details?: string;
  }>;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  fixGuide: string;
}

// ----------------- SCENARIOS -----------------

export const CALL_SCENARIOS: CallScenario[] = [
  {
    id: 'basic-call',
    title: 'Standard 2-Party Call Setup & Tear Down',
    category: 'Fundamentals',
    subtitle: 'The quintessential SIP session handshake (INVITE -> 200 OK -> ACK -> RTP -> BYE)',
    description: 'Follow how Alice calls Bob through an intermediate SIP Proxy. Notice how signaling goes through the proxy, while voice RTP flows directly peer-to-peer.',
    badge: 'Core RFC 3261',
    participants: [
      { id: 'alice', label: 'Alice (Caller)', role: 'User Agent Client (UAC)', ip: '192.168.1.100' },
      { id: 'proxy', label: 'SIP Proxy', role: 'Stateful Proxy / PBX', ip: '203.0.113.10' },
      { id: 'bob', label: 'Bob (Callee)', role: 'User Agent Server (UAS)', ip: '192.168.2.200' },
    ],
    steps: [
      {
        id: 's1',
        stepNumber: 1,
        from: 'alice',
        to: 'proxy',
        type: 'request',
        title: 'INVITE (Alice -> Proxy)',
        description: 'Alice initiates the call. She offers her audio capabilities via SDP (IP: 192.168.1.100, Port: 5004, Codec: PCMU/G.711).',
        whyItMatters: 'The INVITE message carries the session proposal and the caller SDP offer. Without this, no media parameters can be negotiated.',
        keyHeaderSnippet: 'INVITE sip:bob@biloxi.com SIP/2.0\nCall-ID: a84b4c76e66710\nCSeq: 314159 INVITE',
        packetDetails: {
          startLine: 'INVITE sip:bob@biloxi.com SIP/2.0',
          headers: {
            'Via': 'SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bK776asdhds',
            'Max-Forwards': '70',
            'To': 'Bob <sip:bob@biloxi.com>',
            'From': 'Alice <sip:alice@atlanta.com>;tag=1928301774',
            'Call-ID': 'a84b4c76e66710@pc33.atlanta.com',
            'CSeq': '314159 INVITE',
            'Contact': '<sip:alice@192.168.1.100:5060>',
            'Content-Type': 'application/sdp',
            'Content-Length': '142',
          },
          sdp: {
            'v': '0',
            'o': 'alice 2890844526 2890844526 IN IP4 192.168.1.100',
            's': 'VoIP Talk',
            'c': 'IN IP4 192.168.1.100',
            't': '0 0',
            'm': 'audio 5004 RTP/AVP 0 8 101',
            'a': 'rtpmap:0 PCMU/8000',
          },
        },
        highlightColor: 'emerald',
      },
      {
        id: 's2',
        stepNumber: 2,
        from: 'proxy',
        to: 'alice',
        type: 'response',
        code: 100,
        title: '100 Trying (Proxy -> Alice)',
        description: 'Proxy tells Alice: "I received your INVITE and am actively locating Bob. Stop resending INVITE packets!"',
        whyItMatters: 'SIP runs predominantly over UDP. Provisional responses like 100 Trying prevent aggressive client packet retransmissions.',
        keyHeaderSnippet: 'SIP/2.0 100 Trying\nCSeq: 314159 INVITE',
        packetDetails: {
          startLine: 'SIP/2.0 100 Trying',
          headers: {
            'Via': 'SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bK776asdhds',
            'To': 'Bob <sip:bob@biloxi.com>',
            'From': 'Alice <sip:alice@atlanta.com>;tag=1928301774',
            'Call-ID': 'a84b4c76e66710@pc33.atlanta.com',
            'CSeq': '314159 INVITE',
            'Content-Length': '0',
          },
        },
        highlightColor: 'sky',
      },
      {
        id: 's3',
        stepNumber: 3,
        from: 'proxy',
        to: 'bob',
        type: 'request',
        title: 'INVITE Forwarded (Proxy -> Bob)',
        description: 'Proxy looks up Bob registered contact in location database and forwards the INVITE with an added Via header.',
        whyItMatters: 'Proxies add their own Via header so downstream response packets can trace back the exact same reverse path.',
        keyHeaderSnippet: 'INVITE sip:bob@192.168.2.200:5060 SIP/2.0\nVia: SIP/2.0/UDP 203.0.113.10:5060;branch=z9hG4bK83204',
        packetDetails: {
          startLine: 'INVITE sip:bob@192.168.2.200:5060 SIP/2.0',
          headers: {
            'Via': 'SIP/2.0/UDP 203.0.113.10:5060;branch=z9hG4bK83204, SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bK776asdhds',
            'Max-Forwards': '69',
            'To': 'Bob <sip:bob@biloxi.com>',
            'From': 'Alice <sip:alice@atlanta.com>;tag=1928301774',
            'Call-ID': 'a84b4c76e66710@pc33.atlanta.com',
            'CSeq': '314159 INVITE',
            'Contact': '<sip:alice@192.168.1.100:5060>',
            'Content-Type': 'application/sdp',
          },
          sdp: {
            'c': 'IN IP4 192.168.1.100',
            'm': 'audio 5004 RTP/AVP 0 8 101',
          },
        },
        highlightColor: 'emerald',
      },
      {
        id: 's4',
        stepNumber: 4,
        from: 'bob',
        to: 'proxy',
        type: 'response',
        code: 180,
        title: '180 Ringing (Bob -> Proxy)',
        description: 'Bob device starts ringing physically or playing user alerts. Bob sends 180 Ringing back to Proxy.',
        whyItMatters: 'Bob assigns a "tag" in the To header (`tag=a6c85cf`). This tag binds the dialog uniquely between Alice and Bob.',
        keyHeaderSnippet: 'SIP/2.0 180 Ringing\nTo: Bob <sip:bob@biloxi.com>;tag=a6c85cf',
        packetDetails: {
          startLine: 'SIP/2.0 180 Ringing',
          headers: {
            'Via': 'SIP/2.0/UDP 203.0.113.10:5060;branch=z9hG4bK83204, SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bK776asdhds',
            'To': 'Bob <sip:bob@biloxi.com>;tag=a6c85cf',
            'From': 'Alice <sip:alice@atlanta.com>;tag=1928301774',
            'Call-ID': 'a84b4c76e66710@pc33.atlanta.com',
            'CSeq': '314159 INVITE',
          },
        },
        highlightColor: 'amber',
      },
      {
        id: 's5',
        stepNumber: 5,
        from: 'proxy',
        to: 'alice',
        type: 'response',
        code: 180,
        title: '180 Ringing Forwarded (Proxy -> Alice)',
        description: 'Proxy strips its top Via header and forwards 180 Ringing to Alice. Alice phone plays a ringback tone.',
        whyItMatters: 'Tells the caller that the callee phone is ringing so the caller doesn’t wonder if the network dropped.',
        keyHeaderSnippet: 'SIP/2.0 180 Ringing\nVia: SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bK776asdhds',
        packetDetails: {
          startLine: 'SIP/2.0 180 Ringing',
          headers: {
            'Via': 'SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bK776asdhds',
            'To': 'Bob <sip:bob@biloxi.com>;tag=a6c85cf',
            'From': 'Alice <sip:alice@atlanta.com>;tag=1928301774',
            'Call-ID': 'a84b4c76e66710@pc33.atlanta.com',
            'CSeq': '314159 INVITE',
          },
        },
        highlightColor: 'amber',
      },
      {
        id: 's6',
        stepNumber: 6,
        from: 'bob',
        to: 'proxy',
        type: 'response',
        code: 200,
        title: '200 OK (Bob -> Proxy)',
        description: 'Bob answers the call! Bob sends 200 OK containing his SDP answer (IP: 192.168.2.200, Port: 7078, Codec: PCMU).',
        whyItMatters: 'The 200 OK completes the SDP Offer/Answer negotiation. Both sides now know each other IP addresses and RTP audio ports.',
        keyHeaderSnippet: 'SIP/2.0 200 OK\nContact: <sip:bob@192.168.2.200:5060>\nContent-Type: application/sdp',
        packetDetails: {
          startLine: 'SIP/2.0 200 OK',
          headers: {
            'Via': 'SIP/2.0/UDP 203.0.113.10:5060;branch=z9hG4bK83204, SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bK776asdhds',
            'To': 'Bob <sip:bob@biloxi.com>;tag=a6c85cf',
            'From': 'Alice <sip:alice@atlanta.com>;tag=1928301774',
            'Call-ID': 'a84b4c76e66710@pc33.atlanta.com',
            'CSeq': '314159 INVITE',
            'Contact': '<sip:bob@192.168.2.200:5060>',
            'Content-Type': 'application/sdp',
          },
          sdp: {
            'v': '0',
            'o': 'bob 2890844527 2890844527 IN IP4 192.168.2.200',
            's': 'VoIP Talk',
            'c': 'IN IP4 192.168.2.200',
            't': '0 0',
            'm': 'audio 7078 RTP/AVP 0',
            'a': 'rtpmap:0 PCMU/8000',
          },
        },
        highlightColor: 'emerald',
      },
      {
        id: 's7',
        stepNumber: 7,
        from: 'proxy',
        to: 'alice',
        type: 'response',
        code: 200,
        title: '200 OK Forwarded (Proxy -> Alice)',
        description: 'Proxy relays Bob 200 OK answer to Alice. Alice now has Bob SDP answer and direct Contact address.',
        whyItMatters: 'Alice now learns Bob direct Contact URI (`<sip:bob@192.168.2.200:5060>`), enabling future messages (like ACK and BYE) to route directly!',
        keyHeaderSnippet: 'SIP/2.0 200 OK\nContact: <sip:bob@192.168.2.200:5060>',
        packetDetails: {
          startLine: 'SIP/2.0 200 OK',
          headers: {
            'Via': 'SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bK776asdhds',
            'To': 'Bob <sip:bob@biloxi.com>;tag=a6c85cf',
            'From': 'Alice <sip:alice@atlanta.com>;tag=1928301774',
            'Call-ID': 'a84b4c76e66710@pc33.atlanta.com',
            'CSeq': '314159 INVITE',
            'Contact': '<sip:bob@192.168.2.200:5060>',
          },
        },
        highlightColor: 'emerald',
      },
      {
        id: 's8',
        stepNumber: 8,
        from: 'alice',
        to: 'bob',
        type: 'request',
        title: 'ACK (Alice -> Bob)',
        description: 'Alice sends an ACK directly to Bob (or via Record-Route). The 3-way handshake (INVITE-200-ACK) is complete!',
        whyItMatters: 'ACK is unique in SIP: it is a request that receives NO response. It confirms final reception of 200 OK.',
        keyHeaderSnippet: 'ACK sip:bob@192.168.2.200:5060 SIP/2.0\nCSeq: 314159 ACK',
        packetDetails: {
          startLine: 'ACK sip:bob@192.168.2.200:5060 SIP/2.0',
          headers: {
            'Via': 'SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bK992ba',
            'To': 'Bob <sip:bob@biloxi.com>;tag=a6c85cf',
            'From': 'Alice <sip:alice@atlanta.com>;tag=1928301774',
            'Call-ID': 'a84b4c76e66710@pc33.atlanta.com',
            'CSeq': '314159 ACK',
          },
        },
        highlightColor: 'indigo',
      },
      {
        id: 's9',
        stepNumber: 9,
        from: 'alice',
        to: 'bob',
        type: 'media',
        title: 'Two-Way RTP Media Stream',
        description: 'Real-Time Transport Protocol (RTP) audio packets stream directly between 192.168.1.100:5004 and 192.168.2.200:7078.',
        whyItMatters: 'Crucial VoIP distinction: SIP signaling has stopped; raw UDP media packets flow independently of the SIP proxy!',
        keyHeaderSnippet: 'RTP Packet: Payload Type=0 (PCMU), Seq=1042, Timestamp=160000, 160 bytes audio',
        packetDetails: {
          startLine: 'RTP Audio Stream (UDP)',
          headers: {
            'Protocol': 'RTP (RFC 3550)',
            'Payload Type': '0 (ITU-T G.711 PCMU)',
            'Sampling Rate': '8000 Hz, 64 kbps',
            'Packetization Interval': '20 ms per packet',
            'Path': 'Alice (192.168.1.100:5004) <---> Bob (192.168.2.200:7078)',
          },
        },
        highlightColor: 'violet',
      },
      {
        id: 's10',
        stepNumber: 10,
        from: 'alice',
        to: 'bob',
        type: 'request',
        title: 'BYE (Alice -> Bob)',
        description: 'Alice decides to hang up. She sends a BYE request directly to Bob contact URI.',
        whyItMatters: 'BYE terminates the established SIP dialog and halts both RTP audio streams immediately.',
        keyHeaderSnippet: 'BYE sip:bob@192.168.2.200:5060 SIP/2.0\nCSeq: 314160 BYE',
        packetDetails: {
          startLine: 'BYE sip:bob@192.168.2.200:5060 SIP/2.0',
          headers: {
            'Via': 'SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bKnashds7',
            'To': 'Bob <sip:bob@biloxi.com>;tag=a6c85cf',
            'From': 'Alice <sip:alice@atlanta.com>;tag=1928301774',
            'Call-ID': 'a84b4c76e66710@pc33.atlanta.com',
            'CSeq': '314160 BYE',
          },
        },
        highlightColor: 'rose',
      },
      {
        id: 's11',
        stepNumber: 11,
        from: 'bob',
        to: 'alice',
        type: 'response',
        code: 200,
        title: '200 OK to BYE (Bob -> Alice)',
        description: 'Bob acknowledges the BYE. The call session is formally closed and resources are released.',
        whyItMatters: 'Guarantees both sides have successfully finalized billing, closed audio sockets, and cleared memory.',
        keyHeaderSnippet: 'SIP/2.0 200 OK\nCSeq: 314160 BYE',
        packetDetails: {
          startLine: 'SIP/2.0 200 OK',
          headers: {
            'Via': 'SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bKnashds7',
            'To': 'Bob <sip:bob@biloxi.com>;tag=a6c85cf',
            'From': 'Alice <sip:alice@atlanta.com>;tag=1928301774',
            'Call-ID': 'a84b4c76e66710@pc33.atlanta.com',
            'CSeq': '314160 BYE',
          },
        },
        highlightColor: 'emerald',
      },
    ],
  },
  {
    id: 'sip-registration',
    title: 'SIP Registration & Digest Authentication',
    category: 'Authentication',
    subtitle: 'How a phone registers its current IP address and authenticates with the Registrar',
    description: 'Phones move, reboot, or change Wi-Fi networks. SIP phones periodically REGISTER their current IP with a Registrar using HTTP-style MD5/SHA256 challenge authentication.',
    badge: 'Security & Binding',
    participants: [
      { id: 'alice', label: 'Alice Phone', role: 'User Agent Client (UAC)', ip: '192.168.1.100' },
      { id: 'registrar', label: 'SIP Registrar', role: 'Authentication & Location Service', ip: '203.0.113.10' },
    ],
    steps: [
      {
        id: 'r1',
        stepNumber: 1,
        from: 'alice',
        to: 'registrar',
        type: 'request',
        title: '1. REGISTER (Initial Unauthenticated)',
        description: 'Alice softphone sends an initial REGISTER request without credentials to inform the registrar of its presence.',
        whyItMatters: 'Every SIP client sends this blindly first. The server will challenge it to prove caller identity.',
        keyHeaderSnippet: 'REGISTER sip:registrar.biloxi.com SIP/2.0\nTo: <sip:alice@biloxi.com>\nContact: <sip:alice@192.168.1.100:5060>',
        packetDetails: {
          startLine: 'REGISTER sip:registrar.biloxi.com SIP/2.0',
          headers: {
            'Via': 'SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bKnashds8',
            'From': '<sip:alice@biloxi.com>;tag=4a82b01',
            'To': '<sip:alice@biloxi.com>',
            'Call-ID': 'bb0293847291@192.168.1.100',
            'CSeq': '1 REGISTER',
            'Contact': '<sip:alice@192.168.1.100:5060>;expires=3600',
          },
        },
        highlightColor: 'sky',
      },
      {
        id: 'r2',
        stepNumber: 2,
        from: 'registrar',
        to: 'alice',
        type: 'response',
        code: 401,
        title: '2. 401 Unauthorized (Digest Challenge)',
        description: 'Registrar rejects unauthenticated request with a cryptographic challenge containing realm and a random nonce.',
        whyItMatters: 'Never sends cleartext passwords over the wire! The nonce prevents replay attacks.',
        keyHeaderSnippet: 'SIP/2.0 401 Unauthorized\nWWW-Authenticate: Digest realm="biloxi.com", nonce="ea9c8e88df84f", algorithm=MD5',
        packetDetails: {
          startLine: 'SIP/2.0 401 Unauthorized',
          headers: {
            'Via': 'SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bKnashds8',
            'From': '<sip:alice@biloxi.com>;tag=4a82b01',
            'To': '<sip:alice@biloxi.com>;tag=reg9021',
            'Call-ID': 'bb0293847291@192.168.1.100',
            'CSeq': '1 REGISTER',
            'WWW-Authenticate': 'Digest realm="biloxi.com", nonce="ea9c8e88df84f", qop="auth", algorithm=MD5',
          },
        },
        highlightColor: 'amber',
      },
      {
        id: 'r3',
        stepNumber: 3,
        from: 'alice',
        to: 'registrar',
        type: 'request',
        title: '3. REGISTER with Authorization',
        description: 'Alice computes the response hash = MD5(MD5(username:realm:password) : nonce : MD5("REGISTER":uri)) and resends.',
        whyItMatters: 'Increments CSeq from 1 to 2. Uses the received nonce to prove she knows the secret password without revealing it.',
        keyHeaderSnippet: 'REGISTER sip:registrar.biloxi.com SIP/2.0\nCSeq: 2 REGISTER\nAuthorization: Digest username="alice", nonce="ea9c8e88df84f", response="6629fae49393"',
        packetDetails: {
          startLine: 'REGISTER sip:registrar.biloxi.com SIP/2.0',
          headers: {
            'Via': 'SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bKnashds9',
            'From': '<sip:alice@biloxi.com>;tag=4a82b01',
            'To': '<sip:alice@biloxi.com>',
            'Call-ID': 'bb0293847291@192.168.1.100',
            'CSeq': '2 REGISTER',
            'Contact': '<sip:alice@192.168.1.100:5060>;expires=3600',
            'Authorization': 'Digest username="alice", realm="biloxi.com", nonce="ea9c8e88df84f", uri="sip:registrar.biloxi.com", response="6629fae49393f9c065f", algorithm=MD5',
          },
        },
        highlightColor: 'emerald',
      },
      {
        id: 'r4',
        stepNumber: 4,
        from: 'registrar',
        to: 'alice',
        type: 'response',
        code: 200,
        title: '4. 200 OK (Registration Bound)',
        description: 'Registrar verifies the hash against database, updates Location Server binding "sip:alice@biloxi.com -> 192.168.1.100:5060", and returns 200 OK.',
        whyItMatters: 'Alice is now officially online and ready to receive calls for the next 3600 seconds!',
        keyHeaderSnippet: 'SIP/2.0 200 OK\nContact: <sip:alice@192.168.1.100:5060>;expires=3600',
        packetDetails: {
          startLine: 'SIP/2.0 200 OK',
          headers: {
            'Via': 'SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bKnashds9',
            'From': '<sip:alice@biloxi.com>;tag=4a82b01',
            'To': '<sip:alice@biloxi.com>;tag=reg9021',
            'Call-ID': 'bb0293847291@192.168.1.100',
            'CSeq': '2 REGISTER',
            'Contact': '<sip:alice@192.168.1.100:5060>;expires=3600',
            'Date': 'Mon, 29 Oct 2026 12:00:00 GMT',
          },
        },
        highlightColor: 'emerald',
      },
    ],
  },
  {
    id: 'busy-call',
    title: 'Callee Busy (486 Busy Here)',
    category: 'Edge Cases',
    subtitle: 'What happens when the recipient is already on another call or rejects with DND',
    description: 'Explore the 486 Busy Here transaction and how SIP handles call rejections and busy signaling.',
    badge: 'Transaction Error',
    participants: [
      { id: 'alice', label: 'Alice', role: 'Caller', ip: '192.168.1.100' },
      { id: 'proxy', label: 'SIP Proxy', role: 'Stateful Proxy', ip: '203.0.113.10' },
      { id: 'bob', label: 'Bob (Busy)', role: 'Callee', ip: '192.168.2.200' },
    ],
    steps: [
      {
        id: 'b1',
        stepNumber: 1,
        from: 'alice',
        to: 'proxy',
        type: 'request',
        title: 'INVITE (Alice -> Proxy)',
        description: 'Alice calls Bob.',
        whyItMatters: 'Standard initial INVITE request.',
        keyHeaderSnippet: 'INVITE sip:bob@biloxi.com SIP/2.0',
        packetDetails: {
          startLine: 'INVITE sip:bob@biloxi.com SIP/2.0',
          headers: { 'From': '<sip:alice@atlanta.com>', 'To': '<sip:bob@biloxi.com>' },
        },
        highlightColor: 'sky',
      },
      {
        id: 'b2',
        stepNumber: 2,
        from: 'proxy',
        to: 'alice',
        type: 'response',
        code: 100,
        title: '100 Trying (Proxy -> Alice)',
        description: 'Proxy confirms it received the INVITE.',
        whyItMatters: 'Halts caller UDP retransmissions.',
        keyHeaderSnippet: 'SIP/2.0 100 Trying',
        packetDetails: { startLine: 'SIP/2.0 100 Trying', headers: {} },
        highlightColor: 'sky',
      },
      {
        id: 'b3',
        stepNumber: 3,
        from: 'proxy',
        to: 'bob',
        type: 'request',
        title: 'INVITE (Proxy -> Bob)',
        description: 'Proxy forwards INVITE to Bob.',
        whyItMatters: 'Attempts to ring Bob terminal.',
        keyHeaderSnippet: 'INVITE sip:bob@192.168.2.200 SIP/2.0',
        packetDetails: { startLine: 'INVITE sip:bob@192.168.2.200 SIP/2.0', headers: {} },
        highlightColor: 'sky',
      },
      {
        id: 'b4',
        stepNumber: 4,
        from: 'bob',
        to: 'proxy',
        type: 'response',
        code: 486,
        title: '486 Busy Here (Bob -> Proxy)',
        description: 'Bob phone is engaged on Line 1 or in Do Not Disturb (DND) mode.',
        whyItMatters: '486 means Bob system is functioning normally, but he cannot take the call right now.',
        keyHeaderSnippet: 'SIP/2.0 486 Busy Here\nTo: <sip:bob@biloxi.com>;tag=busy102',
        packetDetails: {
          startLine: 'SIP/2.0 486 Busy Here',
          headers: {
            'To': '<sip:bob@biloxi.com>;tag=busy102',
            'Reason': 'SIP;cause=486;text="User Busy"',
          },
        },
        highlightColor: 'rose',
      },
      {
        id: 'b5',
        stepNumber: 5,
        from: 'proxy',
        to: 'bob',
        type: 'request',
        title: 'ACK (Proxy -> Bob)',
        description: 'Proxy acknowledges the 486 Busy response at the hop level.',
        whyItMatters: 'In non-2xx SIP transactions, ACK is hop-by-hop rather than end-to-end!',
        keyHeaderSnippet: 'ACK sip:bob@192.168.2.200 SIP/2.0',
        packetDetails: { startLine: 'ACK sip:bob@192.168.2.200 SIP/2.0', headers: {} },
        highlightColor: 'slate',
      },
      {
        id: 'b6',
        stepNumber: 6,
        from: 'proxy',
        to: 'alice',
        type: 'response',
        code: 486,
        title: '486 Busy Here (Proxy -> Alice)',
        description: 'Proxy forwards 486 Busy Here to Alice. Alice softphone plays a fast busy tone (reorder tone).',
        whyItMatters: 'Informs caller to hang up or redirect to voicemail if configured on PBX.',
        keyHeaderSnippet: 'SIP/2.0 486 Busy Here',
        packetDetails: { startLine: 'SIP/2.0 486 Busy Here', headers: {} },
        highlightColor: 'rose',
      },
      {
        id: 'b7',
        stepNumber: 7,
        from: 'alice',
        to: 'proxy',
        type: 'request',
        title: 'ACK (Alice -> Proxy)',
        description: 'Alice acknowledges receipt of 486. Transaction terminates.',
        whyItMatters: 'Completes the failed INVITE transaction gracefully.',
        keyHeaderSnippet: 'ACK sip:bob@biloxi.com SIP/2.0',
        packetDetails: { startLine: 'ACK sip:bob@biloxi.com SIP/2.0', headers: {} },
        highlightColor: 'slate',
      },
    ],
  },
  {
    id: 'one-way-audio',
    title: 'The Infamous One-Way Audio Bug (NAT & SDP Traversal)',
    category: 'Troubleshooting',
    subtitle: 'Why one person can talk and hear, but the other hears pure silence!',
    description: 'The single most common real-world VoIP issue: SIP signaling reaches through the public PBX, but SDP contains a private IP (e.g. 192.168.1.50). Bob sends RTP packets into a private blackhole!',
    badge: 'VoIP Engineer #1 Pitfall',
    participants: [
      { id: 'alice', label: 'Alice (Behind Home NAT)', role: 'Private IP: 192.168.1.50', ip: '192.168.1.50' },
      { id: 'proxy', label: 'Public SIP PBX', role: 'Public IP: 203.0.113.10', ip: '203.0.113.10' },
      { id: 'bob', label: 'Bob (Office Network)', role: 'Public IP: 198.51.100.88', ip: '198.51.100.88' },
    ],
    steps: [
      {
        id: 'n1',
        stepNumber: 1,
        from: 'alice',
        to: 'proxy',
        type: 'request',
        title: '1. INVITE with Unaware Private SDP IP',
        description: 'Alice home router uses NAT. Alice softphone puts her LAN IP `c=IN IP4 192.168.1.50` into the SDP payload!',
        whyItMatters: 'NAT rewrites IP packet headers, but dumb NAT routers DO NOT rewrite the SIP text payload inside UDP data.',
        keyHeaderSnippet: 'INVITE sip:bob@office.com SIP/2.0\nSDP: c=IN IP4 192.168.1.50\nm=audio 4000 RTP/AVP 0',
        packetDetails: {
          startLine: 'INVITE sip:bob@office.com SIP/2.0',
          headers: {
            'Via': 'SIP/2.0/UDP 192.168.1.50:5060;branch=z9hG4bKnatbug',
            'From': '<sip:alice@home.net>',
            'To': '<sip:bob@office.com>',
            'Content-Type': 'application/sdp',
          },
          sdp: {
            'c': 'IN IP4 192.168.1.50  <-- FATAL BUG: Private RFC 1918 IP!',
            'm': 'audio 4000 RTP/AVP 0',
          },
        },
        highlightColor: 'rose',
      },
      {
        id: 'n2',
        stepNumber: 2,
        from: 'proxy',
        to: 'bob',
        type: 'request',
        title: '2. Proxy Forwards Uncorrected SDP',
        description: 'If the PBX lacks a Session Border Controller (SBC) or STUN/ICE fix, it blindly forwards `c=IN IP4 192.168.1.50` to Bob.',
        whyItMatters: 'Bob phone believes Alice audio socket is reachable at 192.168.1.50.',
        keyHeaderSnippet: 'INVITE sip:bob@office.com SIP/2.0\nSDP: c=IN IP4 192.168.1.50',
        packetDetails: {
          startLine: 'INVITE sip:bob@office.com SIP/2.0',
          headers: { 'Content-Type': 'application/sdp' },
          sdp: { 'c': 'IN IP4 192.168.1.50' },
        },
        highlightColor: 'rose',
      },
      {
        id: 'n3',
        stepNumber: 3,
        from: 'bob',
        to: 'alice',
        type: 'response',
        code: 200,
        title: '3. 200 OK with Bob Public SDP IP',
        description: 'Bob answers with his routable public IP: `c=IN IP4 198.51.100.88`, port 9000.',
        whyItMatters: 'Alice CAN send RTP packets to Bob because Bob has a routable public IP address!',
        keyHeaderSnippet: 'SIP/2.0 200 OK\nSDP: c=IN IP4 198.51.100.88\nm=audio 9000 RTP/AVP 0',
        packetDetails: {
          startLine: 'SIP/2.0 200 OK',
          headers: { 'Content-Type': 'application/sdp' },
          sdp: { 'c': 'IN IP4 198.51.100.88', 'm': 'audio 9000 RTP/AVP 0' },
        },
        highlightColor: 'emerald',
      },
      {
        id: 'n4',
        stepNumber: 4,
        from: 'alice',
        to: 'bob',
        type: 'media',
        title: '4. Alice Voice Reaches Bob (ONE WAY WORKS!)',
        description: 'Alice phone transmits RTP packets out to 198.51.100.88:9000. Bob hears Alice loud and clear!',
        whyItMatters: 'This fools users into thinking "the call is connected", but Bob voice is about to fail completely.',
        keyHeaderSnippet: 'RTP stream from 192.168.1.50 -> 198.51.100.88:9000 (DELIVERED)',
        packetDetails: {
          startLine: 'RTP Media: Alice -> Bob',
          headers: { 'Status': 'Delivered successfully over public internet' },
        },
        highlightColor: 'emerald',
      },
      {
        id: 'n5',
        stepNumber: 5,
        from: 'bob',
        to: 'alice',
        type: 'media',
        title: '5. Bob Voice Disappears into Black Hole (DROPPED!)',
        description: 'Bob transmits RTP audio to 192.168.1.50:4000. Internet routers immediately discard packets destined for RFC 1918 private ranges! Alice hears complete silence.',
        whyItMatters: 'The Fix: Enable STUN (Session Traversal Utilities for NAT), ICE, or enable PBX media proxying (comedia/rtpkeepalive or `nat=force_rport,comedia`).',
        keyHeaderSnippet: 'RTP stream from 198.51.100.88 -> 192.168.1.50:4000 (ICMP Host Unreachable / Dropped!)',
        packetDetails: {
          startLine: 'RTP Media: Bob -> Alice (PACKET LOSS 100%)',
          headers: {
            'Destination': '192.168.1.50:4000 (Non-routable on WAN)',
            'Result': 'Dropped by first ISP gateway router',
            'Solution': 'STUN server or SBC/RTPProxy rewriting SDP connection address',
          },
        },
        highlightColor: 'rose',
      },
    ],
  },
];

// ----------------- SIP HEADERS REFERENCE -----------------

export const SIP_HEADERS_DICTIONARY: SipHeaderInfo[] = [
  {
    name: 'Via',
    shortName: 'v',
    purpose: 'Records the transport protocol (UDP/TCP/TLS) and the route taken by the request so far, including branch parameter for transaction ID.',
    example: 'Via: SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bK776asdhds;rport',
    commonBugs: 'Missing `rport` parameter causes response packets to fail when client is behind NAT.',
    category: 'Routing',
  },
  {
    name: 'From',
    shortName: 'f',
    purpose: 'Identifies the logical initiator of the request (SIP URI and display name), accompanied by a unique pseudo-random tag.',
    example: 'From: "Alice Smith" <sip:alice@atlanta.com>;tag=1928301774',
    commonBugs: 'Omitting the `tag` parameter violates RFC 3261 and prevents valid dialog creation.',
    category: 'Identity',
  },
  {
    name: 'To',
    shortName: 't',
    purpose: 'Identifies the intended recipient of the request. Callee adds their own `tag` in the response to establish dialog.',
    example: 'To: "Bob Jones" <sip:bob@biloxi.com>;tag=a6c85cf',
    commonBugs: 'Adding a tag in initial INVITE request before callee responds.',
    category: 'Identity',
  },
  {
    name: 'Call-ID',
    shortName: 'i',
    purpose: 'Globally unique identifier for the entire call session/dialog across all transactions.',
    example: 'Call-ID: a84b4c76e66710@pc33.atlanta.com',
    commonBugs: 'Generating non-unique Call-IDs leads to call collisions and ghost hang-ups in high-traffic PBXs.',
    category: 'Session',
  },
  {
    name: 'CSeq',
    shortName: '',
    purpose: 'Command Sequence number and method name. Increments by 1 for each new in-dialog transaction.',
    example: 'CSeq: 314159 INVITE',
    commonBugs: 'Not matching CSeq method with the request method (e.g. ACK CSeq must carry ACK, BYE carries BYE).',
    category: 'Session',
  },
  {
    name: 'Contact',
    shortName: 'm',
    purpose: 'The direct IP and port where future requests inside this dialog should be sent directly.',
    example: 'Contact: <sip:alice@192.168.1.100:5060;transport=udp>',
    commonBugs: 'Advertising a private IP behind NAT leads to severed mid-call requests like BYE or re-INVITE.',
    category: 'Routing',
  },
  {
    name: 'Content-Type',
    shortName: 'c',
    purpose: 'Specifies the media type of the message body (usually `application/sdp` for VoIP audio/video negotiation).',
    example: 'Content-Type: application/sdp',
    commonBugs: 'Specifying wrong MIME type causes endpoints to reject the media payload.',
    category: 'Media',
  },
  {
    name: 'Content-Length',
    shortName: 'l',
    purpose: 'Exact byte count of the message payload (SDP) following the empty CRLF line.',
    example: 'Content-Length: 142',
    commonBugs: 'Incorrect Content-Length in TCP/TLS streams causes framing parse errors and stuck sockets.',
    category: 'Session',
  },
  {
    name: 'Max-Forwards',
    shortName: '',
    purpose: 'Hop count limit (standard default 70) decremented by every proxy to prevent infinite routing loops.',
    example: 'Max-Forwards: 70',
    commonBugs: 'Reaching 0 causes proxy to return `483 Too Many Hops`.',
    category: 'Routing',
  },
  {
    name: 'User-Agent',
    shortName: '',
    purpose: 'Software and hardware model identification of the phone or PBX.',
    example: 'User-Agent: Asterisk PBX 20.4.0 / PolycomVVX450-5.9.6',
    commonBugs: 'Leaking excessive version info can assist malicious attackers scanning for known vulnerabilities.',
    category: 'Identity',
  },
  {
    name: 'Allow',
    shortName: '',
    purpose: 'Lists all SIP methods supported by the sender (e.g. INVITE, ACK, CANCEL, OPTIONS, BYE, REFER, NOTIFY, INFO).',
    example: 'Allow: INVITE, ACK, CANCEL, OPTIONS, BYE, REFER, NOTIFY',
    commonBugs: 'Omitting REFER breaks blind and attended call transfer capabilities.',
    category: 'Session',
  },
];

// ----------------- SDP REFERENCE -----------------

export const SDP_DICTIONARY: SdpLineInfo[] = [
  {
    prefix: 'v=',
    name: 'Protocol Version',
    meaning: 'SDP version specification (always 0 in current RFC 4566).',
    example: 'v=0',
    voipImpact: 'Mandatory first line. Endpoints will discard SDP if absent.',
  },
  {
    prefix: 'o=',
    name: 'Originator / Session Owner',
    meaning: 'Username, session ID, session version, network type (IN), address type (IP4/IP6), and creator address.',
    example: 'o=alice 2890844526 2890844526 IN IP4 192.168.1.100',
    voipImpact: 'Incrementing the session version number signals a mid-call modification (re-INVITE hold/unhold).',
  },
  {
    prefix: 'c=',
    name: 'Connection Information',
    meaning: 'Specifies the network type, address type, and remote IP address where RTP media must be transmitted.',
    example: 'c=IN IP4 198.51.100.12',
    voipImpact: 'Crucial! If this contains 0.0.0.0, the call is placed on hold (MOH). If private IP, causes one-way audio.',
  },
  {
    prefix: 'm=',
    name: 'Media Announcements',
    meaning: 'Media type (audio/video), listening port number, transport protocol (RTP/AVP), and codec payload types.',
    example: 'm=audio 5004 RTP/AVP 0 8 101',
    voipImpact: 'Defines the local UDP port that will receive RTP packets. Port 0 means media rejected.',
  },
  {
    prefix: 'a=rtpmap:',
    name: 'Codec Mapping Attribute',
    meaning: 'Maps dynamic/static payload numbers to codec names and clock sample rates.',
    example: 'a=rtpmap:0 PCMU/8000\na=rtpmap:101 telephone-event/8000',
    voipImpact: 'Codecs must match between caller and callee. telephone-event/8000 enables in-band RFC 2833 DTMF tones.',
  },
  {
    prefix: 'a=sendrecv / a=sendonly',
    name: 'Directionality Attribute',
    meaning: 'Sets audio flow direction: sendrecv (normal call), sendonly (call on hold / music-on-hold), recvonly, or inactive.',
    example: 'a=sendrecv',
    voipImpact: 'Putting a caller on hold switches this attribute to a=sendonly or a=inactive.',
  },
];

// ----------------- RESPONSE CODES -----------------

export const RESPONSE_CODES: ResponseCode[] = [
  // 1xx
  {
    code: 100,
    title: 'Trying',
    category: '1xx',
    meaning: 'Intermediate proxy received request and is working on forwarding. Client should stop retransmissions.',
    realWorldAnalogy: '"Order received! The chef is checking the kitchen pantry."',
    troubleshootingTip: 'Hop-by-hop only. Not forwarded across multiple proxies.',
  },
  {
    code: 180,
    title: 'Ringing',
    category: '1xx',
    meaning: 'Destination phone has received INVITE and is actively ringing. Caller plays local ringback.',
    realWorldAnalogy: '"The phone on Bob desk is physically chiming right now."',
    troubleshootingTip: 'If caller hears silence instead of ringing, phone may require 183 Session Progress for early media.',
  },
  {
    code: 183,
    title: 'Session Progress',
    category: '1xx',
    meaning: 'Contains early SDP media parameters so caller can hear carrier announcements ("The number is invalid").',
    realWorldAnalogy: '"Early audio channel opened before pickup to play telecom voice prompts."',
    troubleshootingTip: 'Critical for PSTN gateway interop where early audio announcements occur before billing starts.',
  },
  // 2xx
  {
    code: 200,
    title: 'OK',
    category: '2xx',
    meaning: 'Request was successful. For INVITE, callee has picked up the handset and provided their SDP answer.',
    realWorldAnalogy: '"Handshake agreed! Picked up the receiver. Start talking!"',
    troubleshootingTip: 'Caller must immediately reply with an ACK to complete the 3-way handshake.',
  },
  {
    code: 202,
    title: 'Accepted',
    category: '2xx',
    meaning: 'Used for asynchronous requests like REFER (call transfer). The server has accepted the instruction to transfer.',
    realWorldAnalogy: '"Transfer ticket queued. We will notify you once transfer connects."',
    troubleshootingTip: 'Followed by NOTIFY messages keeping the transferor informed of transfer progress.',
  },
  // 3xx
  {
    code: 302,
    title: 'Moved Temporarily',
    category: '3xx',
    meaning: 'Call forwarding instruction. Contact header points to the forward URI (e.g. mobile number).',
    realWorldAnalogy: '"I am out of the office today; reach me at my mobile number."',
    troubleshootingTip: 'Inspect the Contact header to see where the call is being redirected.',
  },
  // 4xx
  {
    code: 401,
    title: 'Unauthorized',
    category: '4xx',
    meaning: 'Server requires client credentials. Returns WWW-Authenticate challenge with nonce.',
    realWorldAnalogy: '"Bouncer asks for your security badge before letting you in."',
    troubleshootingTip: 'Normal in SIP registration flow. If it loops endlessly, check secret password or MD5 hashing.',
  },
  {
    code: 403,
    title: 'Forbidden',
    category: '4xx',
    meaning: 'Server understood request and credentials, but user is not permitted (e.g. international dialing blocked).',
    realWorldAnalogy: '"You have a valid badge, but this executive door is locked for your rank."',
    troubleshootingTip: 'Check PBX outbound dial permissions (LCR / Class of Service).',
  },
  {
    code: 404,
    title: 'Not Found',
    category: '4xx',
    meaning: 'Requested SIP URI extension or phone number does not exist on this server.',
    realWorldAnalogy: '"No one with that extension works in this office building."',
    troubleshootingTip: 'Verify dialed digits, dialplan prefixes, or missing outbound route in Asterisk/FreePBX.',
  },
  {
    code: 407,
    title: 'Proxy Authentication Required',
    category: '4xx',
    meaning: 'Similar to 401, but issued by an intermediate SIP Proxy instead of the final registrar/registrar server.',
    realWorldAnalogy: '"Highway toll booth requires toll token before letting your car pass."',
    troubleshootingTip: 'UAC must resend with Proxy-Authorization header containing the calculated digest hash.',
  },
  {
    code: 408,
    title: 'Request Timeout',
    category: '4xx',
    meaning: 'Server could not produce a response before its timer expired (no answer, or destination offline).',
    realWorldAnalogy: '"Knocked on the door for 30 seconds; nobody ever responded."',
    troubleshootingTip: 'Commonly caused by network dropouts or UDP packets blocked by strict firewalls.',
  },
  {
    code: 486,
    title: 'Busy Here',
    category: '4xx',
    meaning: 'Callee is currently occupied on another call or has enabled Do Not Disturb (DND).',
    realWorldAnalogy: '"Callee line is engaged with another customer."',
    troubleshootingTip: 'Triggers fast busy tone or automatic rollover to voicemail box.',
  },
  {
    code: 487,
    title: 'Request Terminated',
    category: '4xx',
    meaning: 'The pending INVITE was terminated by a CANCEL request from the caller who hung up before answer.',
    realWorldAnalogy: '"Caller got tired of waiting for pickup and put down the phone."',
    troubleshootingTip: 'Normal response following an accepted CANCEL.',
  },
  {
    code: 488,
    title: 'Not Acceptable Here',
    category: '4xx',
    meaning: 'Media negotiation failure! No overlapping audio codecs found between caller and callee.',
    realWorldAnalogy: '"Caller speaks only French, callee speaks only Japanese, and no translator is present."',
    troubleshootingTip: 'Inspect SDP offer and answer. Ensure both support a common codec (e.g. PCMU / G.711 or Opus).',
  },
  // 5xx
  {
    code: 500,
    title: 'Server Internal Error',
    category: '5xx',
    meaning: 'PBX or SIP proxy suffered a crash or unexpected internal exception.',
    realWorldAnalogy: '"The central PBX computer experienced a system panic."',
    troubleshootingTip: 'Check PBX crash dumps, core logs, or out-of-memory errors on server.',
  },
  {
    code: 503,
    title: 'Service Unavailable',
    category: '5xx',
    meaning: 'Server is temporarily overloaded, trunk channels exhausted, or upstream gateway disconnected.',
    realWorldAnalogy: '"All outbound telephone trunk lines are completely congested."',
    troubleshootingTip: 'Check SIP trunk carrier capacity limits and Retry-After header.',
  },
  // 6xx
  {
    code: 603,
    title: 'Decline',
    category: '6xx',
    meaning: 'Callee deliberately pressed "Decline" or "Reject Call" button.',
    realWorldAnalogy: '"User looked at Caller ID and swiped red reject button."',
    troubleshootingTip: 'Different from 486 Busy: 603 means user explicitly refused to speak with this caller.',
  },
];

// ----------------- TROUBLESHOOTING QUIZZES -----------------

export const TROUBLESHOOTING_QUIZZES: TroubleshootingQuiz[] = [
  {
    id: 'q1',
    title: 'The Silent Partner: One-Way Audio',
    difficulty: 'Beginner',
    symptom: 'Customer reports that when calling Bob, Alice can hear Bob perfectly, but Bob cannot hear a single word from Alice.',
    packetTrace: [
      { time: '0.000', source: 'Alice (192.168.1.45)', dest: 'PBX (203.0.113.1)', protocol: 'SIP', info: 'INVITE with SDP: c=IN IP4 192.168.1.45, m=audio 10022' },
      { time: '0.010', source: 'PBX (203.0.113.1)', dest: 'Alice (192.168.1.45)', protocol: 'SIP', info: '100 Trying' },
      { time: '0.040', source: 'PBX (203.0.113.1)', dest: 'Bob (198.51.100.5)', protocol: 'SIP', info: 'INVITE with SDP: c=IN IP4 192.168.1.45' },
      { time: '0.120', source: 'Bob (198.51.100.5)', dest: 'PBX (203.0.113.1)', protocol: 'SIP', info: '200 OK with SDP: c=IN IP4 198.51.100.5, m=audio 16400' },
      { time: '0.125', source: 'Alice (192.168.1.45)', dest: 'Bob (198.51.100.5:16400)', protocol: 'RTP', info: 'Voice stream active (Alice -> Bob)' },
      { time: '0.130', source: 'Bob (198.51.100.5)', dest: '192.168.1.45:10022', protocol: 'RTP', info: 'Destination Unreachable (ICMP dropped by router)' },
    ],
    question: 'Why can Alice hear Bob, but Bob hears nothing from Alice?',
    options: [
      'Alice microphone is broken or hardware muted.',
      'Alice SDP c= line advertised her private RFC 1918 LAN IP, so Bob RTP packets are sent to an unroutable address.',
      'Bob phone does not support the G.711 codec.',
      'The SIP Proxy failed to forward the ACK packet.',
    ],
    correctIndex: 1,
    explanation: 'Alice router performed NAT on the IP packet, but the internal SDP text still said `c=IN IP4 192.168.1.45`. Bob phone attempted to deliver audio packets directly to 192.168.1.45 across the public internet, which internet routers immediately discard. Meanwhile, Bob advertised a public IP (198.51.100.5), so Alice outbound audio worked fine!',
    fixGuide: 'Configure STUN/ICE on Alice softphone so it discovers its public WAN IP before crafting SDP, or enable RTP proxying / SBC media proxying (`nat=force_rport,comedia`) on the PBX.',
  },
  {
    id: 'q2',
    title: 'The Loop of Endless 401s',
    difficulty: 'Intermediate',
    symptom: 'A newly installed SIP desk phone attempts to register every 10 seconds. The display says "Registration Failed: Auth Error".',
    packetTrace: [
      { time: '0.000', source: 'DeskPhone (10.0.0.15)', dest: 'Registrar (10.0.0.1)', protocol: 'SIP', info: 'REGISTER sip:company.pbx (No auth header)' },
      { time: '0.005', source: 'Registrar (10.0.0.1)', dest: 'DeskPhone (10.0.0.15)', protocol: 'SIP', info: '401 Unauthorized (nonce="4f29a00b", realm="company.pbx")' },
      { time: '0.010', source: 'DeskPhone (10.0.0.15)', dest: 'Registrar (10.0.0.1)', protocol: 'SIP', info: 'REGISTER sip:company.pbx (Authorization: response="9a00b14c...")' },
      { time: '0.015', source: 'Registrar (10.0.0.1)', dest: 'DeskPhone (10.0.0.15)', protocol: 'SIP', info: '401 Unauthorized (nonce="78b31a22", realm="company.pbx")' },
    ],
    question: 'What is the most likely root cause for the server sending another 401 Unauthorized instead of 200 OK?',
    options: [
      'SIP over UDP is unreliable and packet loss occurred.',
      'The phone shared secret password or authentication username does not match what is stored in the PBX extension database.',
      'The SIP registrar only supports TCP port 5060.',
      'The desk phone needs an RTP media socket opened first.',
    ],
    correctIndex: 1,
    explanation: 'SIP Digest Authentication works by hashing the username, realm, secret password, and nonce. If the resulting hash computed by the phone does not equal the hash calculated by the registrar, the registrar issues another 401 Unauthorized challenge with a fresh nonce.',
    fixGuide: 'Check the PBX extension credentials. Ensure the SIP Secret, Auth Username, and Realm on the phone configuration match the PBX user record exactly.',
  },
  {
    id: 'q3',
    title: 'The Codec Deadlock (SIP 488)',
    difficulty: 'Intermediate',
    symptom: 'When dialing extension 205, the caller instantly hears three fast beeps and the screen flashes "SIP 488 Not Acceptable Here".',
    packetTrace: [
      { time: '0.000', source: 'Caller (Phone A)', dest: 'PBX', protocol: 'SIP', info: 'INVITE (SDP Offer: m=audio 5004 RTP/AVP 18 9 -> G.729, G.722)' },
      { time: '0.012', source: 'PBX', dest: 'Caller (Phone A)', protocol: 'SIP', info: '100 Trying' },
      { time: '0.020', source: 'PBX', dest: 'Recipient (Phone B)', protocol: 'SIP', info: 'INVITE (SDP Offer: m=audio 5004 RTP/AVP 18 9)' },
      { time: '0.035', source: 'Recipient (Phone B)', dest: 'PBX', protocol: 'SIP', info: '488 Not Acceptable Here (SDP Supported: PCMU 0, PCMA 8 only)' },
      { time: '0.040', source: 'PBX', dest: 'Caller (Phone A)', protocol: 'SIP', info: '488 Not Acceptable Here' },
    ],
    question: 'What caused the call to fail with status 488?',
    options: [
      'The caller dialed a non-existent phone number.',
      'There was no common audio codec mutually supported by both endpoints.',
      'The SIP Max-Forwards counter reached zero.',
      'Bob rejected the call by pressing Do Not Disturb.',
    ],
    correctIndex: 1,
    explanation: 'Phone A offered G.729 and G.722. However, Phone B only supports G.711 (PCMU/PCMA). Because neither endpoint shares a common audio codec and the PBX did not have a transcoding engine enabled, Phone B replied with 488 Not Acceptable Here.',
    fixGuide: 'Enable G.711 (PCMU / Payload 0) on Phone A, or enable server-side audio transcoding on the PBX so it can translate between G.729 and G.711 in real-time.',
  },
  {
    id: 'q4',
    title: 'Protocol Roles: Signaling vs Media',
    difficulty: 'Beginner',
    symptom: 'A student claims: "SIP carries the actual human voice waves across the internet, while RTP only handles hang up signals."',
    packetTrace: [
      { time: '0.000', source: 'UAC', dest: 'Proxy', protocol: 'SIP (UDP 5060)', info: 'INVITE (Signaling session parameters)' },
      { time: '0.100', source: 'UAC', dest: 'UAS', protocol: 'RTP (UDP 10000-20000)', info: 'Voice stream (64 kbps audio samples)' },
      { time: '10.00', source: 'UAC', dest: 'UAS', protocol: 'RTCP (UDP 10001)', info: 'Sender/Receiver Quality Reports (Jitter, Packet Loss)' },
    ],
    question: 'Which statement accurately describes the division of responsibilities in VoIP?',
    options: [
      'SIP only signals call setup/tear down; SDP negotiates media parameters; RTP transports digitized audio packets.',
      'SIP carries audio; HTTP sets up the call; RTP registers the phone.',
      'RTP initiates the session; SIP handles audio compression.',
      'SIP and RTP are interchangeable synonyms for the exact same protocol.',
    ],
    correctIndex: 0,
    explanation: 'SIP (Session Initiation Protocol) is strictly a signaling protocol (like an operator establishing connections). SDP (Session Description Protocol) describes what audio/video format to use. RTP (Real-time Transport Protocol) carries the digitized audio payload.',
    fixGuide: 'Remember the mnemonic: "SIP dials the call, SDP agrees the format, RTP speaks the words, and RTCP reports the quality!"',
  },
];
