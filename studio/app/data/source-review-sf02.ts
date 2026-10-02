// SF02: literal source evidence, never an override of existing meanings/cards.
// A null POS means the row does not print one. No inflections are inferred.
export const reviewedSF02Associations=[{
 book:'NCE3' as const,lesson:29,word:'hobble',anchorWord:'compensate',placement:'before' as const,
 sourceBookSha256:'9c3a876dbd813261b164356b97bcc6ca8b1c2653109e9b4f3e2cb3a198f90d97',sourcePDFPage:164,
 sourcePageSha256:'1af688b05d254919490aa881a96a14ec06e880a42697dd67ac473e98ad7c7985',
 printedPartOfSpeech:'v.',printedGloss:'瘸着腿走',
},{
 book:'NCE4' as const,lesson:3,word:'solitary',anchorWord:'impoverish',placement:'before' as const,
 sourceBookSha256:'d7250bbdb39130c202a32520c49d0c0d9ad1e115fd1e14300e07c30f9719c804',sourcePDFPage:47,
 sourcePageSha256:'cb7d7e0a6dfd65c800583bd5d19d3b05aa588d3ecc120917c2c49419d521b8da',
 printedPartOfSpeech:'adj.',printedGloss:'唯一的',
},{
 book:'NCE2' as const,lesson:27,word:'heavily',anchorWord:'stream',placement:'before' as const,
 sourceBookSha256:'8e19ce05144e35257f551bb8e2c8a26920bb7790affb7105441a0b011731e201',sourcePDFPage:170,
 sourcePageSha256:'946a6a492fadab1cd9fb10cb41a02a918c03dbb02fd2107114b6ba49ca537e75',
 printedPartOfSpeech:'adv.',printedGloss:'大量地',
},{
 book:'NCE3' as const,lesson:34,word:'bargain hunter',anchorWord:'dealer',placement:'before' as const,
 sourceBookSha256:'9c3a876dbd813261b164356b97bcc6ca8b1c2653109e9b4f3e2cb3a198f90d97',sourcePDFPage:184,
 sourcePageSha256:'e7243e0a728a2341de09c0f609ca872c16c9d7ea6a7120e3aa62c50bae968228',
 printedPartOfSpeech:null,printedGloss:'到处找便宜货买的人',
},{
 book:'NCE4' as const,lesson:37,word:'virtual',anchorWord:'robust',placement:'before' as const,
 sourceBookSha256:'d7250bbdb39130c202a32520c49d0c0d9ad1e115fd1e14300e07c30f9719c804',sourcePDFPage:247,
 sourcePageSha256:'30d719db1cfdbd3bac150e0bbbb17f54a1a3a993d975c101cca99db702417bef',
 printedPartOfSpeech:'adj.',printedGloss:'实际上的',
},{
 book:'NCE1' as const,lesson:109,word:'a little',anchorWord:'teaspoonful',placement:'before' as const,
 sourceBookSha256:'df385269f6502f201fc5689683f9163205202e8b0b735fd9a388b2c7982ba2b3',sourcePDFPage:226,
 sourcePageSha256:'aaad1339071faa154d6036953de8960647c73a324c9b0bfbdb20f609d0c681c9',
 printedPartOfSpeech:null,printedGloss:'少许（用于不可数名词之前）',
},{
 book:'NCE3' as const,lesson:58,word:'fussy',anchorWord:'ransack',placement:'after' as const,
 // SF01 adds balcony directly after ransack; preserve that printed order in
 // either integration order. Without SF01, ransack remains the nearest row.
 sourceBookSha256:'9c3a876dbd813261b164356b97bcc6ca8b1c2653109e9b4f3e2cb3a198f90d97',sourcePDFPage:287,
 sourcePageSha256:'ba0ae2f040eb8a66d792dc6471a4086145391d55df79e5f0ecb17f904127bf44',
 printedPartOfSpeech:'adj.',printedGloss:'大惊小怪的，小题大作的',
},{
 book:'NCE1' as const,lesson:65,word:'enjoy',anchorWord:'yourself',placement:'before' as const,
 sourceBookSha256:'df385269f6502f201fc5689683f9163205202e8b0b735fd9a388b2c7982ba2b3',sourcePDFPage:134,
 sourcePageSha256:'3831361cc10c987215dcbb3b29e874e236eced16b7c01089a696f59dee1271b1',
 printedPartOfSpeech:'v.',printedGloss:'玩得快活',
}];

// The other six already have global dictionary entries: leave them untouched.
// Missing IPA is intentional; bargain hunter prints one but it is not safely
// transcribed in this patch. a little prints neither IPA nor POS.
export const reviewedSF02DictionaryEntries=[
 {book:'NCE3' as const,word:'bargain hunter',ipa:'',meaning:'到处找便宜货买的人',source:'textbook' as const},
 {book:'NCE1' as const,word:'a little',ipa:'',meaning:'少许（用于不可数名词之前）',source:'textbook' as const},
];
