(function(root){
  "use strict";
  const node=typeof module!=="undefined"&&module.exports;
  const data=node?require("./just-two-data.js"):root.JustTwoData;
  const factory=node?require("./practice-model.js"):root.PracticeModel;
  const voicings = {
    Dbmaj7:{label:"D♭maj7",notes:[49,53,56,60],names:["D♭","F","A♭","C"],kind:"major-seventh",root:"D",alter:-1},
    C7:{label:"C7",notes:[48,52,55,58],names:["C","E","G","B♭"],kind:"dominant",root:"C"},
    Bmaj7:{label:"Bmaj7",notes:[47,51,54,58],names:["B","D♯","F♯","A♯"],kind:"major-seventh",root:"B"},
    Bb7:{label:"B♭7",notes:[46,50,53,56],names:["B♭","D","F","A♭"],kind:"dominant",root:"B",alter:-1},
    Amaj7:{label:"Amaj7",notes:[45,49,52,56],names:["A","C♯","E","G♯"],kind:"major-seventh",root:"A"},
    Ab7:{label:"A♭7",notes:[44,48,51,54],names:["A♭","C","E♭","G♭"],kind:"dominant",root:"A",alter:-1},
    Db:{label:"D♭",notes:[49,53,56],names:["D♭","F","A♭"],kind:"major",root:"D",alter:-1},
    "Ab7/Gb":{label:"A♭7/G♭",notes:[42,44,51],names:["G♭","A♭","E♭"],kind:"dominant",root:"A",alter:-1,bass:"G",bassAlter:-1,omitted:"3"}
  };
  const cycle = [["Dbmaj7",0,8],["C7",8,8],["Bmaj7",16,8],["Bb7",24,8],["Amaj7",32,8],["Ab7",40,8],["Db",48,6],["Ab7/Gb",54,10]];
  const harmony = [0,64].flatMap(offset => cycle.map(([chord,start,duration],i)=>({id:`harmony-${offset/64}-${i}`,chord,start:offset+start,duration,notes:voicings[chord].notes})));
  const study=factory.create({
    id:"just-two",song:"Just the Two of Us",defaultLesson:"C7",sectionLabel:"萨克斯段",data,voicings,harmony,
    description:"把萨克斯段的旋律放到右手，左手用简化和弦承托。先听旋律，再分手练，最后合起来。",
    sourceLabel:"MIDIdb 免费 Demo",
    simplification:"旋律取自 MIDIdb 免费 Demo 的萨克斯段，不是人声副歌或原曲录音。保留旋律走向与切分节奏，省略细小装饰音，节奏整理到十六分音符；萨克斯滑音取稳定音高，后半段统一到右手音区。左手用相同和声的紧凑排列。第 4、8 小节末的 A♭7/G♭ 省略三音 C。",
    tuning:"原调 · 萨克斯段节选",
    sourceNotice:"来源页注明允许下载 Demo；此节选保留在本机学习原型中。"
  });
  if(node)module.exports=study;else root.JustTwoStudy=study;
})(typeof globalThis!=="undefined"?globalThis:this);
