(function (root) {
  "use strict";
  // Self-contained concept demonstrations, not song excerpts or melody transcriptions.
  const sound = (label, notes, names, caption) => ({ label, notes, names: names.split(" "), caption });
  const choice = (prompt, options, answer, explanation, hint) => ({ type: "choice", prompt, options, answer, explanation, hint });
  const keys = (prompt, pool, answer, explanation, hint) => ({ type: "notes", prompt, pool, answer, explanation, hint });
  const C = sound("C", [60,64,67], "C E G", "C、E、G 一起响：C 大三和弦。");
  const Cm = sound("Cm", [60,63,67], "C E♭ G", "保留 C 和 G，只把 E 降低半音到 E♭。");
  const F = sound("F", [53,57,60], "F A C", "F 大三和弦：F、A、C。");
  const G = sound("G", [55,59,62], "G B D", "G 大三和弦：G、B、D。");
  const Am = sound("Am", [57,60,64], "A C E", "Am 小三和弦：A、C、E。");
  const lessons = [
    {
      id: "notes", stage: "打好地基", title: "琴键也有名字", subtitle: "先认识 C，不用先会五线谱", minutes: 4,
      goal: "认出音名、升降号和八度。", anchor: "C D E F G A B → 又一个 C",
      paragraphs: ["琴键从左往右，声音越来越高。白键的名字按 C、D、E、F、G、A、B 循环。先找两个一组的黑键：它们左侧紧挨着的白键就是 C。", "右边下一个 C 比前一个 C 高一个八度：名字相同，音高不同。本课常用的 C4 是中央 C；数字 4 表示音区，不是要弹四次。", "走到紧挨着的下一个琴键，黑键白键都算，就是半音。♯ 读作“升”，把音升高半音；♭ 读作“降”，把音降低半音。例如 C♯ 和 D♭ 在这架钢琴上是同一个键，但名字表达的乐理关系不同。"],
      takeaway: "C 是音名；单独写在和弦谱上的 C，通常表示 C 大三和弦。要结合上下文读。",
      demos: [sound("低一些的 C", [60], "C", "这是中央 C（C4），谱上位于下加一线。"), sound("高一些的 C", [72], "C", "这是 C5，比 C4 高一个八度，谱上的位置也升高了。"), sound("C♯ / D♭", [61], "C♯", "这是 C 和 D 之间的黑键。此处写作 C♯，符头仍在 C 的位置，前面多一个升号。"), {...sound("白键排成一列", [60,62,64,65,67,69,71,72], "C D E F G A B C", "从两个黑键左边的中央 C 出发，依次向右找白键；看谱上符头也一步步升高。"), sequential:true},sound("两个 C 对照",[60,72],"C C","下面带加线的是中央 C，上面的 C 高一个八度；对应键盘左右两个 C。")],
      listen: "分别听两个 C，再点击键盘上的相邻琴键，感受高低变化。",
      questions: [choice("从 C 往右，下一颗白键叫什么？", ["D", "B", "C♯"], 0, "白键依次是 C、D、E。C♯ 是中间的黑键。", "再读一遍 C D E F G A B。"), choice("C4 和 C5 的关系是？", ["完全相同的音高", "同名，C5 高一个八度", "C5 要弹五次"], 1, "字母表示音名，后面的数字区分音区。", "看文字里的“右边下一个 C”。")]
    },
    {
      id: "intervals", stage: "打好地基", title: "音与音，相隔多远", subtitle: "半音、全音与三度", minutes: 5,
      goal: "会数半音，理解大三度和小三度。", anchor: "大三度 = 4 个半音 · 小三度 = 3 个半音",
      paragraphs: ["在钢琴上，走到紧挨着的下一个键（包括黑键），就是一个半音。走两次是一个全音。E 到 F、B 到 C 中间没有黑键，所以也是半音。", "“几度”先数字母名字，起点也算：C–D–E 是三个名字，所以 C 到 E 是三度。度数不是走了几颗琴键，三度也不等于三个半音。", "再数实际走了多少半音：C→C♯→D→D♯→E 共四步，是大三度。C 到 E♭ 共三步，是小三度。和弦里的“大、小”很快就会用到这个区别。"],
      takeaway: "数半音不把起点算一步；数度数时，起点的字母要算进去。",
      demos: [sound("半音 · E–F", [64,65], "E F", "两个紧邻的白键也可以只相隔半音。"), sound("大三度 · C–E", [60,64], "C E", "C 到 E，四个半音。"), sound("小三度 · C–E♭", [60,63], "C E♭", "只降低上面的音，距离缩短为三个半音。")],
      listen: "选择一组音，先逐音听，再一起听。比较 C–E 与 C–E♭。",
      questions: [choice("E 到 F 中间没有黑键，它们相隔？", ["全音", "半音", "大三度"], 1, "半音看的是相邻琴键，不是黑键还是白键。", "从 E 到 F 只走到紧挨着的下一个键。"), choice("C 到 E 是大三度，一共几步半音？", ["3 步", "4 步", "5 步"], 1, "C→C♯→D→D♯→E，一共走四步。", "从 C 出发，数每次移动，不数起点。")]
    },
    {
      id: "scale", stage: "打好地基", title: "给音排队：音阶与调", subtitle: "为什么这里总用 C 大调", minutes: 5,
      goal: "把 C 大调的音名与 1–7 对上。", anchor: "C D E F G A B = 1 2 3 4 5 6 7",
      paragraphs: ["音阶是一组按高低排列的音。C 大调音阶用 C、D、E、F、G、A、B，再到高一个八度的 C；在钢琴上恰好都是白键。把它们依次编号，就是音阶级数 1–7。", "大调音阶的间距是：全、全、半、全、全、全、半。从 D 开始也保持这个距离，会得到 D、E、F♯、G、A、B、C♯。因此，不是所有大调都只用白键。", "“调”还包含一个听起来像落脚点的中心。C 大调以 C 为主音；A 自然小调虽然也使用这些白键，却以 A 为中心。只看用了哪些音，不能保证判断出调。"],
      takeaway: "级数是相对位置：C 大调的 1 是 C，D 大调的 1 是 D。这里先用 C 大调减少认键负担。",
      demos: [{...sound("C 大调音阶", [60,62,64,65,67,69,71,72], "C D E F G A B C", "听音阶时用“逐音听”，从 C 出发回到高音 C。"), sequential: true}, {...sound("D 大调音阶", [62,64,66,67,69,71,73,74], "D E F♯ G A B C♯ D", "同一种间距移到 D，就需要 F♯ 和 C♯。"), sequential: true}],
      listen: "逐音听两条音阶：起点不同，但音之间的排列规律相同。",
      questions: [choice("C 大调中的第 6 级音是？", ["F", "A", "G"], 1, "C=1、D=2、E=3、F=4、G=5、A=6。", "从 C 开始，把起点算作 1。"), choice("把大调音阶从 C 移到 D，应该怎样做？", ["从 D 开始，只弹白键", "保持全全半全全全半的间距", "每个音都变成黑键"], 1, "移调保留音之间的关系，所以 D 大调含 F♯ 和 C♯。", "大调是固定的间距规律。")]
    },
    {
      id: "triads", stage: "搭出和弦", title: "三个音，搭出一个和弦", subtitle: "C 与 Cm 只差一个音", minutes: 6,
      goal: "亲手组成大三和弦和小三和弦。", anchor: "C = C E G · Cm = C E♭ G",
      paragraphs: ["和弦是多个音构成的和声组合，伴奏常把它们一起弹，也可以拆开弹。最常用的基础结构之一是三和弦：根音、三音和五音。根音是给和弦命名的基础，C 和弦的根音就是 C。", "以 C 为根音，C–E 相隔大三度，C–G 相隔纯五度（七个半音），得到 C 大三和弦。代号直接写 C，公式是 1–3–5。", "把三音 E 降低半音到 E♭，其余音不动，就得到 Cm。m 是 minor（小）的缩写，公式为 1–♭3–5。公式中的数字以根音的大调音阶为参照，♭3 就是把第三级降低半音。"],
      takeaway: "大、小来自音程结构。明亮或忧郁可以帮助记忆，但情绪也受节奏、音色和上下文影响。",
      demos: [C,Cm], listen: "轮流听 C 和 Cm，留意只变动了哪颗琴键。",
      questions: [choice("C 变成 Cm，需要改变哪个音？", ["C 改成 D", "E 改成 E♭", "G 改成 A"], 1, "大小三和弦的这次对比只改变三音，根音 C 和五音 G 保留。", "看两组音里不一样的那个字母。"), keys("从下面的琴键中选出 Cm 的三个组成音。", [60,62,63,64,65,67], [60,63,67], "Cm = C、E♭、G。降低的是三音。", "先保留 C 和 G，再选择比 E 低半音的 E♭。")]
    },
    {
      id: "diatonic", stage: "搭出和弦", title: "一套调内和弦", subtitle: "读懂 I、ii、iii、IV、V、vi", minutes: 6,
      goal: "区分和弦级数和和弦构成公式。", anchor: "I C · ii Dm · iii Em · IV F · V G · vi Am · vii° Bdim",
      paragraphs: ["只使用 C 大调的音，在每个音上隔一个取一个，就能得到一套调内三和弦。例如从 D 出发取 D、F、A，是 Dm；从 A 出发取 A、C、E，是 Am。", "用罗马数字表示这些和弦在调里的位置：I、ii、iii、IV、V、vi、vii°。这里大写代表大三和弦，小写代表小三和弦，° 代表减三和弦。Bdim 是 B、D、F，先认识名字，后面再学结构。", "I、IV、V、vi 是很多流行伴奏的起点，ii 和 iii 也常出现。I 往往带来安定感，IV 和 ii 帮助展开，V 常带来回到 I 的期待。它们的作用会随实际音乐变化，不是固定情绪标签。"],
      takeaway: "罗马数字 IV 表示“调里的第四级和弦”；公式 1–3–5 表示“这个和弦内部的构成”。两种数字回答不同问题。",
      demos: [C, sound("Dm · ii", [62,65,69], "D F A", "用 C 大调的音，从 D 隔一个取一个：D、F、A。"), F,G,Am], listen: "依次点 I、IV、V 对应的 C、F、G，再听 Am。先把代号与声音建立联系。",
      questions: [choice("在 C 大调中，vi 对应哪个和弦？", ["F", "Am", "A"], 1, "第六级根音是 A，调内构成 A、C、E，是 Am。", "小写 vi 提示它是小三和弦。"), choice("在 C 大调里，F 的和弦级数与内部公式是？", ["IV；1–3–5", "I；4–6–1", "iv；1–♭3–5"], 0, "F 是第四级大三和弦；相对于自己的根音 F，其组成音仍是 1–3–5。", "先找 F 在调里的位置，再看 F 是大三和弦还是小三和弦。")]
    },
    {
      id: "progressions", stage: "搭出和弦", title: "把和弦连成一句话", subtitle: "和弦进行与“回家”的感觉", minutes: 5,
      goal: "读懂常见流行和弦进行，并听出顺序的作用。", anchor: "I–V–vi–IV = C–G–Am–F（C 大调）",
      paragraphs: ["和弦按顺序出现，就形成和弦进行。先让每个和弦停留一样长，容易听清换和弦的感觉。I–V–vi–IV 在 C 大调就是 C–G–Am–F。", "同样四个和弦，换成 vi–IV–I–V，即 Am–F–C–G，起点和落点就变了。另一个常见进行是 I–vi–IV–V：C–Am–F–G。和弦顺序相同也不等于同一首歌，旋律与节奏同样关键。", "ii–V–I 在 C 大调是 Dm–G–C，常用于推动并落回主和弦。V→I 有典型的收束感，但流行循环也经常不急着解决，不能要求每一轮都回到 I。"],
      takeaway: "记住级数关系，换调时就能搬到新位置。先会读、会听，再追求熟练换和弦。",
      demos: [C,G,Am,F], sequences: [{ label: "I–V–vi–IV", indices: [0,1,2,3] },{ label: "vi–IV–I–V", indices: [2,3,0,1] }], listen: "分别播放两种顺序，观察橙色播放标记。这里是等时值和声示范，没有歌曲旋律。",
      questions: [choice("在 C 大调，I–V–vi–IV 应读作？", ["C–G–Am–F", "C–F–G–Am", "Am–F–C–G"], 0, "逐个对应：I=C、V=G、vi=Am、IV=F。", "先找到 V：C 大调的第五级和弦是 G。"), choice("Dm–G–C 在 C 大调是哪种进行？", ["I–IV–V", "ii–V–I", "vi–IV–I"], 1, "Dm 是 ii，G 是 V，C 是 I。", "从根音 D、G、C 在音阶里的位置来判断。")]
    },
    {
      id: "sevenths", stage: "丰富色彩", title: "加一个音：七和弦", subtitle: "分清 maj7、7 和 m7", minutes: 7,
      goal: "会区分三种常用七和弦的三音和七音。", anchor: "Cmaj7：B · C7：B♭ · Cm7：E♭ + B♭",
      paragraphs: ["在三和弦上加入与根音相隔七度的音，就得到七和弦。C 到 B 是大七度，十一个半音；C 到 B♭ 是小七度，十个半音。", "Cmaj7 = C、E、G、B，是大三和弦加大七度。C7 = C、E、G、B♭，是大三和弦加小七度，叫属七和弦。Cm7 = C、E♭、G、B♭，是小三和弦加小七度。", "读符号时分别看三音和七音：单写 7 通常是小七度，maj7 指定大七度，m 指定小三和弦。C7 常推动到 F，G7 常推动到 C；“属七”是结构名称，实际功能要看它出现在哪个调和上下文。"],
      takeaway: "不要把 C7 理解为 Cmaj7 的简写，也不要把七和弦理解为有七个音。",
      demos: [sound("Cmaj7", [60,64,67,71], "C E G B", "大三和弦，加 B。"), sound("C7", [60,64,67,70], "C E G B♭", "只把 B 降半音到 B♭。"), sound("Cm7", [60,63,67,70], "C E♭ G B♭", "在 C7 基础上，再把 E 降到 E♭。")], listen: "按顺序对比三种七和弦：每次只变一个音。", library: "Cmaj7",
      questions: [choice("Cmaj7 和 C7 的差别在哪里？", ["根音不同", "Cmaj7 用 B，C7 用 B♭", "C7 有七个音"], 1, "根音、三音、五音相同，变化发生在七音。", "maj7 指大七度，单写 7 通常指小七度。"), keys("选出 C7 的四个组成音。", [60,63,64,67,70,71], [60,64,67,70], "C7 = C、E、G、B♭，保留大三度 E。", "用 C 大三和弦，再加小七度 B♭。")]
    },
    {
      id: "sus", stage: "丰富色彩", title: "把三音暂时换掉", subtitle: "sus2 与 sus4", minutes: 5,
      goal: "明白 sus 是替换三音。", anchor: "Csus2 = C D G · Csus4 = C F G",
      paragraphs: ["sus 是 suspended 的缩写，中文常叫挂留。在这里，把 C 和弦中的三音 E 拿走，换成 D（第二级）就得到 Csus2；换成 F（第四级）就得到 Csus4。", "公式分别是 1–2–5 与 1–4–5。它们没有决定大小性质的三音，因此不能简单归为大三和弦或小三和弦。", "Csus4→C 中，F 回到 E，会产生从悬着到落定的变化。现代编曲也会让 sus 一直保持，不一定必须解决。遇到 A7sus4 时，则是在属七结构上用四音替换三音，七音仍保留。"],
      takeaway: "sus 的动作是“换掉三音”；下一课的 add 则是“保留原结构再增加”。",
      demos: [sound("Csus2", [60,62,67], "C D G", "E 被 D 替换了。"), sound("Csus4", [60,65,67], "C F G", "E 被 F 替换了。"), C], sequences: [{label:"Csus4 → C",indices:[1,2]}], listen: "先对比 Csus2 和 Csus4，再听 Csus4 回到 C。", library: "Dsus4",
      questions: [choice("从 C 变成 Csus4，应该怎样做？", ["保留 E，加 F", "把 E 换成 F", "把 G 换成 F"], 1, "sus4 用四音替代三音，根音和五音保留。", "找出 C–E–G 中的三音。"), keys("选出 Csus2 的三个组成音。", [60,62,64,65,67], [60,62,67], "Csus2 = C、D、G，没有三音 E。", "保留 C 和 G，三音换成第二级 D。")]
    },
    {
      id: "add9", stage: "丰富色彩", title: "多一点空气：add9", subtitle: "区别于 sus2，也区别于 9", minutes: 5,
      goal: "读懂二音、九音和七音之间的区别。", anchor: "Cadd9 = C E G D · C9 还包含 B♭",
      paragraphs: ["从 C 向上数到高音 C 是第八个位置，再上一个 D 就是第九个。九音与二音有相同的音名关系，但九度比二度多一个八度。", "Cadd9 是 C 大三和弦加上 D，公式 1–3–5–9。E 仍然在，所以它与没有 E 的 Csus2 不同。实际配音可以改变音的排列，不要求 D 永远是最高音。", "C9 则通常表示属九和弦：C、E、G、B♭、D，在属七上加九音。实际演奏有时省略五音，但 add9 与 9 对七音的约定仍不同。"],
      takeaway: "看见 add，先保留原来的三和弦；看见单独的 9，要想到它通常还包含小七度。",
      demos: [sound("Csus2",[60,62,67],"C D G","没有 E。"),sound("Cadd9",[60,64,67,74],"C E G D","保留 E，再加入高处的 D。"),sound("C9",[60,64,67,70,74],"C E G B♭ D","除了九音 D，还有七音 B♭。")], listen: "先逐音听，找出 E 与 B♭ 是否出现，再一起听。", library: "Cadd9",
      questions: [choice("Cadd9 与 Csus2 的关键区别是？", ["Cadd9 保留三音 E", "Csus2 有 B♭", "它们完全一样"], 0, "二音与九音同属 D，但 add9 保留三音，sus2 替换三音。", "比较两者有没有 E。"), keys("选出这里 Cadd9 的四个组成音。", [60,64,67,70,74], [60,64,67,74], "Cadd9 = C、E、G、D，不自动加入 B♭。", "先选 C–E–G，再加高音 D。")]
    },
    {
      id: "bass", stage: "听懂走向", title: "最低音，换个位置", subtitle: "转位与斜线和弦", minutes: 5,
      goal: "读懂 C/E，区分根音和最低音。", anchor: "C/E = C 和弦，E 放在最低处",
      paragraphs: ["根音给和弦命名，最低音是当下实际发声位置最低的音。C–E–G 的根音与最低音都是 C；换成 E–G–C，根音仍是 C，但最低音变成了 E。", "斜线和弦左边写和弦，右边指定最低音。C/E 读作“C 和弦，以 E 为低音”。最低音是和弦的三音或五音时，属于转位。斜线低音也可以是和弦外的音，所以并非所有斜线和弦都是转位。", "C–G/B–Am 中，低音可以走 C–B–A，逐步下降，比每次都跳到根音更连贯。编配时也会调整其他音的位置，这叫配音；同一个和弦可以有许多不同配音。"],
      takeaway: "斜线不是让你在两个和弦里二选一，也不是分数；右侧只告诉你最低音。",
      demos: [C,sound("C/E",[52,55,60],"E G C","E 在最低处，但和弦组成音仍是 C、E、G。"),sound("G/B",[59,62,67],"B D G","G 和弦，以 B 为最低音。"),Am], sequences:[{label:"C → G/B → Am",indices:[0,2,3]}], listen: "听 C 与 C/E，再听低音按 C–B–A 下降的三组和弦。",
      questions: [choice("C/E 的根音和最低音分别是？", ["E 和 C", "C 和 E", "C 和 C"], 1, "左侧 C 指和弦，右侧 E 指实际最低音。", "根音看左边，低音看右边。"), choice("C–G/B–Am 这段的最低音走向是？", ["C–G–A", "C–B–A", "E–G–C"], 1, "G/B 的低音是 B，所以低音从 C 经过 B 走向 A。", "中间那个和弦要读斜线右边的字母。")]
    },
    {
      id: "borrowed", stage: "听懂走向", title: "从小调借一点颜色", subtitle: "F–Fm–C 与借用和弦", minutes: 6,
      goal: "听懂同主音大小调借用的基本方法。", anchor: "C 大调：IV–iv–I = F–Fm–C",
      paragraphs: ["调内和弦是常用材料，但歌曲也会用调外音。以 C 大调为例，C 自然小调是 C、D、E♭、F、G、A♭、B♭。两者主音都是 C，叫同主音大小调。", "从 C 小调借来 Fm（F、A♭、C），放在 C 大调的 F 后面，A 降到 A♭，再回到 C 和弦，会产生细腻的色彩变化。这是 IV–iv–I。", "C 大调中还会借用 E♭（♭III）、A♭（♭VI）、B♭（♭VII）。这里的 ♭ 是相对于大调音阶把根音降低半音；罗马数字大写则说明借来的是大三和弦。不用一次全背，先熟悉 F–Fm–C。"],
      takeaway: "借用一个和弦不一定就换了调；要结合整段音乐的中心判断。",
      demos:[F,sound("Fm",[53,56,60],"F A♭ C","把 F 和弦里的 A 降到 A♭，这个音来自 C 小调。"),C],sequences:[{label:"F → Fm → C",indices:[0,1,2]}],listen:"听第二个和弦进入时发生的变化，再逐音对比 F 与 Fm。",
      questions:[choice("F–Fm–C 中，F 变 Fm 改变了哪个音？",["F 变 F♯","A 变 A♭","C 变 B"],1,"根音 F 和五音 C 保留，三音 A 降半音。","大小三和弦的区别在三音。"),choice("在 C 大调里，♭VII 大三和弦是？",["B 大三和弦","B♭ 大三和弦","B♭ 小三和弦"],1,"第七级根音 B 降半音为 B♭；VII 大写表示大三和弦。","分别读降号、根音位置和大小写。")]
    },
    {
      id: "secondary", stage: "听懂走向", title: "给下一个和弦一点推力", subtitle: "E7→Am 与次属和弦", minutes: 6,
      goal: "理解次属和弦是在暂时强调一个目标。", anchor: "C 大调中：E7 → Am = V7/vi → vi",
      paragraphs:["在 C 大调里，G7 常推动到 C。如果想把另一个和弦暂时变成落点，也可以在它前面放一个属于它的属和弦。这样的和弦叫次属和弦，也常叫副属和弦。","例如目标是 Am，就在它前面放 E7：E、G♯、B、D。G♯ 不在 C 大调里，却能向上半音走到 A，增强落到 Am 的期待。C–E7–Am–F 就用到了这个方法。","同理，A7→Dm、D7→G、C7→F 都是 C 大调中常见的次属用法。V7/vi 读作“六级的属七”，斜线右侧是目标级数；它与 C/E 里用字母指定低音的写法不同。"],
      takeaway:"次属强调目标和弦；同主音借用提供另一套调式的颜色。它们都可能用到调外音，但解释角度不同。",
      demos:[sound("Em7",[52,55,59,62],"E G B D","C 大调内的 Em7 使用 G。"),sound("E7",[52,56,59,62],"E G♯ B D","把 G 升为 G♯，产生向 A 的半音倾向。"),Am],sequences:[{label:"Em7 → Am",indices:[0,2]},{label:"E7 → Am",indices:[1,2]}],listen:"对比两段，注意第二段中 G♯ 向 A 的期待。",
      questions:[choice("在 C 大调中，E7 常作为次属和弦推向？",["Am","Dm","G"],0,"E7 是 A 的属七和弦，可以推动到 Am。","看本课的目标和弦是谁。"),choice("Em7 改成 E7，哪个音发生变化？",["E→F","G→G♯","D→D♯"],1,"E–G–B–D 变成 E–G♯–B–D，小三度变大三度。","比较示范里两组组成音。")]
    },
    {
      id: "extensions", stage: "继续探索", title: "读懂更长的和弦代号", subtitle: "6、9、11、13 是什么", minutes: 6,
      goal:"把扩展音理解成在基础结构上添色。",anchor:"9 ↔ 2 · 11 ↔ 4 · 13 ↔ 6（相差一个八度）",
      paragraphs:["继续从根音往上数，9、11、13 分别对应高一个八度的 2、4、6。以 C 为根音，它们是 D、F、A。先识别三和弦与七音，再看扩展音，代号就没那么吓人。","Cmaj9 是 Cmaj7 加 D；Cm9 是 Cm7 加 D；C9 是 C7 加 D。C6 = C、E、G、A，不自动含七音；C6/9 在 C6 上加 D，这里的 6/9 是固定和弦后缀，不是斜线低音。","C13 通常建立在属七上并含十三音 A；实际配音常省五音、十一音，有时也省九音。本课听 C–E–B♭–A，明确保留根音、三音、七音与十三音。看到长代号，不意味着必须把所有可能的音都挤在一起。"],
      takeaway:"先掌握三音、七音和本次要加的色彩音。扩展音的排列和省略，是之后可以继续学习的配音课题。",
      demos:[sound("C6",[60,64,67,69],"C E G A","三和弦加六音 A，不自动包含 B♭。"),sound("Cmaj9",[60,64,67,71,74],"C E G B D","Cmaj7 再加九音 D。"),sound("C13 · 简化配音",[48,52,58,69],"C E B♭ A","省去五音、九音、十一音，突出属七与十三音。")],listen:"逐音听长代号，先找到熟悉的 C、E，再辨认新增的音。",
      questions:[choice("Cmaj9 中，七音应当是？",["B","B♭","没有七音"],0,"maj9 延续大七和弦结构，因此包含 B，再加入 D。","先拆成 Cmaj7 加九音。"),choice("C13 是否要求每次同时弹出 1、3、5、♭7、9、11、13？",["是，少一个就错","不一定，实际配音常省略部分音","13 表示弹十三遍"],1,"代号说明和声结构，配音可省略部分音；仍要保留能表达该和弦的关键音。","回想本课只用了四个音的示范。")]
    },
    {
      id:"diminished",stage:"继续探索",title:"认识紧张的连接和弦",subtitle:"减三、半减七与减七",minutes:6,
      goal:"分清 dim、m7♭5 与 dim7，完成第一轮学习。",anchor:"Bdim：B D F · Bm7♭5：加 A · Bdim7：加 A♭",
      paragraphs:["小三和弦的公式是 1–♭3–5，再把五音降低半音，就得到减三和弦 1–♭3–♭5。B–D–F 就是 Bdim，也是 C 大调中的第七级调内三和弦。","在 Bdim 上加小七度 A，得到 Bm7♭5，叫半减七，也写 Bø7。再把 A 降低半音到 A♭，得到 Bdim7，叫减七，也写 B°7。它的七音是减七度，公式 1–♭3–♭5–♭♭7。","♭♭7 表示把根音大调的第七级降低两个半音。以 B 为根音，其大七度是 A♯，小七度是 A，减七度是 A♭。减七度与大六度在十二平均律中可以同音，但音名和结构含义不同。减和弦常用于连接与制造张力，基础流行伴奏不必急着大量使用。"],
      takeaway:"复习时按“根音 → 三音 → 五音 → 七音 → 扩展或低音”拆代号，再去歌曲里验证。慢慢熟悉比一次背完更重要。",
      demos:[sound("Bdim",[59,62,65],"B D F","小三度加减五度，三个音。"),sound("Bm7♭5",[59,62,65,69],"B D F A","加入小七度 A，成为半减七。"),sound("Bdim7",[59,62,65,68],"B D F A♭","再把七音 A 降到 A♭，成为减七。")],listen:"先听三音基础，再对比最后加入的 A 与 A♭。不用凭一次试听就记住所有听感。",
      questions:[choice("Bm7♭5 与 Bdim7 的区别是？",["根音不同","七音分别是 A 与 A♭","一个有七个音"],1,"两者都以 B–D–F 为基础，七音分别为小七度和减七度。","比较示范中最后一个音。"),choice("看到陌生和弦代号，先做哪件事更有帮助？",["只凭情绪猜音","先读根音和基础结构，再看附加符号","把所有白键一起弹"],1,"先拆结构，再试听与找音，能把新代号连接到已经学过的知识。","想想 Cadd9、Cmaj9、C/E 是怎样拆开的。")]
    }
  ];
  const names = ["C","D♭","D","E♭","E","F","G♭","G","A♭","A","B♭","B"];
  function noteName(midi) { return `${names[midi % 12]}${Math.floor(midi / 12) - 1}`; }
  function cleanProgress(raw) {
    const value = raw && typeof raw === "object" ? raw : {};
    const checkpoints = {};
    for (const lesson of lessons) {
      const point = value.checkpoints?.[lesson.id];
      checkpoints[lesson.id] = Number.isInteger(point) ? Math.max(0,Math.min(3,point)) : 0;
    }
    return { version: 1, checkpoints, lastLesson: lessons.some(l => l.id === value.lastLesson) ? value.lastLesson : lessons[0].id };
  }
  function assess(question, submitted) {
    if (question.type === "choice") return { correct: Number.isInteger(submitted) && submitted === question.answer };
    const selected = new Set(Array.isArray(submitted) ? submitted : []);
    const missing = question.answer.filter(n => !selected.has(n));
    const extra = [...selected].filter(n => !question.answer.includes(n));
    return { correct: !missing.length && !extra.length, missing, extra };
  }
  const api = { lessons, noteName, cleanProgress, assess, storageKey: "chord-theory-v1" };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.ChordTheory = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
