import type {SampleLesson, SampleMaterial} from '../../sample-sequence';

/** Original fictional workplace and everyday notices for local sentence-completion practice. */
function material(value: Omit<SampleMaterial, 'instruction' | 'checklist' | 'seconds'>): SampleMaterial {
  return {
    ...value,
    instruction: 'Complete each sentence with at most two words copied from the passage.',
    seconds: 180,
    checklist: [
      '核对题干中的人员、物件、地点和适用条件。',
      '每空最多两词并逐字取自原文，保留所需单复数，不重复已有冠词。',
      '回填完整句子后检查依据、词数和语法；本课没有数字或计量单位答案。',
    ],
  };
}

export const generalSentenceLesson: SampleLesson = {
  id: 'reading-sentence-completion', skill: 'reading',
  title: 'General Training · 按实际安排补全句子',
  goal: '在工作和日常通知中找准具体安排，用符合词数与句子语法的原词填空。',
  explanation: [
    '每个英文句子留一个空，按共同指令补全。本课每空最多两词并必须取自原文，不能写自拟同义词或补上常识中的安排。',
    '先看题干问哪位人员、哪件物品或哪处地点，再用动作和条件定位原句。附近出现的另一个物件或岗位可能有不同用途。',
    '本课按证据顺序编排。每空仍需核对原句和完整题干，不能仅靠前后位置猜答案；回填时检查单复数和空格前已有的 a、the 等词。',
    '示范讲解定位、取词和回填；引导仅提示方法。保留原答及订正理由，提示后的答案与独立、限时及两轮新材料的表现分别查看。',
  ],
  boundary: '本站原创、虚构的约 110–170 英文词工作与日常短通知，每份三个句子空。180 秒是局部训练建议，不是正式阅读全卷；篇幅和难度未经专家标定。原答订正与新材料表现不换算 IELTS Band，仍需专家与学习者核验。',
  model: material({
    id: 'ielts-r09-gt-model', title: '示范 · 共用洗衣房须知',
    context: `The shared laundry room is available to residents of Elm Court. Before starting a machine, write your name on the booking sheet beside the door. The calendar above it lists maintenance visits and is not used to reserve machines. Please return when your cycle ends so that another resident can use the machine. If finished clothes have been left inside, the next user may place them in the wire basket. The cupboard contains cleaning supplies and must not be used for clothing. Leave the room tidy and remove any empty packaging. If you notice a leak, inform the caretaker immediately. The receptionist deals with lost access cards, but does not arrange repairs to the machines. A machine marked as faulty must remain unused until staff remove the sign.`,
    questions: [
      {id: 'ielts-r09-gt-model-q1', prompt: 'Residents must add their names to the _____ before starting a machine.', accepted: ['booking sheet', 'sheet'], why: '原文“Before starting a machine, write your name on the booking sheet beside the door.”对应 add their names 和 before starting。booking sheet 两词或 sheet 一词都指这份登记表，题干已有 the。calendar 记录维护来访，且原文明说不用于预约机器。'},
      {id: 'ielts-r09-gt-model-q2', prompt: 'Clothes left in a machine after the cycle ends may be moved to the _____.', accepted: ['wire basket', 'basket'], why: '原文“If finished clothes have been left inside, the next user may place them in the wire basket.”对应 after the cycle ends 和 may be moved，条件是已洗完却留在机器里的衣物。wire basket 两词或 basket 一词均为单数容器名词，题干已有 the。cupboard 装清洁用品，不能存放衣物。'},
      {id: 'ielts-r09-gt-model-q3', prompt: 'A resident who finds a leak should immediately tell the _____.', accepted: ['caretaker'], why: '原文“If you notice a leak, inform the caretaker immediately.”中 finds 对应 notice，tell 对应 inform。caretaker 为一词单数岗位名词，接题干已有 the。receptionist 处理丢失门卡且不安排机器修理；不能用自拟的 manager 替代原文岗位。'},
    ],
    hint: '按动作核对登记、移放和报告的对象；相邻表格、容器或岗位不一定负责同一事项。',
    model: '1. booking sheet（也可 sheet） / 2. wire basket（也可 basket） / 3. caretaker',
    modelNotes: [
      '先读最多两词和 copied from the passage，再看完整句子：the 后需要名词或名词短语，已有冠词不必再抄一次。',
      '第 1 题把 add their names 对回 write your name，并核对 before starting；取 booking sheet。sheet 也明确指登记表，calendar 的用途则是维护记录。',
      '第 2 题先核对洗完且留在机器里的条件，再把 moved 对回 place；取 wire basket，也可缩为 basket，排除装清洁用品的 cupboard。',
      '第 3 题把 tell 对回 inform，并核对 leak；取 caretaker。回填三句检查一词或两词、单复数和冠词，保留第一遍答案与具体订正理由。',
    ],
  }),
  guided: material({
    id: 'ielts-r09-gt-guided', title: '带着做 · 食品备料助手的班次',
    context: `New pantry assistants should report to the supervisor before their first shift. Collect an apron from the locker beside the staff entrance before entering the preparation area. Disposable gloves are kept in a separate cupboard and are replaced whenever they become damaged. Any goods delivered during the shift must be recorded in the delivery book. The temperature chart is used for readings from the cold store, so it is not the place to record arriving supplies. When washing vegetables at the large bench, stand on the rubber mat to keep your footing comfortable. Metal trays are for carrying washed vegetables to the kitchen. At the end of the shift, leave the apron for cleaning and tell the supervisor about any missing equipment. Do not take supplies home.`,
    questions: [
      {id: 'ielts-r09-gt-guided-q1', prompt: 'Before entering the preparation area, assistants collect an apron from the _____.', accepted: ['locker'], why: '原文“Collect an apron from the locker beside the staff entrance before entering the preparation area.”直接对应取围裙的地点与进入备料区之前的条件。locker 为一词单数名词，题干已有 the。cupboard 保存手套，不是领取围裙的地点。'},
      {id: 'ielts-r09-gt-guided-q2', prompt: 'Goods arriving during a shift must be entered in the _____.', accepted: ['delivery book', 'book'], why: '原文“Any goods delivered during the shift must be recorded in the delivery book.”中 arriving 对应 delivered，entered 对应 recorded。delivery book 两词或 book 一词均指唯一的到货记录簿，题干已有 the。temperature chart 记录冷藏库读数，本空不填温度或计量单位。'},
      {id: 'ielts-r09-gt-guided-q3', prompt: 'Assistants stand on a _____ while washing vegetables at the large bench.', accepted: ['rubber mat', 'mat'], why: '原文“When washing vegetables at the large bench, stand on the rubber mat”对应 while washing 和 stand on。rubber mat 两词或 mat 一词都指脚下垫子，为单数，题干已有 a。Metal trays 是运送洗好蔬菜的托盘，不是站立位置；不可自拟 carpet 代替。'},
    ],
    hint: '先标出领取、登记和站立三个动作，再核对每种存放处、记录或用品负责什么。',
  }),
  independent: material({
    id: 'ielts-r09-gt-independent', title: '自己试 · 自行车维修取车说明',
    context: `When you leave a bicycle at Brook Repair, staff give you a claim ticket. Keep it until collection, since the mechanic uses it to match you with the bicycle. The inspection form remains in the workshop and does not serve as proof for customers. After receiving a message that the work is complete, collect the bicycle through the side gate beside the mural. The front door is used for enquiries and can be busy with customers waiting for estimates. At collection, a member of staff will explain the repair before asking for payment. Once you have paid, you receive a receipt. A written estimate shows the likely cost before work begins, but it does not show that payment has been made. Please check that you have your bicycle and belongings before leaving.`,
    questions: [
      {id: 'ielts-r09-gt-independent-q1', prompt: 'Customers are given a _____ to identify their bicycles at collection.', accepted: ['claim ticket', 'ticket'], why: '原文“staff give you a claim ticket”及“the mechanic uses it to match you with the bicycle”对应 given 和 identify their bicycles。claim ticket 两词或 ticket 一词均指给顾客的凭证，为单数，题干已有 a。inspection form 留在车间且不作顾客凭证。'},
      {id: 'ielts-r09-gt-independent-q2', prompt: 'Completed bicycles should be collected through the _____ beside the mural.', accepted: ['side gate', 'gate'], why: '原文“collect the bicycle through the side gate beside the mural”对应 completed bicycles 的领取入口。side gate 两词或 gate 一词都指壁画旁同一处门，题干已有 the 和 beside the mural，缩短不改变定位。front door 用于咨询，不是规定的取车入口。'},
      {id: 'ielts-r09-gt-independent-q3', prompt: 'After making payment, customers receive a _____.', accepted: ['receipt'], why: '原文“Once you have paid, you receive a receipt.”对应 after making payment；receipt 为一词单数名词，题干已有 a。written estimate 只在开工前说明预计费用，不能证明已付款；claim ticket 证明取车身份，也不是此时发出的付款凭据。'},
    ],
    hint: '沿着交车、取车和付款的流程核对物件与入口；不要交换不同阶段的文件用途。',
  }),
  timed: material({
    id: 'ielts-r09-gt-timed', title: '训练用限时 · 社区食品包领取',
    context: `Harbour Pantry offers food parcels to residents who have registered with the coordinator. If you are visiting for the first time, bring a cloth bag so that loose items can be carried safely. Cardboard boxes at the kitchen door are for incoming donations and are not set aside for visitors. Prepared parcels are placed in the entrance hall, where a volunteer checks names before handing them over. The kitchen is used for sorting food, and visitors should wait outside it. If you cannot attend, a neighbour may collect your parcel with a signed note giving permission. A friend who is not your neighbour cannot collect under this arrangement. Tell the coordinator beforehand if any food must be avoided. The volunteer will explain what is included, and you may decline an item without losing the rest of your parcel.`,
    questions: [
      {id: 'ielts-r09-gt-timed-q1', prompt: 'Visitors coming for the first time should bring a _____.', accepted: ['cloth bag', 'bag'], why: '原文“If you are visiting for the first time, bring a cloth bag”对应 coming for the first time 和 should bring。cloth bag 两词或 bag 一词均指应自带的容器，为单数，题干已有 a。Cardboard boxes 供接收捐赠而非访客使用，不能因同为容器而填它。'},
      {id: 'ielts-r09-gt-timed-q2', prompt: 'Food parcels that are ready for collection are kept in the _____.', accepted: ['entrance hall', 'hall'], why: '原文“Prepared parcels are placed in the entrance hall”对应 ready for collection 和 kept。entrance hall 两词或 hall 一词指同一领取区域，为单数地点名词，题干已有 the。kitchen 用于分拣食品且访客应在外等候，不是成包食品存放的领取区。'},
      {id: 'ielts-r09-gt-timed-q3', prompt: 'A _____ may collect for an absent resident if they present a signed note giving permission.', accepted: ['neighbour'], why: '原文“If you cannot attend, a neighbour may collect your parcel with a signed note giving permission.”对应 absent resident，且保留签署授权的条件。neighbour 为一词单数人员名词，题干已有 A，不抄冠词。friend 若不是邻居被明确排除；不能凭日常经验自行改成 relative。'},
    ],
    hint: '核对首次来访、待领物品和代领条件；同一种容器或熟人身份未必适用相同安排。',
  }),
  reviews: [
    material({
      id: 'ielts-r09-gt-review-a', title: '隔天新题 · 图书馆借用乐器',
      context: `Meadow Library lends musical instruments to registered members who have completed a short introduction. Each instrument is issued in a padded case to protect it during the journey home. The display stand in the library is only for instruments being shown to visitors. Inside the case, a tuning guide explains how to check the strings before practice. A practice diary is also available, but it records the borrower's sessions rather than explaining adjustments. If you want to keep an instrument longer, ask at the service desk before the return date. The information table carries leaflets about concerts and cannot approve loan extensions. Bring the instrument back with its accessories and tell staff if anything has changed. Do not try to repair a broken string without first contacting the library.`,
      questions: [
        {id: 'ielts-r09-gt-review-a-q1', prompt: 'Each borrowed instrument travels home in a _____.', accepted: ['padded case', 'case'], why: '原文“Each instrument is issued in a padded case to protect it during the journey home.”对应 borrowed instrument travels home。padded case 两词或 case 一词都指随借出乐器的盒子，为单数，题干已有 a。display stand 只用于馆内展示，不用于带回家。'},
        {id: 'ielts-r09-gt-review-a-q2', prompt: 'Borrowers can use a _____ to learn how to check the strings.', accepted: ['tuning guide', 'guide'], why: '原文“a tuning guide explains how to check the strings before practice”对应 learn how to check。tuning guide 两词或 guide 一词均指这份说明，为单数，题干已有 a。practice diary 记录练习过程而不解释调整方法，不能选它或写自拟的 manual。'},
        {id: 'ielts-r09-gt-review-a-q3', prompt: 'Requests for extra borrowing time should be made at the library’s _____.', accepted: ['service desk', 'desk'], why: '原文“If you want to keep an instrument longer, ask at the service desk before the return date.”将 keep ... longer 改写为 extra borrowing time。service desk 两词或 desk 一词均指办理该请求的唯一服务台，题干已限定在图书馆内办理请求的具体位置。information table 提供演出传单且不能批准延长借用。'},
      ],
      hint: '区分运输保护、使用说明和办理请求的用途；延长借用与归还报告也有不同动作。',
    }),
    material({
      id: 'ielts-r09-gt-review-b', title: '下一轮新题 · 社区菜园临时供水',
      context: `Notice to gardeners at Cedar Plots: work on the main water pipes will begin this week. While the taps are unavailable, use water from the storage tank beside the shed. The pond is reserved for wildlife and must not be used for watering plots. You may borrow watering cans from the shed to carry water. Return them to the rack after use so that other gardeners can find them. The wheelbarrows must be used only for moving compost. Updates on the repair will appear on the noticeboard by the entrance. The mailbox is checked for letters about plot membership, and staff will not place repair updates there. Please keep the path to the shed open while workers move equipment. The caretaker will inspect the temporary supply each morning.`,
      questions: [
        {id: 'ielts-r09-gt-review-b-q1', prompt: 'During the pipe work, gardeners obtain water from the _____ beside the shed.', accepted: ['storage tank', 'tank'], why: '原文“While the taps are unavailable, use water from the storage tank beside the shed.”对应 during the pipe work 和 obtain water。storage tank 两词或 tank 一词都指棚屋旁的临时水源，为单数，题干已有 the。pond 保留给野生动物且禁止用于菜地浇水。'},
        {id: 'ielts-r09-gt-review-b-q2', prompt: 'Gardeners may borrow _____ to carry water to their plots.', accepted: ['watering cans', 'cans'], why: '原文“You may borrow watering cans from the shed to carry water.”对应 borrow 和 carry water。watering cans 两词或 cans 一词均指可借取的搬水器具，保留原文复数，题干不需添加冠词。wheelbarrows 只用于搬堆肥，不能混为可借取的运水工具。'},
        {id: 'ielts-r09-gt-review-b-q3', prompt: 'News about the repair will be displayed on the _____.', accepted: ['noticeboard'], why: '原文“Updates on the repair will appear on the noticeboard by the entrance.”中 News 对应 Updates，displayed 对应 appear。noticeboard 为一词单数名词，题干已有 the。mailbox 处理菜地会员信件，原文明说不会在那里放维修更新；不能写未出现的 board 替代原词。'},
      ],
      hint: '核对临时水源、可借器具和信息发布处，特别留意禁止用途与代词所指的物件。',
    }),
  ],
};
