export const getNavigatorLanguage = () =>
  (navigator.languages || [])[0]
  || navigator.userLanguage
  || navigator.language
  || navigator.browserLanguage
  || navigator.systemLanguage;
