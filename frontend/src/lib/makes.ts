export interface MakeEntry {
  label: string
  slug: string
  models: { label: string; slug: string }[]
}

export const MAKES: MakeEntry[] = [
  {
    label: 'Alfa Romeo', slug: 'alfa-romeo',
    models: [
      { label: '147', slug: '147' }, { label: '156', slug: '156' }, { label: '159', slug: '159' },
      { label: 'Brera', slug: 'brera' }, { label: 'Giulia', slug: 'giulia' },
      { label: 'Giulietta', slug: 'giulietta' }, { label: 'MiTo', slug: 'mito' },
      { label: 'Spider', slug: 'spider' }, { label: 'Stelvio', slug: 'stelvio' }, { label: '4C', slug: '4c' },
    ],
  },
  {
    label: 'Audi', slug: 'audi',
    models: [
      { label: 'A1', slug: 'a1' }, { label: 'A2', slug: 'a2' }, { label: 'A3', slug: 'a3' },
      { label: 'A4', slug: 'a4' }, { label: 'A5', slug: 'a5' }, { label: 'A6', slug: 'a6' },
      { label: 'A7', slug: 'a7' }, { label: 'A8', slug: 'a8' },
      { label: 'Q2', slug: 'q2' }, { label: 'Q3', slug: 'q3' }, { label: 'Q5', slug: 'q5' },
      { label: 'Q7', slug: 'q7' }, { label: 'Q8', slug: 'q8' },
      { label: 'R8', slug: 'r8' }, { label: 'TT', slug: 'tt' }, { label: 'TTS', slug: 'tts' }, { label: 'TTRS', slug: 'ttrs' },
      { label: 'S3', slug: 's3' }, { label: 'S4', slug: 's4' }, { label: 'S5', slug: 's5' }, { label: 'S6', slug: 's6' },
      { label: 'RS3', slug: 'rs3' }, { label: 'RS4', slug: 'rs4' }, { label: 'RS5', slug: 'rs5' }, { label: 'RS6', slug: 'rs6' },
      { label: 'e-tron', slug: 'e-tron' },
    ],
  },
  {
    label: 'BMW', slug: 'bmw',
    models: [
      { label: '1 Series', slug: '1er' }, { label: '2 Series', slug: '2er' },
      { label: '3 Series', slug: '3er' }, { label: '4 Series', slug: '4er' },
      { label: '5 Series', slug: '5er' }, { label: '6 Series', slug: '6er' },
      { label: '7 Series', slug: '7er' }, { label: '8 Series', slug: '8er' },
      { label: 'X1', slug: 'x1' }, { label: 'X2', slug: 'x2' }, { label: 'X3', slug: 'x3' },
      { label: 'X4', slug: 'x4' }, { label: 'X5', slug: 'x5' }, { label: 'X6', slug: 'x6' },
      { label: 'Z3', slug: 'z3' }, { label: 'Z4', slug: 'z4' },
      { label: 'M2', slug: 'm2' }, { label: 'M3', slug: 'm3' }, { label: 'M4', slug: 'm4' }, { label: 'M5', slug: 'm5' },
      { label: 'i3', slug: 'i3' }, { label: 'i4', slug: 'i4' }, { label: 'i8', slug: 'i8' },
    ],
  },
  {
    label: 'Citroën', slug: 'citroen',
    models: [
      { label: 'C1', slug: 'c1' }, { label: 'C2', slug: 'c2' }, { label: 'C3', slug: 'c3' },
      { label: 'C3 Aircross', slug: 'c3-aircross' }, { label: 'C4', slug: 'c4' },
      { label: 'C4 Cactus', slug: 'c4-cactus' }, { label: 'C5', slug: 'c5' },
      { label: 'C5 Aircross', slug: 'c5-aircross' }, { label: 'C6', slug: 'c6' },
      { label: 'DS3', slug: 'ds3' }, { label: 'DS4', slug: 'ds4' }, { label: 'DS5', slug: 'ds5' },
    ],
  },
  {
    label: 'Cupra', slug: 'cupra',
    models: [
      { label: 'Ateca', slug: 'ateca' }, { label: 'Born', slug: 'born' },
      { label: 'Formentor', slug: 'formentor' }, { label: 'Leon', slug: 'leon' },
    ],
  },
  {
    label: 'Dacia', slug: 'dacia',
    models: [
      { label: 'Duster', slug: 'duster' }, { label: 'Logan', slug: 'logan' },
      { label: 'Sandero', slug: 'sandero' }, { label: 'Spring', slug: 'spring' },
      { label: 'Jogger', slug: 'jogger' },
    ],
  },
  {
    label: 'Fiat', slug: 'fiat',
    models: [
      { label: '500', slug: '500' }, { label: '500C', slug: '500c' }, { label: '500X', slug: '500x' },
      { label: '124 Spider', slug: '124-spider' }, { label: 'Bravo', slug: 'bravo' },
      { label: 'Panda', slug: 'panda' }, { label: 'Punto', slug: 'punto' }, { label: 'Tipo', slug: 'tipo' },
    ],
  },
  {
    label: 'Ford', slug: 'ford',
    models: [
      { label: 'B-Max', slug: 'b-max' }, { label: 'EcoSport', slug: 'ecosport' },
      { label: 'Edge', slug: 'edge' }, { label: 'Fiesta', slug: 'fiesta' },
      { label: 'Focus', slug: 'focus' }, { label: 'Galaxy', slug: 'galaxy' },
      { label: 'Kuga', slug: 'kuga' }, { label: 'Mondeo', slug: 'mondeo' },
      { label: 'Mustang', slug: 'mustang' }, { label: 'Mustang Mach-E', slug: 'mustang-mach-e' },
      { label: 'Puma', slug: 'puma' }, { label: 'S-Max', slug: 's-max' },
      { label: 'Tourneo', slug: 'tourneo' },
    ],
  },
  {
    label: 'Honda', slug: 'honda',
    models: [
      { label: 'Civic', slug: 'civic' }, { label: 'CR-V', slug: 'cr-v' },
      { label: 'CR-Z', slug: 'cr-z' }, { label: 'HR-V', slug: 'hr-v' },
      { label: 'Integra', slug: 'integra' }, { label: 'Jazz', slug: 'jazz' },
      { label: 'NSX', slug: 'nsx' }, { label: 'S2000', slug: 's2000' },
    ],
  },
  {
    label: 'Hyundai', slug: 'hyundai',
    models: [
      { label: 'i10', slug: 'i10' }, { label: 'i20', slug: 'i20' }, { label: 'i20 N', slug: 'i20-n' },
      { label: 'i30', slug: 'i30' }, { label: 'i30 N', slug: 'i30-n' }, { label: 'i40', slug: 'i40' },
      { label: 'Ioniq', slug: 'ioniq' }, { label: 'Ioniq 5', slug: 'ioniq-5' }, { label: 'Ioniq 6', slug: 'ioniq-6' },
      { label: 'Kona', slug: 'kona' }, { label: 'Tucson', slug: 'tucson' }, { label: 'Santa Fe', slug: 'santa-fe' },
    ],
  },
  {
    label: 'Jaguar', slug: 'jaguar',
    models: [
      { label: 'E-Pace', slug: 'e-pace' }, { label: 'F-Pace', slug: 'f-pace' },
      { label: 'F-Type', slug: 'f-type' }, { label: 'I-Pace', slug: 'i-pace' },
      { label: 'XE', slug: 'xe' }, { label: 'XF', slug: 'xf' }, { label: 'XJ', slug: 'xj' },
    ],
  },
  {
    label: 'Kia', slug: 'kia',
    models: [
      { label: 'Ceed', slug: 'ceed' }, { label: 'EV6', slug: 'ev6' },
      { label: 'Niro', slug: 'niro' }, { label: 'Picanto', slug: 'picanto' },
      { label: 'ProCeed', slug: 'proceed' }, { label: 'Rio', slug: 'rio' },
      { label: 'Sportage', slug: 'sportage' }, { label: 'Stinger', slug: 'stinger' },
      { label: 'Stonic', slug: 'stonic' }, { label: 'XCeed', slug: 'xceed' },
    ],
  },
  {
    label: 'Land Rover', slug: 'land-rover',
    models: [
      { label: 'Defender', slug: 'defender' }, { label: 'Discovery', slug: 'discovery' },
      { label: 'Discovery Sport', slug: 'discovery-sport' }, { label: 'Freelander', slug: 'freelander' },
      { label: 'Range Rover', slug: 'range-rover' }, { label: 'Range Rover Evoque', slug: 'range-rover-evoque' },
      { label: 'Range Rover Sport', slug: 'range-rover-sport' }, { label: 'Range Rover Velar', slug: 'range-rover-velar' },
    ],
  },
  {
    label: 'Lexus', slug: 'lexus',
    models: [
      { label: 'CT', slug: 'ct' }, { label: 'ES', slug: 'es' }, { label: 'GS', slug: 'gs' },
      { label: 'IS', slug: 'is' }, { label: 'LC', slug: 'lc' }, { label: 'LS', slug: 'ls' },
      { label: 'NX', slug: 'nx' }, { label: 'RC', slug: 'rc' }, { label: 'RX', slug: 'rx' },
      { label: 'UX', slug: 'ux' },
    ],
  },
  {
    label: 'Mazda', slug: 'mazda',
    models: [
      { label: 'Mazda 2', slug: '2' }, { label: 'Mazda 3', slug: '3' },
      { label: 'Mazda 6', slug: '6' }, { label: 'CX-3', slug: 'cx-3' },
      { label: 'CX-5', slug: 'cx-5' }, { label: 'CX-30', slug: 'cx-30' },
      { label: 'MX-5', slug: 'mx-5' }, { label: 'MX-5 RF', slug: 'mx-5-rf' },
      { label: 'RX-8', slug: 'rx-8' },
    ],
  },
  {
    label: 'Mercedes-Benz', slug: 'mercedes-benz',
    models: [
      { label: 'A-Klasse', slug: 'a-klasse' }, { label: 'B-Klasse', slug: 'b-klasse' },
      { label: 'C-Klasse', slug: 'c-klasse' }, { label: 'E-Klasse', slug: 'e-klasse' },
      { label: 'S-Klasse', slug: 's-klasse' }, { label: 'G-Klasse', slug: 'g-klasse' },
      { label: 'CLA', slug: 'cla' }, { label: 'CLS', slug: 'cls' },
      { label: 'GLA', slug: 'gla' }, { label: 'GLB', slug: 'glb' },
      { label: 'GLC', slug: 'glc' }, { label: 'GLE', slug: 'gle' }, { label: 'GLS', slug: 'gls' },
      { label: 'SL', slug: 'sl' }, { label: 'SLK', slug: 'slk' }, { label: 'SLC', slug: 'slc' },
      { label: 'AMG GT', slug: 'amg-gt' }, { label: 'EQA', slug: 'eqa' }, { label: 'EQB', slug: 'eqb' },
      { label: 'EQC', slug: 'eqc' }, { label: 'EQE', slug: 'eqe' }, { label: 'EQS', slug: 'eqs' },
    ],
  },
  {
    label: 'Mini', slug: 'mini',
    models: [
      { label: 'Cabrio', slug: 'cabrio' }, { label: 'Clubman', slug: 'clubman' },
      { label: 'Cooper', slug: 'cooper' }, { label: 'Cooper S', slug: 'cooper-s' },
      { label: 'Cooper SE', slug: 'cooper-se' }, { label: 'Countryman', slug: 'countryman' },
      { label: 'John Cooper Works', slug: 'john-cooper-works' }, { label: 'Paceman', slug: 'paceman' },
      { label: 'Roadster', slug: 'roadster' },
    ],
  },
  {
    label: 'Mitsubishi', slug: 'mitsubishi',
    models: [
      { label: 'ASX', slug: 'asx' }, { label: 'Colt', slug: 'colt' },
      { label: 'Eclipse Cross', slug: 'eclipse-cross' }, { label: 'Lancer', slug: 'lancer' },
      { label: 'Outlander', slug: 'outlander' }, { label: 'Space Star', slug: 'space-star' },
    ],
  },
  {
    label: 'Nissan', slug: 'nissan',
    models: [
      { label: '350Z', slug: '350z' }, { label: '370Z', slug: '370z' },
      { label: 'GT-R', slug: 'gt-r' }, { label: 'Juke', slug: 'juke' },
      { label: 'Leaf', slug: 'leaf' }, { label: 'Micra', slug: 'micra' },
      { label: 'Note', slug: 'note' }, { label: 'Qashqai', slug: 'qashqai' },
      { label: 'X-Trail', slug: 'x-trail' },
    ],
  },
  {
    label: 'Opel', slug: 'opel',
    models: [
      { label: 'Adam', slug: 'adam' }, { label: 'Astra', slug: 'astra' },
      { label: 'Cascada', slug: 'cascada' }, { label: 'Corsa', slug: 'corsa' },
      { label: 'Crossland', slug: 'crossland' }, { label: 'Grandland', slug: 'grandland' },
      { label: 'Insignia', slug: 'insignia' }, { label: 'Mokka', slug: 'mokka' },
      { label: 'Tigra', slug: 'tigra' }, { label: 'Vectra', slug: 'vectra' },
      { label: 'Zafira', slug: 'zafira' },
    ],
  },
  {
    label: 'Peugeot', slug: 'peugeot',
    models: [
      { label: '107', slug: '107' }, { label: '108', slug: '108' },
      { label: '205', slug: '205' }, { label: '206', slug: '206' }, { label: '207', slug: '207' },
      { label: '208', slug: '208' }, { label: '308', slug: '308' }, { label: '408', slug: '408' },
      { label: '508', slug: '508' }, { label: '2008', slug: '2008' },
      { label: '3008', slug: '3008' }, { label: '5008', slug: '5008' },
      { label: 'RCZ', slug: 'rcz' },
    ],
  },
  {
    label: 'Porsche', slug: 'porsche',
    models: [
      { label: '718 Boxster', slug: '718-boxster' }, { label: '718 Cayman', slug: '718-cayman' },
      { label: '911', slug: '911' }, { label: 'Boxster', slug: 'boxster' },
      { label: 'Cayenne', slug: 'cayenne' }, { label: 'Cayman', slug: 'cayman' },
      { label: 'Macan', slug: 'macan' }, { label: 'Panamera', slug: 'panamera' },
      { label: 'Taycan', slug: 'taycan' },
    ],
  },
  {
    label: 'Renault', slug: 'renault',
    models: [
      { label: 'Arkana', slug: 'arkana' }, { label: 'Captur', slug: 'captur' },
      { label: 'Clio', slug: 'clio' }, { label: 'Espace', slug: 'espace' },
      { label: 'Kadjar', slug: 'kadjar' }, { label: 'Kangoo', slug: 'kangoo' },
      { label: 'Koleos', slug: 'koleos' }, { label: 'Laguna', slug: 'laguna' },
      { label: 'Megane', slug: 'megane' }, { label: 'Scenic', slug: 'scenic' },
      { label: 'Twingo', slug: 'twingo' }, { label: 'Zoe', slug: 'zoe' },
    ],
  },
  {
    label: 'Seat', slug: 'seat',
    models: [
      { label: 'Alhambra', slug: 'alhambra' }, { label: 'Altea', slug: 'altea' },
      { label: 'Arona', slug: 'arona' }, { label: 'Ateca', slug: 'ateca' },
      { label: 'Ibiza', slug: 'ibiza' }, { label: 'Leon', slug: 'leon' },
      { label: 'Tarraco', slug: 'tarraco' }, { label: 'Toledo', slug: 'toledo' },
    ],
  },
  {
    label: 'Škoda', slug: 'skoda',
    models: [
      { label: 'Citigo', slug: 'citigo' }, { label: 'Enyaq', slug: 'enyaq' },
      { label: 'Fabia', slug: 'fabia' }, { label: 'Kamiq', slug: 'kamiq' },
      { label: 'Karoq', slug: 'karoq' }, { label: 'Kodiaq', slug: 'kodiaq' },
      { label: 'Octavia', slug: 'octavia' }, { label: 'Rapid', slug: 'rapid' },
      { label: 'Scala', slug: 'scala' }, { label: 'Superb', slug: 'superb' },
      { label: 'Yeti', slug: 'yeti' },
    ],
  },
  {
    label: 'Subaru', slug: 'subaru',
    models: [
      { label: 'BRZ', slug: 'brz' }, { label: 'Forester', slug: 'forester' },
      { label: 'Impreza', slug: 'impreza' }, { label: 'Legacy', slug: 'legacy' },
      { label: 'Levorg', slug: 'levorg' }, { label: 'Outback', slug: 'outback' },
      { label: 'WRX STI', slug: 'wrx-sti' }, { label: 'XV', slug: 'xv' },
    ],
  },
  {
    label: 'Suzuki', slug: 'suzuki',
    models: [
      { label: 'Alto', slug: 'alto' }, { label: 'Baleno', slug: 'baleno' },
      { label: 'Ignis', slug: 'ignis' }, { label: 'Jimny', slug: 'jimny' },
      { label: 'Splash', slug: 'splash' }, { label: 'Swift', slug: 'swift' },
      { label: 'SX4', slug: 'sx4' }, { label: 'SX4 S-Cross', slug: 'sx4-s-cross' },
      { label: 'Vitara', slug: 'vitara' },
    ],
  },
  {
    label: 'Tesla', slug: 'tesla',
    models: [
      { label: 'Model 3', slug: 'model-3' }, { label: 'Model S', slug: 'model-s' },
      { label: 'Model X', slug: 'model-x' }, { label: 'Model Y', slug: 'model-y' },
    ],
  },
  {
    label: 'Toyota', slug: 'toyota',
    models: [
      { label: 'Aygo', slug: 'aygo' }, { label: 'C-HR', slug: 'c-hr' },
      { label: 'Camry', slug: 'camry' }, { label: 'Corolla', slug: 'corolla' },
      { label: 'GR86', slug: 'gr86' }, { label: 'GR Yaris', slug: 'gr-yaris' },
      { label: 'MR2', slug: 'mr2' }, { label: 'Prius', slug: 'prius' },
      { label: 'RAV4', slug: 'rav4' }, { label: 'Supra', slug: 'supra' },
      { label: 'Yaris', slug: 'yaris' }, { label: 'Yaris Cross', slug: 'yaris-cross' },
    ],
  },
  {
    label: 'Volkswagen', slug: 'volkswagen',
    models: [
      { label: 'Arteon', slug: 'arteon' }, { label: 'Caddy', slug: 'caddy' },
      { label: 'Golf', slug: 'golf' }, { label: 'ID.3', slug: 'id-3' },
      { label: 'ID.4', slug: 'id-4' }, { label: 'ID.5', slug: 'id-5' },
      { label: 'Passat', slug: 'passat' }, { label: 'Polo', slug: 'polo' },
      { label: 'Scirocco', slug: 'scirocco' }, { label: 'T-Cross', slug: 't-cross' },
      { label: 'T-Roc', slug: 't-roc' }, { label: 'Tiguan', slug: 'tiguan' },
      { label: 'Touareg', slug: 'touareg' }, { label: 'Touran', slug: 'touran' },
      { label: 'Up', slug: 'up' },
    ],
  },
  {
    label: 'Volvo', slug: 'volvo',
    models: [
      { label: 'C30', slug: 'c30' }, { label: 'C40', slug: 'c40' },
      { label: 'S40', slug: 's40' }, { label: 'S60', slug: 's60' },
      { label: 'S80', slug: 's80' }, { label: 'S90', slug: 's90' },
      { label: 'V40', slug: 'v40' }, { label: 'V60', slug: 'v60' },
      { label: 'V70', slug: 'v70' }, { label: 'V90', slug: 'v90' },
      { label: 'XC40', slug: 'xc40' }, { label: 'XC60', slug: 'xc60' }, { label: 'XC90', slug: 'xc90' },
    ],
  },
]
