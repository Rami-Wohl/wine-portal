export type Locale = "nl" | "en";
export type FormValues = { body: string; source: string; suggestion: string };
export type FormErrors = Partial<Record<keyof FormValues | "form", string>>;

export const LIMITS = {
  bodyMin: 30,
  bodyMax: 4000,
  sourceMax: 2000,
  suggestionMax: 2000,
  links: 5,
  requestBytes: 16 * 1024,
};
export const KINDS = ["factual", "explanation", "translation", "broken", "suggestion"] as const;
export type Kind = (typeof KINDS)[number];
export const EMPTY_VALUES: FormValues = { body: "", source: "", suggestion: "" };
export const text = (locale: Locale, nl: string, en: string) => (locale === "nl" ? nl : en);

export const kinds: Record<
  Kind,
  Record<Locale, { title: string; detail: string; question: string; hint: string }>
> = {
  factual: {
    nl: {
      title: "Een feit klopt niet of is verouderd",
      detail: "Geef aan wat er anders is en waarop je dat baseert.",
      question: "Wat klopt er niet?",
      hint: "Beschrijf de claim en wat er volgens je bron anders is.",
    },
    en: {
      title: "A fact is incorrect or outdated",
      detail: "Explain what differs and provide a supporting reference.",
      question: "What is incorrect?",
      hint: "Describe the claim and what your reference says instead.",
    },
  },
  explanation: {
    nl: {
      title: "De uitleg kan duidelijker",
      detail: "Er ontbreekt iets of een passage is lastig te volgen.",
      question: "Welke uitleg mis je?",
      hint: "Vertel waar je vastloopt of welke vraag overblijft.",
    },
    en: {
      title: "The explanation could be clearer",
      detail: "Something is missing or a passage is hard to follow.",
      question: "What explanation would help?",
      hint: "Tell us where you get stuck or which question remains.",
    },
  },
  translation: {
    nl: {
      title: "Er is een vertaalprobleem",
      detail: "De Nederlandse en Engelse tekst sluiten niet goed op elkaar aan.",
      question: "Wat gaat er mis in de vertaling?",
      hint: "Noem het woord of de passage en leg uit wat er anders bedoeld is.",
    },
    en: {
      title: "There is a translation problem",
      detail: "The Dutch and English versions do not match in meaning.",
      question: "What is wrong with the translation?",
      hint: "Identify the word or passage and explain the intended meaning.",
    },
  },
  broken: {
    nl: {
      title: "Iets werkt niet",
      detail: "Een link, afbeelding, opmaak of bediening geeft een probleem.",
      question: "Wat werkt er niet?",
      hint: "Beschrijf wat je deed en wat er gebeurde. Noem je apparaat of browser als dat helpt.",
    },
    en: {
      title: "Something is not working",
      detail: "There is a problem with a link, image, layout or interaction.",
      question: "What is not working?",
      hint: "Describe what you did and what happened. Mention your device or browser if helpful.",
    },
  },
  suggestion: {
    nl: {
      title: "Ik heb een idee of andere feedback",
      detail: "Deel een verbetering of een onderwerp dat je mist.",
      question: "Wat wil je voorstellen?",
      hint: "Vertel wat je graag zou zien en waarom dat je helpt.",
    },
    en: {
      title: "I have an idea or other feedback",
      detail: "Suggest an improvement or a topic you would like to see.",
      question: "What would you like to suggest?",
      hint: "Tell us what you would like to see and why it would help.",
    },
  },
};

