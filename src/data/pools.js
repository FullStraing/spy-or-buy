// Shared pools for spies AND honest buyers, so names, faces, companies and
// cities carry zero signal. Only behaviour gives a spy away.

export const FIRST_NAMES = Object.freeze([
  'Alex', 'Morgan', 'Kai', 'Dana', 'Viktor', 'Priya', 'Liam', 'Mei', 'Omar', 'Sofia',
  'Jun', 'Hana', 'Diego', 'Ingrid', 'Tomás', 'Aisha', 'Ravi', 'Yuki', 'Noah', 'Elena',
  'Lucas', 'Fatima', 'Sven', 'Olga', 'Kwame', 'Lena', 'Mateo', 'Zara', 'Ivan', 'Chloe',
])

export const LAST_NAMES = Object.freeze([
  'Petrov', 'Smith', 'Tan', 'Kowalski', 'Okafor', 'Nakamura', 'Rossi', 'Lee', 'Haddad', 'Müller',
  'Silva', 'Wong', 'Novak', 'Ahmed', 'Johansson', 'Park', 'Garcia', 'Ivanova', 'Dubois', 'Kim',
  'Nguyen', 'Schmidt', 'Costa', 'Singh', 'Brown',
])

export const AVATARS = Object.freeze([
  '🧑‍💼', '👩‍💼', '👨‍💼', '🧑‍💻', '👩‍💻', '👨‍💻', '🧑‍🔬', '👩‍🔬', '👨‍🔬', '🧔', '👱', '🧑‍🎨', '👩‍🚀', '🧑‍🏫', '👵', '🧑‍🍳',
])

export const COMPANIES = Object.freeze([
  'Byte Me Inc.', 'Tensor & Sons', 'Quantum Llama', 'DeepThought Ltd', 'Overfit Analytics',
  'GigaBrain Compute', 'Hallucination Labs', 'Latency Ventures', 'Gradient Descent Partners',
  'Sparse Matrix Holdings', 'Prompt & Circumstance', 'Big Data Small Office', 'Cloudy McCloudface',
  'Totally Normal Compute', 'Synergy Synergy Pte', 'Moonshot Mainframes',
])

export const HQS = Object.freeze([
  { ru: 'Сингапур', en: 'Singapore' },
  { ru: 'Куала-Лумпур', en: 'Kuala Lumpur' },
  { ru: 'Бангкок', en: 'Bangkok' },
  { ru: 'Остин', en: 'Austin' },
  { ru: 'Берлин', en: 'Berlin' },
  { ru: 'Торонто', en: 'Toronto' },
  { ru: 'Сеул', en: 'Seoul' },
  { ru: 'Дубай', en: 'Dubai' },
  { ru: 'Варшава', en: 'Warsaw' },
  { ru: 'Сан-Паулу', en: 'São Paulo' },
  { ru: 'Алматы', en: 'Almaty' },
  { ru: 'Тбилиси', en: 'Tbilisi' },
  { ru: 'Тайбэй', en: 'Taipei' },
])

export const ORDERS = Object.freeze([
  { ru: '8 × GPU', en: '8 × GPU' },
  { ru: '16 × GPU', en: '16 × GPU' },
  { ru: '512 × GPU', en: '512 × GPU' },
  { ru: '2 048 × GPU + гарантия', en: '2,048 × GPU + warranty' },
  { ru: '4 096 × GPU', en: '4,096 × GPU' },
  { ru: '1 × GPU (честно, для игр)', en: '1 × GPU (for gaming, honest)' },
  { ru: '256 серверов', en: '256 servers' },
  { ru: '64 сервера, срочно', en: '64 servers, urgent' },
])

export const CEO_TEXTS = Object.freeze([
  { ru: '📱 CEO: «Одобри. Это совершенно нормальное и обычное знакомство»', en: '📱 CEO: "Approve it. This is a completely normal and not unusual relationship"' },
  { ru: '📱 CEO: «Мой близкий… партнёр. По бизнесу. Одобряй»', en: '📱 CEO: "A close... partner. Business partner. Approve"' },
  { ru: '📱 CEO: «Не задавай вопросов, я уже купил им кожанку»', en: '📱 CEO: "No questions please, I already bought them a jacket"' },
  { ru: '📱 CEO: «Совет директоров в курсе. Ну, будет в курсе»', en: '📱 CEO: "The board knows. Well, will know"' },
  { ru: '📱 CEO: «Это для моей семьи. Рабочей. Одной из»', en: '📱 CEO: "It\'s for my family. Work family. One of them"' },
])
