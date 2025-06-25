// src/lib/quill-estonian.ts
/**
 * Estonian translations for Quill Editor
 */

export const estonianTranslations = {
  ui: {
    bold: 'Paks',
    italic: 'Kaldkiri',
    underline: 'Allakriipsutatud',
    strike: 'Läbikriipsutatud',
    header: 'Pealkiri',
    header1: 'Pealkiri 1',
    header2: 'Pealkiri 2', 
    blockquote: 'Tsitaat',
    code: 'Kood',
    link: 'Link',
    image: 'Pilt',
    video: 'Video',
    clean: 'Puhasta vormindus',
    formula: 'Valem',
    indent: 'Suurenda taanet',
    outdent: 'Vähenda taanet',
    orderedList: 'Nummerdatud loend',
    bulletList: 'Punktloend',
    align: 'Joondus',
    alignLeft: 'Vasakule',
    alignCenter: 'Keskele',
    alignRight: 'Paremale',
    alignJustify: 'Rööpjoonda',
    color: 'Värv',
    background: 'Taust',
    insert: 'Lisa',
    altText: 'Alternatiivne tekst',
    url: 'URL',
    remove: 'Eemalda',
    cancel: 'Tühista',
    save: 'Salvesta',
  },

  placeholders: {
    urlPlaceholder: 'Sisesta URL...',
    altTextPlaceholder: 'Sisesta alternatiivne tekst...',
    searchPlaceholder: 'Otsi...',
  },

  // Helper function to register translations with Quill if needed
  registerTranslations: (Quill: any) => {
    if (Quill && Quill.register) {
      // This would require additional logic in the Quill instance
      // to properly implement custom UI translations
      console.log('Estonian translations available for Quill');
    }
  }
};

export default estonianTranslations;