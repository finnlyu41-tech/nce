// Narrow, source-bound repairs from the 6524493 audit. These add lesson
// associations to existing words; they do not define new cards or meanings.
export const reviewedSourceAssociations=[{
 book:'NCE1' as const,lesson:103,word:'low',beforeWord:'cheer',
 existingBook:'NCE1' as const,existingLesson:104,
 sourceBookSha256:'df385269f6502f201fc5689683f9163205202e8b0b735fd9a388b2c7982ba2b3',
 sourcePDFPage:214,sourcePageSha256:'dc8204c6ac7bad60fb6724b69337d432f6c8d0c1342bd46e0ea39f901c16625b',
 printedPartOfSpeech:'adj.',printedGloss:'低的',
},{
 book:'NCE4' as const,lesson:9,word:'assail',beforeWord:'skirmish',
 existingBook:'NCE3' as const,existingLesson:28,
 sourceBookSha256:'d7250bbdb39130c202a32520c49d0c0d9ad1e115fd1e14300e07c30f9719c804',
 sourcePDFPage:83,sourcePageSha256:'60c5eda44d05028c6e1a9d68ca5494c07edbe57036e2f498fe8b854594827f47',
 printedPartOfSpeech:'v.',printedGloss:'袭击',
}];

// The existing lesson association is already correct. Explain the printed
// header next to its unchanged scan; this cannot remap any lesson or page.
export const reviewedPageClarifications=[{
 book:'NCE2' as const,lesson:34,
 sourceBookSha256:'8e19ce05144e35257f551bb8e2c8a26920bb7790affb7105441a0b011731e201',
 sourcePDFPage:199,sourcePageSha256:'f023b9db6764d604aee91df717ce79b66726140cf848ac8847b4e50c3a32a11c',
 text:'本页页眉误印为 Lesson 33；Dan Robinson 与自行车的练习接续第 34 课 Quick Work，请按第 34 课阅读。',
}];
