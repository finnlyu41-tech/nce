import type {Word} from './model';
import {ieltsVocabularyR20Words} from './data/ielts-vocabulary-r20';
import {ieltsVocabularyBatch02Words} from './data/ielts-vocabulary-batch02';

export const ieltsFlashcardDescription='本站原创雅思辅助词卡：原有 12 项、首批 48 项及第二批 24 个情境词义，按听说读写用途与易混义项分组，整理词义、搭配及例句；多义词用短语题面提示语境。非 IELTS 官方题库，不用于推算雅思分数。';

// Written for this project; no shared deck, textbook passage or exam item is used.
export const ieltsFlashcardSeeds:Word[]=[
 {word:'curriculum',meaning:'n. 课程体系；常用搭配：a balanced curriculum（均衡的课程体系）',example:'A balanced curriculum gives students time for science, languages and the arts.',exampleTranslation:'均衡的课程体系让学生有时间学习科学、语言和艺术。',sources:[{kind:'ielts',topic:'教育',use:'writing'}]},
 {word:'tuition fees',meaning:'n. 学费；常用搭配：pay tuition fees（支付学费）',example:'I worked during the summer to help pay my tuition fees.',exampleTranslation:'我暑假打工，帮助支付自己的学费。',sources:[{kind:'ielts',topic:'教育',use:'speaking'}]},
 {word:'renewable energy',meaning:'n. 可再生能源；常用搭配：invest in renewable energy（投资可再生能源）',example:'The town plans to invest in renewable energy for its public buildings.',exampleTranslation:'这个城镇计划投资可再生能源，为公共建筑供能。',sources:[{kind:'ielts',topic:'环境',use:'writing'}]},
 {word:'biodiversity',meaning:'n. 生物多样性；常用搭配：protect biodiversity（保护生物多样性）',example:'The report describes how the new nature reserve could protect biodiversity.',exampleTranslation:'报告说明了新自然保护区可以如何保护生物多样性。',sources:[{kind:'ielts',topic:'环境',use:'reading'}]},
 {word:'automation',meaning:'n. 自动化；常用搭配：the use of automation（自动化的应用）',example:'The use of automation can change the skills that workers need.',exampleTranslation:'自动化的应用可能改变员工所需的技能。',sources:[{kind:'ielts',topic:'科技',use:'writing'}]},
 {word:'data privacy',meaning:'n. 数据隐私；常用搭配：a data privacy policy（数据隐私政策）',example:'The speaker asked everyone to read the data privacy policy before joining the service.',exampleTranslation:'发言者请大家在加入该服务前阅读数据隐私政策。',sources:[{kind:'ielts',topic:'科技',use:'listening'}]},
 {word:'sedentary lifestyle',meaning:'n. 久坐的生活方式；常用搭配：lead a sedentary lifestyle（过着久坐的生活）',example:'People who lead a sedentary lifestyle may find it difficult to make time for exercise.',exampleTranslation:'过着久坐生活的人可能觉得难以抽出时间锻炼。',sources:[{kind:'ielts',topic:'健康',use:'writing'}]},
 {word:'preventive care',meaning:'n. 预防性医疗保健；常用搭配：access to preventive care（获得预防性保健的机会）',example:'I think people in small towns should have better access to preventive care.',exampleTranslation:'我认为小城镇居民应当更容易获得预防性医疗保健。',sources:[{kind:'ielts',topic:'健康',use:'speaking'}]},
 {word:'flexible working',meaning:'n. 弹性工作安排；常用搭配：offer flexible working（提供弹性工作安排）',example:'I would like a job that offers flexible working so I can study in the evenings.',exampleTranslation:'我想找一份提供弹性工作安排的工作，这样晚上就能学习。',sources:[{kind:'ielts',topic:'工作',use:'speaking'}]},
 {word:'job security',meaning:'n. 工作保障；常用搭配：greater job security（更稳定的工作保障）',example:'During the interview, several employees said they wanted greater job security.',exampleTranslation:'在访谈中，几位员工说他们希望有更稳定的工作保障。',sources:[{kind:'ielts',topic:'工作',use:'listening'}]},
 {word:'proportion',meaning:'n. 比例；常用搭配：the proportion of households（家庭所占的比例）',example:'The proportion of households with internet access rose from 60% to 75% in the survey.',exampleTranslation:'在这项调查中，能够上网的家庭比例从 60% 升至 75%。',sources:[{kind:'ielts',topic:'图表描述',use:'writing'}]},
 {word:'fluctuate',meaning:'v. 波动；常用搭配：fluctuate between（在……之间波动）',example:'Monthly sales fluctuated between 200 and 300 units during the first half of the year.',exampleTranslation:'上半年，月销量在 200 件至 300 件之间波动。',sources:[{kind:'ielts',topic:'图表描述',use:'writing'}]},
];

export const ieltsFlashcardExamples:Word[]=[...ieltsFlashcardSeeds,...ieltsVocabularyR20Words,...ieltsVocabularyBatch02Words];
