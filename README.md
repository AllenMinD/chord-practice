# CHORD / 现代和弦练习

一个面向完全零基础学习者的本地和弦学习原型，无需构建步骤。从找到 C 开始，通过听声音、点琴键、比较变化和短伴奏，逐步认识现代和弦代号。

## 运行

首次运行先安装本地谱面依赖：

```bash
npm install
```

之后直接打开 `index.html` 即可使用。为获得更稳定的浏览器音频体验，也可以在项目目录启动静态服务器：

```bash
python3 -m http.server 4173
```

然后访问 `http://127.0.0.1:4173`。

## 功能

- 独立“和弦乐理”模块：14 课、42 个阅读 / 试听 / 练习阶段，28 道带解析的小练习。从音名、半音与音阶，学习三和弦、级数和进行，再认识七和弦、sus、add9、斜线低音、借用、次属、扩展和弦与减和弦。零基础可按顺序学习，也能跳课查阅。
- 乐理讲解分成每课 3 小步，每步配套五线谱和固定音域的钢琴键盘。复用本机 OpenSheetMusicDisplay，由同一份示范音高与音名生成 MusicXML；可切换逐音位置 / 和弦叠写、显示或隐藏音名辅助，并查看谱号、线、间和加线的中文说明。谱上音符可点击或用 Enter / 空格试听，与相应琴键同步高亮；点击示例外的琴键会补充单音谱面。
- 乐理选音题直接在琴键上作答，所选音实时显示在五线谱上，不提前展示答案；选择题可展开配套谱面与键盘辅助思考。编号仅用于对应音符与琴键，不表示级数或指法。
- 乐理示范显示真实组成音和琴键，支持逐键、逐音、和弦和短进行试听；复用 `ChordInstrument` 与本机钢琴采样，静音、切课、切页及页面隐藏时停止。概念示范明确标注为和声教学音组，不新增歌曲或旋律。学完对应课可进入已有歌曲与共享播放器。
- 乐理进度单独使用 `chord-theory-v1` 存在本机，不影响已有新手进度；两道题均答对并点击完成才标为已完成。选音题区分缺音 / 多音，答错可重试，提示可展开；刷新后恢复已完成的阅读 / 试听阶段，未完成的课后题会从第一题重新练。保存失败时显示提示。
- 3 节新手课程、20 个互动步骤：C/Cm 起步 → F/Fm 迁移 → Cmaj7/C7/Cm7
- 引导找键 → 听合奏 → 只改变一个音 → 撤掉提示独立找音 → 4 小节原创伴奏跟弹
- 提示会具体指出保留、取消和移动哪些音；使用提示或收到纠错后，不计为独立找回
- 本机 `localStorage` 保存课程步骤和独立找回记录，隔天展示复习入口；存储不可用时仍可继续本次学习
- 8 个原有歌曲和弦案例保留在“歌曲与和弦库”，构成公式与术语默认折叠
- 和弦详情可切换“和弦按键 / 对应音阶”，区分根音、和弦音与其余音阶音，显示音名和级数；支持逐键试听、顺序播放与停止，切课或离开页面自动停止。音阶是入门练习的一种选择，并非歌曲唯一适用的音阶。
- 歌曲入口提供 7 首歌：Imagine、Wonderwall、Dreams、Just the Two of Us，以及周杰伦《晴天》、孙燕姿《遇见》、方大同《爱爱爱》。共用练习播放器，提供可核对的 4–8 小节旋律节选，保留旋律与切分节奏，双手/分手、慢速、暂停继续、分段循环与 MusicXML 下载
- 可在歌曲入口换歌练同一和弦；曲中没有该和弦时选用该曲默认课程。中文歌曲先练 4 小节，配合来源说明中的移调与教学和声。
- 本课和弦自动选中并随课程切换，其余和弦可手动标记；绿色只标出选中和弦与当时属于该和弦的旋律音，橙色标记播放位置
- 所有练习曲可开启“手动演奏本课和弦”：只留空本课和弦的左手伴奏，旋律与其他和弦继续播放；按钮亮起时点击补上和弦，也可连接 MIDI 键盘逐音演奏
- 练习曲起播、重新开始、分段起播或点击小节起播时，先按当前速度给出 4 拍预备（首拍重音）；屏幕与悬浮按钮同步显示 1–4，预备期间谱面不前进。中途暂停后继续、连续循环接回时不重复预备拍
- Salamander Grand Piano 多采样真钢琴音色，覆盖和弦与键盘单音播放
- 同一起始音的两选一听辨，附可反复播放的对比示范；先听题目再答题，按已接触的内容扩展题池
- 两组八度虚拟钢琴、按音名判定与跨八度选择
- `@tonejs/midi` 精确读取 MIDI 事件，OpenSheetMusicDisplay 将 MusicXML 排成正式五线谱
- 桌面侧栏和移动端底栏两套响应式导航