export const states = {
  received: {
    nl: [
      "Bedankt voor je melding",
      "We hebben je melding ontvangen. Je krijgt een e-mail zodra de behandeling verandert. Er is nog geen vaste reactietermijn.",
      "Bekijk je melding",
    ],
    en: [
      "Thank you for your report",
      "We have received your report. You will get an email when its handling changes. There is no fixed response time yet.",
      "View your report",
    ],
  },
  detail: {
    nl: [
      "Je melding is ontvangen",
      "We bekijken je melding en de bijbehorende context. Je kunt hier later de uitkomst terugvinden.",
      "Terug naar de voorbeeldpagina",
    ],
    en: [
      "Your report has been received",
      "We will review your report and its context. You can return here to find the outcome.",
      "Back to the sample page",
    ],
  },
  review: {
    nl: [
      "Je melding is in behandeling",
      "Een redacteur bekijkt de toelichting en eventuele bronnen. Je hoort van ons zodra er een uitkomst is.",
      "Terug naar de voorbeeldpagina",
    ],
    en: [
      "Your report is under review",
      "An editor is reviewing your explanation and any references. We will let you know when there is an outcome.",
      "Back to the sample page",
    ],
  },
  needs_info: {
    nl: [
      "Kun je iets aanvullen?",
      "Voorbeeldvraag: kun je de bedoelde passage in je bron aanwijzen? Je kunt één keer aanvullende informatie sturen, binnen 14 dagen na ons verzoek.",
      "Aanvulling sturen",
    ],
    en: [
      "Could you add some detail?",
      "Sample question: could you point us to the relevant passage in your reference? You can send one reply within 14 days of our request.",
      "Send additional information",
    ],
  },
  replied: {
    nl: [
      "Bedankt voor je aanvulling",
      "Je antwoord is toegevoegd. We bekijken je melding opnieuw. Je hoeft niets meer te doen.",
      "Terug naar de voorbeeldpagina",
    ],
    en: [
      "Thank you for the additional information",
      "Your reply has been added. We will review your report again. You do not need to do anything else.",
      "Back to the sample page",
    ],
  },
  accepted: {
    nl: [
      "Je melding is geaccepteerd",
      "We hebben er werk van gemaakt. De wijziging staat nog niet op de pagina; het gekoppelde werk laat zien wat er gaat gebeuren.",
      "Bekijk het voorbeeldwerk",
    ],
    en: [
      "Your report has been accepted",
      "We have linked it to planned work. The page has not been corrected yet; the linked work explains what will happen.",
      "View the sample work item",
    ],
  },
  duplicate: {
    nl: [
      "Dit is al in behandeling",
      "Dank je, dit onderwerp wordt al opgepakt. Je melding is aan hetzelfde werk gekoppeld. Andere meldingen blijven privé.",
      "Bekijk het voorbeeldwerk",
    ],
    en: [
      "This is already being handled",
      "Thank you, this topic is already being addressed. Your report is linked to the same work. Other reports remain private.",
      "View the sample work item",
    ],
  },
  fixed: {
    nl: [
      "De pagina is gecorrigeerd",
      "Een redacteur heeft de correctie gecontroleerd en gepubliceerd. De uitleg en de bijbehorende bronnen zijn bijgewerkt.",
      "Bekijk de voorbeeldcorrectie",
    ],
    en: [
      "The page has been corrected",
      "An editor has checked and published the correction. The explanation and its supporting references have been updated.",
      "View the sample correction",
    ],
  },
  declined: {
    nl: [
      "Je voorstel is niet overgenomen",
      "Voorbeeldreden: we konden de claim niet bevestigen met de opgegeven bron. Dit is geen waarschuwing en telt niet als misbruik.",
      "Terug naar de voorbeeldpagina",
    ],
    en: [
      "Your suggestion was not taken forward",
      "Sample reason: we could not confirm the claim using the reference provided. This is not a warning and does not count as abuse.",
      "Back to the sample page",
    ],
  },
  changed: {
    nl: [
      "De sectie is intussen gewijzigd",
      "De tekst is veranderd sinds je melding. Dat betekent nog niet dat je punt is opgelost. Je melding is nog in behandeling.",
      "Bekijk de voorbeeldpagina",
    ],
    en: [
      "The section has changed since your report",
      "The text has changed since you reported it. This does not mean your concern has been resolved. Your report is still under review.",
      "View the sample page",
    ],
  },
  removed: {
    nl: [
      "De sectie staat niet meer op deze pagina",
      "We kunnen de oorspronkelijke passage hier niet meer tonen. Je melding blijft beschikbaar voor beoordeling.",
      "Terug naar de voorbeeldpagina",
    ],
    en: [
      "The section is no longer on this page",
      "We can no longer show the original passage here. Your report remains available for review.",
      "Back to the sample page",
    ],
  },
  empty: {
    nl: [
      "Je hebt nog geen meldingen",
      "Zie je iets dat beter kan? Je kunt vanuit een pagina of sectie een melding maken.",
      "Bekijk de voorbeeldpagina",
    ],
    en: [
      "You have no reports yet",
      "See something that could be improved? You can report it from a page or section.",
      "View the sample page",
    ],
  },
  quota: {
    nl: [
      "Je hebt al meerdere meldingen gestuurd",
      "Probeer het later opnieuw. Je eerdere meldingen blijven in behandeling; je hoeft ze niet opnieuw te sturen.",
      "Terug naar de voorbeeldpagina",
    ],
    en: [
      "You have already sent several reports",
      "Please try again later. Your earlier reports are still being handled; you do not need to send them again.",
      "Back to the sample page",
    ],
  },
  unavailable: {
    nl: [
      "Melden lukt nu even niet",
      "Je melding is niet ontvangen. Probeer het later opnieuw; bij een fout tijdens het indienen blijft je invoer in het formulier staan.",
      "Terug naar het formulier",
    ],
    en: [
      "Reporting is temporarily unavailable",
      "Your report has not been received. Please try again later; if submission fails, your input remains in the form.",
      "Back to the form",
    ],
  },
  login: {
    nl: [
      "Log in om iets te melden",
      "Met een geverifieerd e-mailadres kunnen we je om toelichting vragen en een uitkomst terugsturen. Lezen kan altijd zonder account.",
      "Terug naar het voorbeeldformulier",
    ],
    en: [
      "Sign in to send a report",
      "A verified email address lets us ask for clarification and send you an outcome. You can always read without an account.",
      "Back to the sample form",
    ],
  },
  abuse: {
    nl: [
      "Je melding is in strijd met de regels",
      "Een beheerder heeft de melding als misbruik beoordeeld. Je krijgt hierover geen e-mail. Als je het niet eens bent met deze beslissing, kun je bezwaar maken.",
      "Bekijk het voorbeeldbezwaar",
    ],
    en: [
      "Your report breaches the rules",
      "A moderator has assessed the report as abuse. You will not receive an email about this outcome. If you disagree, you can appeal the decision.",
      "View the sample appeal",
    ],
  },
  expired: {
    nl: [
      "De antwoordtermijn is verstreken",
      "Je kunt op dit verzoek geen aanvulling meer sturen. Een redacteur beoordeelt het vervolg. Dit telt niet als misbruik.",
      "Terug naar de voorbeeldpagina",
    ],
    en: [
      "The reply deadline has passed",
      "You can no longer reply to this request. An editor will decide what happens next. This does not count as abuse.",
      "Back to the sample page",
    ],
  },
  work: {
    nl: [
      "Werk aan deze verbetering",
      "Voorbeeld van een veilige werksamenvatting: verduidelijk de uitleg en controleer de bronverwijzing. Dit scherm toont geen echte melding of extern ticket.",
      "Terug naar de voorbeeldpagina",
    ],
    en: [
      "Work on this improvement",
      "Sample safe work summary: clarify the explanation and check the reference. This screen contains no real report or external ticket.",
      "Back to the sample page",
    ],
  },
  appeal: {
    nl: [
      "Bezwaar maken",
      "Ook met een geblokkeerd account blijft een begrensde, menselijke bezwaarroute bereikbaar. De echte bezwaarflow volgt in een latere bouwstap.",
      "Terug naar de voorbeeldpagina",
    ],
    en: [
      "Appeal a decision",
      "A limited appeal route reviewed by a person remains available even when an account is blocked. The actual appeal flow will be built later.",
      "Back to the sample page",
    ],
  },
} satisfies Record<string, Record<Locale, string[]>>;
export type State = keyof typeof states;

export const declineReasons = [
  ["De bron onderbouwt deze claim niet", "The reference does not support this claim"],
  [
    "De huidige uitleg klopt binnen de genoemde scope",
    "The current explanation is accurate within its stated scope",
  ],
  ["Het voorstel valt buiten deze pagina", "The suggestion is outside this page’s scope"],
  [
    "We konden het technische probleem niet reproduceren",
    "We could not reproduce the technical problem",
  ],
  [
    "We hebben onvoldoende informatie om dit te beoordelen",
    "There is not enough information to assess this",
  ],
];
