import type {SampleLesson, SampleMaterial} from '../../sample-sequence';

/** Original fictional workplace, everyday and community notices for paragraph-information practice. */
const paragraphInstruction = 'Which paragraph contains each item? Write ONE letter, A–D, per item. You may use any paragraph letter more than once. You do not need to use every letter.';
function material(value: Omit<SampleMaterial, 'instruction' | 'checklist' | 'seconds'>): SampleMaterial {
  return {
    ...value,
    instruction: paragraphInstruction,
    seconds: 180,
    checklist: [
      '每题只写一个段落字母 A–D。',
      '核对题干要求的完整信息，不把同词出现或段落主旨当作依据。',
      '逐题核验；字母可复用，也可能有段落未用。',
    ],
  };
}

export const generalInformationLesson: SampleLesson = {
  id: 'reading-information-matching', skill: 'reading',
  title: 'General Training · 把具体信息配到段落',
  goal: '在工作、日常和社区通知中核对具体信息，把每条描述配到有完整依据的段落。',
  explanation: [
    '这是 General Training 段落信息匹配练习。题目要找具体细节、原因、条件或操作关系，不是为每段选择主旨标题；段落主题相符仍需核对所问信息。',
    '先圈出题干的对象、动作与限制，再把英文改写对回原句。相同单词可能在相邻段落出现，须检查是谁做什么、在何种条件下做，以及原因或结果是否完整。',
    '先读本组英文指令：每题写一个 A–D 段落字母。本组允许字母复用，也不必用完所有字母；不能强行每段选一次。每题独立找证据，不一概假设题目按原文顺序排列。',
    '示范展示定位与排除近似信息；后续提示仅保留方法。先保存原答，再引用依据写订正理由；两轮新材料用于重新核对，提示后的表现与独立表现分开查看。',
  ],
  boundary: '本站原创虚构的 General Training 工作、日常与社区短材料，每份四段、三条信息描述，正文约 180–230 英文词。四段三题和 180 秒是本地局部教学安排，不是官方固定题数或分项时限，也不代表完整阅读全卷。篇幅和难度未经专家标定；订正及新材料表现不换算 IELTS Band，仍需专家与学习者核验。',
  model: material({
    id: 'ielts-r05-gt-model', title: "示范 · 社区修理日下午志愿者通知",
    context: `Which paragraph contains each item? Write ONE letter, A–D, per item. You may use any paragraph letter more than once. You do not need to use every letter.

A
The Westbank Repair Afternoon welcomes small household objects on the first Saturday of each month. Book a place by completing the online form. For an item that cannot fit on an ordinary chair, describe its size in the form before you come. Organisers will reply about suitable space.

B
Volunteers arrive twenty minutes before visitors to arrange chairs and cover workbenches. Put coats in the upstairs cupboard, leaving the entrance clear for people carrying objects. The welcome desk records each visitor’s name and directs them to a workbench; it does not decide whether an object can be repaired.

C
On their first visit, volunteers work beside a regular helper because the tools may be unfamiliar. Each volunteer is given a work area for that afternoon. Volunteers may move to another work area after the team leader has agreed to the change. This helps staff keep track of available help.

D
Before leaving, volunteers return borrowed tools to the marked boxes and tell the team leader about any damage. Visitors take their objects home even when a repair is unfinished. A short feedback form asks which arrangements were helpful. Comments are discussed at the next planning meeting, rather than during repairs.`,
    questions: [
      {id: 'ielts-r05-gt-model-q1', prompt: "a requirement before a volunteer can change their assigned work area", options: ['A', 'B', 'C', 'D'], accepted: ['C'], why: "C 的“Volunteers may move to another work area after the team leader has agreed to the change.”说明调换须先获得同意。B 讲开场准备，未说明调换工作区的许可。"},
      {id: 'ielts-r05-gt-model-q2', prompt: "information to provide in advance when bringing an item too large for a normal chair", options: ['A', 'B', 'C', 'D'], accepted: ['A'], why: "A 的“For an item that cannot fit on an ordinary chair, describe its size in the form before you come.”完整对应物品过大、提前在表中描述尺寸的条件。B 也提到搬物品的访客，但讲的是保持入口畅通。"},
      {id: 'ielts-r05-gt-model-q3', prompt: "a reason newcomers are paired with an experienced volunteer", options: ['A', 'B', 'C', 'D'], accepted: ['C'], why: "C 的“On their first visit, volunteers work beside a regular helper because the tools may be unfamiliar.”同时给出首次参加、与熟练助手合作及原因。B 的提前到场是布置准备，未解释这种配对。"},
    ],
    hint: '圈出每题的对象、动作与条件，核对完整句意，再确定段落字母；不要仅凭同词出现或段落位置作答。',
    model: '1. C / 2. A / 3. C',
    modelNotes: [
      '先读英文指令，确认每题写一个字母、字母可复用且不必用完；本组不会按每段一次分配。',
      '第 1 题的 requirement 对应同意调换工作区的条件。C 有 after the team leader has agreed，B 的布置工作没有这项条件。',
      '第 2 题同时要求物品过大和提前提供信息，A 写明在表中描述尺寸；不能只看到其他段提到物品就选它。',
      '第 3 题问配对的原因，C 用 because 连接首次志愿者与不熟悉工具。第 1、3 题是同段的不同细节，复用 C 符合指令；题序也不等于段落顺序。',
    ],
  }),
  guided: material({
    id: 'ielts-r05-gt-guided', title: "带着做 · 员工共乘安排",
    context: `Which paragraph contains each item? Write ONE letter, A–D, per item. You may use any paragraph letter more than once. You do not need to use every letter.

A
The Elmfield Offices travel group helps colleagues share journeys to work. Employees can join even without a car. The group matches journeys using starting areas and usual arrival times. It cannot guarantee a lift for every shift, so members should keep another travel plan available.

B
Car drivers and passengers decide together how to share fuel costs before their first journey. The office does not set a fixed charge, since journey lengths vary. Drivers must enter their vehicle details on the staff travel page. Parking permits for shared cars are collected from reception after registration.

C
Members meet in the marked bays behind the building. Leave the main entrance clear for delivery vehicles, even if a passenger is running late. Staff working an extra shift can ask for a different travel partner through the group page. A match depends on another member having a suitable route.

D
If a regular driver becomes unavailable, passengers receive a message from the coordinator with other members’ contact details. Each passenger then arranges a replacement journey directly. Members who repeatedly wait for a late partner can ask the coordinator to review the pairing. The request should include the dates of the delays.`,
    questions: [
      {id: 'ielts-r05-gt-guided-q1', prompt: "what passengers should do after receiving possible replacement contacts", options: ['A', 'B', 'C', 'D'], accepted: ['D'], why: "D 的“If a regular driver becomes unavailable, passengers receive a message from the coordinator with other members’ contact details.”及“Each passenger then arranges a replacement journey directly.”说明收到联系人后由乘客直接安排替代行程。C 的配对申请针对额外班次，触发情境不同。"},
      {id: 'ielts-r05-gt-guided-q2', prompt: "a reason the workplace does not choose a standard payment for shared journeys", options: ['A', 'B', 'C', 'D'], accepted: ['B'], why: "B 的“The office does not set a fixed charge, since journey lengths vary.”把不设统一费用与路程长短不同联系起来。A 讲能否配到车，未解释分摊费用。"},
      {id: 'ielts-r05-gt-guided-q3', prompt: "information to include in a request to review a pairing after repeatedly waiting for a late partner", options: ['A', 'B', 'C', 'D'], accepted: ['D'], why: "D 的“Members who repeatedly wait for a late partner can ask the coordinator to review the pairing.”及“The request should include the dates of the delays.”对应反复等候、请求复核与所需日期。C 的额外班次申请未给出这项日期要求。"},
    ],
    hint: '圈出每题的对象、动作与条件，核对完整句意，再确定段落字母；不要仅凭同词出现或段落位置作答。',
  }),
  independent: material({
    id: 'ielts-r05-gt-independent', title: "自己试 · 公寓包裹保管说明",
    context: `Which paragraph contains each item? Write ONE letter, A–D, per item. You may use any paragraph letter more than once. You do not need to use every letter.

A
Drivers may leave residents’ parcels at the Birch House desk during staffed hours. Staff send a message when a parcel has been logged, so residents should wait for that message before coming downstairs. Deliveries requiring immediate refrigeration are declined because the desk has no cold storage equipment.

B
To collect a parcel, show the collection code from the staff message and a document bearing your name. If someone else collects for you, send their name to the desk in advance. That person must bring their own identification and the code.

C
Parcels are stored on shelves behind the desk for five days. After that period, staff contact the delivery company about returning them. The shelves are labelled by flat number, but residents must not enter the storage area. Oversized parcels may be left beside the shelves without blocking the fire exit.

D
Residents who expect to be away longer than the storage period should contact the sender before the parcel is dispatched. Ask the sender to choose a later delivery date or another address. Desk staff cannot alter a delivery date with the carrier. Report damaged packaging when collecting so that staff can record it.`,
    questions: [
      {id: 'ielts-r05-gt-independent-q1', prompt: "the arrangements required when someone collects a parcel for another resident", options: ['A', 'B', 'C', 'D'], accepted: ['B'], why: "B 的“If someone else collects for you, send their name to the desk in advance.”及“That person must bring their own identification and the code.”给出提前报姓名、代领人证件和代码三项安排。C 的存放规则未说明代领手续。"},
      {id: 'ielts-r05-gt-independent-q2', prompt: "actions recommended for a resident whose absence will exceed the parcel storage period", options: ['A', 'B', 'C', 'D'], accepted: ['D'], why: "D 的“Residents who expect to be away longer than the storage period should contact the sender before the parcel is dispatched.”及“Ask the sender to choose a later delivery date or another address.”完整对应超出保管期的离家情境与建议行动。C 虽说明保管期和退件流程，却不是给这类住户的提前安排建议。"},
      {id: 'ielts-r05-gt-independent-q3', prompt: "why a particular kind of delivery is refused", options: ['A', 'B', 'C', 'D'], accepted: ['A'], why: "A 的“Deliveries requiring immediate refrigeration are declined because the desk has no cold storage equipment.”同时说明拒收类别和原因。C 讲大包裹怎样摆放，未给出拒收理由。"},
    ],
    hint: '圈出每题的对象、动作与条件，核对完整句意，再确定段落字母；不要仅凭同词出现或段落位置作答。',
  }),
  timed: material({
    id: 'ielts-r05-gt-timed', title: "训练用限时 · 社区泳池关闭期间安排",
    context: `Which paragraph contains each item? Write ONE letter, A–D, per item. You may use any paragraph letter more than once. You do not need to use every letter.

A
Brookside Pool will close for ceiling repairs during the second week of November. The changing rooms will also be inaccessible because contractors need the corridor for equipment. Classes held in the separate exercise studio will continue as planned. Studio visitors should enter through the garden gate during the work.

B
Swimming lesson bookings will move automatically to the same time in the following week. Customers who cannot attend the new date may request a credit through their online account. Telephone staff can explain the process, but requests are recorded through the account so that booking details remain attached.

C
Annual pass holders can use Green Lane Pool during the closure by showing their Brookside membership card. Green Lane has fewer lanes, so entry may be delayed. Check its live attendance page before travelling. The page shows current visitor numbers rather than a timetable of swimming lessons.

D
The reception desk at Brookside will remain open on weekday mornings for enquiries about bookings and lost property. Objects left before the closure will be kept there until repairs finish. If you recognise an object in the online photographs, describe a feature that is not visible in the photograph before collecting it.`,
    questions: [
      {id: 'ielts-r05-gt-timed-q1', prompt: "a way to find out how crowded the alternative pool is before making a journey", options: ['A', 'B', 'C', 'D'], accepted: ['C'], why: "C 的“Check its live attendance page before travelling.”及“The page shows current visitor numbers rather than a timetable of swimming lessons.”说明出发前查看当前人数的方法。B 的网上账户用于登记预约处理，未说明泳池当前人数。"},
      {id: 'ielts-r05-gt-timed-q2', prompt: "a reason the changing rooms cannot be used during the repairs", options: ['A', 'B', 'C', 'D'], accepted: ['A'], why: "A 的“The changing rooms will also be inaccessible because contractors need the corridor for equipment.”把无法进入更衣室与承包商使用走廊放设备联系起来。B 讲课程改期，未解释更衣室的关闭原因。"},
      {id: 'ielts-r05-gt-timed-q3', prompt: "how to support a claim to an object shown in an online photograph", options: ['A', 'B', 'C', 'D'], accepted: ['D'], why: "D 的“If you recognise an object in the online photographs, describe a feature that is not visible in the photograph before collecting it.”说明领取前须描述照片未显示的特征。C 的会员卡用于使用替代泳池，未说明如何支持对照片中物品的认领。"},
    ],
    hint: '圈出每题的对象、动作与条件，核对完整句意，再确定段落字母；不要仅凭同词出现或段落位置作答。',
  }),
  reviews: [
    material({
      id: 'ielts-r05-gt-review-a', title: "隔天新题 · 流动社区记忆档案车",
      context: `Which paragraph contains each item? Write ONE letter, A–D, per item. You may use any paragraph letter more than once. You do not need to use every letter.

A
The Meadow Memory Bus visits housing estates to collect residents’ stories for a local archive. It parks beside the community hall on Wednesday mornings. A recording appointment lasts fifteen minutes and focuses on one memory of the area. The archive accepts everyday experiences; stories need not describe a major event.

B
People can book a recording by phone or ask for an available slot when the bus arrives. When booking, mention if you need the entrance ramp so that staff can leave extra time. An interpreter can attend with you, but you must arrange this person before the visit.

C
You may bring a photograph connected with your story. Staff can scan it on the bus and return the original before you leave. They ask for the names of people shown when you know them. Bringing a photograph is optional, and the service does not accept donations of original objects.

D
The service asks visitors to complete a comment card after their appointment. Cards can be placed in the locked box by the exit, without adding a name. The team uses comments to improve visits. If you want a reply about a concern, leave contact details on a separate request form.`,
      questions: [
        {id: 'ielts-r05-gt-review-a-q1', prompt: "an accessibility need to mention while booking and the reason for mentioning it", options: ['A', 'B', 'C', 'D'], accepted: ['B'], why: "B 的“When booking, mention if you need the entrance ramp so that staff can leave extra time.”同时说明预约时告知坡道需求及预留时间的目的。A 的停车地点未说明这一预约安排。"},
        {id: 'ielts-r05-gt-review-a-q2', prompt: "how to submit feedback without identifying yourself", options: ['A', 'B', 'C', 'D'], accepted: ['D'], why: "D 的“Cards can be placed in the locked box by the exit, without adding a name.”给出不写姓名的意见卡提交方式。B 的电话预约和现场时段询问未说明匿名反馈。"},
        {id: 'ielts-r05-gt-review-a-q3', prompt: "support that a visitor must arrange personally before the appointment", options: ['A', 'B', 'C', 'D'], accepted: ['B'], why: "B 的“An interpreter can attend with you, but you must arrange this person before the visit.”说明翻译陪同须由访客提前安排。C 的扫描由工作人员提供，未要求访客自行提前找人。"},
      ],
      hint: '圈出每题的对象、动作与条件，核对完整句意，再确定段落字母；不要仅凭同词出现或段落位置作答。',
    }),
    material({
      id: 'ielts-r05-gt-review-b', title: "下一轮新题 · 周末衣物交换活动",
      context: `Which paragraph contains each item? Write ONE letter, A–D, per item. You may use any paragraph letter more than once. You do not need to use every letter.

A
Residents may bring clean clothes to the Rowan Hall exchange on Sunday. Items are checked at the entrance before tokens are issued. Clothes with missing buttons are accepted if the rest of the item is in good condition. Underwear is not accepted, even when unused and still in its packaging.

B
Each accepted item earns one token that can be exchanged for another item. Tokens have no cash value and cannot be used at later events. Visitors may attend without donating clothes, but they will need to buy tokens at the desk. Money collected pays for hall hire.

C
Clothes are arranged by type rather than by size, since labels differ between makers. You may use the curtained area to try on an item before choosing it. Volunteers replace items on the rails if they do not suit you. Leave bags outside that area to keep the floor clear.

D
At the end of the event, remaining clothes are offered to a sewing group for alteration projects. The group cannot use every item, so rejected pieces go to a textile collection service. Donors who want an unchosen item back must tell the entrance volunteer when they first hand it over.`,
      questions: [
        {id: 'ielts-r05-gt-review-b-q1', prompt: "the destinations for clothes left after the exchange, depending on whether they can be used", options: ['A', 'B', 'C', 'D'], accepted: ['D'], why: "D 的“At the end of the event, remaining clothes are offered to a sewing group for alteration projects.”及“The group cannot use every item, so rejected pieces go to a textile collection service.”说明剩余衣物先供缝纫小组挑选，未被采用的交纺织品收集服务。A 讲入场验收，未说明活动结束后的去向。"},
        {id: 'ielts-r05-gt-review-b-q2', prompt: "an imperfection that does not prevent a clothing donation from being accepted, under a stated condition", options: ['A', 'B', 'C', 'D'], accepted: ['A'], why: "A 的“Clothes with missing buttons are accepted if the rest of the item is in good condition.”说明缺纽扣仍可接收，但其余部分须完好。D 的修改项目发生在活动后，不能代替入场接收条件。"},
        {id: 'ielts-r05-gt-review-b-q3', prompt: "an explanation for grouping items without using their size labels", options: ['A', 'B', 'C', 'D'], accepted: ['C'], why: "C 的“Clothes are arranged by type rather than by size, since labels differ between makers.”把按种类而非尺寸排列与厂家标签不同联系起来。B 讲交换凭证的价值，未说明衣物如何排列。"},
      ],
      hint: '圈出每题的对象、动作与条件，核对完整句意，再确定段落字母；不要仅凭同词出现或段落位置作答。',
    }),
  ],
};
