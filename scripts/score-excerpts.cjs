// Hand-checked short excerpts from the public score previews saved in assets/reference.
// Each measure is [written pitch, duration in sixteenths, tie from previous note?].
// null is a rest. These are score transcriptions, never presented as MIDI extraction.
module.exports=[
 {
  voice:'前奏右手器乐声部',id:'fenlie',song:'分裂',artist:'周杰伦',defaultLesson:'Fmaj7',sectionLabel:'前奏开头',bpm:64,tempoLabel:'练习速度',transpose:0,
  url:'https://www.zuoquba.com/gangqinqupu/973',sourceLabel:'作曲吧 ·《分裂》C 调简易版 · 第 1 页第 1–4 小节',
  pages:[{file:'fenlie-score-1.jpg',url:'https://www.zuoquba.com/sites/default/files/inline-images/1_21.jpg',measures:[1,2,3,4]}],firstMeasure:1,
  measures:[
   [[null,2],['C4',2],['E4',2],['C4',2],[null,2],['C4',2],['E4',2],['C4',2]],
   [[null,2],['C4',2],['E4',2],['C4',2],[null,2],['C4',2],['E4',2],['C4',2]],
   [[null,2],['C4',2],['E4',2],['C4',2],[null,2],['C4',2],['E4',2],['C4',2]],
   [[null,2],['C4',2],['E4',2],['C4',2],['C4',8,true]]
  ],
  description:'从前奏的两个白键 C、E 开始。右手先练八分音符与停顿，再加左手和弦；第 4 小节相同音之间的连线表示继续按住。',
  tuning:'C 调简易谱 · 按源谱不再移调',
  simplification:'节选公开 C 调简易钢琴谱第 1 页第 1–4 小节的前奏右手器乐声部，保留八分休止、重复起音和最后的延音；这不是人声主歌，也不是整首曲谱。按该简易谱音高转录，不再移调。源谱和声为 C–F/C–Fm/C–C–C–F/C–Fm/C；左手另配 C–Fmaj7–Fm–C–C–Fmaj7–Fm 教学和声，将持续低音改为和弦，F/C 加入 E 成为 Fmaj7 并改用根音位置；不声称与原录音和声相同。左手跨度不舒服时先只弹最低音。64 BPM 为慢速练习设置，源谱未标速度。',
  harmony:[['C',0,8],['Fmaj7',8,8],['Fm',16,8],['C',24,8],['C',32,8],['Fmaj7',40,8],['Fm',48,16]]
 },
 {
  pitchNames:['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'],
  id:'qingtian',song:'晴天',artist:'周杰伦',defaultLesson:'Em7',sectionLabel:'主歌唱名短句',bpm:68,tempoLabel:'谱面速度',transpose:0,
  url:'https://www.everyonepiano.cn/Number-13074-1.html',sourceLabel:'人人钢琴网 · Jeanie《晴天》原调简单版 · 第 13–16 小节',
  pages:[{file:'qingtian-score-1.png',url:'https://www.everyonepiano.cn/Number-13074-1.html',measures:[13,14,15]},{file:'qingtian-score-2.png',url:'https://www.everyonepiano.cn/Number-13074-2.html',measures:[16]}],
  firstMeasure:13,
  measures:[
   [['D4',2],['G4',2],['G4',2],['B4',2],['C5',2],['B4',2],['A4',2],['G4',1],['A4',1]],
   [['B4',2],['B4',2],['B4',2],['B4',2],['A4',1],['B4',1],['A4',2],['G4',4]],
   [['D4',2],['G4',2],['A4',2],['B4',2],['C5',2],['B4',2],['A4',2],['G4',1],['A4',1]],
   [['B4',2],['B4',2],['B4',2],['B4',2],['A4',1],['B4',1],['A4',2],['G4',3],['F#4',1]]
  ],
  description:'从熟悉的唱名短句开始，左手每半小节换一次 Em7、Cmaj7，再落到 G。先只接手 Em7，熟悉后切换到 Cmaj7 练习。',
  tuning:'G 大调 · 保留源谱音高',
  simplification:'人工核对 Jeanie 简谱第 13–16 小节的右手单声部（第 1 页末行与第 2 页首小节），保留唱名段重复音、十六分音符及末尾引向下一句的短音，不移调。左手另配 Em7–Cmaj7–G 教学和声：在源谱 E、C、G 低音框架上加入七音，省去 G 段末尾的 F♯ 下行低音；这些七和弦是本练习的配法，不声称是原录音的逐拍和弦。68 BPM 为源谱速度。',
  harmony:[['Em7',0,8],['Cmaj7',8,8],['G',16,16],['Em7',32,8],['Cmaj7',40,8],['G',48,16]]
 },
 {
  id:'yujian',song:'遇见',artist:'孙燕姿',defaultLesson:'Fmaj7',sectionLabel:'主歌短句',bpm:92,tempoLabel:'谱面速度',transpose:4,
  url:'https://www.everyonepiano.cn/Stave-2031-1.html',sourceLabel:'人人钢琴网 · lcz_0205 精修《遇见》· 第 13–16 小节',
  pages:[{file:'yujian-score-1.png',url:'https://www.everyonepiano.cn/Stave-2031-1.html',measures:[13,14,15,16]}],firstMeasure:13,
  measures:[
   [['F4',2],['G4',2],['Ab4',2],['G4',2],['G4',2,true],['Ab4',2],['Bb4',2],['C5',2]],
   [['C5',4,true],[null,4],[null,4],['Eb5',2],['C5',2]],
   [['C5',2,true],[null,2],['Eb5',2],['Bb4',2],['Bb4',2,true],[null,2],['C5',2],['Bb4',2]],
   [['Bb4',2,true],['Ab4',6],[null,4],['Ab4',2],['G4',2]]
  ],
  description:'用全白键的主歌短句练习 Fmaj7 与 Em7。先听清旋律里的停顿，左手每小节只换一次和弦；长音跨过小节线时继续按住。',
  tuning:'教学调 C 大调 · 源谱升 4 个半音',
  simplification:'人工核对五线谱第 1 页第 13–16 小节的右手单声部；源谱为 A♭ 大调，旋律统一升高 4 个半音至 C 大调，保留休止、切分和跨小节延音。左手另配 Fmaj7–G–Em7–Am，一小节一个和弦，作为七和弦听感与接力练习，不等同于原录音伴奏。92 BPM 采用源谱标记；初学建议先选慢练，并只手动演奏一个和弦。',
  harmony:[['Fmaj7',0,16],['G',16,16],['Em7',32,16],['Am',48,16]]
 },
 {
  pitchNames:['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'],
  id:'aiaiai',song:'爱爱爱',artist:'方大同',defaultLesson:'Em7',sectionLabel:'主歌开头',bpm:88,tempoLabel:'练习速度',transpose:0,
  url:'https://www.everyonepiano.cn/Stave-8992-1.html',sourceLabel:'人人钢琴网 ·《爱爱爱》五线谱 · 第 10–13 小节',
  pages:[{file:'aiaiai-score-1.png',url:'https://www.everyonepiano.cn/Stave-8992-1.html',measures:[10,11,12,13]}],firstMeasure:10,
  measures:[
   [['C#5',16]],
   [['D5',2],['E5',2],['D5',2],['C#5',2],['C#5',2,true],['B4',2],['A4',2],['B4',2]],
   [['C#5',4],[null,4],['B4',4],[null,4]],
   [['A4',8],['F#4',6],['A4',2]]
  ],
  description:'先用按钮接住第 2 小节前两拍的 Em7，听它接回 A 的变化。旋律有 C♯、F♯ 两个黑键，可先交给播放器，自己只练左手。',
  tuning:'A 大调段落 · 保留源谱音高',
  simplification:'人工核对第 1 页第 10–13 小节带歌词的右手旋律声部，省去倚音、滚奏与同拍内声部，保留主旋律音高、长音、休止和切分；没有从伴奏最高音猜造人声旋律。源谱此处标有 A–Em7–A–D–C♯m–Bm，左手按这些代号简化为根音在下的和弦，原谱短促的伴奏改为持续和弦。本谱第 11 小节的 Em7–A 在本练习第 2 小节出现。源页未标速度，88 BPM 为入门练习设置，不称原速；保留 A 大调段落，不移调。',
  harmony:[['A',0,16],['Em7',16,8],['A',24,8],['D',32,8],['Csm',40,8],['Bm',48,16]]
 }
];