歌曲案例用于帮助学习者定位和弦听感；现场、改编或移调版本可能使用不同调性。

新手课程在屏幕上记录找音与跟弹体验，并提供真实钢琴上的起步指法。它不会把屏幕点选判为真实双手演奏能力。MIDI 输入用于所有歌曲练习的手动伴奏，尚未用于新手课程判题；未接入麦克风识别。

手动演奏默认关闭，开启后随本课和弦切换；勾选的其他“已学和弦”仍自动播放。点击演奏按钮（或聚焦后按 Enter / 空格）会弹出整个本课和弦；MIDI 则按实际键位、力度与松键发声，支持延音踏板，组成音亮起并提示缺音或多音。按钮可提前试弹，曲子不会等待输入。暂停、关闭开关、静音、切页或切换课程会停止当前手动音。

演奏按钮滚出视野后，会自动固定到内容左侧和弦列表下的空白处，并同步当前和弦、轮到你演奏及已补上的提示。原按钮回到视野时浮动按钮收起。窄屏没有左侧空白时，改为底部紧凑按钮，避开移动导航；关闭手动模式或离开课程时隐藏。

MIDI 需要支持 Web MIDI 的浏览器，在本机 `http://127.0.0.1:4173` 或 HTTPS 页面点击“连接 MIDI 键盘”并允许访问。设备断开时会清理按音，重新插入可自动连接；切课沿用已取得的连接权限。不支持 MIDI 或拒绝授权时，仍可用演奏按钮。此功能只接收输入，不向外部设备发送 MIDI。

## 验证

```bash
npm run check
npm test
```

测试覆盖新手课程、歌曲目录、原始 MIDI / 图片曲谱来源与移调、每小节双手时值、跨和弦高亮、手动留空、MIDI 输入生命周期，以及未来曲目数据的完整性验证。

