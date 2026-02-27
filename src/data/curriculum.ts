export interface TrainingArea {
  code: string
  name: string
  description: string
  chipVariant: 'primary' | 'accent' | 'success' | 'warning'
}

export interface Subject {
  code: string
  name: string
  credits: number
  areaCode: string
}

export interface Semester {
  number: number
  subjects: Subject[]
}

export interface ProfessionalArea {
  name: string
  description: string
}

export const trainingAreas: TrainingArea[] = [
  {
    code: 'ING',
    name: 'Formación en Ingeniería',
    description:
      'Fundamentos de programación, matemáticas, estructuras de datos, procesamiento de señales, redes y aprendizaje automático.',
    chipVariant: 'primary',
  },
  {
    code: 'ICM',
    name: 'Información, Comunicación y Medios',
    description:
      'Teoría de la comunicación, narrativas audiovisuales, diseño de interacción, estudios de audiencia y gestión de contenidos.',
    chipVariant: 'accent',
  },
  {
    code: 'CI',
    name: 'Creatividad e Innovación',
    description:
      'Diseño visual, producción audiovisual, animación, experiencias inmersivas, prototipado y trabajo final de grado.',
    chipVariant: 'success',
  },
  {
    code: 'COMP',
    name: 'Complementaria',
    description:
      'Inglés técnico, gestión de proyectos, electivas interdisciplinarias y formación transversal.',
    chipVariant: 'warning',
  },
]

export const semesters: Semester[] = [
  {
    number: 1,
    subjects: [
      { code: 'ING101', name: 'Introducción a la Programación', credits: 12, areaCode: 'ING' },
      { code: 'ING102', name: 'Matemática I', credits: 12, areaCode: 'ING' },
      { code: 'ICM101', name: 'Introducción a la Comunicación', credits: 10, areaCode: 'ICM' },
      { code: 'CI101', name: 'Taller de Diseño Visual', credits: 8, areaCode: 'CI' },
      { code: 'COMP101', name: 'Inglés Técnico I', credits: 6, areaCode: 'COMP' },
    ],
  },
  {
    number: 2,
    subjects: [
      { code: 'ING201', name: 'Programación Avanzada', credits: 12, areaCode: 'ING' },
      { code: 'ING202', name: 'Matemática II', credits: 10, areaCode: 'ING' },
      { code: 'ICM201', name: 'Narrativas Audiovisuales', credits: 10, areaCode: 'ICM' },
      { code: 'CI201', name: 'Producción Audiovisual I', credits: 8, areaCode: 'CI' },
      { code: 'COMP201', name: 'Inglés Técnico II', credits: 6, areaCode: 'COMP' },
    ],
  },
  {
    number: 3,
    subjects: [
      { code: 'ING301', name: 'Estructuras de Datos', credits: 12, areaCode: 'ING' },
      { code: 'ING302', name: 'Probabilidad y Estadística', credits: 10, areaCode: 'ING' },
      { code: 'ICM301', name: 'Diseño de Interacción', credits: 10, areaCode: 'ICM' },
      { code: 'CI301', name: 'Animación Digital', credits: 8, areaCode: 'CI' },
      { code: 'COMP301', name: 'Gestión de Proyectos', credits: 6, areaCode: 'COMP' },
    ],
  },
  {
    number: 4,
    subjects: [
      { code: 'ING401', name: 'Bases de Datos', credits: 10, areaCode: 'ING' },
      { code: 'ING402', name: 'Procesamiento de Señales', credits: 10, areaCode: 'ING' },
      { code: 'ICM401', name: 'Estudios de Audiencia y Medios', credits: 10, areaCode: 'ICM' },
      { code: 'CI401', name: 'Producción Audiovisual II', credits: 10, areaCode: 'CI' },
      { code: 'COMP401', name: 'Electiva I', credits: 6, areaCode: 'COMP' },
    ],
  },
  {
    number: 5,
    subjects: [
      { code: 'ING501', name: 'Redes y Sistemas Distribuidos', credits: 10, areaCode: 'ING' },
      { code: 'ING502', name: 'Procesamiento de Imágenes', credits: 10, areaCode: 'ING' },
      { code: 'ICM501', name: 'Comunicación Digital', credits: 10, areaCode: 'ICM' },
      { code: 'CI501', name: 'Experiencias Inmersivas (VR/AR)', credits: 10, areaCode: 'CI' },
      { code: 'COMP501', name: 'Electiva II', credits: 6, areaCode: 'COMP' },
    ],
  },
  {
    number: 6,
    subjects: [
      { code: 'ING601', name: 'Aprendizaje Automático', credits: 10, areaCode: 'ING' },
      { code: 'ING602', name: 'Ingeniería de Software', credits: 10, areaCode: 'ING' },
      { code: 'ICM601', name: 'Gestión de Contenidos Digitales', credits: 10, areaCode: 'ICM' },
      { code: 'CI601', name: 'Taller de Innovación Mediática', credits: 10, areaCode: 'CI' },
      { code: 'COMP601', name: 'Electiva III', credits: 6, areaCode: 'COMP' },
    ],
  },
  {
    number: 7,
    subjects: [
      { code: 'ING701', name: 'Visualización de Datos', credits: 10, areaCode: 'ING' },
      { code: 'ICM701', name: 'Narrativas Transmedia', credits: 10, areaCode: 'ICM' },
      { code: 'CI701', name: 'Trabajo Final de Grado I', credits: 15, areaCode: 'CI' },
      { code: 'COMP701', name: 'Electiva IV', credits: 6, areaCode: 'COMP' },
    ],
  },
  {
    number: 8,
    subjects: [
      { code: 'ING801', name: 'Tópicos Avanzados en Ingeniería de Medios', credits: 10, areaCode: 'ING' },
      { code: 'ICM801', name: 'Seminario de Investigación en Medios', credits: 10, areaCode: 'ICM' },
      { code: 'CI801', name: 'Trabajo Final de Grado II', credits: 15, areaCode: 'CI' },
      { code: 'COMP801', name: 'Electiva V', credits: 6, areaCode: 'COMP' },
    ],
  },
]

export const professionalAreas: ProfessionalArea[] = [
  {
    name: 'Experiencias Interactivas y Multimedia',
    description: 'Diseño y desarrollo de experiencias interactivas, aplicaciones multimedia y contenidos digitales innovadores.',
  },
  {
    name: 'Producción Audiovisual',
    description: 'Producción, postproducción y distribución de contenidos audiovisuales en múltiples formatos y plataformas.',
  },
  {
    name: 'Diseño UX/UI',
    description: 'Diseño de interfaces y experiencia de usuario para productos digitales, aplicaciones y servicios.',
  },
  {
    name: 'Videojuegos y Experiencias Inmersivas',
    description: 'Desarrollo de videojuegos, experiencias de realidad virtual (VR) y realidad aumentada (AR).',
  },
  {
    name: 'Datos y Visualización',
    description: 'Análisis de datos, visualización de información y periodismo de datos.',
  },
  {
    name: 'Innovación Mediática',
    description: 'Gestión de proyectos de innovación en medios y consultoría en transformación digital.',
  },
  {
    name: 'Investigación',
    description: 'Investigación académica en comunicación, tecnología, medios digitales e inteligencia artificial aplicada.',
  },
  {
    name: 'Transformación Digital',
    description: 'Consultoría y liderazgo en procesos de transformación digital de organizaciones mediáticas.',
  },
]
