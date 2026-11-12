// Neutral facts appear on everyone. Herrings LOOK suspicious to a lazy profiler
// but say nothing about espionage — flagging a legit buyer for one costs extra.

export const NEUTRAL_FACTS = Object.freeze([
  { text: { ru: 'Кота зовут Kernel', en: 'Has a cat named Kernel' } },
  { text: { ru: 'Бегает марафоны. Медленно', en: 'Runs marathons. Slowly' } },
  { text: { ru: 'ЦОД в Айове, рядом с кукурузным полем', en: 'Data center in Iowa, next to a cornfield' } },
  { text: { ru: 'Хочет обучить модель писать хокку о сыре', en: 'Wants to train a model that writes haiku about cheese' } },
  { text: { ru: 'Оплатил(а) переводом, вовремя, с вежливым письмом', en: 'Paid by bank transfer, on time, with a polite email' } },
  { text: { ru: 'В счёте опечатка. Извинился(ась) дважды', en: 'Typo in the invoice. Apologized twice' } },
  { text: { ru: 'Пришёл(ла) к вам в офис ради бесплатных снеков', en: 'Visited your HQ mostly for the free snacks' } },
  { text: { ru: 'Все контракты набирает в Comic Sans', en: 'Writes every contract in Comic Sans' } },
  { text: { ru: 'Слишком много комнатных растений', en: 'Owns far too many houseplants' } },
  { text: { ru: 'Ведёт подкаст, который никто не слушает', en: 'Hosts a podcast nobody listens to' } },
  { text: { ru: 'Дважды попросил(а) расширенную гарантию', en: 'Asked for the extended warranty. Twice' } },
  { text: { ru: 'Рендерит мультик про грустный тостер', en: 'Rendering an animated film about a sad toaster' } },
  { text: { ru: '40 сотрудников и стол для пинг-понга', en: '40 employees and a ping-pong table' } },
  { text: { ru: 'Начальник охраны — офисный пёс', en: 'Head of security is the office dog' } },
  { text: { ru: 'Делает прогноз погоды для фермеров', en: 'Building a weather model for farmers' } },
  { text: { ru: 'Аккуратно подписал(а) форму экспортного контроля синей ручкой', en: 'Signed the export compliance form neatly, in blue ink' } },
  { text: { ru: 'У ЦОДа настоящий счёт за свет. Огромный', en: 'Their data center has a real, enormous power bill' } },
  { text: { ru: 'Прислал(а) фото серверной. Там есть пыль и инженер', en: 'Sent a photo of the server room. It has dust and an engineer' } },
  { text: { ru: 'Хочет 2 GPU «для работы» (для игр)', en: 'Wants 2 GPUs "for work" (for games)' } },
  { text: { ru: 'Читает лицензионное соглашение целиком. Да, правда', en: 'Actually reads the whole license agreement' } },
])

export const HERRINGS = Object.freeze([
  {
    text: { ru: 'Свободно говорит на китайском', en: 'Speaks fluent Mandarin' },
    reveal: { ru: 'Знание языка — не шпионаж. HR разочарован.', en: "Speaking a language isn't espionage. HR is disappointed." },
  },
  {
    text: { ru: 'Бабушка с дедушкой из Шанхая', en: 'Grandparents are from Shanghai' },
    reveal: { ru: 'Профайлинг — это не контрразведка. Минус репутация.', en: "Profiling isn't counterintelligence. Reputation down." },
  },
  {
    text: { ru: 'Ходит в плаще и тёмных очках. В помещении', en: 'Wears a trench coat and sunglasses. Indoors' },
    reveal: { ru: 'Это называется «стиль». Человек — дизайнер.', en: "It's called fashion. They're a designer." },
  },
  {
    text: { ru: 'Кота зовут Пельмень', en: 'Has a cat named Dumpling' },
    reveal: { ru: 'Кот не шпион. Наверное.', en: 'The cat is not a spy. Probably.' },
  },
  {
    text: { ru: 'Был(а) на Великой стене в 2019-м', en: 'Visited the Great Wall in 2019' },
    reveal: { ru: 'Как и 10 миллионов туристов.', en: 'So did 10 million other tourists.' },
  },
  {
    text: { ru: 'Носит кожанку, совсем как CEO', en: 'Wears a leather jacket, just like the CEO' },
    reveal: { ru: 'Не каждая кожанка — заговор.', en: 'Not every leather jacket is a conspiracy.' },
  },
  {
    text: { ru: 'Заказывает очень много GPU (у них реально большое облако)', en: 'Orders a LOT of GPUs (they run an actual big cloud)' },
    reveal: { ru: 'Крупный клиент ≠ плохой клиент.', en: 'Big customer ≠ bad customer.' },
  },
  {
    text: { ru: 'Читает шпионские романы в метро', en: 'Reads spy novels on the subway' },
    reveal: { ru: 'Читать ле Карре — не преступление.', en: 'Reading le Carré is not a crime.' },
  },
  {
    text: { ru: 'Не любит фотографироваться', en: 'Hates having their photo taken' },
    reveal: { ru: 'Некоторые люди просто стесняются.', en: 'Some people are just shy.' },
  },
  {
    text: { ru: 'Офис в Сингапуре', en: 'Has an office in Singapore' },
    reveal: { ru: 'В Сингапуре 6 миллионов людей. Не все возят чипы.', en: "6 million people live in Singapore. Not all of them move chips." },
  },
])
