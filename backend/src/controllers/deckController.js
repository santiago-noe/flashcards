const Deck = require('../models/Deck');

// GET all decks (summary, without full cards array)
exports.getAllDecks = async (req, res) => {
  try {
    const decks = await Deck.find({ isPublished: true })
      .select('-cards.hint')
      .sort({ updatedAt: -1 });

    const summaries = decks.map(d => ({
      _id: d._id,
      title: d.title,
      description: d.description,
      course: d.course,
      category: d.category,
      icon: d.icon,
      color: d.color,
      cardCount: d.cardCount,
      masteryPercent: d.masteryPercent,
      totalStudySessions: d.totalStudySessions,
      lastStudied: d.lastStudied,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));

    res.json(summaries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET single deck by ID (full cards)
exports.getDeckById = async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id);
    if (!deck) return res.status(404).json({ error: 'Mazo no encontrado' });
    res.json(deck);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create deck
exports.createDeck = async (req, res) => {
  try {
    const deck = new Deck(req.body);
    await deck.save();
    res.status(201).json(deck);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT update deck metadata
exports.updateDeck = async (req, res) => {
  try {
    const deck = await Deck.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!deck) return res.status(404).json({ error: 'Mazo no encontrado' });
    res.json(deck);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE deck
exports.deleteDeck = async (req, res) => {
  try {
    const deck = await Deck.findByIdAndDelete(req.params.id);
    if (!deck) return res.status(404).json({ error: 'Mazo no encontrado' });
    res.json({ message: 'Mazo eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST record study session result
exports.recordStudySession = async (req, res) => {
  try {
    const { results } = req.body; // [{ cardId, correct: bool }]
    const deck = await Deck.findById(req.params.id);
    if (!deck) return res.status(404).json({ error: 'Mazo no encontrado' });

    for (const r of results) {
      const card = deck.cards.id(r.cardId);
      if (card) {
        card.timesStudied += 1;
        if (r.correct) card.timesCorrect += 1;
        card.lastStudied = new Date();
      }
    }

    deck.totalStudySessions += 1;
    deck.lastStudied = new Date();
    await deck.save();

    res.json({ message: 'Sesión registrada', masteryPercent: deck.masteryPercent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST seed sample decks for Redes de Datos
exports.seedDecks = async (req, res) => {
  try {
    const existingCount = await Deck.countDocuments();
    if (existingCount > 0) {
      return res.json({ message: 'Ya existen mazos. Omitiendo seed.' });
    }

    const sampleDecks = [
      {
        title: 'Modelo OSI',
        description: 'Las 7 capas del modelo de referencia OSI, sus funciones y protocolos asociados.',
        course: 'REDES DE DATOS',
        category: 'Fundamentos',
        icon: '🏗️',
        color: '#6366f1',
        cards: [
          { front: '¿Cuántas capas tiene el modelo OSI?', back: '7 capas: Física, Enlace de Datos, Red, Transporte, Sesión, Presentación y Aplicación.', difficulty: 'easy' },
          { front: '¿Qué función cumple la Capa Física (Capa 1)?', back: 'Transmite bits en bruto a través del medio físico. Define voltajes, frecuencias, tipos de cable y conectores.', difficulty: 'medium' },
          { front: '¿Qué función cumple la Capa de Enlace de Datos (Capa 2)?', back: 'Proporciona transferencia de datos libre de errores entre nodos adyacentes. Maneja direccionamiento MAC, control de acceso al medio y detección de errores (CRC).', difficulty: 'medium' },
          { front: '¿Qué función cumple la Capa de Red (Capa 3)?', back: 'Enrutamiento de paquetes entre redes diferentes. Maneja direccionamiento lógico (IP), selección de rutas y fragmentación.', difficulty: 'medium' },
          { front: '¿Qué función cumple la Capa de Transporte (Capa 4)?', back: 'Entrega confiable de datos end-to-end. Control de flujo, segmentación, y protocolos como TCP (confiable) y UDP (no confiable).', difficulty: 'medium' },
          { front: '¿Qué es la PDU de la Capa 2?', back: 'Trama (Frame). Contiene header con MAC origen/destino, datos y trailer con FCS.', hint: 'Piensa en la dirección física', difficulty: 'hard' },
          { front: '¿Qué es encapsulación en el modelo OSI?', back: 'Proceso donde cada capa agrega su propia cabecera (y a veces trailer) a los datos recibidos de la capa superior antes de pasarlos a la capa inferior.', difficulty: 'medium' },
          { front: '¿Cuáles son las PDUs en orden desde Capa 1 a Capa 4?', back: 'Capa 1: Bits | Capa 2: Tramas (Frames) | Capa 3: Paquetes | Capa 4: Segmentos (TCP) / Datagramas (UDP)', difficulty: 'hard' },
        ],
      },
      {
        title: 'TCP/IP y Protocolos',
        description: 'Protocolo TCP/IP, sus capas, y los principales protocolos de comunicación en redes.',
        course: 'REDES DE DATOS',
        category: 'Protocolos',
        icon: '🌐',
        color: '#0ea5e9',
        cards: [
          { front: '¿Cuántas capas tiene el modelo TCP/IP?', back: '4 capas: Acceso a Red, Internet, Transporte y Aplicación.', difficulty: 'easy' },
          { front: '¿Cuál es la diferencia principal entre TCP y UDP?', back: 'TCP es orientado a conexión, confiable, con control de flujo y retransmisión. UDP es sin conexión, no confiable, más rápido y ligero.', difficulty: 'medium' },
          { front: '¿Qué es el Three-Way Handshake de TCP?', back: 'Proceso de 3 pasos para establecer conexión: 1) SYN (cliente→servidor), 2) SYN-ACK (servidor→cliente), 3) ACK (cliente→servidor).', difficulty: 'medium' },
          { front: '¿Qué puerto usa HTTP? ¿Y HTTPS?', back: 'HTTP usa el puerto 80. HTTPS usa el puerto 443.', hint: 'Puertos bien conocidos', difficulty: 'easy' },
          { front: '¿Qué es DNS y qué puerto usa?', back: 'Domain Name System - traduce nombres de dominio a direcciones IP. Usa el puerto 53 (UDP para consultas normales, TCP para transferencias de zona).', difficulty: 'medium' },
          { front: '¿Qué es ARP?', back: 'Address Resolution Protocol - resuelve direcciones IP a direcciones MAC en una red local. Opera en la Capa 2/3.', difficulty: 'medium' },
          { front: '¿Qué protocolo asigna direcciones IP automáticamente?', back: 'DHCP (Dynamic Host Configuration Protocol). Usa puertos 67 (servidor) y 68 (cliente).', difficulty: 'easy' },
          { front: '¿Qué es NAT?', back: 'Network Address Translation - traduce direcciones IP privadas a públicas y viceversa, permitiendo que múltiples dispositivos compartan una IP pública.', difficulty: 'hard' },
          { front: '¿Cuáles son los rangos de puertos?', back: 'Bien conocidos: 0-1023 | Registrados: 1024-49151 | Dinámicos/Efímeros: 49152-65535', difficulty: 'hard' },
        ],
      },
      {
        title: 'Direccionamiento IP y Subnetting',
        description: 'IPv4, IPv6, máscaras de subred, CIDR y cálculo de subredes.',
        course: 'REDES DE DATOS',
        category: 'Direccionamiento',
        icon: '🔢',
        color: '#10b981',
        cards: [
          { front: '¿Cuántos bits tiene una dirección IPv4?', back: '32 bits, divididos en 4 octetos separados por puntos (ej: 192.168.1.1).', difficulty: 'easy' },
          { front: '¿Cuáles son las clases de direcciones IPv4?', back: 'Clase A: 1.0.0.0 - 126.255.255.255 (/8)\nClase B: 128.0.0.0 - 191.255.255.255 (/16)\nClase C: 192.0.0.0 - 223.255.255.255 (/24)\nClase D: Multicast | Clase E: Experimental', difficulty: 'hard' },
          { front: '¿Cuáles son las direcciones IP privadas (RFC 1918)?', back: 'Clase A: 10.0.0.0/8\nClase B: 172.16.0.0/12\nClase C: 192.168.0.0/16', difficulty: 'medium' },
          { front: '¿Qué es CIDR?', back: 'Classless Inter-Domain Routing - sistema de direccionamiento que reemplaza el classfull usando notación /prefijo para indicar la máscara (ej: /24 = 255.255.255.0).', difficulty: 'medium' },
          { front: 'En una red /26, ¿cuántos hosts utilizables hay?', back: '62 hosts utilizables. /26 = 64 direcciones totales - 2 (red y broadcast) = 62.', hint: '2^(32-26) - 2', difficulty: 'hard' },
          { front: '¿Cuántos bits tiene una dirección IPv6?', back: '128 bits, representados en 8 grupos de 4 dígitos hexadecimales separados por dos puntos (ej: 2001:0db8::1).', difficulty: 'easy' },
          { front: '¿Qué es la máscara de subred?', back: 'Valor de 32 bits que separa la porción de red de la porción de host en una dirección IP. Los 1s indican red y los 0s indican host.', difficulty: 'medium' },
        ],
      },
      {
        title: 'Dispositivos de Red',
        description: 'Switches, routers, access points, firewalls y otros dispositivos de infraestructura.',
        course: 'REDES DE DATOS',
        category: 'Hardware',
        icon: '🔌',
        color: '#f59e0b',
        cards: [
          { front: '¿En qué capa OSI opera un Switch?', back: 'Capa 2 (Enlace de Datos). Los switches de Capa 3 también pueden enrutar paquetes.', difficulty: 'easy' },
          { front: '¿En qué capa OSI opera un Router?', back: 'Capa 3 (Red). Toma decisiones de enrutamiento basadas en direcciones IP.', difficulty: 'easy' },
          { front: '¿Cuál es la diferencia entre un Hub y un Switch?', back: 'Hub: reenvía tramas a TODOS los puertos (dominio de colisión único). Switch: reenvía tramas solo al puerto destino usando tabla MAC (separa dominios de colisión).', difficulty: 'medium' },
          { front: '¿Qué es un Firewall?', back: 'Dispositivo de seguridad que filtra tráfico de red basándose en reglas predefinidas. Puede ser hardware, software o ambos. Opera en capas 3-7.', difficulty: 'medium' },
          { front: '¿Qué es una VLAN?', back: 'Virtual LAN - segmentación lógica de una red física en múltiples dominios de broadcast independientes a nivel de Capa 2.', difficulty: 'medium' },
          { front: '¿Qué es un Access Point (AP)?', back: 'Dispositivo que permite la conexión inalámbrica de dispositivos a una red cableada. Opera en la Capa 1 y 2 según el estándar IEEE 802.11.', difficulty: 'easy' },
        ],
      },
      {
        title: 'Seguridad en Redes',
        description: 'Conceptos de ciberseguridad aplicados a redes: cifrado, autenticación, ataques y defensas.',
        course: 'REDES DE DATOS',
        category: 'Seguridad',
        icon: '🔒',
        color: '#ef4444',
        cards: [
          { front: '¿Qué es la tríada CIA en seguridad?', back: 'Confidencialidad (solo autorizados acceden), Integridad (datos no alterados), Disponibilidad (acceso cuando se necesite).', difficulty: 'easy' },
          { front: '¿Qué es un ataque Man-in-the-Middle (MitM)?', back: 'Ataque donde el adversario intercepta y potencialmente altera la comunicación entre dos partes sin que estas lo detecten.', difficulty: 'medium' },
          { front: '¿Qué diferencia hay entre cifrado simétrico y asimétrico?', back: 'Simétrico: misma clave para cifrar y descifrar (AES, DES). Asimétrico: par de claves pública/privada (RSA, ECC). Asimétrico es más lento pero resuelve la distribución de claves.', difficulty: 'hard' },
          { front: '¿Qué es WPA3?', back: 'Wi-Fi Protected Access 3 - último estándar de seguridad Wi-Fi. Usa SAE (Simultaneous Authentication of Equals) en lugar de PSK, cifrado de 192 bits en modo Enterprise.', difficulty: 'hard' },
          { front: '¿Qué es un IDS vs un IPS?', back: 'IDS (Intrusion Detection System): detecta y alerta sobre intrusiones. IPS (Intrusion Prevention System): detecta Y bloquea automáticamente las intrusiones.', difficulty: 'medium' },
          { front: '¿Qué es una VPN?', back: 'Virtual Private Network - crea un túnel cifrado sobre una red pública (Internet) para transmitir datos de forma segura. Protocolos: IPSec, OpenVPN, WireGuard.', difficulty: 'easy' },
        ],
      },
      {
        title: 'Topologías y Medios de Red',
        description: 'Topologías físicas y lógicas, tipos de cables, estándares y medios de transmisión.',
        course: 'REDES DE DATOS',
        category: 'Fundamentos',
        icon: '🕸️',
        color: '#8b5cf6',
        cards: [
          { front: '¿Cuáles son las topologías de red principales?', back: 'Bus, Estrella, Anillo, Malla (Mesh), Árbol e Híbrida. La más común actualmente es Estrella.', difficulty: 'easy' },
          { front: '¿Cuál es la diferencia entre cable UTP y STP?', back: 'UTP (Unshielded Twisted Pair): sin blindaje, más económico, susceptible a interferencia. STP (Shielded Twisted Pair): con blindaje metálico, mejor protección contra EMI.', difficulty: 'medium' },
          { front: '¿Qué categorías de cable UTP existen y sus velocidades?', back: 'Cat5e: 1 Gbps (100m) | Cat6: 1-10 Gbps (55-100m) | Cat6a: 10 Gbps (100m) | Cat7: 10 Gbps (100m, blindado) | Cat8: 25-40 Gbps (30m)', difficulty: 'hard' },
          { front: '¿Qué es fibra óptica monomodo vs multimodo?', back: 'Monomodo (SMF): un solo haz de luz, largas distancias (hasta 100km), más costoso. Multimodo (MMF): múltiples haces, cortas distancias (hasta 2km), más económico.', difficulty: 'hard' },
          { front: '¿Qué ventaja tiene la topología en malla?', back: 'Máxima redundancia: cada nodo se conecta con todos los demás. Si un enlace falla, hay rutas alternativas. Desventaja: costosa y compleja.', difficulty: 'medium' },
          { front: '¿Qué estándar define Ethernet?', back: 'IEEE 802.3. Define especificaciones para la Capa 1 y 2 de redes cableadas.', difficulty: 'easy' },
        ],
      },
    ];

    const created = await Deck.insertMany(sampleDecks);
    res.status(201).json({ message: `${created.length} mazos creados exitosamente`, count: created.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
