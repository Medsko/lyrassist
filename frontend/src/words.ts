/** The indefinite article for a lemma: "a landlord", "an apology". */
export const article = (lemma: string) => (/^[aeiou]/.test(lemma) ? 'an' : 'a')