乐理模型测试还覆盖示范音名与实际音高一致、关键和弦结构、判题反馈和异常进度恢复。乐理内容为入门解释，可参阅 [Open Music Theory 七和弦](https://viva.pressbooks.pub/openmusictheory/chapter/seventh-chords/) 与 [Tonicization](https://viva.pressbooks.pub/openmusictheory/chapter/tonicization/)。屏幕练习完成不等同于实际钢琴演奏能力。

`theory-score.js` 的测试核对所有示范在两种谱面布局下的音高与升降号拼写、八度边界、线 / 间位置，以及空白答题谱不泄露正确音符。

## 音色授权

钢琴音色来自 Alexander Holm 录制的 **Salamander Grand Piano V3**（Yamaha C5 Grand Piano），采用 [Creative Commons Attribution 3.0](https://creativecommons.org/licenses/by/3.0/) 授权。项目内置当前键盘音域使用的精简采样集，原始样本由 Tone.js 项目提供 MP3 版本。

## 歌曲来源与统一标准

未来所有练习曲必须遵循 [PRACTICE_SONGS.md](PRACTICE_SONGS.md)，通过共享 `practice-model.js`、`practice-catalog.js` 和 `practice-player.js` 接入；项目约定记录在 [AGENTS.md](AGENTS.md)。同一份音符数据生成声音和谱面，歌曲切换沿用统一功能，学习标记按歌曲隔离保存。

| 曲目 | 当前节选来源 | 处理 |
| --- | --- | --- |
| Imagine | [BitMidi · John Lennon - Imagine.mid](https://bitmidi.com/john-lennon-imagine-mid)，`imagine-melody.mid` 的 harmonica 轨 | 主歌 8 小节；C–Cmaj7–F 左手简化，Cmaj7 在每两小节的第一小节最后一拍进入 |
| Wonderwall | [MIDIdb 免费 Demo](https://www.mididb.com/oasis/wonderwall-midi/)，`wonderwall-demo.mid` 的 oboe 轨 | 主歌 8 小节；整体降两个半音对应本课键位；扫弦简化，保留 Cadd9 后提前换和弦的位置 |
| Dreams | [Midis101 · Fleetwood Mac Dreams](https://www.midis101.com/free-midi/45440-fleetwood-mac-dreams)，`dreams-melody.mid` 的 Melody / flute 轨 | 副歌 8 小节；旋律提高一个八度，左手 Fmaj7–G |
| Just the Two of Us | [MIDIdb 免费 Demo](https://www.mididb.com/grover-washington-jr/just-the-two-of-us-midi/)，`just-the-two-of-us-demo.mid` 的 tenor sax 轨 | 萨克斯 8 小节；滑音取稳定音高，后半段提高一个八度；这段没有 Fm7 |
| 晴天 · 周杰伦 | [人人钢琴网 · Jeanie 原调简单版](https://www.everyonepiano.cn/Number-13074-1.html)，预览图第 1–2 页 | 主歌唱名短句第 13–16 小节，不移调；另配 Em7–Cmaj7–G 教学和声 |
| 遇见 · 孙燕姿 | [人人钢琴网 · lcz_0205 精修谱](https://www.everyonepiano.cn/Stave-2031-1.html)，第 1 页 | 主歌第 13–16 小节，旋律从 A♭ 大调升 4 半音至 C 大调；另配 Fmaj7–G–Em7–Am，保留切分和延音 |
| 爱爱爱 · 方大同 | [人人钢琴网 · 五线谱](https://www.everyonepiano.cn/Stave-8992-1.html)，第 1 页 | 主歌第 10–13 小节；按源谱的和弦标记简化，省略倚音及内声部；88 BPM 是练习速度 |

中文歌曲来自公开曲谱预览，逐小节人工核对右手旋律声部，转录保存在 `scripts/score-excerpts.cjs`。原图保留署名与水印；来源数据记录每页 SHA-256、小节范围、逐音原音名与位置、移调、合并的延音段及转录文件校验值。没有把纸谱转录声称为 MIDI 提取。《晴天》《遇见》的七和弦伴奏为本应用的教学配法，详情在每首练习的“旋律来源与简化说明”中。

MIDI 来源文件位于 `assets/reference`。每个节选记录 SHA-256、PPQ、轨号、起止 tick 与逐音源数据，说明实际移调、八度和装饰音处理。当前页面仅呈现短节选；这些 MIDI 节选是编配的钢琴练习，不是原曲录音，也不声称与原录音逐音一致。MIDIdb 允许下载 Demo；公开 MIDI 页的下载入口不等于公开发行授权。本项目保持本机学习用途。

`imagine-demo.mid` 与 `dreams-demo.mid` 作为旧伴奏来源存档保留；它们没有独立人声旋律，不再充当当前主旋律。旧 Imagine 16 小节原创展开及独立播放器已被共享主歌练习替换。

重新生成可核对的节选：

```bash
npm run build:studies
```

直接进入：[Imagine](http://127.0.0.1:4173/#imagine-study)、[Wonderwall](http://127.0.0.1:4173/#wonderwall-study)、[Dreams](http://127.0.0.1:4173/#dreams-study)、[Just the Two of Us](http://127.0.0.1:4173/#just-two-study)。

新增中文短练习：[晴天](http://127.0.0.1:4173/#qingtian-study)、[遇见](http://127.0.0.1:4173/#yujian-study)、[爱爱爱](http://127.0.0.1:4173/#aiaiai-study)。
